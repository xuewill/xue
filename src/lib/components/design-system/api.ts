/**
 * The prop reference rendered on /design-system.
 *
 * Kept here rather than inline in the page so the catalogue has one source of
 * truth, and guarded by tests/unit/design-system.test.ts, which parses every
 * `interface Props` and fails if the documented names drift from the source.
 * Types and defaults are prose; the test enforces the prop *names*.
 */

export interface PropDoc {
  name: string;
  type: string;
  /** Omitted for required props. */
  default?: string;
  /** True when the component declares it with $bindable(). */
  bindable?: boolean;
}

export interface ComponentDoc {
  name: string;
  summary: string;
  props: PropDoc[];
}

export const componentApi: ComponentDoc[] = [
  {
    name: 'WeBaseAccordion',
    summary: 'Single-open disclosure with roving arrow-key focus.',
    props: [
      { name: 'items', type: 'Item[]' },
      { name: 'open', type: 'number', default: '0', bindable: true },
      { name: 'id', type: 'string', default: 'auto' }
    ]
  },
  {
    name: 'WeBaseAlert',
    summary: 'Inline status message; error tone announces assertively.',
    props: [
      { name: 'title', type: 'string' },
      { name: 'message', type: 'string', default: "''" },
      { name: 'tone', type: "'info' | 'success' | 'warning' | 'error'", default: "'info'" },
      { name: 'dismissible', type: 'boolean', default: 'false' },
      { name: 'open', type: 'boolean', default: 'true', bindable: true },
      { name: 'children', type: 'Snippet' },
      { name: 'actions', type: 'Snippet' }
    ]
  },
  {
    name: 'WeBaseBadge',
    summary: 'Catalogue label. Uses variant, not tone — these are taxonomy, not status.',
    props: [
      { name: 'label', type: 'string' },
      { name: 'variant', type: "'canonical' | 'one-off' | 'experiment'", default: "'canonical'" },
      { name: 'dot', type: 'boolean', default: 'false' }
    ]
  },
  {
    name: 'WeBaseBreadcrumbs',
    summary: 'Location trail; the final item renders as current, not a link.',
    props: [{ name: 'items', type: 'Item[]' }]
  },
  {
    name: 'WeBaseButton',
    summary: 'Primary action control with loading and icon support.',
    props: [
      { name: 'label', type: 'string' },
      { name: 'variant', type: "'ink' | 'outline' | 'quiet' | 'text'", default: "'outline'" },
      { name: 'size', type: "'sm' | 'md'", default: "'md'" },
      { name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'" },
      { name: 'disabled', type: 'boolean', default: 'false' },
      { name: 'loading', type: 'boolean', default: 'false' },
      { name: 'icon', type: 'WeBaseIconName' },
      { name: 'full', type: 'boolean', default: 'false' },
      { name: 'onclick', type: '(event: MouseEvent) => void' }
    ]
  },
  {
    name: 'WeBaseCard',
    summary: 'Editorial surface. The ink variant inverts and steps forward.',
    props: [
      { name: 'eyebrow', type: 'string', default: "'Specimen'" },
      { name: 'title', type: 'string' },
      { name: 'body', type: 'string', default: "''" },
      { name: 'variant', type: "'paper' | 'ink' | 'outline'", default: "'paper'" },
      { name: 'meta', type: 'string', default: "''" },
      { name: 'action', type: 'string', default: "''" },
      { name: 'children', type: 'Snippet' },
      { name: 'footer', type: 'Snippet' }
    ]
  },
  {
    name: 'WeBaseCheck',
    summary: 'Checkbox with optional description and indeterminate state.',
    props: [
      { name: 'label', type: 'string' },
      { name: 'checked', type: 'boolean', default: 'false', bindable: true },
      { name: 'disabled', type: 'boolean', default: 'false' },
      { name: 'indeterminate', type: 'boolean', default: 'false' },
      { name: 'description', type: 'string', default: "''" }
    ]
  },
  {
    name: 'WeBaseDialog',
    summary: 'Modal with focus trap, scroll lock, and focus restoration.',
    props: [
      { name: 'open', type: 'boolean', default: 'false', bindable: true },
      { name: 'title', type: 'string', default: "'A quiet confirmation'" },
      { name: 'message', type: 'string', default: "'Dialogs keep…'" },
      { name: 'id', type: 'string', default: 'auto' },
      { name: 'confirmLabel', type: 'string', default: "'Confirm'" }
    ]
  },
  {
    name: 'WeBaseDivider',
    summary: 'Dot rule, optionally captioned; also runs vertically.',
    props: [
      { name: 'label', type: 'string', default: "''" },
      { name: 'vertical', type: 'boolean', default: 'false' }
    ]
  },
  {
    name: 'WeBaseEmptyState',
    summary: 'Empty drawer with one recovery action.',
    props: [
      { name: 'title', type: 'string', default: "'No notes in this drawer'" },
      { name: 'message', type: 'string', default: "'Start a new note…'" },
      { name: 'actionLabel', type: 'string', default: "'Create note'" },
      { name: 'onclick', type: '(event: MouseEvent) => void' },
      { name: 'children', type: 'Snippet' },
      { name: 'actions', type: 'Snippet' }
    ]
  },
  {
    name: 'WeBaseField',
    summary: 'Single-line input wiring label, help, and error into aria-describedby.',
    props: [
      { name: 'label', type: 'string' },
      { name: 'id', type: 'string', default: 'auto' },
      { name: 'placeholder', type: 'string', default: "''" },
      { name: 'help', type: 'string', default: "''" },
      { name: 'error', type: 'string', default: "''" },
      { name: 'type', type: "'text' | 'email' | 'search'", default: "'text'" },
      { name: 'value', type: 'string', default: "''", bindable: true },
      { name: 'required', type: 'boolean', default: 'false' },
      { name: 'disabled', type: 'boolean', default: 'false' }
    ]
  },
  {
    name: 'WeBaseIcon',
    summary: 'Renders one of 23 inlined Lucide glyphs. Decorative by default.',
    props: [
      { name: 'name', type: 'WeBaseIconName' },
      { name: 'size', type: 'number', default: '18' },
      { name: 'strokeWidth', type: 'number', default: '1.7' },
      { name: 'fill', type: 'string', default: "'none'" },
      { name: 'class', type: 'string', default: "''" },
      { name: 'ariaHidden', type: 'boolean', default: 'true' }
    ]
  },
  {
    name: 'WeBaseIconButton',
    summary: 'Round toggle. Accepts any icon name; fill reads on closed shapes.',
    props: [
      { name: 'label', type: 'string' },
      { name: 'icon', type: 'WeBaseIconName', default: "'arrow-up-right'" },
      { name: 'pressed', type: 'boolean', default: 'false', bindable: true },
      { name: 'disabled', type: 'boolean', default: 'false' },
      { name: 'onclick', type: '(event: MouseEvent) => void' }
    ]
  },
  {
    name: 'WeBaseLoader',
    summary: 'Riffling page indicator for indeterminate waits.',
    props: [{ name: 'label', type: 'string', default: "'Loading'" }]
  },
  {
    name: 'WeBaseLink',
    summary: 'Semantic text navigation for inline, back, nav, and action contexts.',
    props: [
      { name: 'href', type: 'string' },
      { name: 'label', type: 'string', default: "''" },
      { name: 'variant', type: "'inline' | 'back' | 'nav' | 'action'", default: "'inline'" },
      { name: 'icon', type: 'WeBaseIconName' },
      { name: 'iconPosition', type: "'start' | 'end'", default: 'variant default' },
      { name: 'children', type: 'Snippet' }
    ]
  },
  {
    name: 'WeBasePagination',
    summary: 'Numbered pager that clamps at both ends.',
    props: [
      { name: 'total', type: 'number', default: '5' },
      { name: 'page', type: 'number', default: '1', bindable: true },
      { name: 'label', type: 'string', default: "'Pagination'" }
    ]
  },
  {
    name: 'WeBaseProgress',
    summary: 'Determinate progress with a semantic tone.',
    props: [
      { name: 'value', type: 'number', default: '62' },
      { name: 'label', type: 'string', default: "'Progress'" },
      { name: 'tone', type: "'brand' | 'success' | 'warning' | 'error'", default: "'brand'" },
      { name: 'compact', type: 'boolean', default: 'false' }
    ]
  },
  {
    name: 'WeBaseRadio',
    summary: 'Single choice within a named group.',
    props: [
      { name: 'name', type: 'string' },
      { name: 'label', type: 'string' },
      { name: 'value', type: 'string' },
      { name: 'selected', type: 'string', default: "''", bindable: true },
      { name: 'disabled', type: 'boolean', default: 'false' },
      { name: 'description', type: 'string', default: "''" }
    ]
  },
  {
    name: 'WeBaseSectionHeader',
    summary: 'Kicker, title, and optional note that opens a catalogue section.',
    props: [
      { name: 'kicker', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'note', type: 'string', default: "''" },
      { name: 'headingId', type: 'string' }
    ]
  },
  {
    name: 'WeBaseSelect',
    summary: 'Listbox with typeahead, arrow keys, and Home/End.',
    props: [
      { name: 'label', type: 'string' },
      { name: 'id', type: 'string', default: 'auto' },
      { name: 'options', type: 'Option[]' },
      { name: 'value', type: 'string', default: 'first option', bindable: true },
      { name: 'help', type: 'string', default: "''" },
      { name: 'error', type: 'string', default: "''" },
      { name: 'disabled', type: 'boolean', default: 'false' }
    ]
  },
  {
    name: 'WeBaseSkeleton',
    summary: 'Loading placeholder announced as busy.',
    props: [
      { name: 'rows', type: 'number', default: '3' },
      { name: 'media', type: 'boolean', default: 'true' },
      { name: 'label', type: 'string', default: "'Loading content'" }
    ]
  },
  {
    name: 'WeBaseSlider',
    summary: 'Range input with a printed value readout.',
    props: [
      { name: 'label', type: 'string' },
      { name: 'value', type: 'number', default: '48', bindable: true },
      { name: 'min', type: 'number', default: '0' },
      { name: 'max', type: 'number', default: '100' },
      { name: 'step', type: 'number', default: '1' },
      { name: 'unit', type: 'string', default: "'%'" },
      { name: 'id', type: 'string', default: 'auto' }
    ]
  },
  {
    name: 'WeBaseSwitch',
    summary: 'Binary setting that takes effect immediately.',
    props: [
      { name: 'label', type: 'string' },
      { name: 'checked', type: 'boolean', default: 'false', bindable: true },
      { name: 'disabled', type: 'boolean', default: 'false' },
      { name: 'description', type: 'string', default: "''" }
    ]
  },
  {
    name: 'WeBaseTag',
    summary: 'Compact taxonomy label that can remain static or navigate to a filtered view.',
    props: [
      { name: 'label', type: 'string' },
      { name: 'href', type: 'string' },
      { name: 'variant', type: "'neutral' | 'brand' | 'outline'", default: "'neutral'" },
      { name: 'count', type: 'number | string' },
      { name: 'selected', type: 'boolean', default: 'false' }
    ]
  },
  {
    name: 'WeBaseTabs',
    summary: 'Tablist with roving focus; every panel stays mounted.',
    props: [
      { name: 'items', type: 'string[]' },
      { name: 'active', type: 'number', default: '0', bindable: true },
      { name: 'panels', type: 'string[]', default: '[]' },
      { name: 'label', type: 'string', default: "'Example tabs'" },
      { name: 'id', type: 'string', default: 'auto' }
    ]
  },
  {
    name: 'WeBaseTextarea',
    summary: 'Multi-line input with a live character counter.',
    props: [
      { name: 'label', type: 'string' },
      { name: 'id', type: 'string', default: 'auto' },
      { name: 'placeholder', type: 'string', default: "''" },
      { name: 'value', type: 'string', default: "''", bindable: true },
      { name: 'help', type: 'string', default: "''" },
      { name: 'maxLength', type: 'number', default: '240' },
      { name: 'error', type: 'string', default: "''" }
    ]
  },
  {
    name: 'WeBaseToast',
    summary: 'Transient confirmation from a permanently mounted live region.',
    props: [
      { name: 'open', type: 'boolean', default: 'false', bindable: true },
      { name: 'title', type: 'string', default: "'Saved locally'" },
      { name: 'message', type: 'string', default: "'The specimen is ready…'" },
      { name: 'tone', type: "'success' | 'info' | 'error'", default: "'success'" },
      { name: 'duration', type: 'number', default: '0' }
    ]
  },
  {
    name: 'WeBaseTooltip',
    summary: 'Hover and focus hint; Escape dismisses without moving focus.',
    props: [
      { name: 'label', type: 'string' },
      { name: 'text', type: 'string' },
      { name: 'id', type: 'string', default: 'auto' }
    ]
  }
];
