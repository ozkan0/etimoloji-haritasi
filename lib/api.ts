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

const meaningCache = new Map<string, TdkResponse>();
const pendingMeaningRequests = new Map<string, Promise<TdkResponse>>();

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
  return response.json();
}

export const getWordMeaning = async (word: string): Promise<TdkResponse> => {
  const cacheKey = word.trim().toLocaleLowerCase('tr-TR');

  const cached = meaningCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pending = pendingMeaningRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  const requestPromise = (async () => {
    const response = await fetch(`/api/getTdkMeaning?word=${encodeURIComponent(word)}`);

    if (response.status === 404) {
      const data = await response.json().catch(() => ({
        meanings: [{ text: 'TDK sözlüğünde kayıt bulunamadı.' }],
        example: null,
      }));

      const notFoundResponse: TdkResponse = {
        meanings: Array.isArray(data.meanings) ? data.meanings : [{ text: 'TDK sözlüğünde kayıt bulunamadı.' }],
        example: data.example ?? null,
      };

      meaningCache.set(cacheKey, notFoundResponse);
      return notFoundResponse;
    }

    const data = await handleResponse<TdkResponse>(response);
    meaningCache.set(cacheKey, data);
    return data;
  })();

  pendingMeaningRequests.set(cacheKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    pendingMeaningRequests.delete(cacheKey);
  }
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