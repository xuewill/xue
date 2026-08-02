<script lang="ts">
  import { onMount } from 'svelte';
  import XueIcon from './XueIcon.svelte';

  interface Option {
    label: string;
    value: string;
  }

  interface Props {
    label: string;
    id?: string;
    options: Option[];
    value?: string;
    help?: string;
    error?: string;
    disabled?: boolean;
  }

  let {
    label,
    id = `xue-select-${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`,
    options,
    value = $bindable(options[0]?.value ?? ''),
    help = '',
    error = '',
    disabled = false
  }: Props = $props();

  let open = $state(false);
  let highlightedIndex = $state(0);
  let root: HTMLDivElement;
  let trigger: HTMLButtonElement;
  let typeahead = '';
  let typeaheadTimer: number;

  const menuId = $derived(`${id}-menu`);
  const descriptionId = $derived(`${id}-${error ? 'error' : 'help'}`);

  function selectedIndex() {
    return Math.max(0, options.findIndex((option) => option.value === value));
  }

  function selectedOption() {
    return options.find((option) => option.value === value) ?? options[0];
  }

  function openMenu(index = selectedIndex()) {
    if (disabled || !options.length) return;
    highlightedIndex = Math.min(Math.max(index, 0), options.length - 1);
    open = true;
  }

  function closeMenu(restoreFocus = false) {
    open = false;
    highlightedIndex = selectedIndex();
    if (restoreFocus) trigger?.focus();
  }

  function chooseOption(index: number) {
    const option = options[index];
    if (!option) return;
    value = option.value;
    highlightedIndex = index;
    closeMenu(true);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (disabled || !options.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu(open ? (highlightedIndex + 1) % options.length : selectedIndex());
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu(open ? (highlightedIndex - 1 + options.length) % options.length : selectedIndex());
    } else if (event.key === 'Home' && open) {
      event.preventDefault();
      highlightedIndex = 0;
    } else if (event.key === 'End' && open) {
      event.preventDefault();
      highlightedIndex = options.length - 1;
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault();
      chooseOption(highlightedIndex);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      closeMenu(true);
    } else if (event.key === 'Tab' && open) {
      closeMenu();
    } else if (event.key.length === 1 && /\S/.test(event.key)) {
      typeahead += event.key.toLocaleLowerCase();
      window.clearTimeout(typeaheadTimer);
      typeaheadTimer = window.setTimeout(() => (typeahead = ''), 500);
      const match = options.findIndex((option) => option.label.toLocaleLowerCase().startsWith(typeahead));
      if (match >= 0) openMenu(match);
    }
  }

  onMount(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (open && root && event.target instanceof Node && !root.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.clearTimeout(typeaheadTimer);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  });
</script>

<div class="ds-select" bind:this={root}>
  <span class="ds-select-label" id={`${id}-label`}>{label}</span>
  <button
    {id}
    bind:this={trigger}
    class="ds-select-trigger"
    class:is-open={open}
    type="button"
    role="combobox"
    aria-labelledby={`${id}-label`}
    aria-controls={menuId}
    aria-expanded={open}
    aria-haspopup="listbox"
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error || help ? descriptionId : undefined}
    aria-activedescendant={open ? `${menuId}-${highlightedIndex}` : undefined}
    {disabled}
    onclick={() => (open ? closeMenu() : openMenu())}
    onkeydown={handleKeydown}
  >
    <span class="ds-select-value">{selectedOption()?.label ?? 'Select an option'}</span>
    <XueIcon class="ds-select-chevron" name="chevron-down" size={18} strokeWidth={1.6} />
  </button>

  {#if open}
    <div class="ds-select-menu" id={menuId} role="listbox" aria-labelledby={`${id}-label`}>
      {#each options as option, index (option.value)}
        <button
          id={`${menuId}-${index}`}
          class="ds-select-option"
          class:is-highlighted={highlightedIndex === index}
          class:is-selected={value === option.value}
          type="button"
          role="option"
          tabindex="-1"
          aria-selected={value === option.value}
          onclick={() => chooseOption(index)}
          onmouseenter={() => (highlightedIndex = index)}
        >
          <span>{option.label}</span>
          {#if value === option.value}
            <XueIcon class="ds-select-check" name="check" size={16} strokeWidth={1.8} />
          {/if}
        </button>
      {/each}
    </div>
  {/if}
  {#if error}<span class="ds-select-error" id={descriptionId}>{error}</span>{:else if help}<span class="ds-select-help" id={descriptionId}>{help}</span>{/if}
</div>

<style>
  .ds-select {
    position: relative;
    display: grid;
    gap: 8px;
  }

  .ds-select-label {
    color: var(--ink);
    font-family: var(--sans);
    font-size: 11px;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .ds-select-trigger {
    position: relative;
    display: flex;
    width: 100%;
    min-height: 46px;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 42px 0 12px;
    border: 1px solid var(--hairline-strong);
    border-radius: 0;
    color: var(--ink);
    background: var(--surface);
    cursor: pointer;
    font-family: var(--font);
    font-size: 16px;
    text-align: left;
    transition:
      border-color var(--duration-fast) var(--ease-out),
      background-color var(--duration-ui) var(--ease-out),
      box-shadow var(--duration-ui) var(--ease-out);
  }

  .ds-select-trigger:hover,
  .ds-select-trigger.is-open {
    border-color: var(--brand);
    background: color-mix(in srgb, var(--brand-tint) 36%, var(--surface));
  }

  .ds-select-trigger.is-open {
    box-shadow: 4px 4px 0 color-mix(in srgb, var(--brand) 16%, transparent);
  }

  .ds-select-trigger:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 3px;
  }

  .ds-select-trigger[aria-invalid='true'] { border-color: #9b4c46; box-shadow: 4px 4px 0 color-mix(in srgb, #9b4c46 14%, transparent); }
  .ds-select-trigger:disabled { cursor: not-allowed; opacity: .55; }

  .ds-select-value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ds-select-trigger :global(.ds-select-chevron) {
    position: absolute;
    top: 50%;
    right: 12px;
    color: var(--brand);
    pointer-events: none;
    transform: translateY(-50%);
    transition: transform var(--duration-ui) var(--ease-out), color var(--duration-fast) var(--ease-out);
  }

  .ds-select-trigger.is-open :global(.ds-select-chevron) {
    transform: translateY(-50%) rotate(180deg);
  }

  .ds-select-menu {
    position: absolute;
    top: calc(100% + 9px);
    right: 0;
    left: 0;
    z-index: 40;
    display: grid;
    max-height: 220px;
    overflow-y: auto;
    padding: 6px;
    border: 1px solid var(--hairline-strong);
    background:
      radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--ink) 8%, transparent) 0 .6px, transparent .8px)
        0 0 / 12px 12px,
      var(--surface);
    box-shadow: 8px 8px 0 color-mix(in srgb, var(--brand) 15%, transparent), var(--whisper-shadow);
    transform-origin: top center;
    animation: ds-select-menu-in var(--duration-ui) var(--ease-out) both;
  }

  .ds-select-option {
    display: flex;
    min-height: 40px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 0 10px;
    border: 0;
    color: var(--ink);
    background: transparent;
    cursor: pointer;
    font-family: var(--font);
    font-size: 15px;
    text-align: left;
    transition: background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out);
  }

  .ds-select-option:hover,
  .ds-select-option.is-highlighted {
    color: var(--brand);
    background: color-mix(in srgb, var(--brand-tint) 70%, transparent);
    transform: translateX(3px);
  }

  .ds-select-option.is-selected {
    color: var(--brand);
  }

  .ds-select-option :global(.ds-select-check) {
    flex: none;
    animation: ds-select-check-in var(--duration-fast) var(--ease-out) both;
  }

  .ds-select-help, .ds-select-error { color: var(--ink-muted); font-size: 12px; line-height: 1.4; }
  .ds-select-error { color: #9b4c46; }

  @keyframes ds-select-menu-in {
    from { opacity: 0; transform: translateY(-5px) scaleY(.98); }
    to { opacity: 1; transform: translateY(0) scaleY(1); }
  }

  @keyframes ds-select-check-in {
    from { opacity: 0; transform: scale(.65) rotate(-12deg); }
    to { opacity: 1; transform: scale(1) rotate(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ds-select-trigger,
    .ds-select-trigger :global(.ds-select-chevron),
    .ds-select-option,
    .ds-select-menu,
    .ds-select-option :global(.ds-select-check) { animation: none; transition: none; }
  }
</style>
