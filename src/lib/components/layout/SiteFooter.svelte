<script lang="ts">
  import { siteConfig } from '$lib/config/site';
</script>

<footer class="foot">
  <nav class="footer-socials" aria-label="Social links">
    {#each siteConfig.social as item}
      <a
        href={item.href}
        target={item.href.startsWith('http') ? '_blank' : undefined}
        rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
        class="icon-btn"
        aria-label={item.label}
      >
        <span
          class="icon-mask"
          style={`--icon: url('${item.icon}')`}
          aria-hidden="true"
        ></span>
      </a>
    {/each}
  </nav>
  <p class="footer-copyright">© {siteConfig.author.name} {new Date().getFullYear()}</p>
</footer>
