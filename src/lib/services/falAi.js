import { fal } from "@fal-ai/client";

// Initialize fal client with credentials
fal.config({
  credentials: process.env.FAL_AI_KEY,
});

export async function generateImage(prompt) {

  try {
    const result = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: prompt,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      }
    });
   

    if (!result.data.images || result.data.images.length === 0) {
      throw new Error('No image generated');
    }

    return result.data.images[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}
