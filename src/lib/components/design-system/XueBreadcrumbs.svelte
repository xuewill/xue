<script lang="ts">
  import XueIcon from './XueIcon.svelte';

  interface Item { label: string; href?: string; }
  interface Props { items: Item[]; }

  let { items }: Props = $props();
</script>

<nav class="ds-breadcrumbs" aria-label="Breadcrumb">
  <ol>
    {#each items as item, index (item.label)}
      <li>
        {#if index > 0}<XueIcon name="chevron-right" size={13} />{/if}
        {#if item.href && index < items.length - 1}
          <a href={item.href}>{#if index === 0}<XueIcon name="house" size={14} />{/if}<span>{item.label}</span></a>
        {:else}
          <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  ol { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; margin: 0; padding: 0; list-style: none; }
  li, a { display: inline-flex; align-items: center; gap: 7px; }
  li { color: var(--ink-muted); font-family: var(--sans); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
  a { color: var(--brand); text-decoration: none; }
  a:hover span { text-decoration: underline; text-underline-offset: 4px; }
  a:focus-visible { outline: 2px solid var(--brand); outline-offset: 3px; }
  [aria-current='page'] { color: var(--ink); }
  li > :global(svg) { color: var(--hairline-strong); }
</style>
