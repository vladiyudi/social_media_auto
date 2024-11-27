export function fbPrompt(idea, brandLanguage) {
    const prompt = `You are tasked with creating an engaging Facebook post based on a given idea. Your goal is to craft a post that is optimized for the Facebook platform and follows best practices for social media engagement.

Here are the guidelines for creating an effective Facebook post:

1. Use the following idea as the basis for your post:
<idea>
${idea}
</idea>

2. Keep the post concise and to the point. Aim for 1-2 short paragraphs or 3-5 sentences maximum.

3. Use a conversational and friendly tone that resonates with Facebook users.

4. Use emojis sparingly to add visual interest, but don't overuse them.

5. Consider using a question or a thought-provoking statement to encourage engagement.

6. If appropriate, incorporate a relevant hashtag (limit to 1-2 hashtags).

7. End with a clear call-to-action, such as asking for comments, shares, or likes.

8. Ensure the post is easy to read and understand at a glance.

9. Avoid using jargon or overly complex language.

10. If possible, frame the idea in a way that relates to current trends or topics of interest on social media.

11. Generate the post in a way that aligns with the brand language:
<brand_language>
${brandLanguage}
</brand_language>

After crafting the post, review it to ensure it's engaging, concise, and optimized for Facebook. Make any necessary refinements to improve its potential for engagement and shareability.

IMPORTANT: Respond ONLY with the JSON object containing your post, no additional text or formatting:

{
  "post": "Your optimized Facebook post content here"
}`;

    return prompt;
}

export function instaPrompt(idea, brandLanguage) {
    const prompt = `You are tasked with generating an Instagram post based on a given idea, following best practices for the platform. Your goal is to create engaging, visually-oriented content that resonates with Instagram users.

Here's the idea you'll be working with:
<idea>
${idea}
</idea>

When creating an Instagram post, keep these best practices in mind:
1. Keep it concise: Instagram captions should be brief and to the point, ideally under 125 characters.
2. Use emojis: Incorporate relevant emojis to add visual interest and convey emotion.
3. Include a call-to-action: Encourage engagement by asking a question or prompting users to take action.
4. Utilize hashtags: Include 3-5 relevant hashtags to increase discoverability.
5. Create visual appeal: Describe the post as if it were accompanied by an eye-catching image or video.

Generate an Instagram post based on the given idea, following these steps:
1. Craft a catchy, attention-grabbing opening line.
2. Expand on the idea in 1-2 short sentences, focusing on visual elements.
3. Include a call-to-action or question to encourage engagement.
4. Add relevant emojis throughout the post.
5. Conclude with 3-5 appropriate hashtags.

Generate the post in a way that aligns with the brand language:
<brand_language>
${brandLanguage}
</brand_language>

IMPORTANT: Respond ONLY with the JSON object containing your post, no additional text or formatting:

{
  "post": "Your Instagram post content here"
}`;

    return prompt;
}