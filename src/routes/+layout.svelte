<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
  import LightPullSwitch from '$lib/components/layout/LightPullSwitch.svelte';
  import SiteFooter from '$lib/components/layout/SiteFooter.svelte';
  import SiteHeader from '$lib/components/layout/SiteHeader.svelte';

  let { data, children } = $props();

  onMount(() => {
    const timer = window.setTimeout(() => {
      delete document.documentElement.dataset.initialLoad;
    }, 260);

    return () => window.clearTimeout(timer);
  });
</script>

<svelte:head>
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
</svelte:head>

<SiteHeader />
<LightPullSwitch />
{@render children()}
<SiteFooter socialData={data.socialData} />
