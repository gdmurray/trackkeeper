export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      "Deleted Songs": {
        Row: {
          created_at: string
          id: number
          playlist_id: number
          removed_at: string
          track_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          playlist_id: number
          removed_at: string
          track_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          playlist_id?: number
          removed_at?: string
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Deleted Songs_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "Tracked Playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      "Library Snapshots": {
        Row: {
          created_at: string
          id: number
          playlist_id: number | null
          snapshot_id: string | null
          song_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          playlist_id?: number | null
          snapshot_id?: string | null
          song_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          playlist_id?: number | null
          snapshot_id?: string | null
          song_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Library Snapshots_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "Tracked Playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      "Spotify Access": {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: number
          refresh_token: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: number
          refresh_token: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: number
          refresh_token?: string
          user_id?: string
        }
        Relationships: []
      }
      "Tracked Playlists": {
        Row: {
          active: boolean
          created_at: string
          id: number
          liked_songs: boolean
          playlist_id: string
          playlist_name: string
          public: boolean
          removed_playlist_id: string | null
          removed_playlist_name: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: number
          liked_songs?: boolean
          playlist_id: string
          playlist_name: string
          public?: boolean
          removed_playlist_id?: string | null
          removed_playlist_name?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: number
          liked_songs?: boolean
          playlist_id?: string
          playlist_name?: string
          public?: boolean
          removed_playlist_id?: string | null
          removed_playlist_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      "User Settings": {
        Row: {
          created_at: string
          id: number
          playlist_persistence: string
          snapshots_enabled: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          playlist_persistence?: string
          snapshots_enabled?: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          playlist_persistence?: string
          snapshots_enabled?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
