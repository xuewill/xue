<script lang="ts">
  import type {
    AlbumPhotoSummary,
    PostSummary,
    ProjectSummary
  } from '$lib/types/content';

  interface Props {
    currentSlug?: string;
    seriesTitle?: string;
    seriesPosts?: PostSummary[];
    posts?: PostSummary[];
    projects?: ProjectSummary[];
    album?: AlbumPhotoSummary[];
  }

  let {
    currentSlug,
    seriesTitle,
    seriesPosts = [],
    posts = [],
    projects = [],
    album = []
  }: Props = $props();

  const hasRelations = $derived(
    seriesPosts.length > 0 || posts.length > 0 || projects.length > 0 || album.length > 0
  );
</script>

{#if hasRelations}
  <aside class="content-relations" aria-label="Related content">
    {#if seriesTitle && seriesPosts.length > 0}
      <section class="relation-group relation-series" aria-labelledby="relation-series-title">
        <p class="relation-label">Series</p>
        <h2 id="relation-series-title">{seriesTitle}</h2>
        <ol>
          {#each seriesPosts as item (item.slug)}
            <li data-current={item.slug === currentSlug ? '' : undefined}>
              <span>Part {item.series?.order?.toString().padStart(2, '0')}</span>
              {#if item.slug === currentSlug}
                <strong aria-current="page">{item.title}</strong>
              {:else}
                <a href={`/blog/${item.slug}`}>{item.title}</a>
              {/if}
            </li>
          {/each}
        </ol>
      </section>
    {/if}

    {#if posts.length > 0}
      <section class="relation-group" aria-labelledby="relation-posts-title">
        <p class="relation-label">Continue reading</p>
        <h2 id="relation-posts-title">Related notes</h2>
        <ul class="relation-links">
          {#each posts as item (item.slug)}
            <li>
              <a href={`/blog/${item.slug}`}>
                <span>{item.title}</span>
                <time datetime={item.date}>{item.date}</time>
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if projects.length > 0}
      <section class="relation-group" aria-labelledby="relation-projects-title">
        <p class="relation-label">Connected work</p>
        <h2 id="relation-projects-title">Projects</h2>
        <ul class="relation-links">
          {#each projects as item (item.slug)}
            <li>
              <a href={`/home/${item.slug}`}>
                <span>{item.title}</span>
                <small>{item.year} / {item.category}</small>
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if album.length > 0}
      <section class="relation-group relation-album" aria-labelledby="relation-album-title">
        <p class="relation-label">From the Album</p>
        <h2 id="relation-album-title">Related works</h2>
        <div class="relation-images">
          {#each album as photo (photo.id)}
            <a href={`/album#photo-${photo.id}`} aria-label={`View in Album: ${photo.alt}`}>
              <img
                src={photo.thumbnail.src}
                srcset={photo.thumbnail.srcset}
                sizes="112px"
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
              />
            </a>
          {/each}
        </div>
      </section>
    {/if}
  </aside>
{/if}

<style>
  .content-relations {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: clamp(34px, 5vw, 52px);
    margin-top: clamp(64px, 10vh, 108px);
    padding-top: clamp(28px, 4vw, 42px);
    background-image: var(--dot-rule-image);
    background-position: left top;
    background-repeat: repeat-x;
    background-size: 7px 2px;
  }

  .relation-group {
    min-width: 0;
  }

  .relation-group h2,
  .relation-label {
    margin: 0;
  }

  .relation-label {
    color: var(--brand);
    font-family: var(--sans);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: var(--track-caps);
    text-transform: uppercase;
  }

  .relation-group h2 {
    margin-top: 8px;
    color: var(--ink);
    font-size: clamp(22px, 3vw, 28px);
    font-weight: 500;
  }

  .relation-series ol,
  .relation-links {
    margin: 20px 0 0;
    padding: 0;
    list-style: none;
  }

  .relation-series li,
  .relation-links li {
    background-image: var(--dot-rule-image);
    background-position: left bottom;
    background-repeat: repeat-x;
    background-size: 7px 2px;
  }

  .relation-series li {
    display: grid;
    grid-template-columns: 6.5em minmax(0, 1fr);
    gap: 16px;
    padding: 14px 0;
  }

  .relation-series li > span,
  .relation-links time,
  .relation-links small {
    color: var(--ink-muted);
    font-family: var(--sans);
    font-size: 10px;
    font-weight: 400;
    letter-spacing: var(--track-nav);
    text-transform: uppercase;
  }

  .relation-series strong {
    color: var(--ink-muted);
    font-weight: 500;
  }

  .relation-series a,
  .relation-links a {
    transition: color var(--duration-ui) var(--ease-out);
  }

  .relation-series a:hover,
  .relation-links a:hover {
    color: var(--brand);
  }

  .relation-links a {
    display: flex;
    min-height: 52px;
    align-items: baseline;
    justify-content: space-between;
    gap: 20px;
    padding: 14px 0;
  }

  .relation-links a > span {
    color: var(--ink);
    font-size: 17px;
  }

  .relation-links time,
  .relation-links small {
    flex: none;
  }

  .relation-images {
    display: flex;
    overflow-x: auto;
    gap: 10px;
    margin-top: 20px;
    padding: 2px 2px 10px;
    scrollbar-width: thin;
  }

  .relation-images a {
    width: 112px;
    flex: 0 0 112px;
    overflow: hidden;
    border: 1px solid var(--hairline);
    border-radius: 3px;
    background: var(--surface);
    aspect-ratio: 4 / 3;
    transition:
      border-color var(--duration-ui) var(--ease-out),
      transform var(--duration-ui) var(--ease-out);
  }

  .relation-images a:hover {
    border-color: var(--brand);
    transform: translateY(-2px);
  }

  .relation-images img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 600px) {
    .relation-series li {
      grid-template-columns: 5.5em minmax(0, 1fr);
      gap: 10px;
    }

    .relation-links a {
      align-items: flex-start;
      flex-direction: column;
      gap: 5px;
    }
  }
</style>
