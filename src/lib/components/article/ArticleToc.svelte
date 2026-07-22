<script lang="ts">
  import { onMount, tick } from 'svelte';

  interface TocItem {
    id: string;
    label: string;
    level: number;
  }

  let items: TocItem[] = [{ id: 'article-overview', label: 'Overview', level: 1 }];
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

  function createHeadingId(label: string, usedIds: Set<string>): string {
    const base =
      label
        .toLocaleLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
        .replace(/^-|-$/g, '') || 'section';

    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    return id;
  }

  onMount(() => {
    const article = document.querySelector<HTMLElement>('#article-overview');
    if (!article) return;

    const headings = Array.from(
      article.querySelectorAll<HTMLHeadingElement>('.prose h2, .prose h3, .prose h4, .prose h5, .prose h6')
    );
    const usedIds = new Set(
      Array.from(document.querySelectorAll<HTMLElement>('[id]'), (element) => element.id)
    );

    const headingItems = headings.map((heading) => {
      const label = heading.textContent?.trim() || 'Section';
      if (!heading.id) heading.id = createHeadingId(label, usedIds);
      usedIds.add(heading.id);
      return { id: heading.id, label, level: Number(heading.tagName.slice(1)) };
    });

    items = [...items, ...headingItems];
    const targets = [article, ...headings];
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
      {#each items as item}
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
    scrollbar-width: thin;
  }

  .article-toc-title {
    margin: 0 0 16px;
    color: var(--ink);
    font-family: var(--sans);
    font-size: 10px;
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
    font-size: 11px;
    letter-spacing: 0.035em;
    line-height: 1.45;
    transition: color 0.2s ease;
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
    transition: opacity 0.2s ease;
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
    font-size: 10px;
    letter-spacing: var(--track-nav);
    text-transform: uppercase;
    transition: color 0.2s ease;
  }

  .toc-top-link:hover {
    color: var(--brand);
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
      width: 30px;
      height: 30px;
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
      width: 14px;
      height: 1px;
      background: currentColor;
      transform-origin: center;
      transition: top 0.2s ease, transform 0.2s ease, opacity 0.15s ease;
    }

    .toc-trigger-lines span:nth-child(1) {
      top: 1px;
    }

    .toc-trigger-lines span:nth-child(2) {
      top: 5.5px;
    }

    .toc-trigger-lines span:nth-child(3) {
      top: 10px;
    }

    .toc-trigger.is-open .toc-trigger-lines span:nth-child(1) {
      top: 5.5px;
      transform: rotate(45deg);
    }

    .toc-trigger.is-open .toc-trigger-lines span:nth-child(2) {
      opacity: 0;
    }

    .toc-trigger.is-open .toc-trigger-lines span:nth-child(3) {
      top: 5.5px;
      transform: rotate(-45deg);
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
      transition: transform 0.24s ease, opacity 0.2s ease, visibility 0.24s;
    }

    .article-toc.is-open {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(0);
      visibility: visible;
    }

    ol {
      columns: 1;
    }
  }
</style>
