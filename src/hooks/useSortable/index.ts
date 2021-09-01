import { useEffect, useMemo, useState } from "react"
import PropTypes from 'prop-types';
import { validateInitialValue } from '../../helpers/validateInitialValue';

type IUseSortable = {
  items: Array<any>;
  requestSort: (key: string | number, direction: string) => void;
  requestSearch: (search: string | number, value: string | number) => void;
  requestBookMark: (id: string | number) => void;
};

type Config = {
  key: string;
  direction: string;
  bookMarks: Array<any>;
  search: string;
  value: string;
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
const useSortable = (items: Array<any>, config: Config = {
  bookMarks: [],
  key: "",
  direction: "",
  search: "",
  value: "",
}) : IUseSortable => {
  const validatedInitialValue = validateInitialValue(items);

  const [sortConfig, setSortConfig] = useState<Config>(config)
  const bookMarkList = JSON.parse(window.localStorage.getItem("book-mark") || "[]")
  
  const sortedItems = useMemo(() => {
    let sortableItems = [...validatedInitialValue]
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
    if (sortConfig.bookMarks) {
      sortConfig.bookMarks.forEach(bookMark => {
        sortableItems.sort((x,y) => { return x.id === bookMark ? -1 : y.id === bookMark ? 1 : 0 })
      })
    }
    return sortableItems
  }, [items, sortConfig])
  
  const requestSort = (key: string, direction: string) => {
    direction = direction || "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    const params = new URLSearchParams(window.location.search)
    params.set("sort", key.toString())
    params.set("d", direction)
    const URL = params.toString().indexOf("null") > 0 ? `${window.location.pathname}` : `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, "", URL)
    setSortConfig({...sortConfig, key: key.toString() && key.toString(), direction })
  }

  const requestSearch = (search: string, value: string) => {
    setSortConfig({...sortConfig, search: search && search.toString(), value: value && value.toString() })
  }

  const requestBookMark = (id: string | number) => {
    if([...sortConfig.bookMarks].includes(id)) {  
      const removedItem = [...sortConfig.bookMarks.filter(el => el !== id)]
      setSortConfig({...sortConfig, bookMarks: removedItem})
      window.localStorage.setItem("book-mark", JSON.stringify(removedItem))
    } else {
      const addItem = [...sortConfig.bookMarks, id]
      setSortConfig({...sortConfig, bookMarks: addItem})
      window.localStorage.setItem("book-mark", JSON.stringify(addItem))
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

  return { items: sortedItems, requestSort, requestSearch, requestBookMark }
}

useSortable.PropTypes = {
  items: PropTypes.array.isRequired,
};

useSortable.defaultProps = {
  config: {
    bookMarks: [],
    key: "",
    direction: "",
    search: "",
    value: "",
  },
};

module.exports = useSortable;

module.exports.default = useSortable;