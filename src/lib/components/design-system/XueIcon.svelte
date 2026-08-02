<script lang="ts">
  import { Icon } from '@lucide/svelte';
  import type { IconNode } from '@lucide/svelte';

  export type XueIconName =
    | 'archive'
    | 'archive-x'
    | 'arrow-left'
    | 'arrow-right'
    | 'arrow-up-right'
    | 'bookmark'
    | 'check'
    | 'chevron-down'
    | 'chevron-right'
    | 'circle-alert'
    | 'circle-check'
    | 'heart'
    | 'house'
    | 'info'
    | 'loader-circle'
    | 'minus'
    | 'plus'
    | 'search'
    | 'settings-2'
    | 'sparkles'
    | 'triangle-alert'
    | 'x'
    | 'zoom-in';

  interface Props {
    name: XueIconName;
    size?: number;
    strokeWidth?: number;
    fill?: string;
    class?: string;
    ariaHidden?: boolean;
  }

  let { name, size = 18, strokeWidth = 1.7, fill = 'none', class: className = '', ariaHidden = true }: Props = $props();

  const nodes: Record<XueIconName, IconNode> = {
    'archive': [['rect', { width: '20', height: '5', x: '2', y: '3', rx: '1' }], ['path', { d: 'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8' }], ['path', { d: 'M10 12h4' }]],
    'archive-x': [['rect', { width: '20', height: '5', x: '2', y: '3', rx: '1' }], ['path', { d: 'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8' }], ['path', { d: 'm9.5 17 5-5' }], ['path', { d: 'm9.5 12 5 5' }]],
    'arrow-left': [['path', { d: 'm12 19-7-7 7-7' }], ['path', { d: 'M19 12H5' }]],
    'arrow-right': [['path', { d: 'M5 12h14' }], ['path', { d: 'm12 5 7 7-7 7' }]],
    'arrow-up-right': [['path', { d: 'M7 7h10v10' }], ['path', { d: 'M7 17 17 7' }]],
    'bookmark': [['path', { d: 'M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z' }]],
    'check': [['path', { d: 'M20 6 9 17l-5-5' }]],
    'chevron-down': [['path', { d: 'm6 9 6 6 6-6' }]],
    'chevron-right': [['path', { d: 'm9 18 6-6-6-6' }]],
    'circle-alert': [['circle', { cx: '12', cy: '12', r: '10' }], ['line', { x1: '12', x2: '12', y1: '8', y2: '12' }], ['line', { x1: '12', x2: '12.01', y1: '16', y2: '16' }]],
    'circle-check': [['circle', { cx: '12', cy: '12', r: '10' }], ['path', { d: 'm9 12 2 2 4-4' }]],
    'heart': [['path', { d: 'M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5' }]],
    'house': [['path', { d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' }], ['path', { d: 'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }]],
    'info': [['circle', { cx: '12', cy: '12', r: '10' }], ['path', { d: 'M12 16v-4' }], ['path', { d: 'M12 8h.01' }]],
    'loader-circle': [['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }]],
    'minus': [['path', { d: 'M5 12h14' }]],
    'plus': [['path', { d: 'M5 12h14' }], ['path', { d: 'M12 5v14' }]],
    'search': [['path', { d: 'm21 21-4.34-4.34' }], ['circle', { cx: '11', cy: '11', r: '8' }]],
    'settings-2': [['path', { d: 'M14 17H5' }], ['path', { d: 'M19 7h-9' }], ['circle', { cx: '17', cy: '17', r: '3' }], ['circle', { cx: '7', cy: '7', r: '3' }]],
    'sparkles': [['path', { d: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z' }], ['path', { d: 'M20 2v4' }], ['path', { d: 'M22 4h-4' }], ['circle', { cx: '4', cy: '20', r: '2' }]],
    'triangle-alert': [['path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' }], ['path', { d: 'M12 9v4' }], ['path', { d: 'M12 17h.01' }]],
    'x': [['path', { d: 'M18 6 6 18' }], ['path', { d: 'm6 6 12 12' }]],
    'zoom-in': [['circle', { cx: '11', cy: '11', r: '8' }], ['line', { x1: '21', x2: '16.65', y1: '21', y2: '16.65' }], ['line', { x1: '11', x2: '11', y1: '8', y2: '14' }], ['line', { x1: '8', x2: '14', y1: '11', y2: '11' }]]
  };
</script>

<Icon {size} {strokeWidth} {fill} class={className} aria-hidden={ariaHidden ? 'true' : undefined} iconNode={nodes[name]} />
