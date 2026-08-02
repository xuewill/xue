<script lang="ts">
  interface Props { label: string; text: string; id?: string; }
  let { label, text, id = 'xue-tooltip' }: Props = $props();
</script>

<span class="ds-tooltip-wrap">
  <button type="button" aria-describedby={id}>{label}</button>
  <span {id} role="tooltip">{text}</span>
</span>

<style>
  .ds-tooltip-wrap { position: relative; display: inline-flex; }
  button { min-height: 40px; padding: 0 12px; border: 1px dashed var(--brand); color: var(--brand); background: transparent; cursor: help; font-family: var(--mono); font-size: 11px; }
  [role='tooltip'] { position: absolute; bottom: calc(100% + 10px); left: 50%; z-index: 2; width: max-content; max-width: 220px; padding: 8px 10px; border: 1px solid var(--brand); color: var(--paper); background: var(--brand); font-size: 12px; line-height: 1.35; opacity: 0; pointer-events: none; transform: translate(-50%, 4px); transition: opacity var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out); }
  .ds-tooltip-wrap:hover [role='tooltip'], .ds-tooltip-wrap:focus-within [role='tooltip'] { opacity: 1; transform: translate(-50%, 0); }
  button:focus-visible { outline: 2px solid var(--brand); outline-offset: 3px; }
  @media (prefers-reduced-motion: reduce) { [role='tooltip'] { transition: none; } }
</style>
