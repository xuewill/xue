<script lang="ts">
  import BlogList from '$lib/components/blog/BlogList.svelte';
  import Seo from '$lib/components/layout/Seo.svelte';

  let { data } = $props();
</script>

<Seo
  title={`${data.tag.label} articles`}
  description={data.tag.description}
  path={`/blog/tags/${data.tag.slug}`}
/>

<main class="page listing-page tag-page">
  <a class="back-link" href="/blog/tags">← all topics</a>
  <header class="tag-header">
    <div>
      <p>Topic</p>
      <h1>{data.tag.label}</h1>
    </div>
    <span>{data.tag.count.toString().padStart(2, '0')} posts</span>
  </header>
  <p class="tag-introduction">{data.tag.description}</p>
  <BlogList posts={data.posts} />
</main>

<style>
  .tag-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 24px;
  }

  .tag-header p,
  .tag-header h1,
  .tag-introduction {
    margin: 0;
  }

  .tag-header p,
  .tag-header > span {
    color: var(--brand);
    font-family: var(--sans);
    font-size: 10px;
    letter-spacing: var(--track-caps);
    text-transform: uppercase;
  }

  .tag-header h1 {
    margin-top: 8px;
    font-size: clamp(44px, 8vw, 76px);
    font-weight: 500;
    line-height: 1;
  }

  .tag-header > span {
    color: var(--ink-muted);
  }

  .tag-introduction {
    max-width: 620px;
    margin: 28px 0 clamp(48px, 8vh, 76px);
    color: var(--ink-soft);
    font-size: clamp(17px, 2.2vw, 21px);
    line-height: 1.55;
  }
</style>
