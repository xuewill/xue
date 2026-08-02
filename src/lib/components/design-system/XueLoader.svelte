<script lang="ts">
  interface Props { label?: string; }
  let { label = 'Loading' }: Props = $props();
</script>

<div class="ds-loader" role="status" aria-label={label}><span></span><span></span><span></span><em>{label}</em></div>

<style>
  .ds-loader { display: inline-flex; align-items: center; gap: 5px; color: var(--ink-muted); font-family: var(--mono); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; }
  .ds-loader span { width: 6px; height: 6px; border-radius: 50%; background: var(--brand); animation: ds-loader-pulse 900ms var(--ease-in-out) infinite alternate; }
  .ds-loader span:nth-child(2) { animation-delay: 150ms; }
  .ds-loader span:nth-child(3) { animation-delay: 300ms; }
  em { margin-left: 7px; font-style: normal; }
  @keyframes ds-loader-pulse { from { opacity: .3; transform: translateY(2px); } to { opacity: 1; transform: translateY(-2px); } }
  @media (prefers-reduced-motion: reduce) { .ds-loader span { animation: none; opacity: 1; } }
</style>
