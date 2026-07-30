import { env } from '$env/dynamic/private';
import { site as siteConfig } from '$lib/generated/content/index.js';
import {
  fallbackSocialData,
  type GitHubSnapshot,
  type SocialData,
  type XSnapshot
} from '$lib/types/social';

const CONTRIBUTION_DAYS = 26 * 7;

interface GitHubProfileResponse {
  followers?: unknown;
}

interface GitHubContributionsResponse {
  total?: { lastYear?: unknown };
  contributions?: Array<{ level?: unknown }>;
}

interface XProfileResponse {
  data?: {
    name?: unknown;
    username?: unknown;
    description?: unknown;
    profile_image_url?: unknown;
    public_metrics?: {
      followers_count?: unknown;
      following_count?: unknown;
    };
  };
}

let socialDataRequest: Promise<SocialData> | undefined;

function optionalNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

async function fetchJson<T>(
  fetcher: typeof fetch,
  url: string,
  headers: Record<string, string> = {}
): Promise<T> {
  const response = await fetcher(url, {
    headers,
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function getGitHub(fetcher: typeof fetch): Promise<GitHubSnapshot> {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'user-agent': new URL(siteConfig.url).hostname
  };

  if (env.GITHUB_TOKEN) {
    headers.authorization = `Bearer ${env.GITHUB_TOKEN}`;
  }

  const [profileResult, contributionsResult] = await Promise.allSettled([
    fetchJson<GitHubProfileResponse>(
      fetcher,
      `https://api.github.com/users/${fallbackSocialData.github.username}`,
      headers
    ),
    fetchJson<GitHubContributionsResponse>(
      fetcher,
      `https://github-contributions-api.jogruber.de/v4/${fallbackSocialData.github.username}?y=last`
    )
  ]);

  const followers =
    profileResult.status === 'fulfilled'
      ? optionalNumber(profileResult.value.followers)
      : fallbackSocialData.github.followers;

  let totalContributions = fallbackSocialData.github.totalContributions;
  let levels = fallbackSocialData.github.levels;
  let contributionsLive = false;

  if (contributionsResult.status === 'fulfilled') {
    const contributionData = contributionsResult.value;
    const rawLevels = contributionData.contributions;

    if (Array.isArray(rawLevels) && rawLevels.length > 0) {
      const recentLevels = rawLevels.slice(-CONTRIBUTION_DAYS).map(({ level }) => {
        const numericLevel = optionalNumber(level);
        return numericLevel === null ? 0 : Math.min(4, Math.max(0, Math.round(numericLevel)));
      });

      levels = [...Array(CONTRIBUTION_DAYS - recentLevels.length).fill(0), ...recentLevels];
      totalContributions =
        optionalNumber(contributionData.total?.lastYear) ??
        fallbackSocialData.github.totalContributions;
      contributionsLive = true;
    }
  }

  const liveSources = Number(profileResult.status === 'fulfilled' && followers !== null) + Number(contributionsLive);

  return {
    username: fallbackSocialData.github.username,
    followers,
    totalContributions,
    levels,
    source: liveSources === 2 ? 'live' : liveSources === 1 ? 'partial' : 'fallback'
  };
}

async function getX(fetcher: typeof fetch): Promise<XSnapshot> {
  if (!env.X_BEARER_TOKEN) {
    return fallbackSocialData.x;
  }

  try {
    const response = await fetchJson<XProfileResponse>(
      fetcher,
      `https://api.x.com/2/users/by/username/${fallbackSocialData.x.username}?user.fields=description,profile_image_url,public_metrics`,
      { authorization: `Bearer ${env.X_BEARER_TOKEN}` }
    );
    const profile = response.data;

    if (!profile || typeof profile.username !== 'string') {
      return fallbackSocialData.x;
    }

    return {
      name: typeof profile.name === 'string' ? profile.name : fallbackSocialData.x.name,
      username: profile.username,
      bio: typeof profile.description === 'string' ? profile.description : fallbackSocialData.x.bio,
      avatarUrl:
        typeof profile.profile_image_url === 'string'
          ? profile.profile_image_url
          : fallbackSocialData.x.avatarUrl,
      followers: optionalNumber(profile.public_metrics?.followers_count),
      following: optionalNumber(profile.public_metrics?.following_count),
      source: 'live'
    };
  } catch {
    return fallbackSocialData.x;
  }
}

export function getSocialData(fetcher: typeof fetch): Promise<SocialData> {
  socialDataRequest ??= Promise.all([getX(fetcher), getGitHub(fetcher)]).then(([x, github]) => ({
    x,
    github
  }));

  return socialDataRequest;
}
