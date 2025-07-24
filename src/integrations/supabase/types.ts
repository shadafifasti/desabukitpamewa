export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      aparatur_desa: {
        Row: {
          created_at: string
          foto_url: string | null
          id: string
          jabatan: string
          nama: string
        }
        Insert: {
          created_at?: string
          foto_url?: string | null
          id?: string
          jabatan: string
          nama: string
        }
        Update: {
          created_at?: string
          foto_url?: string | null
          id?: string
          jabatan?: string
          nama?: string
        }
        Relationships: []
      }
      berita: {
        Row: {
          created_at: string
          gambar_url: string | null
          id: string
          isi: string | null
          judul: string
          tanggal: string
        }
        Insert: {
          created_at?: string
          gambar_url?: string | null
          id?: string
          isi?: string | null
          judul: string
          tanggal: string
        }
        Update: {
          created_at?: string
          gambar_url?: string | null
          id?: string
          isi?: string | null
          judul?: string
          tanggal?: string
        }
        Relationships: []
      }
      data_statistik: {
        Row: {
          created_at: string
          deskripsi: string | null
          gambar_url: string | null
          id: string
          judul: string
          kategori: Database["public"]["Enums"]["statistik_kategori"]
          tahun: number
          tanggal: string
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          gambar_url?: string | null
          id?: string
          judul: string
          kategori: Database["public"]["Enums"]["statistik_kategori"]
          tahun: number
          tanggal: string
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          gambar_url?: string | null
          id?: string
          judul?: string
          kategori?: Database["public"]["Enums"]["statistik_kategori"]
          tahun?: number
          tanggal?: string
        }
        Relationships: []
      }
      galeri_desa: {
        Row: {
          created_at: string
          deskripsi: string | null
          gambar_url: string | null
          id: string
          judul: string
          kategori: Database["public"]["Enums"]["galeri_kategori"]
          tanggal: string
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          gambar_url?: string | null
          id?: string
          judul: string
          kategori: Database["public"]["Enums"]["galeri_kategori"]
          tanggal: string
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          gambar_url?: string | null
          id?: string
          judul?: string
          kategori?: Database["public"]["Enums"]["galeri_kategori"]
          tanggal?: string
        }
        Relationships: []
      }
      kontak_desa: {
        Row: {
          alamat: string | null
          created_at: string
          email: string | null
          id: string
          nomor_telepon: string | null
          nomor_wa: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nomor_telepon?: string | null
          nomor_wa?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nomor_telepon?: string | null
          nomor_wa?: string | null
        }
        Relationships: []
      }
      lembaga_desa: {
        Row: {
          created_at: string
          deskripsi: string | null
          foto_url: string | null
          id: string
          nama_lembaga: string
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          foto_url?: string | null
          id?: string
          nama_lembaga: string
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          foto_url?: string | null
          id?: string
          nama_lembaga?: string
        }
        Relationships: []
      }
      pengaduan_masyarakat: {
        Row: {
          created_at: string
          id: string
          isi_pengaduan: string
          nama_pengirim: string
          status: Database["public"]["Enums"]["pengaduan_status"]
          tanggal: string
        }
        Insert: {
          created_at?: string
          id?: string
          isi_pengaduan: string
          nama_pengirim: string
          status?: Database["public"]["Enums"]["pengaduan_status"]
          tanggal?: string
        }
        Update: {
          created_at?: string
          id?: string
          isi_pengaduan?: string
          nama_pengirim?: string
          status?: Database["public"]["Enums"]["pengaduan_status"]
          tanggal?: string
        }
        Relationships: []
      }
      peta_desa: {
        Row: {
          created_at: string
          deskripsi: string | null
          gambar_filename: string | null
          gambar_url: string | null
          id: string
          judul: string
          koordinat_lat: number | null
          koordinat_lng: number | null
          updated_at: string
          zoom_level: number | null
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          gambar_filename?: string | null
          gambar_url?: string | null
          id?: string
          judul: string
          koordinat_lat?: number | null
          koordinat_lng?: number | null
          updated_at?: string
          zoom_level?: number | null
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          gambar_filename?: string | null
          gambar_url?: string | null
          id?: string
          judul?: string
          koordinat_lat?: number | null
          koordinat_lng?: number | null
          updated_at?: string
          zoom_level?: number | null
        }
        Relationships: []
      }
      profil_desa: {
        Row: {
          created_at: string
          gambar_url: string | null
          id: string
          isi: string | null
          judul: string
          kategori: Database["public"]["Enums"]["profil_kategori"]
        }
        Insert: {
          created_at?: string
          gambar_url?: string | null
          id?: string
          isi?: string | null
          judul: string
          kategori: Database["public"]["Enums"]["profil_kategori"]
        }
        Update: {
          created_at?: string
          gambar_url?: string | null
          id?: string
          isi?: string | null
          judul?: string
          kategori?: Database["public"]["Enums"]["profil_kategori"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saran_masyarakat: {
        Row: {
          created_at: string
          id: string
          nama_pengirim: string
          saran: string
          tanggal: string
        }
        Insert: {
          created_at?: string
          id?: string
          nama_pengirim: string
          saran: string
          tanggal?: string
        }
        Update: {
          created_at?: string
          id?: string
          nama_pengirim?: string
          saran?: string
          tanggal?: string
        }
        Relationships: []
      }
      transparansi_anggaran: {
        Row: {
          created_at: string
          deskripsi: string | null
          gambar_url: string | null
          id: string
          judul: string
          kategori: Database["public"]["Enums"]["anggaran_kategori"]
          tahun: number
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          gambar_url?: string | null
          id?: string
          judul: string
          kategori: Database["public"]["Enums"]["anggaran_kategori"]
          tahun: number
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          gambar_url?: string | null
          id?: string
          judul?: string
          kategori?: Database["public"]["Enums"]["anggaran_kategori"]
          tahun?: number
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      anggaran_kategori: "APBDesa" | "Dana_Desa"
      app_role: "admin" | "user"
      galeri_kategori:
        | "Alam"
        | "Sosial"
        | "Pembangunan"
        | "Budaya"
        | "Ekonomi"
        | "Dokumentasi"
        | "Lembaga"
        | "Anggaran"
      pengaduan_status: "baru" | "diproses" | "selesai"
      profil_kategori:
        | "sejarah"
        | "visi_misi"
        | "letak_geografis"
        | "demografi"
        | "struktur"
      statistik_kategori:
        | "Penduduk"
        | "Pendidikan"
        | "Kemiskinan"
        | "Bantuan Sosial"
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
      anggaran_kategori: ["APBDesa", "Dana_Desa"],
      app_role: ["admin", "user"],
      galeri_kategori: [
        "Alam",
        "Sosial",
        "Pembangunan",
        "Budaya",
        "Ekonomi",
        "Dokumentasi",
        "Lembaga",
        "Anggaran",
      ],
      pengaduan_status: ["baru", "diproses", "selesai"],
      profil_kategori: [
        "sejarah",
        "visi_misi",
        "letak_geografis",
        "demografi",
        "struktur",
      ],
      statistik_kategori: [
        "Penduduk",
        "Pendidikan",
        "Kemiskinan",
        "Bantuan Sosial",
      ],
    },
  },
} as const
