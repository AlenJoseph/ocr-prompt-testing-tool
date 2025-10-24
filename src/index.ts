import { Command } from 'commander';
import * as dotenv from 'dotenv';
import { TestRunner } from './testing/testRunner';
import { logInfo, logError, logSuccess } from './utils/logger';

dotenv.config();

const program = new Command();

program
  .version('1.0.0')
  .description('OCR Prompt Testing Tool - Test and compare OCR prompts for accuracy');

program
  .command('test')
  .description('Run OCR tests with specified prompt and document type')
  .requiredOption('-p, --prompt <file>', 'Prompt file to use (e.g., marriage_v1.txt)')
  .requiredOption('-t, --type <type>', 'Document type: marriage, baptism, or death')
  .option('-i, --images <count>', 'Number of images to test (default: all)', 'all')
  .option('-o, --output <dir>', 'Output directory for results', 'results')
  .action(async (options) => {
    try {
      // Validate document type
      if (!['marriage', 'baptism', 'death'].includes(options.type)) {
        throw new Error('Document type must be one of: marriage, baptism, death');
      }

      logInfo(`Starting OCR test with prompt: ${options.prompt}, type: ${options.type}`);
      
      const testRunner = new TestRunner({
        promptFile: options.prompt,
        documentType: options.type,
        imageCount: options.images,
        outputDir: options.output
      });
      
      await testRunner.run();
      logSuccess('✅ Tests completed successfully!');
      
    } catch (error) {
      logError(`Error running tests: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

program
  .command('compare')
  .description('Compare results from different test runs')
  .requiredOption('-r, --results <files...>', 'Result files to compare')
  .action((options) => {
    logInfo('Comparing results...');
    console.log('\n📊 Results to compare:', options.results);
    console.log('\n⚠️  Comparison feature coming soon!');
  });

program.parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}