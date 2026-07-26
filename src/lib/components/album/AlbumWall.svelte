<script lang="ts">
  import { tick } from 'svelte';
  import type { AlbumPhoto } from '$lib/content/album';

  type LightboxState = 'opening' | 'open' | 'closing';
  type NavigationDirection = 'previous' | 'next';
  type TargetRect = { left: number; top: number; width: number; height: number };

  export let photos: readonly AlbumPhoto[];

  let selected: AlbumPhoto | null = null;
  let state: LightboxState = 'opening';
  let target: TargetRect | null = null;
  let returnTransform = 'none';
  let trigger: HTMLButtonElement | null = null;
  let dialog: HTMLDialogElement;
  let closeButton: HTMLButtonElement;
  let closeTimer: number | undefined;

  $: lightboxImageStyle = target
    ? `left:${target.left}px;top:${target.top}px;width:${target.width}px;height:${target.height}px;transform:${
        state === 'open' ? 'none' : returnTransform
      }`
    : undefined;

  $: lightboxMarksStyle = target
    ? `left:${target.left - 10}px;top:${target.top - 10}px;width:${target.width + 20}px;height:${
        target.height + 20
      }px`
    : undefined;

  $: lightboxNavStyle = target
    ? `--image-left:${target.left}px;--image-width:${target.width}px`
    : undefined;

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function targetRect(photo: AlbumPhoto): TargetRect {
    const compact = window.innerWidth <= 720;
    const viewportPadding = compact ? 18 : 32;
    const detailSpace = compact ? 172 : 104;
    const maxWidth = Math.max(1, window.innerWidth - viewportPadding * 2);
    const maxHeight = Math.max(1, window.innerHeight - viewportPadding * 2 - detailSpace);
    const scale = Math.min(maxWidth / photo.width, maxHeight / photo.height, 1);
    const width = Math.round(photo.width * scale);
    const height = Math.round(photo.height * scale);

    return {
      left: Math.round((window.innerWidth - width) / 2),
      top: Math.round((window.innerHeight - detailSpace - height) / 2),
      width,
      height
    };
  }

  function transformFrom(source: DOMRect, destination: TargetRect) {
    const scale = source.width / destination.width;
    const translateX = source.left + source.width / 2 - (destination.left + destination.width / 2);
    const translateY = source.top + source.height / 2 - (destination.top + destination.height / 2);
    return `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  async function openPhoto(event: MouseEvent, photo: AlbumPhoto) {
    if (selected) return;

    trigger = event.currentTarget as HTMLButtonElement;
    const image = trigger.querySelector('img');
    if (!image) return;

    target = targetRect(photo);
    returnTransform = transformFrom(image.getBoundingClientRect(), target);
    selected = photo;
    state = event.detail === 0 || prefersReducedMotion() ? 'open' : 'opening';

    await tick();
    dialog.showModal();
    closeButton?.focus({ preventScroll: true });

    if (state === 'opening') {
      requestAnimationFrame(() => requestAnimationFrame(() => (state = 'open')));
    }
  }

  function findTrigger(photo: AlbumPhoto) {
    return (
      [...document.querySelectorAll<HTMLButtonElement>('.album-trigger')].find(
        (button) => button.dataset.photoId === photo.id
      ) ?? null
    );
  }

  function navigatePhoto(direction: NavigationDirection) {
    if (!selected || !target || state !== 'open' || photos.length < 2) return;

    const currentIndex = photos.findIndex((photo) => photo.id === selected?.id);
    if (currentIndex < 0) return;

    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % photos.length
        : (currentIndex - 1 + photos.length) % photos.length;
    const nextPhoto = photos[nextIndex];
    const nextTrigger = findTrigger(nextPhoto);
    if (!nextTrigger) return;

    selected = nextPhoto;
    trigger = nextTrigger;
    target = targetRect(nextPhoto);
    returnTransform = 'none';
  }

  function finishClose() {
    if (closeTimer) window.clearTimeout(closeTimer);
    dialog.close();
    selected = null;
    target = null;
    state = 'opening';
    trigger?.focus({ preventScroll: true });
    trigger = null;
  }

  function closePhoto(immediate = false) {
    if (!selected || !target) return;

    if (immediate || state === 'opening' || prefersReducedMotion()) {
      finishClose();
      return;
    }

    if (state !== 'open') return;
    const image = trigger?.querySelector('img');
    if (image) returnTransform = transformFrom(image.getBoundingClientRect(), target);
    state = 'closing';
    closeTimer = window.setTimeout(finishClose, 360);
  }

  function handleTransitionEnd(event: TransitionEvent) {
    if (event.propertyName !== 'transform') return;
    if (event.target === event.currentTarget && state === 'closing') finishClose();
  }

  function handleCancel(event: Event) {
    event.preventDefault();
    closePhoto(true);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Tab' && selected) {
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLButtonElement>('button:not([tabindex="-1"]):not([disabled])')
      );
      const first = focusable[0];
      const last = focusable.at(-1);

      if (first && last) {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      return;
    }

    if (event.key === 'ArrowLeft' && selected) {
      event.preventDefault();
      navigatePhoto('previous');
      return;
    }
    if (event.key === 'ArrowRight' && selected) {
      event.preventDefault();
      navigatePhoto('next');
      return;
    }
    if (event.key === 'Escape' && selected) {
      event.preventDefault();
      closePhoto(true);
      return;
    }
  }

  function handleViewportChange() {
    if (!selected || state === 'closing') return;

    const nextTarget = targetRect(selected);
    if (state === 'opening') {
      const image = trigger?.querySelector('img');
      if (image) returnTransform = transformFrom(image.getBoundingClientRect(), nextTarget);
    }
    target = nextTarget;
  }

</script>

<svelte:window onresize={handleViewportChange} />

<div class="album-wall">
  {#each photos as photo, index (photo.id)}
    <article
      class="album-item"
      style={`--enter-delay:${120 + Math.abs(index - (photos.length - 1) / 2) * 45}ms`}
    >
      <button
        type="button"
        class="album-trigger"
        style={`--photo-tilt:${photo.tilt}deg`}
        aria-label={`View image: ${photo.alt}`}
        aria-expanded={selected?.id === photo.id}
        data-photo-id={photo.id}
        data-active={selected?.id === photo.id ? '' : undefined}
        onclick={(event) => openPhoto(event, photo)}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading={index < 4 ? 'eager' : 'lazy'}
          fetchpriority={index < 2 ? 'high' : 'auto'}
          decoding="async"
        />
        <span class="album-corners" aria-hidden="true">
          <span class="album-corner album-corner-tl"></span>
          <span class="album-corner album-corner-tr"></span>
          <span class="album-corner album-corner-bl"></span>
          <span class="album-corner album-corner-br"></span>
        </span>
      </button>
    </article>
  {/each}
</div>

{#if selected && target}
  <dialog
    bind:this={dialog}
    class="album-lightbox"
    data-state={state}
    aria-label={selected.alt}
    oncancel={handleCancel}
    onkeydown={handleKeydown}
  >
    <button
      class="album-lightbox-backdrop"
      type="button"
      tabindex="-1"
      aria-label="Close image"
      onclick={() => closePhoto()}
    ></button>
    {#key selected.id}
      <button
        class="album-lightbox-image"
        type="button"
        tabindex="-1"
        aria-label="Close image"
        style={lightboxImageStyle}
        onclick={() => closePhoto()}
        ontransitionend={handleTransitionEnd}
      >
        <img
          src={selected.src}
          alt={selected.alt}
          width={selected.width}
          height={selected.height}
          draggable="false"
        />
      </button>
    {/key}
    <button
      class="album-lightbox-nav album-lightbox-prev"
      type="button"
      aria-label="Previous image"
      style={lightboxNavStyle}
      onclick={() => navigatePhoto('previous')}
    >
      <svg viewBox="0 0 14 44" width="14" height="44" fill="none" aria-hidden="true">
        <polyline
          points="11,3 3,22 11,41"
          stroke="currentColor"
          stroke-width="1.1"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></polyline>
      </svg>
    </button>
    <button
      class="album-lightbox-nav album-lightbox-next"
      type="button"
      aria-label="Next image"
      style={lightboxNavStyle}
      onclick={() => navigatePhoto('next')}
    >
      <svg viewBox="0 0 14 44" width="14" height="44" fill="none" aria-hidden="true">
        <polyline
          points="3,3 11,22 3,41"
          stroke="currentColor"
          stroke-width="1.1"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></polyline>
      </svg>
    </button>
    <span class="album-lightbox-marks album-corners" style={lightboxMarksStyle} aria-hidden="true">
      <span class="album-corner album-corner-tl"></span>
      <span class="album-corner album-corner-tr"></span>
      <span class="album-corner album-corner-bl"></span>
      <span class="album-corner album-corner-br"></span>
    </span>
    <button
      bind:this={closeButton}
      class="album-lightbox-close"
      type="button"
      aria-label="Close image"
      onclick={() => closePhoto()}
    >
      <span aria-hidden="true">×</span>
    </button>

    <div class="album-details">
      <dl>
        {#each [
          ['Camera', selected.camera],
          ['Lens', selected.lens],
          ['Focal', selected.focalLength],
          ['Aperture', selected.aperture],
          ['Shutter', selected.shutterSpeed],
          ['ISO', selected.iso]
        ] as field, detailIndex (field[0])}
          <div class="album-detail" style={`--detail-index:${detailIndex}`}>
            <dt>{field[0]}</dt>
            <dd>{field[1]}</dd>
          </div>
        {/each}
      </dl>
    </div>
  </dialog>
{/if}

<style>
  .album-wall {
    columns: 4;
    column-gap: 12px;
    margin-top: 28px;
  }

  .album-item {
    break-inside: avoid;
    margin: 0 0 12px;
    animation: album-enter 420ms cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
    animation-delay: var(--enter-delay);
  }

  .album-trigger {
    position: relative;
    display: block;
    width: 100%;
    border: 0;
    padding: 0;
    background: transparent;
    color: var(--ink);
    cursor: zoom-in;
    transform: rotate(var(--photo-tilt));
    transform-origin: center;
    transition:
      transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1),
      filter 220ms ease;
  }

  .album-trigger img {
    width: 100%;
    height: auto;
    border: 1px solid var(--hairline);
    border-radius: 2px;
    background: var(--surface);
    box-shadow: 0 10px 28px rgb(20 20 19 / 7%);
  }

  .album-trigger[data-active] img {
    visibility: hidden;
  }

  .album-corners {
    --corner-arm: 12px;

    pointer-events: none;
    position: relative;
  }

  .album-corner {
    position: absolute;
    width: var(--corner-arm);
    height: var(--corner-arm);
    background:
      var(--dot-rule-image) left top / 7px 2px repeat-x,
      var(--dot-rule-image) left top / 2px 7px repeat-y;
  }

  .album-corner-tl {
    top: 0;
    left: 0;
  }

  .album-corner-tr {
    top: 0;
    right: 0;
    transform: scaleX(-1);
  }

  .album-corner-bl {
    bottom: 0;
    left: 0;
    transform: scaleY(-1);
  }

  .album-corner-br {
    right: 0;
    bottom: 0;
    transform: scale(-1);
  }

  .album-trigger > .album-corners {
    position: absolute;
    inset: 6px;
    opacity: 0;
    transform: scale(1.05);
    transition:
      opacity 150ms ease,
      transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .album-lightbox {
    position: fixed;
    inset: 0;
    z-index: 1000;
    width: 100vw;
    max-width: none;
    height: 100dvh;
    max-height: none;
    margin: 0;
    border: 0;
    padding: 0;
    overflow: hidden;
    background: transparent;
    color: var(--ink);
    outline: none;
  }

  .album-lightbox::backdrop {
    background: transparent;
  }

  .album-lightbox-backdrop {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    padding: 0;
    background: color-mix(in srgb, var(--paper) 95%, transparent);
    cursor: zoom-out;
    opacity: 0;
    transition: opacity 200ms var(--ease-out);
  }

  .album-lightbox[data-state='open'] .album-lightbox-backdrop {
    opacity: 1;
  }

  .album-lightbox-image {
    position: fixed;
    z-index: 1;
    display: block;
    max-width: none;
    border: 0;
    padding: 0;
    border-radius: 2px;
    background: var(--surface);
    object-fit: contain;
    box-shadow: none;
    cursor: zoom-out;
    will-change: transform;
    transition: transform 290ms var(--ease-out);
  }

  .album-lightbox-image::after {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: 0 28px 80px rgb(20 20 19 / 24%);
    content: '';
    opacity: 0;
    pointer-events: none;
    transition: opacity 180ms var(--ease-out);
  }

  .album-lightbox-image img {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    object-fit: contain;
  }

  @keyframes album-lightbox-swap {
    from {
      opacity: 0.58;
    }
    to {
      opacity: 1;
    }
  }

  .album-lightbox[data-state='open'] .album-lightbox-image {
    animation: album-lightbox-swap 220ms ease both;
  }

  .album-lightbox[data-state='open'] .album-lightbox-image::after {
    opacity: 1;
  }

  .album-lightbox-nav {
    position: fixed;
    top: 50%;
    z-index: 4;
    display: grid;
    width: 44px;
    height: 64px;
    margin-top: -32px;
    border: 0;
    padding: 0;
    place-items: center;
    background: transparent;
    color: var(--ink-muted);
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transition:
      color var(--duration-fast) var(--ease-out),
      background-color var(--duration-fast) var(--ease-out),
      opacity var(--duration-fast) var(--ease-out);
  }

  .album-lightbox-prev {
    left: max(8px, calc(var(--image-left) - 56px));
  }

  .album-lightbox-next {
    right: max(8px, calc(100vw - var(--image-left) - var(--image-width) - 56px));
  }

  .album-lightbox[data-state='open'] .album-lightbox-nav {
    opacity: 1;
    pointer-events: auto;
    transition-delay: 120ms;
  }

  .album-lightbox-marks {
    --corner-arm: 11px;

    position: fixed;
    z-index: 2;
    opacity: 0;
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .album-lightbox[data-state='open'] .album-lightbox-marks {
    opacity: 0.58;
    transition-delay: 140ms;
  }

  .album-lightbox-close {
    position: fixed;
    top: 22px;
    right: 24px;
    z-index: 4;
    display: grid;
    width: 44px;
    height: 44px;
    border: 0;
    padding: 0;
    place-items: center;
    background: transparent;
    color: var(--ink-muted);
    cursor: pointer;
    font-family: var(--sans);
    font-size: 20px;
    opacity: 0;
    transition:
      color var(--duration-fast) var(--ease-out),
      opacity var(--duration-fast) var(--ease-out);
  }

  .album-lightbox[data-state='open'] .album-lightbox-close {
    opacity: 1;
    transition-delay: 160ms, 160ms;
  }

  .album-details {
    position: fixed;
    right: 0;
    bottom: calc(18px + env(safe-area-inset-bottom, 0px));
    left: 0;
    z-index: 3;
    width: min(992px, calc(100vw - 48px));
    margin: auto;
    pointer-events: none;
  }

  .album-details dl {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 18px;
    margin: 0;
    padding: 12px 0 0;
    background-image: var(--dot-rule-image);
    background-position: left top;
    background-repeat: repeat-x;
    background-size: 7px 2px;
    font-family: var(--mono);
    font-variant-numeric: tabular-nums;
  }

  .album-detail {
    min-width: 0;
    opacity: 0;
    transform: translateY(8px);
    transition:
      opacity 160ms var(--ease-out) calc(var(--detail-index) * 15ms),
      transform 160ms var(--ease-out) calc(var(--detail-index) * 15ms);
  }

  .album-lightbox[data-state='open'] .album-detail {
    opacity: 1;
    transform: none;
    transition:
      opacity 180ms var(--ease-out) calc(110ms + var(--detail-index) * 30ms),
      transform 200ms var(--ease-out) calc(110ms + var(--detail-index) * 30ms);
  }

  .album-detail dt {
    overflow: hidden;
    color: var(--ink-muted);
    font-family: var(--sans);
    font-size: 10px;
    letter-spacing: 0.09em;
    line-height: 1.2;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .album-detail dd {
    overflow: hidden;
    margin: 5px 0 0;
    color: var(--ink-soft);
    font-size: 12px;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global(html:has(.album-lightbox[open])) {
    overflow: hidden;
  }

  @keyframes album-enter {
    from {
      opacity: 0;
      filter: blur(3px);
      transform: translateY(12px) rotate(-1.5deg);
    }
  }

  @media (hover: hover) and (pointer: fine) {
    .album-lightbox-nav:hover {
      background: color-mix(in srgb, var(--surface) 70%, transparent);
      color: var(--ink);
    }

    .album-lightbox-close:hover {
      color: var(--ink);
    }

    .album-trigger:hover,
    .album-trigger:focus-visible {
      z-index: 2;
      filter: drop-shadow(0 16px 28px rgb(20 20 19 / 13%));
      transform: rotate(0deg) scale(1.018);
    }

    .album-trigger:hover > .album-corners,
    .album-trigger:focus-visible > .album-corners {
      opacity: 0.64;
      transform: none;
    }
  }

  @media (max-width: 900px) {
    .album-wall {
      columns: 3;
    }
  }

  @media (max-width: 600px) {
    .album-wall {
      columns: 2;
      column-gap: 9px;
      margin-top: 22px;
    }

    .album-item {
      margin-bottom: 9px;
    }

    .album-lightbox-close {
      top: 12px;
      right: 10px;
    }

    .album-lightbox-nav {
      width: 44px;
      height: 60px;
      margin-top: -30px;
      color: var(--ink);
      filter: drop-shadow(0 1px 2px var(--paper));
    }

    .album-lightbox-prev svg {
      transform: translateX(-7px);
    }

    .album-lightbox-next svg {
      transform: translateX(7px);
    }

    .album-details {
      bottom: calc(12px + env(safe-area-inset-bottom, 0px));
      width: calc(100vw - 36px);
    }

    .album-details dl {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px 14px;
      padding-top: 9px;
    }

    .album-detail dt {
      font-size: 11px;
    }

    .album-detail dd {
      margin-top: 3px;
      font-size: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .album-item {
      animation: none;
    }

    .album-trigger,
    .album-trigger > .album-corners,
    .album-lightbox-backdrop,
    .album-lightbox-image,
    .album-lightbox-image::after,
    .album-lightbox-nav,
    .album-lightbox-marks,
    .album-lightbox-close,
    .album-detail {
      transition: none;
      animation: none;
    }

    .album-lightbox-image::after {
      opacity: 1;
      transition: opacity 160ms var(--ease-out);
    }

    .album-trigger:hover,
    .album-trigger:focus-visible {
      filter: none;
      transform: rotate(var(--photo-tilt));
    }
  }
</style>
