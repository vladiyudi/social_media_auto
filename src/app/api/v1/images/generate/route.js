import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateImage } from "@/lib/services/falAi";

export async function POST(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get prompt from request body
    const { prompt } = await req.json();
    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Generate image
    const imageUrl = await generateImage(prompt);
    if (!imageUrl) {
      return Response.json({ error: "Failed to generate image" }, { status: 500 });
    }

    return Response.json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    return Response.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
