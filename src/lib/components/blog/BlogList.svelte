<script lang="ts">
  import type { PostSummary } from '$lib/types/content';
  import BlogRow from './BlogRow.svelte';

  export let posts: PostSummary[];

  function groupByYear(items: PostSummary[]) {
    const groups: Array<{ year: string; posts: PostSummary[] }> = [];

    for (const post of items) {
      const year = post.date.slice(0, 4);
      const group = groups.at(-1);

      if (group?.year === year) group.posts.push(post);
      else groups.push({ year, posts: [post] });
    }

    return groups;
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
