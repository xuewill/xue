<script lang="ts">
  import XueIcon from './XueIcon.svelte';

  type Tone = 'success' | 'info' | 'error';
  interface Props { open?: boolean; title?: string; message?: string; tone?: Tone; }
  let { open = $bindable(false), title = 'Saved locally', message = 'The specimen is ready for review.', tone = 'success' }: Props = $props();
</script>

{#if open}
  <aside class={`ds-toast ds-toast-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
    <span class="ds-toast-mark" aria-hidden="true">{#if tone === 'error'}<XueIcon name="circle-alert" size={15} strokeWidth={1.8} />{:else if tone === 'info'}<XueIcon name="info" size={15} strokeWidth={1.8} />{:else}<XueIcon name="circle-check" size={15} strokeWidth={1.8} />{/if}</span>
    <span><strong>{title}</strong><small>{message}</small></span>
    <button type="button" aria-label="Dismiss notification" onclick={() => (open = false)}><XueIcon name="x" size={17} /></button>
  </aside>
{/if}

<style>
  .ds-toast { --toast-color: var(--brand); display: flex; align-items: center; gap: 12px; width: min(380px, 100%); padding: 13px 14px; border: 1px solid var(--toast-color); border-left-width: 3px; background: var(--surface); box-shadow: 8px 8px 0 color-mix(in srgb, var(--toast-color) 15%, transparent); animation: ds-toast-in 220ms var(--ease-out) both; }
  .ds-toast-error { --toast-color: #9b4c46; }
  .ds-toast-info { --toast-color: #56768f; }
  .ds-toast-mark { display: grid; width: 26px; height: 26px; place-items: center; border-radius: 50%; color: var(--paper); background: var(--toast-color); }
  .ds-toast span:nth-child(2) { display: grid; gap: 3px; min-width: 0; flex: 1; }
  strong { color: var(--ink); font-family: var(--sans); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; }
  small { color: var(--ink-muted); font-size: 13px; }
  button { display: grid; width: 32px; height: 32px; place-items: center; border: 0; color: var(--ink-muted); background: transparent; cursor: pointer; }
  button:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
  @keyframes ds-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { .ds-toast { animation: none; } }
</style>
