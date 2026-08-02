<script lang="ts">
  import XueIcon from './XueIcon.svelte';

  type Icon = 'arrow' | 'bookmark' | 'heart' | 'plus';

  interface Props {
    label: string;
    icon?: Icon;
    pressed?: boolean;
    disabled?: boolean;
    onclick?: (event: MouseEvent) => void;
  }

  let { label, icon = 'arrow', pressed = $bindable(false), disabled = false, onclick }: Props = $props();
</script>

<button class:pressed class="ds-icon-button" type="button" aria-label={label} aria-pressed={pressed} {disabled} {onclick}>
  {#if icon === 'bookmark'}
    <XueIcon name="bookmark" size={18} fill={pressed ? 'currentColor' : 'none'} />
  {:else if icon === 'heart'}
    <XueIcon name="heart" size={18} fill={pressed ? 'currentColor' : 'none'} />
  {:else if icon === 'plus'}
    <XueIcon name="plus" size={18} />
  {:else}
    <XueIcon name="arrow-up-right" size={18} />
  {/if}
</button>

<style>
  .ds-icon-button { display: inline-grid; width: 44px; height: 44px; place-items: center; border: 1px solid var(--hairline-strong); border-radius: 50%; color: var(--brand); background: transparent; cursor: pointer; font-family: var(--font); font-size: 20px; transition: background-color var(--duration-ui) var(--ease-out), color var(--duration-ui) var(--ease-out), transform var(--duration-fast) var(--ease-out); }
  .ds-icon-button:hover, .ds-icon-button.pressed { background: var(--brand); color: var(--paper); transform: rotate(4deg); }
  .ds-icon-button:focus-visible { outline: 2px solid var(--brand); outline-offset: 3px; }
  .ds-icon-button:disabled { cursor: not-allowed; opacity: .4; transform: none; }
  @media (prefers-reduced-motion: reduce) { .ds-icon-button { transition: none; } }
</style>
