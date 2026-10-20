import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StudioHeader } from './StudioHeader';

describe('StudioHeader', () => {
  it('renders brand mark, item count, and nav triggers', () => {
    const onOpenPromptBlueprint = vi.fn();
    const onOpenSupplyList = vi.fn();
    const onNavigateSection = vi.fn();

    render(
      <StudioHeader
        totalItemsCount={5}
        onOpenPromptBlueprint={onOpenPromptBlueprint}
        onOpenSupplyList={onOpenSupplyList}
        onNavigateSection={onNavigateSection}
      />,
    );

    expect(screen.getByText('notd°')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /PROMPT BLUEPRINT/i }));
    expect(onOpenPromptBlueprint).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /SUPPLY LIST/i }));
    expect(onOpenSupplyList).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /STUDY CLOCK/i }));
    expect(onNavigateSection).toHaveBeenCalledWith('study-clock');
  });
});
