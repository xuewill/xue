<script lang="ts">
  import BlogList from '$lib/components/blog/BlogList.svelte';
  import Seo from '$lib/components/layout/Seo.svelte';
  import { site as siteConfig } from '$lib/generated/content/index.js';

  let { data } = $props();
</script>

<Seo title={siteConfig.pages.blog.title} description={siteConfig.pages.blog.description} path="/blog" />

<main class="page listing-page">
  <header class="listing-header">
    <h1 class="section-label">{siteConfig.pages.blog.title}</h1>
    <a href="/blog/tags">Browse topics <span aria-hidden="true">→</span></a>
  </header>
  <BlogList posts={data.posts} />
</main>

<style>
  .listing-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
  }

  .listing-header :global(.section-label) {
    margin-bottom: 0;
  }

  .listing-header a {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    gap: 8px;
    color: var(--ink-muted);
    font-family: var(--sans);
    font-size: 11px;
    letter-spacing: var(--track-nav);
    text-transform: uppercase;
    transition: color var(--duration-ui) var(--ease-out);
  }

  .listing-header a:hover {
    color: var(--brand);
  }
</style>
