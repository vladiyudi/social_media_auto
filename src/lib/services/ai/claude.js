import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function generateCampaignIdeas({ description, startDate, endDate, platforms }) {

  console.log("START", startDate);
  console.log("END", endDate);

  try {
    // Ensure we handle dates in UTC
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Set time to start of day in UTC
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    console.log('Generating campaign ideas for dates:', {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    });

    const prompt = `You are a social media marketing expert. Generate creative post ideas for a social media campaign with the following details:

Description: ${description}
Start Date: ${start.toISOString().split('T')[0]}
End Date: ${end.toISOString().split('T')[0]}
Platforms: ${platforms.map(p => p.toLowerCase()).join(', ')}

CRITICAL INSTRUCTION: You MUST generate posts for EVERY day in the date range, following these rules:
1. Start EXACTLY on ${start.toISOString().split('T')[0]} (first day)
2. Include EVERY consecutive day
3. End on ${end.toISOString().split('T')[0]} (last day)
4. Generate posts for ALL platforms for EACH day

For example, if platforms are [facebook, instagram] and dates are 2024-03-23 to 2024-03-25, you must generate 6 posts total:
- 2 posts for 2024-03-23 (1 facebook, 1 instagram)
- 2 posts for 2024-03-24 (1 facebook, 1 instagram)
- 2 posts for 2024-03-25 (1 facebook, 1 instagram)

Format your response as a JSON array with this structure:
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

Requirements:
1. Use lowercase platform names (facebook, instagram, twitter, linkedin)
2. First post date MUST be ${start.toISOString().split('T')[0]}
3. Include EVERY day until ${end.toISOString().split('T')[0]}
4. Use ISO date format (YYYY-MM-DD)
5. Generate unique content for each platform and day
6. For imagePrompt, provide a clear, detailed description that would help an AI image generator create a relevant image. Focus on visual elements, style, and mood.

Make each post idea unique and engaging, considering the specific features and audience of each platform.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    let response;
    try {
      // Extract JSON from the response
      const jsonMatch = message.content[0].text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      response = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      console.log('Raw response:', message.content[0].text);
      throw new Error('Failed to parse campaign ideas from Claude');
    }

    // Validate response structure
    if (!response || !Array.isArray(response.posts)) {
      console.error('Invalid response structure:', response);
      throw new Error('Invalid response structure from Claude');
    }

    // Calculate expected number of posts
    const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const expectedPosts = daysDiff * platforms.length;
    
    console.log('Expected posts:', {
      days: daysDiff,
      platformCount: platforms.length,
      expectedTotal: expectedPosts
    });

    // Validate and process posts
    const processedPosts = response.posts.map(post => {
      if (!post.idea || !post.date || !post.platform) {
        console.error('Invalid post structure:', post);
        throw new Error('Generated post is missing required fields');
      }
      
      // Convert and validate the date
      const postDate = new Date(post.date + 'T00:00:00Z');
      postDate.setUTCHours(0, 0, 0, 0);
      
      if (postDate < start || postDate > end) {
        console.error('Post date out of range:', {
          postDate: postDate.toISOString(),
          start: start.toISOString(),
          end: end.toISOString()
        });
        throw new Error('Generated post date is outside campaign date range');
      }
      
      return {
        ...post,
        platform: post.platform.toLowerCase(),
        date: postDate
      };
    });

    // Sort posts by date and platform
    processedPosts.sort((a, b) => {
      const dateCompare = a.date - b.date;
      if (dateCompare === 0) {
        return a.platform.localeCompare(b.platform);
      }
      return dateCompare;
    });

    // Validate we have the correct number of posts
    if (processedPosts.length !== expectedPosts) {
      console.error('Incorrect number of posts:', {
        expected: expectedPosts,
        received: processedPosts.length,
        posts: processedPosts.map(p => ({
          date: p.date.toISOString(),
          platform: p.platform
        }))
      });
      throw new Error(`Incorrect number of posts generated. Expected ${expectedPosts}, got ${processedPosts.length}`);
    }

    // Validate we have posts for each day and platform
    const postsByDate = new Map();
    processedPosts.forEach(post => {
      const dateStr = post.date.toISOString().split('T')[0];
      if (!postsByDate.has(dateStr)) {
        postsByDate.set(dateStr, new Set());
      }
      postsByDate.get(dateStr).add(post.platform);
    });

    // Check each day has posts for all platforms
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const platformsForDate = postsByDate.get(dateStr);
      
      if (!platformsForDate || platformsForDate.size !== platforms.length) {
        console.error('Missing posts for date:', {
          date: dateStr,
          expectedPlatforms: platforms,
          foundPlatforms: Array.from(platformsForDate || [])
        });
        throw new Error(`Missing posts for date ${dateStr}`);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('Successfully generated posts:', processedPosts.map(p => ({
      date: p.date.toISOString(),
      platform: p.platform
    })));

    return { posts: processedPosts };
  } catch (error) {
    console.error('Error generating campaign ideas:', error);
    throw new Error('Failed to generate campaign ideas: ' + error.message);
  }
}
