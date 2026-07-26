<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { siteConfig } from '$lib/config/site';
  import ThemeToggle from './ThemeToggle.svelte';

  let coarsePointer = false;
  let touchMenuOpen = false;

  const isHome = () => page.url.pathname === '/' || page.url.pathname.startsWith('/home/');

  function handleHomeClick(event: MouseEvent) {
    if (!coarsePointer || !isHome()) return;

    if (!touchMenuOpen) {
      event.preventDefault();
      touchMenuOpen = true;
    } else {
      touchMenuOpen = false;
    }
  }

  onMount(() => {
    const pointerQuery = window.matchMedia('(hover: none), (pointer: coarse)');
    coarsePointer = pointerQuery.matches;

    const handlePointerChange = () => {
      coarsePointer = pointerQuery.matches;
      if (!coarsePointer) touchMenuOpen = false;
    };
    const handleOutsidePointer = (event: PointerEvent) => {
      if (!touchMenuOpen) return;
      const target = event.target;
      if (target instanceof Element && target.closest('.menu')) return;
      touchMenuOpen = false;
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && touchMenuOpen) {
        touchMenuOpen = false;
      }
    };

    pointerQuery.addEventListener('change', handlePointerChange);
    document.addEventListener('pointerdown', handleOutsidePointer);
    document.addEventListener('keydown', handleEscape);

    return () => {
      pointerQuery.removeEventListener('change', handlePointerChange);
      document.removeEventListener('pointerdown', handleOutsidePointer);
      document.removeEventListener('keydown', handleEscape);
    };
  });
</script>

<header class="top">
  <a class="name" href="/">{siteConfig.author.name}</a>

  <nav aria-label="Primary navigation">
    <div class="menu" class:touch-open={touchMenuOpen}>
      <a
        href="/"
        aria-current={isHome() ? 'page' : undefined}
        aria-haspopup="true"
        aria-expanded={touchMenuOpen}
        aria-controls="home-dropdown"
        onclick={handleHomeClick}
      >
        home <span class="menu-arrow" aria-hidden="true">▾</span>
      </a>
      <div id="home-dropdown" class="dropdown">
        {#each siteConfig.homeNavigation as item (item.href)}
          <a href={item.href} onclick={() => (touchMenuOpen = false)}>{item.label}</a>
        {/each}
      </div>
    </div>

    {#each siteConfig.navigation as item (item.href)}
      <a href={item.href} aria-current={page.url.pathname.startsWith(item.href) ? 'page' : undefined}>
        {item.label}
      </a>
    {/each}

    <ThemeToggle />
  </nav>
</header>
