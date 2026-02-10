import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecordingControls } from '@/src/presentation/components/meeting/RecordingControls';

describe('RecordingControls', () => {
  it('should show Start button when idle', () => {
    render(
      <RecordingControls status="idle" onStart={vi.fn()} onStop={vi.fn()} onPause={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('should show Stop and Pause buttons when recording', () => {
    render(
      <RecordingControls status="recording" onStart={vi.fn()} onStop={vi.fn()} onPause={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('should show Resume button when paused', () => {
    render(
      <RecordingControls status="paused" onStart={vi.fn()} onStop={vi.fn()} onPause={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  it('should call onStart when Start is clicked', async () => {
    const onStart = vi.fn();
    render(
      <RecordingControls status="idle" onStart={onStart} onStop={vi.fn()} onPause={vi.fn()} />
    );
    await userEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(onStart).toHaveBeenCalled();
  });

  it('should call onStop when Stop is clicked', async () => {
    const onStop = vi.fn();
    render(
      <RecordingControls status="recording" onStart={vi.fn()} onStop={onStop} onPause={vi.fn()} />
    );
    await userEvent.click(screen.getByRole('button', { name: /stop/i }));
    expect(onStop).toHaveBeenCalled();
  });

  it('should not show controls when completed', () => {
    render(
      <RecordingControls status="completed" onStart={vi.fn()} onStop={vi.fn()} onPause={vi.fn()} />
    );
    expect(screen.queryByRole('button', { name: /start/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /stop/i })).not.toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });
});
