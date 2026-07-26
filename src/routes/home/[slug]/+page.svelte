<script lang="ts">
  import ArticleToc from '$lib/components/article/ArticleToc.svelte';
  import Seo from '$lib/components/layout/Seo.svelte';

  let { data } = $props();
  const Content = $derived(data.project.component);
</script>

<Seo
  title={data.project.title}
  description={data.project.description}
  path={`/home/${data.project.slug}`}
  image={data.project.cover}
/>

<main class="page article-page project-page">
  <a class="back-link" href="/#projects">← all projects</a>
  <div class="article-layout">
    {#key data.project.slug}
      <ArticleToc headings={data.project.headings} />
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
