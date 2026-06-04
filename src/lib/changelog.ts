// ─── Changelog data ──────────────────────────────────────────────────────────
// Add new entries at the TOP. The latest entry is shown in the "What's New" modal.

export interface ChangelogEntry {
  version: string;
  date: string;        // ISO YYYY-MM-DD
  title: string;
  emoji: string;
  features: { icon: string; text: string }[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.3.0',
    date: '2024-06-04',
    title: 'Streaks, Recovery & Smarter Tracker',
    emoji: '🔥',
    features: [
      { icon: '🔥', text: 'Per-habit streaks on Dashboard — see each habit\'s personal best' },
      { icon: '💪', text: 'Recovery Mode — after a break, track your 3-day comeback' },
      { icon: '👆', text: 'Tap a habit name to toggle it instantly (no more popup)' },
      { icon: '🔒', text: 'Private habits now truly hidden from friends' },
      { icon: '⚡', text: 'Friends page loads 5× faster with batch queries' },
    ],
  },
  {
    version: '1.2.0',
    date: '2024-06-04',
    title: 'Bug Fixes & Polishing',
    emoji: '🛠',
    features: [
      { icon: '🔔', text: 'Toast notifications when a habit save fails' },
      { icon: '📅', text: 'Dashboard "All time" now starts from your first habit' },
      { icon: '📊', text: 'Streak on friends\' profiles matches the main tracker' },
      { icon: '➡️', text: 'Next-month button disabled on current month' },
    ],
  },
  {
    version: '1.1.0',
    date: '2024-05-01',
    title: 'Friends & Social',
    emoji: '👥',
    features: [
      { icon: '🔗', text: 'Invite friends via link' },
      { icon: '👤', text: 'View friends\' habit progress in real-time' },
      { icon: '🟢', text: 'Online presence indicator' },
    ],
  },
  {
    version: '1.0.0',
    date: '2024-04-01',
    title: 'Launch 🎉',
    emoji: '🚀',
    features: [
      { icon: '✅', text: 'Habit tracker with daily logs' },
      { icon: '📈', text: 'Dashboard with streaks and heatmap' },
      { icon: '🏆', text: 'Streak shields and milestones' },
    ],
  },
];

export const LATEST_VERSION = CHANGELOG[0].version;
export const STORAGE_KEY = 'lumina.seenVersion';

export function hasUnseenUpdate(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== LATEST_VERSION;
}

export function markAsSeen(): void {
  localStorage.setItem(STORAGE_KEY, LATEST_VERSION);
}
