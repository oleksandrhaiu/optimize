import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';

describe('CustomCheckbox', () => {
  it('renders unchecked by default style', () => {
    const { container } = render(
      <CustomCheckbox checked={false} onChange={() => {}} />
    );
    const el = container.firstChild as HTMLElement;
    expect(el).toBeTruthy();
    // unchecked: no gradient background
    expect(el.getAttribute('aria-checked')).toBe('false');
  });

  it('renders checked state', () => {
    const { container } = render(
      <CustomCheckbox checked={true} onChange={() => {}} />
    );
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('aria-checked')).toBe('true');
    // checked: has inline background gradient (emerald)
    expect(el.style.background).toContain('linear-gradient');
  });

  it('calls onChange with true when clicked while unchecked', () => {
    let value: boolean | null = null;
    const { container } = render(
      <CustomCheckbox checked={false} onChange={v => { value = v; }} />
    );
    fireEvent.click(container.firstChild as HTMLElement);
    expect(value).toBe(true);
  });

  it('calls onChange with false when clicked while checked', () => {
    let value: boolean | null = null;
    const { container } = render(
      <CustomCheckbox checked={true} onChange={v => { value = v; }} />
    );
    fireEvent.click(container.firstChild as HTMLElement);
    expect(value).toBe(false);
  });

  it('does not call onChange when disabled', () => {
    let called = false;
    const { container } = render(
      <CustomCheckbox checked={false} onChange={() => { called = true; }} disabled />
    );
    fireEvent.click(container.firstChild as HTMLElement);
    expect(called).toBe(false);
  });

  it('calls onChange on Enter key', () => {
    let value: boolean | null = null;
    const { container } = render(
      <CustomCheckbox checked={false} onChange={v => { value = v; }} />
    );
    fireEvent.keyDown(container.firstChild as HTMLElement, { key: 'Enter' });
    expect(value).toBe(true);
  });

  it('calls onChange on Space key', () => {
    let value: boolean | null = null;
    const { container } = render(
      <CustomCheckbox checked={false} onChange={v => { value = v; }} />
    );
    fireEvent.keyDown(container.firstChild as HTMLElement, { key: ' ' });
    expect(value).toBe(true);
  });

  it('shows checkmark SVG when checked', () => {
    const { container } = render(
      <CustomCheckbox checked={true} onChange={() => {}} />
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('has tabIndex=0 when enabled', () => {
    const { container } = render(
      <CustomCheckbox checked={false} onChange={() => {}} />
    );
    expect((container.firstChild as HTMLElement).tabIndex).toBe(0);
  });

  it('has tabIndex=-1 when disabled', () => {
    const { container } = render(
      <CustomCheckbox checked={false} onChange={() => {}} disabled />
    );
    expect((container.firstChild as HTMLElement).tabIndex).toBe(-1);
  });
});
