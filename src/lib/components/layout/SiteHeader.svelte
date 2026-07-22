<script lang="ts">
  import { page } from '$app/state';
  import { siteConfig } from '$lib/config/site';
  import ThemeToggle from './ThemeToggle.svelte';

  const isWork = () => page.url.pathname === '/' || page.url.pathname.startsWith('/work/');
</script>

<header class="top">
  <a class="name" href="/">{siteConfig.author.name}</a>

  <nav aria-label="Primary navigation">
    <div class="menu">
      <a href="/#about" aria-current={isWork() ? 'page' : undefined}>work <span aria-hidden="true">▾</span></a>
      <div class="dropdown">
        {#each siteConfig.workNavigation as item}
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
