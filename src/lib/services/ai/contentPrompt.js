export function contentIdeas(description, startDate, endDate) {
  return `Generate a series of social media content ideas based on the following campaign details:

Campaign Description: ${description}
Start Date: ${startDate}
End Date: ${endDate}

Please provide a list of content ideas in JSON format with the following structure:
{
  "ideas": [
    {
      "date": "YYYY-MM-DD",
      "idea": "Content idea description"
    }
  ]
}

Guidelines:
1. Each idea should be unique and engaging
2. Ideas should be evenly distributed between start and end dates
3. Content should align with the campaign description
4. Keep ideas concise but descriptive

Please respond ONLY with the JSON object, no additional text.`;
}
