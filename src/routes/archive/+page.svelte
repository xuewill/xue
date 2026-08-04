<script lang="ts">
  import Seo from '$lib/components/layout/Seo.svelte';
  import { site as siteConfig } from '$lib/generated/content/index.js';
  import type { ArchiveEntry } from '$lib/types/content';

  interface Props {
    data: { entries: ArchiveEntry[] };
  }

  let { data }: Props = $props();
  let activeKind = $state<'all' | ArchiveEntry['kind']>('all');
  const kinds = [
    { value: 'all' as const, label: 'All work' },
    { value: 'post' as const, label: 'Writing' },
    { value: 'project' as const, label: 'Projects' },
    { value: 'album' as const, label: 'Album' }
  ];
  const visibleEntries = $derived(
    activeKind === 'all' ? data.entries : data.entries.filter((entry) => entry.kind === activeKind)
  );
  const groupedEntries = $derived(
    visibleEntries.reduce<Map<number, ArchiveEntry[]>>((groups, entry) => {
      const group = groups.get(entry.year) ?? [];
      group.push(entry);
      groups.set(entry.year, group);
      return groups;
    }, new Map())
  );
</script>

<Seo
  title="Archive"
  description="A time-ordered archive of writing, projects, and visual works by Will Xue."
  path="/archive"
  jsonLd={{
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Archive',
    description: 'A time-ordered archive of writing, projects, and visual works by Will Xue.',
    url: new URL('/archive', siteConfig.url).toString()
  }}
 />

<main class="page listing-page archive-page">
  <header class="archive-header">
    <div>
      <p class="section-label">Archive</p>
      <h1>A record of making, noticing, and writing.</h1>
      <p class="archive-intro">One quiet index for the things that have stayed long enough to become part of the work.</p>
    </div>
    <span class="archive-count">{visibleEntries.length.toString().padStart(2, '0')} entries</span>
  </header>

  <nav class="archive-filters" aria-label="Filter archive">
    {#each kinds as kind (kind.value)}
      <button type="button" class:active={activeKind === kind.value} aria-pressed={activeKind === kind.value} onclick={() => (activeKind = kind.value)}>
        {kind.label}
      </button>
    {/each}
  </nav>

  <div class="archive-timeline">
    {#each [...groupedEntries.entries()] as [year, entries] (year)}
      <section class="archive-year" aria-labelledby={`archive-year-${year}`}>
        <h2 id={`archive-year-${year}`}>{year}</h2>
        <div class="archive-entries">
          {#each entries as entry (entry.kind + entry.slug)}
            <a class={`archive-entry archive-${entry.kind}`} href={entry.href}>
              <span class="archive-entry-date"><time datetime={entry.date}>{entry.dateLabel}</time></span>
              <span class="archive-entry-main">
                <span class="archive-entry-kind">{entry.kind === 'post' ? 'Writing' : entry.kind === 'project' ? 'Project' : 'Album'}</span>
                <strong>{entry.title}</strong>
                {#if entry.description}<span class="archive-entry-description">{entry.description}</span>{/if}
                {#if entry.metadata.length > 0}
                  <span class="archive-entry-meta">{entry.metadata.map((item) => item.label).join(' / ')}</span>
                {/if}
              </span>
              {#if entry.image}
                <img src={entry.image.src} srcset={entry.image.srcset} sizes="96px" alt="" width={entry.image.width} height={entry.image.height} loading="lazy" decoding="async" />
              {/if}
              <span class="archive-arrow" aria-hidden="true">↗</span>
            </a>
          {/each}
        </div>
      </section>
    {/each}
  </div>
</main>

<style>
  .archive-header { display: flex; align-items: end; justify-content: space-between; gap: 32px; margin-bottom: 48px; }
  .archive-header h1 { max-width: 620px; margin: 12px 0 16px; font-family: var(--font); font-size: clamp(38px, 7vw, 78px); font-weight: 500; letter-spacing: -0.045em; line-height: .95; }
  .archive-intro { max-width: 520px; margin: 0; color: var(--ink-muted); font-size: 16px; line-height: 1.55; }
  .archive-count { color: var(--brand); font-family: var(--mono); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; }
  .archive-filters { display: flex; gap: 8px; margin-bottom: 34px; padding-bottom: 12px; background-image: var(--dot-rule-image); background-position: left bottom; background-repeat: repeat-x; background-size: 7px 2px; }
  .archive-filters button { min-height: 44px; padding: 0 14px; border: 1px solid transparent; color: var(--ink-muted); background: transparent; font-family: var(--sans); font-size: 11px; letter-spacing: var(--track-nav); text-transform: uppercase; }
  .archive-filters button:hover, .archive-filters button:focus-visible, .archive-filters button.active { border-color: var(--brand); color: var(--brand); }
  .archive-timeline { background-image: var(--dot-rule-image); background-position: left top; background-repeat: repeat-x; background-size: 7px 2px; }
  .archive-year { display: grid; grid-template-columns: 100px 1fr; gap: 30px; padding: 28px 0 42px; background-image: var(--dot-rule-image); background-position: left bottom; background-repeat: repeat-x; background-size: 7px 2px; }
  .archive-year h2 { margin: 0; color: var(--brand); font-family: var(--mono); font-size: 15px; font-weight: 400; letter-spacing: .08em; }
  .archive-entries { display: grid; gap: 0; }
  .archive-entry { display: grid; grid-template-columns: 88px minmax(0, 1fr) 96px 20px; align-items: center; gap: 18px; min-height: 126px; padding: 18px 0; color: var(--ink); background-image: var(--dot-rule-image); background-position: left top; background-repeat: repeat-x; background-size: 7px 2px; }
  .archive-entry:first-child { background-image: none; }
  .archive-entry-date { align-self: start; padding-top: 4px; color: var(--ink-muted); font-family: var(--mono); font-size: 11px; }
  .archive-entry-main { display: grid; gap: 5px; min-width: 0; }
  .archive-entry-kind { color: var(--brand); font-family: var(--mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; }
  .archive-entry strong { overflow: hidden; font-family: var(--font); font-size: clamp(20px, 2.7vw, 30px); font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
  .archive-entry-description { overflow: hidden; color: var(--ink-muted); font-size: 14px; line-height: 1.4; text-overflow: ellipsis; white-space: nowrap; }
  .archive-entry-meta { color: var(--ink-muted); font-family: var(--sans); font-size: 11px; letter-spacing: .03em; }
  .archive-entry img { width: 96px; height: 76px; object-fit: cover; filter: saturate(.86); }
  .archive-arrow { color: var(--brand); font-size: 18px; transition: transform var(--duration-ui) var(--ease-out); }
  .archive-entry:hover strong, .archive-entry:focus-visible strong { color: var(--brand); }
  .archive-entry:hover .archive-arrow, .archive-entry:focus-visible .archive-arrow { transform: translate(3px, -3px); }
  @media (max-width: 680px) {
    .archive-header { display: block; margin-bottom: 34px; }
    .archive-count { display: block; margin-top: 22px; }
    .archive-filters { overflow-x: auto; }
    .archive-year { grid-template-columns: 1fr; gap: 12px; padding: 22px 0 28px; }
    .archive-entry { grid-template-columns: 82px minmax(0, 1fr) 18px; gap: 12px; min-height: 112px; }
    .archive-entry img { display: none; }
    .archive-entry strong { white-space: normal; }
    .archive-entry-description { white-space: normal; }
  }
  @media (prefers-reduced-motion: reduce) { .archive-arrow { transition: none; } }
</style>
