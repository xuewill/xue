<script lang="ts">
  import type { ResponsiveImage, TextSegment } from '$lib/types/content';

  export let body: readonly TextSegment[];
  export let portrait: ResponsiveImage;
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
    <img
      src={portrait.src}
      srcset={portrait.srcset}
      sizes="(max-width: 640px) 112px, 360px"
      alt={portraitAlt}
      width={portrait.width}
      height={portrait.height}
      loading="lazy"
      decoding="async"
    />
  </div>
</section>
