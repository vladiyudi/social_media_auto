import { contentIdeas } from './contentPrompt';
import { fbPrompt, instaPrompt } from './platformPrompt';
import { imagePrompt } from './imagePrompt';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

function extractJSONFromText(text) {
  try {
    // Try to find JSON-like structure between curly braces
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : text;
  } catch (error) {
    console.error('Error extracting JSON:', error);
    return text;
  }
}

function sanitizeAndParseJSON(content) {
  try {
    // If content is already an object, return it
    if (typeof content === 'object' && content !== null) {
      return content;
    }

    let jsonStr = content;

    // Remove any XML-like tags (like <output>)
    jsonStr = jsonStr.replace(/<[^>]*>/g, '');

    // Remove any markdown code block syntax
    jsonStr = jsonStr.replace(/```json\s?|\s?```/g, '');

    // Extract JSON-like structure
    jsonStr = extractJSONFromText(jsonStr);

    // Remove any leading/trailing whitespace
    jsonStr = jsonStr.trim();

    // Try parsing the cleaned string
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse cleaned JSON:', e);
      console.error('Cleaned content that failed to parse:', jsonStr);

      // If parsing fails, try to fix common JSON issues
      // Replace single quotes with double quotes
      jsonStr = jsonStr.replace(/'/g, '"');
      // Fix unquoted keys
      jsonStr = jsonStr.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
      
      return JSON.parse(jsonStr);
    }
  } catch (error) {
    console.error('JSON Processing Error:', error);
    console.error('Original content:', content);
    
    // Return a safe fallback structure
    return {
      error: 'Failed to parse response',
      originalContent: content
    };
  }
}

async function generateBaseIdeas({ description, startDate, endDate, llmModel }) {
  const prompt = contentIdeas(description, startDate, endDate);
  
  try {
    if (!llmModel) {
      throw new Error('Language model not specified');
    }

    const message = await anthropic.messages.create({
      model: llmModel,
      max_tokens: 4096,
      messages: [{ 
        role: 'user', 
        content: prompt + "\n\nIMPORTANT: Respond ONLY with the JSON object, no additional text or formatting." 
      }]
    });

    const result = sanitizeAndParseJSON(message.content[0].text);
    
    // Validate the response structure
    if (!result.ideas || !Array.isArray(result.ideas)) {
      throw new Error('Invalid response structure from AI');
    }

    return result;
  } catch (error) {
    console.error('Error generating base ideas:', error);
    throw error;
  }
}

async function generatePlatformPost(idea, platform, brandLanguage, llmModel) {
  let prompt;
  if (platform === 'facebook') {
    prompt = fbPrompt(idea, brandLanguage);
  } else if (platform === 'instagram') {
    prompt = instaPrompt(idea, brandLanguage);
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  try {
    if (!llmModel) {
      throw new Error('Language model not specified');
    }

    const message = await anthropic.messages.create({
      model: llmModel,
      max_tokens: 2048,
      messages: [{ 
        role: 'user', 
        content: prompt + "\n\nIMPORTANT: Respond ONLY with the JSON object, no additional text or formatting." 
      }]
    });

    const result = sanitizeAndParseJSON(message.content[0].text);
    
    // Validate the response structure
    if (!result.post) {
      throw new Error('Invalid response structure from AI');
    }

    return result;
  } catch (error) {
    console.error('Error generating platform post:', error);
    throw error;
  }
}

async function generateImagePrompt(idea, imageStyle, llmModel) {
  const prompt = imagePrompt(idea, imageStyle);

  try {
    if (!llmModel) {
      throw new Error('Language model not specified');
    }

    const message = await anthropic.messages.create({
      model: llmModel,
      max_tokens: 2048,
      messages: [{ 
        role: 'user', 
        content: prompt + "\n\nIMPORTANT: Respond ONLY with the JSON object, no additional text or formatting." 
      }]
    });

    const result = sanitizeAndParseJSON(message.content[0].text);
    
    // Validate the response structure
    if (!result.imagePrompt) {
      throw new Error('Invalid response structure from AI');
    }

    return result;
  } catch (error) {
    console.error('Error generating image prompt:', error);
    throw error;
  }
}

export async function generateCampaignIdeas({ description, startDate, endDate, platforms, brandLanguage, imageStyle, llmModel }) {
  try {
    // Step 1: Generate base ideas
    const baseIdeas = await generateBaseIdeas({ description, startDate, endDate, llmModel });
    
    if (!baseIdeas.ideas || baseIdeas.ideas.length === 0) {
      throw new Error('No base ideas generated');
    }

    // Step 2: Generate platform-specific posts and image prompts
    const allPosts = [];
    
    for (const ideaEntry of baseIdeas.ideas) {
      // Generate one image prompt per idea
      const imagePromptData = await generateImagePrompt(ideaEntry.idea, imageStyle, llmModel);
      
      for (const platform of platforms) {
        try {
          // Generate platform-specific post
          const platformPost = await generatePlatformPost(ideaEntry.idea, platform, brandLanguage, llmModel);
          
          allPosts.push({
            date: ideaEntry.date,
            platform: platform,
            idea: platformPost.post,
            imagePrompt: imagePromptData.imagePrompt
          });
        } catch (error) {
          console.error(`Error generating post for platform ${platform}:`, error);
          // Continue with other platforms even if one fails
          allPosts.push({
            date: ideaEntry.date,
            platform: platform,
            idea: 'Failed to generate post content',
            imagePrompt: 'Failed to generate image prompt',
            error: error.message
          });
        }
      }
    }

    return { posts: allPosts };
  } catch (error) {
    console.error('Error generating campaign ideas:', error);
    throw error;
  }
}
