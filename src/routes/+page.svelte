<script lang="ts">
  import AboutSection from '$lib/components/home/AboutSection.svelte';
  import HeroSketchbook from '$lib/components/home/HeroSketchbook.svelte';
  import ProjectGrid from '$lib/components/home/ProjectGrid.svelte';
  import Seo from '$lib/components/layout/Seo.svelte';
  import { home as homeConfig, site as siteConfig } from '$lib/generated/content/index.js';

  let { data } = $props();

  const personId = new URL('/#person', siteConfig.url).toString();
  const websiteId = new URL('/#website', siteConfig.url).toString();
  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: siteConfig.author.name,
        url: siteConfig.url,
        image: new URL(siteConfig.author.portraitImage.src, siteConfig.url).toString(),
        sameAs: siteConfig.social
          .map((item) => item.href)
          .filter((href) => href.startsWith('https://'))
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: siteConfig.url,
        name: siteConfig.title,
        description: siteConfig.description,
        inLanguage: siteConfig.locale,
        author: { '@id': personId }
      }
    ]
  };
</script>

<Seo jsonLd={homeJsonLd} />

<main class="page home">
  <HeroSketchbook
    kicker={homeConfig.hero.kicker}
    title={homeConfig.hero.title}
    images={homeConfig.hero.images}
  />
  <AboutSection
    body={homeConfig.about.body}
    portrait={siteConfig.author.portraitImage}
    portraitAlt={homeConfig.about.portraitAlt}
  />
  <ProjectGrid heading={homeConfig.projects.heading} projects={data.projects} />
</main>
