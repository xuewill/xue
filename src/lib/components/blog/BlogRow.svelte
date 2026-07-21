<script lang="ts">
  import type { PostSummary } from '$lib/types/content';

  export let post: PostSummary;

  function formatMonthDay(date: string) {
    const [, month, day] = date.split('-');
    return [month, '月', day, '日'].join('');
  }
</script>

<a class="blog-row" href={`/blog/${post.slug}`}>
  <time datetime={post.date}>{formatMonthDay(post.date)}</time>
  <span class="title">{post.title}</span>
  <span class="tag">{post.tags[0]}</span>
  {#if post.cover}
    <span class="row-thumb" aria-hidden="true">
      <img src={post.cover} alt="" loading="lazy" />
    </span>
  {/if}
</a>
