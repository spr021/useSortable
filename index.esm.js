import { useState, useMemo, useEffect } from 'react';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

/**
 * The validator function returns
 * - input array for array or object that can be change to a array
 * - [] for other
 *
 * @param {any} initialValue
 *              Value to be validated
 *
 * @return {Array}
 *         input array or [] for wrong input
 *
 * @example
 *        const validatedInitialValue = validateInitialValue(initialValue);
 */
var validateInitialValue = function (initialValue) {
    if (typeof initialValue === 'object' &&
        initialValue !== null &&
        !Array.isArray(initialValue)) {
        console.log('you have passed a object when a array is required. It still may work however. Please pass a array.');
        initialValue = __spreadArrays(initialValue);
    }
    if (!Array.isArray(initialValue)) {
        console.log('you really want to break the validation. Please pass a array as parameter. Defaulting to [].');
        initialValue = [];
    }
    return initialValue;
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
var useSortable = function (items, config) {
    if (config === void 0) { config = {
        bookMarks: [],
        key: '',
        direction: '',
        search: '',
        value: '',
    }; }
    var validatedInitialValue = validateInitialValue(items);
    var _a = useState(config), sortConfig = _a[0], setSortConfig = _a[1];
    var bookMarkList = JSON.parse(window.localStorage.getItem('book-mark') || '[]');
    var sortedItems = useMemo(function () {
        var sortableItems = __spreadArrays(validatedInitialValue);
        if (sortConfig !== null && sortConfig.key !== null) {
            sortableItems.sort(function (a, b) {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        if (sortConfig !== null && sortConfig.search && sortConfig.value) {
            var searchValue_1 = sortConfig.value.toLowerCase();
            sortableItems = sortableItems
                .filter(function (item) {
                var field = item[sortConfig.search];
                if (field === undefined || field === null)
                    return false;
                return String(field).toLowerCase().includes(searchValue_1);
            })
                .sort(function (a, b) {
                var aField = String(a[sortConfig.search]).toLowerCase();
                var bField = String(b[sortConfig.search]).toLowerCase();
                var aIndex = aField.indexOf(searchValue_1);
                var bIndex = bField.indexOf(searchValue_1);
                if (aIndex > bIndex)
                    return 1;
                if (aIndex < bIndex)
                    return -1;
                if (aField > bField)
                    return 1;
                return -1;
            });
        }
        if (sortConfig.bookMarks && sortConfig.bookMarks.length) {
            var uniqueBookMarks_1 = Array.from(new Set(sortConfig.bookMarks));
            sortableItems.sort(function (x, y) {
                var xIndex = uniqueBookMarks_1.indexOf(x.id);
                var yIndex = uniqueBookMarks_1.indexOf(y.id);
                if (xIndex === -1 && yIndex === -1)
                    return 0;
                if (xIndex === -1)
                    return 1;
                if (yIndex === -1)
                    return -1;
                return xIndex - yIndex;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);
    var requestSort = function (key, direction) {
        var newDirection = direction;
        if (!newDirection) {
            if (sortConfig && sortConfig.key === key) {
                newDirection =
                    sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
            }
            else {
                newDirection = sortConfig.direction || 'ascending';
            }
        }
        var params = new URLSearchParams(window.location.search);
        params.set('sort', key.toString());
        params.set('d', newDirection);
        var URL = params.toString().indexOf('null') > 0
            ? "" + window.location.pathname
            : window.location.pathname + "?" + params.toString();
        window.history.replaceState({}, '', URL);
        setSortConfig(__assign(__assign({}, sortConfig), { key: key.toString() && key.toString(), direction: newDirection }));
    };
    var requestSearch = function (search, value) {
        setSortConfig(__assign(__assign({}, sortConfig), { search: search && search.toString(), value: value && value.toString() }));
    };
    var requestBookMark = function (id) {
        setSortConfig(function (prev) {
            var bookMarks = Array.from(new Set(__spreadArrays(prev.bookMarks, [id])));
            window.localStorage.setItem('book-mark', JSON.stringify(bookMarks));
            return __assign(__assign({}, prev), { bookMarks: bookMarks });
        });
    };
    useEffect(function () {
        var params = new URLSearchParams(window.location.search);
        var URLsort = params.get('sort') || '';
        var URLd = params.get('d') || '';
        requestSort(URLsort, URLd);
        setSortConfig(__assign(__assign({}, sortConfig), { key: URLsort, direction: URLd, bookMarks: Array.from(new Set(bookMarkList)) }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return { items: sortedItems, requestSort: requestSort, requestSearch: requestSearch, requestBookMark: requestBookMark };
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

export { useSortable };
//# sourceMappingURL=index.esm.js.map
