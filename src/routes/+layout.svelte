<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
  import LightPullSwitch from '$lib/components/layout/LightPullSwitch.svelte';
  import SiteFooter from '$lib/components/layout/SiteFooter.svelte';
  import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
  import { site as siteConfig } from '$lib/generated/content/index.js';

  let { data, children } = $props();

  onMount(() => {
    const timer = window.setTimeout(() => {
      delete document.documentElement.dataset.initialLoad;
    }, 260);

    return () => window.clearTimeout(timer);
  });
</script>

<svelte:head>
  {#each siteConfig.head.icons as icon (`${icon.rel}:${icon.sizes}`)}
    <link rel={icon.rel} type={icon.type} sizes={icon.sizes} href={icon.href} />
  {/each}
  <link rel="manifest" href={siteConfig.head.manifest} />
</svelte:head>

<SiteHeader />
<LightPullSwitch />
{@render children()}
<SiteFooter socialData={data.socialData} />
