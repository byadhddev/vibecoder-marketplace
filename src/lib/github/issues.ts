/**
 * GitHub Issues & Discussions API Layer
 *
 * Uses the data repo's Issues for transparent hire requests,
 * showcase feedback, and reviews. Discussions for community boards.
 */

const DATA_REPO = () => process.env.GITHUB_DATA_REPO!;
const DATA_OWNER = () => DATA_REPO().split('/')[0];
const DATA_NAME = () => DATA_REPO().split('/')[1];
const API = 'https://api.github.com';

function appToken(): string {
    return process.env.GITHUB_APP_TOKEN || process.env.GITHUB_CLIENT_SECRET || '';
}

function headers(token: string) {
    return {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
    };
}

// ─── Types ───────────────────────────────────────────────────

export interface GitHubIssue {
    id: number;
    number: number;
    title: string;
    body: string;
    state: 'open' | 'closed';
    labels: { name: string; color: string }[];
    html_url: string;
    created_at: string;
    updated_at: string;
    comments: number;
    user: { login: string; avatar_url: string };
}

export interface HireRequest {
    issue_number: number;
    name: string;
    email: string;
    description: string;
    budget: string;
    timeline: string;
    status: 'open' | 'closed';
    html_url: string;
    created_at: string;
    comments: number;
    seeker_github: string;
    seeker_avatar: string;
}

export interface ShowcaseFeedback {
    issue_number: number;
    title: string;
    body: string;
    status: 'open' | 'closed';
    html_url: string;
    created_at: string;
    comments: number;
    author: string;
    author_avatar: string;
}

// ─── Labels ──────────────────────────────────────────────────

const LABEL_HIRE_REQUEST = 'hire-request';
const LABEL_SHOWCASE_FEEDBACK = 'showcase-feedback';
const LABEL_REVIEW = 'review';

async function ensureLabel(name: string, color: string, description: string, token?: string): Promise<void> {
    const t = token || appToken();
    const res = await fetch(
        `${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/labels/${encodeURIComponent(name)}`,
        { headers: headers(t) },
    );
    if (res.status === 404) {
        await fetch(`${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/labels`, {
            method: 'POST',
            headers: headers(t),
            body: JSON.stringify({ name, color, description }),
        });
    }
}

/** Bootstrap required labels on data repo (idempotent) */
export async function ensureLabels(token?: string): Promise<void> {
    await Promise.all([
        ensureLabel(LABEL_HIRE_REQUEST, 'D80018', 'Hire request from a seeker', token),
        ensureLabel(LABEL_SHOWCASE_FEEDBACK, '1D76DB', 'Feedback on a showcase', token),
        ensureLabel(LABEL_REVIEW, '0E8A16', 'Builder review from a seeker', token),
    ]);
}

// ─── Hire Requests (Issues) ──────────────────────────────────

function formatHireRequestBody(data: {
    name: string;
    email: string;
    description: string;
    budget: string;
    timeline: string;
}): string {
    return [
        `## Project Request`,
        ``,
        data.description,
        ``,
        `---`,
        ``,
        `| Field | Details |`,
        `|-------|---------|`,
        `| **From** | ${data.name} |`,
        `| **Email** | ${data.email} |`,
        data.budget ? `| **Budget** | ${data.budget} |` : null,
        data.timeline ? `| **Timeline** | ${data.timeline} |` : null,
        ``,
        `---`,
        `*Submitted via [VibeCoder Marketplace](${process.env.NEXTAUTH_URL || 'https://vibecoder.com'})*`,
    ].filter(Boolean).join('\n');
}

function parseHireRequestBody(body: string): { name: string; email: string; description: string; budget: string; timeline: string } {
    const descMatch = body.match(/## Project Request\n\n([\s\S]*?)\n\n---/);
    const nameMatch = body.match(/\*\*From\*\* \| (.+?) \|/);
    const emailMatch = body.match(/\*\*Email\*\* \| (.+?) \|/);
    const budgetMatch = body.match(/\*\*Budget\*\* \| (.+?) \|/);
    const timelineMatch = body.match(/\*\*Timeline\*\* \| (.+?) \|/);

    return {
        description: descMatch?.[1]?.trim() || body,
        name: nameMatch?.[1] || 'Unknown',
        email: emailMatch?.[1] || '',
        budget: budgetMatch?.[1] || '',
        timeline: timelineMatch?.[1] || '',
    };
}

/** Create a hire request as a GitHub Issue */
export async function createHireRequest(
    builderUsername: string,
    data: { name: string; email: string; description: string; budget: string; timeline: string },
    builderSkills: string[],
    token?: string,
): Promise<{ issue_number: number; html_url: string } | null> {
    const t = token || appToken();

    // Ensure labels exist
    await ensureLabels(t);

    const labels = [
        LABEL_HIRE_REQUEST,
        `builder:${builderUsername}`,
    ];
    // Add skill labels (max 3 to avoid clutter)
    builderSkills.slice(0, 3).forEach(s => labels.push(`skill:${s.toLowerCase()}`));
    if (data.budget) labels.push(`budget:${data.budget}`);

    const title = `[Hire] ${data.name} → ${builderUsername}: ${data.description.slice(0, 60)}${data.description.length > 60 ? '…' : ''}`;

    const res = await fetch(`${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/issues`, {
        method: 'POST',
        headers: headers(t),
        body: JSON.stringify({
            title,
            body: formatHireRequestBody(data),
            labels,
        }),
    });

    if (!res.ok) {
        console.error('Failed to create hire request issue:', await res.text());
        return null;
    }

    const issue = await res.json();
    return { issue_number: issue.number, html_url: issue.html_url };
}

/** Get hire requests for a builder (reads Issues by label) */
export async function getHireRequests(
    builderUsername: string,
    state: 'open' | 'closed' | 'all' = 'open',
    token?: string,
): Promise<HireRequest[]> {
    const t = token || appToken();
    const labels = `${LABEL_HIRE_REQUEST},builder:${builderUsername}`;
    const res = await fetch(
        `${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/issues?labels=${encodeURIComponent(labels)}&state=${state}&sort=created&direction=desc&per_page=50`,
        { headers: headers(t), cache: 'no-store' },
    );

    if (!res.ok) return [];
    const issues: GitHubIssue[] = await res.json();

    return issues.map(issue => {
        const parsed = parseHireRequestBody(issue.body || '');
        return {
            issue_number: issue.number,
            name: parsed.name,
            email: parsed.email,
            description: parsed.description,
            budget: parsed.budget,
            timeline: parsed.timeline,
            status: issue.state,
            html_url: issue.html_url,
            created_at: issue.created_at,
            comments: issue.comments,
            seeker_github: issue.user?.login || '',
            seeker_avatar: issue.user?.avatar_url || '',
        };
    });
}

/** Close (archive) or reopen a hire request Issue */
export async function updateHireRequestStatus(
    issueNumber: number,
    state: 'open' | 'closed',
    token?: string,
): Promise<boolean> {
    const t = token || appToken();
    const res = await fetch(
        `${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/issues/${issueNumber}`,
        {
            method: 'PATCH',
            headers: headers(t),
            body: JSON.stringify({ state }),
        },
    );
    return res.ok;
}

/** Get count of open hire requests (for social proof) */
export async function getOpenHireRequestCount(token?: string): Promise<number> {
    const t = token || appToken();
    const res = await fetch(
        `${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/issues?labels=${LABEL_HIRE_REQUEST}&state=open&per_page=1`,
        { headers: headers(t), cache: 'no-store' },
    );
    if (!res.ok) return 0;
    // GitHub returns total count in Link header, but simplest: just count
    const issues = await res.json();
    // Check Link header for total pages
    const link = res.headers.get('Link') || '';
    const lastMatch = link.match(/page=(\d+)>; rel="last"/);
    if (lastMatch) return parseInt(lastMatch[1], 10);
    return Array.isArray(issues) ? issues.length : 0;
}

/** Get recent open hire requests across all builders (for explore page) */
export async function getRecentHireRequests(limit = 5, token?: string): Promise<HireRequest[]> {
    const t = token || appToken();
    const res = await fetch(
        `${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/issues?labels=${LABEL_HIRE_REQUEST}&state=open&sort=created&direction=desc&per_page=${limit}`,
        { headers: headers(t), cache: 'no-store' },
    );
    if (!res.ok) return [];
    const issues: GitHubIssue[] = await res.json();

    return issues.map(issue => {
        const parsed = parseHireRequestBody(issue.body || '');
        const builderLabel = issue.labels.find(l => l.name.startsWith('builder:'));
        return {
            issue_number: issue.number,
            name: parsed.name,
            email: parsed.email,
            description: parsed.description,
            budget: parsed.budget,
            timeline: parsed.timeline,
            status: issue.state,
            html_url: issue.html_url,
            created_at: issue.created_at,
            comments: issue.comments,
            seeker_github: issue.user?.login || '',
            seeker_avatar: issue.user?.avatar_url || '',
            builder: builderLabel?.name.replace('builder:', '') || '',
        } as HireRequest & { builder: string };
    });
}

// ─── Showcase Feedback (Issues) ──────────────────────────────

/** Create feedback on a showcase as a GitHub Issue */
export async function createShowcaseFeedback(
    builderUsername: string,
    showcaseSlug: string,
    showcaseTitle: string,
    body: string,
    authorGithub: string,
    token?: string,
): Promise<{ issue_number: number; html_url: string } | null> {
    const t = token || appToken();
    await ensureLabels(t);

    const title = `[Feedback] ${showcaseTitle} by ${builderUsername}`;
    const labels = [
        LABEL_SHOWCASE_FEEDBACK,
        `builder:${builderUsername}`,
        `showcase:${showcaseSlug}`,
    ];

    const issueBody = [
        `## Feedback`,
        ``,
        body,
        ``,
        `---`,
        `**Showcase:** [${showcaseTitle}](${process.env.NEXTAUTH_URL || ''}/m/${builderUsername}/${showcaseSlug})`,
        `**By:** @${authorGithub}`,
    ].join('\n');

    const res = await fetch(`${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/issues`, {
        method: 'POST',
        headers: headers(t),
        body: JSON.stringify({ title, body: issueBody, labels }),
    });

    if (!res.ok) {
        console.error('Failed to create feedback issue:', await res.text());
        return null;
    }

    const issue = await res.json();
    return { issue_number: issue.number, html_url: issue.html_url };
}

/** Get feedback for a specific showcase */
export async function getShowcaseFeedback(
    builderUsername: string,
    showcaseSlug: string,
    token?: string,
): Promise<ShowcaseFeedback[]> {
    const t = token || appToken();
    const labels = `${LABEL_SHOWCASE_FEEDBACK},showcase:${showcaseSlug},builder:${builderUsername}`;
    const res = await fetch(
        `${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/issues?labels=${encodeURIComponent(labels)}&state=all&sort=created&direction=desc&per_page=20`,
        { headers: headers(t), cache: 'no-store' },
    );
    if (!res.ok) return [];
    const issues: GitHubIssue[] = await res.json();

    return issues.map(issue => ({
        issue_number: issue.number,
        title: issue.title,
        body: issue.body || '',
        status: issue.state,
        html_url: issue.html_url,
        created_at: issue.created_at,
        comments: issue.comments,
        author: issue.user?.login || '',
        author_avatar: issue.user?.avatar_url || '',
    }));
}

/** Get all feedback for a builder's showcases */
export async function getBuilderFeedback(
    builderUsername: string,
    token?: string,
): Promise<ShowcaseFeedback[]> {
    const t = token || appToken();
    const labels = `${LABEL_SHOWCASE_FEEDBACK},builder:${builderUsername}`;
    const res = await fetch(
        `${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/issues?labels=${encodeURIComponent(labels)}&state=all&sort=created&direction=desc&per_page=50`,
        { headers: headers(t), cache: 'no-store' },
    );
    if (!res.ok) return [];
    const issues: GitHubIssue[] = await res.json();

    return issues.map(issue => ({
        issue_number: issue.number,
        title: issue.title,
        body: issue.body || '',
        status: issue.state,
        html_url: issue.html_url,
        created_at: issue.created_at,
        comments: issue.comments,
        author: issue.user?.login || '',
        author_avatar: issue.user?.avatar_url || '',
    }));
}

/** Get feedback count for a showcase (for badge) */
export async function getShowcaseFeedbackCount(
    builderUsername: string,
    showcaseSlug: string,
    token?: string,
): Promise<number> {
    const feedback = await getShowcaseFeedback(builderUsername, showcaseSlug, token);
    return feedback.length;
}

// ─── Reviews (Issues) ────────────────────────────────────────

export interface Review {
    issue_number: number;
    title: string;
    body: string;
    stars: number;
    html_url: string;
    created_at: string;
    reviewer: string;
    reviewer_avatar: string;
}

/** Create a review as a GitHub Issue */
export async function createReview(
    builderUsername: string,
    stars: number,
    body: string,
    reviewerGithub: string,
    token?: string,
): Promise<{ issue_number: number; html_url: string } | null> {
    const t = token || appToken();
    await ensureLabels(t);

    const starStr = '⭐'.repeat(Math.min(5, Math.max(1, stars)));
    const title = `[Review] ${reviewerGithub} → ${builderUsername}: ${starStr}`;
    const labels = [LABEL_REVIEW, `builder:${builderUsername}`, `stars:${stars}`];

    const issueBody = [
        `## Review — ${starStr}`,
        ``,
        body,
        ``,
        `---`,
        `**Builder:** [@${builderUsername}](${process.env.NEXTAUTH_URL || ''}/m/${builderUsername})`,
        `**By:** @${reviewerGithub}`,
    ].join('\n');

    const res = await fetch(`${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/issues`, {
        method: 'POST',
        headers: headers(t),
        body: JSON.stringify({ title, body: issueBody, labels }),
    });

    if (!res.ok) return null;
    const issue = await res.json();
    return { issue_number: issue.number, html_url: issue.html_url };
}

/** Get reviews for a builder */
export async function getBuilderReviews(builderUsername: string, token?: string): Promise<Review[]> {
    const t = token || appToken();
    const labels = `${LABEL_REVIEW},builder:${builderUsername}`;
    const res = await fetch(
        `${API}/repos/${DATA_OWNER()}/${DATA_NAME()}/issues?labels=${encodeURIComponent(labels)}&state=all&sort=created&direction=desc&per_page=50`,
        { headers: headers(t), cache: 'no-store' },
    );
    if (!res.ok) return [];
    const issues: GitHubIssue[] = await res.json();

    return issues.map(issue => {
        const starsLabel = issue.labels.find(l => l.name.startsWith('stars:'));
        const stars = starsLabel ? parseInt(starsLabel.name.replace('stars:', ''), 10) : 5;
        return {
            issue_number: issue.number,
            title: issue.title,
            body: issue.body || '',
            stars,
            html_url: issue.html_url,
            created_at: issue.created_at,
            reviewer: issue.user?.login || '',
            reviewer_avatar: issue.user?.avatar_url || '',
        };
    });
}

// ─── Data Repo URL Helpers ───────────────────────────────────

export function getDataRepoUrl(): string {
    return `https://github.com/${DATA_OWNER()}/${DATA_NAME()}`;
}

export function getIssuesUrl(): string {
    return `${getDataRepoUrl()}/issues`;
}

export function getDiscussionsUrl(): string {
    return `${getDataRepoUrl()}/discussions`;
}

export function getNewDiscussionUrl(category?: string): string {
    const base = `${getDataRepoUrl()}/discussions/new`;
    return category ? `${base}?category=${encodeURIComponent(category)}` : base;
}

// ─── Discussions ─────────────────────────────────────────────
// GitHub Discussions use the GraphQL API. For now we provide
// URL helpers + a REST-based check. Full GraphQL integration
// can be added when needed for feed tiles.

export interface DiscussionCategory {
    name: string;
    slug: string;
    description: string;
    emoji: string;
}

export const DISCUSSION_CATEGORIES: DiscussionCategory[] = [
    { name: 'Need This Built', slug: 'need-this-built', description: 'Seekers post what they need built — builders respond', emoji: '🛠️' },
    { name: 'Showcase Spotlight', slug: 'showcase-spotlight', description: 'Share your showcase — get community feedback', emoji: '✨' },
    { name: 'Introductions', slug: 'introductions', description: 'New builders introduce themselves', emoji: '👋' },
    { name: 'General', slug: 'general', description: 'Tips, tools, AI workflows, community chat', emoji: '💬' },
];

/** Check if Discussions are enabled on the data repo */
export async function checkDiscussionsEnabled(token?: string): Promise<boolean> {
    const t = token || appToken();
    const res = await fetch(
        `${API}/repos/${DATA_OWNER()}/${DATA_NAME()}`,
        { headers: headers(t), cache: 'no-store' },
    );
    if (!res.ok) return false;
    const repo = await res.json();
    return repo.has_discussions === true;
}

/** Enable Discussions on the data repo (requires admin access) */
export async function enableDiscussions(token: string): Promise<boolean> {
    const res = await fetch(
        `${API}/repos/${DATA_OWNER()}/${DATA_NAME()}`,
        {
            method: 'PATCH',
            headers: headers(token),
            body: JSON.stringify({ has_discussions: true }),
        },
    );
    return res.ok;
}

/** Get recent discussions via GraphQL (requires token with repo scope) */
export async function getRecentDiscussions(limit = 5, token?: string): Promise<{
    id: string;
    title: string;
    url: string;
    category: string;
    author: string;
    createdAt: string;
    comments: number;
}[]> {
    const t = token || appToken();
    const query = `query {
        repository(owner: "${DATA_OWNER()}", name: "${DATA_NAME()}") {
            discussions(first: ${limit}, orderBy: {field: CREATED_AT, direction: DESC}) {
                nodes {
                    id
                    title
                    url
                    category { name }
                    author { login }
                    createdAt
                    comments { totalCount }
                }
            }
        }
    }`;

    const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: headers(t),
        body: JSON.stringify({ query }),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const nodes = data?.data?.repository?.discussions?.nodes || [];
    return nodes.map((n: { id: string; title: string; url: string; category: { name: string }; author: { login: string }; createdAt: string; comments: { totalCount: number } }) => ({
        id: n.id,
        title: n.title,
        url: n.url,
        category: n.category?.name || '',
        author: n.author?.login || '',
        createdAt: n.createdAt,
        comments: n.comments?.totalCount || 0,
    }));
}
