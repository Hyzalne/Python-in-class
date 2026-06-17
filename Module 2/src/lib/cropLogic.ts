import { GoogleGenAI } from "@google/genai";
import { NumericCropInput, PredictionResult, FinalResult } from '../types';
import { CROP_RANGES } from '../constants';

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function getCropImage(cropName: string): Promise<string> {
  try {
    // Using gemini-2.5-flash-image for high-quality AI-generated images
    // This model is more likely to have permissions with the default API key
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `realistic photo of a ${cropName} plant in a field, high detail, natural lighting, professional agriculture photography`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    // Find the image part in the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error('No image data returned from Gemini');
  } catch (error) {
    console.error(`Error generating image for ${cropName}:`, error);
    // Fallback to pollinations if Gemini fails
    const seed = Math.abs(cropName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    const prompt = encodeURIComponent(`high quality professional agriculture photography of ${cropName} plant, field, 4k`);
    return `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=768&nologo=true&seed=${seed}&model=flux`;
  }
}

export async function predictCrop(input: NumericCropInput): Promise<FinalResult> {
  const results: PredictionResult[] = [];

  // Sophisticated weights based on agricultural priority
  const config = {
    N: { weight: 2.5, buffer: 20 },
    P: { weight: 2.0, buffer: 20 },
    K: { weight: 2.0, buffer: 20 },
    rainfall: { weight: 3.5, buffer: 50 },
    ph: { weight: 2.5, buffer: 0.5 },
    temperature: { weight: 1.5, buffer: 5 },
    humidity: { weight: 1.0, buffer: 10 }
  };

  const totalPossibleScore = Object.values(config).reduce((acc, curr) => acc + curr.weight, 0);

  for (const range of CROP_RANGES) {
    let totalScore = 0;

    const calculateParamScore = (val: number, min: number, max: number, paramConfig: { weight: number, buffer: number }) => {
      // Full score if within optimal range
      if (val >= min && val <= max) {
        return paramConfig.weight;
      }
      
      // Nuanced penalty for out-of-range values
      const distance = val < min ? min - val : val - max;
      
      // Use a non-linear decay (power of 1.5) so small deviations are penalized less
      const penaltyFactor = Math.pow(Math.max(0, 1 - (distance / paramConfig.buffer)), 1.5);
      
      return paramConfig.weight * penaltyFactor;
    };
    
    totalScore += calculateParamScore(input.N, range.N_min, range.N_max, config.N);
    totalScore += calculateParamScore(input.P, range.P_min, range.P_max, config.P);
    totalScore += calculateParamScore(input.K, range.K_min, range.K_max, config.K);
    totalScore += calculateParamScore(input.rainfall, range.rain_min, range.rain_max, config.rainfall);
    totalScore += calculateParamScore(input.ph, range.ph_min, range.ph_max, config.ph);
    totalScore += calculateParamScore(input.temperature, range.temp_min, range.temp_max, config.temperature);
    totalScore += calculateParamScore(input.humidity, range.humidity_min, range.humidity_max, config.humidity);
    
    const accuracy = Math.round((totalScore / totalPossibleScore) * 100 * 10) / 10;
    
    results.push({
      crop: range.crop,
      score: Math.round(totalScore * 100) / 100,
      accuracy,
      image: "", 
      details: range.details
    });
  }

  // Sort by accuracy descending
  const sorted = results.sort((a, b) => b.accuracy - a.accuracy);

  const top_3_candidates = sorted.slice(0, 3);
  
  // Generate images only for the top 3 results
  const top_3 = await Promise.all(
    top_3_candidates.map(async (item) => ({
      ...item,
      image: await getCropImage(item.crop)
    }))
  );
  
  const final = top_3[0];
  const is_low_conf = final.accuracy < 35; // Adjusted threshold for the new scoring system

  return {
    final,
    top_3,
    is_low_conf
  };
}
