const REPO = 'bennetstrauch/tm-muenchen';
const FILE_PATH = 'messages/de.json';
const API_URL = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;

function authHeader(): string {
  return `token ${process.env.GITHUB_COPY_TOKEN}`;
}

export async function readDeCopy(): Promise<{ content: Record<string, unknown>; sha: string }> {
  const res = await fetch(API_URL, {
    headers: {
      'Authorization': authHeader(),
      'Accept': 'application/vnd.github+json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub read failed ${res.status}: ${text}`);
  }

  const data = await res.json() as { content: string; sha: string };
  const content = JSON.parse(Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8')) as Record<string, unknown>;
  return { content, sha: data.sha };
}

export async function commitDeCopy(updated: Record<string, unknown>, sha: string): Promise<void> {
  const encoded = Buffer.from(JSON.stringify(updated, null, 2) + '\n').toString('base64');

  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Authorization': authHeader(),
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'chore: update landing page copy via admin [skip-notify]',
      content: encoded,
      sha,
      committer: {
        name: 'TM Admin Bot',
        email: 'admin-bot@tm-muenchen.de',
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub commit failed ${res.status}: ${text}`);
  }
}
