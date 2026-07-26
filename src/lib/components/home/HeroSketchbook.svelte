<script lang="ts">
  import { onMount } from 'svelte';
  import type { HeroImage } from '$lib/types/content';

  type Direction = 'next' | 'prev';

  interface TurnState {
    id: number;
    dir: Direction;
    from: number;
    to: number;
    dur?: number;
    bell?: number;
  }

  export let kicker: string;
  export let title: string;
  export let images: readonly HeroImage[];

  $: enabledImages = images.filter((image) => image.enabled);
  $: currentIndex = turn ? turn.to : index;
  $: current = enabledImages[currentIndex];

  let index = 0;
  let turn: TurnState | null = null;
  let turnId = 0;
  let intro = false;
  let coarsePointer = false;
  let reducedMotion = false;
  let mounted = false;
  let heroVisible = true;
  let heroElement: HTMLElement;
  let introQueue: Omit<TurnState, 'id' | 'dir'>[] = [];
  let introStep = 0;
  let userInteracted = false;
  let cleanupTimer: number | undefined;

  function buildIntroQueue() {
    const total = Math.max(enabledImages.length - 1, 0);
    return Array.from({ length: total }, (_, step) => {
      const bell = Math.sin(Math.PI * (total <= 1 ? 1 : step / (total - 1)));
      return {
        from: step,
        to: step + 1,
        dur: 0.2 - 0.15 * bell,
        bell
      };
    });
  }

  function beginIntro() {
    if (enabledImages.length < 2 || reducedMotion || userInteracted) return;
    introQueue = buildIntroQueue();
    introStep = 0;
    intro = true;
    turn = { id: ++turnId, dir: 'next', ...introQueue[0] };
  }

  function move(dir: Direction, instant = false) {
    if (enabledImages.length < 2) return;

    userInteracted = true;
    if (cleanupTimer) {
      window.clearTimeout(cleanupTimer);
      cleanupTimer = undefined;
    }
    if (intro) {
      intro = false;
      introQueue = [];
    }

    const base = turn ? turn.to : index;
    const nextIndex =
      dir === 'next'
        ? (base + 1) % enabledImages.length
        : (base - 1 + enabledImages.length) % enabledImages.length;

    if (instant || reducedMotion) {
      index = nextIndex;
      turn = null;
      return;
    }

    if (turn) index = turn.to;

    turn = {
      id: ++turnId,
      dir,
      from: base,
      to: nextIndex
    };
  }

  function finishTurn(event: AnimationEvent) {
    if (event.target !== event.currentTarget || !turn) return;

    const completed = turn;
    index = completed.to;

    if (intro && introStep + 1 < introQueue.length) {
      introStep += 1;
      turn = { id: ++turnId, dir: 'next', ...introQueue[introStep] };
      return;
    }

    intro = false;
    introQueue = [];

    if (coarsePointer) {
      const completedId = completed.id;
      cleanupTimer = window.setTimeout(() => {
        if (turn?.id === completedId) turn = null;
      }, 90);
      return;
    }

    if (turn?.id === completed.id) turn = null;
  }

  function scrollToAbout() {
    document.querySelector('#about')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  function handleKeydown(event: KeyboardEvent) {
    const target = event.target;
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      (target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)))
    ) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move('prev', true);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move('next', true);
    }
  }

  onMount(() => {
    const coarseQuery = window.matchMedia('(max-width: 640px), (pointer: coarse)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    coarsePointer = coarseQuery.matches;
    reducedMotion = motionQuery.matches;
    mounted = true;

    let visibilityObserver: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          heroVisible = entry?.isIntersecting ?? true;
        },
        { threshold: 0.05 }
      );
      visibilityObserver.observe(heroElement);
    }

    const handleMotionPreference = () => {
      reducedMotion = motionQuery.matches;
      if (!reducedMotion) return;

      if (turn) index = turn.to;
      turn = null;
      intro = false;
      introQueue = [];
    };
    motionQuery.addEventListener('change', handleMotionPreference);

    let cancelled = false;
    let decodeTimeout: number | undefined;
    let introTimeout: number | undefined;
    let preloadTimeout: number | undefined;

    const cleanup = () => {
      cancelled = true;
      visibilityObserver?.disconnect();
      motionQuery.removeEventListener('change', handleMotionPreference);
      if (preloadTimeout) window.clearTimeout(preloadTimeout);
      if (decodeTimeout) window.clearTimeout(decodeTimeout);
      if (introTimeout) window.clearTimeout(introTimeout);
      if (cleanupTimer) window.clearTimeout(cleanupTimer);
    };

    if (reducedMotion) {
      index = Math.max(enabledImages.length - 1, 0);
      return cleanup;
    }

    preloadTimeout = window.setTimeout(async () => {
      const decodeImages = [...document.querySelectorAll<HTMLImageElement>('.sb-preload img, .sb-stack img')];
      await Promise.race([
        Promise.allSettled(decodeImages.map((image) => image.decode?.().catch(() => undefined))),
        new Promise<void>((resolve) => {
          decodeTimeout = window.setTimeout(resolve, 1500);
        })
      ]);

      if (cancelled) return;
      introTimeout = window.setTimeout(beginIntro, 200);
    }, 50);

    return cleanup;
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<section
  bind:this={heroElement}
  id="sketchbook"
  class="hero"
  class:is-visible={heroVisible}
  aria-label="Sketchbook"
>
  <p class="hero-kicker">{kicker}</p>
  <h1 class="hero-name">{title}</h1>

  {#if current}
    <div
      class="sb-wrap"
      class:intro
      class:b1={intro && (turn?.bell ?? 0) > 0.25}
      class:b2={intro && (turn?.bell ?? 0) > 0.6}
      style={intro && turn ? `--riffle-dur: ${turn.dur ?? 0.16}s` : undefined}
    >
      <svg width="0" height="0" class="sb-motion-filters" aria-hidden="true">
        <filter id="sb-mblur-1"><feGaussianBlur stdDeviation="5 0"></feGaussianBlur></filter>
        <filter id="sb-mblur-2"><feGaussianBlur stdDeviation="14 0"></feGaussianBlur></filter>
      </svg>

      <div class="sb-stage">
        <button class="sb-arrow left" type="button" aria-label="Previous page" onclick={() => move('prev')}>
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

        <div class="sb-book" style={`aspect-ratio: ${enabledImages[0].width} / ${enabledImages[0].height}`}>
          {#if coarsePointer}
            <div class="sb-full sb-stack">
              {#each enabledImages as image, imageIndex (image.id)}
                <img
                  src={image.src}
                  alt={imageIndex === index ? image.alt : ''}
                  width={image.width}
                  height={image.height}
                  draggable="false"
                  decoding="sync"
                  style:visibility={imageIndex === index ? 'visible' : 'hidden'}
                />
              {/each}
            </div>
          {:else if !turn}
            <div class="sb-full">
              <img
                src={enabledImages[index].src}
                alt={enabledImages[index].alt}
                width={enabledImages[index].width}
                height={enabledImages[index].height}
                draggable="false"
                fetchpriority={index < 2 ? 'high' : 'auto'}
              />
            </div>
          {/if}

          {#if turn}
            {#key turn.id}
              <div class={`sb-half left ${turn.dir === 'next' ? 'sb-out' : 'sb-in'}`}>
                <img
                  class="sb-half-img left"
                  src={enabledImages[turn.dir === 'next' ? turn.from : turn.to].src}
                  alt=""
                  width={enabledImages[turn.dir === 'next' ? turn.from : turn.to].width}
                  height={enabledImages[turn.dir === 'next' ? turn.from : turn.to].height}
                  draggable="false"
                  decoding={coarsePointer ? 'sync' : undefined}
                />
              </div>

              <div class={`sb-half right ${turn.dir === 'next' ? 'sb-in' : 'sb-out'}`}>
                <img
                  class="sb-half-img right"
                  src={enabledImages[turn.dir === 'next' ? turn.to : turn.from].src}
                  alt=""
                  width={enabledImages[turn.dir === 'next' ? turn.to : turn.from].width}
                  height={enabledImages[turn.dir === 'next' ? turn.to : turn.from].height}
                  draggable="false"
                  decoding={coarsePointer ? 'sync' : undefined}
                />
              </div>

              <div class={`sb-flap ${turn.dir}`} onanimationend={finishTurn}>
                <div class="sb-face front">
                  <img
                    class={`sb-half-img ${turn.dir === 'next' ? 'right' : 'left'}`}
                    src={enabledImages[turn.from].src}
                    alt=""
                    width={enabledImages[turn.from].width}
                    height={enabledImages[turn.from].height}
                    draggable="false"
                    decoding={coarsePointer ? 'sync' : undefined}
                  />
                </div>
                <div class="sb-face back">
                  <img
                    class={`sb-half-img ${turn.dir === 'next' ? 'left' : 'right'}`}
                    src={enabledImages[turn.to].src}
                    alt=""
                    width={enabledImages[turn.to].width}
                    height={enabledImages[turn.to].height}
                    draggable="false"
                    decoding={coarsePointer ? 'sync' : undefined}
                  />
                </div>
              </div>
            {/key}
          {/if}

          {#if mounted && !coarsePointer}
            <div class="sb-preload" aria-hidden="true">
              {#each enabledImages as image (image.id)}
                <img src={image.src} alt="" width={image.width} height={image.height} />
              {/each}
            </div>
          {/if}

          <button class="sb-zone sb-prev" type="button" aria-label="Previous page" onclick={() => move('prev')}></button>
          <button class="sb-zone sb-next" type="button" aria-label="Next page" onclick={() => move('next')}></button>
        </div>

        <button class="sb-arrow right" type="button" aria-label="Next page" onclick={() => move('next')}>
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
      </div>

      <div class="sb-captions" aria-live="polite">
        {#if turn}
          <p class="sb-caption cap-out">{enabledImages[turn.from].caption}</p>
        {/if}
        <p class="sb-caption">{current.caption}</p>
      </div>
    </div>
  {/if}

  <button class="hero-down" type="button" aria-label="Scroll to about" onclick={scrollToAbout}>
    <svg viewBox="0 0 44 22" width="34" height="17" fill="none" aria-hidden="true">
      <polyline
        points="3,3 22,11 41,3"
        stroke="currentColor"
        stroke-width="1.1"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></polyline>
      <polyline
        points="3,11 22,19 41,11"
        stroke="currentColor"
        stroke-width="1.1"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></polyline>
    </svg>
  </button>
</section>
