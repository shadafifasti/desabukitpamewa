import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { Plus, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface BeritaFormProps {
  onSuccess?: () => void;
}

export const BeritaForm: React.FC<BeritaFormProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    isi: '',
    tanggal: new Date().toISOString().split('T')[0],
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `berita-${Date.now()}.${fileExt}`;
    const filePath = `berita/${fileName}`;

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
        description: "Hanya admin yang dapat menambahkan berita",
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
        description: "Sedang menyimpan data berita",
      });

      const { error } = await supabase
        .from('berita')
        .insert([
          {
            judul: formData.judul,
            isi: formData.isi,
            tanggal: formData.tanggal,
            gambar_url: gambarUrl,
          },
        ]);

      if (error) throw error;

      toast({
        title: "✅ Berita berhasil ditambahkan",
        description: `Berita "${formData.judul}" telah dipublikasikan`,
      });

      setFormData({
        judul: '',
        isi: '',
        tanggal: new Date().toISOString().split('T')[0],
      });
      setSelectedImage(null);
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error adding berita:', error);
      toast({
        title: "❌ Upload Gagal",
        description: error.message || "Terjadi kesalahan saat menambahkan berita",
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
          Tambah Berita
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tambah Berita Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="judul">Judul Berita</Label>
            <Input
              id="judul"
              name="judul"
              value={formData.judul}
              onChange={handleInputChange}
              placeholder="Masukkan judul berita"
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

          <div>
            <Label htmlFor="isi">Isi Berita</Label>
            <Textarea
              id="isi"
              name="isi"
              value={formData.isi}
              onChange={handleInputChange}
              placeholder="Tulis isi berita di sini..."
              className="min-h-[120px]"
            />
          </div>

          <ImageUpload
            onImageSelected={setSelectedImage}
            label="Gambar Berita (Opsional)"
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
                'Simpan Berita'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};