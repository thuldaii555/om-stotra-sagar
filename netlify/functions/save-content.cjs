const CONTENT_PATH = 'data/om-stotra-content.json';
const requiredGitHubEnv = ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_BRANCH'];

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return json(503, { error: 'Admin password is not configured.' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body.' });
  }

  const providedPassword = event.headers['x-admin-password'] || event.headers['X-Admin-Password'] || payload.adminPassword;
  if (providedPassword !== adminPassword) {
    return json(401, { error: 'Invalid admin password.' });
  }

  const missing = requiredGitHubEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    return json(503, { error: 'GitHub publishing is not configured.' });
  }

  const publishedAt = new Date().toISOString();
  const payloadContent = payload.content || {};
  const content = {
    ...payloadContent,
    updatedAt: payloadContent.updatedAt || publishedAt,
    lastPublishedAt: payloadContent.lastPublishedAt || publishedAt,
    sourceVersion: payloadContent.sourceVersion || `github-${publishedAt}`,
  };
  const validationError = getValidationError(content);
  if (validationError) {
    return json(400, { error: validationError });
  }

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH;
  const path = CONTENT_PATH;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponentPath(path)}`;

  try {
    const current = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, { headers: githubHeaders() });
    let sha;
    if (current.ok) {
      const currentFile = await current.json();
      sha = currentFile.sha;
    } else if (current.status !== 404) {
      return json(502, { error: `GitHub GET returned HTTP ${current.status}` });
    }

    const jsonText = JSON.stringify(content, null, 2);
    const body = {
      message: 'Update Om Stotra Sagar content',
      content: Buffer.from(jsonText, 'utf8').toString('base64'),
      branch,
      ...(sha ? { sha } : {}),
    };

    const save = await fetch(url, {
      method: 'PUT',
      headers: githubHeaders(),
      body: JSON.stringify(body),
    });

    if (!save.ok) {
      return json(502, { error: 'GitHub content save failed.' });
    }

    return json(200, { message: 'Content published to GitHub.', updatedAt: content.updatedAt, lastPublishedAt: content.lastPublishedAt, sourceVersion: content.sourceVersion });
  } catch {
    return json(502, { error: 'GitHub content save failed.' });
  }
};

/** Returns an error string if invalid, or null if valid. */
function getValidationError(content) {
  if (!content || typeof content !== 'object') return 'Content payload is required.';
  const requiredArrays = ['deities', 'categories', 'poojaBidhi', 'stories'];
  for (const key of requiredArrays) {
    if (!Array.isArray(content[key])) return `Content field "${key}" must be an array.`;
  }
  if (!Array.isArray(content.stotras) && !Array.isArray(content.devotionalContent)) return 'Devotional content is required.';
  if (!content.panchang || !Array.isArray(content.panchang.terms) || !Array.isArray(content.panchang.dailyNotes)) return 'Panchang content is required.';
  return null;
}

function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'om-stotra-sagar-netlify-function',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function encodeURIComponentPath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}
