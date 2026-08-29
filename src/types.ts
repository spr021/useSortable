export type SortDirection = 'ascending' | 'descending';

export type FilterMode = 'all' | 'any';

export type SortCompareFn<T, K extends keyof T = keyof T> = (
  a: T[K],
  b: T[K],
  aItem: T,
  bItem: T,
) => number;

export type FilterCompareFn<T, K extends keyof T = keyof T> = (
  field: T[K],
  searchValue: unknown,
  item: T,
) => boolean;

export interface SortDescriptor<T, K extends keyof T = keyof T> {
  key: K;
  direction?: SortDirection;
  compareFn?: SortCompareFn<T, K>;
  nulls?: 'first' | 'last';
}

export interface FilterDescriptor<T, K extends keyof T = keyof T> {
  key: K;
  value: unknown;
  compareFn?: FilterCompareFn<T, K>;
}

export interface ProcessOptions<T extends object> {
  sorts?: ReadonlyArray<SortDescriptor<T>>;
  filters?: ReadonlyArray<FilterDescriptor<T>>;
  filterMode?: FilterMode;
  bookmarks?: ReadonlyArray<unknown>;
  getItemId?: (item: T) => unknown;
}

export interface SortableConfig<T> {
  /** Legacy single-column initial sort key. */
  key?: keyof T | '';
  /** Legacy single-column initial sort direction. */
  direction?: SortDirection | '';
  /** Legacy spelling retained for backward compatibility. */
  bookMarks?: ReadonlyArray<unknown>;
  /** Preferred spelling for initial bookmark identifiers. */
  bookmarks?: ReadonlyArray<unknown>;
  /** Legacy single-filter initial key. */
  search?: keyof T | '';
  /** Legacy single-filter initial value. */
  value?: unknown;
  /** Legacy single-filter comparator. */
  compareFn?: FilterCompareFn<T>;
  /** Legacy single-sort comparator. */
  sortCompareFn?: SortCompareFn<T>;
  /** Initial multi-column sort rules, evaluated from first to last. */
  sorts?: ReadonlyArray<SortDescriptor<T>>;
  /** Initial filters. */
  filters?: ReadonlyArray<FilterDescriptor<T>>;
  /** Whether every filter or at least one filter must match. */
  filterMode?: FilterMode;
  /** Do not read or write sort state in the current URL. */
  disableUrlParams?: boolean;
  /** Do not read or write bookmarks in localStorage. */
  disableLocalStorage?: boolean;
  /** localStorage key used for bookmark persistence. */
  storageKey?: string;
  /** URL query parameter used for the primary sort key. */
  sortParam?: string;
  /** URL query parameter used for the primary sort direction. */
  directionParam?: string;
  /** Object property used to identify bookmarked items. Defaults to `id`. */
  bookmarkKey?: keyof T;
  /** Custom bookmark identifier resolver. Takes precedence over bookmarkKey. */
  getItemId?: (item: T) => unknown;
  onBookmarksChange?: (bookmarks: ReadonlyArray<unknown>) => void;
}

export interface UseSortableResult<T> {
  items: T[];
  sorts: ReadonlyArray<Required<Pick<SortDescriptor<T>, 'key' | 'direction'>> &
    Omit<SortDescriptor<T>, 'key' | 'direction'>>;
  filters: ReadonlyArray<FilterDescriptor<T>>;
  /** Legacy spelling retained for backward compatibility. */
  bookMarks: ReadonlyArray<unknown>;
  bookmarks: ReadonlyArray<unknown>;
  requestSort: <K extends keyof T>(
    key: K,
    direction?: SortDirection,
    compareFn?: SortCompareFn<T, K>,
  ) => void;
  requestMultiSort: <K extends keyof T>(
    key: K,
    direction?: SortDirection,
    compareFn?: SortCompareFn<T, K>,
  ) => void;
  setSorts: (sorts: ReadonlyArray<SortDescriptor<T>>) => void;
  clearSort: (key?: keyof T) => void;
  getSortDirection: (key: keyof T) => SortDirection | undefined;
  requestSearch: <K extends keyof T>(
    key: K,
    value: unknown,
    compareFn?: FilterCompareFn<T, K>,
  ) => void;
  requestFilter: <K extends keyof T>(
    key: K,
    value: unknown,
    compareFn?: FilterCompareFn<T, K>,
  ) => void;
  setFilters: (filters: ReadonlyArray<FilterDescriptor<T>>) => void;
  clearSearch: (key?: keyof T) => void;
  requestBookMark: (id: unknown) => void;
  toggleBookmark: (id: unknown) => void;
  clearBookmarks: () => void;
  isBookmarked: (id: unknown) => boolean;
  reset: () => void;
}
