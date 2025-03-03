// Default values are only used as fallback if localStorage isn't available
const DEFAULT_API_ENDPOINT = "https://bedrock-runtime.us-east-1.amazonaws.com";
const DEFAULT_API_KEY = "";

export async function apiRequest(
  method: string,
  path: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get API settings from localStorage
  let apiEndpoint = DEFAULT_API_ENDPOINT;
  let apiKey = DEFAULT_API_KEY;
  
  try {
    const savedSettings = localStorage.getItem('apiSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      apiEndpoint = settings.endpoint || DEFAULT_API_ENDPOINT;
      apiKey = settings.apiKey || DEFAULT_API_KEY;
    }
  } catch (err) {
    console.error('Error retrieving API settings:', err);
  }
  
  const url = `${apiEndpoint}${path}`;
  
  const headers: HeadersInit = {
    'x-api-key': apiKey,
  };
  
  if (data) {
    headers['Content-Type'] = 'application/json';
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText || res.statusText}`);
  }
  
  return res;
}
