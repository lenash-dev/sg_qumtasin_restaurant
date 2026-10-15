/**
 * Tipos de la base de datos (formato de `supabase gen types typescript`).
 *
 * Escritos a mano a partir de supabase/migrations. Cuando el proyecto de
 * Supabase exista, se pueden regenerar con:
 *   pnpm dlx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "13" };
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string; role: Database["public"]["Enums"]["app_role"]; created_at: string };
        Insert: { id: string; full_name?: string; role?: Database["public"]["Enums"]["app_role"]; created_at?: string };
        Update: { id?: string; full_name?: string; role?: Database["public"]["Enums"]["app_role"]; created_at?: string };
        Relationships: [];
      };
      menu_categories: {
        Row: {
          id: string;
          service: Database["public"]["Enums"]["meal_service"];
          name: string;
          description: string | null;
          position: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          service: Database["public"]["Enums"]["meal_service"];
          name: string;
          description?: string | null;
          position?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          service?: Database["public"]["Enums"]["meal_service"];
          name?: string;
          description?: string | null;
          position?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      dishes: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          tags: string[];
          featured: boolean;
          image_url: string | null;
          active: boolean;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          price: number;
          tags?: string[];
          featured?: boolean;
          image_url?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          tags?: string[];
          featured?: boolean;
          image_url?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_menus: {
        Row: {
          id: string;
          menu_date: string;
          service: Database["public"]["Enums"]["meal_service"];
          published: boolean;
          notes: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          menu_date: string;
          service: Database["public"]["Enums"]["meal_service"];
          published?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          menu_date?: string;
          service?: Database["public"]["Enums"]["meal_service"];
          published?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_menu_sections: {
        Row: {
          id: string;
          daily_menu_id: string;
          category_id: string;
          price: number | null;
          note: string | null;
          position: number;
        };
        Insert: {
          id?: string;
          daily_menu_id: string;
          category_id: string;
          price?: number | null;
          note?: string | null;
          position?: number;
        };
        Update: {
          id?: string;
          daily_menu_id?: string;
          category_id?: string;
          price?: number | null;
          note?: string | null;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "daily_menu_sections_daily_menu_id_fkey";
            columns: ["daily_menu_id"];
            isOneToOne: false;
            referencedRelation: "daily_menus";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "daily_menu_sections_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "menu_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_menu_items: {
        Row: {
          id: string;
          section_id: string;
          dish_id: string;
          price: number | null;
          sold_out: boolean;
          position: number;
        };
        Insert: {
          id?: string;
          section_id: string;
          dish_id: string;
          price?: number | null;
          sold_out?: boolean;
          position?: number;
        };
        Update: {
          id?: string;
          section_id?: string;
          dish_id?: string;
          price?: number | null;
          sold_out?: boolean;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "daily_menu_items_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "daily_menu_sections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "daily_menu_items_dish_id_fkey";
            columns: ["dish_id"];
            isOneToOne: false;
            referencedRelation: "dishes";
            referencedColumns: ["id"];
          },
        ];
      };
      promotions: {
        Row: {
          id: string;
          title: string;
          kicker: string;
          description: string;
          price: number | null;
          price_label: string | null;
          days: number[] | null;
          time_label: string | null;
          includes: string[];
          terms: string | null;
          highlight: boolean;
          active: boolean;
          starts_on: string | null;
          ends_on: string | null;
          position: number;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          kicker?: string;
          description?: string;
          price?: number | null;
          price_label?: string | null;
          days?: number[] | null;
          time_label?: string | null;
          includes?: string[];
          terms?: string | null;
          highlight?: boolean;
          active?: boolean;
          starts_on?: string | null;
          ends_on?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          kicker?: string;
          description?: string;
          price?: number | null;
          price_label?: string | null;
          days?: number[] | null;
          time_label?: string | null;
          includes?: string[];
          terms?: string | null;
          highlight?: boolean;
          active?: boolean;
          starts_on?: string | null;
          ends_on?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      restaurant_tables: {
        Row: { id: string; label: string; capacity: number; zone: string | null; active: boolean; position: number; created_at: string };
        Insert: {
          id?: string;
          label: string;
          capacity: number;
          zone?: string | null;
          active?: boolean;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          capacity?: number;
          zone?: string | null;
          active?: boolean;
          position?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      reservations: {
        Row: {
          id: string;
          customer_name: string;
          phone: string;
          email: string | null;
          reservation_date: string;
          reservation_time: string;
          party_size: number;
          table_id: string | null;
          status: Database["public"]["Enums"]["reservation_status"];
          source: Database["public"]["Enums"]["reservation_source"];
          notes: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          phone: string;
          email?: string | null;
          reservation_date: string;
          reservation_time: string;
          party_size: number;
          table_id?: string | null;
          status?: Database["public"]["Enums"]["reservation_status"];
          source?: Database["public"]["Enums"]["reservation_source"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          phone?: string;
          email?: string | null;
          reservation_date?: string;
          reservation_time?: string;
          party_size?: number;
          table_id?: string | null;
          status?: Database["public"]["Enums"]["reservation_status"];
          source?: Database["public"]["Enums"]["reservation_source"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reservations_table_id_fkey";
            columns: ["table_id"];
            isOneToOne: false;
            referencedRelation: "restaurant_tables";
            referencedColumns: ["id"];
          },
        ];
      };
      agreement_requests: {
        Row: {
          id: string;
          company: string;
          contact_name: string;
          email: string;
          phone: string;
          service: string;
          plan: Database["public"]["Enums"]["request_plan"];
          people: number;
          start_date: string | null;
          message: string | null;
          status: Database["public"]["Enums"]["request_status"];
          internal_notes: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company: string;
          contact_name: string;
          email: string;
          phone: string;
          service: string;
          plan?: Database["public"]["Enums"]["request_plan"];
          people: number;
          start_date?: string | null;
          message?: string | null;
          status?: Database["public"]["Enums"]["request_status"];
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company?: string;
          contact_name?: string;
          email?: string;
          phone?: string;
          service?: string;
          plan?: Database["public"]["Enums"]["request_plan"];
          people?: number;
          start_date?: string | null;
          message?: string | null;
          status?: Database["public"]["Enums"]["request_status"];
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agreements: {
        Row: {
          id: string;
          request_id: string | null;
          company: string;
          contact_name: string;
          email: string | null;
          phone: string | null;
          period: Database["public"]["Enums"]["agreement_period"];
          people: number;
          price_per_person: number;
          services: Database["public"]["Enums"]["meal_service"][];
          starts_on: string;
          ends_on: string | null;
          status: Database["public"]["Enums"]["agreement_status"];
          notes: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id?: string | null;
          company: string;
          contact_name: string;
          email?: string | null;
          phone?: string | null;
          period: Database["public"]["Enums"]["agreement_period"];
          people: number;
          price_per_person: number;
          services?: Database["public"]["Enums"]["meal_service"][];
          starts_on: string;
          ends_on?: string | null;
          status?: Database["public"]["Enums"]["agreement_status"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string | null;
          company?: string;
          contact_name?: string;
          email?: string | null;
          phone?: string | null;
          period?: Database["public"]["Enums"]["agreement_period"];
          people?: number;
          price_per_person?: number;
          services?: Database["public"]["Enums"]["meal_service"][];
          starts_on?: string;
          ends_on?: string | null;
          status?: Database["public"]["Enums"]["agreement_status"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agreements_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "agreement_requests";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      copy_daily_menu: {
        Args: { p_from: string; p_to: string; p_service: Database["public"]["Enums"]["meal_service"] };
        Returns: string;
      };
      is_admin: { Args: never; Returns: boolean };
      is_staff: { Args: never; Returns: boolean };
      today_la_paz: { Args: never; Returns: string };
    };
    Enums: {
      app_role: "admin" | "staff";
      meal_service: "desayuno" | "almuerzo" | "cena";
      reservation_status: "pendiente" | "confirmada" | "sentada" | "completada" | "cancelada" | "no_asistio";
      reservation_source: "web" | "telefono" | "whatsapp" | "local";
      request_plan: "semanal" | "mensual" | "evento";
      request_status: "nueva" | "contactada" | "aprobada" | "rechazada";
      agreement_period: "semanal" | "mensual";
      agreement_status: "activo" | "pausado" | "finalizado";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
