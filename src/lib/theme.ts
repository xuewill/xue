import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

export const themeStorageKey = 'xue-theme';
export const theme = writable<Theme>('light');

let observer: MutationObserver | undefined;
let observerUsers = 0;

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

export function oppositeTheme(current: Theme): Theme {
  return current === 'dark' ? 'light' : 'dark';
}

function syncFromDocument(): void {
  const current = document.documentElement.dataset.theme;
  if (isTheme(current)) theme.set(current);
}

function syncFromStorage(event: StorageEvent): void {
  if (event.key !== themeStorageKey || !isTheme(event.newValue)) return;
  document.documentElement.dataset.theme = event.newValue;
  theme.set(event.newValue);
}

export function observeTheme(): () => void {
  if (!browser) return () => undefined;

  observerUsers += 1;
  syncFromDocument();

  if (!observer) {
    observer = new MutationObserver(syncFromDocument);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    window.addEventListener('storage', syncFromStorage);
  }

  return () => {
    observerUsers -= 1;
    if (observerUsers > 0) return;

    observer?.disconnect();
    observer = undefined;
    window.removeEventListener('storage', syncFromStorage);
  };
}

export function setTheme(nextTheme: Theme): void {
  theme.set(nextTheme);
  if (!browser) return;

  document.documentElement.dataset.theme = nextTheme;
  try {
    localStorage.setItem(themeStorageKey, nextTheme);
  } catch {
    // The visual theme should still change when storage is unavailable.
  }
}
