import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { Plus, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface StatistikFormProps {
  onSuccess?: () => void;
}

const kategoriOptions = [
  { value: 'Penduduk', label: 'Penduduk' },
  { value: 'Pendidikan', label: 'Pendidikan' },
  { value: 'Kemiskinan', label: 'Kemiskinan' },
  { value: 'Bantuan Sosial', label: 'Bantuan Sosial' },
];

export const StatistikForm: React.FC<StatistikFormProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategori: '' as 'Penduduk' | 'Pendidikan' | 'Kemiskinan' | 'Bantuan Sosial' | '',
    tahun: new Date().getFullYear(),
    tanggal: new Date().toISOString().split('T')[0],
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `statistik-${Date.now()}.${fileExt}`;
    const filePath = `statistik/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('galeridesa')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('galeridesa')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Cek role admin
    if (!isAdmin) {
      toast({
        title: "Akses Ditolak",
        description: "Hanya admin yang dapat menambahkan data statistik",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Anda harus login terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let gambarUrl = null;
      
      if (selectedImage) {
        toast({
          title: "Mengupload gambar...",
          description: "Sedang mengupload gambar ke server",
        });
        gambarUrl = await uploadImage(selectedImage);
      }

      toast({
        title: "Menyimpan data...",
        description: "Sedang menyimpan data statistik",
      });

      const { error } = await supabase
        .from('data_statistik')
        .insert([
          {
            judul: formData.judul,
            deskripsi: formData.deskripsi,
            kategori: formData.kategori as 'Penduduk' | 'Pendidikan' | 'Kemiskinan' | 'Bantuan Sosial',
            tahun: formData.tahun,
            tanggal: formData.tanggal,
            gambar_url: gambarUrl,
          },
        ]);

      if (error) throw error;

      toast({
        title: "✅ Statistik berhasil ditambahkan",
        description: `Data statistik "${formData.judul}" telah disimpan`,
      });

      setFormData({
        judul: '',
        deskripsi: '',
        kategori: '',
        tahun: new Date().getFullYear(),
        tanggal: new Date().toISOString().split('T')[0],
      });
      setSelectedImage(null);
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error adding statistik:', error);
      toast({
        title: "❌ Upload Gagal",
        description: error.message || "Terjadi kesalahan saat menambahkan statistik",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Jangan tampilkan tombol jika bukan admin
  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Statistik
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tambah Data Statistik</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="judul">Judul</Label>
            <Input
              id="judul"
              name="judul"
              value={formData.judul}
              onChange={handleInputChange}
              placeholder="Masukkan judul statistik"
              required
            />
          </div>

          <div>
            <Label htmlFor="kategori">Kategori</Label>
            <Select value={formData.kategori} onValueChange={(value) => setFormData({ ...formData, kategori: value as any })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {kategoriOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tahun">Tahun</Label>
              <Input
                id="tahun"
                name="tahun"
                type="number"
                value={formData.tahun}
                onChange={handleInputChange}
                min="2000"
                max="2100"
                required
              />
            </div>
            <div>
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                name="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleInputChange}
              placeholder="Deskripsi statistik..."
              className="min-h-[120px]"
            />
          </div>

          <ImageUpload
            onImageSelected={setSelectedImage}
            label="Gambar/Grafik (Opsional)"
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Statistik'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};