import { fal } from "@fal-ai/client";
import { link } from "fs";

// Initialize fal client with credentials
fal.config({
  credentials: process.env.FAL_AI_KEY,
});


const platformSizes = {
  instagram: "square_hd",
  facebook: "landscape_4_3",
  linkedIn: "landscape_4_3",
  tiktok: "portrait_4_3",
  threads: "landscape_4_3",
  x: "landscape_4_3",
};

const models = {
  shnell: "flux/schnell",
  proNew: "flux-pro/new",
}


export async function generateImage(prompt, platform) {

  try {
    const result = await fal.subscribe(`fal-ai/${models['proNew']}`, {
      input: {
        prompt: prompt,
        image_size: platformSizes[platform]
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
