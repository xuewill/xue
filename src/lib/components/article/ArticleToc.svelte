<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { ContentHeading } from '$lib/types/content';

  export let headings: readonly ContentHeading[] = [];

  $: items = [{ id: 'article-overview', label: 'Overview', level: 1 }, ...headings];
  let activeId = 'article-overview';
  let isOpen = false;
  let triggerButton: HTMLButtonElement;
  let tocPanel: HTMLElement;
  let previousBodyOverflow = '';

  async function openToc() {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    isOpen = true;
    await tick();
    triggerButton.focus();
  }

  function closeToc(restoreFocus = true) {
    if (!isOpen) return;
    isOpen = false;
    document.body.style.overflow = previousBodyOverflow;
    if (restoreFocus) requestAnimationFrame(() => triggerButton?.focus());
  }

  function toggleToc() {
    if (isOpen) closeToc();
    else void openToc();
  }

  function handleTocLink() {
    closeToc(false);
  }

  onMount(() => {
    const targets = items
      .map(({ id }) => document.getElementById(id))
      .filter((target): target is HTMLElement => target !== null);
    if (targets.length === 0) return;
    let frame = 0;

    const updateActiveItem = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = targets[0];
        for (const target of targets) {
          if (target.getBoundingClientRect().top <= 132) current = target;
          else break;
        }
        activeId = current.id;
      });
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeToc();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [
        triggerButton,
        ...Array.from(tocPanel.querySelectorAll<HTMLAnchorElement>('a[href]'))
      ];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleResize = () => {
      updateActiveItem();
      if (window.innerWidth > 720) closeToc(false);
    };

    updateActiveItem();
    window.addEventListener('scroll', updateActiveItem, { passive: true });
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeydown);

    return () => {
      cancelAnimationFrame(frame);
      if (isOpen) document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener('scroll', updateActiveItem);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<button
  bind:this={triggerButton}
  class="toc-trigger"
  class:is-open={isOpen}
  type="button"
  aria-label={isOpen ? 'Close table of contents' : 'Open table of contents'}
  aria-controls="article-toc-panel"
  aria-expanded={isOpen}
  aria-haspopup="dialog"
  onclick={toggleToc}
>
  <span class="toc-trigger-lines" aria-hidden="true">
    <span></span>
    <span></span>
    <span></span>
  </span>
</button>

{#if isOpen}
  <button
    class="toc-backdrop"
    type="button"
    tabindex="-1"
    aria-label="Close table of contents"
    onclick={() => closeToc()}
  ></button>
{/if}

<aside
  bind:this={tocPanel}
  id="article-toc-panel"
  class="article-toc"
  class:is-open={isOpen}
  aria-labelledby="article-toc-title"
  aria-modal={isOpen ? 'true' : undefined}
  role={isOpen ? 'dialog' : undefined}
>
  <p id="article-toc-title" class="article-toc-title">On this page</p>
  <nav aria-label="Article sections">
    <ol>
      {#each items as item (item.id)}
        <li style={`--toc-level: ${Math.max(0, item.level - 2)}`}>
          <a
            class="toc-section-link"
            href={`#${item.id}`}
            aria-current={activeId === item.id ? 'location' : undefined}
            onclick={handleTocLink}
          >
            {item.label}
          </a>
        </li>
      {/each}
    </ol>
  </nav>
  <a class="toc-top-link" href="#article-overview" onclick={handleTocLink}>
    <span>Back to top</span>
    <span aria-hidden="true">↑</span>
  </a>
</aside>

<style>
  .toc-trigger,
  .toc-backdrop {
    display: none;
  }

  .article-toc {
    position: sticky;
    top: 96px;
    grid-column: 1;
    align-self: start;
    width: 180px;
    max-height: calc(100dvh - 128px);
    overflow-y: auto;
    transform: translateX(calc(-100% - 32px));
  }

  .article-toc-title {
    margin: 0 0 16px;
    color: var(--ink);
    font-family: var(--sans);
    font-size: 11px;
    letter-spacing: var(--track-caps);
    line-height: 1.4;
    text-transform: uppercase;
  }

  ol {
    margin: 0;
    padding: 0;
    background-image: var(--dot-rule-image);
    background-position: left top;
    background-repeat: repeat-y;
    background-size: 2px 7px;
    list-style: none;
  }

  li {
    margin: 0;
    padding-left: calc(15px + var(--toc-level) * 9px);
  }

  .toc-section-link {
    position: relative;
    display: block;
    padding: 6px 0;
    color: var(--ink-muted);
    font-family: var(--sans);
    font-size: 13px;
    letter-spacing: 0.035em;
    line-height: 1.45;
    transition: color var(--duration-ui) var(--ease-out);
  }

  .toc-section-link::before {
    position: absolute;
    top: 6px;
    bottom: 6px;
    left: calc(-15px - var(--toc-level) * 9px - 1px);
    width: 2px;
    border-radius: 2px;
    background: var(--brand);
    content: '';
    opacity: 0;
    transition: opacity var(--duration-ui) var(--ease-out);
  }

  .toc-section-link:hover,
  .toc-section-link[aria-current='location'] {
    color: var(--brand);
  }

  .toc-section-link[aria-current='location']::before {
    opacity: 1;
  }

  .toc-top-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
    padding: 14px 2px 4px;
    background-image: var(--dot-rule-image);
    background-position: left top;
    background-repeat: repeat-x;
    background-size: 7px 2px;
    color: var(--ink-muted);
    font-family: var(--sans);
    font-size: 11px;
    letter-spacing: var(--track-nav);
    text-transform: uppercase;
    transition: color var(--duration-ui) var(--ease-out);
  }

  .toc-top-link:hover {
    color: var(--brand);
  }

  @media (min-width: 1440px) {
    .article-toc {
      width: clamp(220px, 16vw, 240px);
    }
  }

  @media (max-width: 1160px) {
    .article-toc {
      position: static;
      grid-column: 1;
      width: 100%;
      max-height: none;
      margin-bottom: clamp(36px, 6vw, 56px);
      overflow: visible;
      transform: none;
    }

    ol {
      columns: 2;
      column-gap: 32px;
    }

    li {
      break-inside: avoid;
    }
  }

  @media (max-width: 720px) {
    .toc-trigger {
      position: fixed;
      top: 66px;
      right: 12px;
      z-index: 490;
      display: flex;
      width: 44px;
      height: 44px;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--hairline-strong);
      border-radius: 2px;
      padding: 0;
      background: color-mix(in srgb, var(--paper) 94%, transparent);
      box-shadow: 0 6px 18px rgb(20 20 19 / 8%);
      color: var(--brand);
      cursor: pointer;
      backdrop-filter: blur(10px);
    }

    .toc-trigger-lines {
      position: relative;
      width: 14px;
      height: 12px;
    }

    .toc-trigger-lines span {
      position: absolute;
      right: 0;
      top: 50%;
      width: 14px;
      height: 1px;
      background: currentColor;
      transform-origin: center;
      transition:
        transform var(--duration-ui) var(--ease-out),
        opacity var(--duration-fast) var(--ease-out);
    }

    .toc-trigger-lines span:nth-child(1) {
      transform: translateY(calc(-50% - 4.5px));
    }

    .toc-trigger-lines span:nth-child(2) {
      transform: translateY(-50%);
    }

    .toc-trigger-lines span:nth-child(3) {
      transform: translateY(calc(-50% + 4.5px));
    }

    .toc-trigger.is-open .toc-trigger-lines span:nth-child(1) {
      transform: translateY(-50%) rotate(45deg);
    }

    .toc-trigger.is-open .toc-trigger-lines span:nth-child(2) {
      opacity: 0;
    }

    .toc-trigger.is-open .toc-trigger-lines span:nth-child(3) {
      transform: translateY(-50%) rotate(-45deg);
    }

    .toc-backdrop {
      position: fixed;
      inset: 56px 0 0;
      z-index: 450;
      display: block;
      width: 100%;
      height: auto;
      border: 0;
      padding: 0;
      background: color-mix(in srgb, var(--ink) 18%, transparent);
      cursor: default;
      backdrop-filter: blur(4px);
    }

    .article-toc {
      position: fixed;
      inset: 56px 0 0 auto;
      z-index: 470;
      width: min(88vw, 360px);
      max-height: calc(100dvh - 56px);
      margin: 0;
      border-left: 1px solid var(--hairline-strong);
      padding: 32px 24px 28px;
      overflow-y: auto;
      background: var(--paper);
      box-shadow: -18px 0 42px rgb(20 20 19 / 12%);
      opacity: 0;
      pointer-events: none;
      transform: translateX(100%);
      visibility: hidden;
      transition:
        transform 240ms var(--ease-drawer),
        opacity 180ms var(--ease-out),
        visibility 0s linear 240ms;
    }

    .article-toc.is-open {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(0);
      visibility: visible;
      transition-delay: 0s;
    }

    ol {
      columns: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) and (max-width: 720px) {
    .toc-trigger-lines span {
      transition: opacity var(--duration-fast) var(--ease-out);
    }

    .toc-trigger-lines span:nth-child(1),
    .toc-trigger-lines span:nth-child(2),
    .toc-trigger-lines span:nth-child(3),
    .toc-trigger.is-open .toc-trigger-lines span:nth-child(1),
    .toc-trigger.is-open .toc-trigger-lines span:nth-child(3) {
      transform: translateY(-50%);
    }

    .article-toc {
      transform: none;
      transition:
        opacity var(--duration-fast) var(--ease-out),
        visibility 0s linear var(--duration-fast);
    }

    .article-toc.is-open {
      transition-delay: 0s;
    }
  }
</style>
