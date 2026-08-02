<script lang="ts">
  import { onMount } from 'svelte';
  import { posts, site as siteConfig } from '$lib/generated/content/index.js';
  import { fallbackSocialData, type SocialData } from '$lib/types/social';

  let { socialData = fallbackSocialData }: { socialData?: SocialData } = $props();
  type SocialPreview = (typeof siteConfig.social)[number]['preview'];

  let openPreview = $state<SocialPreview | null>(null);
  let coarsePointer = $state(false);
  let clientReady = $state(false);
  let activeTrigger: HTMLAnchorElement | null = null;
  const [emailLocalPart, emailDomainPart] = siteConfig.author.email.split('@');
  const siteHostname = new URL(siteConfig.url).hostname.replace(/^www\./, '');
  const latestPosts = posts.slice(0, 2);

  function shortDate(date: string) {
    return date.slice(5).replace('-', '.');
  }

  function contributionColumns(levels: number[]) {
    return Array.from({ length: 26 }, (_, week) =>
      Array.from({ length: 7 }, (_, day) => {
        const index = week * 7 + day;
        return {
          index,
          level: levels[index] ?? 0
        };
      })
    );
  }

  function previewActionLabel(item: (typeof siteConfig.social)[number]) {
    if (item.preview === 'email') return 'Send email';
    if (item.preview === 'rss') return 'Open RSS feed';
    return `Open ${item.label}`;
  }

  function socialHref(item: (typeof siteConfig.social)[number]) {
    return item.preview === 'email' && !clientReady ? '#' : item.href;
  }

  function handleSocialClick(event: MouseEvent, preview: SocialPreview) {
    if (!coarsePointer) return;

    event.preventDefault();
    const current = event.currentTarget as HTMLAnchorElement;
    if (openPreview === preview) {
      openPreview = null;
      activeTrigger = null;
      current.blur();
      return;
    }

    openPreview = preview;
    activeTrigger = current;
  }

  onMount(() => {
    clientReady = true;
    const pointerQuery = window.matchMedia('(hover: none), (pointer: coarse)');
    coarsePointer = pointerQuery.matches;

    const handlePointerChange = () => {
      coarsePointer = pointerQuery.matches;
      if (!coarsePointer) openPreview = null;
    };
    const handleDocumentPointer = (event: PointerEvent) => {
      if (!openPreview) return;
      const target = event.target;
      if (target instanceof Element && target.closest('.social-item')) return;
      openPreview = null;
      activeTrigger = null;
    };
    const handleDocumentKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !openPreview) return;
      event.preventDefault();
      openPreview = null;
      activeTrigger?.focus();
      activeTrigger = null;
    };

    pointerQuery.addEventListener('change', handlePointerChange);
    document.addEventListener('pointerdown', handleDocumentPointer);
    document.addEventListener('keydown', handleDocumentKeydown);

    return () => {
      pointerQuery.removeEventListener('change', handlePointerChange);
      document.removeEventListener('pointerdown', handleDocumentPointer);
      document.removeEventListener('keydown', handleDocumentKeydown);
    };
  });
</script>

<footer class="foot">
  <nav class="footer-socials" aria-label="Social links">
    {#each siteConfig.social as item (item.label)}
      <span
        class="social-item"
        class:social-item-rss={item.preview === 'rss'}
        data-preview-open={openPreview === item.preview ? '' : undefined}
      >
        <a
          href={socialHref(item)}
          target={item.href.startsWith('http') ? '_blank' : undefined}
          rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
          class="icon-btn social-link"
          aria-label={item.label}
          aria-controls={`social-preview-${item.preview}`}
          aria-expanded={coarsePointer ? openPreview === item.preview : undefined}
          onclick={(event) => handleSocialClick(event, item.preview)}
        >
          <span
            class="social-link-icon"
            class:rss-link-icon={item.preview === 'rss'}
            aria-hidden="true"
          >
            <span
              class="icon-mask social-link-icon-mono"
              style={`--icon: url('${item.icon}')`}
            ></span>
            <img
              class="social-link-icon-color"
              class:monochrome-brand={item.preview === 'profile' || item.preview === 'github'}
              src={item.icon}
              alt=""
              width="20"
              height="20"
              decoding="async"
            />
          </span>
        </a>

        <span
          id={`social-preview-${item.preview}`}
          class={`social-preview social-preview-${item.preview}`}
          role="group"
          aria-label={`${item.label} preview`}
        >
          {#if item.preview === 'profile'}
            <span class="profile-header">
              {#if socialData.x.avatarUrl === siteConfig.author.portrait}
                <img
                  src={siteConfig.author.portraitImage.src}
                  srcset={siteConfig.author.portraitImage.srcset}
                  sizes="48px"
                  alt=""
                  width={siteConfig.author.portraitImage.width}
                  height={siteConfig.author.portraitImage.height}
                  loading="lazy"
                  decoding="async"
                />
              {:else}
                <img
                  src={socialData.x.avatarUrl}
                  alt=""
                  width="1254"
                  height="1254"
                  loading="lazy"
                  decoding="async"
                />
              {/if}
              <span class="profile-identity">
                <strong>{socialData.x.name}</strong>
                <span>@{socialData.x.username}</span>
              </span>
              <span
                class="preview-network-icon"
                style={`--icon: url('${item.icon}')`}
                aria-hidden="true"
              ></span>
            </span>
            <span class="profile-bio">{socialData.x.bio}</span>
            {#if socialData.x.followers !== null || socialData.x.following !== null}
              <span class="profile-stats">
                {#if socialData.x.following !== null}
                  <span><strong>{socialData.x.following.toLocaleString()}</strong><small>Following</small></span>
                {/if}
                {#if socialData.x.followers !== null}
                  <span><strong>{socialData.x.followers.toLocaleString()}</strong><small>Followers</small></span>
                {/if}
              </span>
            {/if}
          {:else if item.preview === 'github'}
            <span class="github-header">
              <span>
                <strong>GitHub</strong>
                <span>@{socialData.github.username}</span>
              </span>
              <span
                class="preview-network-icon"
                style={`--icon: url('${item.icon}')`}
                aria-hidden="true"
              ></span>
            </span>
            <span class="preview-section-label">
              <span>26 week activity</span>
              <span class="activity-status"><i></i> Public</span>
            </span>
            <span class="contribution-grid" aria-hidden="true">
              {#each contributionColumns(socialData.github.levels) as week, weekIndex (weekIndex)}
                <span class="contribution-column">
                  {#each week as cell (cell.index)}
                    <i
                      class={`contribution-cell level-${cell.level}`}
                    ></i>
                  {/each}
                </span>
              {/each}
            </span>
            <span class="preview-meta">
              <span>
                {socialData.github.totalContributions === null
                  ? 'Recent 26 weeks'
                  : `${socialData.github.totalContributions.toLocaleString()} contributions`}
              </span>
              <span>
                {socialData.github.followers === null
                  ? `@${socialData.github.username}`
                  : `${socialData.github.followers.toLocaleString()} followers`}
              </span>
            </span>
          {:else if item.preview === 'email'}
            <span class="envelope-flap" aria-hidden="true"></span>
            <span class="envelope-return">
              <span>From</span>
              {siteConfig.author.name}<br />
              {siteHostname}
            </span>
            <span class="envelope-stamps" aria-hidden="true">
              <span class="envelope-stamp envelope-stamp-portrait">
                <img
                  src={siteConfig.author.portraitImage.src}
                  srcset={siteConfig.author.portraitImage.srcset}
                  sizes="48px"
                  alt=""
                  width={siteConfig.author.portraitImage.width}
                  height={siteConfig.author.portraitImage.height}
                  loading="lazy"
                  decoding="async"
                />
                <span>WILL · 26</span>
              </span>
              <span class="envelope-stamp envelope-stamp-mark">
                <span class="envelope-stamp-star">✦</span>
                <span>POST · 26</span>
              </span>
            </span>
            <span class="envelope-postmark" aria-hidden="true"></span>
            <span class="envelope-address">
              <span class="envelope-address-label">To</span>
              {#if clientReady}
                <span class="envelope-address-value">
                  <span>{emailLocalPart}</span><span aria-hidden="true">@</span><span>{emailDomainPart}</span>
                </span>
              {:else}
                <span class="envelope-address-value">{siteHostname}</span>
              {/if}
            </span>
          {:else}
            <span class="rss-preview-header">
              <span
                class="preview-network-icon rss-preview-icon"
                style={`--icon: url('${item.icon}')`}
                aria-hidden="true"
              ></span>
              <span>
                <strong>RSS</strong>
                <span>Subscribe to new posts</span>
              </span>
            </span>
            <span class="rss-preview-list" aria-label="Latest posts">
              {#each latestPosts as post (post.slug)}
                <a href={`/blog/${post.slug}`}>
                  <span>{shortDate(post.date)}</span>
                  <strong>{post.title}</strong>
                  <span aria-hidden="true">↗</span>
                </a>
              {/each}
            </span>
          {/if}
          <a
            class="preview-action"
            href={socialHref(item)}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
          >
            {previewActionLabel(item)} <span aria-hidden="true">↗</span>
          </a>
        </span>
      </span>
    {/each}
    <span class="social-item social-item-design-system">
      <a class="icon-btn social-link" href="/design-system" aria-label="Design system">
        <span class="social-link-icon design-system-link-icon" aria-hidden="true">
          <span
            class="icon-mask social-link-icon-mono"
            style="--icon: url('/icons/design-system.svg')"
          ></span>
          <img
            class="social-link-icon-color"
            src="/icons/design-system.svg"
            alt=""
            width="20"
            height="20"
            decoding="async"
          />
        </span>
      </a>
    </span>
  </nav>
  <p class="footer-copyright">© {siteConfig.author.name} {new Date().getFullYear()}</p>
</footer>

<style>
  .social-item {
    position: relative;
    display: grid;
    place-items: center;
  }

  .social-link {
    width: 44px;
    height: 44px;
  }

  .social-link-icon {
    --social-icon-inset: 0px;

    position: relative;
    display: block;
    width: 20px;
    height: 20px;
  }

  .rss-link-icon {
    --social-icon-inset: 2px;
  }

  .social-link-icon-mono,
  .social-link-icon-color {
    position: absolute;
    inset: var(--social-icon-inset);
    width: calc(100% - (var(--social-icon-inset) * 2));
    height: calc(100% - (var(--social-icon-inset) * 2));
    transition:
      opacity var(--duration-ui) var(--ease-out),
      transform var(--duration-ui) var(--ease-out);
  }

  .social-link-icon-mono {
    opacity: 1;
    transform: scale(1);
  }

  .social-link-icon-color {
    display: block;
    object-fit: contain;
    opacity: 0;
    transform: scale(0.78) rotate(-5deg);
  }

  .social-link:hover .social-link-icon-mono,
  .social-link:focus-visible .social-link-icon-mono {
    opacity: 0;
    transform: scale(0.88);
  }

  .social-link:hover .social-link-icon-color,
  .social-link:focus-visible .social-link-icon-color {
    opacity: 1;
    transform: scale(1) rotate(0);
  }

  :global(:root[data-theme='dark']) .social-link-icon-color.monochrome-brand {
    filter: invert(1);
  }

  .social-preview {
    --preview-accent: var(--brand);

    position: absolute;
    bottom: calc(100% + 16px);
    left: 50%;
    z-index: 100;
    display: flex;
    width: min(284px, calc(100vw - 32px));
    flex-direction: column;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--hairline-strong) 82%, transparent);
    border-radius: 7px;
    gap: 10px;
    padding: 14px 16px 0;
    background:
      radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--ink) 5%, transparent) 0 0.55px, transparent 0.75px)
        0 0 / 12px 12px,
      color-mix(in srgb, var(--surface) 97%, transparent);
    box-shadow:
      0 24px 64px rgb(20 20 19 / 18%),
      0 4px 14px rgb(20 20 19 / 8%);
    color: var(--ink);
    font-family: var(--sans);
    font-size: 13px;
    letter-spacing: 0;
    line-height: 1.45;
    opacity: 0;
    pointer-events: none;
    text-align: left;
    transform: translate(-50%, 4px) scale(0.95);
    transform-origin: bottom center;
    visibility: hidden;
    transition:
      opacity var(--duration-ui) var(--ease-out) 80ms,
      transform var(--duration-ui) var(--ease-out) 80ms,
      visibility 0s linear 280ms;
  }

  .social-preview::before {
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    background: var(--preview-accent);
    content: '';
    opacity: 0.82;
  }

  .social-preview-profile {
    --preview-accent: #181717;
  }

  .social-preview-github {
    --preview-accent: #2da44e;
  }

  .social-preview-email {
    --preview-accent: #7898b4;
  }

  .social-preview-rss {
    --preview-accent: #f26522;
  }

  :global(:root[data-theme='dark']) .social-preview-profile {
    --preview-accent: #f5f4ed;
  }

  .social-item:focus-within .social-preview {
    opacity: 1;
    pointer-events: auto;
    transform: translate(-50%, 0) scale(1);
    visibility: visible;
    transition-delay: 0s;
  }

  .social-item[data-preview-open] .social-preview {
    opacity: 1;
    pointer-events: auto;
    transform: translate(-50%, 0) scale(1);
    visibility: visible;
    transition-delay: 0s;
  }

  .preview-action {
    display: flex;
    min-height: 44px;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 0 -16px;
    border-top: 1px solid color-mix(in srgb, var(--preview-accent) 20%, var(--hairline));
    padding: 0 16px;
    background: color-mix(in srgb, var(--preview-accent) 5%, transparent);
    color: var(--preview-accent);
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: var(--track-nav);
    text-transform: uppercase;
    transition:
      background var(--duration-fast) var(--ease-out),
      letter-spacing var(--duration-fast) var(--ease-out);
  }

  .preview-action:hover {
    background: color-mix(in srgb, var(--preview-accent) 9%, transparent);
    letter-spacing: calc(var(--track-nav) + 0.025em);
  }

  .preview-action:focus-visible {
    outline-offset: 2px;
  }

  .profile-header,
  .github-header,
  .rss-preview-header {
    display: flex;
    align-items: center;
    min-height: 44px;
  }

  .rss-preview-header {
    gap: 12px;
  }

  .rss-preview-header > span:last-child {
    display: flex;
    flex-direction: column;
  }

  .rss-preview-header strong {
    color: var(--ink);
    font-family: var(--font);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.15;
  }

  .rss-preview-header > span:last-child > span {
    color: var(--ink-muted);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .rss-preview-icon {
    width: 28px;
    height: 28px;
    color: var(--preview-accent);
  }

  .profile-header img {
    width: 44px;
    height: 44px;
    flex: none;
    border: 1px solid color-mix(in srgb, var(--preview-accent) 24%, var(--hairline-strong));
    border-radius: 50%;
    box-shadow: 0 3px 10px rgb(20 20 19 / 12%);
    object-fit: cover;
  }

  .profile-identity,
  .github-header > span:first-child {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    margin-left: 10px;
  }

  .github-header > span:first-child {
    margin-left: 0;
  }

  .profile-identity strong,
  .github-header strong {
    color: var(--ink);
    font-family: var(--font);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.15;
  }

  .profile-identity > span,
  .github-header > span:first-child > span {
    color: var(--ink-muted);
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.05em;
  }

  .preview-network-icon {
    width: 18px;
    height: 18px;
    flex: none;
    background: currentColor;
    color: var(--preview-accent);
    mask: var(--icon) center / contain no-repeat;
  }

  .profile-bio {
    margin: 2px 0;
    color: var(--ink-soft);
    font-family: var(--font);
    font-size: 14px;
    line-height: 1.55;
  }

  .profile-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0;
    border-block: 1px solid var(--hairline);
    color: var(--ink-muted);
    font-family: var(--mono);
    font-size: 9px;
  }

  .profile-stats > span {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 8px 0;
  }

  .profile-stats > span + span {
    border-left: 1px solid var(--hairline);
    padding-left: 12px;
  }

  .profile-stats strong {
    color: var(--ink);
    font-family: var(--font);
    font-size: 16px;
    font-weight: 600;
  }

  .profile-stats small {
    font-size: 8px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .preview-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0;
    border-top: 1px solid var(--hairline);
    padding-top: 9px;
    color: var(--ink-muted);
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: var(--track-nav);
    text-transform: uppercase;
  }

  .preview-section-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--ink-muted);
    font-family: var(--mono);
    font-size: 8px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .activity-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .activity-status i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--preview-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--preview-accent) 12%, transparent);
  }

  .contribution-grid {
    display: flex;
    gap: 2px;
    padding: 9px 0;
    border-block: 1px solid color-mix(in srgb, var(--preview-accent) 12%, var(--hairline));
  }

  .contribution-column {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .contribution-cell {
    display: block;
    width: 7px;
    height: 7px;
    border: 0;
    border-radius: 1.5px;
    background: var(--surface-muted);
  }

  .contribution-cell.level-1 {
    background: color-mix(in srgb, var(--preview-accent) 28%, var(--surface-muted));
  }

  .contribution-cell.level-2 {
    background: color-mix(in srgb, var(--preview-accent) 48%, var(--surface-muted));
  }

  .contribution-cell.level-3 {
    background: color-mix(in srgb, var(--preview-accent) 70%, var(--surface-muted));
  }

  .contribution-cell.level-4 {
    background: var(--preview-accent);
  }

  .rss-preview-list {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--hairline);
  }

  .rss-preview-list a {
    display: grid;
    min-height: 45px;
    grid-template-columns: 34px minmax(0, 1fr) auto;
    align-items: center;
    gap: 9px;
    border-bottom: 1px solid var(--hairline);
    color: var(--ink);
    transition:
      background var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out);
  }

  .rss-preview-list a:hover,
  .rss-preview-list a:focus-visible {
    background: color-mix(in srgb, var(--preview-accent) 6%, transparent);
    color: var(--preview-accent);
  }

  .rss-preview-list a > span:first-child {
    color: var(--ink-muted);
    font-family: var(--mono);
    font-size: 8px;
    letter-spacing: 0.04em;
  }

  .rss-preview-list strong {
    overflow: hidden;
    font-family: var(--font);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rss-preview-list a > span:last-child {
    color: var(--preview-accent);
    font-size: 10px;
  }

  .social-preview-email {
    --mail-paper: #f5f4ed;
    --mail-ink: #5e5c56;
    --mail-red: #b56f6b;
    --mail-blue: #7898b4;

    position: absolute;
    display: block;
    height: 204px;
    overflow: hidden;
    border: 0;
    border-radius: 7px;
    padding: 0;
    background:
      radial-gradient(circle at 1px 1px, rgb(104 102 95 / 5%) 0 0.55px, transparent 0.75px)
        0 0 / 12px 12px,
      var(--mail-paper);
    color: var(--mail-ink);
  }

  .social-preview-email .preview-action {
    position: absolute;
    right: 4px;
    bottom: 4px;
    left: 4px;
    z-index: 5;
    min-height: 43px;
    margin: 0;
    border-top-color: rgb(104 102 95 / 24%);
    padding: 0 13px;
    background: rgb(245 244 237 / 86%);
    color: var(--mail-blue);
  }

  .social-preview-email::before {
    position: absolute;
    inset: 0;
    z-index: 4;
    background:
      repeating-linear-gradient(135deg, var(--mail-red) 0 7px, transparent 7px 14px, var(--mail-blue) 14px 21px, transparent 21px 28px)
        top / 100% 3px no-repeat,
      repeating-linear-gradient(135deg, var(--mail-red) 0 7px, transparent 7px 14px, var(--mail-blue) 14px 21px, transparent 21px 28px)
        bottom / 100% 3px no-repeat,
      repeating-linear-gradient(45deg, var(--mail-red) 0 7px, transparent 7px 14px, var(--mail-blue) 14px 21px, transparent 21px 28px)
        left / 3px 100% no-repeat,
      repeating-linear-gradient(45deg, var(--mail-red) 0 7px, transparent 7px 14px, var(--mail-blue) 14px 21px, transparent 21px 28px)
        right / 4px 100% no-repeat;
    content: '';
    opacity: 0.66;
    pointer-events: none;
  }

  .envelope-flap {
    position: absolute;
    inset: auto 0 0;
    z-index: 0;
    height: 62%;
    clip-path: polygon(0 100%, 0 66%, 50% 19%, 100% 66%, 100% 100%);
    background: rgb(104 102 95 / 2.5%);
    filter: drop-shadow(0 -1px 0 rgb(104 102 95 / 24%));
  }

  .envelope-return {
    position: absolute;
    top: 19px;
    left: 19px;
    z-index: 1;
    font-family: var(--mono);
    font-size: 8px;
    line-height: 1.45;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .envelope-return > span,
  .envelope-address-label {
    display: block;
    margin-bottom: 3px;
    font-size: 6px;
    letter-spacing: 0.16em;
    opacity: 0.68;
  }

  .envelope-stamps {
    position: absolute;
    top: 13px;
    right: 15px;
    display: grid;
    grid-template-columns: 45px 34px;
    gap: 4px;
    z-index: 2;
  }

  .envelope-stamp {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 3px dotted var(--mail-paper);
    font-family: var(--mono);
    line-height: 1;
    box-shadow: 0 0 0 1px rgb(104 102 95 / 36%);
  }

  .envelope-stamp-portrait {
    height: 55px;
    background: rgb(181 111 107 / 11%);
    transform: rotate(1.5deg);
  }

  .envelope-stamp-portrait img {
    width: 30px;
    height: 30px;
    object-fit: cover;
    filter: grayscale(1) contrast(1.08);
  }

  .envelope-stamp-portrait span,
  .envelope-stamp-mark > span:last-child {
    margin-top: 3px;
    font-size: 5px;
    letter-spacing: 0.06em;
  }

  .envelope-stamp-mark {
    height: 44px;
    margin-top: 5px;
    background: rgb(120 152 180 / 10%);
    transform: rotate(-3deg);
  }

  .envelope-stamp-star {
    font-size: 16px;
    color: rgb(120 152 180 / 90%);
  }

  .envelope-postmark {
    position: absolute;
    top: 25px;
    right: 67px;
    z-index: 3;
    width: 34px;
    height: 34px;
    border: 1px solid rgb(104 102 95 / 58%);
    border-radius: 50%;
    opacity: 0.72;
    transform: rotate(-8deg);
  }

  .envelope-postmark::before {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    content: '26 JUL';
    font-family: var(--mono);
    font-size: 5px;
    letter-spacing: 0.04em;
  }

  .envelope-postmark::after {
    position: absolute;
    top: 8px;
    left: 26px;
    width: 44px;
    height: 16px;
    background: repeating-linear-gradient(
      to bottom,
      rgb(104 102 95 / 58%) 0 1px,
      transparent 1px 5px
    );
    content: '';
  }

  .envelope-address {
    position: absolute;
    top: 94px;
    left: 42px;
    z-index: 2;
    font-family: var(--mono);
    line-height: 1.25;
    white-space: nowrap;
  }

  .envelope-address-value {
    display: inline-flex;
    align-items: baseline;
    color: var(--mail-ink);
    font-size: 13px;
    letter-spacing: 0.045em;
  }

  @media (hover: hover) and (pointer: fine) {
    .social-item:hover .social-preview {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, 0) scale(1);
      visibility: visible;
      transition-delay: 80ms, 80ms, 80ms;
    }
  }

  @media (width <= 600px) {
    .social-item:first-child .social-preview {
      left: 0;
      transform: translate(0, 4px) scale(0.95);
      transform-origin: bottom left;
    }

    .social-item:first-child[data-preview-open] .social-preview,
    .social-item:first-child:focus-within .social-preview {
      transform: translate(0, 0) scale(1);
    }

    .social-item-rss .social-preview {
      right: 0;
      left: auto;
      transform: translate(0, 4px) scale(0.95);
      transform-origin: bottom right;
    }

    .social-item-rss[data-preview-open] .social-preview,
    .social-item-rss:focus-within .social-preview {
      transform: translate(0, 0) scale(1);
    }
  }

  @media (hover: hover) and (pointer: fine) and (width <= 600px) {
    .social-item:first-child:hover .social-preview,
    .social-item-rss:hover .social-preview {
      transform: translate(0, 0) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .social-link-icon-mono,
    .social-link-icon-color {
      transform: none;
      transition: opacity var(--duration-fast) var(--ease-out);
    }

    .social-preview {
      transform: translate(-50%, 0) scale(1);
      transition:
        opacity var(--duration-fast) var(--ease-out),
        visibility 0s linear var(--duration-fast);
    }

    .contribution-cell {
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) and (width <= 600px) {
    .social-item:first-child .social-preview,
    .social-item-rss .social-preview {
      transform: translate(0, 0) scale(1);
    }
  }
</style>
