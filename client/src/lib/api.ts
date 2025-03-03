const API_ENDPOINT = "https://7pg9r2dlcc.execute-api.us-east-1.amazonaws.com/api";
const API_KEY = "H7UI4czPRX7mxrlg67v7tCPL1XnBx5y90p4ieSZ8";

export async function apiRequest(
  method: string,
  path: string,
  data?: unknown | undefined,
): Promise<Response> {
  const url = `${API_ENDPOINT}${path}`;
  
  const headers: HeadersInit = {
    'x-api-key': API_KEY,
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
