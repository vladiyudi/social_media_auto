export function imagePrompt(idea) {
    const prompt = `You are tasked with generating a system prompt for image generation using Flux AI. Your goal is to create a detailed and effective prompt that  provides clear guidance for the AI model to visualize a specific image idea.

    The image idea you need to visualize is:
    
    <image_idea>
    ${idea}
    </image_idea>
    
    To craft your image prompt, follow these steps:
    
    1. Start with a clear description of the medium (e.g., photograph, digital painting, 3D render) that best suits the image idea.
    2. Describe the main subject in detail, including characteristics, pose, and any relevant emotions or actions.
    3. Specify the background or setting, and how it relates to the subject.
    4. Mention any specific style traits, artistic influences, or techniques you want to incorporate.
    5. Include details about lighting, color palette, and any other visual elements that are important to the image.
    6. Ensure that your prompt reflects the best practices provided and incorporates the key elements of the image idea.
    
    Here are two examples of well-structured prompts. Follow this example in style and length. Remember the prompt should be concise but detailed, ot longer than 2 sentences:
    
    Example 1: "A vibrant digital illustration of a steampunk-inspired flying machine soaring through a sunset sky. The aircraft features intricate brass gears, copper pipes, and billowing steam clouds. The background showcases a cityscape of Victorian-era buildings with warm, golden light reflecting off their windows. Use a color palette dominated by rich oranges, deep purples, and metallic bronze tones."
    
    Example 2: "A hyper-realistic 3D render of a futuristic sports car in a wind tunnel test. The car's sleek, aerodynamic design features smooth curves and a matte black finish with subtle iridescent highlights. Visible air currents flow around the vehicle, represented by translucent streaks of blue and white. The background is a stark, minimalist testing facility with bright, clinical lighting."
    
    When you have crafted your image prompt, format your output as a JSON object with a single key "imagePrompt" whose value is your detailed prompt. For example:
    
    {
      "imagePrompt": "Your detailed image generation prompt here"
    }
    
    Be as specific and descriptive as possible to guide the AI in generating the desired image based on the provided image idea.`;

    return prompt
}