# OCR Prompt Testing Tool

A powerful Node.js tool for testing and optimizing OCR prompts using OpenAI's GPT-4 Vision API. Perfect for extracting structured data from historical documents like marriage certificates, baptism records, and death certificates.

## 🎯 Purpose

This tool helps you:
- Test different prompt variations against a set of document images
- Compare OCR results with baseline/expected data
- Calculate accuracy scores to find the best performing prompts
- Iterate quickly to optimize your prompts for maximum accuracy

## 📁 Project Structure

```
ocr-prompt-testing-tool/
├── data/
│   ├── images/              # Your document images
│   │   ├── marriage/        # Marriage certificate images
│   │   ├── baptism/         # Baptism record images
│   │   └── death/           # Death certificate images
│   └── baselines/           # Expected/correct JSON outputs
│       ├── marriage/        # marriage_001.json, marriage_002.json, etc.
│       ├── baptism/         # baptism_001.json, baptism_002.json, etc.
│       └── death/           # death_001.json, death_002.json, etc.
├── prompts/                 # Your prompt variations
│   ├── marriage_v1.txt
│   ├── marriage_v2.txt
│   ├── baptism_v1.txt
│   └── death_v1.txt
├── results/                 # Test results (auto-generated)
│   └── [timestamp]_[prompt]_[type]_results.json
├── src/                     # Source code
│   ├── index.ts            # CLI entry point
│   ├── ocr/
│   │   └── openai.ts       # OpenAI API integration
│   ├── testing/
│   │   ├── testRunner.ts   # Test orchestration
│   │   └── comparator.ts   # JSON comparison & accuracy
│   └── utils/
│       ├── fileHandler.ts  # File operations
│       └── logger.ts       # Logging utilities
├── .env                     # Your API keys (create from .env.example)
├── .env.example            # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- OpenAI API key with GPT-4 Vision access
- Document images to test (JPG, PNG, or JPEG)

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd ocr-prompt-testing-tool
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

## 📝 Preparing Your Data

### 1. Add Your Images

Place your document images in the appropriate folders:

```bash
data/images/marriage/marriage_001.jpg
data/images/marriage/marriage_002.jpg
data/images/baptism/baptism_001.png
data/images/death/death_001.jpg
```

**Naming Convention:** Use consistent names like `documenttype_001.jpg`, `documenttype_002.jpg`, etc.

### 2. Create Baseline JSON Files

For each image, create a corresponding JSON file with the **correct/expected** data:

```bash
data/baselines/marriage/marriage_001.json
data/baselines/marriage/marriage_002.json
```

**Example baseline JSON** (`data/baselines/marriage/marriage_001.json`):
```json
{
  "document_type": "marriage",
  "groom_name": "John Michael Smith",
  "groom_age": 28,
  "bride_name": "Sarah Elizabeth Johnson",
  "bride_age": 26,
  "marriage_date": "1920-06-15",
  "marriage_location": "Manhattan, New York",
  "officiant": "Rev. Thomas Williams",
  "witness_1": "Robert Smith",
  "witness_2": "Mary Johnson"
}
```

**Important:** The basename of the image and JSON must match:
- `marriage_001.jpg` ↔ `marriage_001.json`
- `baptism_005.png` ↔ `baptism_005.json`

### 3. Create Your Prompts

Create prompt files in the `prompts/` directory. Example `prompts/marriage_v1.txt`:

```
You are an expert at extracting information from marriage certificates.

Please analyze the marriage certificate image and extract the following information in JSON format:

{
  "document_type": "marriage",
  "groom_name": "Full name of the groom",
  "groom_age": Age as number,
  "groom_occupation": "Occupation",
  "groom_residence": "Residence",
  "bride_name": "Full name of the bride",
  "bride_age": Age as number,
  "bride_occupation": "Occupation",
  "bride_residence": "Residence",
  "marriage_date": "YYYY-MM-DD",
  "marriage_location": "City, State",
  "officiant": "Name of person who performed ceremony",
  "witness_1": "First witness name",
  "witness_2": "Second witness name",
  "registration_number": "Certificate number if visible",
  "registration_date": "YYYY-MM-DD if visible"
}

Extract ONLY the information clearly visible in the document. If a field is not visible or unclear, use null.
Return ONLY valid JSON with no additional text.
```

## 🧪 Running Tests

### Basic Usage

Test a prompt against all images of a specific document type:

```bash
npm run test -- -p marriage_v1.txt -t marriage
```

### Test Options

```bash
npm run test -- -p <prompt-file> -t <document-type> [options]
```

**Required:**
- `-p, --prompt <file>` - Prompt file name (e.g., `marriage_v1.txt`)
- `-t, --type <type>` - Document type: `marriage`, `baptism`, or `death`

**Optional:**
- `-i, --images <count>` - Number of images to test (default: `all`)
- `-o, --output <dir>` - Output directory (default: `results`)

### Examples

```bash
# Test marriage_v1.txt against all marriage certificates
npm run test -- -p marriage_v1.txt -t marriage

# Test only the first 3 baptism records
npm run test -- -p baptism_v1.txt -t baptism -i 3

# Test death certificates with custom output directory
npm run test -- -p death_v1.txt -t death -o my_results
```

## 📊 Understanding Results

After running tests, you'll see output like:

```
============================================================
🚀 Starting OCR Prompt Testing
============================================================

✓ Loaded prompt from marriage_v1.txt
✓ Found 10 images, testing 10
✓ Loaded 10 baseline files

[1/10] Processing: marriage_001.jpg
  → Sending request to OpenAI API...
  ✓ Received and parsed response
  🟢 Accuracy: 95.00% | Time: 3245ms

[2/10] Processing: marriage_002.jpg
  → Sending request to OpenAI API...
  ✓ Received and parsed response
  🟡 Accuracy: 78.50% | Time: 2890ms
    - groom_age: expected "28" got "29"
    - marriage_date: expected "1920-06-15" got "1920-06-16"

============================================================
📊 TEST RESULTS SUMMARY
============================================================
Prompt:           marriage_v1.txt
Document Type:    marriage
Images Tested:    10
Overall Accuracy: 🟢 87.50%
Best Accuracy:    95.00%
Worst Accuracy:   72.30%
Avg Process Time: 3120ms
============================================================
Results saved to: 2025-10-24_11-30-45_marriage_v1_marriage_results.json
============================================================
```

### Accuracy Indicators

- 🟢 **Green (90%+)**: Excellent accuracy
- 🟡 **Yellow (70-89%)**: Good, but improvable
- 🔴 **Red (<70%)**: Needs improvement

### Results JSON File

Detailed results are saved in `results/` with full data:

```json
{
  "metadata": {
    "timestamp": "2025-10-24T11:30:45.123Z",
    "promptFile": "marriage_v1.txt",
    "documentType": "marriage",
    "totalImagesProcessed": 10
  },
  "overallAccuracy": 87.50,
  "summary": {
    "totalImages": 10,
    "successfulTests": 10,
    "averageProcessingTime": 3120,
    "bestAccuracy": 95.00,
    "worstAccuracy": 72.30
  },
  "results": [
    {
      "imageFile": "marriage_001.jpg",
      "accuracy": 95.00,
      "processingTime": 3245,
      "discrepanciesCount": 1,
      "discrepancies": [
        {
          "field": "groom_age",
          "expected": "28",
          "actual": "29",
          "type": "incorrect"
        }
      ],
      "generated": { /* full OCR result */ }
    }
  ]
}
```

## 🔄 Workflow: Finding the Best Prompt

1. **Create initial prompt** (e.g., `marriage_v1.txt`)
2. **Run test:**
   ```bash
   npm run test -- -p marriage_v1.txt -t marriage
   ```
3. **Review results** - Check accuracy and discrepancies
4. **Improve prompt** - Create `marriage_v2.txt` based on insights
5. **Test again:**
   ```bash
   npm run test -- -p marriage_v2.txt -t marriage
   ```
6. **Compare results** - Which version has better accuracy?
7. **Iterate** until you achieve desired accuracy!

## 💡 Tips for Better Prompts

1. **Be specific about format**
   - Request exact date format: `YYYY-MM-DD`
   - Specify number types vs strings
   
2. **Handle missing data**
   - Tell the model to use `null` for unclear fields
   - Don't hallucinate data
   
3. **Provide examples**
   - Show sample JSON in the prompt
   
4. **Use consistent field names**
   - Match your baseline JSON structure exactly
   
5. **Test incrementally**
   - Start with 2-3 images (`-i 3`)
   - Once prompt looks good, test all images

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode (with ts-node)
npm run dev

# Clean build files
npm run clean

# Full rebuild
npm run clean && npm run build
```

## 📋 Common Issues

### "OPENAI_API_KEY environment variable is not set"
- Make sure you created `.env` file
- Check that your API key is correctly set
- Don't wrap the key in quotes

### "No images found"
- Check that images are in correct folder: `data/images/marriage/`
- Verify file extensions are `.jpg`, `.jpeg`, or `.png`
- Make sure folders exist (not files named `marriage`)

### "No baseline found, skipping comparison"
- Create matching JSON files in `data/baselines/`
- Ensure filenames match: `marriage_001.jpg` → `marriage_001.json`

### "No valid JSON found in OpenAI response"
- Your prompt might need adjustment
- Emphasize "return ONLY valid JSON" in prompt
- Check the model is using `gpt-4o` (not text-only models)

## 📄 License

MIT

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Happy Prompt Testing! 🚀**
