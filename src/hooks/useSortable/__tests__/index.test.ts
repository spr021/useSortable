import { renderHook, act } from '@testing-library/react-hooks';
import { useSortable } from '../index';

describe('useSortable tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const myArray = [
    {
      id: 1,
      name: 'Borna',
      family: 'Pourrahimi',
    },
    {
      id: 2,
      name: 'Ali',
      family: 'Mirzayee',
    },
  ];

  it('should be defined', () => {
    expect(useSortable).toBeDefined();
  });

  it('renders the hook correctly and checks types', () => {
    const { result } = renderHook(() => useSortable([]));
    expect(result.current.items).toStrictEqual([]);
    expect(Array.isArray(result.current.items)).toBe(true);
    expect(typeof result.current.requestSort).toBe('function');
    expect(typeof result.current.requestSearch).toBe('function');
    expect(typeof result.current.requestBookMark).toBe('function');
  });

  it('should requestSort ascending by name from custom initial value', () => {
    const { result } = renderHook(() => useSortable(myArray));
    act(() => {
      result.current.requestSort('name', 'ascending');
    });
    expect(result.current.items[0].name).toBe('Ali');
  });

  it('should requestSearch family by "Mi" value from custom initial value', () => {
    const { result } = renderHook(() => useSortable(myArray));
    act(() => {
      result.current.requestSearch('family', 'Mi');
    });
    expect(result.current.items).toStrictEqual([myArray[1], myArray[0]]);
  });

  it('should requestBookMark item from custom initial value', () => {
    const { result } = renderHook(() => useSortable(myArray));
    act(() => {
      result.current.requestBookMark(2);
    });
    expect(result.current.items).toStrictEqual([myArray[1], myArray[0]]);
  });

  it('sorts numerically in descending order', () => {
    const array = [
      { id: 1, age: 30 },
      { id: 2, age: 20 },
      { id: 3, age: 25 },
    ];
    const { result } = renderHook(() => useSortable(array));
    act(() => {
      result.current.requestSort('age', 'descending');
    });
    expect(result.current.items.map((i) => i.age)).toStrictEqual([30, 25, 20]);
  });

  it('clears search results when value is empty', () => {
    const { result } = renderHook(() => useSortable(myArray));
    act(() => {
      result.current.requestSearch('name', 'Ali');
    });
    expect(result.current.items).toHaveLength(1);
    act(() => {
      result.current.requestSearch('', '');
    });
    expect(result.current.items).toStrictEqual(myArray);
  });

  it('handles bookmarking without duplicates', () => {
    const array = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ];
    const { result } = renderHook(() => useSortable(array));
    act(() => {
      result.current.requestBookMark(2);
      result.current.requestBookMark(2);
      result.current.requestBookMark(3);
    });
    expect(result.current.items.map((i) => i.id)).toStrictEqual([2, 3, 1]);
  });
});
