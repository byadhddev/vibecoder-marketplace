/**
 * GitHub Branch-Based Database Client
 *
 * Uses a single GitHub repo with one branch per user as the data layer.
 * - `user/{username}` branches hold profile.json + showcases/*.json
 * - `registry` branch holds the global users.json index
 * - Reads use the app token (or unauthenticated for public repos)
 * - Writes use the authenticated user's OAuth token
 */

const DATA_REPO = () => process.env.GITHUB_DATA_REPO!;   // e.g. "vibecoder/marketplace-data"
const DATA_OWNER = () => DATA_REPO().split('/')[0];
const DATA_NAME = () => DATA_REPO().split('/')[1];
const API = 'https://api.github.com';

type Token = string;

function headers(token: Token) {
    return {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
    };
}

function appToken(): string {
    return process.env.GITHUB_APP_TOKEN || process.env.GITHUB_CLIENT_SECRET || '';
}

// ─── Branch Operations ───────────────────────────────────────

/** Check if a branch exists */
export async function branchExists(branch: string, token?: Token): Promise<boolean> {
    const t = token || appToken();
    const res = await fetch(
        `${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/branches/${encodeURIComponent(branch)}`,
        { headers: headers(t), cache: 'no-store' },
    );
    return res.status === 200;
}

/** Create an orphan branch with an initial commit containing a placeholder file */
export async function createOrphanBranch(branch: string, token: Token): Promise<boolean> {
    const owner = DATA_OWNER();
    const repo = DATA_NAME();

    // 1. Create a blob (GitHub rejects empty trees)
    const blobRes = await fetch(`${API}/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify({ content: btoa('{}'), encoding: 'base64' }),
    });
    if (!blobRes.ok) { console.error('Failed to create blob:', await blobRes.text()); return false; }
    const { sha: blobSha } = await blobRes.json();

    // 2. Create tree with the placeholder blob
    const treeRes = await fetch(`${API}/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify({ tree: [{ path: '.init', mode: '100644', type: 'blob', sha: blobSha }] }),
    });
    if (!treeRes.ok) { console.error('Failed to create tree:', await treeRes.text()); return false; }
    const { sha: treeSha } = await treeRes.json();

    // 3. Create a commit with no parents (orphan)
    const commitRes = await fetch(`${API}/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify({
            message: `Initialize branch ${branch}`,
            tree: treeSha,
            parents: [],
        }),
    });
    if (!commitRes.ok) { console.error('Failed to create commit:', await commitRes.text()); return false; }
    const { sha: commitSha } = await commitRes.json();

    // 4. Create the ref
    const refRes = await fetch(`${API}/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commitSha }),
    });
    if (!refRes.ok) { console.error('Failed to create ref:', await refRes.text()); return false; }
    return true;
}

// ─── File Operations ─────────────────────────────────────────

export interface FileContent {
    content: string;       // decoded content
    sha: string;           // needed for updates
    path: string;
}

/** Read a file from a specific branch. Returns null if not found. */
export async function readFile(
    path: string,
    branch: string,
    token?: Token,
    revalidate?: number,
): Promise<FileContent | null> {
    const t = token || appToken();
    const res = await fetch(
        `${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/contents/${path}?ref=${encodeURIComponent(branch)}`,
        {
            headers: headers(t),
            next: revalidate !== undefined ? { revalidate } : undefined,
            cache: revalidate !== undefined ? undefined : 'no-store',
        } as RequestInit,
    );
    if (res.status === 404) return null;
    if (!res.ok) { console.error(`readFile(${path}, ${branch}):`, await res.text()); return null; }
    const data = await res.json();
    if (data.type !== 'file') return null;
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { content, sha: data.sha, path: data.path };
}

/** Read and parse a JSON file from a branch. */
export async function readJSON<T>(
    path: string,
    branch: string,
    token?: Token,
    revalidate?: number,
): Promise<{ data: T; sha: string } | null> {
    const file = await readFile(path, branch, token, revalidate);
    if (!file) return null;
    try {
        return { data: JSON.parse(file.content) as T, sha: file.sha };
    } catch {
        console.error(`readJSON parse error: ${path}@${branch}`);
        return null;
    }
}

/** Write (create or update) a file on a branch. Returns the new SHA. */
export async function writeFile(
    path: string,
    branch: string,
    content: string,
    token: Token,
    message: string,
    sha?: string, // required for updates, omit for creates
): Promise<string | null> {
    const body: Record<string, string> = {
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
    };
    if (sha) body.sha = sha;

    const res = await fetch(
        `${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/contents/${path}`,
        { method: 'PUT', headers: headers(token), body: JSON.stringify(body) },
    );
    if (!res.ok) {
        console.error(`writeFile(${path}, ${branch}):`, await res.text());
        return null;
    }
    const data = await res.json();
    return data.content?.sha ?? null;
}

/** Write a JSON object to a file on a branch. */
export async function writeJSON<T>(
    path: string,
    branch: string,
    data: T,
    token: Token,
    message: string,
    sha?: string,
): Promise<string | null> {
    return writeFile(path, branch, JSON.stringify(data, null, 2), token, message, sha);
}

/** Delete a file from a branch. */
export async function deleteFile(
    path: string,
    branch: string,
    sha: string,
    token: Token,
    message: string,
): Promise<boolean> {
    const res = await fetch(
        `${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/contents/${path}`,
        {
            method: 'DELETE',
            headers: headers(token),
            body: JSON.stringify({ message, sha, branch }),
        },
    );
    if (!res.ok) { console.error(`deleteFile(${path}, ${branch}):`, await res.text()); return false; }
    return true;
}

/** List files in a directory on a branch. Returns file names (not full contents). */
export async function listFiles(
    dirPath: string,
    branch: string,
    token?: Token,
    revalidate?: number,
): Promise<{ name: string; sha: string; path: string }[]> {
    const t = token || appToken();
    const res = await fetch(
        `${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/contents/${dirPath}?ref=${encodeURIComponent(branch)}`,
        {
            headers: headers(t),
            next: revalidate !== undefined ? { revalidate } : undefined,
            cache: revalidate !== undefined ? undefined : 'no-store',
        } as RequestInit,
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data
        .filter((f: { type: string }) => f.type === 'file')
        .map((f: { name: string; sha: string; path: string }) => ({
            name: f.name,
            sha: f.sha,
            path: f.path,
        }));
}

// ─── Helpers ─────────────────────────────────────────────────

/** User branch name convention */
export function userBranch(username: string): string {
    return `user/${username}`;
}

/** Registry branch name */
export const REGISTRY_BRANCH = 'registry';
