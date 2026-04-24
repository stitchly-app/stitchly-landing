export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id: string | null
          created_at: string
          entity: Database["public"]["Enums"]["audit_entity"]
          id: string
          org_id: string | null
          payload_json: Json | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          created_at?: string
          entity: Database["public"]["Enums"]["audit_entity"]
          id?: string
          org_id?: string | null
          payload_json?: Json | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          created_at?: string
          entity?: Database["public"]["Enums"]["audit_entity"]
          id?: string
          org_id?: string | null
          payload_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_exports_template: {
        Row: {
          aspect_ratio: string | null
          completed_at: string | null
          created_at: string | null
          format: string | null
          id: string
          output_urls: Json | null
          project_template_id: string | null
          resolution: string | null
          status: Database["public"]["Enums"]["export_status"] | null
          video_template_id: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          completed_at?: string | null
          created_at?: string | null
          format?: string | null
          id?: string
          output_urls?: Json | null
          project_template_id?: string | null
          resolution?: string | null
          status?: Database["public"]["Enums"]["export_status"] | null
          video_template_id?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          completed_at?: string | null
          created_at?: string | null
          format?: string | null
          id?: string
          output_urls?: Json | null
          project_template_id?: string | null
          resolution?: string | null
          status?: Database["public"]["Enums"]["export_status"] | null
          video_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demo_exports_template_project_template_id_fkey"
            columns: ["project_template_id"]
            isOneToOne: false
            referencedRelation: "demo_projects_template"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_exports_template_video_template_id_fkey"
            columns: ["video_template_id"]
            isOneToOne: false
            referencedRelation: "demo_videos_template"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_projects_template: {
        Row: {
          created_at: string | null
          edits_json: Json | null
          format_settings_json: Json | null
          id: string
          name: string
          video_template_id: string | null
        }
        Insert: {
          created_at?: string | null
          edits_json?: Json | null
          format_settings_json?: Json | null
          id?: string
          name: string
          video_template_id?: string | null
        }
        Update: {
          created_at?: string | null
          edits_json?: Json | null
          format_settings_json?: Json | null
          id?: string
          name?: string
          video_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demo_projects_template_video_template_id_fkey"
            columns: ["video_template_id"]
            isOneToOne: false
            referencedRelation: "demo_videos_template"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_videos_template: {
        Row: {
          aspect_ratio: string | null
          created_at: string | null
          duration: number | null
          file_url: string
          id: string
          original_name: string
          resolution: string | null
          size: number | null
          thumbnail_url: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          created_at?: string | null
          duration?: number | null
          file_url: string
          id?: string
          original_name: string
          resolution?: string | null
          size?: number | null
          thumbnail_url?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          created_at?: string | null
          duration?: number | null
          file_url?: string
          id?: string
          original_name?: string
          resolution?: string | null
          size?: number | null
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      exports: {
        Row: {
          aspect_ratio: string | null
          completed_at: string | null
          created_at: string
          format: string
          id: string
          is_visitor: boolean | null
          output_urls: Json | null
          project_id: string
          resolution: string | null
          status: Database["public"]["Enums"]["export_status"]
          video_id: string
          visitor_id: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          completed_at?: string | null
          created_at?: string
          format?: string
          id?: string
          is_visitor?: boolean | null
          output_urls?: Json | null
          project_id: string
          resolution?: string | null
          status?: Database["public"]["Enums"]["export_status"]
          video_id: string
          visitor_id?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          completed_at?: string | null
          created_at?: string
          format?: string
          id?: string
          is_visitor?: boolean | null
          output_urls?: Json | null
          project_id?: string
          resolution?: string | null
          status?: Database["public"]["Enums"]["export_status"]
          video_id?: string
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exports_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          profile_image: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          profile_image?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          profile_image?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          edits_json: Json | null
          format_settings_json: Json | null
          id: string
          is_visitor: boolean | null
          name: string
          updated_at: string
          user_id: string | null
          video_id: string
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          edits_json?: Json | null
          format_settings_json?: Json | null
          id?: string
          is_visitor?: boolean | null
          name: string
          updated_at?: string
          user_id?: string | null
          video_id: string
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          edits_json?: Json | null
          format_settings_json?: Json | null
          id?: string
          is_visitor?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string | null
          video_id?: string
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          brand_name: string
          created_at: string
          id: string
          logo_url: string | null
          storage_limit_gb: number
          updated_at: string
          watermark_text: string
        }
        Insert: {
          brand_name?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          storage_limit_gb?: number
          updated_at?: string
          watermark_text?: string
        }
        Update: {
          brand_name?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          storage_limit_gb?: number
          updated_at?: string
          watermark_text?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          aspect_ratio: string | null
          created_at: string
          duration: number | null
          file_url: string
          id: string
          is_visitor: boolean | null
          org_id: string | null
          original_name: string
          resolution: string | null
          size: number | null
          status: Database["public"]["Enums"]["video_status"]
          thumbnail_url: string | null
          updated_at: string
          user_id: string | null
          visitor_id: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          created_at?: string
          duration?: number | null
          file_url: string
          id?: string
          is_visitor?: boolean | null
          org_id?: string | null
          original_name: string
          resolution?: string | null
          size?: number | null
          status?: Database["public"]["Enums"]["video_status"]
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          created_at?: string
          duration?: number | null
          file_url?: string
          id?: string
          is_visitor?: boolean | null
          org_id?: string | null
          original_name?: string
          resolution?: string | null
          size?: number | null
          status?: Database["public"]["Enums"]["video_status"]
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_old_visitor_content: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_visitor: { Args: { _user_id: string }; Returns: boolean }
      reset_demo_admin_data: { Args: never; Returns: undefined }
      reset_demo_data: { Args: { _user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "visitor" | "user" | "admin"
      audit_action: "created" | "updated" | "deleted" | "exported" | "accessed"
      audit_entity: "video" | "project" | "export" | "user"
      export_status: "pending" | "processing" | "done" | "failed"
      user_status: "active" | "inactive" | "suspended"
      video_status: "uploaded" | "processing" | "processed" | "deleted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["visitor", "user", "admin"],
      audit_action: ["created", "updated", "deleted", "exported", "accessed"],
      audit_entity: ["video", "project", "export", "user"],
      export_status: ["pending", "processing", "done", "failed"],
      user_status: ["active", "inactive", "suspended"],
      video_status: ["uploaded", "processing", "processed", "deleted"],
    },
  },
} as const
