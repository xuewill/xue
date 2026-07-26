<script lang="ts">
  import AlbumWall from '$lib/components/album/AlbumWall.svelte';
  import Seo from '$lib/components/layout/Seo.svelte';
  import { albumPhotos } from '$lib/content/album';
  import { siteConfig } from '$lib/config/site';
</script>

<Seo title="Album" description={`Photography and visual notes by ${siteConfig.author.name}`} path="/album" />

<main class="page listing-page album-page">
  <header class="album-header">
    <h1 class="section-label">Album</h1>
    <span>{albumPhotos.length.toString().padStart(2, '0')} frames</span>
  </header>
  <AlbumWall photos={albumPhotos} />
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

  .album-header > span {
    color: var(--ink-muted);
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }
</style>
