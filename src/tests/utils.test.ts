import { describe, it, expect } from 'vitest';
import {
  formatDate,
  parseDate,
  dateKey,
  daysInMonth,
  getDaysArray,
  lastNDates,
  getDatesInRange,
  weekdayIndex,
  weekdayLabel,
  getInitials,
  clx,
} from '@/lib/utils';

// ─── formatDate ──────────────────────────────────────────────────────────────
describe('formatDate', () => {
  it('formats a date correctly', () => {
    expect(formatDate(new Date(2024, 0, 5))).toBe('2024-01-05');
  });
  it('pads single digit month and day', () => {
    expect(formatDate(new Date(2024, 8, 3))).toBe('2024-09-03');
  });
  it('handles last day of year', () => {
    expect(formatDate(new Date(2023, 11, 31))).toBe('2023-12-31');
  });
});

// ─── parseDate ───────────────────────────────────────────────────────────────
describe('parseDate', () => {
  it('parses YYYY-MM-DD without UTC offset', () => {
    const d = parseDate('2024-06-15');
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(5); // 0-indexed
    expect(d.getDate()).toBe(15);
  });
  it('round-trips with formatDate', () => {
    expect(formatDate(parseDate('2024-03-20'))).toBe('2024-03-20');
  });
});

// ─── dateKey ─────────────────────────────────────────────────────────────────
describe('dateKey', () => {
  it('produces correct key for Jan (month=0)', () => {
    expect(dateKey(2024, 0, 5)).toBe('2024-01-05');
  });
  it('produces correct key for Dec (month=11)', () => {
    expect(dateKey(2024, 11, 31)).toBe('2024-12-31');
  });
  it('pads single digits', () => {
    expect(dateKey(2024, 2, 7)).toBe('2024-03-07');
  });
});

// ─── daysInMonth ──────────────────────────────────────────────────────────────
describe('daysInMonth', () => {
  it('returns 31 for January', () => expect(daysInMonth(0, 2024)).toBe(31));
  it('returns 28 for Feb non-leap', () => expect(daysInMonth(1, 2023)).toBe(28));
  it('returns 29 for Feb leap year', () => expect(daysInMonth(1, 2024)).toBe(29));
  it('returns 30 for April', () => expect(daysInMonth(3, 2024)).toBe(30));
  it('returns 31 for December', () => expect(daysInMonth(11, 2024)).toBe(31));
});

// ─── getDaysArray ────────────────────────────────────────────────────────────
describe('getDaysArray', () => {
  it('returns [1..31] for January', () => {
    const days = getDaysArray(0, 2024);
    expect(days.length).toBe(31);
    expect(days[0]).toBe(1);
    expect(days[30]).toBe(31);
  });
  it('returns [1..29] for Feb 2024 (leap)', () => {
    const days = getDaysArray(1, 2024);
    expect(days.length).toBe(29);
  });
});

// ─── lastNDates ───────────────────────────────────────────────────────────────
describe('lastNDates', () => {
  it('returns N dates', () => {
    expect(lastNDates(7)).toHaveLength(7);
  });
  it('ends with today', () => {
    const dates = lastNDates(7);
    const today = formatDate(new Date());
    expect(dates[dates.length - 1]).toBe(today);
  });
  it('dates are in ascending order', () => {
    const dates = lastNDates(7);
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i] > dates[i - 1]).toBe(true);
    }
  });
  it('returns 1 date when n=1', () => {
    expect(lastNDates(1)).toHaveLength(1);
  });
});

// ─── getDatesInRange ──────────────────────────────────────────────────────────
describe('getDatesInRange', () => {
  it('returns correct range', () => {
    const range = getDatesInRange('2024-01-01', '2024-01-03');
    expect(range).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
  });
  it('returns single date for same start/end', () => {
    expect(getDatesInRange('2024-06-01', '2024-06-01')).toEqual(['2024-06-01']);
  });
  it('crosses month boundary', () => {
    const range = getDatesInRange('2024-01-30', '2024-02-02');
    expect(range).toEqual(['2024-01-30', '2024-01-31', '2024-02-01', '2024-02-02']);
  });
});

// ─── weekdayIndex ─────────────────────────────────────────────────────────────
describe('weekdayLabel', () => {
  it('returns Mo for 2024-01-01', () => expect(weekdayLabel('2024-01-01')).toBe('Mo'));
  it('returns Su for 2024-01-07', () => expect(weekdayLabel('2024-01-07')).toBe('Su'));
});

describe('weekdayIndex', () => {
  // 2024-01-01 is Monday
  it('Monday = 0', () => expect(weekdayIndex(new Date(2024, 0, 1))).toBe(0));
  // 2024-01-07 is Sunday
  it('Sunday = 6', () => expect(weekdayIndex(new Date(2024, 0, 7))).toBe(6));
  // 2024-01-06 is Saturday
  it('Saturday = 5', () => expect(weekdayIndex(new Date(2024, 0, 6))).toBe(5));
});

// ─── getInitials ──────────────────────────────────────────────────────────────
describe('getInitials', () => {
  it('returns first 2 chars uppercase', () => {
    expect(getInitials('johndoe')).toBe('JO');
  });
  it('handles short name', () => {
    expect(getInitials('a')).toBe('A');
  });
  it('handles already uppercase', () => {
    expect(getInitials('ADMIN')).toBe('AD');
  });
});

// ─── clx ──────────────────────────────────────────────────────────────────────
describe('clx', () => {
  it('joins truthy classes', () => {
    expect(clx('foo', 'bar')).toBe('foo bar');
  });
  it('filters falsy values', () => {
    expect(clx('foo', false, null, undefined, 'bar')).toBe('foo bar');
  });
  it('handles empty input', () => {
    expect(clx()).toBe('');
  });
  it('handles single class', () => {
    expect(clx('only')).toBe('only');
  });
});
