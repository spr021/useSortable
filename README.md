# use-sortable

A small, typed React hook for sorting, filtering, and prioritizing bookmarked
records. It does not mutate the input array, works during server rendering, and
supports both simple tables and more advanced multi-rule data views.

## Installation

```sh
npm install use-sortable
```

React 16.8 or newer is required.

## Quick start

```tsx
import useSortable from 'use-sortable';

const data = [
  { id: 1, name: 'Borna', age: 30 },
  { id: 2, name: 'Ali', age: 20 },
];

function PeopleTable() {
  const {
    items,
    requestSort,
    requestSearch,
    toggleBookmark,
    getSortDirection,
  } = useSortable(data);

  return (
    <>
      <input
        aria-label="Search by name"
        onChange={(event) => requestSearch('name', event.target.value)}
      />
      <button type="button" onClick={() => requestSort('age')}>
        Age ({getSortDirection('age') ?? 'not sorted'})
      </button>
      <ul>
        {items.map((person) => (
          <li key={person.id}>
            {person.name}, {person.age}
            <button type="button" onClick={() => toggleBookmark(person.id)}>
              Bookmark
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
```

The processing order is filter, sort, then bookmark prioritization. Original
relative order is retained whenever two values compare equally.

## Sorting

`requestSort` replaces the active sort. Calling it without a direction toggles
between ascending and descending; an explicit direction is always respected.

```ts
requestSort('name');
requestSort('age', 'descending');
requestSort('name', 'ascending', (a, b) =>
  String(a).localeCompare(String(b)),
);
```

Use `requestMultiSort` to add or update rules without removing the others. Rules
are evaluated from first to last.

```ts
requestMultiSort('team', 'ascending');
requestMultiSort('score', 'descending');

setSorts([
  { key: 'team' },
  { key: 'score', direction: 'descending', nulls: 'last' },
]);
```

Default sorting supports strings with natural numeric ordering, numbers,
booleans, dates, `null`, and `undefined`. Nullish values are last by default in
both directions.

## Filtering

`requestSearch` replaces the active filters with one filter. String fields use a
case-insensitive substring match; other primitive fields use exact equality;
arrays match when they contain the search value; dates match by timestamp.

```ts
requestSearch('name', 'ali');
requestSearch('age', 20);
requestSearch('score', 80, (field, minimum) =>
  Number(field) >= Number(minimum),
);
```

An empty string, `null`, or `undefined` clears the legacy single search. Values
such as `0` and `false` remain valid filters.

Use `requestFilter` for multiple filters. The default mode requires all filters
to match; set `filterMode: 'any'` to accept any match.

```ts
const result = useSortable(data, { filterMode: 'all' });

result.requestFilter('team', 'engineering');
result.requestFilter('active', true);
result.clearSearch('team');
```

## Bookmarks

Bookmarked records are moved to the top without disturbing the current order
inside the bookmarked and unbookmarked groups. The default item identifier is
`item.id`.

```ts
const result = useSortable(data, {
  bookmarkKey: 'slug',
  storageKey: 'people-table-bookmarks',
  onBookmarksChange: (bookmarks) => console.log(bookmarks),
});

result.toggleBookmark('ali');
result.isBookmarked('ali');
result.clearBookmarks();
```

For derived identifiers, pass `getItemId: (item) => item.account.id`.

Bookmarks are stored in `localStorage` by default. Invalid or unavailable
storage is ignored safely, and changes from other browser tabs are synchronized.
Set `disableLocalStorage: true` to opt out. Use a unique `storageKey` when several
independent sortable views exist on the same origin.

## URL synchronization

The primary sort is synchronized with the `sort` and `d` query parameters. Other
query parameters and the URL hash are preserved. Initial URL state is applied
after mount so server-rendered output stays deterministic.

```ts
useSortable(data, {
  sortParam: 'orderBy',
  directionParam: 'order',
});
```

Set `disableUrlParams: true` to disable both reading and writing URL sort state.

## Configuration

All configuration properties are optional. They provide initial state unless
described as an ongoing behavior option.

| Property | Type | Purpose |
| --- | --- | --- |
| `sorts` | `SortDescriptor<T>[]` | Initial multi-column sort rules |
| `filters` | `FilterDescriptor<T>[]` | Initial filters |
| `filterMode` | `'all' \| 'any'` | How multiple filters are combined |
| `bookmarks` | `unknown[]` | Initial bookmark identifiers |
| `bookmarkKey` | `keyof T` | Identifier field; defaults to `id` |
| `getItemId` | `(item: T) => unknown` | Custom identifier resolver |
| `storageKey` | `string` | Bookmark persistence key; defaults to `book-mark` |
| `disableLocalStorage` | `boolean` | Disable bookmark persistence and hydration |
| `disableUrlParams` | `boolean` | Disable sort URL synchronization |
| `sortParam` | `string` | Primary sort query key; defaults to `sort` |
| `directionParam` | `string` | Direction query key; defaults to `d` |
| `onBookmarksChange` | `(ids) => void` | Called after user-driven bookmark changes |

The legacy initial properties `key`, `direction`, `search`, `value`, `bookMarks`,
`compareFn`, and `sortCompareFn` remain supported.

## Returned API

| Property | Purpose |
| --- | --- |
| `items` | Processed result array |
| `sorts`, `filters` | Current normalized rules |
| `bookmarks`, `bookMarks` | Current bookmark identifiers (`bookMarks` is the legacy alias) |
| `requestSort`, `requestMultiSort`, `setSorts`, `clearSort` | Manage sorting |
| `getSortDirection` | Read a column's active direction |
| `requestSearch`, `requestFilter`, `setFilters`, `clearSearch` | Manage filters |
| `toggleBookmark`, `requestBookMark`, `clearBookmarks`, `isBookmarked` | Manage bookmarks |
| `reset` | Restore the configuration's initial state |

## Pure helpers

The package also exports `sortItems`, `filterItems`, `prioritizeBookmarks`,
`processItems`, `normalizeSorts`, and `isEmptyFilterValue` for non-React use and
custom data pipelines.

```ts
import { processItems } from 'use-sortable';

const visibleRows = processItems(data, {
  filters: [{ key: 'active', value: true }],
  sorts: [{ key: 'name' }],
  bookmarks: [42],
});
```

## Development

Development requires Node 20.19+, Node 22.13+, or a newer supported release.

```sh
npm install
npm run typecheck
npm run lint
npm run coverage
npm run build
```

## Interactive showcase

Try the live [Sort Lab showcase](https://use-sortable-sort-lab.saber021.chatgpt.site),
or run the same application locally from this repository.

The standalone [Sort Lab example](./example) imports this repository through a
local package dependency and demonstrates combined search and filters,
single- and multi-column sorting, bookmark persistence, empty states, and reset
behavior with a realistic project table.

```sh
cd example
npm install
npm run dev
```

Run its interaction tests with `npm run showcase:test` from the repository root.

## License

MIT © [Saber Pourrahimi](https://github.com/spr021)
