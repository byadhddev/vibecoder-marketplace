export interface Profile {
    id: string;
    user_id: string;
    username: string;
    name: string;
    role: string;
    bio: string;
    avatar_url: string;
    plan: 'free' | 'pro';
    created_at: string;
    updated_at: string;
}

export interface Showcase {
    id: string;
    profile_id: string;
    slug: string;
    title: string;
    description: string;
    url: string;
    source_url: string;
    post_url: string;
    preview_image_url: string;
    tags: string[];
    col_span: 1 | 2;
    status: 'published' | 'draft' | 'archived';
    sort_order: number;
    clicks_count: number;
    views_count: number;
    created_at: string;
    updated_at: string;
}

export interface ShowcaseInput {
    title: string;
    description: string;
    url: string;
    source_url?: string;
    post_url?: string;
    preview_image_url?: string;
    tags?: string[];
    col_span?: 1 | 2;
    status?: 'published' | 'draft' | 'archived';
    sort_order?: number;
}

export interface PublicMarketplace {
    profile: Profile;
    showcases: Showcase[];
}
