const CONTENT_PATH = 'data/om-stotra-content.json';
const requiredEnv = ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_BRANCH'];

exports.handler = async function handler() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    return json(200, { content: null, message: 'GitHub content backend is not configured.' });
  }

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH;
  const path = CONTENT_PATH;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponentPath(path)}?ref=${encodeURIComponent(branch)}`;

  try {
    const response = await fetch(url, {
      headers: githubHeaders(),
    });

    if (response.status === 404) {
      return json(200, { content: null, message: 'Remote content file does not exist yet.' });
    }

    if (!response.ok) {
      return json(200, { content: null, message: 'Remote content could not be loaded.' });
    }

    const file = await response.json();
    const decoded = Buffer.from(file.content || '', 'base64').toString('utf8');
    const content = JSON.parse(decoded);
    const validationError = getValidationError(content);
    if (validationError) {
      return json(200, { content: null, message: `Remote content is not valid: ${validationError}` });
    }
    return json(200, { content });
  } catch {
    return json(200, { content: null, message: 'Remote content could not be loaded.' });
  }
};

/** Returns an error string if invalid, or null if valid. */
function getValidationError(content) {
  if (!content || typeof content !== 'object') return 'Content payload is required.';
  const requiredArrays = ['deities', 'categories', 'poojaBidhi', 'stories'];
  for (const key of requiredArrays) {
    if (!Array.isArray(content[key])) return `Content field "${key}" must be an array.`;
  }
  if (!Array.isArray(content.stotras) && !Array.isArray(content.devotionalContent)) {
    return 'Devotional content is required.';
  }
  if (!content.panchang || !Array.isArray(content.panchang.terms) || !Array.isArray(content.panchang.dailyNotes)) {
    return 'Panchang content is required.';
  }
  return null;
}

function githubHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
