export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const LOCALSTORAGE_KEY = 'assistant_api_key';

export function saveApiKey(key: string) {
  localStorage.setItem(LOCALSTORAGE_KEY, key);
}

export function getApiKey(): string {
  return localStorage.getItem(LOCALSTORAGE_KEY) || '';
}

const CADQUERY_SYSTEM_PROMPT = `
You are a CadQuery expert assistant integrated into Makistry's 3D design platform.
- Answer with concise, actionable steps and CadQuery code when helpful.
- Prefer CadQuery v2 idioms; cite docs where applicable.
- Proactively ask 1-2 clarifying follow-up questions if requirements are underspecified.
- Suggest next steps to refine the design or export formats (STEP, STL).
- Assume users may run code in Jupyter via display(<CadQuery object>).
- Focus on parametric modeling, constraints, and manufacturing considerations.
- When suggesting design improvements, provide 3-4 specific alternatives with trade-offs.
`;

async function callModel(apiKey: string, messages: ChatMessage[]): Promise<string> {
  // Replace with your provider endpoint; example uses OpenAI-compatible schema
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Assistant error ${resp.status}: ${text}`);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function chatWithAssistant(userInput: string, history: ChatMessage[]) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Missing API key. Add it in Settings.');
  const messages: ChatMessage[] = [
    { role: 'system', content: CADQUERY_SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: userInput },
  ];
  const content = await callModel(apiKey, messages);
  return content;
}

export async function getDesignSuggestions(currentDesign: string, context: string): Promise<string[]> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Missing API key. Add it in Settings.');
  
  const prompt = `Given this current CadQuery design context: "${context}" and current design: "${currentDesign}", provide 3-4 specific design improvement suggestions. Each suggestion should be a brief, actionable improvement with a short explanation. Format as a JSON array of strings.`;
  
  const messages: ChatMessage[] = [
    { role: 'system', content: CADQUERY_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];
  
  const content = await callModel(apiKey, messages);
  
  try {
    // Try to parse as JSON array
    const suggestions = JSON.parse(content);
    if (Array.isArray(suggestions)) {
      return suggestions.slice(0, 4); // Limit to 4 suggestions
    }
  } catch (e) {
    // Fallback: split by lines and take first 4
    return content.split('\n').slice(0, 4).filter(line => line.trim());
  }
  
  return [];
}
