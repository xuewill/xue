<script lang="ts">
  import { WeBaseLink } from '@webaseui/svelte';
  import BlogList from '$lib/components/blog/BlogList.svelte';
  import Seo from '$lib/components/layout/Seo.svelte';
  import { site as siteConfig } from '$lib/generated/content/index.js';

  let { data } = $props();
</script>

<Seo title={siteConfig.pages.blog.title} description={siteConfig.pages.blog.description} path="/blog" />

<main class="page listing-page">
  <header class="listing-header">
    <h1 class="section-label">{siteConfig.pages.blog.title}</h1>
    <WeBaseLink variant="action" href="/blog/tags" label="Browse topics" icon="arrow-right" />
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

</style>
