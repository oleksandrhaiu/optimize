import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '@/components/ui/Avatar';

describe('Avatar', () => {
  it('renders initials from username', () => {
    const { container } = render(<Avatar username="johndoe" color="#00C896" />);
    expect(container.textContent).toContain('JO');
  });

  it('renders uppercase initials', () => {
    const { container } = render(<Avatar username="alex" color="#8B5CF6" />);
    expect(container.textContent).toContain('AL');
  });

  it('applies correct size class for sm', () => {
    const { container } = render(<Avatar username="test" color="#fff" size="sm" />);
    const inner = container.firstChild?.firstChild as HTMLElement;
    expect(inner.className).toContain('w-8');
  });

  it('applies correct size class for xl', () => {
    const { container } = render(<Avatar username="test" color="#fff" size="xl" />);
    const inner = container.firstChild?.firstChild as HTMLElement;
    expect(inner.className).toContain('w-20');
  });

  it('shows online dot when online=true', () => {
    const { container } = render(
      <Avatar username="test" color="#fff" online={true} />
    );
    // Should have at least 2 children: avatar div + online indicator
    expect(container.firstChild?.childNodes.length).toBeGreaterThanOrEqual(2);
  });

  it('shows offline dot when online=false', () => {
    const { container } = render(
      <Avatar username="test" color="#fff" online={false} />
    );
    const dots = container.querySelectorAll('span');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('does not show online dot when online prop absent', () => {
    const { container } = render(<Avatar username="test" color="#fff" />);
    // Only the avatar inner div, no online span
    expect(container.firstChild?.childNodes.length).toBe(1);
  });

  it('applies custom className', () => {
    const { container } = render(
      <Avatar username="test" color="#fff" className="my-custom" />
    );
    expect((container.firstChild as HTMLElement).className).toContain('my-custom');
  });
});
