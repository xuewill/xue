<script lang="ts">
  type Tone = 'brand' | 'success';
  interface Props { value?: number; label?: string; tone?: Tone; compact?: boolean; }
  let { value = 62, label = 'Progress', tone = 'brand', compact = false }: Props = $props();
  const safeValue = $derived(Math.max(0, Math.min(100, value)));
</script>

<div class={`ds-progress-wrap ds-progress-${tone}`} class:compact>
  <div class="ds-progress-label"><span>{label}</span><span>{safeValue}%</span></div>
  <div class="ds-progress" role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={safeValue}><span style={`width:${safeValue}%`}></span></div>
</div>

<style>
  .ds-progress-wrap { --progress-color: var(--brand); display: grid; gap: 8px; }
  .ds-progress-success { --progress-color: #3f7658; }
  .ds-progress-label { display: flex; justify-content: space-between; color: var(--ink-muted); font-family: var(--mono); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
  .ds-progress { height: 8px; overflow: hidden; border: 1px solid var(--hairline-strong); background: var(--surface-muted); }
  .ds-progress span { display: block; height: 100%; background: var(--progress-color); transition: width var(--duration-ui) var(--ease-out); }
  .compact .ds-progress { height: 4px; border: 0; }
  @media (prefers-reduced-motion: reduce) { .ds-progress span { transition: none; } }
</style>
