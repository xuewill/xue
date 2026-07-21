export const siteConfig = {
  title: 'Will Xue',
  description: "tech, art, design, code",
  url: 'https://willxue.com',
  locale: 'en-US',
  author: {
    name: 'Will Xue',
    email: 'willxue@msn.com'
  },
  workNavigation: [
    { label: 'about', href: '/#about' },
    { label: 'projects', href: '/#projects' }
  ],
  navigation: [
    { label: 'blog', href: '/blog' }
  ],
  social: [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/willxue/',
      icon: '/icons/instagram.png'
    },
    { label: 'X', href: 'https://x.com/fruitsaix', icon: '/icons/x.png' },
    { label: 'Email', href: 'mailto:willxue@msn.com', icon: '/icons/mail.png' }
  ]
} as const;
