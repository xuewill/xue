<script lang="ts">
  import type { ProjectSummary } from '$lib/types/content';

  export let project: ProjectSummary;
</script>

<a class="project-card" href={`/home/${project.slug}`}>
  <div class="thumb">
    <img
      src={project.coverImage.src}
      srcset={project.coverImage.srcset}
      sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1100px) 46vw, 360px"
      alt=""
      width={project.coverImage.width}
      height={project.coverImage.height}
      loading="lazy"
      decoding="async"
    />
  </div>
  <div class="cap">
    <span class="title">{project.title}</span>
    <span class="category">{project.category}</span>
  </div>
</a>
