'use client';

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Bookmark,
  BookmarkCheck,
  Braces,
  ExternalLink,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import useSortable, { type SortDirection } from 'use-sortable';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DocsSection } from './docs-section';

type Status = 'Active' | 'Planning' | 'Paused';

interface Project {
  id: number;
  name: string;
  category: 'Product' | 'Research' | 'Platform';
  status: Status;
  owner: string;
  score: number;
  updated: string;
}

const projects: Project[] = [
  { id: 101, name: 'Atlas search', category: 'Product', status: 'Active', owner: 'Mina Chen', score: 94, updated: 'Aug 28' },
  { id: 102, name: 'Relay insights', category: 'Research', status: 'Planning', owner: 'Jon Bell', score: 88, updated: 'Aug 26' },
  { id: 103, name: 'Canvas mobile', category: 'Product', status: 'Active', owner: 'Alba Ruiz', score: 91, updated: 'Aug 25' },
  { id: 104, name: 'Vector pipeline', category: 'Platform', status: 'Paused', owner: 'Noah Kim', score: 72, updated: 'Aug 21' },
  { id: 105, name: 'Signal studio', category: 'Research', status: 'Active', owner: 'Mae Okafor', score: 86, updated: 'Aug 19' },
  { id: 106, name: 'Harbor access', category: 'Platform', status: 'Planning', owner: 'Iris Wang', score: 79, updated: 'Aug 17' },
  { id: 107, name: 'Orbit billing', category: 'Product', status: 'Paused', owner: 'Leo Hart', score: 68, updated: 'Aug 14' },
  { id: 108, name: 'Prism metrics', category: 'Platform', status: 'Active', owner: 'Sana Patel', score: 97, updated: 'Aug 11' },
  { id: 109, name: 'Field notes', category: 'Research', status: 'Planning', owner: 'Owen Fox', score: 82, updated: 'Aug 08' },
  { id: 110, name: 'Northstar AI', category: 'Product', status: 'Active', owner: 'Lina Park', score: 93, updated: 'Aug 03' },
];

const statusRank: Record<Status, number> = {
  Active: 0,
  Planning: 1,
  Paused: 2,
};

const statusStyles: Record<Status, string> = {
  Active: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  Planning: 'border-amber-200 bg-amber-50 text-amber-800',
  Paused: 'border-stone-200 bg-stone-100 text-stone-600',
};

function DirectionIcon({ direction }: { direction?: SortDirection }) {
  if (direction === 'ascending') return <ArrowUp aria-hidden="true" />;
  if (direction === 'descending') return <ArrowDown aria-hidden="true" />;
  return <ArrowUpDown aria-hidden="true" />;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [minimumScore, setMinimumScore] = useState('');

  const {
    items,
    sorts,
    filters,
    bookmarks,
    requestSearch,
    requestFilter,
    requestSort,
    setSorts,
    toggleBookmark,
    isBookmarked,
    clearBookmarks,
    getSortDirection,
    reset,
  } = useSortable(projects, {
    storageKey: 'use-sortable-showcase-bookmarks',
  });

  const averageScore = useMemo(
    () =>
      items.length === 0
        ? 0
        : Math.round(
            items.reduce((total, project) => total + project.score, 0) /
              items.length,
          ),
    [items],
  );

  const updateSearch = (value: string) => {
    setQuery(value);
    requestSearch('name', value, (_field, searchValue, project) => {
      const needle = String(searchValue).toLocaleLowerCase();
      return [project.name, project.owner, project.category, project.status].some(
        (field) => field.toLocaleLowerCase().includes(needle),
      );
    });
  };

  const updateStatus = (value: string) => {
    setStatus(value);
    requestFilter('status', value);
  };

  const updateCategory = (value: string) => {
    setCategory(value);
    requestFilter('category', value);
  };

  const updateMinimumScore = (value: string) => {
    setMinimumScore(value);
    requestFilter(
      'score',
      value,
      (field, threshold) => Number(field) >= Number(threshold),
    );
  };

  const applyPriorityView = () => {
    setSorts([
      {
        key: 'status',
        direction: 'ascending',
        compareFn: (left, right) =>
          statusRank[left as Status] - statusRank[right as Status],
      },
      { key: 'score', direction: 'descending' },
    ]);
  };

  const resetView = () => {
    setQuery('');
    setStatus('');
    setCategory('');
    setMinimumScore('');
    reset();
  };

  const sortLabel =
    sorts.length === 0
      ? 'Original order'
      : sorts
          .map(
            (sort) =>
              `${String(sort.key)} ${sort.direction === 'ascending' ? '↑' : '↓'}`,
          )
          .join(' · ');
  const nameSortDirection = getSortDirection('name');
  const scoreSortDirection = getSortDirection('score');

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/10 bg-[#10281f] text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[#c8f56a] text-[#10281f] shadow-[0_0_0_1px_rgb(255_255_255/18%)]">
              <Braces className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">use-sortable</p>
              <p className="text-xs text-white/55">Interactive library showcase</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav aria-label="Primary navigation" className="hidden items-center gap-1 sm:flex">
              <a className="rounded-lg px-3 py-2 text-xs font-medium text-white/65 transition hover:bg-white/8 hover:text-white" href="#playground">
                Playground
              </a>
              <a className="rounded-lg px-3 py-2 text-xs font-medium text-white/65 transition hover:bg-white/8 hover:text-white" href="#docs">
                Documentation
              </a>
            </nav>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-white/80 transition hover:border-white/30 hover:bg-white/8 hover:text-white"
              href="https://github.com/spr021/useSortable"
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              View source
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
        <section className="mb-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="size-4" aria-hidden="true" />
              Sort lab
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
              Shape your data, without the boilerplate.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Search, combine filters, sort multiple fields, and pin important
              records. Every control below is powered by the published hook API.
            </p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border bg-card shadow-sm">
            <div className="px-4 py-3.5 sm:px-5">
              <p className="text-2xl font-semibold tracking-tight">{items.length}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Showing</p>
            </div>
            <div className="px-4 py-3.5 sm:px-5">
              <p className="text-2xl font-semibold tracking-tight">{averageScore}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Avg. score</p>
            </div>
            <div className="px-4 py-3.5 sm:px-5">
              <p className="text-2xl font-semibold tracking-tight">{bookmarks.length}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Pinned</p>
            </div>
          </div>
        </section>

        <section className="scroll-mt-6 overflow-hidden rounded-3xl border bg-card shadow-[0_20px_60px_rgb(24_47_36/8%)]" id="playground">
          <div className="border-b bg-[#fbfcf7] p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.4fr)_repeat(3,minmax(145px,.65fr))_auto]">
              <label className="relative block">
                <span className="sr-only">Search projects</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  className="h-10 bg-white pl-9 pr-9"
                  onChange={(event) => updateSearch(event.target.value)}
                  placeholder="Search projects, owners…"
                  value={query}
                />
                {query ? (
                  <button
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => updateSearch('')}
                    type="button"
                  >
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                ) : null}
              </label>

              <label>
                <span className="sr-only">Filter by status</span>
                <select className="filter-select" onChange={(event) => updateStatus(event.target.value)} value={status}>
                  <option value="">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Planning">Planning</option>
                  <option value="Paused">Paused</option>
                </select>
              </label>

              <label>
                <span className="sr-only">Filter by category</span>
                <select className="filter-select" onChange={(event) => updateCategory(event.target.value)} value={category}>
                  <option value="">All categories</option>
                  <option value="Product">Product</option>
                  <option value="Research">Research</option>
                  <option value="Platform">Platform</option>
                </select>
              </label>

              <label>
                <span className="sr-only">Filter by minimum score</span>
                <select className="filter-select" onChange={(event) => updateMinimumScore(event.target.value)} value={minimumScore}>
                  <option value="">Any score</option>
                  <option value="70">Score 70+</option>
                  <option value="80">Score 80+</option>
                  <option value="90">Score 90+</option>
                </select>
              </label>

              <div className="flex gap-2">
                <Button className="h-10 flex-1 bg-[#d8fa91] px-3 text-[#173023] hover:bg-[#c8f56a] xl:flex-none" onClick={applyPriorityView} variant="secondary">
                  <Sparkles aria-hidden="true" />
                  Priority
                </Button>
                <Button aria-label="Reset view" className="size-10" onClick={resetView} size="icon" variant="outline">
                  <RotateCcw aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                <span className="rounded-md border bg-white px-2 py-1 font-mono text-[11px] text-foreground">sort: {sortLabel}</span>
                <span>{filters.length} active {filters.length === 1 ? 'filter' : 'filters'}</span>
              </div>
              {bookmarks.length > 0 ? (
                <button className="font-medium text-primary hover:underline" onClick={clearBookmarks} type="button">
                  Clear {bookmarks.length} pinned
                </button>
              ) : null}
            </div>
          </div>

          <Table aria-label="Project results">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 pl-5"><span className="sr-only">Bookmark</span></TableHead>
                <TableHead aria-sort={nameSortDirection ?? 'none'}>
                  <button className="sort-button" onClick={() => requestSort('name')} type="button">
                    Project <DirectionIcon direction={nameSortDirection} />
                  </button>
                </TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead aria-sort={scoreSortDirection ?? 'none'}>
                  <button className="sort-button" onClick={() => requestSort('score')} type="button">
                    Score <DirectionIcon direction={scoreSortDirection} />
                  </button>
                </TableHead>
                <TableHead className="pr-5 text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((project) => {
                const bookmarked = isBookmarked(project.id);
                return (
                  <TableRow className={bookmarked ? 'bg-[#f7ffe9] hover:bg-[#f1fbdc]' : ''} key={project.id}>
                    <TableCell className="pl-5">
                      <button
                        aria-label={`${bookmarked ? 'Unpin' : 'Pin'} ${project.name}`}
                        aria-pressed={bookmarked}
                        className="bookmark-button"
                        onClick={() => toggleBookmark(project.id)}
                        type="button"
                      >
                        {bookmarked ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{project.name}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">#{project.id}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{project.owner}</TableCell>
                    <TableCell><Badge className={statusStyles[project.status]} variant="outline">{project.status}</Badge></TableCell>
                    <TableCell><span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{project.category}</span></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="w-7 font-semibold tabular-nums">{project.score}</span>
                        <span className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-muted sm:block">
                          <span className="block h-full rounded-full bg-primary" style={{ width: `${project.score}%` }} />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-5 text-right text-muted-foreground">{project.updated}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {items.length === 0 ? (
            <div className="grid min-h-64 place-items-center border-t px-6 text-center">
              <div>
                <Search className="mx-auto mb-3 size-7 text-muted-foreground" aria-hidden="true" />
                <h2 className="font-semibold">No projects match this view</h2>
                <p className="mt-1 text-sm text-muted-foreground">Try a broader search or reset the filters.</p>
                <Button className="mt-4" onClick={resetView} variant="outline">Reset filters</Button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-2xl border bg-[#10281f] p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#c8f56a]">One hook, composed state</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">The table stays declarative.</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">The source array never changes. Filters run first, sort rules run next, and pinned records are promoted last.</p>
          </div>
          <pre className="overflow-x-auto rounded-2xl border bg-[#f8f6ef] p-6 font-mono text-[12px] leading-6 text-[#284234] shadow-sm"><code>{`const { items, requestSort, requestFilter } = useSortable(data)

requestFilter('status', 'Active')
requestSort('score', 'descending')`}</code></pre>
        </section>

        <DocsSection />
      </div>
    </main>
  );
}
