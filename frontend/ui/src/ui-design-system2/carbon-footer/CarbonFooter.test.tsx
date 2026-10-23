import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CarbonFooter } from './CarbonFooter';

describe('CarbonFooter', () => {
  it('renders 5-column layout with brand, section headings, and bottom bar', () => {
    render(<CarbonFooter />);

    expect(screen.getByTestId('carbon-footer')).toBeDefined();
    expect(screen.getByTestId('carbon-brand')).toBeDefined();
    expect(screen.getByText(/TOOLS FOR RIGHT NOW/i)).toBeDefined();
    expect(screen.getByText('GRADE LISTS')).toBeDefined();
    expect(screen.getByText('STATIONERY')).toBeDefined();
    expect(screen.getByText('NAVIGATION')).toBeDefined();
    expect(screen.getByText('STUDENT DESK')).toBeDefined();
    expect(screen.getByText(/CAMPUS HUBS: PALO ALTO • BERKELEY • CAMBRIDGE/i)).toBeDefined();
    expect(screen.getByText(/© 2026 NOTD° PAPER & SUPPLY STUDIO/i)).toBeDefined();
  });

  it('triggers onSelectTrackPreset when grade preset links are clicked', () => {
    const onSelectTrackPreset = vi.fn();
    render(<CarbonFooter onSelectTrackPreset={onSelectTrackPreset} />);

    fireEvent.click(screen.getByRole('button', { name: /HIGH SCHOOL CORE/i }));
    expect(onSelectTrackPreset).toHaveBeenCalledWith('highschool');

    fireEvent.click(screen.getByRole('button', { name: /UNIVERSITY STEM/i }));
    expect(onSelectTrackPreset).toHaveBeenCalledWith('stem');

    fireEvent.click(screen.getByRole('button', { name: /ARCH & DESIGN STUDIO/i }));
    expect(onSelectTrackPreset).toHaveBeenCalledWith('studio');

    fireEvent.click(screen.getByRole('button', { name: /COMPLETE MASTER KIT/i }));
    expect(onSelectTrackPreset).toHaveBeenCalledWith('all');
  });

  it('triggers onSelectCategory when stationery category links are clicked', () => {
    const onSelectCategory = vi.fn();
    render(<CarbonFooter onSelectCategory={onSelectCategory} />);

    fireEvent.click(screen.getByRole('button', { name: /160GSM DOT JOURNALS/i }));
    expect(onSelectCategory).toHaveBeenCalledWith('PAPER');

    fireEvent.click(screen.getByRole('button', { name: /0.5MM ARCHIVAL PENS/i }));
    expect(onSelectCategory).toHaveBeenCalledWith('WRITING');

    fireEvent.click(screen.getByRole('button', { name: /ALUMINUM SCALES/i }));
    expect(onSelectCategory).toHaveBeenCalledWith('DRAFTING');
  });

  it('triggers onNavigateSection and onOpenPromptBlueprint', () => {
    const onNavigateSection = vi.fn();
    const onOpenPromptBlueprint = vi.fn();

    render(
      <CarbonFooter
        onNavigateSection={onNavigateSection}
        onOpenPromptBlueprint={onOpenPromptBlueprint}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /3D DESK STAGE/i }));
    expect(onNavigateSection).toHaveBeenCalledWith('hero');

    fireEvent.click(screen.getByRole('button', { name: /STUDY CLOCK DIAL/i }));
    expect(onNavigateSection).toHaveBeenCalledWith('study-clock');

    fireEvent.click(screen.getByRole('button', { name: /ZERO-G 3D FIELD/i }));
    expect(onNavigateSection).toHaveBeenCalledWith('zero-gravity');

    fireEvent.click(screen.getByRole('button', { name: /PROMPT BLUEPRINT ✦/i }));
    expect(onOpenPromptBlueprint).toHaveBeenCalled();
  });
});
