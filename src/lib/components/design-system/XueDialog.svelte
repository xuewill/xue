<script lang="ts">
  import { tick } from 'svelte';
  import XueIcon from './XueIcon.svelte';

  interface Props { open?: boolean; title?: string; message?: string; id?: string; confirmLabel?: string; }
  let { open = $bindable(false), title = 'A quiet confirmation', message = 'Dialogs keep consequential actions in focus.', id = 'xue-dialog', confirmLabel = 'Confirm' }: Props = $props();
  let dialog = $state<HTMLDivElement>();

  $effect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    void tick().then(() => dialog?.focus());

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        open = false;
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((element) => !element.hasAttribute('disabled'));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      previousFocus?.focus();
    };
  });
</script>

{#if open}
  <div class="ds-dialog-scrim" role="presentation" onclick={(event) => event.currentTarget === event.target && (open = false)}>
    <div class="ds-dialog" bind:this={dialog} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-message`} tabindex="-1">
      <button class="ds-dialog-close" type="button" aria-label="Close dialog" onclick={() => (open = false)}><XueIcon name="x" size={19} /></button>
      <p class="ds-dialog-kicker">Dialog / modal</p>
      <h3 id={`${id}-title`}>{title}</h3>
      <p id={`${id}-message`}>{message}</p>
      <div class="ds-dialog-actions"><button class="quiet" type="button" onclick={() => (open = false)}>Cancel</button><button type="button" onclick={() => (open = false)}>{confirmLabel}</button></div>
    </div>
  </div>
{/if}

<style>
  .ds-dialog-scrim { position: fixed; inset: 0; z-index: 800; display: grid; place-items: center; padding: 24px; background: rgb(20 20 19 / 45%); backdrop-filter: blur(3px); }
  .ds-dialog-scrim { animation: ds-dialog-scrim-in var(--duration-fast) var(--ease-out) both; }
  .ds-dialog { position: relative; width: min(460px, 100%); padding: 30px; border: 1px solid var(--hairline-strong); color: var(--ink); background: var(--paper); box-shadow: 12px 12px 0 rgb(20 20 19 / 25%); animation: ds-dialog-in var(--duration-ui) var(--ease-out) both; }
  .ds-dialog:focus { outline: none; }
  .ds-dialog-close { position: absolute; top: 14px; right: 14px; display: grid; width: 36px; height: 36px; place-items: center; border: 0; color: var(--ink-muted); background: transparent; cursor: pointer; }
  .ds-dialog-kicker { margin: 0 0 16px; color: var(--brand); font-family: var(--mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; }
  h3 { margin: 0 0 12px; font-family: var(--font); font-size: 34px; font-weight: 500; letter-spacing: -.04em; line-height: .98; }
  .ds-dialog p:not(.ds-dialog-kicker) { margin: 0; color: var(--ink-muted); line-height: 1.5; }
  .ds-dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 28px; }
  .ds-dialog-actions button { min-height: 40px; padding: 0 14px; border: 1px solid var(--brand); color: var(--paper); background: var(--brand); cursor: pointer; font-family: var(--sans); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
  .ds-dialog-actions button.quiet { color: var(--ink-muted); border-color: transparent; background: transparent; }
  button:focus-visible { outline: 2px solid var(--brand); outline-offset: 3px; }
  @keyframes ds-dialog-scrim-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes ds-dialog-in { from { opacity: 0; transform: translateY(12px) rotate(-.4deg); } to { opacity: 1; transform: translateY(0) rotate(0); } }
  @media (prefers-reduced-motion: reduce) { .ds-dialog-scrim, .ds-dialog { animation: none; } }
</style>
