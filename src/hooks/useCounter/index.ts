import { useEffect, useMemo, useState } from "react"
import PropTypes from 'prop-types';
import { validateInitialValue } from '../../helpers/validateInitialValue';

type IUseCounter = {
  items: Array<any>;
  requestSort: (key: any, direction: any) => void;
  requestSearch: (search: any, value: any) => void;
  addToBookMark: (id: any) => void;
};

type Config = {
  key: string;
  direction: string;
  bookMarks: Array<any>;
  search: string;
  value: string;
};


/**
 * Classic counter example to help understand the flow of this npm package
 *
 * @param    {number} initialValue
 *           initial counter value
 *
 * @return   {Object}
 *           object with count and methods
 *
 * @property {number} count
 *           The current count state
 *
 * @property {()=>void} increment
 *           the increment function
 *
 * @property {()=>void} decrement
 *           the decrement function
 *
 * @property {()=>void} reset
 *           the reset function
 *
 * @example
 *   const ExampleComponent = () => {
 *     const { count, increment, reset, decrement } = useCounter();
 *
 *     return (
 *       <>
 *         <button onClick={increment}>Increment counter</button>
 *         <button onClick={reset}>Reset counter</button>
 *         <button onClick={decrement}>Decrement counter</button>
 *         <p>{count}</p>
 *       </>
 *      )
 *    }
 */

 export const useCounter = (initialValue: number = 0): IUseCounter => {
  const validatedInitialValue = validateInitialValue(initialValue);

  const [count, setCount] = useState<number>(validatedInitialValue);
  const increment = useCallback(() => setCount((value) => value + 1), []);
  const decrement = useCallback(() => setCount((value) => value - 1), []);
  const reset = useCallback(() => setCount(validatedInitialValue), [
    validatedInitialValue,
  ]);
  return { count, increment, decrement, reset };
};

export const useSortableData = (items: Array<any>, config: Config) : IUseCounter => {
  const [sortConfig, setSortConfig] = useState<Config>(config)
  const bookMarkList = JSON.parse(window.localStorage.getItem("book-mark") || "[]")
  
  const sortedItems = useMemo(() => {
    let sortableItems = [...items]
    // sort by table head
    if (sortConfig !== null && sortConfig.key !== null) {
      sortableItems
      .sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }
    // search by value
    if (sortConfig !== null && sortConfig.search && sortConfig.value) {
      sortableItems = sortableItems
      .filter(item => {
        return item[sortConfig.search].toLowerCase().includes(sortConfig.value.toLowerCase())
      })
      .sort((a, b) => {
        if(a[sortConfig.search].toLowerCase().indexOf(sortConfig.value.toLowerCase()) > b[sortConfig.search].toLowerCase().indexOf(sortConfig.value.toLowerCase())) {
          return 1
        } else if (a[sortConfig.search].toLowerCase().indexOf(sortConfig.value.toLowerCase()) < b[sortConfig.search].toLowerCase().indexOf(sortConfig.value.toLowerCase())) {
            return -1
        } else {
            if(a[sortConfig.search] > b[sortConfig.search])
              return 1
            else
              return -1
        }
      })
    }
    // move book marks to up
    if (sortConfig.bookMarks) {
      sortConfig.bookMarks.forEach(bookMark => {
        sortableItems.sort((x,y) => { return x.id === bookMark ? -1 : y.id === bookMark ? 1 : 0 })
      })
    }
    return sortableItems
  }, [items, sortConfig])
  
  const requestSort = (key: any, direction: any) => {
    direction = direction || "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    const params = new URLSearchParams(window.location.search)
    params.set("sort", key)
    params.set("d", direction)
    const URL = params.toString().indexOf("null") > 0 ? `${window.location.pathname}` : `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, "", URL)
    setSortConfig({...sortConfig, key, direction })
  }

  const requestSearch = (search: any, value: any) => {
    setSortConfig({...sortConfig, search, value })
  }

  const addToBookMark = (id: any) => {
    if([...sortConfig.bookMarks].includes(id)) {  
      setSortConfig({...sortConfig, bookMarks: [...sortConfig.bookMarks.filter(el => el !== id)]})
      ////
      window.localStorage.setItem("book-mark", JSON.stringify([...sortConfig.bookMarks.filter(el => el !== id)]))
    } else {
      setSortConfig({...sortConfig, bookMarks: [...sortConfig.bookMarks, id]})
      /////
      window.localStorage.setItem("book-mark", JSON.stringify([...sortConfig.bookMarks, id]))
    } 
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const URLsort = params.get('sort') || ""
    const URLd = params.get('d') || ""
    requestSort(URLsort, URLd)
    setSortConfig({...sortConfig, key: URLsort, direction: URLd, bookMarks: bookMarkList})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  return { items: sortedItems, requestSort, requestSearch, addToBookMark }
}

useSortableData.PropTypes = {
  items: PropTypes.array.isRequired,
};

useSortableData.defaultProps = {
  config: {
    bookMarks: []
  },
};

// https://igorluczko.medium.com/the-complete-guide-to-publish-react-hook-as-npm-package-880049829e89