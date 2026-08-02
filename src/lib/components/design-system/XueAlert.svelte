<script lang="ts">
  import XueIcon from './XueIcon.svelte';

  type Tone = 'info' | 'success' | 'warning' | 'error';

  interface Props {
    title: string;
    message: string;
    tone?: Tone;
    dismissible?: boolean;
    open?: boolean;
  }

  let { title, message, tone = 'info', dismissible = false, open = $bindable(true) }: Props = $props();
</script>

{#if open}
  <aside class={`ds-alert ds-alert-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
    <span class="ds-alert-icon" aria-hidden="true">
      {#if tone === 'success'}
        <XueIcon name="circle-check" size={19} />
      {:else if tone === 'warning'}
        <XueIcon name="triangle-alert" size={19} />
      {:else if tone === 'error'}
        <XueIcon name="circle-alert" size={19} />
      {:else}
        <XueIcon name="info" size={19} />
      {/if}
    </span>
    <span class="ds-alert-copy"><strong>{title}</strong><small>{message}</small></span>
    {#if dismissible}
      <button type="button" aria-label="Dismiss alert" onclick={() => (open = false)}><XueIcon name="x" size={17} /></button>
    {/if}
  </aside>
{/if}

<style>
  .ds-alert { --alert-color: var(--brand); display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: start; min-height: 72px; padding: 15px 16px; border: 1px solid color-mix(in srgb, var(--alert-color) 62%, var(--hairline)); border-left-width: 3px; color: var(--ink); background: color-mix(in srgb, var(--alert-color) 7%, var(--surface)); }
  .ds-alert-success { --alert-color: #3f7658; }
  .ds-alert-warning { --alert-color: #9a662c; }
  .ds-alert-error { --alert-color: #9b4c46; }
  .ds-alert-icon { display: grid; width: 28px; height: 28px; place-items: center; border: 1px solid color-mix(in srgb, var(--alert-color) 42%, transparent); border-radius: 50%; color: var(--alert-color); }
  .ds-alert-copy { display: grid; gap: 4px; min-width: 0; }
  strong { color: var(--ink); font-family: var(--sans); font-size: 11px; letter-spacing: .07em; line-height: 1.35; text-transform: uppercase; }
  small { color: var(--ink-muted); font-size: 13px; line-height: 1.45; }
  button { display: grid; width: 32px; height: 32px; place-items: center; border: 0; color: var(--ink-muted); background: transparent; cursor: pointer; }
  button:hover { color: var(--alert-color); }
  button:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
</style>
