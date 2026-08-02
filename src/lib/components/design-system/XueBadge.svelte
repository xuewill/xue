<script lang="ts">
  type Tone = 'canonical' | 'one-off' | 'experiment';

  interface Props {
    label: string;
    tone?: Tone;
    dot?: boolean;
  }

  let { label, tone = 'canonical', dot = false }: Props = $props();
</script>

<span class={`ds-badge ds-badge-${tone}`}>{#if dot}<i aria-hidden="true"></i>{/if}{label}</span>

<style>
  .ds-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 24px;
    padding: 3px 8px;
    border: 1px solid currentColor;
    border-radius: 999px;
    font-family: var(--sans);
    font-size: 10px;
    letter-spacing: .1em;
    line-height: 1;
    text-transform: uppercase;
  }
  .ds-badge-canonical { color: var(--brand); background: var(--brand-tint); }
  .ds-badge-one-off { color: var(--ink-muted); background: var(--surface-muted); }
  .ds-badge-experiment { color: #8e4e36; background: #f1dfd4; }
  i { display: block; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
  :global([data-theme='dark']) .ds-badge-experiment { color: #f0b99f; background: #442b23; }
</style>
