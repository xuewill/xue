import type { HeroImage, TextSegment } from '$lib/types/content';

const heroImages: HeroImage[] = [
  {
    id: 'osaka-castle',
    src: '/home/sketchbook/osaka-castle.png',
    alt: 'Osaka Castle sketch',
    caption: 'Osaka Castle',
    width: 1280,
    height: 720,
    enabled: true
  },
  {
    id: 'shibuya-crossing',
    src: '/home/sketchbook/shibuya-crossing.png',
    alt: 'Shibuya Crossing sketch',
    caption: 'Shibuya Crossing',
    width: 1280,
    height: 720,
    enabled: true
  },
  {
    id: 'tokyo-tower',
    src: '/home/sketchbook/tokyo-tower.png',
    alt: 'Tokyo Tower sketch',
    caption: 'Tokyo Tower',
    width: 1280,
    height: 720,
    enabled: true
  },
  {
    id: 'todai-ji',
    src: '/home/sketchbook/todai-ji.png',
    alt: 'Tōdai-ji sketch',
    caption: 'Tōdai-ji',
    width: 1280,
    height: 720,
    enabled: true
  },
  {
    id: 'gion-kyoto',
    src: '/home/sketchbook/gion-kyoto.png',
    alt: 'Gion, Kyoto sketch',
    caption: 'Gion, Kyoto',
    width: 1280,
    height: 720,
    enabled: true
  },
  {
    id: 'kamakura',
    src: '/home/sketchbook/kamakura.png',
    alt: 'Kamakura sketch',
    caption: 'Kamakura',
    width: 1280,
    height: 720,
    enabled: true
  },
  {
    id: 'taipei',
    src: '/home/sketchbook/taipei.png',
    alt: 'Taipei sketch',
    caption: 'Taipei',
    width: 1280,
    height: 720,
    enabled: true
  },
  {
    id: 'abandoned-car',
    src: '/home/sketchbook/abandoned-car-taipei-street.png',
    alt: 'Abandoned car on a Taipei street sketch',
    caption: 'Abandoned Car, Taipei Street',
    width: 1280,
    height: 720,
    enabled: true
  },
  {
    id: 'stanford',
    src: '/home/sketchbook/stanford.png',
    alt: 'Stanford sketch',
    caption: 'Stanford',
    width: 1280,
    height: 720,
    enabled: true
  }
];

const about: TextSegment[] = [
  {
    text: 'Will is a developer, designer, and idealist who enjoys turning emerging technology into thoughtful, useful experiences. He is drawn to the edges of software, where new tools, ideas, and ways of interacting are still taking shape. His work moves between code and design, guided by curiosity, clarity, and a belief that technology should feel human. Away from the screen, he loves traveling, observing unfamiliar places, and collecting the small details that often become the starting point for his next idea.'
  }
];

export const homeConfig = {
  hero: {
    kicker: 'DESIGNER / ENGINEER / IDEALIST',
    title: 'Will Xue',
    images: heroImages
  },
  about: {
    body: about,
    portrait: '/headshot.png',
    portraitAlt: 'Will Xue'
  },
  projects: {
    heading: 'Projects'
  }
} as const;
