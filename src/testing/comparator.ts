/**
 * Comparator module for comparing generated OCR results with baseline JSON
 */

interface ComparisonResult {
  accuracy: number;
  discrepancies: Discrepancy[];
  totalFields: number;
  matchedFields: number;
}

interface Discrepancy {
  field: string;
  expected: any;
  actual: any;
  type: 'missing' | 'incorrect' | 'extra' | 'type_mismatch';
}

/**
 * Compare two JSON objects and calculate accuracy
 * @param generated - The generated JSON from OCR
 * @param baseline - The baseline/expected JSON
 * @returns Comparison result with accuracy and discrepancies
 */
export function compareResults(generated: any, baseline: any): ComparisonResult {
  const discrepancies: Discrepancy[] = [];
  let totalFields = 0;
  let matchedFields = 0;

  // Deep compare objects
  compareObjects(generated, baseline, '', discrepancies);

  // Count total fields in baseline
  totalFields = countFields(baseline);
  
  // Count matched fields
  matchedFields = totalFields - discrepancies.filter(d => d.type !== 'extra').length;

  // Calculate accuracy percentage
  const accuracy = totalFields > 0 ? (matchedFields / totalFields) * 100 : 0;

  return {
    accuracy: Math.max(0, Math.min(100, accuracy)), // Clamp between 0-100
    discrepancies,
    totalFields,
    matchedFields
  };
}

/**
 * Recursively compare two objects
 */
function compareObjects(
  generated: any,
  baseline: any,
  path: string,
  discrepancies: Discrepancy[]
): void {
  // Handle null/undefined cases
  if (baseline === null || baseline === undefined) {
    return;
  }

  if (generated === null || generated === undefined) {
    discrepancies.push({
      field: path || 'root',
      expected: baseline,
      actual: generated,
      type: 'missing'
    });
    return;
  }

  // If both are primitives, compare directly
  if (typeof baseline !== 'object' || typeof generated !== 'object') {
    if (!compareValues(generated, baseline)) {
      discrepancies.push({
        field: path,
        expected: baseline,
        actual: generated,
        type: 'incorrect'
      });
    }
    return;
  }

  // Handle arrays
  if (Array.isArray(baseline)) {
    if (!Array.isArray(generated)) {
      discrepancies.push({
        field: path,
        expected: baseline,
        actual: generated,
        type: 'type_mismatch'
      });
      return;
    }

    // Compare array lengths
    if (baseline.length !== generated.length) {
      discrepancies.push({
        field: `${path}.length`,
        expected: baseline.length,
        actual: generated.length,
        type: 'incorrect'
      });
    }

    // Compare each element
    const minLength = Math.min(baseline.length, generated.length);
    for (let i = 0; i < minLength; i++) {
      const newPath = `${path}[${i}]`;
      compareObjects(generated[i], baseline[i], newPath, discrepancies);
    }

    return;
  }

  // Handle objects
  const baselineKeys = Object.keys(baseline);
  const generatedKeys = Object.keys(generated);

  // Check for missing fields
  for (const key of baselineKeys) {
    const newPath = path ? `${path}.${key}` : key;
    
    if (!(key in generated)) {
      discrepancies.push({
        field: newPath,
        expected: baseline[key],
        actual: undefined,
        type: 'missing'
      });
    } else {
      compareObjects(generated[key], baseline[key], newPath, discrepancies);
    }
  }

  // Check for extra fields (not in baseline)
  for (const key of generatedKeys) {
    if (!(key in baseline)) {
      const newPath = path ? `${path}.${key}` : key;
      discrepancies.push({
        field: newPath,
        expected: undefined,
        actual: generated[key],
        type: 'extra'
      });
    }
  }
}

/**
 * Compare two primitive values with fuzzy matching for strings
 */
function compareValues(value1: any, value2: any): boolean {
  // Direct equality check
  if (value1 === value2) {
    return true;
  }

  // Type check
  if (typeof value1 !== typeof value2) {
    return false;
  }

  // String comparison with normalization
  if (typeof value1 === 'string' && typeof value2 === 'string') {
    return normalizeString(value1) === normalizeString(value2);
  }

  // Number comparison with small tolerance
  if (typeof value1 === 'number' && typeof value2 === 'number') {
    return Math.abs(value1 - value2) < 0.001;
  }

  return false;
}

/**
 * Normalize string for comparison (case-insensitive, trim whitespace, remove extra spaces)
 * Enhanced for Kerala parish records with common abbreviations and variations
 */
function normalizeString(str: string): string {
  let normalized = str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
  
  // Handle common Kerala church/location abbreviations
  normalized = normalized
    .replace(/v\.?p\.?r\.?/gi, 'vandiperiyar')
    .replace(/t\.?u\.?n\.?/gi, 'tun')
    .replace(/assumption\s+church,?\s*vandiperiyar/gi, 'assumption church vandiperiyar')
    .replace(/assumption\s+church,?\s*v\.?p\.?r\.?/gi, 'assumption church vandiperiyar')
    .replace(/\(vandiperiyar\)/gi, 'vandiperiyar')
    .replace(/\(v\.?p\.?r\.?\)/gi, 'vandiperiyar');
  
  // Remove punctuation for fuzzy matching
  normalized = normalized.replace(/[^\w\s]/g, '');
  
  return normalized;
}

/**
 * Count total number of fields in an object (recursive)
 */
function countFields(obj: any): number {
  if (obj === null || obj === undefined) {
    return 0;
  }

  if (typeof obj !== 'object') {
    return 1;
  }

  if (Array.isArray(obj)) {
    return obj.reduce((sum, item) => sum + countFields(item), 0);
  }

  return Object.values(obj).reduce((sum: number, value) => sum + countFields(value), 0);
}