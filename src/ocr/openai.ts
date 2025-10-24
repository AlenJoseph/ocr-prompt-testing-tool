import axios from 'axios';
import fs from 'fs';
import { logInfo, logError } from '../utils/logger';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function processImageWithOCR(imagePath: string, prompt: string): Promise<any> {
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
    
    logInfo(`  → Sending request to OpenAI API...`);
    
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o', // Using gpt-4o for vision capabilities
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt + '\n\nIMPORTANT: Respond with ONLY valid JSON, no additional text or markdown formatting.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/${imageType};base64,${base64Image}`,
                  detail: 'high' // Use high detail for better OCR accuracy
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1 // Very low temperature for consistent, deterministic results
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout
      }
    );

    const content = response.data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    let cleanedContent = content;
    if (content.startsWith('```json')) {
      cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (content.startsWith('```')) {
      cleanedContent = content.replace(/```\n?/g, '');
    }
    
    // Extract JSON from response
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logError(`Response content: ${content}`);
      throw new Error('No valid JSON found in OpenAI response');
    }
    
    const parsedResult = JSON.parse(jsonMatch[0]);
    logInfo(`  ✓ Received and parsed response`);
    
    return parsedResult;
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      logError(`OpenAI API Error: ${errorMsg}`);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please wait and try again.');
      }
      
      throw new Error(`OpenAI API Error: ${errorMsg}`);
    }
    
    if (error instanceof SyntaxError) {
      logError('Failed to parse JSON response from OpenAI');
      throw new Error('Invalid JSON response from OpenAI. The model may not be following the prompt correctly.');
    }
    
    throw error;
  }
}