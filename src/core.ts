import {
  FilterDescriptor,
  FilterMode,
  ProcessOptions,
  SortDescriptor,
  SortDirection,
} from './types';

export type NormalizedSortDescriptor<T> = Required<
  Pick<SortDescriptor<T>, 'key' | 'direction'>
> &
  Omit<SortDescriptor<T>, 'key' | 'direction'>;

export const isEmptyFilterValue = (value: unknown): boolean =>
  value === '' || value === null || value === undefined;

export const normalizeSorts = <T>(
  sorts: ReadonlyArray<SortDescriptor<T>>,
): Array<NormalizedSortDescriptor<T>> =>
  sorts.map((sort) => ({ ...sort, direction: sort.direction || 'ascending' }));

const defaultCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

const compareValues = (a: unknown, b: unknown): number => {
  if (Object.is(a, b)) return 0;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a)) return 1;
    if (Number.isNaN(b)) return -1;
    return a - b;
  }

  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return Number(a) - Number(b);
  }

  return defaultCollator.compare(String(a), String(b));
};

const compareWithNulls = (
  a: unknown,
  b: unknown,
  direction: SortDirection,
  nulls: 'first' | 'last',
  compare: () => number,
): number => {
  const aIsNull = a === null || a === undefined;
  const bIsNull = b === null || b === undefined;

  if (aIsNull || bIsNull) {
    if (aIsNull && bIsNull) return 0;
    return aIsNull === (nulls === 'first') ? -1 : 1;
  }

  const result = compare();
  return direction === 'ascending' ? result : -result;
};

export const sortItems = <T>(
  items: ReadonlyArray<T>,
  sorts: ReadonlyArray<SortDescriptor<T>>,
): T[] => {
  if (sorts.length === 0) return items.slice();

  return items
    .map((item, index) => ({ item, index }))
    .sort((aEntry, bEntry) => {
      for (const sort of sorts) {
        const aValue = aEntry.item[sort.key];
        const bValue = bEntry.item[sort.key];
        const result = compareWithNulls(
          aValue,
          bValue,
          sort.direction || 'ascending',
          sort.nulls || 'last',
          () =>
            sort.compareFn
              ? sort.compareFn(aValue, bValue, aEntry.item, bEntry.item)
              : compareValues(aValue, bValue),
        );
        if (result !== 0) return result;
      }
      return aEntry.index - bEntry.index;
    })
    .map(({ item }) => item);
};

const defaultFilter = (field: unknown, searchValue: unknown): boolean => {
  if (typeof field === 'string') {
    return field.toLocaleLowerCase().includes(String(searchValue).toLocaleLowerCase());
  }

  if (Array.isArray(field)) {
    return field.some((value) => Object.is(value, searchValue));
  }

  if (field instanceof Date) {
    const searchDate =
      searchValue instanceof Date ? searchValue : new Date(String(searchValue));
    return !Number.isNaN(searchDate.getTime()) && field.getTime() === searchDate.getTime();
  }

  return Object.is(field, searchValue);
};

export const filterItems = <T>(
  items: ReadonlyArray<T>,
  filters: ReadonlyArray<FilterDescriptor<T>>,
  mode: FilterMode = 'all',
): T[] => {
  const activeFilters = filters.filter(
    (filter) => !isEmptyFilterValue(filter.value),
  );
  if (activeFilters.length === 0) return items.slice();

  return items.filter((item) => {
    const matches = (filter: FilterDescriptor<T>): boolean => {
      const field = item[filter.key];
      return filter.compareFn
        ? filter.compareFn(field, filter.value, item)
        : defaultFilter(field, filter.value);
    };

    return mode === 'any' ? activeFilters.some(matches) : activeFilters.every(matches);
  });
};

export const prioritizeBookmarks = <T>(
  items: ReadonlyArray<T>,
  bookmarks: ReadonlyArray<unknown>,
  getItemId: (item: T) => unknown,
): T[] => {
  if (bookmarks.length === 0) return items.slice();

  const bookmarkSet = new Set(bookmarks);
  const bookmarked: T[] = [];
  const remaining: T[] = [];
  items.forEach((item) => {
    (bookmarkSet.has(getItemId(item)) ? bookmarked : remaining).push(item);
  });
  return bookmarked.concat(remaining);
};

export const processItems = <T extends object>(
  items: ReadonlyArray<T>,
  options: ProcessOptions<T> = {},
): T[] => {
  const sorts = options.sorts || [];
  const filters = options.filters || [];
  const bookmarks = options.bookmarks || [];
  const getItemId =
    options.getItemId ||
    ((item: T): unknown => (item as Record<PropertyKey, unknown>).id);
  const filtered =
    filters.some((filter) => !isEmptyFilterValue(filter.value))
      ? filterItems(items, filters, options.filterMode || 'all')
      : items.slice();
  const sorted = sorts.length > 0 ? sortItems(filtered, sorts) : filtered;
  return bookmarks.length > 0
    ? prioritizeBookmarks(sorted, bookmarks, getItemId)
    : sorted;
};
