import Anthropic from '@anthropic-ai/sdk';
import { contentIdeas } from './contentIdeas';
import { imagePrompt } from './imagePrompt';
import { fbPrompt, instaPrompt } from './platformPrompt';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

function sanitizeAndParseJSON(text, context = '') {
  try {
    // First, try direct parsing in case the response is already clean JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      // If direct parsing fails, proceed with sanitization
    }

    // Remove any potential control characters and escape sequences
    let sanitized = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
                       .replace(/\\[^"\/bfnrtu]/g, '');
    
    // Find the first { and last } to extract just the JSON part
    const start = sanitized.indexOf('{');
    const end = sanitized.lastIndexOf('}') + 1;
    
    if (start === -1 || end === 0) {
      throw new Error('No JSON object found in response');
    }
    
    // Extract just the JSON part
    sanitized = sanitized.slice(start, end);

    // Additional cleanup for common Claude formatting issues
    sanitized = sanitized
      .replace(/```json/g, '') // Remove markdown code blocks
      .replace(/```/g, '')     // Remove markdown code blocks
      .replace(/\n/g, ' ')     // Remove newlines
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();

    try {
      return JSON.parse(sanitized);
    } catch (error) {
      console.error('Failed to parse sanitized JSON:', {
        context,
        original: text,
        sanitized,
        error: error.message
      });
      throw new Error(`Invalid JSON structure after sanitization: ${error.message}`);
    }
  } catch (error) {
    console.error('JSON Processing Error:', {
      context,
      text,
      error: error.message
    });
    // Return a safe fallback structure based on context
    if (context === 'platform') {
      return { post: "Failed to generate post content" };
    } else if (context === 'image') {
      return { imagePrompt: "Failed to generate image prompt" };
    } else if (context === 'ideas') {
      return { ideas: [] };
    }
    throw error;
  }
}

async function generateBaseIdeas({ description, startDate, endDate }) {
  const prompt = contentIdeas(description, startDate, endDate);
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      messages: [{ 
        role: 'user', 
        content: prompt + "\n\nIMPORTANT: Respond ONLY with the JSON object, no additional text or formatting." 
      }]
    });

    return sanitizeAndParseJSON(message.content[0].text, 'ideas');
  } catch (error) {
    console.error('Error generating base ideas:', error);
    return { ideas: [] };
  }
}

async function generatePlatformPost(idea, platform) {
  let prompt;
  if (platform === 'facebook') {
    prompt = fbPrompt(idea);
  } else if (platform === 'instagram') {
    prompt = instaPrompt(idea);
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [{ 
        role: 'user', 
        content: prompt + "\n\nIMPORTANT: Respond ONLY with the JSON object, no additional text or formatting." 
      }]
    });

    return sanitizeAndParseJSON(message.content[0].text, 'platform');
  } catch (error) {
    console.error('Error generating platform post:', error);
    return { post: "Failed to generate post content" };
  }
}

async function generateImagePrompt(idea) {
  const prompt = imagePrompt(idea);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [{ 
        role: 'user', 
        content: prompt + "\n\nIMPORTANT: Respond ONLY with the JSON object, no additional text or formatting." 
      }]
    });

    return sanitizeAndParseJSON(message.content[0].text, 'image');
  } catch (error) {
    console.error('Error generating image prompt:', error);
    return { imagePrompt: "Failed to generate image prompt" };
  }
}

export async function generateCampaignIdeas({ description, startDate, endDate, platforms }) {
  try {
    // Step 1: Generate base ideas
    const baseIdeas = await generateBaseIdeas({ description, startDate, endDate });
    
    if (!baseIdeas.ideas || baseIdeas.ideas.length === 0) {
      throw new Error('No base ideas generated');
    }

    // Step 2: Generate platform-specific content
    const allPosts = [];
    
    for (const ideaEntry of baseIdeas.ideas) {
      // Generate one image prompt per idea
      const imagePromptData = await generateImagePrompt(ideaEntry.idea);
      
      for (const platform of platforms) {
        try {
          // Generate platform-specific post
          const platformPost = await generatePlatformPost(ideaEntry.idea, platform);
          
          allPosts.push({
            date: ideaEntry.date,
            platform: platform,
            idea: platformPost.post,
            imagePrompt: imagePromptData.imagePrompt
          });
        } catch (error) {
          console.error(`Error generating content for ${platform}:`, error);
          continue;
        }
      }
    }

    if (allPosts.length === 0) {
      throw new Error('Failed to generate any valid posts');
    }

    return {
      posts: allPosts.sort((a, b) => new Date(a.date) - new Date(b.date))
    };

  } catch (error) {
    console.error('Error generating campaign ideas:', error);
    throw error;
  }
}
