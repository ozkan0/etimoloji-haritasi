interface TdkResponse {
  meaning: string;
  example?: string | null;
}

interface AiResponse {
  details: string;
}

// Helper for consistent error handling
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetches the meaning and example sentence from TDK API
 */
export const getWordMeaning = async (word: string): Promise<TdkResponse> => {
  const response = await fetch(`/api/getTdkMeaning?word=${encodeURIComponent(word)}`);
  return handleResponse<TdkResponse>(response);
};

/**
 * Fetches the detailed etymology story from gemini-2.5-flash model
 */
export const getAiEtymology = async (word: string): Promise<AiResponse> => {
  const response = await fetch(`/api/get-ai-details?word=${encodeURIComponent(word)}`);
  return handleResponse<AiResponse>(response);
};

/**
 * Submits feedback/report/suggestion
 */
export const submitFeedback = async (data: {
  type: 'report' | 'suggestion';
  category: string;
  description: string;
  wordId: number;
  wordName: string;
  userAgent: string;
}) => {
  const response = await fetch('/api/submitFeedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<{ success: boolean }>(response);
};