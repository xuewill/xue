<script lang="ts">
  import XueIcon from './XueIcon.svelte';

  type Variant = 'ink' | 'outline' | 'quiet' | 'text';
  type Size = 'sm' | 'md';
  type Icon = 'arrow' | 'check' | 'plus';

  interface Props {
    label: string;
    variant?: Variant;
    size?: Size;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    icon?: Icon;
    full?: boolean;
    onclick?: (event: MouseEvent) => void;
  }

  let { label, variant = 'outline', size = 'md', type = 'button', disabled = false, loading = false, icon, full = false, onclick }: Props = $props();
</script>

<button class={`ds-button ds-button-${variant} ds-button-${size}`} class:full {type} disabled={disabled || loading} aria-busy={loading} {onclick}>
  {#if loading}
    <XueIcon class="ds-button-spinner" name="loader-circle" size={15} strokeWidth={1.8} />
  {:else if icon === 'arrow'}
    <XueIcon name="arrow-up-right" size={15} strokeWidth={1.8} />
  {:else if icon === 'check'}
    <XueIcon name="check" size={15} strokeWidth={1.8} />
  {:else if icon === 'plus'}
    <XueIcon name="plus" size={15} strokeWidth={1.8} />
  {/if}
  <span>{loading ? 'Working' : label}</span>
</button>

<style>
  .ds-button {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 16px;
    border: 1px solid transparent;
    border-radius: 2px;
    cursor: pointer;
    font-family: var(--sans);
    font-size: 11px;
    letter-spacing: var(--track-nav);
    line-height: 1;
    text-transform: uppercase;
    transition: background-color var(--duration-ui) var(--ease-out), color var(--duration-ui) var(--ease-out), border-color var(--duration-ui) var(--ease-out), transform var(--duration-fast) var(--ease-out);
  }
  .ds-button-sm { min-height: 36px; padding-inline: 12px; font-size: 10px; }
  .ds-button.full { width: 100%; }
  .ds-button:hover { transform: translateY(-1px); }
  .ds-button:active { transform: translateY(0); }
  .ds-button:disabled { cursor: not-allowed; opacity: .45; transform: none; }
  .ds-button-ink { border-color: var(--brand); background: var(--brand); color: var(--paper); }
  .ds-button-ink:hover { background: var(--brand-light); border-color: var(--brand-light); }
  .ds-button-outline { border-color: var(--hairline-strong); color: var(--ink); background: transparent; }
  .ds-button-outline:hover { border-color: var(--brand); color: var(--brand); background: var(--brand-tint); }
  .ds-button-quiet { border-color: var(--hairline); color: var(--ink-soft); background: var(--surface-muted); }
  .ds-button-quiet:hover { color: var(--ink); border-color: var(--hairline-strong); }
  .ds-button-text { min-height: 36px; padding-inline: 0; color: var(--brand); background: transparent; text-decoration: underline; text-decoration-color: var(--hairline-strong); text-underline-offset: 4px; }
  .ds-button-text:hover { text-decoration-color: var(--brand); }
  .ds-button:focus-visible { outline: 2px solid var(--brand); outline-offset: 3px; }
  .ds-button :global(.ds-button-spinner) { animation: ds-button-spin 800ms linear infinite; }
  @keyframes ds-button-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .ds-button { transition: none; } .ds-button :global(.ds-button-spinner) { animation: none; } }
</style>
