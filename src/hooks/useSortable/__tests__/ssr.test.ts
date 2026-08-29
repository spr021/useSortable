// @vitest-environment node

import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { useSortable } from '../index';

describe('useSortable server rendering', () => {
  it('does not access browser-only globals while rendering', () => {
    const Example = (): React.ReactElement => {
      const { items } = useSortable([{ id: 2 }, { id: 1 }], {
        key: 'id',
        direction: 'ascending',
      });
      return React.createElement('span', null, items.map(({ id }) => id).join(','));
    };

    expect(renderToString(React.createElement(Example))).toContain('1,2');
  });
});
