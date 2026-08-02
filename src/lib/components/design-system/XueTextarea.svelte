<script lang="ts">
  interface Props { label: string; id?: string; placeholder?: string; value?: string; help?: string; maxLength?: number; error?: string; }
  let { label, id = `ds-textarea-${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`, placeholder = '', value = $bindable(''), help = '', maxLength = 240, error = '' }: Props = $props();
</script>

<label class="ds-textarea" for={id}>
  <span>{label}<em>{value.length} / {maxLength}</em></span>
  <textarea {id} {placeholder} bind:value rows="4" maxlength={maxLength} aria-invalid={error ? 'true' : undefined}></textarea>
  {#if error}<small class="error">{error}</small>{:else if help}<small>{help}</small>{/if}
</label>

<style>
  .ds-textarea { display: grid; gap: 8px; }
  .ds-textarea > span { display: flex; justify-content: space-between; gap: 12px; color: var(--ink); font-family: var(--sans); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
  em { color: var(--ink-muted); font-family: var(--mono); font-size: 9px; font-style: normal; font-weight: 400; }
  textarea { width: 100%; min-height: 110px; padding: 12px; resize: vertical; border: 1px solid var(--hairline-strong); outline: none; color: var(--ink); background: var(--surface); font-family: var(--font); font-size: 16px; line-height: 1.45; }
  textarea:focus { border-color: var(--brand); box-shadow: 4px 4px 0 color-mix(in srgb, var(--brand) 16%, transparent); }
  textarea[aria-invalid='true'] { border-color: #9b4c46; }
  small { color: var(--ink-muted); font-size: 12px; line-height: 1.4; }
  small.error { color: #9b4c46; }
</style>
