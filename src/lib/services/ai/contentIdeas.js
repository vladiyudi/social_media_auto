export function contentIdeas( description, startDate, endDate ) {
    let start = new Date(startDate);
    let end = new Date(endDate);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);
    start = start.toISOString().split('T')[0];
    end = end.toISOString().split('T')[0];
  
    const prompt = `You are a content planning AI assistant. Your task is to generate a content plan based on a given description, start date, and end date. You will create original, profound ideas for each post within the specified date range.
  
  Here are the input variables you will work with:
  
  <description>
  ${description}
  </description>
  
  <start_date>${start}</start_date>
  <end_date>${end}</end_date>
  
  Follow these steps to generate the content plan:
  
  1. Analyze the description carefully. Identify key themes, topics, and goals mentioned in the description.
  
  2. Generate one unique content idea for each day between the start date and end date, inclusive. Each idea should:
     - Be original and creative
     - Align with the themes and goals identified in the description
     - Be profound and thought-provoking
     - Be suitable for a social media post or short-form content
  
  3. Format your output as a JSON object with the following structure:
     {
       "ideas": [
         {
           "date": "YYYY-MM-DD",
           "idea": "Core message and content for the post"
         }
       ]
     }
  
  4. Ensure that:
     - The "date" field is in the format "YYYY-MM-DD"
     - Dates are in chronological order
     - All dates between the start date and end date are included
     - Each "idea" is a concise yet descriptive sentence or short paragraph
  
  Here's an example of how your output should look (abbreviated for brevity):
  
  {
    "ideas": [
      {
        "date": "2023-06-01",
        "idea": "Explore the intersection of technology and nature: How AI is helping conservation efforts"
      },
      {
        "date": "2023-06-02",
        "idea": "The power of mindfulness in the digital age: Techniques for staying present amidst constant connectivity"
      }
    ]
  }
  
  Remember:
  - Each idea should be unique and not repetitive
  - Tailor the content to the themes identified in the description
  - Ensure ideas are evenly distributed across the date range
  - Maintain a consistent tone and style throughout the content plan
  
  Now, based on the given description, start date, and end date, generate the content plan as specified`;

  return prompt
}