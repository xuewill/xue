export const siteConfig = {
  title: 'Will Xue',
  description: "tech, art, design, code",
  url: 'https://willxue.com',
  locale: 'en-US',
  author: {
    name: 'Will Xue',
    email: 'willxue@msn.com'
  },
  homeNavigation: [
    { label: 'about', href: '/#about' },
    { label: 'projects', href: '/#projects' }
  ],
  navigation: [
    { label: 'blog', href: '/blog' },
    { label: 'album', href: '/album' }
  ],
  social: [
    {
      label: 'X',
      href: 'https://x.com/fruitsaix',
      icon: '/icons/x.png',
      handle: '@fruitsaix',
      preview: 'profile'
    },
    {
      label: 'GitHub',
      href: 'https://github.com/xuewill',
      icon: '/icons/github.png',
      handle: '@xuewill',
      preview: 'github'
    },
    {
      label: 'Email',
      href: 'mailto:willxue%40msn.com',
      icon: '/icons/mail.png',
      handle: 'willxue@msn.com',
      preview: 'email'
    },
    {
      label: 'RSS',
      href: '/rss.xml',
      icon: '/icons/rss.svg',
      handle: 'RSS feed',
      preview: 'rss'
    }
  ]
} as const;
