import { Campaign } from '@/lib/db/models/campaign';

async function getPostsScheduledForToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    console.log('Fetching posts for date range:', { today, tomorrow });
    
    // Find campaigns with posts scheduled for today
    const campaigns = await Campaign.find({
      'generatedPosts.date': {
        $gte: today,
        $lt: tomorrow
      }
    });

    console.log('Found campaigns:', campaigns.length);

    // Extract posts scheduled for today from all campaigns
    const todaysPosts = [];
    
    campaigns.forEach(campaign => {
      const postsForToday = campaign.generatedPosts.filter(post => {
        const postDate = new Date(post.date);
        postDate.setHours(0, 0, 0, 0);
        const isToday = postDate.getTime() === today.getTime();
        console.log('Checking post:', { 
          postDate, 
          today, 
          isToday,
          campaignId: campaign._id
        });
        return isToday;
      });

      todaysPosts.push(...postsForToday.map(post => ({
        ...post.toObject(),
        connection: campaign.connection,
        campaignId: campaign._id
      })));
    });

    console.log('Found posts for today:', todaysPosts.length);
    return todaysPosts;
  } catch (error) {
    console.error('Error fetching today\'s posts:', error);
    throw error;
  }
}

async function sendPostToWebhook(post, connection) {
  try {
    // Get connection details from environment variable
    let connectionsData;
    try {
      connectionsData = JSON.parse(process.env.NEXT_PUBLIC_CONNECTIONS || '{"connections":[]}');
      if (!connectionsData.connections || !Array.isArray(connectionsData.connections)) {
        throw new Error('Invalid NEXT_PUBLIC_CONNECTIONS format');
      }
    } catch (error) {
      console.error('Error parsing NEXT_PUBLIC_CONNECTIONS:', error);
      throw new Error('Invalid NEXT_PUBLIC_CONNECTIONS format');
    }

    const connectionConfig = connectionsData.connections.find(c => c.name_connection === connection);
    console.log('Connection config:', { connection, found: !!connectionConfig });

    if (!connectionConfig || !connectionConfig.webhook) {
      throw new Error(`No webhook found for connection: ${connection}`);
    }

    // Prepare post data with only required fields
    const postData = {
      platform: post.platform,
      content: post.idea,
      imageUrl: post.imageUrl,
      // Add the platform-specific number from the connection config
      id: connectionConfig[post.platform]
    };

    console.log('Sending post to webhook:', {
      connection,
      webhook: connectionConfig.webhook,
      platform: post.platform,
      id: postData.id,
      postData
    });

    // Send post to webhook
    const response = await fetch(connectionConfig.webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    // Handle non-JSON responses (like "Accepted")
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      // If response is not JSON but status is ok, consider it successful
      if (response.ok) {
        responseData = { message: responseText };
      } else {
        throw new Error(`Webhook error: ${response.statusText} - ${responseText}`);
      }
    }

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.statusText} - ${JSON.stringify(responseData)}`);
    }

    return responseData;
  } catch (error) {
    console.error(`Error sending post to webhook for connection ${connection}:`, error);
    throw error;
  }
}

export async function publishScheduledPosts() {
  try {
    console.log('Starting scheduled post publishing...');
    
    // Get all posts scheduled for today
    const todaysPosts = await getPostsScheduledForToday();
    console.log(`Found ${todaysPosts.length} posts scheduled for today`);

    // Process each post
    const results = await Promise.allSettled(
      todaysPosts.map(async (post) => {
        try {
          const result = await sendPostToWebhook(post, post.connection);
          console.log(`Successfully published post ${post._id} to ${post.platform}`);
          return { success: true, post, result };
        } catch (error) {
          console.error(`Failed to publish post ${post._id}:`, error);
          return { success: false, post, error: error.message };
        }
      })
    );

    // Log results
    const successful = results.filter(r => r.value?.success).length;
    const failed = results.filter(r => !r.value?.success).length;
    
    console.log(`Publishing complete. Success: ${successful}, Failed: ${failed}`);
    
    return {
      total: todaysPosts.length,
      successful,
      failed,
      results: results.map(r => r.value)
    };
  } catch (error) {
    console.error('Error in publishScheduledPosts:', error);
    throw error;
  }
}
