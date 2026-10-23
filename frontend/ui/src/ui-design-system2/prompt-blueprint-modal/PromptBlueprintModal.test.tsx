import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { PromptBlueprintModal, DEFAULT_MASTER_PROMPT } from './PromptBlueprintModal';

describe('PromptBlueprintModal', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('does not render content when open is false', () => {
    render(<PromptBlueprintModal open={false} onOpenChange={() => {}} />);
    expect(screen.queryByTestId('prompt-blueprint-modal')).toBeNull();
  });

  it('renders title, badge, and prompt content when open is true', () => {
    render(<PromptBlueprintModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByTestId('prompt-blueprint-modal')).toBeDefined();
    expect(screen.getByText('GETLAYERS.AI STYLE')).toBeDefined();
    expect(
      screen.getByText(/Master AI Prompt — Cinematic 3D Stationery & Supply List Web App/i),
    ).toBeDefined();
    expect(screen.getByText(/Creative Technologist, WebGL Shader Artist/i)).toBeDefined();
  });

  it('copies prompt text to clipboard and triggers onCopy callback', async () => {
    const onCopy = vi.fn();
    render(<PromptBlueprintModal open={true} onOpenChange={() => {}} onCopy={onCopy} />);

    const copyBtn = screen.getByRole('button', { name: /COPY FULL PROMPT/i });
    fireEvent.click(copyBtn);

    expect(onCopy).toHaveBeenCalledWith(DEFAULT_MASTER_PROMPT);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(DEFAULT_MASTER_PROMPT);

    await waitFor(() => {
      expect(screen.getByText(/✓ COPIED!/i)).toBeDefined();
    });
  });

  it('supports custom prompt text', async () => {
    const customPrompt = 'Custom prompt instruction content';
    render(
      <PromptBlueprintModal open={true} onOpenChange={() => {}} customPromptText={customPrompt} />,
    );

    expect(screen.getByText(customPrompt)).toBeDefined();
    const copyBtn = screen.getByRole('button', { name: /COPY FULL PROMPT/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(customPrompt);
  });

  it('calls onOpenChange(false) when close button is clicked', () => {
    const onOpenChange = vi.fn();
    render(<PromptBlueprintModal open={true} onOpenChange={onOpenChange} />);

    const closeBtn = screen.getByRole('button', { name: /✕ CLOSE/i });
    fireEvent.click(closeBtn);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
