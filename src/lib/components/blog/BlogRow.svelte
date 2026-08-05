<script lang="ts">
  import { WeBaseTag } from '@webaseui/svelte';
  import type { PostSummary } from '$lib/types/content';
  import { tagConfig } from '$lib/generated/content/index.js';

  export let post: PostSummary;

  function formatMonthDay(date: string) {
    const [, month, day] = date.split('-');
    return [month, '月', day, '日'].join('');
  }

  $: primaryTag = tagConfig.tags.find((tag) => tag.slug === post.tags[0]);
</script>

<a class="blog-row" href={`/blog/${post.slug}`}>
  <time datetime={post.date}>{formatMonthDay(post.date)}</time>
  <span class="title">{post.title}</span>
  <WeBaseTag class="tag" variant="outline" label={primaryTag?.label ?? post.tags[0]} />
  {#if post.coverImage}
    <span class="row-thumb" aria-hidden="true">
      <img
        src={post.coverImage.src}
        srcset={post.coverImage.srcset}
        sizes="116px"
        alt=""
        width={post.coverImage.width}
        height={post.coverImage.height}
        loading="lazy"
        decoding="async"
      />
    </span>
  {/if}
</a>
