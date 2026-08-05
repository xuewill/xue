<script lang="ts">
  import { onMount } from 'svelte';
  import { observeTheme, oppositeTheme, setTheme, theme } from '$lib/theme';

  const lightFlicker: Keyframe[] = [
    { opacity: 1, offset: 0 },
    { opacity: 1, offset: 0.1 },
    { opacity: 0.3, offset: 0.18 },
    { opacity: 0.92, offset: 0.28 },
    { opacity: 0.12, offset: 0.39 },
    { opacity: 0.72, offset: 0.49 },
    { opacity: 0, offset: 0.62 },
    { opacity: 0.2, offset: 0.76 },
    { opacity: 0, offset: 1 }
  ];

  let busy = false;
  let pulled = false;
  let blackoutElement: HTMLDivElement;

  function wait(milliseconds: number) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  async function animate(
    element: Element,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions
  ) {
    const animation = element.animate(keyframes, { fill: 'forwards', ...options });
    try {
      await animation.finished;
    } catch {
      // A new pull cancels the previous animation and starts from the current theme.
    }
  }

  async function pullCord() {
    if (busy || !blackoutElement) return;
    busy = true;
    const nextTheme = oppositeTheme($theme);
    blackoutElement.getAnimations().forEach((animation) => animation.cancel());

    pulled = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTheme(nextTheme);
      pulled = false;
      busy = false;
      return;
    }

    await wait(180);

    if (nextTheme === 'dark') {
      await animate(blackoutElement, [{ opacity: 0 }, { opacity: 1 }], {
        duration: 160,
        easing: 'ease-in'
      });
      setTheme('dark');
      pulled = false;
      await wait(120);
      await animate(blackoutElement, lightFlicker, { duration: 820, easing: 'linear' });
    } else {
      setTheme('light');
      pulled = false;
      await wait(680);
    }

    busy = false;
  }

  onMount(observeTheme);
</script>

<div class="light-switch-root">
  <div class="room-shade" aria-hidden="true"></div>
  <div class="room-warmth" aria-hidden="true"></div>

  <div class="pendant-root" aria-hidden="true">
    <div class="pendant-sway">
      <div class="pendant-glow"></div>
      <svg class="pendant-svg" width="74" height="188" viewBox="0 0 74 188" fill="none">
        <defs>
          <radialGradient id="webase-bulb-light" cx="0.42" cy="0.35" r="0.72">
            <stop offset="0" stop-color="#fffdf0"></stop>
            <stop offset="0.5" stop-color="#ffedbb"></stop>
            <stop offset="0.84" stop-color="#ffd680"></stop>
            <stop offset="1" stop-color="#efad5a"></stop>
          </radialGradient>
          <linearGradient id="webase-fixture-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"></stop>
            <stop offset="0.42" stop-color="#ffffff" stop-opacity="0.03"></stop>
            <stop offset="1" stop-color="#000000" stop-opacity="0.24"></stop>
          </linearGradient>
        </defs>
        <path class="pendant-wire" d="M37 -4 V62"></path>
        <rect class="pendant-cap" x="33.5" y="57" width="7" height="17" rx="3.5"></rect>
        <rect class="pendant-fixture" x="15" y="69" width="44" height="40" rx="8"></rect>
        <rect
          class="pendant-fixture-sheen"
          x="15"
          y="69"
          width="44"
          height="40"
          rx="8"
          fill="url(#webase-fixture-sheen)"
        ></rect>
        <path class="pendant-vents" d="M26 79 H48 M26 84 H48 M26 89 H48 M26 94 H48"></path>
        <circle class="pendant-bulb" cx="37" cy="129" r="23.5" fill="url(#webase-bulb-light)"></circle>
        <circle class="pendant-bulb-off" cx="37" cy="129" r="23.5"></circle>
        <path class="pendant-glint" d="M22.5 127 A17 17 0 0 1 29 114"></path>
        <rect class="pendant-ring" x="15" y="105" width="44" height="5" rx="2.5"></rect>
      </svg>
    </div>
  </div>

  <div class="cord-sway">
    <button
      class="cord-button"
      class:pulled
      type="button"
      role="switch"
      aria-checked={$theme === 'dark'}
      aria-busy={busy}
      aria-label={$theme === 'dark' ? 'Pull to turn off the light' : 'Pull to turn on the light'}
      title={$theme === 'dark' ? 'Pull to turn off the light' : 'Pull to turn on the light'}
      onclick={pullCord}
    >
      <svg width="32" height="276" viewBox="0 0 32 276" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="webase-pull-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#ffffff" stop-opacity="0.34"></stop>
            <stop offset="0.48" stop-color="#ffffff" stop-opacity="0.03"></stop>
            <stop offset="1" stop-color="#000000" stop-opacity="0.17"></stop>
          </linearGradient>
        </defs>
        <path class="cord-rope" d="M16 -2 V202"></path>
        <rect class="cord-joint" x="12.5" y="198" width="7" height="12" rx="3.5"></rect>
        <path
          class="pull-handle"
          d="M9 210 Q9 205 14 205 H18 Q23 205 23 210 V234 Q23 241 16 244 Q9 241 9 234 Z"
        ></path>
        <path
          class="pull-handle-sheen"
          d="M9 210 Q9 205 14 205 H18 Q23 205 23 210 V234 Q23 241 16 244 Q9 241 9 234 Z"
          fill="url(#webase-pull-sheen)"
        ></path>
        <rect class="pull-accent" x="9" y="212" width="14" height="4" rx="1"></rect>
        <path class="pull-grip" d="M12 226 H20 M12 231 H20 M13 236 H19"></path>
      </svg>
    </button>
  </div>

  <div bind:this={blackoutElement} class="blackout" aria-hidden="true"></div>
</div>

<style>
  .light-switch-root {
    display: contents;
  }

  .room-shade,
  .room-warmth,
  .pendant-root,
  .cord-sway,
  .blackout {
    position: fixed;
  }

  .room-shade,
  .room-warmth {
    inset: 0;
    z-index: 550;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.45s ease;
  }

  .room-shade {
    background: radial-gradient(
      140% 140% at clamp(65px, calc(50% - 515px), 184px) 130px,
      transparent 0%,
      rgb(0 0 0 / 4%) 22%,
      rgb(0 0 0 / 14%) 46%,
      rgb(0 0 0 / 28%) 72%,
      rgb(0 0 0 / 38%) 100%
    );
  }

  .room-warmth {
    background: radial-gradient(
      420px circle at clamp(71px, calc(50% - 523px), 172px) 129px,
      rgb(255 202 125 / 12%),
      rgb(255 190 105 / 4%) 42%,
      transparent 70%
    );
    mix-blend-mode: screen;
  }

  :global(:root[data-theme='dark']) .room-shade,
  :global(:root[data-theme='dark']) .room-warmth {
    opacity: 1;
    transition: none;
  }

  .pendant-root {
    top: 0;
    left: clamp(34px, calc(50% - 560px), 135px);
    z-index: 560;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(-230px);
    transition:
      transform 0.56s cubic-bezier(0.5, 0, 0.85, 0.6) 0.17s,
      visibility 0s linear 0.73s;
  }

  :global(:root[data-theme='dark']) .pendant-root {
    visibility: visible;
    transform: translateY(0);
    transition: transform 0.7s cubic-bezier(0.22, 1.18, 0.36, 1) 0.07s;
  }

  .pendant-sway {
    position: relative;
    transform-origin: 37px 0;
    animation: switch-sway 9s ease-in-out infinite;
  }

  .pendant-glow {
    position: absolute;
    top: 70px;
    left: -22px;
    width: 118px;
    height: 118px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgb(255 224 154 / 48%),
      rgb(255 190 104 / 18%) 48%,
      rgb(255 174 82 / 7%) 66%,
      transparent 78%
    );
    filter: blur(10px);
    opacity: 0;
  }

  :global(:root[data-theme='dark']) .pendant-glow {
    opacity: 1;
    animation: bulb-breathe 4.2s ease-in-out infinite;
  }

  .pendant-svg {
    position: relative;
    display: block;
    filter: none;
  }

  :global(:root[data-theme='dark']) .pendant-svg {
    filter: drop-shadow(0 0 18px rgb(255 190 100 / 34%));
  }

  .pendant-wire {
    stroke: rgb(55 55 52 / 55%);
    stroke-width: 3;
    stroke-linecap: round;
  }

  .pendant-cap,
  .cord-joint {
    fill: #32353c;
  }

  .pendant-fixture {
    fill: #282d35;
    stroke: rgb(8 10 14 / 42%);
  }

  .pendant-vents {
    stroke: rgb(5 7 10 / 70%);
    stroke-width: 1.6;
    stroke-linecap: round;
  }

  .pendant-ring,
  .pull-accent {
    fill: var(--webase-color-brand);
  }

  .pendant-bulb {
    stroke: rgb(255 230 175 / 60%);
  }

  .pendant-bulb-off {
    fill: #e7e4da;
    stroke: rgb(20 20 19 / 14%);
    opacity: 0.96;
    transition: opacity 0.14s ease-out;
  }

  :global(:root[data-theme='dark']) .pendant-bulb-off {
    opacity: 0;
  }

  .pendant-glint {
    fill: none;
    stroke: rgb(255 255 255 / 68%);
    stroke-width: 1.8;
    stroke-linecap: round;
  }

  .cord-sway {
    top: -54px;
    right: 12px;
    z-index: 570;
    transform-origin: top center;
    animation: switch-sway 8s ease-in-out -2s infinite;
  }

  .cord-button {
    display: block;
    border: 0;
    padding: 0;
    background: transparent;
    cursor: grab;
    transition: transform 0.62s cubic-bezier(0.18, 1.6, 0.4, 1);
  }

  .cord-button:active {
    cursor: grabbing;
  }

  .cord-button:not(.pulled):hover {
    transform: translateY(5px);
  }

  .cord-button.pulled {
    transform: translateY(46px);
    transition: transform 0.18s cubic-bezier(0.55, 0, 0.9, 0.7);
  }

  .cord-rope {
    fill: none;
    stroke: rgb(55 55 52 / 56%);
    stroke-width: 2.5;
    stroke-linecap: round;
  }

  .pull-handle {
    fill: #ebe8de;
    stroke: rgb(20 20 19 / 18%);
  }

  .pull-grip {
    stroke: rgb(20 20 19 / 22%);
    stroke-width: 1.5;
    stroke-linecap: round;
  }

  :global(:root[data-theme='dark']) .pendant-wire,
  :global(:root[data-theme='dark']) .cord-rope {
    stroke: rgb(205 212 232 / 32%);
  }

  :global(:root[data-theme='dark']) .pendant-cap,
  :global(:root[data-theme='dark']) .cord-joint {
    fill: #3b414d;
  }

  :global(:root[data-theme='dark']) .pendant-fixture,
  :global(:root[data-theme='dark']) .pull-handle {
    fill: #252a33;
    stroke: rgb(255 255 255 / 12%);
  }

  :global(:root[data-theme='dark']) .pendant-vents,
  :global(:root[data-theme='dark']) .pull-grip {
    stroke: rgb(0 0 0 / 55%);
  }

  :global(:root[data-theme='dark']) .pendant-fixture-sheen,
  :global(:root[data-theme='dark']) .pull-handle-sheen {
    opacity: 0.58;
  }

  .cord-button:focus-visible {
    outline: none;
  }

  .cord-button:focus-visible .pull-handle {
    stroke: var(--webase-color-brand);
    stroke-width: 2.2px;
  }

  .blackout {
    inset: 0;
    z-index: 580;
    background: #000;
    opacity: 0;
    pointer-events: none;
  }

  @keyframes switch-sway {
    0%,
    100% {
      transform: rotate(-0.85deg);
    }
    50% {
      transform: rotate(0.85deg);
    }
  }

  @keyframes bulb-breathe {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.82;
    }
  }

  @media (min-width: 901px) {
    :global(.theme-toggle) {
      display: none;
    }
  }

  @media (max-width: 900px) {
    .light-switch-root {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pendant-sway,
    .pendant-glow,
    .cord-sway {
      animation: none;
    }

    .pendant-root,
    .cord-button,
    .room-shade,
    .room-warmth {
      transition: none;
    }
  }
</style>
