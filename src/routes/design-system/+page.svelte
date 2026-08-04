<script lang="ts">
  import Seo from '$lib/components/layout/Seo.svelte';
  import {
    WeBaseAccordion,
    WeBaseAlert,
    WeBaseBadge,
    WeBaseBreadcrumbs,
    WeBaseButton,
    WeBaseCard,
    WeBaseCheck,
    WeBaseDialog,
    WeBaseDivider,
    WeBaseEmptyState,
    WeBaseField,
    WeBaseIcon,
    WeBaseIconButton,
    WeBaseLoader,
    WeBasePagination,
    WeBaseProgress,
    WeBaseRadio,
    WeBaseSectionHeader,
    WeBaseSelect,
    WeBaseSkeleton,
    WeBaseSlider,
    WeBaseSwitch,
    WeBaseTabs,
    WeBaseTextarea,
    WeBaseToast,
    WeBaseTooltip
  } from '@webaseui/svelte';
  import { componentApi } from '$lib/components/design-system/api';

  type Section = { id: string; label: string; note: string };
  type Token = { name: string; value: string; note: string; sample?: string; kind?: 'color' | 'type' | 'space' | 'motion' };

  const sections: Section[] = [
    { id: 'overview', label: 'Overview', note: 'A working catalogue, not a frozen library.' },
    { id: 'color', label: 'Color', note: 'Paper, ink, and blue registration marks.' },
    { id: 'type', label: 'Typography', note: 'Editorial voice with utility labels.' },
    { id: 'space', label: 'Spacing', note: 'Measured breathing room for quiet pages.' },
    { id: 'borders', label: 'Borders', note: 'Hairlines, dots, and focus rings.' },
    { id: 'shadows', label: 'Shadows', note: 'Small physical offsets, never floating UI.' },
    { id: 'components', label: 'Components', note: 'Everyday controls in their native habitat.' },
    { id: 'icons', label: 'Iconography', note: 'A small vocabulary of marks.' },
    { id: 'motion', label: 'Motion', note: 'A page turn, a nudge, a measured pause.' },
    { id: 'materials', label: 'Materials', note: 'Paper, pressure, translucency, and overprint.' }
  ];

  const colors: Token[] = [
    { name: 'Paper', value: 'var(--paper)', note: 'Primary canvas and the light theme ground.', sample: 'paper', kind: 'color' },
    { name: 'Surface', value: 'var(--surface)', note: 'Raised paper for cards and controls.', sample: 'surface', kind: 'color' },
    { name: 'Ink', value: 'var(--ink)', note: 'Long-form reading and high-contrast headings.', sample: 'ink', kind: 'color' },
    { name: 'Ink muted', value: 'var(--ink-muted)', note: 'Secondary metadata and quiet instructions.', sample: 'muted', kind: 'color' },
    { name: 'Blue mark', value: 'var(--brand)', note: 'Links, active states, and the registration mark.', sample: 'brand', kind: 'color' },
    { name: 'Blue wash', value: 'var(--brand-tint)', note: 'A soft field behind selected controls.', sample: 'tint', kind: 'color' }
  ];

  const statusTokens: Token[] = [
    { name: 'Error', value: 'var(--status-error)', note: 'Validation failures and destructive outcomes.', sample: 'status-error', kind: 'color' },
    { name: 'Success', value: 'var(--status-success)', note: 'Completed saves and healthy metadata.', sample: 'status-success', kind: 'color' },
    { name: 'Warning', value: 'var(--status-warning)', note: 'Work in progress and experimental marks.', sample: 'status-warning', kind: 'color' },
    { name: 'Info', value: 'var(--status-info)', note: 'Neutral notices that need no action.', sample: 'status-info', kind: 'color' }
  ];

  const typeTokens: Token[] = [
    { name: 'Reading serif', value: 'var(--font)', note: 'Charter / Palatino / Georgia fallback for essays.', sample: 'The quiet archive', kind: 'type' },
    { name: 'Display italic', value: 'var(--display)', note: 'Cormorant for a small editorial accent.', sample: 'A note in the margin', kind: 'type' },
    { name: 'Utility sans', value: 'var(--sans)', note: 'Futura for navigation, controls, and labels.', sample: 'PUBLISHED / 2026', kind: 'type' },
    { name: 'Annotation mono', value: 'var(--mono)', note: 'Coordinates, token values, and system notes.', sample: 'space-24 · 24px', kind: 'type' }
  ];

  const spacingTokens: Token[] = [
    { name: 'space-1', value: '4px', note: 'Micro gap between a label and a mark.', sample: '4', kind: 'space' },
    { name: 'space-2', value: '8px', note: 'Control internals and compact lists.', sample: '8', kind: 'space' },
    { name: 'space-3', value: '16px', note: 'The smallest comfortable content gap.', sample: '16', kind: 'space' },
    { name: 'space-4', value: '24px', note: 'Card padding and related content.', sample: '24', kind: 'space' },
    { name: 'space-5', value: '40px', note: 'Section rhythm on narrow screens.', sample: '40', kind: 'space' },
    { name: 'space-6', value: '64px', note: 'Desktop section rhythm and margins.', sample: '64', kind: 'space' }
  ];

  const borderTokens: Token[] = [
    { name: 'Hairline', value: '1px solid var(--hairline)', note: 'Quiet edges around paper surfaces.' },
    { name: 'Strong hairline', value: '1px solid var(--hairline-strong)', note: 'Interactive edges and field boundaries.' },
    { name: 'Dot rule', value: 'radial-gradient(circle, ...)', note: 'The archive and chapter divider signature.' },
    { name: 'Focus ring', value: '2px solid var(--brand)', note: 'Visible keyboard focus with a 3–4px offset.' }
  ];

  const shadowTokens: Token[] = [
    { name: 'Book shadow', value: 'rgb(20 20 19 / 14%)', note: 'A close, soft edge for physical controls.' },
    { name: 'Whisper shadow', value: '0 16px 36px rgb(20 20 19 / 8%)', note: 'Reserved for lifted image cards and modals.' },
    { name: 'Offset print', value: '8px 8px 0 blue / 12%', note: 'The design-system specimen card’s physical offset.' }
  ];

  let activeSection = $state('overview');
  let fieldValue = $state('a small field note');
  let messageValue = $state('Write a note to future you.');
  let selectValue = $state('paper');
  let checked = $state(true);
  let radioValue = $state('first');
  let switchValue = $state(false);
  let toastOpen = $state(false);
  let dialogOpen = $state(false);
  let alertOpen = $state(true);
  let pageValue = $state(2);
  let sliderValue = $state(64);
  let accordionOpen = $state(0);
  let saved = $state(true);
  let motionReplay = $state(0);

  const TOAST_DURATION_MS = 4200;

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function selectSection(id: string) {
    activeSection = id;
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  // Keep the sidebar in step with the reading position, not only with clicks.
  $effect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const topmost = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (topmost) activeSection = topmost.target.id;
      },
      { rootMargin: '-104px 0px -55% 0px' }
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  });

  function showToast() {
    toastOpen = true;
  }

  // Safari does not focus a button on click, which would leave the dialog with
  // no previously-focused element to restore to when it closes.
  function focusThenOpenDialog(event: MouseEvent) {
    (event.currentTarget as HTMLButtonElement).focus();
    dialogOpen = true;
  }
</script>

<Seo
  title="Design System"
  description="A living catalogue of the Will WeBase visual language, components, and interaction notes."
  path="/design-system"
  noindex={true}
 />

<main class="ds-page">
  <aside class="ds-sidebar" aria-label="Design system sections">
    <div class="ds-sidebar-inner">
      <span class="ds-stamp" aria-hidden="true">WX / 01</span>
      <nav>
        {#each sections as section (section.id)}
          <button type="button" class:active={activeSection === section.id} onclick={() => selectSection(section.id)}>{section.label}</button>
        {/each}
      </nav>
      <p class="ds-sidebar-foot">A private workshop<br />made visible.</p>
    </div>
  </aside>

  <nav class="ds-mobile-nav" aria-label="Jump to design system section">
    <span>Sections</span>
    <select aria-label="Jump to section" value={activeSection} onchange={(event) => selectSection(event.currentTarget.value)}>
      {#each sections as section (section.id)}<option value={section.id}>{section.label}</option>{/each}
    </select>
  </nav>

  <div class="ds-content">
    <section id="overview" class="ds-hero ds-section">
      <div class="ds-hero-grid">
        <div>
          <p class="ds-kicker">Visual language / v2.0</p>
          <h1>Design System<span class="ds-cursor" aria-hidden="true">_</span></h1>
          <p class="ds-lede">A bound catalogue of paper, ink, type, movement, and the custom instruments that hold the archive together.</p>
          <div class="ds-hero-ledger" aria-label="Design system coverage"><span><strong>25</strong> components</span><span><strong>{sections.length}</strong> sections</span><span><strong>3</strong> input modes</span></div>
        </div>
        <div class="ds-registration" aria-hidden="true">
          <span>SEAL / 02</span><img src="/icons/design-system.svg" alt="" width="112" height="112" /><small>Living reference<br />August 2026</small>
        </div>
      </div>
      <WeBaseDivider label="Read the specimen" />
      <div class="ds-overview-notes">
        <p><strong>Scope</strong> This page is additive and intentionally separate from the public archive. It is the source of truth for future site-wide component work.</p>
        <p><strong>Point of view</strong> Controls are treated as instruments on a proof sheet: clear state, visible focus, blue seal ink, and no decorative chrome without a job.</p>
      </div>
    </section>

    <section id="color" class="ds-section">
      <WeBaseSectionHeader kicker="01 / Foundation" title="Color" note={sections[1].note} />
      <div class="ds-token-grid ds-color-grid">
        {#each colors as token (token.name)}
          <article class="ds-token ds-color-token">
            <div class={`ds-color-sample ds-color-${token.sample}`}></div>
            <div class="ds-token-copy"><div><strong>{token.name}</strong><WeBaseBadge label="Canonical" /></div><code>{token.value}</code><p>{token.note}</p></div>
          </article>
        {/each}
      </div>
      <div class="ds-status-row">
        {#each statusTokens as token (token.name)}
          <article class="ds-status-token">
            <span class={`ds-status-chip ds-color-${token.sample}`} aria-hidden="true"></span>
            <div><strong>{token.name}</strong><code>{token.value}</code><p>{token.note}</p></div>
          </article>
        {/each}
      </div>
      <div class="ds-ink-strip"><span>Light</span><span>Blue mark</span><span>Dark</span><span>Paper is the quietest color.</span></div>
    </section>

    <section id="type" class="ds-section">
      <WeBaseSectionHeader kicker="02 / Voice" title="Typography" note={sections[2].note} />
      <div class="ds-type-stack">
        {#each typeTokens as token (token.name)}
          <article class="ds-type-row"><span class="ds-type-label">{token.name}</span><span class={`ds-type-sample ds-type-${token.kind}`}>{token.sample}</span><code>{token.value}</code><p>{token.note}</p></article>
        {/each}
      </div>
      <div class="ds-scale-demo"><span class="ds-scale-hero">A record of making.</span><span class="ds-scale-title">A small title with a long tail</span><span class="ds-scale-body">Body copy stays generous, with enough line-height to feel like a page rather than a panel.</span><span class="ds-scale-caption">CAPTION / 11PX / MONO</span></div>

      <div class="ds-prose-sheet">
        <div class="ds-prose-head">
          <div><p class="ds-prose-kicker">Article body</p><h3><code>.prose</code></h3></div>
          <p>The most-used typographic surface on the site, and the one every published article renders into. It is a global class in <code>app.css</code> rather than a component, because Velite hands the routes compiled HTML that gets written straight into the page.</p>
        </div>
        <!-- A real .prose subtree, so this specimen drifts if the article styles ever do. -->
        <div class="prose">
          <h2>A heading inside the body</h2>
          <p>Body copy sets the reading rhythm: a serif face, a generous measure, and line-height that lets a long paragraph feel like a page rather than a panel. Inline <a href="#type">links</a> carry the blue mark, and <strong>emphasis</strong> stays quiet enough not to interrupt the line.</p>
          <h3>A subheading</h3>
          <ul>
            <li>Lists keep the same measure as the paragraphs around them.</li>
            <li>Markers use the blue mark rather than a default bullet.</li>
          </ul>
          <blockquote>A pulled quote sits slightly outside the column, so the eye registers it as a different voice.</blockquote>
          <p>Inline <code>code</code> borrows the annotation mono face, and a horizontal rule closes a movement.</p>
          <hr />
        </div>
      </div>
    </section>

    <section id="space" class="ds-section">
      <WeBaseSectionHeader kicker="03 / Rhythm" title="Spacing" note={sections[3].note} />
      <div class="ds-space-list">
        {#each spacingTokens as token (token.name)}
          <div class="ds-space-row"><code>{token.name}</code><span class="ds-space-bar" style={`--space-size:${token.value}`}></span><strong>{token.value}</strong><p>{token.note}</p></div>
        {/each}
      </div>
    </section>

    <section id="borders" class="ds-section">
      <WeBaseSectionHeader kicker="04 / Edges" title="Borders" note={sections[4].note} />
      <div class="ds-border-grid">
        {#each borderTokens as token, index (token.name)}
          <article class:ds-border-dots={index === 2} class:ds-border-focus={index === 3}><span class="ds-border-demo"></span><strong>{token.name}</strong><code>{token.value}</code><p>{token.note}</p></article>
        {/each}
      </div>
    </section>

    <section id="shadows" class="ds-section">
      <WeBaseSectionHeader kicker="05 / Depth" title="Shadows" note={sections[5].note} />
      <div class="ds-shadow-grid">
        {#each shadowTokens as token, index (token.name)}
          <article class={`ds-shadow-demo ds-shadow-${index}`}><span>{token.name}</span><code>{token.value}</code><p>{token.note}</p></article>
        {/each}
      </div>
    </section>

    <section id="components" class="ds-section">
      <WeBaseSectionHeader kicker="06 / Instruments" title="Components" note={sections[6].note} />
      <div class="ds-component-ledger"><span>07 specimen sheets</span><span>Default + focus + disabled + error</span><WeBaseBadge label="Expanded" dot /></div>

      <article class="ds-specimen-sheet">
        <header><span>01</span><div><h3>Actions</h3><p>Clear hierarchy, compact language, and visible working states.</p></div><WeBaseBadge label="Canonical" /></header>
        <div class="ds-specimen-canvas">
          <div class="ds-control-row"><WeBaseButton label="Save note" variant="ink" icon="check" onclick={showToast} data-webaseui-probe="root-attributes" aria-keyshortcuts="S" class="webaseui-consumer-class" style="--webaseui-consumer-probe: 1" /><WeBaseButton label="Open archive" variant="outline" icon="arrow-up-right" /><WeBaseButton label="Add entry" variant="quiet" icon="plus" /><WeBaseButton label="Read note" variant="text" /><WeBaseButton label="Saving" loading /><WeBaseButton label="Unavailable" disabled /></div>
          <div class="ds-control-row ds-icon-button-row"><WeBaseIconButton label="Open specimen" /><WeBaseIconButton label="Bookmark specimen" icon="bookmark" bind:pressed={saved} /><WeBaseIconButton label="Like specimen" icon="heart" /><WeBaseIconButton label="Add specimen" icon="plus" /><WeBaseIconButton label="Disabled action" disabled /></div>
        </div>
      </article>

      <article class="ds-specimen-sheet">
        <header><span>02</span><div><h3>Content surfaces</h3><p>Editorial cards, loading placeholders, and a useful empty drawer.</p></div><WeBaseBadge label="Canonical" /></header>
        <div class="ds-specimen-canvas">
          <div class="ds-card-grid"><WeBaseCard title="A paper surface" body="A card is a small page with enough structure to hold one thought." meta="Updated 02 Aug" action="Read note" /><WeBaseCard title="Ink in reverse" body="Use the seal field sparingly, when an object needs to step forward." variant="ink" meta="Featured" action="Open" /></div>
          <div class="ds-content-state-grid"><WeBaseSkeleton rows={3} /><WeBaseEmptyState /></div>
        </div>
      </article>

      <article class="ds-specimen-sheet">
        <header><span>03</span><div><h3>Fields</h3><p>Help, validation, counters, typeahead, and direct manipulation.</p></div><WeBaseBadge label="Interactive" variant="experiment" /></header>
        <div class="ds-specimen-canvas">
          <div class="ds-form-grid">
            <WeBaseField id="ds-demo-field" label="Field note" bind:value={fieldValue} help="Plain language and visible focus." required />
            <WeBaseField id="ds-error-field" label="Edition code" value="proof-" error="Use a complete code, for example proof-02." />
            <WeBaseSelect id="ds-demo-select" label="Material" bind:value={selectValue} help="Arrow keys and typeahead are supported." options={[{ label: 'Paper', value: 'paper' }, { label: 'Ink wash', value: 'ink' }, { label: 'Blue mark', value: 'blue' }]} />
            <WeBaseSlider id="ds-demo-slider" label="Ink density" bind:value={sliderValue} />
            <WeBaseTextarea id="ds-demo-textarea" label="Longer note" bind:value={messageValue} help="Keep the note specific enough to be useful later." maxLength={180} />
          </div>
        </div>
      </article>

      <article class="ds-specimen-sheet">
        <header><span>04</span><div><h3>Selection</h3><p>Binary, single-choice, mixed, and annotated controls.</p></div><WeBaseBadge label="Canonical" /></header>
        <div class="ds-specimen-canvas ds-selection-grid">
          <div><p class="ds-group-label">Checkbox</p><WeBaseCheck label="Remember this specimen" description="Keep the proof in the local drawer." bind:checked /><WeBaseCheck label="Partially archived" indeterminate /><WeBaseCheck label="Unavailable choice" disabled /></div>
          <div><p class="ds-group-label">Radio</p><WeBaseRadio name="ds-radio" label="First edition" value="first" bind:selected={radioValue} /><WeBaseRadio name="ds-radio" label="Second edition" value="second" bind:selected={radioValue} /><WeBaseRadio name="ds-radio" label="Retired edition" value="retired" bind:selected={radioValue} disabled /></div>
          <div><p class="ds-group-label">Switch</p><WeBaseSwitch label="Show annotations" description="Reveal proofing notes in the margin." bind:checked={switchValue} /><WeBaseSwitch label="Locked setting" disabled /></div>
        </div>
      </article>

      <article class="ds-specimen-sheet">
        <header><span>05</span><div><h3>Navigation</h3><p>Location, local view state, and movement through long archives.</p></div><WeBaseBadge label="Keyboard ready" variant="experiment" /></header>
        <div class="ds-specimen-canvas ds-navigation-stack">
          <WeBaseBreadcrumbs items={[{ label: 'Archive', href: '/' }, { label: 'Field notes', href: '/blog' }, { label: 'Paper systems' }]} />
          <WeBaseTabs id="ds-demo-tabs" label="Specimen views" items={['Overview', 'Notes', 'Archive']} panels={['A summary of the current specimen.', 'Annotations and decisions attached to the proof.', 'Earlier editions and retired states.']} />
          <WeBasePagination total={5} bind:page={pageValue} label="Archive pages" />
        </div>
      </article>

      <article class="ds-specimen-sheet">
        <header><span>06</span><div><h3>Feedback</h3><p>Status should explain what happened and what remains possible.</p></div><WeBaseBadge label="Live region" variant="experiment" /></header>
        <div class="ds-specimen-canvas">
          <div class="ds-alert-grid"><WeBaseAlert title="Proof saved" message="The local specimen now includes your latest annotations." tone="success" dismissible bind:open={alertOpen} /><WeBaseAlert title="Image still processing" message="You can keep editing while the large preview is generated." tone="warning" /></div>
          <div class="ds-feedback-grid"><div><WeBaseProgress value={68} label="Archive completeness" /><WeBaseProgress value={92} label="Metadata quality" tone="success" compact /></div><div class="ds-loader-row"><WeBaseLoader label="Riffle" /><WeBaseTooltip id="ds-demo-tooltip" label="Hover or focus" text="Tooltips clarify a mark without interrupting the page." /></div></div>
          <div class="ds-control-row ds-action-row"><WeBaseButton label="Show toast" variant="outline" onclick={showToast} /><WeBaseButton label="Open dialog" variant="ink" onclick={focusThenOpenDialog} /></div>
        </div>
      </article>

      <article class="ds-specimen-sheet">
        <header><span>07</span><div><h3>Disclosure</h3><p>Long explanations stay available without making every page dense.</p></div><WeBaseBadge label="Keyboard ready" variant="experiment" /></header>
        <div class="ds-specimen-canvas"><WeBaseAccordion id="ds-demo-accordion" bind:open={accordionOpen} items={[{ title: 'When should blue ink appear?', content: 'Use blue for links, active controls, focus, and explicit registration marks. It should guide the eye, not tint every surface.' }, { title: 'How should motion behave?', content: 'Motion confirms a change or preserves spatial context. Reduced-motion users receive the same state change without travel or rotation.' }, { title: 'Can these components replace the site today?', content: 'They are ready for review here. Existing pages remain unchanged until a separate migration pass is approved.' }]} /></div>
      </article>

      <article class="ds-specimen-sheet">
        <header><span>08</span><div><h3>Prop reference</h3><p>Every catalogued component, its props, and their defaults.</p></div><WeBaseBadge label="Canonical" /></header>
        <div class="ds-specimen-canvas ds-api-canvas">
          <p class="ds-api-note">A unit test parses each component's <code>interface Props</code> and fails if this table drifts from the source, so the two cannot disagree silently.</p>
          {#each componentApi as component (component.name)}
            <section class="ds-api-entry">
              <h4>{component.name}</h4>
              <p>{component.summary}</p>
              <dl>
                {#each component.props as prop (prop.name)}
                  <div>
                    <dt><code>{prop.name}</code>{#if prop.default === undefined}<abbr title="Required">*</abbr>{/if}{#if prop.bindable}<span class="ds-api-bind">bindable</span>{/if}</dt>
                    <dd><code>{prop.type}</code>{#if prop.default !== undefined}<em>{prop.default}</em>{/if}</dd>
                  </div>
                {/each}
              </dl>
            </section>
          {/each}
        </div>
      </article>
    </section>

    <section id="icons" class="ds-section">
      <WeBaseSectionHeader kicker="07 / Marks" title="Iconography" note={sections[7].note} />
      <div class="ds-icon-grid">
        <div><span class="ds-icon-glyph"><WeBaseIcon name="arrow-up-right" size={24} strokeWidth={1.6} /></span><strong>External</strong><code>ArrowUpRight</code></div>
        <div><span class="ds-icon-glyph"><WeBaseIcon name="search" size={24} strokeWidth={1.6} /></span><strong>Search</strong><code>Search</code></div>
        <div><span class="ds-icon-glyph"><WeBaseIcon name="sparkles" size={24} strokeWidth={1.6} /></span><strong>Mark</strong><code>Sparkles</code></div>
        <div><span class="ds-icon-glyph"><WeBaseIcon name="x" size={24} strokeWidth={1.6} /></span><strong>Close</strong><code>X</code></div>
        <div><span class="ds-icon-glyph"><WeBaseIcon name="archive" size={24} strokeWidth={1.6} /></span><strong>Archive</strong><code>Archive</code></div>
        <div><span class="ds-icon-glyph"><WeBaseIcon name="bookmark" size={24} strokeWidth={1.6} /></span><strong>Save</strong><code>Bookmark</code></div>
        <div><span class="ds-icon-glyph"><WeBaseIcon name="settings-2" size={24} strokeWidth={1.6} /></span><strong>Adjust</strong><code>Settings2</code></div>
        <div><span class="ds-icon-glyph"><WeBaseIcon name="zoom-in" size={24} strokeWidth={1.6} /></span><strong>Inspect</strong><code>ZoomIn</code></div>
      </div>
      <p class="ds-note">Interface icons use Lucide at 1.6–1.8px stroke width. The custom Seal remains the only brand mark: product meaning comes from a shared stroke vocabulary, not a mixture of Unicode symbols.</p>
      <p class="ds-note">Two trade-offs worth knowing before this set grows. <code>WeBaseIcon</code> does not import glyphs by name — it inlines all 23 path definitions as one literal and imports only Lucide's generic renderer, so tree-shaking never applies: every route using an icon ships all 23 (about 1.5 KiB gzip). That inlined copy is also pinned, so upstream Lucide corrections do not reach it. Both are comfortable at this size; revisit if the set nears three figures.</p>
    </section>

    <section id="motion" class="ds-section">
      <WeBaseSectionHeader kicker="08 / Time" title="Motion" note={sections[8].note} />
      <div class="ds-motion-proof">
        <div class="ds-motion-toolbar">
          <div><span>Sequence / {String(motionReplay + 1).padStart(2, '0')}</span><p>Four gestures, one reading direction.</p></div>
          <button type="button" onclick={() => (motionReplay += 1)}><WeBaseIcon name="sparkles" size={15} />Replay motion sequence</button>
        </div>
        {#key motionReplay}
          <div class="ds-motion-grid" data-motion-run={motionReplay}>
            <article>
              <div class="ds-motion-visual ds-motion-press" aria-hidden="true"><span>Press</span></div>
              <div><small>01 / Response</small><strong>Press / 140ms</strong><code>var(--duration-fast)</code><p>A control moves only far enough to confirm contact.</p></div>
            </article>
            <article>
              <div class="ds-motion-visual ds-motion-reveal" aria-hidden="true"><i></i><span>Field note</span></div>
              <div><small>02 / Reveal</small><strong>Uncover / 200ms</strong><code>var(--duration-ui)</code><p>New content enters from the edge that owns it.</p></div>
            </article>
            <article>
              <div class="ds-motion-visual ds-motion-register" aria-hidden="true"><i></i><b></b><span></span></div>
              <div><small>03 / Align</small><strong>Register / 200ms</strong><code>var(--ease-out)</code><p>Selection resolves with a short, precise snap.</p></div>
            </article>
            <article>
              <div class="ds-motion-visual ds-motion-stagger" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
              <div><small>04 / Sequence</small><strong>Stagger / 40ms</strong><code>child × 40ms</code><p>Related rows arrive together, never as confetti.</p></div>
            </article>
          </div>
        {/key}
        <div class="ds-motion-tape" aria-label="Motion timing scale"><span>0</span><i></i><span>140</span><i></i><span>200</span><i></i><span>900 ms</span></div>
      </div>
      <div class="ds-motion-rules">
        <p><strong>Purpose</strong> Movement explains cause, hierarchy, or spatial origin.</p>
        <p><strong>Frequency</strong> Repeated actions lose flourish after the first response.</p>
        <p><strong>Reduced motion</strong> Keep the state change; remove travel, delay, and page turns.</p>
      </div>
    </section>

    <section id="materials" class="ds-section">
      <WeBaseSectionHeader kicker="09 / Surface" title="Materials" note={sections[9].note} />
      <div class="ds-material-grid">
        <article class="ds-material-paper"><span>Paper grain</span><p>Low contrast, almost felt rather than seen.</p></article>
        <article class="ds-material-ink"><span>Ink wash</span><p>Blue mark softens into the paper instead of becoming a gradient.</p></article>
        <article class="ds-material-register"><span>Registration</span><p>Offset lines and marks make the page feel printed by hand.</p><i></i><b></b></article>
        <article class="ds-material-emboss"><span>Blind emboss</span><p>Depth comes from pressure and light, without adding another color.</p><i aria-hidden="true"></i></article>
        <article class="ds-material-carbon"><span>Carbon copy</span><p>A useful echo for drafts, receipts, and saved states.</p><i aria-hidden="true">ARCHIVE<br />COPY / 02</i></article>
        <article class="ds-material-vellum"><span>Tracing paper</span><p>Translucency reveals context while keeping the annotation distinct.</p><i aria-hidden="true">FIELD<br />NOTE</i></article>
        <article class="ds-material-overprint"><span>Overprint</span><p>Halftone and multiply create depth with only paper, ink, and pressure.</p><i></i><b></b></article>
      </div>
      <WeBaseDivider label="End of proof" />
      <footer class="ds-endnote"><p>This page is ready for review. Existing pages remain unchanged until a separate, explicit migration pass is approved.</p><a href="/">Return to the archive ↗</a></footer>
    </section>
  </div>

  <div class="ds-floating-feedback"><WeBaseToast bind:open={toastOpen} duration={TOAST_DURATION_MS} /><WeBaseDialog bind:open={dialogOpen} /></div>
</main>

<style>
  .ds-page { --ds-content-width: 1040px; display: grid; grid-template-columns: 196px minmax(0, var(--ds-content-width)); gap: clamp(42px, 6vw, 92px); max-width: 1450px; margin: 0 auto; padding: clamp(108px, 12vw, 170px) clamp(24px, 5vw, 72px) 120px; }
  .ds-sidebar { position: relative; }
  .ds-sidebar-inner { position: sticky; top: 106px; display: grid; gap: 28px; }
  .ds-stamp { display: inline-flex; width: max-content; padding: 6px 8px; border: 1px solid var(--brand); color: var(--brand); font-family: var(--mono); font-size: 10px; letter-spacing: .12em; transform: rotate(-2deg); }
  .ds-sidebar nav { display: grid; gap: 2px; }
  .ds-sidebar nav button { width: max-content; padding: 5px 0; border: 0; color: var(--ink-muted); background: transparent; cursor: pointer; font-family: var(--sans); font-size: 12px; letter-spacing: .07em; text-align: left; transition: color var(--duration-ui) var(--ease-out), transform var(--duration-fast) var(--ease-out); }
  .ds-sidebar nav button:hover, .ds-sidebar nav button:focus-visible, .ds-sidebar nav button.active { color: var(--brand); transform: translateX(5px); }
  .ds-sidebar nav button.active::before { margin-right: 6px; color: var(--brand); content: '↳'; }
  .ds-sidebar-foot { margin: 0; color: var(--ink-muted); font-family: var(--display); font-size: 18px; font-style: italic; line-height: 1.15; }
  .ds-mobile-nav { display: none; }
  .ds-content { min-width: 0; }
  .ds-section { scroll-margin-top: 104px; padding: 76px 0; border-top: 1px solid transparent; }
  .ds-hero { padding-top: 0; }
  .ds-hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) 220px; align-items: end; gap: 52px; min-height: 410px; }
  .ds-kicker { margin: 0 0 16px; color: var(--brand); font-family: var(--mono); font-size: 10px; letter-spacing: .14em; text-transform: uppercase; }
  h1, p { margin-top: 0; }
  h1 { max-width: 700px; margin-bottom: 24px; font-family: var(--font); font-size: clamp(54px, 9vw, 112px); font-weight: 500; letter-spacing: -.075em; line-height: .83; }
  .ds-cursor { display: inline-block; margin-left: 6px; color: var(--brand); font-family: var(--mono); font-size: .4em; letter-spacing: 0; transform: translateY(-.15em); }
  .ds-lede { max-width: 520px; margin-bottom: 0; color: var(--ink-muted); font-size: clamp(17px, 2.3vw, 22px); line-height: 1.45; }
  .ds-hero-ledger { display: flex; flex-wrap: wrap; gap: 0; margin-top: 34px; border-top: 1px solid var(--hairline); border-bottom: 1px solid var(--hairline); }
  .ds-hero-ledger span { display: inline-flex; min-height: 48px; align-items: baseline; gap: 7px; padding: 0 16px; border-right: 1px solid var(--hairline); color: var(--ink-muted); font-family: var(--mono); font-size: 9px; letter-spacing: .08em; text-transform: uppercase; }
  .ds-hero-ledger span:first-child { padding-left: 0; }
  .ds-hero-ledger strong { color: var(--brand); font-family: var(--font); font-size: 25px; font-weight: 500; letter-spacing: -.04em; }
  .ds-registration { position: relative; display: grid; width: 210px; min-height: 240px; align-content: space-between; justify-items: center; justify-self: end; padding: 18px; border: 1px solid var(--hairline-strong); color: var(--brand); background: var(--surface); box-shadow: 9px 9px 0 color-mix(in srgb, var(--brand) 12%, transparent); transform: rotate(1.2deg); }
  .ds-registration::before, .ds-registration::after { position: absolute; width: 14px; height: 14px; border-color: var(--brand); content: ''; opacity: .55; }
  .ds-registration::before { top: 8px; left: 8px; border-top: 1px solid; border-left: 1px solid; }
  .ds-registration::after { right: 8px; bottom: 8px; border-right: 1px solid; border-bottom: 1px solid; }
  .ds-registration span { justify-self: start; font-family: var(--mono); font-size: 9px; letter-spacing: .14em; }
  .ds-registration img { width: 112px; height: 112px; opacity: .94; }
  .ds-registration small { justify-self: start; color: var(--ink-muted); font-family: var(--mono); font-size: 9px; letter-spacing: .08em; line-height: 1.5; text-transform: uppercase; }
  .ds-overview-notes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; padding-top: 30px; }
  .ds-overview-notes p, .ds-note { margin: 0; color: var(--ink-muted); font-size: 14px; line-height: 1.55; }
  .ds-overview-notes strong { display: block; margin-bottom: 8px; color: var(--ink); font-family: var(--sans); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; }
  .ds-token-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
  .ds-token { display: grid; gap: 12px; min-width: 0; }
  .ds-color-sample { height: 90px; border: 1px solid var(--hairline); }
  .ds-color-paper { background: var(--paper); }
  .ds-color-surface { background: var(--surface); }
  .ds-color-ink { background: var(--ink); }
  .ds-color-muted { background: var(--ink-muted); }
  .ds-color-brand { background: var(--brand); }
  .ds-color-tint { background: var(--brand-tint); }
  .ds-color-status-error { background: var(--status-error); }
  .ds-color-status-success { background: var(--status-success); }
  .ds-color-status-warning { background: var(--status-warning); }
  .ds-color-status-info { background: var(--status-info); }
  .ds-status-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-top: 22px; padding-top: 22px; border-top: 1px dashed var(--hairline-strong); }
  .ds-status-token { display: grid; grid-template-columns: 26px minmax(0, 1fr); gap: 12px; min-width: 0; }
  .ds-status-chip { width: 26px; height: 26px; border: 1px solid var(--hairline); border-radius: 50%; }
  .ds-status-token strong { display: block; margin-bottom: 4px; color: var(--ink); font-family: var(--sans); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; }
  .ds-status-token p { margin: 4px 0 0; color: var(--ink-muted); font-size: 12px; line-height: 1.4; }
  .ds-token-copy { display: grid; gap: 6px; }
  .ds-token-copy > div { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .ds-token-copy strong { color: var(--ink); font-family: var(--sans); font-size: 12px; letter-spacing: .06em; text-transform: uppercase; }
  code { color: var(--brand); font-family: var(--mono); font-size: 10px; line-height: 1.45; overflow-wrap: anywhere; }
  .ds-token-copy p, .ds-border-grid p, .ds-shadow-grid p, .ds-space-row p { margin: 0; color: var(--ink-muted); font-size: 12px; line-height: 1.4; }
  .ds-ink-strip { display: flex; align-items: center; gap: 0; margin-top: 34px; border: 1px solid var(--hairline); }
  .ds-ink-strip span { padding: 14px; color: var(--ink-muted); font-family: var(--mono); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
  .ds-ink-strip span:nth-child(1) { background: var(--surface); }
  .ds-ink-strip span:nth-child(2) { color: var(--paper); background: var(--brand); }
  .ds-ink-strip span:nth-child(3) { color: var(--paper); background: var(--ink); }
  .ds-ink-strip span:last-child { margin-left: auto; color: var(--ink-muted); font-family: var(--font); font-size: 13px; letter-spacing: 0; text-transform: none; }
  .ds-type-stack { border-top: 1px solid var(--hairline-strong); }
  .ds-type-row { display: grid; grid-template-columns: 130px minmax(0, 1fr) 180px; gap: 18px; align-items: center; padding: 18px 0; border-bottom: 1px solid var(--hairline); }
  .ds-type-label { color: var(--ink-muted); font-family: var(--sans); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
  .ds-type-sample { overflow: hidden; color: var(--ink); white-space: nowrap; text-overflow: ellipsis; }
  .ds-type-type { font-family: var(--font); font-size: 26px; }
  .ds-type-row:nth-child(2) .ds-type-sample { font-family: var(--display); font-size: 28px; font-style: italic; }
  .ds-type-row:nth-child(3) .ds-type-sample { font-family: var(--sans); font-size: 14px; letter-spacing: .12em; text-transform: uppercase; }
  .ds-type-row:nth-child(4) .ds-type-sample { font-family: var(--mono); font-size: 13px; }
  .ds-type-row p { grid-column: 2 / -1; margin: -8px 0 0; color: var(--ink-muted); font-size: 12px; }
  .ds-scale-demo { display: grid; gap: 16px; margin-top: 34px; padding: 24px; border: 1px solid var(--hairline); background: var(--surface); }
  .ds-scale-hero { font-family: var(--font); font-size: clamp(34px, 5vw, 58px); letter-spacing: -.06em; line-height: .9; }
  .ds-scale-title { font-family: var(--font); font-size: 28px; }
  .ds-scale-body { max-width: 460px; color: var(--ink-muted); font-size: 15px; line-height: 1.5; }
  .ds-scale-caption { color: var(--brand); font-family: var(--mono); font-size: 10px; letter-spacing: .12em; }
  .ds-prose-sheet { margin-top: 34px; border: 1px solid var(--hairline-strong); background: var(--surface); box-shadow: 7px 7px 0 color-mix(in srgb, var(--brand) 8%, transparent); }
  .ds-prose-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr); gap: 16px 32px; align-items: end; padding: 20px 24px; border-bottom: 1px solid var(--hairline-strong); }
  .ds-prose-kicker { margin: 0 0 6px; color: var(--brand); font-family: var(--mono); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
  .ds-prose-head h3 { margin: 0; font-family: var(--font); font-size: 28px; font-weight: 500; letter-spacing: -.04em; line-height: 1; }
  .ds-prose-head h3 code { font-size: 20px; }
  .ds-prose-head > p { margin: 0; color: var(--ink-muted); font-size: 13px; line-height: 1.5; }
  /* The specimen renders the real global .prose, so it is deliberately not restyled here — only bounded. */
  .ds-prose-sheet :global(.prose) { padding: 4px 24px 24px; }
  .ds-space-list { display: grid; }
  .ds-space-row { display: grid; grid-template-columns: 75px 1fr 60px minmax(160px, 1fr); align-items: center; gap: 14px; min-height: 48px; border-bottom: 1px solid var(--hairline); }
  .ds-space-row strong { color: var(--ink); font-family: var(--mono); font-size: 11px; font-weight: 400; }
  .ds-space-bar { display: block; width: var(--space-size); max-width: 100%; min-width: 4px; height: 10px; background: var(--brand); }
  .ds-border-grid, .ds-shadow-grid, .ds-motion-grid, .ds-material-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  .ds-border-grid article { display: grid; grid-template-columns: 120px minmax(0, 1fr); align-items: center; gap: 10px 16px; padding: 18px; border: 1px solid var(--hairline); }
  .ds-border-demo { grid-row: span 3; display: block; width: 100%; height: 62px; border: 1px solid var(--hairline); }
  .ds-border-grid article:nth-child(2) .ds-border-demo { border-color: var(--hairline-strong); }
  .ds-border-dots .ds-border-demo { border: 0; background-image: var(--dot-rule-image); background-position: center; background-repeat: repeat-x; background-size: 7px 2px; }
  .ds-border-focus .ds-border-demo { border-color: var(--brand); outline: 2px solid var(--brand); outline-offset: 4px; }
  .ds-border-grid strong, .ds-motion-grid strong { color: var(--ink); font-family: var(--sans); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; }
  .ds-shadow-grid article { min-height: 160px; padding: 20px; border: 1px solid var(--hairline); background: var(--surface); }
  .ds-shadow-grid article.ds-shadow-0 { box-shadow: 3px 3px 0 color-mix(in srgb, var(--brand) 18%, transparent); }
  .ds-shadow-grid article.ds-shadow-1 { box-shadow: var(--whisper-shadow); }
  .ds-shadow-grid article.ds-shadow-2 { box-shadow: 8px 8px 0 color-mix(in srgb, var(--brand) 15%, transparent); }
  .ds-shadow-grid article span { display: block; margin-bottom: 22px; font-family: var(--font); font-size: 28px; }
  .ds-component-ledger { display: flex; align-items: center; gap: 18px; margin: 8px 0 30px; padding: 12px 14px; border: 1px solid var(--hairline); color: var(--ink-muted); background: var(--surface); font-family: var(--mono); font-size: 9px; letter-spacing: .09em; text-transform: uppercase; }
  .ds-component-ledger span:nth-child(2) { margin-left: auto; }
  .ds-specimen-sheet { margin-top: 46px; }
  .ds-specimen-sheet > header { display: grid; grid-template-columns: 46px minmax(0, 1fr) auto; gap: 16px; align-items: start; margin-bottom: 14px; }
  .ds-specimen-sheet > header > span { color: var(--brand); font-family: var(--mono); font-size: 10px; letter-spacing: .1em; }
  .ds-specimen-sheet > header h3 { margin: -5px 0 5px; font-family: var(--font); font-size: 28px; font-weight: 500; letter-spacing: -.04em; line-height: 1; }
  .ds-specimen-sheet > header p { margin: 0; color: var(--ink-muted); font-size: 12px; line-height: 1.45; }
  .ds-specimen-canvas { display: grid; gap: 26px; padding: 28px; border: 1px solid var(--hairline); background: var(--surface); box-shadow: 7px 7px 0 color-mix(in srgb, var(--brand) 8%, transparent); }
  .ds-control-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
  .ds-icon-button-row { padding-top: 20px; border-top: 1px dashed var(--hairline-strong); }
  .ds-card-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .ds-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; padding: 28px 0; }
  .ds-form-grid :global(.ds-textarea) { grid-column: 1 / -1; }
  .ds-content-state-grid, .ds-alert-grid, .ds-feedback-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
  .ds-selection-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: start; }
  .ds-selection-grid > div { display: grid; align-content: start; gap: 14px; min-height: 170px; padding: 18px; border: 1px solid var(--hairline); background: var(--paper); }
  .ds-group-label { margin: 0 0 4px; color: var(--brand); font-family: var(--mono); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
  .ds-navigation-stack { gap: 28px; }
  .ds-navigation-stack > :global(nav:first-child) { padding-bottom: 18px; border-bottom: 1px dashed var(--hairline-strong); }
  .ds-feedback-grid { align-items: start; }
  .ds-feedback-grid > div { display: grid; gap: 18px; }
  .ds-loader-row { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 18px; }
  .ds-action-row { justify-content: flex-end; margin-top: 26px; }
  .ds-icon-grid { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--hairline-strong); border-left: 1px solid var(--hairline-strong); }
  .ds-icon-grid > div { display: grid; gap: 9px; min-height: 150px; padding: 20px; border-right: 1px solid var(--hairline-strong); border-bottom: 1px solid var(--hairline-strong); }
  .ds-icon-glyph { display: grid; width: 48px; height: 48px; place-items: center; border: 1px solid var(--hairline); color: var(--brand); background: var(--surface); }
  .ds-icon-glyph :global(svg) { width: 24px; height: 24px; stroke-width: 1.6; }
  .ds-icon-grid strong { font-family: var(--sans); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
  .ds-motion-proof { border: 1px solid var(--hairline-strong); background: var(--surface); box-shadow: 8px 8px 0 color-mix(in srgb, var(--brand) 9%, transparent); }
  .ds-motion-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 18px; min-height: 70px; padding: 14px 18px; border-bottom: 1px solid var(--hairline-strong); }
  .ds-motion-toolbar span, .ds-motion-grid small { color: var(--brand); font-family: var(--mono); font-size: 9px; letter-spacing: .11em; text-transform: uppercase; }
  .ds-motion-toolbar p { margin: 5px 0 0; color: var(--ink-muted); font-size: 13px; }
  .ds-motion-toolbar button { display: inline-flex; min-height: 44px; align-items: center; gap: 8px; padding: 0 14px; border: 1px solid var(--hairline-strong); color: var(--ink); background: var(--paper); cursor: pointer; font-family: var(--sans); font-size: 10px; letter-spacing: .07em; text-transform: uppercase; transition: color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out); }
  .ds-motion-toolbar button:hover { border-color: var(--brand); color: var(--brand); }
  .ds-motion-toolbar button:active { transform: translateY(2px); }
  .ds-motion-grid { gap: 0; }
  .ds-motion-grid article { display: grid; grid-template-columns: minmax(118px, .8fr) 1.2fr; gap: 20px; min-height: 205px; padding: 18px; border: 0; border-right: 1px solid var(--hairline); border-bottom: 1px solid var(--hairline); background: transparent; }
  .ds-motion-grid article:nth-child(2n) { border-right: 0; }
  .ds-motion-grid article > div:last-child { display: flex; flex-direction: column; align-items: start; }
  .ds-motion-grid strong { margin: 13px 0 7px; }
  .ds-motion-grid code { color: var(--brand); font-size: 10px; }
  .ds-motion-grid p { margin: auto 0 3px; color: var(--ink-muted); font-size: 12px; line-height: 1.45; }
  .ds-motion-visual { position: relative; display: grid; min-height: 150px; overflow: hidden; place-items: center; border: 1px dashed var(--hairline-strong); background: var(--paper); }
  .ds-motion-press span { display: grid; width: 62px; height: 62px; place-items: center; border: 1px solid var(--brand); border-radius: 50%; color: var(--brand); font-family: var(--mono); font-size: 9px; text-transform: uppercase; animation: ds-motion-press 1.5s var(--ease-out) 120ms both; }
  .ds-motion-reveal i { position: absolute; inset: 20px 16px; border: 1px solid var(--hairline); background: repeating-linear-gradient(transparent 0 17px, var(--hairline) 18px); }
  .ds-motion-reveal span { z-index: 1; width: 86px; padding: 27px 12px; color: var(--paper); background: var(--brand); font-family: var(--font); font-style: italic; text-align: center; transform-origin: left; animation: ds-motion-reveal 900ms var(--ease-out) 240ms both; }
  .ds-motion-register i, .ds-motion-register b { position: absolute; width: 68px; height: 68px; border: 1px solid var(--brand); border-radius: 50%; }
  .ds-motion-register i { animation: ds-register-left 900ms var(--ease-out) 380ms both; }
  .ds-motion-register b { border-radius: 0; animation: ds-register-right 900ms var(--ease-out) 380ms both; }
  .ds-motion-register span { width: 7px; height: 7px; border-radius: 50%; background: var(--brand); }
  .ds-motion-stagger { align-content: center; gap: 10px; padding: 0 18px; }
  .ds-motion-stagger i { width: 100%; height: 4px; background: var(--brand); transform-origin: left; animation: ds-stagger 420ms var(--ease-out) both; }
  .ds-motion-stagger i:nth-child(2) { width: 78%; animation-delay: 540ms; }.ds-motion-stagger i:nth-child(3) { width: 91%; animation-delay: 580ms; }.ds-motion-stagger i:nth-child(4) { width: 62%; animation-delay: 620ms; }
  .ds-motion-tape { display: grid; grid-template-columns: auto 1fr auto 1fr auto 3fr auto; align-items: center; gap: 9px; padding: 13px 18px; color: var(--ink-muted); font-family: var(--mono); font-size: 9px; }
  .ds-motion-tape i { height: 1px; background: var(--brand); opacity: .45; }
  .ds-motion-rules { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-top: 30px; }
  .ds-motion-rules p { margin: 0; padding-top: 11px; border-top: 1px solid var(--hairline-strong); color: var(--ink-muted); font-size: 12px; line-height: 1.5; }
  .ds-motion-rules strong { display: block; margin-bottom: 6px; color: var(--ink); font-family: var(--sans); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
  @keyframes ds-motion-press { 0%, 24% { transform: translateY(-5px); box-shadow: 0 7px 0 color-mix(in srgb, var(--brand) 18%, transparent); } 40%, 58% { transform: translateY(2px) scale(.96); box-shadow: 0 0 0 transparent; } 76%, 100% { transform: none; box-shadow: 0 4px 0 color-mix(in srgb, var(--brand) 12%, transparent); } }
  @keyframes ds-motion-reveal { from { opacity: .3; transform: translateX(-26px) rotate(-4deg); } to { opacity: 1; transform: none; } }
  @keyframes ds-register-left { from { transform: translate(-24px, 12px); opacity: .25; } to { transform: none; opacity: .75; } }
  @keyframes ds-register-right { from { transform: translate(24px, -12px) rotate(25deg); opacity: .25; } to { transform: rotate(45deg); opacity: .75; } }
  @keyframes ds-stagger { from { opacity: 0; transform: scaleX(.15); } to { opacity: .75; transform: scaleX(1); } }
  .ds-material-grid article { position: relative; min-height: 190px; padding: 22px; overflow: hidden; border: 1px solid var(--hairline); }
  .ds-material-grid article > span { position: relative; z-index: 1; color: var(--ink); font-family: var(--font); font-size: 28px; }
  .ds-material-grid article > p { position: relative; z-index: 1; max-width: 26ch; margin-top: 18px; color: var(--ink-muted); font-size: 13px; line-height: 1.45; }
  .ds-material-paper { background-color: var(--surface); background-image: radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--brand) 8%, transparent) 0 1px, transparent 1px), radial-gradient(circle at 72% 58%, color-mix(in srgb, var(--ink) 8%, transparent) 0 1px, transparent 1px); background-size: 15px 15px, 21px 21px; }
  .ds-material-ink { background: color-mix(in srgb, var(--brand) 88%, var(--ink)); }
  .ds-material-grid .ds-material-ink > span, .ds-material-grid .ds-material-ink > p { color: var(--paper); }
  .ds-material-ink::after { position: absolute; inset: 0; background: radial-gradient(circle at 70% 30%, rgb(255 255 255 / 22%), transparent 34%); content: ''; }
  .ds-material-register { background: var(--paper); }
  .ds-material-register i, .ds-material-register b { position: absolute; width: 90px; height: 90px; border: 1px solid var(--brand); border-radius: 50%; content: ''; opacity: .6; }
  .ds-material-register i { right: 34px; bottom: 22px; }
  .ds-material-register b { right: 28px; bottom: 28px; border-radius: 0; transform: rotate(45deg); }
  .ds-material-emboss { background: color-mix(in srgb, var(--paper) 72%, var(--surface)); }
  .ds-material-emboss > i { position: absolute; right: 28px; bottom: 18px; width: 92px; height: 92px; border: 1px solid var(--emboss-dark); border-radius: 50%; box-shadow: -1px -1px 1px var(--emboss-light), 1px 1px 1px var(--emboss-dark), inset -1px -1px 1px var(--emboss-light), inset 1px 1px 1px var(--emboss-dark); }
  .ds-material-emboss > i::after { position: absolute; inset: 15px; border: 1px solid var(--emboss-dark); border-radius: 50%; box-shadow: -1px -1px 0 var(--emboss-light), 1px 1px 0 var(--emboss-dark); content: ''; }
  .ds-material-carbon { background: color-mix(in srgb, var(--brand) 9%, var(--paper)); }
  .ds-material-grid .ds-material-carbon > p { color: var(--ink); opacity: .72; }
  .ds-material-carbon > i { position: absolute; right: 16px; bottom: 17px; color: color-mix(in srgb, var(--brand) 42%, transparent); font-family: var(--mono); font-size: 27px; font-style: normal; font-weight: 700; letter-spacing: .08em; line-height: .9; text-shadow: 3px 2px 0 color-mix(in srgb, var(--brand) 20%, transparent); transform: rotate(-3deg); }
  .ds-material-vellum { background: repeating-linear-gradient(90deg, var(--paper) 0 33px, var(--hairline) 34px); }
  .ds-material-vellum::after { position: absolute; inset: 36px 20px 16px 42%; border: 1px solid var(--emboss-light); background: color-mix(in srgb, var(--surface) 62%, transparent); box-shadow: 3px 3px 12px var(--book-shadow); backdrop-filter: blur(2px); content: ''; transform: rotate(3deg); }
  .ds-material-vellum > i { position: absolute; right: 36px; bottom: 38px; z-index: 1; color: var(--brand); font-family: var(--mono); font-size: 18px; font-style: normal; letter-spacing: .1em; line-height: 1.1; transform: rotate(3deg); }
  .ds-material-overprint { grid-column: 1 / -1; background-color: var(--surface); background-image: radial-gradient(circle, color-mix(in srgb, var(--ink) 28%, transparent) 0 1px, transparent 1.5px); background-size: 7px 7px; }
  .ds-material-overprint i, .ds-material-overprint b { position: absolute; right: 38px; bottom: 20px; width: 94px; height: 94px; border-radius: 50%; background: var(--brand); opacity: .66; mix-blend-mode: multiply; }
  .ds-material-overprint b { right: 88px; background: color-mix(in srgb, var(--ink) 76%, var(--paper)); opacity: .46; }
  .ds-endnote { display: flex; align-items: end; justify-content: space-between; gap: 24px; padding-top: 24px; }
  .ds-endnote p { max-width: 420px; margin: 0; color: var(--ink-muted); font-size: 14px; line-height: 1.5; }
  .ds-endnote a { color: var(--brand); font-family: var(--sans); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
  .ds-floating-feedback { position: fixed; right: 24px; bottom: 24px; z-index: 700; display: grid; gap: 12px; pointer-events: none; }
  .ds-floating-feedback :global(.ds-toast) { pointer-events: auto; }
  .ds-floating-feedback :global(.ds-dialog-shell) { pointer-events: auto; }
  .ds-api-canvas { gap: 0; }  .ds-api-note { max-width: 62ch; margin: 0 0 8px; color: var(--ink-muted); font-size: 13px; line-height: 1.5; }
  .ds-api-entry { padding: 20px 0; border-top: 1px solid var(--hairline); }
  .ds-api-entry h4 { margin: 0 0 4px; color: var(--brand); font-family: var(--mono); font-size: 11px; font-weight: 400; letter-spacing: .08em; }
  .ds-api-entry > p { max-width: 62ch; margin: 0 0 14px; color: var(--ink-muted); font-size: 13px; line-height: 1.45; }
  .ds-api-entry dl { display: grid; gap: 0; margin: 0; }
  .ds-api-entry dl > div { display: grid; grid-template-columns: minmax(0, 200px) minmax(0, 1fr); gap: 8px 20px; padding: 7px 0; border-top: 1px dashed var(--hairline); }
  .ds-api-entry dt { display: flex; align-items: baseline; gap: 7px; margin: 0; }
  .ds-api-entry dd { display: flex; align-items: baseline; gap: 10px; margin: 0; }
  .ds-api-entry dd code { color: var(--ink-muted); }
  .ds-api-entry dd em { color: var(--ink); font-family: var(--mono); font-size: 10px; font-style: normal; }
  .ds-api-entry abbr { color: var(--status-error); font-size: 12px; text-decoration: none; }
  .ds-api-bind { padding: 1px 5px; border: 1px solid var(--hairline-strong); color: var(--ink-muted); font-family: var(--mono); font-size: 8px; letter-spacing: .09em; text-transform: uppercase; }
  @media (prefers-reduced-motion: reduce) { .ds-motion-visual * { animation: none !important; } }
  @media (max-width: 1100px) { .ds-selection-grid { grid-template-columns: 1fr 1fr; } .ds-selection-grid > div:last-child { grid-column: 1 / -1; } .ds-status-row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 980px) { .ds-page { grid-template-columns: 1fr; gap: 0; max-width: 1040px; } .ds-sidebar { display: none; } .ds-mobile-nav { position: sticky; top: 62px; z-index: 30; display: flex; align-items: center; justify-content: space-between; gap: 18px; margin: -24px 0 20px; padding: 12px 0; border-bottom: 1px solid var(--hairline-strong); background: color-mix(in srgb, var(--paper) 94%, transparent); backdrop-filter: blur(12px); } .ds-mobile-nav span { color: var(--brand); font-family: var(--mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; } .ds-mobile-nav select { min-height: 36px; padding: 0 28px 0 8px; border: 0; color: var(--ink); background: transparent; font-family: var(--sans); font-size: 12px; } }
  @media (max-width: 700px) { .ds-page { padding-inline: 20px; padding-top: 104px; } .ds-section { padding: 54px 0; } .ds-hero-grid, .ds-overview-notes, .ds-token-grid, .ds-border-grid, .ds-shadow-grid, .ds-status-row, .ds-card-grid, .ds-form-grid, .ds-motion-grid, .ds-material-grid, .ds-content-state-grid, .ds-alert-grid, .ds-feedback-grid, .ds-selection-grid, .ds-motion-rules { grid-template-columns: 1fr; } .ds-material-overprint { grid-column: auto; }.ds-motion-toolbar { align-items: start; flex-direction: column; }.ds-motion-toolbar button { width: 100%; justify-content: center; }.ds-motion-grid article { grid-template-columns: 112px 1fr; border-right: 0; }.ds-motion-tape { grid-template-columns: auto 1fr auto 1fr auto; }.ds-motion-tape i:last-of-type, .ds-motion-tape span:last-child { display: none; } .ds-selection-grid > div:last-child { grid-column: auto; } .ds-registration { width: 100%; min-height: 160px; grid-template-columns: 1fr auto; align-items: center; justify-items: start; justify-self: stretch; transform: none; } .ds-registration img { grid-row: 1 / 3; grid-column: 2; width: 88px; height: 88px; } .ds-registration small { grid-row: 2; grid-column: 1; } .ds-hero-ledger { display: grid; grid-template-columns: repeat(3, 1fr); } .ds-hero-ledger span { min-height: 58px; flex-direction: column; justify-content: center; align-items: start; padding: 0 9px; } .ds-hero-ledger span:first-child { padding-left: 9px; } .ds-component-ledger { align-items: start; flex-wrap: wrap; } .ds-component-ledger span:nth-child(2) { width: 100%; margin-left: 0; } .ds-specimen-sheet > header { grid-template-columns: 34px 1fr; } .ds-specimen-sheet > header :global(.ds-badge) { grid-column: 2; width: max-content; } .ds-specimen-canvas { padding: 20px; box-shadow: 5px 5px 0 color-mix(in srgb, var(--brand) 8%, transparent); } .ds-token-copy > div { align-items: start; } .ds-ink-strip { display: grid; grid-template-columns: repeat(3, 1fr); } .ds-ink-strip span:last-child { grid-column: 1 / -1; margin-left: 0; } .ds-type-row { grid-template-columns: 1fr; gap: 8px; } .ds-type-row p { grid-column: auto; margin: 0; } .ds-space-row { grid-template-columns: 64px 1fr 46px; gap: 10px; } .ds-space-row p { grid-column: 1 / -1; padding-bottom: 12px; } .ds-icon-grid { grid-template-columns: repeat(2, 1fr); } .ds-endnote { display: grid; } .ds-floating-feedback { right: 16px; bottom: 16px; left: 16px; } .ds-floating-feedback :global(.ds-toast) { width: 100%; } }
</style>
