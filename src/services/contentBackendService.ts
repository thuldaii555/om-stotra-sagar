import type { ContentBundle } from '../types';

const CONTENT_ENDPOINT = '/.netlify/functions/get-content';
const SAVE_ENDPOINT = '/.netlify/functions/save-content';

export async function loadRemoteContent(): Promise<ContentBundle | null> {
  try {
    const response = await fetch(CONTENT_ENDPOINT, { headers: { Accept: 'application/json' } });
    if (!response.ok) return null;
    const payload = await response.json() as { content?: ContentBundle | null };
    return payload.content ?? null;
  } catch {
    return null;
  }
}

export async function publishContentToGitHub(content: ContentBundle, adminPassword: string): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await fetch(SAVE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': adminPassword,
      },
      body: JSON.stringify({ content }),
    });
    const payload = await response.json().catch(() => ({})) as { message?: string; error?: string };

    if (!response.ok) {
      const message = payload.error || payload.message || 'Publish failed.';
      if (response.status === 503 || /not configured/i.test(message)) {
        return { ok: false, message: 'Backend not configured. Export/import still works locally.' };
      }
      return { ok: false, message };
    }

    return { ok: true, message: 'Published to GitHub.' };
  } catch {
    return { ok: false, message: 'Backend not configured. Export/import still works locally.' };
  }
}
