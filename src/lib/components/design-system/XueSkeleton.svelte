<script lang="ts">
  interface Props { rows?: number; media?: boolean; label?: string; }
  let { rows = 3, media = true, label = 'Loading content' }: Props = $props();
</script>

<div class="ds-skeleton" role="status" aria-label={label}>
  {#if media}<span class="ds-skeleton-media"></span>{/if}
  <span class="ds-skeleton-copy">
    {#each Array.from({ length: rows }) as _, index (index)}
      <span class="ds-skeleton-line" class:is-last={index === rows - 1}></span>
    {/each}
  </span>
</div>

<style>
  .ds-skeleton { display: grid; grid-template-columns: 74px 1fr; gap: 16px; align-items: center; padding: 16px; border: 1px solid var(--hairline); background: var(--surface); }
  .ds-skeleton-media, .ds-skeleton-line { position: relative; display: block; overflow: hidden; background: var(--surface-muted); }
  .ds-skeleton-media { width: 74px; height: 74px; }
  .ds-skeleton-copy { display: grid; gap: 10px; }
  .ds-skeleton-line { height: 10px; }
  .ds-skeleton-line.is-last { width: 62%; }
  .ds-skeleton-media::after, .ds-skeleton-line::after { position: absolute; inset: 0; background: linear-gradient(100deg, transparent 20%, color-mix(in srgb, var(--surface) 80%, transparent) 50%, transparent 80%); content: ''; transform: translateX(-100%); animation: ds-skeleton-shimmer 1.5s var(--ease-in-out) infinite; }
  @keyframes ds-skeleton-shimmer { to { transform: translateX(100%); } }
  @media (prefers-reduced-motion: reduce) { .ds-skeleton-media::after, .ds-skeleton-line::after { display: none; animation: none; } }
</style>
