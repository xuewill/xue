<script lang="ts">
  import { WeBaseBadge, WeBaseLink } from '@webaseui/svelte';
  import Seo from '$lib/components/layout/Seo.svelte';

  let { data } = $props();
</script>

<Seo
  title="Blog topics"
  description="Browse writing by engineering, design, art, field notes, publishing, and reference topics."
  path="/blog/tags"
/>

<main class="page listing-page tag-index-page">
  <WeBaseLink class="back-link" variant="back" href="/blog" label="all posts" />
  <h1 class="section-label">Blog topics</h1>
  <div class="tag-index">
    {#each data.tags as tag (tag.slug)}
      <a class="tag-entry" href={`/blog/tags/${tag.slug}`}>
        <span class="tag-entry-heading">
          <strong>{tag.label}</strong>
          <WeBaseBadge label={tag.count.toString().padStart(2, '0')} />
        </span>
        <span class="tag-description">{tag.description}</span>
      </a>
    {/each}
  </div>
</main>

<style>
  .tag-index {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 clamp(28px, 5vw, 72px);
    background-image: var(--webase-dot-rule-image);
    background-position: left top;
    background-repeat: repeat-x;
    background-size: 7px 2px;
  }

  .tag-entry {
    display: flex;
    min-height: 150px;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
    padding: 24px 0;
    background-image: var(--webase-dot-rule-image);
    background-position: left bottom;
    background-repeat: repeat-x;
    background-size: 7px 2px;
  }

  .tag-entry-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
  }

  .tag-entry strong {
    color: var(--webase-color-ink);
    font-size: clamp(23px, 3vw, 30px);
    font-weight: 500;
    transition: color var(--webase-duration-ui) var(--webase-ease-out);
  }

  .tag-description {
    max-width: 440px;
    color: var(--webase-color-ink-muted);
    font-size: 15px;
    line-height: 1.55;
  }

  .tag-entry:hover strong {
    color: var(--webase-color-brand);
  }

  @media (max-width: 680px) {
    .tag-index {
      grid-template-columns: 1fr;
    }
  }
</style>
