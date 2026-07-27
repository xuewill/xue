<script lang="ts">
  import { onMount } from 'svelte';
  import { siteConfig } from '$lib/config/site';
  import { fallbackSocialData, type SocialData } from '$lib/types/social';

  let { socialData = fallbackSocialData }: { socialData?: SocialData } = $props();
  type SocialPreview = (typeof siteConfig.social)[number]['preview'];

  let openPreview = $state<SocialPreview | null>(null);
  let coarsePointer = $state(false);
  let activeTrigger: HTMLAnchorElement | null = null;
  const [emailLocalPart, emailDomainPart] = siteConfig.author.email.split('@');

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
  <!--email_off-->
  <nav class="footer-socials" aria-label="Social links">
    {#each siteConfig.social as item (item.label)}
      <span class="social-item" data-preview-open={openPreview === item.preview ? '' : undefined}>
        <a
          href={item.href}
          target={item.href.startsWith('http') ? '_blank' : undefined}
          rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
          class="icon-btn social-link"
          aria-label={item.label}
          aria-controls={`social-preview-${item.preview}`}
          aria-expanded={coarsePointer ? openPreview === item.preview : undefined}
          onclick={(event) => handleSocialClick(event, item.preview)}
        >
          <span
            class="icon-mask social-link-icon"
            class:rss-link-icon={item.preview === 'rss'}
            style={`--icon: url('${item.icon}')`}
            aria-hidden="true"
          ></span>
        </a>

        <span
          id={`social-preview-${item.preview}`}
          class={`social-preview social-preview-${item.preview}`}
          role="group"
          aria-label={`${item.label} preview`}
        >
          {#if item.preview === 'profile'}
            <span class="profile-header">
              <img src={socialData.x.avatarUrl} alt="" width="1254" height="1254" />
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
                  <span><strong>{socialData.x.following.toLocaleString()}</strong> following</span>
                {/if}
                {#if socialData.x.followers !== null}
                  <span><strong>{socialData.x.followers.toLocaleString()}</strong> followers</span>
                {/if}
              </span>
            {/if}
            <span class="preview-meta"><span>View profile</span><span aria-hidden="true">↗</span></span>
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
              willxue.com
            </span>
            <span class="envelope-stamps" aria-hidden="true">
              <span class="envelope-stamp envelope-stamp-portrait">
                <img src="/headshot.png" alt="" width="1254" height="1254" />
                <span>WILL · 26</span>
              </span>
              <span class="envelope-stamp envelope-stamp-mark">
                <span class="envelope-stamp-star">✦</span>
                <span>POST · 26</span>
              </span>
            </span>
            <span class="envelope-postmark" aria-hidden="true"></span>
            <span class="envelope-address">
              <span>To</span>
              <span>{emailLocalPart}</span><span aria-hidden="true">@</span><span>{emailDomainPart}</span>
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
            <span class="preview-meta">
              <span>XML feed</span>
              <span>/rss.xml</span>
            </span>
          {/if}
          <a
            class="preview-action"
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
          >
            {previewActionLabel(item)} <span aria-hidden="true">↗</span>
          </a>
        </span>
      </span>
    {/each}
  </nav>
  <!--/email_off-->
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
    width: 20px;
    height: 20px;
  }

  .rss-link-icon {
    width: 16px;
    height: 16px;
  }

  .social-preview {
    position: absolute;
    bottom: calc(100% + 16px);
    left: 50%;
    z-index: 100;
    display: flex;
    width: min(256px, calc(100vw - 32px));
    flex-direction: column;
    border: 1px solid var(--hairline-strong);
    border-radius: 2px;
    gap: 6px;
    padding: 10px 12px;
    background: color-mix(in srgb, var(--surface) 97%, transparent);
    box-shadow: 0 18px 44px rgb(20 20 19 / 18%);
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
    margin-top: 4px;
    border-top: 1px solid var(--hairline);
    padding-top: 8px;
    color: var(--brand);
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: var(--track-nav);
    text-transform: uppercase;
  }

  .preview-action:focus-visible {
    outline-offset: 2px;
  }

  .profile-header,
  .github-header,
  .rss-preview-header {
    display: flex;
    align-items: center;
  }

  .rss-preview-header {
    gap: 10px;
  }

  .rss-preview-header > span:last-child {
    display: flex;
    flex-direction: column;
  }

  .rss-preview-header strong {
    color: var(--ink);
    font-size: 14px;
    font-weight: 500;
  }

  .rss-preview-header > span:last-child > span {
    color: var(--ink-muted);
    font-family: var(--mono);
    font-size: 11px;
  }

  .rss-preview-icon {
    width: 24px;
    height: 24px;
    color: var(--ink-muted);
  }

  .profile-header img {
    width: 40px;
    height: 40px;
    flex: none;
    border: 1px solid var(--hairline-strong);
    border-radius: 50%;
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
    font-size: 14px;
    font-weight: 500;
  }

  .profile-identity > span,
  .github-header > span:first-child > span {
    color: var(--ink-muted);
    font-family: var(--mono);
    font-size: 11px;
  }

  .preview-network-icon {
    width: 16px;
    height: 16px;
    flex: none;
    background: currentColor;
    color: var(--ink-muted);
    mask: var(--icon) center / contain no-repeat;
  }

  .profile-bio {
    margin-top: 8px;
    color: var(--ink-soft);
    font-family: var(--font);
    font-size: 14px;
    line-height: 1.55;
  }

  .profile-stats {
    display: flex;
    gap: 12px;
    color: var(--ink-muted);
    font-size: 11px;
  }

  .profile-stats strong {
    color: var(--ink);
    font-weight: 500;
  }

  .preview-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
    border-top: 1px solid var(--hairline);
    padding-top: 8px;
    color: var(--ink-muted);
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: var(--track-nav);
    text-transform: uppercase;
  }

  .contribution-grid {
    display: flex;
    gap: 2px;
    margin-top: 8px;
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
    border-radius: 2px;
    background: var(--surface-muted);
  }

  .contribution-cell.level-1 {
    background: color-mix(in srgb, var(--ink) 30%, transparent);
  }

  .contribution-cell.level-2 {
    background: color-mix(in srgb, var(--ink) 52%, transparent);
  }

  .contribution-cell.level-3 {
    background: color-mix(in srgb, var(--ink) 74%, transparent);
  }

  .contribution-cell.level-4 {
    background: var(--ink);
  }

  .social-preview-email {
    --mail-paper: #f5f4ed;
    --mail-ink: #68665f;
    --mail-red: #b56f6b;
    --mail-blue: #7898b4;

    position: absolute;
    display: block;
    height: 198px;
    overflow: hidden;
    border: 0;
    border-radius: 5px;
    padding: 0;
    background:
      radial-gradient(circle at 18% 24%, rgb(104 102 95 / 4%) 0 0.5px, transparent 0.75px),
      var(--mail-paper);
    background-size: 13px 11px, auto;
    color: var(--mail-ink);
  }

  .social-preview-email .preview-action {
    position: absolute;
    right: 12px;
    bottom: 7px;
    left: 12px;
    z-index: 5;
    border-top-color: rgb(104 102 95 / 24%);
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
        right / 3px 100% no-repeat;
    content: '';
    opacity: 0.62;
    pointer-events: none;
  }

  .envelope-flap {
    position: absolute;
    inset: auto 0 0;
    z-index: 0;
    height: 66%;
    clip-path: polygon(0 100%, 0 75%, 50% 25%, 100% 75%, 100% 100%);
    background: rgb(104 102 95 / 3%);
    filter: drop-shadow(0 -1px 0 rgb(104 102 95 / 34%));
  }

  .envelope-return {
    position: absolute;
    top: 17px;
    left: 17px;
    z-index: 1;
    font-family: var(--mono);
    font-size: 7px;
    line-height: 1.45;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .envelope-return > span,
  .envelope-address > span {
    display: block;
    margin-bottom: 1px;
    font-size: 6px;
    letter-spacing: 0.16em;
    opacity: 0.72;
  }

  .envelope-stamps {
    position: absolute;
    top: 11px;
    right: 13px;
    display: grid;
    grid-template-columns: 48px 36px;
    gap: 3px;
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
    height: 58px;
    background: rgb(181 111 107 / 11%);
    transform: rotate(2deg);
  }

  .envelope-stamp-portrait img {
    width: 32px;
    height: 32px;
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
    height: 46px;
    margin-top: 4px;
    background: rgb(120 152 180 / 10%);
    transform: rotate(-3deg);
  }

  .envelope-stamp-star {
    font-size: 16px;
    color: rgb(120 152 180 / 90%);
  }

  .envelope-postmark {
    position: absolute;
    top: 21px;
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
    top: 87px;
    left: 53px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    font-family: var(--mono);
    font-size: 13px;
    line-height: 1.35;
    letter-spacing: 0.035em;
    white-space: nowrap;
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

    .social-item:last-child .social-preview {
      right: 0;
      left: auto;
      transform: translate(0, 4px) scale(0.95);
      transform-origin: bottom right;
    }

    .social-item:last-child[data-preview-open] .social-preview,
    .social-item:last-child:focus-within .social-preview {
      transform: translate(0, 0) scale(1);
    }
  }

  @media (hover: hover) and (pointer: fine) and (width <= 600px) {
    .social-item:first-child:hover .social-preview,
    .social-item:last-child:hover .social-preview {
      transform: translate(0, 0) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
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
    .social-item:last-child .social-preview {
      transform: translate(0, 0) scale(1);
    }
  }
</style>
