<script lang="ts">
  import type { PostSummary } from '$lib/types/content';
  import BlogRow from './BlogRow.svelte';

  export let posts: PostSummary[];

  function groupByYear(items: PostSummary[]) {
    const groups = new Map<string, PostSummary[]>();

    for (const post of items) {
      const year = post.date.slice(0, 4);
      const group = groups.get(year);

      if (group) group.push(post);
      else groups.set(year, [post]);
    }

    return Array.from(groups, ([year, groupedPosts]) => ({ year, posts: groupedPosts }));
  }

  $: postGroups = groupByYear(posts);
</script>

<div class="blog-year-groups">
  {#each postGroups as group (group.year)}
    <section class="blog-year-group" aria-labelledby={'blog-year-' + group.year}>
      <h2 class="blog-year" id={'blog-year-' + group.year}>{group.year}</h2>
      <div class="blog-rows">
        {#each group.posts as post (post.slug)}
          <BlogRow {post} />
        {/each}
      </div>
    </section>
  {/each}
</div>
