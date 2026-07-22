<script lang="ts">
  import type { ProjectSummary } from '$lib/types/content';

  export let project: ProjectSummary;
</script>

<a class="project-card" href={`/home/${project.slug}`}>
  <div class="thumb">
    <img src={project.cover} alt="" loading="lazy" />
  </div>
  <div class="cap">
    <span class="title">{project.title}</span>
    <span class="category">{project.category}</span>
  </div>
</a>
