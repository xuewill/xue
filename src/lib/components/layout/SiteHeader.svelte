<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { WeBaseLink } from '@webaseui/svelte';
  import { site as siteConfig } from '$lib/generated/content/index.js';
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
  <a class="name" href="/" aria-label={`${siteConfig.author.name} home`}>
    <img
      src={siteConfig.author.logoImage.src}
      srcset={siteConfig.author.logoImage.srcset}
      sizes="(max-width: 720px) 36px, 34px"
      alt=""
      width={siteConfig.author.logoImage.width}
      height={siteConfig.author.logoImage.height}
    />
  </a>

  <nav aria-label="Primary navigation">
    <div class="menu" class:touch-open={touchMenuOpen}>
      <WeBaseLink
        variant="nav"
        href={siteConfig.homeNavigation.href}
        aria-current={isHome() ? 'page' : undefined}
        aria-haspopup="true"
        aria-expanded={touchMenuOpen}
        aria-controls="home-dropdown"
        onclick={handleHomeClick}
      >
        {siteConfig.homeNavigation.label} <span class="menu-arrow" aria-hidden="true">▾</span>
      </WeBaseLink>
      <div id="home-dropdown" class="dropdown">
        {#each siteConfig.homeNavigation.items as item (item.href)}
          <WeBaseLink variant="nav" href={item.href} onclick={() => (touchMenuOpen = false)}>
            {item.label}
          </WeBaseLink>
        {/each}
      </div>
    </div>

    {#each siteConfig.navigation as item (item.href)}
      <WeBaseLink
        variant="nav"
        href={item.href}
        label={item.label}
        aria-current={page.url.pathname.startsWith(item.href) ? 'page' : undefined}
      />
    {/each}

    <ThemeToggle />
  </nav>
</header>
