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
    name: 'Will Xue',
    username: 'fruitsaix',
    bio: 'Developer, designer, and idealist shaping thoughtful experiences through code and design.',
    avatarUrl: '/headshot.png',
    followers: null,
    following: null,
    source: 'fallback'
  },
  github: {
    username: 'xuewill',
    // Last verified public snapshot; live build data replaces these values when available.
    followers: 14,
    totalContributions: 593,
    levels: [],
    source: 'fallback'
  }
};
