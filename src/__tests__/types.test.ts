import { expect, expectTypeOf, it } from 'vitest';

import useSortable, {
  FilterDescriptor,
  ProcessOptions,
  SortDescriptor,
  UseSortableResult,
} from '../index';

interface Row {
  id: number;
  name: string;
}

const rows: ReadonlyArray<Row> = [{ id: 1, name: 'one' }];

const TypeFixture = (): UseSortableResult<Row> => {
  const result = useSortable(rows, {
    sorts: [{ key: 'name' }],
    filters: [{ key: 'id', value: 1 }],
  });
  result.requestSort('name');
  result.requestFilter('id', 1);
  result.requestSort('name', 'ascending', (left, right) => {
    expectTypeOf(left).toEqualTypeOf<string>();
    expectTypeOf(right).toEqualTypeOf<string>();
    return left.localeCompare(right);
  });
  result.requestFilter('id', 1, (field) => {
    expectTypeOf(field).toEqualTypeOf<number>();
    return field > 0;
  });
  // @ts-expect-error keys must exist on the item type
  result.requestSort('missing');
  return result;
};

it('exports strongly typed descriptors and hook results', () => {
  expect(TypeFixture).toBeTypeOf('function');
  expectTypeOf<SortDescriptor<Row>['key']>().toEqualTypeOf<keyof Row>();
  expectTypeOf<FilterDescriptor<Row>['key']>().toEqualTypeOf<keyof Row>();
  expectTypeOf<UseSortableResult<Row>['items']>().toEqualTypeOf<Row[]>();
  expectTypeOf<ProcessOptions<Row>['sorts']>().toMatchTypeOf<
    ReadonlyArray<SortDescriptor<Row>> | undefined
  >();
});
