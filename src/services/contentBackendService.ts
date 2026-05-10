import type { ContentBundle } from '../types';

const CONTENT_ENDPOINT = '/.netlify/functions/get-content';
const SAVE_ENDPOINT = '/.netlify/functions/save-content';

export async function loadRemoteContent(): Promise<ContentBundle | null> {
  try {
    const response = await fetch(CONTENT_ENDPOINT, { headers: { Accept: 'application/json' } });
    if (!response.ok) return null;
    const payload = await response.json() as { content?: ContentBundle | null };
    const content = payload.content ?? null;
    if (content && isContentEncodingCorrupted(content)) {
      console.warn('Remote content appears encoding-corrupted. Falling back to local defaults.');
      return null;
    }
    return content;
  } catch {
    return null;
  }
}

export function isContentEncodingCorrupted(content: unknown): boolean {
  const text = JSON.stringify(content);
  if (!text) return false;

  const mojibakeMatches = text.match(/à[¤¥]/g) || [];
  const replacementChar = JSON.parse(`"\\u${'fffd'}"`) as string;
  return mojibakeMatches.length > 0 || text.includes(replacementChar);
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
