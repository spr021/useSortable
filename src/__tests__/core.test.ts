import { describe, expect, it, vi } from 'vitest';

import {
  filterItems,
  isEmptyFilterValue,
  normalizeSorts,
  prioritizeBookmarks,
  processItems,
  sortItems,
} from '../core';
import { validateInitialValue } from '../helpers/validateInitialValue';

interface Item {
  id: number;
  group: string;
  name: string | null;
  score: number;
  active: boolean;
  tags: string[];
  createdAt: Date;
}

const items: Item[] = [
  {
    id: 1,
    group: 'b',
    name: 'Item 10',
    score: 5,
    active: true,
    tags: ['red'],
    createdAt: new Date('2024-01-02'),
  },
  {
    id: 2,
    group: 'a',
    name: null,
    score: 5,
    active: false,
    tags: ['blue', 'red'],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 3,
    group: 'a',
    name: 'item 2',
    score: 10,
    active: true,
    tags: ['green'],
    createdAt: new Date('2024-01-03'),
  },
];

describe('core data processing', () => {
  it('normalizes missing directions and recognizes only inactive filter values', () => {
    expect(normalizeSorts<Item>([{ key: 'name' }])[0].direction).toBe('ascending');
    expect([undefined, null, ''].every(isEmptyFilterValue)).toBe(true);
    expect([0, false, Number.NaN].every((value) => !isEmptyFilterValue(value))).toBe(
      true,
    );
  });

  it('sorts naturally, keeps nulls last in either direction, and stays stable', () => {
    const ascending = sortItems(items, normalizeSorts([{ key: 'name' }]));
    const descending = sortItems(
      items,
      normalizeSorts([{ key: 'name', direction: 'descending' }]),
    );
    const stable = sortItems(items, normalizeSorts([{ key: 'score' }]));

    expect(ascending.map(({ id }) => id)).toEqual([3, 1, 2]);
    expect(descending.map(({ id }) => id)).toEqual([1, 3, 2]);
    expect(stable.map(({ id }) => id)).toEqual([1, 2, 3]);
    expect(items.map(({ id }) => id)).toEqual([1, 2, 3]);
  });

  it('supports multi-column, date, boolean, null placement, and custom sorting', () => {
    expect(
      sortItems(
        items,
        normalizeSorts([
          { key: 'group' },
          { key: 'score', direction: 'descending' },
        ]),
      ).map(({ id }) => id),
    ).toEqual([3, 2, 1]);
    expect(
      sortItems(items, normalizeSorts([{ key: 'createdAt' }])).map(({ id }) => id),
    ).toEqual([2, 1, 3]);
    expect(
      sortItems(items, normalizeSorts([{ key: 'active' }])).map(({ id }) => id),
    ).toEqual([2, 1, 3]);
    expect(
      sortItems(items, normalizeSorts([{ key: 'name', nulls: 'first' }])).map(
        ({ id }) => id,
      ),
    ).toEqual([2, 3, 1]);
    expect(
      sortItems(
        items,
        normalizeSorts([
          {
            key: 'id',
            compareFn: (_a, _b, aItem, bItem) => bItem.id - aItem.id,
          },
        ]),
      ).map(({ id }) => id),
    ).toEqual([3, 2, 1]);
  });

  it('orders NaN after finite numbers and returns a defensive copy without rules', () => {
    const numeric = [{ value: Number.NaN }, { value: 2 }, { value: Number.NaN }];
    const sorted = sortItems(numeric, normalizeSorts([{ key: 'value' }]));
    const copied = sortItems(numeric, []);

    expect(sorted[0].value).toBe(2);
    expect(Number.isNaN(sorted[1].value)).toBe(true);
    expect(Number.isNaN(sorted[2].value)).toBe(true);
    expect(copied).toEqual(numeric);
    expect(copied).not.toBe(numeric);
  });

  it('keeps null and undefined ties stable', () => {
    const nullish = [{ value: null }, { value: undefined }, { value: 'a' }];
    expect(sortItems(nullish, [{ key: 'value' }])).toEqual([
      { value: 'a' },
      { value: null },
      { value: undefined },
    ]);
  });

  it('filters strings, exact values, arrays, dates, and custom predicates', () => {
    expect(filterItems(items, [{ key: 'name', value: 'ITEM 2' }])).toEqual([
      items[2],
    ]);
    expect(filterItems(items, [{ key: 'active', value: false }])).toEqual([
      items[1],
    ]);
    expect(filterItems(items, [{ key: 'tags', value: 'red' }])).toEqual([
      items[0],
      items[1],
    ]);
    expect(filterItems(items, [{ key: 'createdAt', value: '2024-01-02' }])).toEqual([
      items[0],
    ]);
    expect(
      filterItems(items, [{ key: 'createdAt', value: new Date('2024-01-02') }]),
    ).toEqual([items[0]]);
    expect(filterItems(items, [{ key: 'createdAt', value: 'not-a-date' }])).toEqual([]);
    expect(
      filterItems(items, [
        {
          key: 'score',
          value: 6,
          compareFn: (field, minimum) => Number(field) >= Number(minimum),
        },
      ]),
    ).toEqual([items[2]]);
  });

  it('combines filters in all or any mode and ignores inactive filters', () => {
    const filters = [
      { key: 'group' as const, value: 'a' },
      { key: 'active' as const, value: true },
    ];
    expect(filterItems(items, filters, 'all')).toEqual([items[2]]);
    expect(filterItems(items, filters, 'any')).toEqual(items);
    expect(filterItems(items, [{ key: 'name', value: '' }])).toEqual(items);
  });

  it('prioritizes bookmarks as a stable partition using custom identity', () => {
    const result = prioritizeBookmarks(items, ['a', 'b'], (item) => item.group);
    expect(result.map(({ id }) => id)).toEqual([1, 2, 3]);
    expect(prioritizeBookmarks(items, [3], (item) => item.id).map(({ id }) => id)).toEqual(
      [3, 1, 2],
    );
    const copied = prioritizeBookmarks(items, [], (item) => item.id);
    expect(copied).toEqual(items);
    expect(copied).not.toBe(items);
  });

  it('runs filtering, sorting, then bookmark prioritization as one pipeline', () => {
    const result = processItems(items, {
      sorts: [{ key: 'score', direction: 'descending' }],
      filters: [{ key: 'active', value: true }],
      filterMode: 'all',
      bookmarks: [1],
      getItemId: (item) => item.id,
    });
    expect(result.map(({ id }) => id)).toEqual([1, 3]);
  });

  it('avoids unnecessary pipeline stages when no rules are active', () => {
    const getItemId = vi.fn((item: Item) => item.id);
    const result = processItems(items, { getItemId });
    expect(result).toEqual(items);
    expect(result).not.toBe(items);
    expect(getItemId).not.toHaveBeenCalled();
  });

  it('offers ergonomic defaults for direct helper consumers', () => {
    expect(sortItems(items, [{ key: 'score', direction: 'descending' }])[0].id).toBe(3);
    expect(processItems(items, { bookmarks: [3] })[0].id).toBe(3);
    expect(
      processItems(items, { filters: [{ key: 'active', value: true }] }).map(
        ({ id }) => id,
      ),
    ).toEqual([1, 3]);
    expect(processItems(items)).toEqual(items);
  });
});

describe('validateInitialValue', () => {
  it('returns arrays unchanged, including readonly inputs', () => {
    const value: ReadonlyArray<{ id: number }> = [{ id: 1 }];
    expect(validateInitialValue(value)).toBe(value);
  });

  it('returns an empty array and warns for invalid runtime input', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(validateInitialValue({ id: 1 })).toEqual([]);
    expect(warning).toHaveBeenCalledOnce();
  });
});
