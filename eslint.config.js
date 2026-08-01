import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default defineConfig(
  globalIgnores([
    '.svelte-kit/**',
    '.velite/**',
    'build/**',
    'src/lib/generated/content/**',
    'static/generated/**'
  ]),
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      'svelte/no-navigation-without-resolve': ['error', { ignoreLinks: true }]
    }
  },
  // These routes render Velite HTML compiled from trusted, repository-owned Markdown.
  {
    files: ['src/routes/blog/*/+page.svelte', 'src/routes/home/*/+page.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off'
    }
  },
  {
    files: ['**/*.ts', '**/*.svelte'],
    rules: {
      'no-undef': 'off'
    }
  },
  {
    files: ['scripts/**/*.mjs'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig
      }
    }
  }
);
