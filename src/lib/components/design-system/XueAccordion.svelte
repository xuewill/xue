<script lang="ts">
  import XueIcon from './XueIcon.svelte';

  interface Item { title: string; content: string; }
  interface Props { items: Item[]; open?: number; id?: string; }

  let { items, open = $bindable(0), id = 'xue-accordion' }: Props = $props();
  let root: HTMLDivElement;

  function toggle(index: number) {
    open = open === index ? -1 : index;
  }

  function handleKeydown(event: KeyboardEvent, index: number) {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const buttons = root.querySelectorAll<HTMLButtonElement>('.ds-accordion-trigger');
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : event.key === 'ArrowDown' ? (index + 1) % buttons.length : (index - 1 + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }
</script>

<div class="ds-accordion" bind:this={root}>
  {#each items as item, index (item.title)}
    <section class:open={open === index}>
      <h3>
        <button
          class="ds-accordion-trigger"
          type="button"
          id={`${id}-trigger-${index}`}
          aria-expanded={open === index}
          aria-controls={`${id}-panel-${index}`}
          onclick={() => toggle(index)}
          onkeydown={(event) => handleKeydown(event, index)}
        >
          <span><small>{String(index + 1).padStart(2, '0')}</small>{item.title}</span>
          <XueIcon name="chevron-down" size={18} strokeWidth={1.6} />
        </button>
      </h3>
      {#if open === index}
        <div class="ds-accordion-panel" id={`${id}-panel-${index}`} role="region" aria-labelledby={`${id}-trigger-${index}`}>
          <p>{item.content}</p>
        </div>
      {/if}
    </section>
  {/each}
</div>

<style>
  .ds-accordion { border-top: 1px solid var(--hairline-strong); }
  section { border-bottom: 1px solid var(--hairline-strong); }
  h3 { margin: 0; }
  .ds-accordion-trigger { display: flex; width: 100%; min-height: 58px; align-items: center; justify-content: space-between; gap: 18px; padding: 0 4px; border: 0; color: var(--ink); background: transparent; cursor: pointer; font-family: var(--font); font-size: 18px; text-align: left; }
  .ds-accordion-trigger > span { display: flex; align-items: center; gap: 16px; }
  small { color: var(--brand); font-family: var(--mono); font-size: 9px; letter-spacing: .1em; }
  .ds-accordion-trigger :global(svg) { flex: none; color: var(--brand); transition: transform var(--duration-ui) var(--ease-out); }
  section.open .ds-accordion-trigger :global(svg) { transform: rotate(180deg); }
  .ds-accordion-trigger:hover { color: var(--brand); }
  .ds-accordion-trigger:focus-visible { outline: 2px solid var(--brand); outline-offset: 3px; }
  .ds-accordion-panel { padding: 0 44px 20px; animation: ds-accordion-in var(--duration-ui) var(--ease-out) both; }
  p { max-width: 58ch; margin: 0; color: var(--ink-muted); font-size: 14px; line-height: 1.55; }
  @keyframes ds-accordion-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { .ds-accordion-trigger :global(svg), .ds-accordion-panel { animation: none; transition: none; } }
</style>
