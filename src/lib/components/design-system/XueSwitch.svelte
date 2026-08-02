<script lang="ts">
  interface Props { label: string; checked?: boolean; disabled?: boolean; description?: string; }
  let { label, checked = $bindable(false), disabled = false, description = '' }: Props = $props();
</script>

<label class="ds-switch" class:disabled>
  <input type="checkbox" role="switch" bind:checked aria-label={label} {disabled} />
  <span class="ds-switch-track" aria-hidden="true"><span></span></span>
  <span class="ds-switch-copy"><span>{label}</span>{#if description}<small>{description}</small>{/if}</span>
</label>

<style>
  .ds-switch { display: inline-flex; align-items: center; gap: 10px; color: var(--ink-soft); cursor: pointer; font-size: 14px; }
  .ds-switch.disabled { cursor: not-allowed; opacity: .45; }
  input { position: absolute; width: 1px; height: 1px; opacity: 0; }
  .ds-switch-track { display: inline-flex; width: 42px; height: 24px; align-items: center; padding: 3px; border: 1px solid var(--hairline-strong); border-radius: 999px; background: var(--surface-muted); transition: background-color var(--duration-ui) var(--ease-out), border-color var(--duration-ui) var(--ease-out); }
  .ds-switch-track span { display: block; width: 16px; height: 16px; border-radius: 50%; background: var(--paper); box-shadow: 0 1px 3px var(--book-shadow); transition: transform var(--duration-ui) var(--ease-out); }
  input:checked + .ds-switch-track { border-color: var(--brand); background: var(--brand); }
  input:checked + .ds-switch-track span { transform: translateX(18px); }
  input:focus-visible + .ds-switch-track { outline: 2px solid var(--brand); outline-offset: 3px; }
  .ds-switch-copy { display: grid; gap: 2px; }
  small { color: var(--ink-muted); font-size: 11px; line-height: 1.35; }
  @media (prefers-reduced-motion: reduce) { .ds-switch-track, .ds-switch-track span { transition: none; } }
</style>
