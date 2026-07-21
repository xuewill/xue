<script lang="ts">
  import type { ProjectSummary } from '$lib/types/content';
  import ProjectCard from './ProjectCard.svelte';

  export let heading: string;
  export let projects: ProjectSummary[];
</script>

<section id="projects" class="projects-section">
  <p class="section-label">{heading}</p>
  <div class="project-grid">
    {#each projects as project (project.slug)}
      <ProjectCard {project} />
    {/each}
  </div>
</section>
