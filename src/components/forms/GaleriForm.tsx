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
import { useUserRole } from '@/hooks/useUserRole';

interface GaleriFormProps {
  onSuccess?: () => void;
}

const kategoriOptions = [
  { value: 'Alam', label: 'Alam' },
  { value: 'Sosial', label: 'Sosial' },
  { value: 'Pembangunan', label: 'Pembangunan' },
  { value: 'Budaya', label: 'Budaya' },
  { value: 'Ekonomi', label: 'Ekonomi' },
  { value: 'Dokumentasi', label: 'Dokumentasi' },
  { value: 'Lembaga', label: 'Lembaga' },
  { value: 'Anggaran', label: 'Anggaran' },
];

export const GaleriForm: React.FC<GaleriFormProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategori: '' as 'Alam' | 'Sosial' | 'Pembangunan' | 'Budaya' | 'Ekonomi' | 'Dokumentasi' | 'Lembaga' | 'Anggaran' | '',
    tanggal: new Date().toISOString().split('T')[0],
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `galeri-${Date.now()}.${fileExt}`;
    const filePath = `galeri/${fileName}`;

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
        description: "Hanya admin yang dapat menambahkan galeri",
        variant: "destructive",
      });
      return;
    }

    if (!selectedImage) {
      toast({
        title: "Foto Diperlukan",
        description: "Silakan pilih foto untuk diupload",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload gambar
      toast({
        title: "Mengupload foto...",
        description: "Sedang mengupload foto ke server",
      });
      
      const gambarUrl = await uploadImage(selectedImage);

      // Simpan data ke database
      toast({
        title: "Menyimpan data...",
        description: "Sedang menyimpan data galeri",
      });

      const { error } = await supabase
        .from('galeri_desa')
        .insert([
          {
            judul: formData.judul,
            deskripsi: formData.deskripsi,
            kategori: formData.kategori as 'Alam' | 'Sosial' | 'Pembangunan' | 'Budaya' | 'Ekonomi' | 'Dokumentasi' | 'Lembaga' | 'Anggaran',
            tanggal: formData.tanggal,
            gambar_url: gambarUrl,
          },
        ]);

      if (error) throw error;

      toast({
        title: "✅ Galeri berhasil ditambahkan",
        description: `Foto "${formData.judul}" telah ditambahkan ke galeri`,
      });

      // Reset form
      setFormData({
        judul: '',
        deskripsi: '',
        kategori: '',
        tanggal: new Date().toISOString().split('T')[0],
      });
      setSelectedImage(null);
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error adding galeri:', error);
      toast({
        title: "❌ Upload Gagal",
        description: error.message || "Terjadi kesalahan saat menambahkan galeri",
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
          Tambah Foto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tambah Foto ke Galeri</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="judul">Judul Foto</Label>
            <Input
              id="judul"
              name="judul"
              value={formData.judul}
              onChange={handleInputChange}
              placeholder="Masukkan judul foto"
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

          <div>
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleInputChange}
              placeholder="Deskripsi foto..."
              className="min-h-[80px]"
            />
          </div>

          <ImageUpload
            onImageSelected={setSelectedImage}
            label="Pilih Foto"
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || !selectedImage || !formData.judul || !formData.kategori}>
              {loading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Foto'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};