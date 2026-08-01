<script lang="ts">
  import ArticleToc from '$lib/components/article/ArticleToc.svelte';
  import ContentRelations from '$lib/components/article/ContentRelations.svelte';
  import Seo from '$lib/components/layout/Seo.svelte';
  import { site as siteConfig } from '$lib/generated/content/index.js';

  let { data } = $props();

  const projectJsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: data.project.title,
    description: data.project.description,
    url: new URL(`/home/${data.project.slug}`, siteConfig.url).toString(),
    image: new URL(data.project.ogImage, siteConfig.url).toString(),
    dateModified: data.project.updated,
    genre: data.project.category,
    creator: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.url
    }
  });
</script>

<Seo
  title={data.project.title}
  description={data.project.description}
  path={`/home/${data.project.slug}`}
  image={data.project.ogImage}
  type="article"
  jsonLd={projectJsonLd}
/>

<main class="page article-page project-page">
  <a class="back-link" href="/#projects">← all projects</a>
  <div class="article-layout">
    {#key data.project.slug}
      <ArticleToc headings={data.project.toc} />
    {/key}
    <article id="article-overview">
      <header class="article-header">
        <h1>{data.project.title}</h1>
        <p class="article-meta">
          <span>{data.project.year}</span>
          <span aria-hidden="true">·</span>
          <span>{data.project.category}</span>
          {#if data.project.locations.length > 0}
            <span aria-hidden="true">·</span>
            <span>{data.project.locations.map((location) => location.label).join(' / ')}</span>
          {/if}
          {#if data.project.roles.length > 0}
            <span aria-hidden="true">·</span>
            <span>{data.project.roles.map((role) => role.label).join(' / ')}</span>
          {/if}
          {#if data.project.media.length > 0}
            <span aria-hidden="true">·</span>
            <span>{data.project.media.map((item) => item.label).join(' / ')}</span>
          {/if}
          {#if data.project.updated}
            <span aria-hidden="true">·</span>
            <span>Updated <time datetime={data.project.updated}>{data.project.updated}</time></span>
          {/if}
        </p>
        <p class="article-description">{data.project.description}</p>
      </header>
      <div class="prose">{@html data.project.content}</div>
      <ContentRelations posts={data.relatedPosts} album={data.relatedAlbum} />
    </article>
  </div>
</main>
