<script lang="ts">
  import { WeBaseBadge } from '@webaseui/svelte';
  import AlbumWall from '$lib/components/album/AlbumWall.svelte';
  import Seo from '$lib/components/layout/Seo.svelte';
  import { site as siteConfig } from '$lib/generated/content/index.js';

  let { data } = $props();
</script>

<Seo
  title={siteConfig.pages.album.title}
  description={siteConfig.pages.album.description}
  path="/album"
  jsonLd={{
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: siteConfig.pages.album.title,
    description: siteConfig.pages.album.description,
    url: new URL('/album', siteConfig.url).toString(),
    dateModified: data.updated,
    author: { '@type': 'Person', name: siteConfig.author.name }
  }}
/>

<main class="page listing-page album-page">
  <header class="album-header">
    <h1 class="section-label">{siteConfig.pages.album.title}</h1>
    <WeBaseBadge label={`${data.photos.length.toString().padStart(2, '0')} frames`} />
  </header>
  <AlbumWall photos={data.photos} />
</main>

<style>
  .album-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .album-header :global(.section-label) {
    margin-bottom: 0;
  }

</style>
