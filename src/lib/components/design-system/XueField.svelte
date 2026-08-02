<script lang="ts">
  interface Props {
    label: string;
    id?: string;
    placeholder?: string;
    help?: string;
    error?: string;
    type?: 'text' | 'email' | 'search';
    value?: string;
    required?: boolean;
    disabled?: boolean;
  }

  let { label, id = `ds-field-${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`, placeholder = '', help = '', error = '', type = 'text', value = $bindable(''), required = false, disabled = false }: Props = $props();
  const descriptionId = $derived(`${id}-${error ? 'error' : 'help'}`);
</script>

<label class="ds-field" for={id}>
  <span class="ds-field-label">{label}{#if required}<em>Required</em>{/if}</span>
  <input {id} {type} {placeholder} bind:value {required} {disabled} aria-invalid={error ? 'true' : undefined} aria-describedby={error || help ? descriptionId : undefined} />
  {#if error}<span class="ds-field-error" id={descriptionId}>{error}</span>{:else if help}<span class="ds-field-help" id={descriptionId}>{help}</span>{/if}
</label>

<style>
  .ds-field { display: grid; gap: 8px; }
  .ds-field-label { display: flex; justify-content: space-between; gap: 12px; color: var(--ink); font-family: var(--sans); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
  .ds-field-label em { color: var(--ink-muted); font-family: var(--mono); font-size: 9px; font-style: normal; font-weight: 400; }
  input { width: 100%; min-height: 46px; padding: 0 12px; border: 1px solid var(--hairline-strong); border-radius: 0; outline: none; color: var(--ink); background: var(--surface); font-family: var(--font); font-size: 16px; transition: border-color var(--duration-ui) var(--ease-out), box-shadow var(--duration-ui) var(--ease-out); }
  input::placeholder { color: var(--ink-muted); }
  input:hover { border-color: var(--brand); }
  input:focus { border-color: var(--brand); box-shadow: 4px 4px 0 color-mix(in srgb, var(--brand) 16%, transparent); }
  input[aria-invalid='true'] { border-color: #9b4c46; box-shadow: 4px 4px 0 color-mix(in srgb, #9b4c46 14%, transparent); }
  input:disabled { cursor: not-allowed; opacity: .55; }
  .ds-field-help, .ds-field-error { color: var(--ink-muted); font-size: 12px; line-height: 1.4; }
  .ds-field-error { color: #9b4c46; }
</style>
