<script lang="ts">
  import { siteConfig } from '$lib/config/site';

  let { data } = $props();
  const Content = $derived(data.post.component);
</script>

<svelte:head>
  <title>{data.post.title} — {siteConfig.title}</title>
  <meta name="description" content={data.post.description} />
  <meta property="og:title" content={data.post.title} />
  <meta property="og:description" content={data.post.description} />
  {#if data.post.cover}<meta property="og:image" content={`${siteConfig.url}${data.post.cover}`} />{/if}
  <link rel="canonical" href={`${siteConfig.url}/blog/${data.post.slug}`} />
</svelte:head>

<main class="page article-page">
  <a class="back-link" href="/blog">← all posts</a>
  <article>
    <header class="article-header">
      <h1>{data.post.title}</h1>
      <p class="article-meta">
        <time datetime={data.post.date}>{data.post.date}</time>
        <span aria-hidden="true">·</span>
        <span>{data.post.tags.join(' / ')}</span>
      </p>
      <p class="article-description">{data.post.description}</p>
    </header>
    <div class="prose"><Content /></div>
  </article>
</main>
