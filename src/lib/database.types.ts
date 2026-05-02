export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      friendships: {
        Row: {
          created_at: string
          id: string
          status: string
          user_a_id: string
          user_b_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          user_a_id: string
          user_b_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          user_a_id?: string
          user_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_user_a_id_fkey"
            columns: ["user_a_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_b_id_fkey"
            columns: ["user_b_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      habit_logs: {
        Row: {
          created_at: string
          date: string
          habit_id: string
          id: string
          note: string | null
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string
          date: string
          habit_id: string
          id?: string
          note?: string | null
          user_id: string
          value: string
        }
        Update: {
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
          note?: string | null
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      habits: {
        Row: {
          cal_max: number | null
          cal_min: number | null
          created_at: string
          goal: number | null
          unit: string | null
          icon: string | null
          id: string
          is_calorie_habit: boolean
          name: string
          order: number
          type: string
          user_id: string
        }
        Insert: {
          cal_max?: number | null
          cal_min?: number | null
          created_at?: string
          goal?: number | null
          unit?: string | null
          icon?: string | null
          id?: string
          is_calorie_habit?: boolean
          name: string
          order?: number
          type: string
          user_id: string
        }
        Update: {
          cal_max?: number | null
          cal_min?: number | null
          created_at?: string
          goal?: number | null
          unit?: string | null
          icon?: string | null
          id?: string
          is_calorie_habit?: boolean
          name?: string
          order?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invite_tokens: {
        Row: {
          created_at: string
          creator_user_id: string
          id: string
          token: string
          used: boolean
        }
        Insert: {
          created_at?: string
          creator_user_id: string
          id?: string
          token: string
          used?: boolean
        }
        Update: {
          created_at?: string
          creator_user_id?: string
          id?: string
          token?: string
          used?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "invite_tokens_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_color: string
          created_at: string
          email: string
          id: string
          last_seen_at: string | null
          username: string
          theme: string
          sound_enabled: boolean
        }
        Insert: {
          avatar_color?: string
          created_at?: string
          email: string
          id: string
          last_seen_at?: string | null
          username: string
          theme?: string
          sound_enabled?: boolean
        }
        Update: {
          avatar_color?: string
          created_at?: string
          email?: string
          id?: string
          last_seen_at?: string | null
          username?: string
          theme?: string
          sound_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      are_friends: {
        Args: {
          uid_a: string
          uid_b: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
