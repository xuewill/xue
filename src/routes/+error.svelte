<script lang="ts">
  import { page } from '$app/state';
  import Seo from '$lib/components/layout/Seo.svelte';
</script>

<Seo
  title={page.status === 404 ? 'Page not found' : 'Something went wrong'}
  description="The requested page could not be displayed."
  path={page.url.pathname}
  noindex
/>

<main class="page error-page">
  <p class="section-label">{page.status}</p>
  <h1>{page.status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
  <a class="back-link" href="/">← home</a>
</main>
