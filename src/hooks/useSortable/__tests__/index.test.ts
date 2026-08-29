import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SortableConfig } from '../../../types';
import { useSortable } from '../index';

interface Person {
  id: number;
  code: string;
  name: string;
  family: string;
  age: number;
  team: string;
}

const people: Person[] = [
  { id: 1, code: 'one', name: 'Borna', family: 'Pourrahimi', age: 30, team: 'b' },
  { id: 2, code: 'two', name: 'Ali', family: 'Mirzayee', age: 20, team: 'a' },
  { id: 3, code: 'three', name: 'Sara', family: 'Ahmadi', age: 25, team: 'a' },
];

const isolatedConfig: SortableConfig<Person> = {
  disableUrlParams: true,
  disableLocalStorage: true,
};

describe('useSortable', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('returns the complete API and never mutates the source array', () => {
    const originalOrder = people.map(({ id }) => id);
    const { result } = renderHook(() => useSortable(people, isolatedConfig));

    expect(result.current.items).toEqual(people);
    expect(result.current.sorts).toEqual([]);
    expect(result.current.filters).toEqual([]);
    expect(result.current.bookMarks).toBe(result.current.bookmarks);
    expect(result.current.toggleBookmark).toBe(result.current.requestBookMark);
    expect(typeof result.current.requestMultiSort).toBe('function');
    expect(typeof result.current.requestFilter).toBe('function');
    expect(typeof result.current.reset).toBe('function');
    expect(people.map(({ id }) => id)).toEqual(originalOrder);
  });

  it('sorts explicitly and toggles direction only when direction is omitted', () => {
    const { result } = renderHook(() => useSortable(people, isolatedConfig));

    act(() => result.current.requestSort('name', 'ascending'));
    expect(result.current.items.map(({ name }) => name)).toEqual(['Ali', 'Borna', 'Sara']);
    act(() => result.current.requestSort('name', 'ascending'));
    expect(result.current.getSortDirection('name')).toBe('ascending');
    act(() => result.current.requestSort('name'));
    expect(result.current.items.map(({ name }) => name)).toEqual(['Sara', 'Borna', 'Ali']);
  });

  it('supports custom comparators without losing the selected direction', () => {
    const { result } = renderHook(() => useSortable(people, isolatedConfig));
    act(() => {
      result.current.requestSort('name', 'ascending', (a, b) =>
        String(b).localeCompare(String(a)),
      );
    });
    expect(result.current.items.map(({ name }) => name)).toEqual(['Sara', 'Borna', 'Ali']);
  });

  it('does not repeat filtering and sorting when only bookmarks change', () => {
    const comparator = vi.fn((a: Person[keyof Person], b: Person[keyof Person]) =>
      String(a).localeCompare(String(b)),
    );
    const predicate = vi.fn((field: Person[keyof Person], value: unknown) =>
      String(field).includes(String(value)),
    );
    const { result } = renderHook(() => useSortable(people, isolatedConfig));
    act(() => {
      result.current.requestSearch('team', 'a', predicate);
      result.current.requestSort('name', 'ascending', comparator);
    });
    const comparisonCalls = comparator.mock.calls.length;
    const predicateCalls = predicate.mock.calls.length;

    act(() => result.current.requestBookMark(3));
    expect(comparator).toHaveBeenCalledTimes(comparisonCalls);
    expect(predicate).toHaveBeenCalledTimes(predicateCalls);
  });

  it('filters values and clears a legacy search with an empty value', () => {
    const { result } = renderHook(() => useSortable(people, isolatedConfig));
    act(() => result.current.requestSearch('family', 'mirz'));
    expect(result.current.items).toEqual([people[1]]);
    act(() => result.current.requestSearch('family', ''));
    expect(result.current.items).toEqual(people);
    act(() => result.current.requestSearch('age', 20));
    expect(result.current.items).toEqual([people[1]]);
  });

  it('adds, updates, and clears multi-column sorts', () => {
    const { result } = renderHook(() => useSortable(people, isolatedConfig));
    act(() => {
      result.current.requestMultiSort('team', 'ascending');
      result.current.requestMultiSort('age', 'descending');
    });
    expect(result.current.items.map(({ id }) => id)).toEqual([3, 2, 1]);
    expect(result.current.sorts).toHaveLength(2);

    act(() => result.current.requestMultiSort('age'));
    expect(result.current.getSortDirection('age')).toBe('ascending');
    act(() => result.current.requestMultiSort('age'));
    expect(result.current.getSortDirection('age')).toBe('descending');
    act(() => result.current.clearSort('team'));
    expect(result.current.sorts.map(({ key }) => key)).toEqual(['age']);
    act(() => result.current.clearSort());
    expect(result.current.items).toEqual(people);
  });

  it('combines, replaces, and selectively clears filters', () => {
    const { result } = renderHook(() => useSortable(people, isolatedConfig));
    act(() => {
      result.current.requestFilter('team', 'a');
      result.current.requestFilter('age', 25, (field, minimum) =>
        Number(field) >= Number(minimum),
      );
    });
    expect(result.current.items).toEqual([people[2]]);
    act(() => result.current.requestFilter('age', ''));
    expect(result.current.items).toEqual([people[1], people[2]]);
    act(() => result.current.clearSearch('team'));
    expect(result.current.items).toEqual(people);
  });

  it('supports any-match filters and declarative setters', () => {
    const { result } = renderHook(() =>
      useSortable(people, { ...isolatedConfig, filterMode: 'any' }),
    );
    act(() => {
      result.current.setFilters([
        { key: 'name', value: 'Ali' },
        { key: 'family', value: 'Ahmadi' },
      ]);
      result.current.setSorts([{ key: 'age', direction: 'descending' }]);
    });
    expect(result.current.items.map(({ id }) => id)).toEqual([3, 2]);
  });

  it('uses legacy initial config and reset restores all initial state', () => {
    const { result } = renderHook(() =>
      useSortable(people, {
        ...isolatedConfig,
        key: 'age',
        direction: 'descending',
        search: 'team',
        value: 'a',
        bookMarks: [2],
      }),
    );
    expect(result.current.items.map(({ id }) => id)).toEqual([2, 3]);
    act(() => {
      result.current.clearSort();
      result.current.clearSearch();
      result.current.clearBookmarks();
    });
    expect(result.current.items).toEqual(people);
    act(() => result.current.reset());
    expect(result.current.items.map(({ id }) => id)).toEqual([2, 3]);
  });

  it('uses functional bookmark updates, custom identity, aliases, and callbacks', async () => {
    const onBookmarksChange = vi.fn();
    const { result } = renderHook(() =>
      useSortable(people, {
        ...isolatedConfig,
        bookmarkKey: 'code',
        onBookmarksChange,
      }),
    );
    act(() => {
      result.current.toggleBookmark('two');
      result.current.toggleBookmark('two');
      result.current.requestBookMark('three');
    });
    expect(result.current.items.map(({ id }) => id)).toEqual([3, 1, 2]);
    expect(result.current.isBookmarked('three')).toBe(true);
    expect(result.current.isBookmarked('two')).toBe(false);
    await waitFor(() => expect(onBookmarksChange).toHaveBeenLastCalledWith(['three']));

    act(() => result.current.clearBookmarks());
    expect(result.current.bookmarks).toEqual([]);
  });

  it('supports a derived bookmark identifier and preferred initial config', () => {
    const { result } = renderHook(() =>
      useSortable(people, {
        ...isolatedConfig,
        sorts: [{ key: 'age' }],
        filters: [{ key: 'team', value: 'a' }],
        bookmarks: ['three'],
        getItemId: (person) => person.code,
      }),
    );
    expect(result.current.items.map(({ id }) => id)).toEqual([3, 2]);
  });

  it('hydrates and persists bookmarks under a configurable storage key', async () => {
    window.localStorage.setItem('people-bookmarks', JSON.stringify([2]));
    const { result } = renderHook(() =>
      useSortable(people, {
        disableUrlParams: true,
        storageKey: 'people-bookmarks',
      }),
    );
    await waitFor(() => expect(result.current.items[0].id).toBe(2));
    act(() => result.current.requestBookMark(3));
    await waitFor(() =>
      expect(JSON.parse(window.localStorage.getItem('people-bookmarks') || '[]')).toEqual([
        2, 3,
      ]),
    );
  });

  it('uses initial bookmarks when storage has no saved value', () => {
    const { result } = renderHook(() =>
      useSortable(people, {
        disableUrlParams: true,
        storageKey: 'empty-storage-key',
        bookmarks: [1],
      }),
    );
    expect(result.current.items[0].id).toBe(1);
    expect(result.current.bookmarks).toEqual([1]);
  });

  it('ignores a valid stored JSON value when it is not an array', () => {
    window.localStorage.setItem('not-an-array', '{"bookmark":2}');
    const { result } = renderHook(() =>
      useSortable(people, {
        disableUrlParams: true,
        storageKey: 'not-an-array',
        bookmarks: [2],
      }),
    );
    expect(result.current.bookmarks).toEqual([2]);
  });

  it('ignores malformed stored bookmarks and responds to storage events', async () => {
    window.localStorage.setItem('shared', '{bad json');
    const { result, unmount } = renderHook(() =>
      useSortable(people, { disableUrlParams: true, storageKey: 'shared' }),
    );
    expect(result.current.bookmarks).toEqual([]);

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'shared',
          newValue: null,
          storageArea: window.localStorage,
        }),
      );
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'shared',
          newValue: '{still bad',
          storageArea: window.localStorage,
        }),
      );
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'shared',
          newValue: '[3]',
          storageArea: window.localStorage,
        }),
      );
    });
    await waitFor(() => expect(result.current.items[0].id).toBe(3));
    unmount();
  });

  it('continues working when localStorage access throws', () => {
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementationOnce(() => {
        throw new Error('storage unavailable');
      });
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementationOnce(() => {
        throw new Error('quota exceeded');
      });
    const { result } = renderHook(() =>
      useSortable(people, { disableUrlParams: true }),
    );
    act(() => result.current.requestBookMark(2));
    expect(result.current.items[0].id).toBe(2);
    getItem.mockRestore();
    setItem.mockRestore();
  });

  it('hydrates sort state from the URL and preserves unrelated params and hashes', async () => {
    window.history.replaceState({}, '', '/people?page=2&sort=age&d=descending#table');
    const { result } = renderHook(() =>
      useSortable(people, { disableLocalStorage: true }),
    );
    await waitFor(() => expect(result.current.items.map(({ age }) => age)).toEqual([30, 25, 20]));

    act(() => result.current.requestSort('name', 'ascending'));
    await waitFor(() => {
      expect(window.location.search).toContain('page=2');
      expect(window.location.search).toContain('sort=name');
      expect(window.location.search).toContain('d=ascending');
      expect(window.location.hash).toBe('#table');
    });
    act(() => result.current.clearSort());
    await waitFor(() => {
      expect(window.location.search).toBe('?page=2');
      expect(window.location.hash).toBe('#table');
    });
  });

  it('supports custom URL params and can disable all browser persistence', async () => {
    window.history.replaceState({}, '', '/?order=age&direction=wrong');
    const { result } = renderHook(() =>
      useSortable(people, {
        disableLocalStorage: true,
        sortParam: 'order',
        directionParam: 'direction',
      }),
    );
    await waitFor(() => expect(result.current.getSortDirection('age')).toBe('ascending'));

    const originalUrl = window.location.href;
    const disabled = renderHook(() => useSortable(people, isolatedConfig));
    act(() => {
      disabled.result.current.requestSort('name');
      disabled.result.current.requestBookMark(1);
    });
    expect(window.location.href).toBe(originalUrl);
    expect(window.localStorage.length).toBe(0);
  });

  it('removes the query marker when the last URL sort is cleared', async () => {
    const { result } = renderHook(() =>
      useSortable(people, { disableLocalStorage: true }),
    );
    act(() => result.current.requestSort('age'));
    await waitFor(() => expect(window.location.search).toContain('sort=age'));
    act(() => result.current.clearSort());
    await waitFor(() => expect(window.location.search).toBe(''));
  });

  it('recomputes results when a new data array is supplied', () => {
    const { result, rerender } = renderHook(
      ({ data }: { data: ReadonlyArray<Person> }) => useSortable(data, isolatedConfig),
      { initialProps: { data: people } },
    );
    act(() => result.current.requestSort('age', 'ascending'));
    rerender({ data: people.concat({ ...people[0], id: 4, age: 10 }) });
    expect(result.current.items.map(({ age }) => age)).toEqual([10, 20, 25, 30]);
  });

  it('supports numeric property keys, including zero', () => {
    const numbered = [
      { id: 1, 0: 'b' },
      { id: 2, 0: 'a' },
    ];
    const { result } = renderHook(() =>
      useSortable(numbered, {
        key: 0,
        search: 0,
        value: 'a',
        disableUrlParams: true,
        disableLocalStorage: true,
      }),
    );
    expect(result.current.items.map(({ id }) => id)).toEqual([2]);
    act(() => {
      result.current.clearSort(0);
      result.current.clearSearch(0);
    });
    expect(result.current.sorts).toEqual([]);
    expect(result.current.filters).toEqual([]);
  });
});
