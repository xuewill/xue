<script lang="ts">
  import AboutSection from '$lib/components/home/AboutSection.svelte';
  import HeroSketchbook from '$lib/components/home/HeroSketchbook.svelte';
  import ProjectGrid from '$lib/components/home/ProjectGrid.svelte';
  import { homeConfig } from '$lib/config/home';

  let { data } = $props();
</script>

<main class="page home">
  <HeroSketchbook
    kicker={homeConfig.hero.kicker}
    title={homeConfig.hero.title}
    images={homeConfig.hero.images}
  />
  <AboutSection
    body={homeConfig.about.body}
    portrait={homeConfig.about.portrait}
    portraitAlt={homeConfig.about.portraitAlt}
  />
  <ProjectGrid heading={homeConfig.projects.heading} projects={data.projects} />
</main>
