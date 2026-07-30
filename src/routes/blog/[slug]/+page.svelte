<script lang="ts">
  import ArticleToc from '$lib/components/article/ArticleToc.svelte';
  import ContentRelations from '$lib/components/article/ContentRelations.svelte';
  import Seo from '$lib/components/layout/Seo.svelte';
  import { site as siteConfig } from '$lib/generated/content/index.js';

  let { data } = $props();

  const articleJsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.post.title,
    description: data.post.description,
    url: new URL(`/blog/${data.post.slug}`, siteConfig.url).toString(),
    mainEntityOfPage: new URL(`/blog/${data.post.slug}`, siteConfig.url).toString(),
    image: new URL(data.post.ogImage, siteConfig.url).toString(),
    datePublished: data.post.date,
    dateModified: data.post.updated ?? data.post.date,
    inLanguage: siteConfig.locale,
    keywords: data.tags.map((tag) => tag.label),
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.url
    }
  });
</script>

<Seo
  title={data.post.title}
  description={data.post.description}
  path={`/blog/${data.post.slug}`}
  image={data.post.ogImage}
  type="article"
  jsonLd={articleJsonLd}
/>

<main class="page article-page">
  <a class="back-link" href="/blog">← all posts</a>
  <div class="article-layout">
    {#key data.post.slug}
      <ArticleToc headings={data.post.toc} />
    {/key}
    <article id="article-overview">
      <header class="article-header">
        <h1>{data.post.title}</h1>
        <p class="article-meta">
          <time datetime={data.post.date}>{data.post.date}</time>
          {#if data.post.updated}
            <span aria-hidden="true">·</span>
            <span>Updated <time datetime={data.post.updated}>{data.post.updated}</time></span>
          {/if}
          <span aria-hidden="true">·</span>
          <span class="article-tags">
            {#each data.tags as tag, index (tag.slug)}
              {#if index > 0}<span aria-hidden="true"> / </span>{/if}
              <a href={`/blog/tags/${tag.slug}`}>{tag.label}</a>
            {/each}
          </span>
        </p>
        <p class="article-description">{data.post.description}</p>
      </header>
      <div class="prose">{@html data.post.content}</div>

      <ContentRelations
        currentSlug={data.post.slug}
        seriesTitle={data.post.series?.title}
        seriesPosts={data.seriesPosts}
        posts={data.relatedPosts}
        projects={data.relatedProjects}
        album={data.relatedAlbum}
      />

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
