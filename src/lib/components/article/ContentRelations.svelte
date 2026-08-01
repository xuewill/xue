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

  let albumRail: HTMLDivElement;
  let activeAlbumIndex = $state(0);
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerId: number | null = null;
  let draggingAlbum = false;

  function albumOffset(index: number) {
    if (album.length < 2) return 0;
    const raw = index - activeAlbumIndex;
    const half = album.length / 2;
    return raw > half ? raw - album.length : raw < -half ? raw + album.length : raw;
  }

  function moveAlbum(direction: 'previous' | 'next') {
    if (album.length < 2) return;
    activeAlbumIndex = (activeAlbumIndex + (direction === 'next' ? 1 : -1) + album.length) % album.length;
  }

  function selectAlbum(index: number, event?: MouseEvent) {
    if (draggingAlbum) {
      event?.preventDefault();
      return;
    }
    const offset = albumOffset(index);
    if (offset !== 0) {
      event?.preventDefault();
      activeAlbumIndex = index;
    }
  }

  function handleAlbumKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveAlbum('previous');
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      moveAlbum('next');
    } else if (event.key === 'Home') {
      event.preventDefault();
      activeAlbumIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      activeAlbumIndex = Math.max(0, album.length - 1);
    }
  }

  function handleAlbumPointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    pointerId = event.pointerId;
    draggingAlbum = false;
  }

  function handleAlbumPointerMove(event: PointerEvent) {
    if (pointerId !== event.pointerId) return;
    const distanceX = event.clientX - pointerStartX;
    const distanceY = event.clientY - pointerStartY;

    if (
      !draggingAlbum &&
      Math.abs(distanceX) > 8 &&
      Math.abs(distanceX) > Math.abs(distanceY)
    ) {
      draggingAlbum = true;
      albumRail?.setPointerCapture(event.pointerId);
    }

    if (draggingAlbum) event.preventDefault();
  }

  function handleAlbumPointerUp(event: PointerEvent) {
    if (pointerId !== event.pointerId) return;
    const distance = event.clientX - pointerStartX;
    const didDrag = draggingAlbum;
    if (didDrag && Math.abs(distance) > 36) moveAlbum(distance < 0 ? 'next' : 'previous');
    if (albumRail?.hasPointerCapture(event.pointerId)) albumRail.releasePointerCapture(event.pointerId);
    pointerId = null;
    if (didDrag) {
      window.setTimeout(() => (draggingAlbum = false), 0);
    } else {
      draggingAlbum = false;
    }
  }

  function handleAlbumPointerCancel(event: PointerEvent) {
    if (pointerId !== event.pointerId) return;
    if (albumRail?.hasPointerCapture(event.pointerId)) albumRail.releasePointerCapture(event.pointerId);
    pointerId = null;
    draggingAlbum = false;
  }

  function albumRailGestures(node: HTMLDivElement) {
    albumRail = node;
    node.addEventListener('pointerdown', handleAlbumPointerDown);
    node.addEventListener('pointermove', handleAlbumPointerMove);
    node.addEventListener('pointerup', handleAlbumPointerUp);
    node.addEventListener('pointercancel', handleAlbumPointerCancel);

    return {
      destroy() {
        node.removeEventListener('pointerdown', handleAlbumPointerDown);
        node.removeEventListener('pointermove', handleAlbumPointerMove);
        node.removeEventListener('pointerup', handleAlbumPointerUp);
        node.removeEventListener('pointercancel', handleAlbumPointerCancel);
      }
    };
  }

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
        <div
          class="relation-images"
          use:albumRailGestures
        >
          <div class="relation-images-fade relation-images-fade-left" aria-hidden="true"></div>
          <div class="relation-images-fade relation-images-fade-right" aria-hidden="true"></div>
          {#each album as photo, index (photo.id)}
            {@const offset = albumOffset(index)}
            {@const depth = Math.min(Math.abs(offset), 5)}
            <a
              class:relation-image-active={offset === 0}
              href={`/album#photo-${photo.id}`}
              aria-label={`${offset === 0 ? 'View' : 'Select'} in Album: ${photo.alt}`}
              aria-current={offset === 0 ? 'true' : undefined}
              data-depth={depth}
              draggable="false"
              style={`--relation-direction:${Math.sign(offset)};--relation-depth:${depth}`}
              onclick={(event) => selectAlbum(index, event)}
              onkeydown={handleAlbumKeydown}
            >
              <img
                src={photo.thumbnail.src}
                srcset={photo.thumbnail.srcset}
                sizes="(max-width: 600px) 78vw, (max-width: 1500px) 45vw, 680px"
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
                draggable="false"
              />
            </a>
          {/each}
        </div>
        <div class="relation-album-caption" aria-live="polite">
          <span>{String(activeAlbumIndex + 1).padStart(2, '0')} / {String(album.length).padStart(2, '0')}</span>
          <span>{album[activeAlbumIndex]?.alt}</span>
        </div>
        <nav class="relation-album-progress" aria-label="Choose a related album image">
          {#each album as photo, index (photo.id)}
            <button
              type="button"
              class:active={index === activeAlbumIndex}
              aria-label={`Show related image ${index + 1}`}
              aria-current={index === activeAlbumIndex ? 'true' : undefined}
              onclick={() => (activeAlbumIndex = index)}
            ></button>
          {/each}
        </nav>
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
    position: relative;
    width: 100vw;
    height: clamp(210px, 23vw, 340px);
    overflow: hidden;
    margin-top: 20px;
    margin-left: calc(50% - 50vw);
    touch-action: pan-y;
    cursor: grab;
    outline: none;
    user-select: none;
    -webkit-user-drag: none;
  }

  .relation-images:active {
    cursor: grabbing;
  }

  .relation-images > a {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: calc(10 - var(--relation-depth));
    display: block;
    width: min(40vw, 620px);
    height: clamp(170px, 20vw, 290px);
    overflow: hidden;
    border: 1px solid var(--hairline);
    border-radius: 3px;
    background: var(--surface);
    opacity: var(--relation-opacity, 0.08);
    transform: translate(-50%, -50%) translateX(calc(var(--relation-direction) * var(--relation-distance, min(54vw, 1080px)))) scale(var(--relation-scale, 0.13));
    filter: saturate(var(--relation-saturation, 0.35)) brightness(var(--relation-brightness, 0.9));
    transition:
      border-color var(--duration-ui) var(--ease-out),
      transform 660ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 520ms var(--ease-out),
      filter 520ms var(--ease-out);
    will-change: transform, opacity, filter;
    -webkit-user-drag: none;
  }

  .relation-images > a[data-depth='0'] {
    --relation-distance: 0px;
    --relation-scale: 1;
    --relation-opacity: 1;
    --relation-saturation: 1;
    --relation-brightness: 1;
  }

  .relation-images > a[data-depth='1'] {
    --relation-distance: min(28vw, 440px);
    --relation-scale: 0.62;
    --relation-opacity: 0.52;
    --relation-saturation: 0.58;
    --relation-brightness: 0.88;
  }

  .relation-images > a[data-depth='2'] {
    --relation-distance: min(39vw, 690px);
    --relation-scale: 0.36;
    --relation-opacity: 0.3;
    --relation-saturation: 0.45;
    --relation-brightness: 0.92;
  }

  .relation-images > a[data-depth='3'] {
    --relation-distance: min(45vw, 820px);
    --relation-scale: 0.25;
    --relation-opacity: 0.2;
  }

  .relation-images > a[data-depth='4'] {
    --relation-distance: min(48vw, 920px);
    --relation-scale: 0.18;
    --relation-opacity: 0.13;
  }

  .relation-images > a[data-depth='5'] {
    --relation-distance: min(50vw, 980px);
    --relation-scale: 0.13;
    --relation-opacity: 0.08;
  }

  .relation-images a:hover,
  .relation-images a:focus-visible {
    border-color: var(--brand);
    filter: saturate(0.9) brightness(1);
  }

  .relation-images-fade {
    position: absolute;
    z-index: 20;
    top: 0;
    bottom: 0;
    width: min(17vw, 220px);
    pointer-events: none;
  }

  .relation-images-fade-left {
    left: 0;
    background: linear-gradient(to right, var(--paper), color-mix(in srgb, var(--paper) 78%, transparent) 50%, transparent);
  }

  .relation-images-fade-right {
    right: 0;
    background: linear-gradient(to left, var(--paper), color-mix(in srgb, var(--paper) 78%, transparent) 50%, transparent);
  }

  .relation-images img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
    -webkit-user-drag: none;
  }

  .relation-album-caption {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 12px;
    margin-top: 12px;
    color: var(--ink-muted);
    font-family: var(--sans);
    font-size: 11px;
    text-align: center;
  }

  .relation-album-caption span:first-child {
    flex: none;
    color: var(--brand);
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.08em;
  }

  .relation-album-caption span:last-child {
    max-width: min(560px, 65vw);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .relation-album-progress {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-top: 16px;
  }

  .relation-album-progress button {
    width: 7px;
    height: 7px;
    border: 0;
    padding: 0;
    border-radius: 50%;
    background: var(--hairline-strong);
    cursor: pointer;
    opacity: 0.65;
    transition: transform 180ms var(--ease-out), background-color 180ms var(--ease-out), opacity 180ms var(--ease-out);
  }

  .relation-album-progress button.active {
    background: var(--brand);
    opacity: 1;
    transform: scale(1.5);
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

    .relation-images {
      height: 176px;
      margin-top: 16px;
    }

    .relation-images > a {
      width: min(76vw, 340px);
      height: 142px;
    }

    .relation-images > a[data-depth='1'] {
      --relation-distance: 67vw;
      --relation-scale: 0.52;
    }

    .relation-images > a[data-depth='2'] {
      --relation-distance: 88vw;
      --relation-scale: 0.3;
    }

    .relation-images > a[data-depth='3'],
    .relation-images > a[data-depth='4'],
    .relation-images > a[data-depth='5'] {
      --relation-distance: 102vw;
      --relation-opacity: 0;
    }

    .relation-images-fade {
      width: 13vw;
    }

    .relation-album-caption {
      padding: 0 14px;
      font-size: 10px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .relation-images > a,
    .relation-album-progress button {
      transition: none;
    }
  }
</style>
