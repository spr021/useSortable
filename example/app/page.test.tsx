import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import Home from './page';

describe('Sort Lab showcase', () => {
  afterEach(cleanup);

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('searches across fields and combines filters', async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.type(screen.getByPlaceholderText('Search projects, owners…'), 'Mina');
    expect(screen.getByText('Atlas search')).toBeInTheDocument();
    expect(screen.queryByText('Prism metrics')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'Active');
    await user.selectOptions(screen.getByLabelText('Filter by minimum score'), '90');

    expect(screen.getAllByRole('row')).toHaveLength(5);
    expect(screen.getByText('Northstar AI')).toBeInTheDocument();
    expect(screen.queryByText('Signal studio')).not.toBeInTheDocument();
  });

  it('sorts the table in both directions and applies the priority preset', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const scoreSort = screen.getByRole('button', { name: /^Score/ });
    await user.click(scoreSort);
    expect(within(screen.getAllByRole('row')[1]).getByText('Orbit billing')).toBeInTheDocument();

    await user.click(scoreSort);
    expect(within(screen.getAllByRole('row')[1]).getByText('Prism metrics')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Priority' }));
    expect(within(screen.getAllByRole('row')[1]).getByText('Prism metrics')).toBeInTheDocument();
    expect(screen.getByText('sort: status ↑ · score ↓')).toBeInTheDocument();
  });

  it('pins records, persists the bookmark, clears it, and resets the view', async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole('button', { name: 'Pin Atlas search' }));
    expect(screen.getByRole('button', { name: 'Unpin Atlas search' })).toHaveAttribute('aria-pressed', 'true');
    expect(JSON.parse(window.localStorage.getItem('use-sortable-showcase-bookmarks') ?? '[]')).toEqual([101]);

    await user.click(screen.getByRole('button', { name: 'Clear 1 pinned' }));
    expect(screen.getByRole('button', { name: 'Pin Atlas search' })).toHaveAttribute('aria-pressed', 'false');

    await user.selectOptions(screen.getByLabelText('Filter by category'), 'Research');
    await user.click(screen.getByRole('button', { name: 'Reset view' }));
    expect(screen.getAllByRole('row')).toHaveLength(11);
    expect(screen.getByLabelText('Filter by category')).toHaveValue('');
  });
});
