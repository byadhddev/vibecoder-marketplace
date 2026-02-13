#!/usr/bin/env node
/**
 * Seed test data into the branch-based GitHub backend.
 * Usage: node scripts/seed.mjs
 * 
 * Requires: GITHUB_DATA_REPO and GITHUB_APP_TOKEN in .env.local
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
    envContent.split('\n').filter(l => l && !l.startsWith('#')).map(l => {
        const [k, ...v] = l.split('=');
        return [k.trim(), v.join('=').trim()];
    })
);

const REPO = env.GITHUB_DATA_REPO;
const TOKEN = env.GITHUB_APP_TOKEN;
const API = 'https://api.github.com';
const [OWNER, NAME] = REPO.split('/');

const headers = {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
};

// ─── Helpers ─────────────────────────────────────────────────

async function branchExists(branch) {
    const res = await fetch(`${API}/repos/${OWNER}/${NAME}/branches/${encodeURIComponent(branch)}`, { headers });
    return res.status === 200;
}

async function createOrphanBranch(branch) {
    // Create blob for an initial file
    const content = Buffer.from('{}').toString('base64');
    const blobRes = await fetch(`${API}/repos/${OWNER}/${NAME}/git/blobs`, {
        method: 'POST', headers, body: JSON.stringify({ content, encoding: 'base64' }),
    });
    const { sha: blobSha } = await blobRes.json();

    const treeRes = await fetch(`${API}/repos/${OWNER}/${NAME}/git/trees`, {
        method: 'POST', headers,
        body: JSON.stringify({ tree: [{ path: '.init', mode: '100644', type: 'blob', sha: blobSha }] }),
    });
    const { sha: treeSha } = await treeRes.json();

    const commitRes = await fetch(`${API}/repos/${OWNER}/${NAME}/git/commits`, {
        method: 'POST', headers,
        body: JSON.stringify({ message: `Initialize ${branch}`, tree: treeSha, parents: [] }),
    });
    const { sha: commitSha } = await commitRes.json();

    await fetch(`${API}/repos/${OWNER}/${NAME}/git/refs`, {
        method: 'POST', headers,
        body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commitSha }),
    });
}

async function writeFile(path, branch, content, message) {
    // Check if file exists first
    const existsRes = await fetch(
        `${API}/repos/${OWNER}/${NAME}/contents/${path}?ref=${encodeURIComponent(branch)}`,
        { headers }
    );
    let sha;
    if (existsRes.ok) {
        const data = await existsRes.json();
        sha = data.sha;
    }

    const body = {
        message,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
        branch,
    };
    if (sha) body.sha = sha;

    const res = await fetch(`${API}/repos/${OWNER}/${NAME}/contents/${path}`, {
        method: 'PUT', headers, body: JSON.stringify(body),
    });
    if (!res.ok) {
        console.error(`  ✗ Failed to write ${path}:`, await res.text());
        return false;
    }
    return true;
}

// ─── Test Data ───────────────────────────────────────────────

const testUsers = [
    {
        username: 'vibecoder-alice',
        profile: {
            username: 'vibecoder-alice',
            name: 'Alice Chen',
            role: 'Frontend Engineer',
            bio: 'Crafting interfaces that feel alive. React, Three.js, creative coding.',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
            plan: 'pro',
            created_at: '2026-01-15T10:00:00Z',
            updated_at: '2026-02-13T10:00:00Z',
        },
        showcases: [
            {
                slug: 'particle-playground',
                title: 'Particle Playground',
                description: 'Interactive WebGL particle system with physics simulation',
                url: 'https://particles.alice.dev',
                source_url: 'https://github.com/alice/particle-playground',
                post_url: 'https://dev.to/alice/building-a-particle-system',
                tags: ['three.js', 'webgl', 'creative'],
                status: 'published',
            },
            {
                slug: 'vibe-dashboard',
                title: 'Vibe Dashboard',
                description: 'Real-time analytics dashboard with animated charts',
                url: 'https://dashboard.alice.dev',
                source_url: 'https://github.com/alice/vibe-dashboard',
                post_url: '',
                tags: ['react', 'charts', 'real-time'],
                status: 'published',
            },
            {
                slug: 'css-art-gallery',
                title: 'CSS Art Gallery',
                description: 'Pure CSS illustrations — no JavaScript, no images',
                url: 'https://cssart.alice.dev',
                source_url: 'https://github.com/alice/css-art',
                post_url: 'https://alice.dev/blog/css-art',
                tags: ['css', 'art', 'creative'],
                status: 'published',
            },
        ],
    },
    {
        username: 'vibecoder-bob',
        profile: {
            username: 'vibecoder-bob',
            name: 'Bob Martinez',
            role: 'Full Stack Builder',
            bio: 'Ship fast, learn faster. Next.js, Rust, open source.',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
            plan: 'free',
            created_at: '2026-02-01T10:00:00Z',
            updated_at: '2026-02-13T10:00:00Z',
        },
        showcases: [
            {
                slug: 'cli-toolkit',
                title: 'CLI Toolkit',
                description: 'Beautiful terminal UIs for Node.js applications',
                url: 'https://cli-toolkit.bob.dev',
                source_url: 'https://github.com/bob/cli-toolkit',
                post_url: '',
                tags: ['cli', 'node', 'terminal'],
                status: 'published',
            },
            {
                slug: 'api-gateway',
                title: 'API Gateway',
                description: 'Lightweight API gateway with rate limiting and caching',
                url: 'https://gateway.bob.dev',
                source_url: 'https://github.com/bob/api-gateway',
                post_url: 'https://bob.dev/posts/building-api-gateway',
                tags: ['rust', 'api', 'backend'],
                status: 'published',
            },
        ],
    },
    {
        username: 'vibecoder-carol',
        profile: {
            username: 'vibecoder-carol',
            name: 'Carol Nakamura',
            role: 'Design Engineer',
            bio: 'Where design meets code. Figma to production, pixel perfect.',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
            plan: 'pro',
            created_at: '2026-01-20T10:00:00Z',
            updated_at: '2026-02-13T10:00:00Z',
        },
        showcases: [
            {
                slug: 'design-system',
                title: 'Vibe Design System',
                description: 'Component library with dark mode, animations, and accessibility',
                url: 'https://ds.carol.dev',
                source_url: 'https://github.com/carol/vibe-ds',
                post_url: 'https://carol.dev/blog/design-system',
                tags: ['design-system', 'react', 'accessibility'],
                status: 'published',
            },
            {
                slug: 'micro-animations',
                title: 'Micro Animations',
                description: 'Collection of 50+ subtle UI animations you can copy-paste',
                url: 'https://anims.carol.dev',
                source_url: 'https://github.com/carol/micro-animations',
                post_url: '',
                tags: ['animation', 'css', 'framer-motion'],
                status: 'published',
            },
            {
                slug: 'color-palette-ai',
                title: 'Color Palette AI',
                description: 'AI-powered color palette generator trained on top designs',
                url: 'https://colors.carol.dev',
                source_url: '',
                post_url: 'https://carol.dev/blog/color-ai',
                tags: ['ai', 'color', 'design'],
                status: 'published',
            },
            {
                slug: 'portfolio-template',
                title: 'Portfolio Template',
                description: 'Minimal developer portfolio template with vibe colors',
                url: 'https://template.carol.dev',
                source_url: 'https://github.com/carol/portfolio-template',
                post_url: '',
                tags: ['template', 'portfolio', 'nextjs'],
                status: 'draft',
            },
        ],
    },
];

// ─── Seed ────────────────────────────────────────────────────

async function seed() {
    console.log(`\n🌱 Seeding data into ${REPO}...\n`);

    const registryUsers = [];

    for (const user of testUsers) {
        const branch = `user/${user.username}`;
        console.log(`👤 ${user.profile.name} (${branch})`);

        // Create branch
        const exists = await branchExists(branch);
        if (!exists) {
            await createOrphanBranch(branch);
            console.log(`  ✓ Branch created`);
        } else {
            console.log(`  ○ Branch exists`);
        }

        // Write profile
        await writeFile('profile.json', branch, user.profile, `Seed profile: ${user.profile.name}`);
        console.log(`  ✓ profile.json`);

        // Write showcases
        let publishedCount = 0;
        for (const sc of user.showcases) {
            const now = new Date().toISOString();
            const showcase = {
                ...sc,
                preview_image_url: '',
                col_span: 2,
                sort_order: user.showcases.indexOf(sc),
                clicks_count: Math.floor(Math.random() * 200),
                views_count: Math.floor(Math.random() * 1000),
                created_at: user.profile.created_at,
                updated_at: now,
            };
            await writeFile(`showcases/${sc.slug}.json`, branch, showcase, `Seed: ${sc.title}`);
            console.log(`  ✓ showcases/${sc.slug}.json`);
            if (sc.status === 'published') publishedCount++;
        }

        registryUsers.push({
            username: user.username,
            name: user.profile.name,
            avatar_url: user.profile.avatar_url,
            showcase_count: publishedCount,
        });
    }

    // Update registry
    console.log(`\n📋 Updating registry...`);
    
    // Read existing registry first
    const regRes = await fetch(
        `${API}/repos/${OWNER}/${NAME}/contents/users.json?ref=registry`,
        { headers }
    );
    let regSha;
    let existingUsers = [];
    if (regRes.ok) {
        const regData = await regRes.json();
        regSha = regData.sha;
        try {
            const existing = JSON.parse(Buffer.from(regData.content, 'base64').toString());
            existingUsers = existing.users || [];
        } catch {}
    }

    // Merge — keep existing users, add/update seed users
    const mergedUsers = [...existingUsers.filter(u => !registryUsers.find(r => r.username === u.username)), ...registryUsers];

    const registry = {
        users: mergedUsers,
        updated_at: new Date().toISOString(),
    };

    const body = {
        message: 'Seed registry with test users',
        content: Buffer.from(JSON.stringify(registry, null, 2)).toString('base64'),
        branch: 'registry',
    };
    if (regSha) body.sha = regSha;

    const writeRes = await fetch(`${API}/repos/${OWNER}/${NAME}/contents/users.json`, {
        method: 'PUT', headers, body: JSON.stringify(body),
    });
    if (writeRes.ok) console.log(`  ✓ registry updated (${mergedUsers.length} users)`);
    else console.error(`  ✗ registry update failed:`, await writeRes.text());

    console.log(`\n✅ Seed complete!\n`);
}

seed().catch(console.error);
