import { site as siteConfig } from '$lib/generated/content/index.js';

export type SocialDataSource = 'live' | 'partial' | 'fallback';

export interface XSnapshot {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  followers: number | null;
  following: number | null;
  source: SocialDataSource;
}

export interface GitHubSnapshot {
  username: string;
  followers: number | null;
  totalContributions: number | null;
  levels: number[];
  source: SocialDataSource;
}

export interface SocialData {
  x: XSnapshot;
  github: GitHubSnapshot;
}

export const fallbackSocialData: SocialData = {
  x: {
    ...siteConfig.socialFallback.x,
    source: 'fallback'
  },
  github: {
    ...siteConfig.socialFallback.github,
    source: 'fallback'
  }
};
