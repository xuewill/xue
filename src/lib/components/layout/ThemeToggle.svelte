<script lang="ts">
  import { onMount } from 'svelte';

  type Theme = 'light' | 'dark';

  const storageKey = 'xue-theme';
  let theme: Theme = 'light';

  onMount(() => {
    const current = document.documentElement.dataset.theme;
    if (current === 'light' || current === 'dark') theme = current;
  });

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(storageKey, theme);
  }
</script>

<button
  class="theme-toggle"
  type="button"
  aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
  aria-pressed={theme === 'dark'}
  title={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}
  onclick={toggleTheme}
>
  <svg class="theme-icon theme-icon-light" viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="10" cy="10" r="3.3"></circle>
    <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6 16 16M16 4l-1.4 1.4M5.4 14.6 4 16"></path>
  </svg>
  <svg class="theme-icon theme-icon-dark" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M15.9 13.7A7 7 0 0 1 6.3 4.1 7.4 7.4 0 1 0 15.9 13.7Z"></path>
  </svg>
</button>
