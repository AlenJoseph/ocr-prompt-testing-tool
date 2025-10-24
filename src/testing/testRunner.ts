import { readFile, listFilesInDirectory, writeFile, getFileExtension } from '../utils/fileHandler';
import { processImageWithOCR } from '../ocr/openai';
import { compareResults } from './comparator';
import { logInfo, logWarning, logError, logSuccess } from '../utils/logger';
import { getSchemaForDocumentType, type DocumentType } from '../schemas';
import path from 'path';
import fs from 'fs';

interface TestConfig {
  promptFile: string;
  documentType: DocumentType;
  imageCount: string | number;
  outputDir: string;
}

interface TestResult {
  imageFile: string;
  baseline: any;
  generated: any;
  accuracy: number;
  discrepancies: any[];
  processingTime: number;
}

export class TestRunner {
  private config: TestConfig;
  private results: TestResult[] = [];
  private prompt: string = '';
  
  constructor(config: TestConfig) {
    this.config = config;
  }

  async run(): Promise<void> {
    try {
      console.log('\n' + '='.repeat(60));
      logInfo('🚀 Starting OCR Prompt Testing');
      console.log('='.repeat(60) + '\n');
      
      // Load prompt
      await this.loadPrompt();
      
      // Load images
      const images = await this.loadImages();
      
      // Load baselines
      const baselines = await this.loadBaselines();
      
      logInfo(`📸 Testing ${images.length} images with prompt: ${this.config.promptFile}`);
      logInfo(`📄 Document type: ${this.config.documentType}\n`);
      
      // Process each image
      for (let i = 0; i < images.length; i++) {
        logInfo(`[${i + 1}/${images.length}] Processing: ${images[i]}`);
        await this.processImage(images[i], baselines);
        console.log(''); // Add spacing between results
      }
      
      // Calculate overall accuracy
      const overallAccuracy = this.calculateOverallAccuracy();
      
      // Save results
      await this.saveResults(overallAccuracy);
      
    } catch (error) {
      logError(`Test runner error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private async loadPrompt(): Promise<void> {
    const promptPath = path.join(process.cwd(), 'prompts', this.config.promptFile);
    
    if (!fs.existsSync(promptPath)) {
      throw new Error(`Prompt file not found: ${promptPath}\nPlease create a prompt file in the 'prompts' directory.`);
    }
    
    this.prompt = await readFile(promptPath);
    logSuccess(`✓ Loaded prompt from ${this.config.promptFile}`);
  }

  private async loadImages(): Promise<string[]> {
    const imagesDir = path.join(process.cwd(), 'data', 'images', this.config.documentType);
    
    if (!fs.existsSync(imagesDir)) {
      throw new Error(`Images directory not found: ${imagesDir}\nPlease add images to data/images/${this.config.documentType}/`);
    }
    
    const allFiles = await listFilesInDirectory(imagesDir);
    const imageFiles = allFiles.filter(file => {
      const ext = getFileExtension(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png'].includes(ext);
    }).sort(); // Sort for consistent ordering
    
    if (imageFiles.length === 0) {
      throw new Error(`No images found in ${imagesDir}\nSupported formats: .jpg, .jpeg, .png`);
    }
    
    // Handle image count
    if (this.config.imageCount === 'all') {
      logSuccess(`✓ Found ${imageFiles.length} images`);
      return imageFiles;
    }
    
    const count = parseInt(this.config.imageCount as string);
    if (isNaN(count) || count <= 0) {
      throw new Error(`Invalid image count: ${this.config.imageCount}`);
    }
    
    const selectedImages = imageFiles.slice(0, count);
    logSuccess(`✓ Found ${imageFiles.length} images, testing ${selectedImages.length}`);
    return selectedImages;
  }

  private async loadBaselines(): Promise<Map<string, any>> {
    const baselinesDir = path.join(process.cwd(), 'data', 'baselines', this.config.documentType);
    const baselines = new Map<string, any>();
    
    if (!fs.existsSync(baselinesDir)) {
      logWarning(`⚠️  Baselines directory not found: ${baselinesDir}`);
      logWarning(`   Tests will run without accuracy comparison.`);
      return baselines;
    }
    
    const files = await listFilesInDirectory(baselinesDir);
    
    for (const file of files) {
      if (getFileExtension(file) === '.json') {
        const filePath = path.join(baselinesDir, file);
        const content = await readFile(filePath);
        const baselineName = path.parse(file).name;
        
        try {
          baselines.set(baselineName, JSON.parse(content));
        } catch (error) {
          logWarning(`Failed to parse baseline file: ${file}`);
        }
      }
    }
    
    if (baselines.size > 0) {
      logSuccess(`✓ Loaded ${baselines.size} baseline files\n`);
    } else {
      logWarning(`⚠️  No baseline files found\n`);
    }
    
    return baselines;
  }

  private async processImage(imageFile: string, baselines: Map<string, any>): Promise<void> {
    const startTime = Date.now();
    logInfo(`Processing: ${imageFile}`);
    
    try {
      const imagePath = path.join(process.cwd(), 'data', 'images', this.config.documentType, imageFile);
      
      // Get baseline for this image
      const baselineName = path.parse(imageFile).name;
      const baseline = baselines.get(baselineName);
      
      if (!baseline) {
        logWarning(`  ⚠️  No baseline found for ${imageFile}, skipping accuracy comparison`);
      }
      
      // Get the appropriate Zod schema for this document type
      const schema = getSchemaForDocumentType(this.config.documentType);
      
      // Process image with OCR using AI SDK with Zod schema validation
      const generated = await processImageWithOCR(imagePath, this.prompt, schema);
      
      const processingTime = Date.now() - startTime;
      
      // Compare with baseline if available
      let accuracy = 0;
      let discrepancies: any[] = [];
      
      if (baseline) {
        const comparisonResult = compareResults(generated, baseline);
        accuracy = comparisonResult.accuracy;
        discrepancies = comparisonResult.discrepancies;
        
        const accuracyColor = accuracy >= 90 ? '🟢' : accuracy >= 70 ? '🟡' : '🔴';
        logSuccess(`  ${accuracyColor} Accuracy: ${accuracy.toFixed(2)}% | Time: ${processingTime}ms`);
        
        if (discrepancies.length > 0 && discrepancies.length <= 3) {
          discrepancies.forEach(disc => {
            logWarning(`    - ${disc.field}: expected "${disc.expected}" got "${disc.actual}"`);
          });
        } else if (discrepancies.length > 3) {
          logWarning(`    - ${discrepancies.length} discrepancies found`);
        }
      } else {
        logSuccess(`  ✓ Processed successfully | Time: ${processingTime}ms`);
      }
      
      this.results.push({
        imageFile,
        baseline: baseline || null,
        generated,
        accuracy,
        discrepancies,
        processingTime
      });
      
    } catch (error) {
      logError(`  ✗ Failed to process ${imageFile}: ${error instanceof Error ? error.message : String(error)}`);
      // Continue with other images
    }
  }

  private calculateOverallAccuracy(): number {
    const resultsWithBaseline = this.results.filter(r => r.baseline !== null);
    
    if (resultsWithBaseline.length === 0) return 0;
    
    const totalAccuracy = resultsWithBaseline.reduce((sum, result) => sum + result.accuracy, 0);
    return totalAccuracy / resultsWithBaseline.length;
  }

  private async saveResults(overallAccuracy: number): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                      new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].substring(0, 8);
    const promptName = path.parse(this.config.promptFile).name;
    const fileName = `${timestamp}_${promptName}_${this.config.documentType}_results.json`;
    
    // Ensure results directory exists
    const resultsDir = path.join(process.cwd(), this.config.outputDir);
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const outputPath = path.join(resultsDir, fileName);
    
    const resultsWithBaseline = this.results.filter(r => r.baseline !== null);
    const avgProcessingTime = this.results.length > 0 
      ? this.results.reduce((sum, r) => sum + r.processingTime, 0) / this.results.length 
      : 0;
    
    const output = {
      metadata: {
        timestamp: new Date().toISOString(),
        promptFile: this.config.promptFile,
        documentType: this.config.documentType,
        totalImagesProcessed: this.results.length,
        imagesWithBaselines: resultsWithBaseline.length
      },
      overallAccuracy: resultsWithBaseline.length > 0 ? parseFloat(overallAccuracy.toFixed(2)) : null,
      summary: {
        totalImages: this.results.length,
        successfulTests: this.results.length,
        averageProcessingTime: Math.round(avgProcessingTime),
        bestAccuracy: resultsWithBaseline.length > 0 ? Math.max(...resultsWithBaseline.map(r => r.accuracy)) : null,
        worstAccuracy: resultsWithBaseline.length > 0 ? Math.min(...resultsWithBaseline.map(r => r.accuracy)) : null
      },
      results: this.results.map(r => ({
        imageFile: r.imageFile,
        accuracy: r.accuracy || null,
        processingTime: r.processingTime,
        discrepanciesCount: r.discrepancies.length,
        discrepancies: r.discrepancies,
        generated: r.generated
      }))
    };
    
    await writeFile(outputPath, JSON.stringify(output, null, 2));
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    logSuccess('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Prompt:           ${this.config.promptFile}`);
    console.log(`Document Type:    ${this.config.documentType}`);
    console.log(`Images Tested:    ${this.results.length}`);
    
    if (resultsWithBaseline.length > 0) {
      const accuracyEmoji = overallAccuracy >= 90 ? '🟢' : overallAccuracy >= 70 ? '🟡' : '🔴';
      console.log(`Overall Accuracy: ${accuracyEmoji} ${overallAccuracy.toFixed(2)}%`);
      console.log(`Best Accuracy:    ${output.summary.bestAccuracy?.toFixed(2)}%`);
      console.log(`Worst Accuracy:   ${output.summary.worstAccuracy?.toFixed(2)}%`);
    } else {
      logWarning('Overall Accuracy: N/A (no baselines available)');
    }
    
    console.log(`Avg Process Time: ${Math.round(avgProcessingTime)}ms`);
    console.log('='.repeat(60));
    logSuccess(`Results saved to: ${fileName}`);
    console.log('='.repeat(60) + '\n');
  }
}