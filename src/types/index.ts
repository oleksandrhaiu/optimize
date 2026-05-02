// ─── Domain Models ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_color: string;
  theme: string;
  sound_enabled: boolean;
  last_seen_at: string | null;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  type: 'checkbox' | 'numeric';
  unit: string | null;
  icon: string | null;
  order: number;
  goal: number | null;          // target value for numeric habits
  cal_min: number | null;
  cal_max: number | null;
  is_calorie_habit: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  value: string;
  note: string | null;   // optional daily note
  created_at: string;
}

export interface Friendship {
  id: string;
  user_a_id: string;
  user_b_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
}

export interface InviteToken {
  id: string;
  creator_user_id: string;
  token: string;
  used: boolean;
  created_at: string;
}

// ─── Derived / View Models ────────────────────────────────────────────────────

export interface FriendWithData {
  profile: UserProfile;
  habits: Habit[];
  logs: HabitLog[];
  todayScore: number; // 0–100
  weekScores: number[]; // last 7 days [oldest … today]
}

export interface DailyStats {
  date: string;
  completionPct: number;
  calories: number | null;
  isGreenDay: boolean; // completionPct >= 80
}

export interface DashboardStats {
  currentStreak: number;
  bestStreak: number;
  avgCalories: number;
  greenDays: number;
  dailyStats: DailyStats[];
  weekdayAvg: number[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type CalorieZone = 'green' | 'amber' | 'red' | 'none';

export interface MonthYear {
  month: number; // 0-indexed (0 = January)
  year: number;
}
