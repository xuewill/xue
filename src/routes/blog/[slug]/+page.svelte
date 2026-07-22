<script lang="ts">
  import ArticleToc from '$lib/components/article/ArticleToc.svelte';
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
  <div class="article-layout">
    {#key data.post.slug}
      <ArticleToc />
    {/key}
    <article id="article-overview">
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

      <footer class="article-footer">
        <a class="article-back-button" href="/blog">
          <span aria-hidden="true">&larr;</span>
          Back to Blog
        </a>

        <nav class="article-nav" aria-label="Article navigation">
          {#if data.previous}
            <a class="article-nav-link" href={`/blog/${data.previous.slug}`}>
              <span class="article-nav-direction"><span aria-hidden="true">&larr;</span> Previous post</span>
              <span class="article-nav-title">{data.previous.title}</span>
            </a>
          {:else}
            <span class="article-nav-placeholder" aria-hidden="true"></span>
          {/if}

          {#if data.next}
            <a class="article-nav-link article-nav-next" href={`/blog/${data.next.slug}`}>
              <span class="article-nav-direction">Next post <span aria-hidden="true">&rarr;</span></span>
              <span class="article-nav-title">{data.next.title}</span>
            </a>
          {:else}
            <span class="article-nav-placeholder" aria-hidden="true"></span>
          {/if}
        </nav>
      </footer>
    </article>
  </div>
</main>
