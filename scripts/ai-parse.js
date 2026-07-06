/**
 * AI-Powered Data Parser
 * 
 * Uses Google's Gemini API to parse unstructured sports data
 * into structured JSON that can be inserted into the database.
 * 
 * Usage: node scripts/ai-parse.js "raw text about a tournament"
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY environment variable');
  process.exit(1);
}

async function parseWithAI(rawText, sportType) {
  const prompt = `
You are a sports data parser. Extract structured information from the following text about a ${sportType} tournament or event.

Return ONLY a JSON object in this exact format:
{
  "name": "Tournament Name",
  "status": "UPCOMING or LIVE or COMPLETED",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD or null",
  "location": "City, Country",
  "city": "City",
  "country": "Country",
  "streaming_platforms": ["Platform1", "Platform2"],
  "description": "Brief description"
}

Text to parse:
${rawText}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('No response from Gemini');
      return null;
    }

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing with AI:', error);
    return null;
  }
}

// If run directly with arguments
if (require.main === module) {
  const text = process.argv[2];
  const sport = process.argv[3] || 'cricket';
  
  if (!text) {
    console.log('Usage: node scripts/ai-parse.js "text to parse" [sport-type]');
    process.exit(1);
  }
  
  parseWithAI(text, sport).then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
}

module.exports = { parseWithAI };
