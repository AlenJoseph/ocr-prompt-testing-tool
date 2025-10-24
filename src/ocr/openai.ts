import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import fs from 'fs';
import { z } from 'zod';
import { logInfo, logError } from '../utils/logger';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function processImageWithOCR(
  imagePath: string, 
  prompt: string,
  schema: z.ZodObject<any>
): Promise<any> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Please add it to your .env file.');
  }

  try {
    // Read image file and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Determine image type
    let imageType = 'jpeg';
    if (imagePath.toLowerCase().endsWith('.png')) {
      imageType = 'png';
    } else if (imagePath.toLowerCase().endsWith('.pdf')) {
      throw new Error('PDF files are not supported yet. Please convert to image format.');
    }
    
    logInfo(`  → Sending request to OpenAI API with structured output...`);
    
    // Use AI SDK's generateObject for structured output with Zod schema
    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: schema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image',
              image: `data:image/${imageType};base64,${base64Image}`
            }
          ]
        }
      ],
      temperature: 0.1, // Low temperature for consistent, deterministic results
    });

    logInfo(`  ✓ Received and validated structured response`);
    
    return object;
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file.');
      } else if (error.message.includes('rate limit')) {
        throw new Error('Rate limit exceeded. Please wait and try again.');
      }
      
      logError(`OpenAI API Error: ${error.message}`);
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    
    throw error;
  }
}