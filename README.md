# use-sortable

sort & search & book-mark functionality with React [Hooks](https://reactjs.org/docs/hooks-intro.html).

<p>
  <a target="_blank" href="https://www.npmjs.com/package/use-sortable" title="NPM version"><img alt="npm" src="https://img.shields.io/npm/v/use-sortable"></a>
  <a target="_blank" href="http://makeapullrequest.com" title="PRs Welcome"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

## Installation

npm
```sh
npm i use-sortable
```

yarn
```sh
yarn add use-sortable
```

## Usage

[![Edit use-sortable](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/usesortable-7irvg)

```js
import useSortable from "use-sortable";
import Data from "data.json"

function Table() {
  const { items, requestSort, requestSearch, requestBookMark } = useSortable(Data)

  return (
    <>
      <div>
        <div>
          <label>name</label>
          <input 
            onChange={(e) => requestSearch(e.target.name, e.target.value)} 
            name="name"
          />
        </div>
        <div>
          <label>date</label>
          <input 
            onChange={(e) => requestSearch(e.target.name, e.target.value)}
            name="date" 
          />
        </div>
        <div>
          <label>ad name</label>
          <input 
            onChange={(e) => requestSearch(e.target.name, e.target.value)}
            name="title"
          />
        </div>
        <div>
          <label>field</label>
          <select 
            onChange={(e) => requestSearch(e.target.name, e.target.value)}
            name="field"
          >
            <option value="title">title</option>
            <option value="price">price</option>
          </select>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <td onClick={() => requestSort('name')}>
              name
            </td>
            <td onClick={() => requestSort('date')}>
              date
            </td>
            <td onClick={() => requestSort('title')}>
              ad name
            </td>
            <td onClick={() => requestSort('field')}>
              field
            </td>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => 
            <tr onClick={() => requestBookMark(item.id)} key={item.id}>
              <td>{item.name}</td>
              <td>{item.date}</td>
              <td>{item.title}</td>
              <td>{item.field}</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  )
}

export default Table
```

## API

### useSortable

```js
  const [state, actions] = useSortable(initialData)
```

#### state

##### Type: `Array`

| Key     |  Type   | Description        |
| ------- | :-----: | ------------------ |
| items    | `Array` | the result Array.    |

#### actions

##### Type: `function`

| Key     |    Type    | Description                                                                                |
| ------- | :--------: | ------------------------------------------------------------------------------------------ |
| requestSort     | `function` | Assign a new value to `items` sorted by `key` and `direction`.                                                           |
| requestSearch   | `function` | Assign a new value to `items` searched by `search` and `value`.                    |
| requestBookMark    | `function` | BookMark item and set it to of `items` array |

## Related repo

- [spr021/useSortable](https://github.com/spr021/useSortable)

## License

MIT © [spr021](https://github.com/spr021)
