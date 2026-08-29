import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  isEmptyFilterValue,
  normalizeSorts,
  NormalizedSortDescriptor,
  prioritizeBookmarks,
  processItems,
} from '../../core';
import { validateInitialValue } from '../../helpers/validateInitialValue';
import {
  FilterCompareFn,
  FilterDescriptor,
  SortableConfig,
  SortCompareFn,
  SortDescriptor,
  SortDirection,
  UseSortableResult,
} from '../../types';

interface SortableState<T> {
  sorts: Array<NormalizedSortDescriptor<T>>;
  filters: Array<FilterDescriptor<T>>;
  bookmarks: unknown[];
}

const DEFAULT_STORAGE_KEY = 'book-mark';
const DEFAULT_SORT_PARAM = 'sort';
const DEFAULT_DIRECTION_PARAM = 'd';

const isDirection = (value: string | null): value is SortDirection =>
  value === 'ascending' || value === 'descending';

const initialStateFromConfig = <T extends object>(
  config: SortableConfig<T>,
): SortableState<T> => {
  const hasLegacySortKey = config.key !== undefined && config.key !== '';
  const hasLegacySearchKey = config.search !== undefined && config.search !== '';
  const legacySorts: Array<SortDescriptor<T>> = hasLegacySortKey
    ? [
        {
          key: config.key as keyof T,
          direction: config.direction || 'ascending',
          compareFn: config.sortCompareFn,
        },
      ]
    : [];
  const legacyFilters: Array<FilterDescriptor<T>> =
    hasLegacySearchKey && !isEmptyFilterValue(config.value)
      ? [
          {
            key: config.search as keyof T,
            value: config.value,
            compareFn: config.compareFn,
          },
        ]
      : [];

  return {
    sorts: normalizeSorts(config.sorts || legacySorts),
    filters: (config.filters || legacyFilters).slice(),
    bookmarks: (config.bookmarks || config.bookMarks || []).slice(),
  };
};

const sameBookmarks = (
  left: ReadonlyArray<unknown>,
  right: ReadonlyArray<unknown>,
): boolean =>
  left.length === right.length &&
  left.every((value, index) => Object.is(value, right[index]));

const readStoredBookmarks = (storageKey: string): unknown[] | undefined => {
  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (rawValue === null) return undefined;
    const parsed: unknown = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Sorts, filters, and prioritizes bookmarked data without mutating the input array.
 */
export const useSortable = <T extends object>(
  items: ReadonlyArray<T>,
  config: SortableConfig<T> = {},
): UseSortableResult<T> => {
  const [initialState] = useState<SortableState<T>>(() =>
    initialStateFromConfig(config),
  );
  const [state, setState] = useState<SortableState<T>>(initialState);
  const mountedRef = useRef(false);
  const skipFirstPersistenceRef = useRef(true);
  const notifyBookmarksRef = useRef(false);

  const storageKey = config.storageKey || DEFAULT_STORAGE_KEY;
  const sortParam = config.sortParam || DEFAULT_SORT_PARAM;
  const directionParam = config.directionParam || DEFAULT_DIRECTION_PARAM;
  const filterMode = config.filterMode || 'all';
  const disableLocalStorage = Boolean(config.disableLocalStorage);
  const disableUrlParams = Boolean(config.disableUrlParams);
  const onBookmarksChange = config.onBookmarksChange;
  const configuredGetItemId = config.getItemId;
  const bookmarkKey = config.bookmarkKey;

  const getItemId = useCallback(
    (item: T): unknown => {
      if (configuredGetItemId) return configuredGetItemId(item);
      return item[(bookmarkKey ?? ('id' as keyof T)) as keyof T];
    },
    [bookmarkKey, configuredGetItemId],
  );

  const validatedItems = useMemo(
    () => validateInitialValue<T>(items),
    [items],
  );

  const filteredAndSortedItems = useMemo(
    () =>
      processItems(
        validatedItems,
        {
          sorts: state.sorts,
          filters: state.filters,
          filterMode,
          getItemId,
        },
      ),
    [filterMode, getItemId, state.filters, state.sorts, validatedItems],
  );

  const sortedItems = useMemo(
    () =>
      state.bookmarks.length > 0
        ? prioritizeBookmarks(filteredAndSortedItems, state.bookmarks, getItemId)
        : filteredAndSortedItems,
    [filteredAndSortedItems, getItemId, state.bookmarks],
  );

  useEffect(() => {
    mountedRef.current = true;
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const urlKey = disableUrlParams ? null : params.get(sortParam);
    const urlDirection = disableUrlParams ? null : params.get(directionParam);
    const storedBookmarks = disableLocalStorage
      ? undefined
      : readStoredBookmarks(storageKey);

    // Browser-backed state cannot be read during SSR; hydrate it after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((previous) => {
      const nextSorts = urlKey
        ? normalizeSorts<T>([
            {
              key: urlKey as keyof T,
              direction: isDirection(urlDirection) ? urlDirection : 'ascending',
            },
          ])
        : previous.sorts;
      const nextBookmarks = storedBookmarks || previous.bookmarks;
      if (
        nextSorts === previous.sorts &&
        sameBookmarks(nextBookmarks, previous.bookmarks)
      ) {
        return previous;
      }
      return { ...previous, sorts: nextSorts, bookmarks: nextBookmarks };
    });
    // Browser state is intentionally hydrated only once after mount for SSR safety.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!notifyBookmarksRef.current) return;
    notifyBookmarksRef.current = false;
    onBookmarksChange?.(state.bookmarks);
  }, [onBookmarksChange, state.bookmarks]);

  useEffect(() => {
    if (!mountedRef.current || typeof window === 'undefined') return;
    if (skipFirstPersistenceRef.current) {
      skipFirstPersistenceRef.current = false;
      return;
    }

    if (!disableLocalStorage) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(state.bookmarks));
      } catch {
        // Persistence is optional; unavailable or full storage must not break rendering.
      }
    }

    if (!disableUrlParams) {
      const params = new URLSearchParams(window.location.search);
      const primarySort = state.sorts[0];
      if (primarySort) {
        params.set(sortParam, String(primarySort.key));
        params.set(directionParam, primarySort.direction);
      } else {
        params.delete(sortParam);
        params.delete(directionParam);
      }
      const search = params.toString();
      const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (nextUrl !== currentUrl) {
        window.history.replaceState(window.history.state, '', nextUrl);
      }
    }
  }, [
    directionParam,
    disableLocalStorage,
    disableUrlParams,
    sortParam,
    state.bookmarks,
    state.sorts,
    storageKey,
  ]);

  useEffect(() => {
    if (disableLocalStorage || typeof window === 'undefined') return undefined;

    const handleStorage = (event: StorageEvent): void => {
      if (event.storageArea !== window.localStorage || event.key !== storageKey) return;
      try {
        const parsed: unknown = event.newValue === null ? [] : JSON.parse(event.newValue);
        if (Array.isArray(parsed)) {
          setState((previous) => ({ ...previous, bookmarks: parsed }));
        }
      } catch {
        // Ignore malformed values written by another tab.
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [disableLocalStorage, storageKey]);

  const requestSort = useCallback(
    <K extends keyof T>(
      key: K,
      direction?: SortDirection,
      compareFn?: SortCompareFn<T, K>,
    ): void => {
      setState((previous) => {
        const current = previous.sorts.length === 1 ? previous.sorts[0] : undefined;
        const nextDirection =
          direction ||
          (current?.key === key && current.direction === 'ascending'
            ? 'descending'
            : 'ascending');
        return {
          ...previous,
          sorts: normalizeSorts([
            {
              key,
              direction: nextDirection,
              compareFn: compareFn as SortCompareFn<T>,
            },
          ]),
        };
      });
    },
    [],
  );

  const requestMultiSort = useCallback(
    <K extends keyof T>(
      key: K,
      direction?: SortDirection,
      compareFn?: SortCompareFn<T, K>,
    ): void => {
      setState((previous) => {
        const existingIndex = previous.sorts.findIndex((sort) => sort.key === key);
        const existing = previous.sorts[existingIndex];
        const nextDirection =
          direction ||
          (existing?.direction === 'ascending' ? 'descending' : 'ascending');
        const nextSort = normalizeSorts([
          {
            key,
            direction: nextDirection,
            compareFn: compareFn as SortCompareFn<T>,
          },
        ])[0];
        const sorts = previous.sorts.slice();
        if (existingIndex === -1) sorts.push(nextSort);
        else sorts[existingIndex] = nextSort;
        return { ...previous, sorts };
      });
    },
    [],
  );

  const setSorts = useCallback((sorts: ReadonlyArray<SortDescriptor<T>>): void => {
    setState((previous) => ({ ...previous, sorts: normalizeSorts(sorts) }));
  }, []);

  const clearSort = useCallback((key?: keyof T): void => {
    setState((previous) => ({
      ...previous,
      sorts:
        key !== undefined
          ? previous.sorts.filter((sort) => sort.key !== key)
          : [],
    }));
  }, []);

  const getSortDirection = useCallback(
    (key: keyof T): SortDirection | undefined =>
      state.sorts.find((sort) => sort.key === key)?.direction,
    [state.sorts],
  );

  const requestSearch = useCallback(
    <K extends keyof T>(
      key: K,
      value: unknown,
      compareFn?: FilterCompareFn<T, K>,
    ): void => {
      setState((previous) => ({
        ...previous,
        filters: isEmptyFilterValue(value)
          ? []
          : [
              {
                key,
                value,
                compareFn: compareFn as FilterCompareFn<T>,
              },
            ],
      }));
    },
    [],
  );

  const requestFilter = useCallback(
    <K extends keyof T>(
      key: K,
      value: unknown,
      compareFn?: FilterCompareFn<T, K>,
    ): void => {
      setState((previous) => {
        const withoutKey = previous.filters.filter((filter) => filter.key !== key);
        return {
          ...previous,
          filters: isEmptyFilterValue(value)
            ? withoutKey
            : withoutKey.concat({
                key,
                value,
                compareFn: compareFn as FilterCompareFn<T>,
              }),
        };
      });
    },
    [],
  );

  const setFilters = useCallback(
    (filters: ReadonlyArray<FilterDescriptor<T>>): void => {
      setState((previous) => ({ ...previous, filters: filters.slice() }));
    },
    [],
  );

  const clearSearch = useCallback((key?: keyof T): void => {
    setState((previous) => ({
      ...previous,
      filters:
        key !== undefined
          ? previous.filters.filter((filter) => filter.key !== key)
          : [],
    }));
  }, []);

  const requestBookMark = useCallback((id: unknown): void => {
    notifyBookmarksRef.current = true;
    setState((previous) => {
      const hasBookmark = previous.bookmarks.some((bookmark) => Object.is(bookmark, id));
      return {
        ...previous,
        bookmarks: hasBookmark
          ? previous.bookmarks.filter((bookmark) => !Object.is(bookmark, id))
          : previous.bookmarks.concat(id),
      };
    });
  }, []);

  const clearBookmarks = useCallback((): void => {
    notifyBookmarksRef.current = true;
    setState((previous) => ({ ...previous, bookmarks: [] }));
  }, []);

  const isBookmarked = useCallback(
    (id: unknown): boolean =>
      state.bookmarks.some((bookmark) => Object.is(bookmark, id)),
    [state.bookmarks],
  );

  const reset = useCallback((): void => {
    notifyBookmarksRef.current = true;
    setState({
      sorts: initialState.sorts.slice(),
      filters: initialState.filters.slice(),
      bookmarks: initialState.bookmarks.slice(),
    });
  }, [initialState]);

  return {
    items: sortedItems,
    sorts: state.sorts,
    filters: state.filters,
    bookMarks: state.bookmarks,
    bookmarks: state.bookmarks,
    requestSort,
    requestMultiSort,
    setSorts,
    clearSort,
    getSortDirection,
    requestSearch,
    requestFilter,
    setFilters,
    clearSearch,
    requestBookMark,
    toggleBookmark: requestBookMark,
    clearBookmarks,
    isBookmarked,
    reset,
  };
};

export default useSortable;
