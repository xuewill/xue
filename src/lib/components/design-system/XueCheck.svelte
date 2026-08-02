<script lang="ts">
  import XueIcon from './XueIcon.svelte';

  interface Props { label: string; checked?: boolean; disabled?: boolean; indeterminate?: boolean; description?: string; }
  let { label, checked = $bindable(false), disabled = false, indeterminate = false, description = '' }: Props = $props();
  let input: HTMLInputElement;
  $effect(() => { if (input) input.indeterminate = indeterminate; });
</script>

<label class:disabled class="ds-check">
  <input bind:this={input} type="checkbox" bind:checked {disabled} />
  <span class="ds-check-box" aria-hidden="true">{#if indeterminate}<XueIcon name="minus" size={13} strokeWidth={2} />{:else if checked}<XueIcon name="check" size={13} strokeWidth={2} />{/if}</span>
  <span class="ds-check-copy"><span>{label}</span>{#if description}<small>{description}</small>{/if}</span>
</label>

<style>
  .ds-check { display: inline-flex; align-items: center; gap: 9px; color: var(--ink-soft); cursor: pointer; font-size: 14px; }
  .ds-check.disabled { cursor: not-allowed; opacity: .45; }
  input { position: absolute; width: 1px; height: 1px; opacity: 0; }
  .ds-check-box { display: grid; width: 20px; height: 20px; place-items: center; border: 1px solid var(--hairline-strong); color: var(--paper); background: transparent; font-family: var(--sans); font-size: 12px; }
  input:checked + .ds-check-box { border-color: var(--brand); background: var(--brand); }
  input:indeterminate + .ds-check-box { border-color: var(--brand); color: var(--paper); background: var(--brand); }
  input:focus-visible + .ds-check-box { outline: 2px solid var(--brand); outline-offset: 3px; }
  .ds-check-copy { display: grid; gap: 2px; }
  small { color: var(--ink-muted); font-size: 11px; line-height: 1.35; }
</style>
