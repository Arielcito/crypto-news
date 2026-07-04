export async function adminFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.message || body?.error || 'Request failed');
  }

  return body as T;
}

export async function adminUpload<T>(input: string, formData: FormData): Promise<T> {
  const response = await fetch(input, {
    method: 'POST',
    body: formData,
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.message || body?.error || 'Upload failed');
  }

  return body as T;
}
