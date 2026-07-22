<script lang="ts">
  import { page } from '$app/state';
  import { siteConfig } from '$lib/config/site';
  import ThemeToggle from './ThemeToggle.svelte';

  const isHome = () => page.url.pathname === '/' || page.url.pathname.startsWith('/home/');
</script>

<header class="top">
  <a class="name" href="/">{siteConfig.author.name}</a>

  <nav aria-label="Primary navigation">
    <div class="menu">
      <a href="/" aria-current={isHome() ? 'page' : undefined}>home <span aria-hidden="true">▾</span></a>
      <div class="dropdown">
        {#each siteConfig.homeNavigation as item}
          <a href={item.href}>{item.label}</a>
        {/each}
      </div>
    </div>

    {#each siteConfig.navigation as item}
      <a href={item.href} aria-current={page.url.pathname.startsWith(item.href) ? 'page' : undefined}>
        {item.label}
      </a>
    {/each}

    <ThemeToggle />
  </nav>
</header>
