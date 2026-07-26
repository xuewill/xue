<script lang="ts">
  import AboutSection from '$lib/components/home/AboutSection.svelte';
  import HeroSketchbook from '$lib/components/home/HeroSketchbook.svelte';
  import ProjectGrid from '$lib/components/home/ProjectGrid.svelte';
  import Seo from '$lib/components/layout/Seo.svelte';
  import { homeConfig } from '$lib/config/home';

  let { data } = $props();
</script>

<Seo />

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
