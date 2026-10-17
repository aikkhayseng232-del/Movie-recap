export async function safeFetchJson(url: string, options?: RequestInit): Promise<any> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (err: any) {
    throw new Error(err.message || 'Network connection failed. Please check your network or server status.');
  }

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  // If server returns HTML (e.g. Vercel 404 page, 502 gateway, or serverless payload limit exceeded HTML starting with "The page")
  if (!contentType.includes('application/json') || text.trim().startsWith('<') || text.trim().toLowerCase().startsWith('the page')) {
    if (res.status === 404 || text.trim().toLowerCase().startsWith('the page')) {
      throw new Error(`API Endpoint not found or Vercel serverless page returned (404/HTML). For large video files or serverless deployments, please ensure backend routes are correctly mapped or use sample videos.`);
    } else if (res.status === 413 || text.includes('Payload Too Large') || text.includes('Entity Too Large')) {
      throw new Error(`Vercel Serverless Payload Limit Exceeded (413). Uploaded video exceeds Vercel function body limit (~4.5MB). Please use preloaded sample videos or run locally for large files.`);
    } else if (res.status >= 500) {
      throw new Error(`Server Error (${res.status}): The server encountered an internal error or serverless timeout.`);
    } else {
      throw new Error(`Deployment Error / Non-JSON Response (${res.status}): Expected JSON but received HTML. (${text.slice(0, 100)})`);
    }
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch (e) {
    if (!res.ok) {
      throw new Error(`Server Error (${res.status}): ${text.slice(0, 150)}`);
    }
    throw new Error(`Invalid JSON response from server: ${text.slice(0, 100)}`);
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || `Server returned error status ${res.status}`);
  }

  return data;
}
