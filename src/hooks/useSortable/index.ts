import { useEffect, useMemo, useState } from 'react';
import { validateInitialValue } from '../../helpers/validateInitialValue';

type CompareFn<T> = (field: T[keyof T], searchValue: any) => boolean;
type SortCompareFn<T> = (a: T[keyof T], b: T[keyof T]) => number;

interface IUseSortable<T> {
  items: T[];
  requestSort: (
    key: keyof T,
    direction?: 'ascending' | 'descending',
    compareFn?: SortCompareFn<T>,
  ) => void;
  requestSearch: (
    search: keyof T,
    value: any,
    compareFn?: CompareFn<T>,
  ) => void;
  requestBookMark: (id: T[keyof T]) => void;
}

type Config<T> = {
  key: keyof T | '';
  direction: 'ascending' | 'descending' | '';
  bookMarks: Array<any>;
  search: keyof T | '';
  value: any;
  compareFn?: CompareFn<T>;
  sortCompareFn?: SortCompareFn<T>;
  disableUrlParams?: boolean;
  disableLocalStorage?: boolean;
  onBookmarksChange?: (bookMarks: Array<T[keyof T]>) => void;
};

/**
 * Classic sort & search example to help understand the flow of this npm package
 *
 * @param    {Array} initialValue
 *           initial sort & search value
 *
 * @param    {Config} config
 *           initial config for sort & search in initialValue
 *
 * @return   {Array}
 *           array with sort & search and methods
 *
 * @property {Array} items
 *           The current array that sort & search
 *
 * @property {(key: string | number, direction: string) => void} requestSort
 *           the request for Sort function that get what Key you want to sort and direction
 *           direction can be "ascending" or "descending"
 *           defult value of direction is "ascending"
 *
 * @property {(search: string | number, value: string | number) => void} requestSearch
 *           the request for Search function that get Search for what Key you want search and value
 *
 * @property {(id: string | number) => void} requestBookMark
 *           the request for BookMark function that get what Id you want to book mark and set top of you array
 *
 * @example
 *   const ExampleComponent = () => {
 *     const myArray = [{
 *        id: 1,
 *        name: "Saber",
 *        family: "Pourrahimi"
 *        ...
 *     },
 *     {
 *        id: 2,
 *        name: "Maryam",
 *        family: "Mirzayee"
 *        ...
 *     }]
 *     const { items, requestSort, requestSearch, requestBookMark } = useSortable(myArray);
 *
 *     return (
 *       <>
 *         <table>
 *           <tr>
 *             <td>Id</td>
 *             <td>Name</td>
 *             <td>Family</td>
 *           </tr>
 *           {items.map(el => (
 *              <tr onClick={() => requestBookMark(el.id)}>
 *                <td>{el.id}</td>
 *                <td>{el.name}</td>
 *                <td>{el.family}</td>
 *              </tr>
 *           ))}
 *         </table>
 *         <button onClick={() => requestSort("name", "ascending")}>Sort ascending myArray by name</button>
 *         <input onChange={(e) => requestSearch("name", e.target.value)}>Search name in myArray</button>
 *         <input onChange={(e) => requestSearch("family", e.target.value)}>Search family in myArray</button>
 *       </>
 *      )
 *    }
 */
export const useSortable = <T extends Record<string, any>>(
  items: T[],
  config: Config<T> = {
    bookMarks: [],
    key: '',
    direction: '',
    search: '',
    value: '',
  },
): IUseSortable<T> => {
  const validatedInitialValue = validateInitialValue<T>(items);

  const [sortConfig, setSortConfig] = useState<Config<T>>(config);
  const isBrowser = typeof window !== 'undefined';
  const bookMarkList =
    isBrowser && !config.disableLocalStorage
      ? JSON.parse(window.localStorage.getItem('book-mark') || '[]')
      : [];

  const sortedItems = useMemo(() => {
    let sortableItems = [...validatedInitialValue];
    if (sortConfig && sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof T];
        const bVal = b[sortConfig.key as keyof T];
        if (sortConfig.sortCompareFn) {
          const res = sortConfig.sortCompareFn(aVal, bVal);
          return sortConfig.direction === 'ascending' ? res : -res;
        }
        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    if (sortConfig && sortConfig.search && sortConfig.value !== undefined) {
      const { search, value, compareFn } = sortConfig;
      sortableItems = sortableItems
        .filter((item) => {
          const field = item[search as keyof T];
          if (compareFn) {
            return compareFn(field, value);
          }
          if (typeof field === 'string') {
            return field
              .toLowerCase()
              .includes(String(value).toLowerCase());
          }
          return field === value;
        })
        .sort((a, b) => {
          const aField = a[search as keyof T];
          const bField = b[search as keyof T];
          if (compareFn) {
            const aMatch = compareFn(aField, value);
            const bMatch = compareFn(bField, value);
            if (aMatch === bMatch) {
              if (aField > bField) return 1;
              if (aField < bField) return -1;
              return 0;
            }
            return aMatch ? -1 : 1;
          }
          if (
            typeof aField === 'string' &&
            typeof bField === 'string'
          ) {
            const aIndex = aField
              .toLowerCase()
              .indexOf(String(value).toLowerCase());
            const bIndex = bField
              .toLowerCase()
              .indexOf(String(value).toLowerCase());
            if (aIndex > bIndex) return 1;
            if (aIndex < bIndex) return -1;
            return aField > bField ? 1 : -1;
          }
          if (aField > bField) return 1;
          if (aField < bField) return -1;
          return 0;
        });
    }
    if (sortConfig.bookMarks && sortConfig.bookMarks.length > 0) {
      const bookMarkSet = new Set(sortConfig.bookMarks);
      sortableItems.sort((x: any, y: any) => {
        const xBook = bookMarkSet.has(x.id);
        const yBook = bookMarkSet.has(y.id);
        if (xBook === yBook) return 0;
        return xBook ? -1 : 1;
      });
    }
    return sortableItems;
  }, [validatedInitialValue, sortConfig]);

  const requestSort = (
    key: keyof T,
    direction?: 'ascending' | 'descending',
    compareFn?: SortCompareFn<T>,
  ) => {
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    } else if (!direction) {
      direction = 'ascending';
    }
    if (isBrowser && !sortConfig.disableUrlParams) {
      const params = new URLSearchParams(window.location.search);
      params.set('sort', key.toString());
      params.set('d', direction as string);
      const URL =
        params.toString().indexOf('null') > 0
          ? `${window.location.pathname}`
          : `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', URL);
    }
    setSortConfig({
      ...sortConfig,
      key,
      direction: direction!,
      sortCompareFn: compareFn,
    });
  };

  const requestSearch = (
    search: keyof T,
    value: any,
    compareFn?: CompareFn<T>,
  ) => {
    setSortConfig({
      ...sortConfig,
      search,
      value,
      compareFn,
    });
  };

  const requestBookMark = (id: T[keyof T]) => {
    const bookMarks = sortConfig.bookMarks;
    const updatedBookMarks = [
      ...bookMarks.filter((el) => el !== id),
      ...(!bookMarks.includes(id) ? [id] : []),
    ];
    const newConfig = { ...sortConfig, bookMarks: updatedBookMarks };
    setSortConfig(newConfig);
    newConfig.onBookmarksChange?.(updatedBookMarks);
    if (isBrowser && !sortConfig.disableLocalStorage) {
      window.localStorage.setItem(
        'book-mark',
        JSON.stringify(updatedBookMarks),
      );
    }
  };

  useEffect(() => {
    if (isBrowser) {
      const params = new URLSearchParams(window.location.search);
      const URLsort = params.get('sort') || '';
      const URLd = params.get('d') || '';
      requestSort(URLsort as keyof T, URLd as any);
      setSortConfig({
        ...sortConfig,
        key: URLsort as keyof T,
        direction: URLd as any,
        bookMarks: bookMarkList,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items: sortedItems, requestSort, requestSearch, requestBookMark };
};

useSortable.defaultProps = {
  config: {
    bookMarks: [],
    key: '',
    direction: '',
    search: '',
    value: '',
  },
};

export default useSortable;
