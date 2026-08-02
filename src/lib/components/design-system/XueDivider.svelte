<script lang="ts">
  interface Props { label?: string; vertical?: boolean; }
  let { label = '', vertical = false }: Props = $props();
</script>

{#if vertical}
  <span class="ds-divider ds-divider-vertical" aria-hidden="true"></span>
{:else}
  <div class="ds-divider" role="separator">
    {#if label}<span>{label}</span>{/if}
  </div>
{/if}

<style>
  .ds-divider { display: flex; align-items: center; min-height: 20px; background-image: var(--dot-rule-image); background-position: center; background-repeat: repeat-x; background-size: 7px 2px; }
  .ds-divider span { padding-right: 14px; background: var(--paper); color: var(--brand); font-family: var(--mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; }
  .ds-divider-vertical { display: inline-block; width: 2px; min-height: 44px; background-image: var(--dot-rule-image); background-position: center; background-repeat: repeat-y; background-size: 2px 7px; }
</style>
