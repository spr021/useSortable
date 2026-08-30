'use client';

import {
  ArrowRight,
  Check,
  Clipboard,
  Code2,
  Filter,
  Layers3,
  PackageCheck,
  Pin,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const quickStart = `import useSortable from 'use-sortable'

const { items, requestSort, requestSearch } = useSortable(data)

requestSearch('name', 'atlas')
requestSort('score', 'descending')`;

const multiSortExample = `setSorts([
  { key: 'status', direction: 'ascending' },
  { key: 'score', direction: 'descending', nulls: 'last' },
])`;

const filterExample = `requestFilter('status', 'Active')
requestFilter('score', 80, (score, minimum) =>
  Number(score) >= Number(minimum)
)`;

const bookmarkExample = `const result = useSortable(data, {
  bookmarkKey: 'id',
  storageKey: 'project-bookmarks',
})

result.toggleBookmark(project.id)`;

const pureHelperExample = `import { processItems } from 'use-sortable'

const visible = processItems(data, {
  filters: [{ key: 'active', value: true }],
  sorts: [{ key: 'name' }],
  bookmarks: [42],
})`;

const apiRows = [
  ['items', 'The processed result array after filters, sorting, and bookmarks.'],
  ['requestSort', 'Replace the current sort and toggle its direction when omitted.'],
  ['requestMultiSort', 'Add or update one rule without removing the other sort rules.'],
  ['requestFilter', 'Add or update a filter; several filters can run together.'],
  ['requestSearch', 'Replace active filters with one backward-compatible search.'],
  ['toggleBookmark', 'Pin or unpin a record using its configured identifier.'],
  ['setSorts / setFilters', 'Replace the complete sort or filter rule collection.'],
  ['reset', 'Restore the initial configuration supplied to the hook.'],
] as const;

const configRows = [
  ['filterMode', "Combine filters with 'all' (default) or 'any'."],
  ['bookmarkKey', "Identifier property used for bookmarks; defaults to 'id'."],
  ['getItemId', 'Resolve an identifier from nested or derived record data.'],
  ['storageKey', 'Use an independent localStorage key for each sortable view.'],
  ['disableLocalStorage', 'Keep bookmarks in memory without browser persistence.'],
  ['disableUrlParams', 'Disable reading and writing the primary sort in the URL.'],
] as const;

function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#10281f] text-white shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/45">
          {label}
        </span>
        <Button
          aria-label={`Copy ${label}`}
          className="h-7 gap-1.5 border-white/10 bg-white/5 px-2 text-[11px] text-white/65 hover:bg-white/10 hover:text-white"
          onClick={copyCode}
          size="sm"
          type="button"
          variant="outline"
        >
          {copied ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-6 text-[#e9f8d0]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function DocsSection() {
  return (
    <section className="mt-16 scroll-mt-20 border-t pt-12 sm:mt-20 sm:pt-16" id="docs">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
        <div>
          <Badge className="mb-4 border-[#b9dc70] bg-[#efffd0] text-[#31563f]" variant="outline">
            <Code2 aria-hidden="true" />
            Documentation
          </Badge>
          <h2 className="max-w-3xl text-3xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            From raw array to useful view in minutes.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            A practical guide to the hook, its composable rule API, bookmark persistence,
            and the pure processing helpers available outside React.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-2xl border bg-card p-4 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Package</p>
            <p className="mt-1 font-mono text-sm font-semibold">use-sortable</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Requires</p>
            <p className="mt-1 font-mono text-sm font-semibold">React 16.8+</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)]">
        <nav aria-label="Documentation sections" className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            On this page
          </p>
          <div className="grid grid-cols-2 gap-1 text-sm sm:grid-cols-3 lg:grid-cols-1">
            {[
              ['#install', 'Install'],
              ['#quick-start', 'Quick start'],
              ['#workflows', 'Core workflows'],
              ['#api', 'Returned API'],
              ['#configuration', 'Configuration'],
              ['#pure-helpers', 'Pure helpers'],
            ].map(([href, label]) => (
              <a
                className="rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                href={href}
                key={href}
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        <div className="min-w-0 space-y-8">
          <section className="scroll-mt-8 rounded-3xl border bg-card p-5 shadow-sm sm:p-7" id="install">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#e8f9c4] text-primary">
                <PackageCheck aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Step 01</p>
                <h3 className="text-xl font-semibold tracking-tight">Install the package</h3>
              </div>
            </div>
            <CodeBlock code="npm install use-sortable" label="Terminal" />
          </section>

          <section className="scroll-mt-8 rounded-3xl border bg-card p-5 shadow-sm sm:p-7" id="quick-start">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Step 02</p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight">Create a sortable view</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Pass a readonly array to the hook. Render <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">items</code>
                {' '}and call the request functions from your controls.
              </p>
            </div>
            <CodeBlock code={quickStart} label="React / TypeScript" />
          </section>

          <section className="scroll-mt-8" id="workflows">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Recipes</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight">Core workflows</h3>
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              <article className="rounded-2xl border bg-card p-5 shadow-sm">
                <Layers3 aria-hidden="true" className="size-5 text-primary" />
                <h4 className="mt-4 font-semibold">Multi-sort</h4>
                <p className="mt-1 min-h-12 text-sm leading-6 text-muted-foreground">
                  Evaluate rules from first to last with stable ordering.
                </p>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-muted p-3 font-mono text-[11px] leading-5"><code>{multiSortExample}</code></pre>
              </article>
              <article className="rounded-2xl border bg-card p-5 shadow-sm">
                <Filter aria-hidden="true" className="size-5 text-primary" />
                <h4 className="mt-4 font-semibold">Combined filters</h4>
                <p className="mt-1 min-h-12 text-sm leading-6 text-muted-foreground">
                  Combine exact values and custom predicates in one view.
                </p>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-muted p-3 font-mono text-[11px] leading-5"><code>{filterExample}</code></pre>
              </article>
              <article className="rounded-2xl border bg-card p-5 shadow-sm">
                <Pin aria-hidden="true" className="size-5 text-primary" />
                <h4 className="mt-4 font-semibold">Persistent pins</h4>
                <p className="mt-1 min-h-12 text-sm leading-6 text-muted-foreground">
                  Promote important records and keep them across sessions.
                </p>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-muted p-3 font-mono text-[11px] leading-5"><code>{bookmarkExample}</code></pre>
              </article>
            </div>
          </section>

          <section className="scroll-mt-8 overflow-hidden rounded-3xl border bg-card shadow-sm" id="api">
            <div className="border-b p-5 sm:p-7">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Reference</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight">Returned API</h3>
            </div>
            <Table aria-label="Returned API reference">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[190px] pl-5 sm:pl-7">Member</TableHead>
                  <TableHead className="pr-5 sm:pr-7">Purpose</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiRows.map(([member, purpose]) => (
                  <TableRow key={member}>
                    <TableCell className="pl-5 font-mono text-xs font-semibold text-primary sm:pl-7">{member}</TableCell>
                    <TableCell className="pr-5 text-sm leading-6 text-muted-foreground sm:pr-7">{purpose}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <section className="scroll-mt-8 overflow-hidden rounded-3xl border bg-card shadow-sm" id="configuration">
            <div className="border-b p-5 sm:p-7">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Options</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight">Configuration</h3>
            </div>
            <Table aria-label="Configuration reference">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[190px] pl-5 sm:pl-7">Property</TableHead>
                  <TableHead className="pr-5 sm:pr-7">Behavior</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configRows.map(([property, behavior]) => (
                  <TableRow key={property}>
                    <TableCell className="pl-5 font-mono text-xs font-semibold text-primary sm:pl-7">{property}</TableCell>
                    <TableCell className="pr-5 text-sm leading-6 text-muted-foreground sm:pr-7">{behavior}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <section className="scroll-mt-8 rounded-3xl border bg-[#f1f8e5] p-5 shadow-sm sm:p-7" id="pure-helpers">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Without React</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight">Use the pure helpers</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Run the same immutable pipeline in selectors, server code, tests, or custom state managers.
                </p>
              </div>
              <a
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                href="https://github.com/spr021/useSortable#pure-helpers"
                rel="noreferrer"
                target="_blank"
              >
                Full README <ArrowRight aria-hidden="true" className="size-4" />
              </a>
            </div>
            <CodeBlock code={pureHelperExample} label="TypeScript" />
          </section>
        </div>
      </div>
    </section>
  );
}
