<script lang="ts">
  interface Props { label: string; value?: number; min?: number; max?: number; step?: number; unit?: string; id?: string; }
  let { label, value = $bindable(48), min = 0, max = 100, step = 1, unit = '%', id = 'xue-slider' }: Props = $props();
  const position = $derived(((value - min) / Math.max(1, max - min)) * 100);
</script>

<label class="ds-slider" for={id}>
  <span class="ds-slider-label"><span>{label}</span><output for={id}>{value}{unit}</output></span>
  <input {id} type="range" {min} {max} {step} bind:value style={`--slider-position:${position}%`} />
  <span class="ds-slider-scale" aria-hidden="true"><span>{min}{unit}</span><span>{max}{unit}</span></span>
</label>

<style>
  .ds-slider { display: grid; gap: 10px; }
  .ds-slider-label, .ds-slider-scale { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .ds-slider-label { color: var(--ink); font-family: var(--sans); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
  output { color: var(--brand); font-family: var(--mono); }
  input { width: 100%; height: 18px; margin: 0; appearance: none; background: transparent; cursor: pointer; }
  input::-webkit-slider-runnable-track { height: 3px; border: 1px solid var(--hairline-strong); background: linear-gradient(to right, var(--brand) 0 var(--slider-position), var(--surface-muted) var(--slider-position) 100%); }
  input::-webkit-slider-thumb { width: 18px; height: 18px; margin-top: -8px; appearance: none; border: 2px solid var(--surface); border-radius: 50%; background: var(--brand); box-shadow: 0 0 0 1px var(--brand); }
  input::-moz-range-track { height: 3px; border: 1px solid var(--hairline-strong); background: var(--surface-muted); }
  input::-moz-range-progress { height: 3px; background: var(--brand); }
  input::-moz-range-thumb { width: 15px; height: 15px; border: 2px solid var(--surface); border-radius: 50%; background: var(--brand); box-shadow: 0 0 0 1px var(--brand); }
  input:focus-visible { outline: 2px solid var(--brand); outline-offset: 4px; }
  .ds-slider-scale { color: var(--ink-muted); font-family: var(--mono); font-size: 9px; letter-spacing: .08em; }
</style>
