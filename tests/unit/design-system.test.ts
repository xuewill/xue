import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { componentApi } from '../../src/lib/components/design-system/api';

const root = path.resolve(import.meta.dirname, '../..');
const componentDirectory = path.join(root, 'node_modules/@webaseui/svelte/dist/components');
const tokenPath = path.join(root, 'node_modules/@webaseui/core/src/tokens.css');
const publicIndexPath = path.join(root, 'node_modules/@webaseui/svelte/dist/index.d.ts');
const pagePath = path.join(root, 'src/routes/design-system/+page.svelte');

/** WeBaseIcon is the shared icon primitive rather than a catalogued specimen. */
const INFRASTRUCTURE_COMPONENTS = new Set(['WeBaseIcon.svelte']);

const componentFiles = readdirSync(componentDirectory)
  .filter((file) => file.endsWith('.svelte'))
  .sort();

function readComponent(file: string): string {
  return readFileSync(path.join(componentDirectory, file), 'utf8');
}

function declaredTokens(blockSelector: string): Set<string> {
  const css = readFileSync(tokenPath, 'utf8');
  const block = new RegExp(`${blockSelector}\\s*\\{([^}]*)\\}`).exec(css);
  if (!block) throw new Error(`Could not find the ${blockSelector} block in WeBaseUI tokens`);
  return new Set([...block[1].matchAll(/(--[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
}

describe('design system tokens', () => {
  it('defines every semantic status token in both themes', () => {
    const light = declaredTokens(':root');
    const dark = declaredTokens(":root\\[data-theme='dark'\\]");
    const statusTokens = [...light].filter((token) => /^--webase-color-(error|success|warning|info)/.test(token));

    expect(statusTokens.length).toBeGreaterThan(0);
    for (const token of statusTokens) {
      expect(dark, `${token} needs a dark-theme value`).toContain(token);
    }
  });

  it('resolves every custom property the components reference', () => {
    const light = declaredTokens(':root');

    for (const file of componentFiles) {
      const source = readComponent(file);
      const used = [...source.matchAll(/var\((--[a-z0-9-]+)/g)].map((match) => match[1]);
      for (const token of used) {
        // Component-local properties are declared inside the component itself.
        if (source.includes(`${token}:`)) continue;
        expect(light, `${file} uses undefined token ${token}`).toContain(token);
      }
    }
  });

  it('keeps hardcoded colors out of components so both themes stay correct', () => {
    for (const file of componentFiles) {
      const style = readComponent(file).split('<style>')[1] ?? '';
      const hex = style.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
      expect(hex, `${file} should use a token instead of ${hex.join(', ')}`).toEqual([]);
    }
  });
});

describe('design system components', () => {
  it('exports a named Props type for every public component', () => {
    const publicIndex = readFileSync(publicIndexPath, 'utf8');

    for (const file of componentFiles) {
      const component = file.replace('.svelte', '');
      expect(publicIndex, `${component}Props must be exported from the package root`).toContain(
        `export type ${component}Props = ComponentProps<`
      );
    }
  });

  it('provides Snippet composition points on content surfaces', () => {
    const compositionPoints = {
      'WeBaseAlert.svelte': ['children', 'actions'],
      'WeBaseCard.svelte': ['children', 'footer'],
      'WeBaseEmptyState.svelte': ['children', 'actions']
    };

    for (const [file, snippets] of Object.entries(compositionPoints)) {
      const source = readComponent(file);
      expect(source, `${file} should use the Svelte 5 Snippet contract`).toContain(
        "import type { Snippet } from 'svelte'"
      );
      for (const snippet of snippets) {
        expect(source, `${file} must declare ${snippet} as a Snippet`).toContain(
          `${snippet}?: Snippet`
        );
        expect(source, `${file} must render ${snippet}`).toContain(`{@render ${snippet}()}`);
      }
    }
  });

  it('forwards root element attributes from every component', () => {
    for (const file of componentFiles) {
      const source = readComponent(file);
      expect(source, `${file} must expose typed native attributes`).toContain(
        "from 'svelte/elements'"
      );
      expect(source, `${file} must collect native root attributes`).toContain('...rest');
      expect(source, `${file} must forward native root attributes`).toContain('{...rest}');
      expect(source, `${file} must merge a consumer class onto its root`).toContain('className');
    }
  });

  it('derives default ids instead of hardcoding colliding constants', () => {
    for (const file of componentFiles) {
      const source = readComponent(file);
      if (!/\bid\??\s*:\s*string/.test(source)) continue;
      expect(source, `${file} should default its id to $props.id()`).toContain('$props.id()');
      expect(source, `${file} must not hardcode a default id`).not.toMatch(/id = '[a-z-]+'/);
    }
  });

  it('keeps aria-controls targets mounted rather than conditionally rendered', () => {
    // A panel removed from the DOM leaves aria-controls pointing at nothing.
    for (const file of ['WeBaseTabs.svelte', 'WeBaseAccordion.svelte']) {
      const source = readComponent(file);
      expect(source, `${file} should reference aria-controls`).toContain('aria-controls');
      expect(source, `${file} should hide panels with [hidden], not {#if}`).toContain('hidden={');
    }
  });

  it('announces the toast from a permanently mounted live region', () => {
    const source = readComponent('WeBaseToast.svelte');
    // role="status" / role="alert" carry the implicit aria-live semantics.
    const liveRegionIndex = source.indexOf('role={tone');
    const conditionalIndex = source.indexOf('{#if open}');

    expect(liveRegionIndex).toBeGreaterThan(-1);
    expect(liveRegionIndex, 'the live region must exist before its contents change').toBeLessThan(
      conditionalIndex
    );
  });
});

describe('design system prop reference', () => {
  /**
   * Props are declared either one-per-line or all on a single line. Only the
   * leading identifier of each declaration counts — otherwise a parameter name
   * inside a callback type, like `onclick?: (event: MouseEvent) => void`, would
   * be mistaken for a prop.
   */
  function declaredProps(source: string): string[] {
    const block = /interface Props(?:\s+extends\s+[^{}]+)?\s*\{([^}]*)\}/.exec(source);
    if (!block) return [];
    return block[1]
      .split(/[;\n]/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('/') && !line.startsWith('*'))
      .map((line) => /^([A-Za-z][A-Za-z0-9]*)\??:/.exec(line)?.[1])
      .filter((name): name is string => Boolean(name));
  }

  it('documents every catalogued component exactly once', () => {
    const documented = componentApi.map((entry) => entry.name).sort();
    const expected = componentFiles.map((file) => file.replace('.svelte', '')).sort();

    expect(documented).toEqual(expected);
  });

  it('matches the props each component actually declares', () => {
    for (const entry of componentApi) {
      const actual = declaredProps(readComponent(`${entry.name}.svelte`)).sort();
      const documented = entry.props.map((prop) => prop.name).sort();

      expect(documented, `${entry.name} prop reference is out of date`).toEqual(actual);
    }
  });

  it('marks a prop bindable only when the component declares $bindable', () => {
    for (const entry of componentApi) {
      const source = readComponent(`${entry.name}.svelte`);
      for (const prop of entry.props) {
        const isBindable = new RegExp(`\\b${prop.name}\\s*=\\s*\\$bindable\\(`).test(source);
        expect(Boolean(prop.bindable), `${entry.name}.${prop.name} bindable flag`).toBe(isBindable);
      }
    }
  });
});

describe('visual regression harness', () => {
  /*
    Baselines are pixel-compared, so the container CI runs in must be the same
    one that generated them. Both derive from the pinned Playwright version;
    this asserts the workflow's hardcoded tag has not drifted from it.
  */
  it('pins the CI container to the installed Playwright version', () => {
    const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
    const declared =
      manifest.devDependencies?.['@playwright/test'] ?? manifest.dependencies?.['@playwright/test'];
    const version = String(declared).replace(/^[^0-9]*/, '');

    const workflow = readFileSync(path.join(root, '.github/workflows/check.yml'), 'utf8');
    const image = /container:\s*(mcr\.microsoft\.com\/playwright:\S+)/.exec(workflow);

    expect(image, 'the visual job should declare a Playwright container').not.toBeNull();
    expect(image?.[1]).toBe(`mcr.microsoft.com/playwright:v${version}-noble`);
  });

  it('keeps the visual project out of the default end-to-end run', () => {
    const config = readFileSync(path.join(root, 'playwright.config.ts'), 'utf8');

    // `playwright test` runs every declared project, so the visual one must be conditional.
    expect(config).toMatch(/process\.env\.PLAYWRIGHT_VISUAL\s*\?/);
    expect(config, 'chromium must not pick up the visual spec').toMatch(
      /testIgnore:\s*\/visual\\\.spec\\\.ts\//
    );
  });
});

describe('design system page', () => {
  it('reports a component count that matches the catalogue', () => {
    const catalogued = componentFiles.filter((file) => !INFRASTRUCTURE_COMPONENTS.has(file));
    const ledger = /<strong>(\d+)<\/strong> components/.exec(readFileSync(pagePath, 'utf8'));

    expect(ledger, 'the hero ledger should state a component count').not.toBeNull();
    expect(Number(ledger?.[1])).toBe(catalogued.length);
  });

  it('leaves no unused component styles behind', () => {
    const page = readFileSync(pagePath, 'utf8');
    const [markup, style = ''] = page.split('<style>');
    const declared = [...style.matchAll(/\.(ds-[a-z0-9-]+)/g)].map((match) => match[1]);

    // Classes assembled in a template literal, e.g. class={`ds-color-${token.sample}`}.
    const dynamicPrefixes = [...markup.matchAll(/(ds-[a-z0-9-]*-)\$\{/g)].map((match) => match[1]);
    // Selectors reaching into a child component's own markup.
    const globalScoped = new Set(
      [...style.matchAll(/:global\(\.(ds-[a-z0-9-]+)\)/g)].map((match) => match[1])
    );

    const unused = [...new Set(declared)].filter(
      (className) =>
        !markup.includes(className) &&
        !globalScoped.has(className) &&
        !dynamicPrefixes.some((prefix) => className.startsWith(prefix))
    );
    expect(unused, `unused selectors: ${unused.join(', ')}`).toEqual([]);
  });
});
