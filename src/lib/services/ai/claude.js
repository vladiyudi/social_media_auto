import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function generateCampaignIdeas({ description, startDate, endDate, platforms }) {
  try {
    const prompt = `You are a social media marketing expert. Generate creative post ideas for a social media campaign with the following details:

Description: ${description}
Start Date: ${new Date(startDate).toLocaleDateString()}
End Date: ${new Date(endDate).toLocaleDateString()}
Platforms: ${platforms.map(p => p.toLowerCase()).join(', ')}

For each day between the start and end date, generate one post idea per platform. Format your response as a JSON array with the following structure:
{
  "posts": [
    {
      "date": "YYYY-MM-DD",
      "platform": "platform_name",
      "idea": "post idea description",
      "imagePrompt": "detailed description for image generation"
    }
  ]
}

Important: Make sure to use lowercase platform names (facebook, instagram, twitter, linkedin).
Make each post idea unique and engaging, considering the specific features and audience of each platform. Include image prompts that will help generate visually appealing content.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

 

    const response = JSON.parse(message.content[0].text);
    
    // Ensure all platform names are lowercase and validate post structure
    response.posts = response.posts.map(post => {
      if (!post.idea) {
        console.error('Post missing idea:', post);
        throw new Error('Generated post is missing required idea field');
      }
      return {
        ...post,
        platform: post.platform.toLowerCase()
      };
    });

    return response;
  } catch (error) {
    console.error('Error generating campaign ideas:', error);
    throw new Error('Failed to generate campaign ideas');
  }
}
