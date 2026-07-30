<script lang="ts">
  import { site as siteConfig } from '$lib/generated/content/index.js';

  interface Props {
    title?: string;
    description?: string;
    path?: string;
    image?: string;
    type?: 'article' | 'website';
    noindex?: boolean;
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  }

  let {
    title = siteConfig.title,
    description = siteConfig.description,
    path = '/',
    image = siteConfig.ogImage,
    type = 'website',
    noindex = false,
    jsonLd
  }: Props = $props();

  const documentTitle = $derived(title === siteConfig.title ? title : `${title} — ${siteConfig.title}`);
  const canonicalUrl = $derived(new URL(path, siteConfig.url).toString());
  const imageUrl = $derived(new URL(image, siteConfig.url).toString());
  const jsonLdText = $derived(jsonLd ? JSON.stringify(jsonLd).replaceAll('<', '\\u003c') : '');
  const jsonLdMarkup = $derived(
    jsonLdText
      ? ['<script type="application/ld+json">', jsonLdText, '</scr', 'ipt>'].join('')
      : ''
  );
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
  <meta property="og:image" content={imageUrl} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={imageUrl} />
  {#if noindex}<meta name="robots" content="noindex, nofollow" />{/if}
  <link rel="canonical" href={canonicalUrl} />
  <!-- JSON-LD is serialized from trusted repository content and escapes every '<' character. -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {#if jsonLdMarkup}{@html jsonLdMarkup}{/if}
</svelte:head>
