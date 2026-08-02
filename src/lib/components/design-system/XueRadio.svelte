<script lang="ts">
  interface Props { name: string; label: string; value: string; selected?: string; disabled?: boolean; description?: string; }
  let { name, label, value, selected = $bindable('first'), disabled = false, description = '' }: Props = $props();
</script>

<label class="ds-radio" class:disabled>
  <input type="radio" {name} value={value} bind:group={selected} {disabled} />
  <span class="ds-radio-dot" aria-hidden="true"></span>
  <span class="ds-radio-copy"><span>{label}</span>{#if description}<small>{description}</small>{/if}</span>
</label>

<style>
  .ds-radio { display: inline-flex; align-items: center; gap: 9px; color: var(--ink-soft); cursor: pointer; font-size: 14px; }
  .ds-radio.disabled { cursor: not-allowed; opacity: .45; }
  input { position: absolute; width: 1px; height: 1px; opacity: 0; }
  .ds-radio-dot { display: grid; width: 20px; height: 20px; place-items: center; border: 1px solid var(--hairline-strong); border-radius: 50%; }
  .ds-radio-dot::after { width: 8px; height: 8px; border-radius: 50%; background: var(--brand); content: ''; opacity: 0; transform: scale(.6); transition: opacity var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out); }
  input:checked + .ds-radio-dot::after { opacity: 1; transform: scale(1); }
  input:focus-visible + .ds-radio-dot { outline: 2px solid var(--brand); outline-offset: 3px; }
  .ds-radio-copy { display: grid; gap: 2px; }
  small { color: var(--ink-muted); font-size: 11px; line-height: 1.35; }
  @media (prefers-reduced-motion: reduce) { .ds-radio-dot::after { transition: none; } }
</style>
