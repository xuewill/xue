<script lang="ts">
  import BlogList from '$lib/components/blog/BlogList.svelte';
  import { siteConfig } from '$lib/config/site';

  let { data } = $props();
</script>

<svelte:head>
  <title>Blog — {siteConfig.title}</title>
  <meta name="description" content={`Writing by ${siteConfig.author.name}`} />
  <link rel="canonical" href={`${siteConfig.url}/blog`} />
</svelte:head>

<main class="page listing-page">
  <p class="section-label">Blog</p>
  <BlogList posts={data.posts} />
</main>
