declare type IUseSortable = {
    items: Array<any>;
    requestSort: (key: string, direction: string) => void;
    requestSearch: (search: string, value: string) => void;
    requestBookMark: (id: string | number) => void;
};
declare type Config = {
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
export declare const useSortable: {
    (items: Array<any>, config?: Config): IUseSortable;
    defaultProps: {
        config: {
            bookMarks: never[];
            key: string;
            direction: string;
            search: string;
            value: string;
        };
    };
};
export {};
