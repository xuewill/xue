<script lang="ts">
  import '../app.css';
  import LightPullSwitch from '$lib/components/layout/LightPullSwitch.svelte';
  import SiteFooter from '$lib/components/layout/SiteFooter.svelte';
  import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
  import { siteConfig } from '$lib/config/site';

  let { children } = $props();
</script>

<svelte:head>
  <title>{siteConfig.title}</title>
  <meta name="description" content={siteConfig.description} />
  <meta property="og:title" content={siteConfig.title} />
  <meta property="og:description" content={siteConfig.description} />
  <meta property="og:url" content={siteConfig.url} />
  <meta name="twitter:card" content="summary" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
</svelte:head>

<SiteHeader />
<LightPullSwitch />
{@render children()}
<SiteFooter />
