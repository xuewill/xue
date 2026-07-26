<script lang="ts">
  import type { TextSegment } from '$lib/types/content';

  export let body: readonly TextSegment[];
  export let portrait: string;
  export let portraitAlt: string;
</script>

<section id="about" class="about">
  <div class="about-text">
    <p class="bio">
      {#each body as segment, index (`${index}:${segment.text}`)}
        {#if segment.href}
          <a href={segment.href} target="_blank" rel="noreferrer" class="bio-link">{segment.text}</a>
        {:else}
          <span>{segment.text}</span>
        {/if}
      {/each}
    </p>
  </div>
  <div class="headshot">
    <img src={portrait} alt={portraitAlt} width="990" height="1391" loading="lazy" />
  </div>
</section>
