export interface TdkMeaning {
  type?: string;
  text: string;
}

export interface TdkResponse {
  meanings: TdkMeaning[];
  example?: string | null;
}

interface AiResponse {
  details: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
  return response.json();
}

export const getWordMeaning = async (word: string): Promise<TdkResponse> => {
  const response = await fetch(`/api/getTdkMeaning?word=${encodeURIComponent(word)}`);
  return handleResponse<TdkResponse>(response);
};

export const getAiEtymology = async (word: string): Promise<AiResponse> => {
  const response = await fetch(`/api/get-ai-details?word=${encodeURIComponent(word)}`);
  return handleResponse<AiResponse>(response);
};

export const submitFeedback = async (data: {
  type: 'report' | 'suggestion';
  category: string;
  description: string;
  wordId: number | string;
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