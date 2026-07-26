<script lang="ts">
  import { siteConfig } from '$lib/config/site';

  interface Props {
    title?: string;
    description?: string;
    path?: string;
    image?: string;
    type?: 'article' | 'website';
    noindex?: boolean;
  }

  let {
    title = siteConfig.title,
    description = siteConfig.description,
    path = '/',
    image,
    type = 'website',
    noindex = false
  }: Props = $props();

  const documentTitle = $derived(title === siteConfig.title ? title : `${title} — ${siteConfig.title}`);
  const canonicalUrl = $derived(new URL(path, siteConfig.url).toString());
  const imageUrl = $derived(image ? new URL(image, siteConfig.url).toString() : undefined);
</script>

<svelte:head>
  <title>{documentTitle}</title>
  <meta name="description" content={description} />
  <meta property="og:type" content={type} />
  <meta property="og:site_name" content={siteConfig.title} />
  <meta property="og:locale" content={siteConfig.locale.replace('-', '_')} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  {#if imageUrl}<meta property="og:image" content={imageUrl} />{/if}
  <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  {#if imageUrl}<meta name="twitter:image" content={imageUrl} />{/if}
  {#if noindex}<meta name="robots" content="noindex, nofollow" />{/if}
  <link rel="canonical" href={canonicalUrl} />
</svelte:head>
