<script lang="ts">
  import BlogList from '$lib/components/blog/BlogList.svelte';
  import Seo from '$lib/components/layout/Seo.svelte';
  import { siteConfig } from '$lib/config/site';

  let { data } = $props();
</script>

<Seo title="Blog" description={`Writing by ${siteConfig.author.name}`} path="/blog" />

<main class="page listing-page">
  <h1 class="section-label">Blog</h1>
  <BlogList posts={data.posts} />
</main>
