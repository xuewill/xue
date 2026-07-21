<script lang="ts">
  import { page } from '$app/state';
</script>

<main class="page error-page">
  <p class="section-label">{page.status}</p>
  <h1>{page.status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
  <a class="back-link" href="/">← home</a>
</main>
