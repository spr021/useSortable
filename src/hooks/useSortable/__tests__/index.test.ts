import { renderHook, act } from '@testing-library/react-hooks';
import { useSortable } from '../index';

describe('useSortable tests', () => {
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
});
