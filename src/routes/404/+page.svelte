<script lang="ts">
  import Seo from '$lib/components/layout/Seo.svelte';
</script>

<Seo
  title="Page not found"
  description="The requested page could not be displayed."
  path="/404"
  noindex
/>

<main class="page error-page">
  <p class="section-label">404</p>
  <h1>Page not found</h1>
  <a class="back-link" href="/">← home</a>
</main>
