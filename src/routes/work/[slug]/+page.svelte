<script lang="ts">
  import ArticleToc from '$lib/components/article/ArticleToc.svelte';
  import { siteConfig } from '$lib/config/site';

  let { data } = $props();
  const Content = $derived(data.project.component);
</script>

<svelte:head>
  <title>{data.project.title} — {siteConfig.title}</title>
  <meta name="description" content={data.project.description} />
  <meta property="og:image" content={`${siteConfig.url}${data.project.cover}`} />
  <link rel="canonical" href={`${siteConfig.url}/work/${data.project.slug}`} />
</svelte:head>

<main class="page article-page project-page">
  <a class="back-link" href="/#projects">← all projects</a>
  <div class="article-layout">
    {#key data.project.slug}
      <ArticleToc />
    {/key}
    <article id="article-overview">
      <header class="article-header">
        <h1>{data.project.title}</h1>
        <p class="article-meta">
          <span>{data.project.year}</span>
          <span aria-hidden="true">·</span>
          <span>{data.project.category}</span>
        </p>
        <p class="article-description">{data.project.description}</p>
      </header>
      <div class="prose"><Content /></div>
    </article>
  </div>
</main>
