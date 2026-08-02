<script lang="ts">
  import XueIcon from './XueIcon.svelte';

  interface Props { total?: number; page?: number; label?: string; }
  let { total = 5, page = $bindable(1), label = 'Pagination' }: Props = $props();
  const pages = $derived(Array.from({ length: Math.max(1, total) }, (_, index) => index + 1));
</script>

<nav class="ds-pagination" aria-label={label}>
  <button type="button" aria-label="Previous page" disabled={page <= 1} onclick={() => (page = Math.max(1, page - 1))}><XueIcon name="arrow-left" size={16} /></button>
  <span class="ds-pagination-pages">
    {#each pages as item (item)}
      <button type="button" class:active={page === item} aria-label={`Page ${item}`} aria-current={page === item ? 'page' : undefined} onclick={() => (page = item)}>{String(item).padStart(2, '0')}</button>
    {/each}
  </span>
  <button type="button" aria-label="Next page" disabled={page >= total} onclick={() => (page = Math.min(total, page + 1))}><XueIcon name="arrow-right" size={16} /></button>
</nav>

<style>
  .ds-pagination, .ds-pagination-pages { display: inline-flex; align-items: center; gap: 5px; }
  button { display: inline-grid; min-width: 40px; height: 40px; place-items: center; padding: 0 8px; border: 1px solid var(--hairline); color: var(--ink-muted); background: var(--surface); cursor: pointer; font-family: var(--mono); font-size: 10px; transition: border-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), background-color var(--duration-fast) var(--ease-out); }
  button:hover, button.active { border-color: var(--brand); color: var(--brand); background: var(--brand-tint); }
  button.active { color: var(--paper); background: var(--brand); }
  button:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
  button:disabled { cursor: not-allowed; opacity: .35; }
  @media (max-width: 480px) { .ds-pagination-pages button:not(.active):nth-child(n+4) { display: none; } }
</style>
