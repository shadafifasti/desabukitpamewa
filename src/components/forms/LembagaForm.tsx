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

interface LembagaFormProps {
  onSuccess?: () => void;
}

export const LembagaForm: React.FC<LembagaFormProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_lembaga: '',
    deskripsi: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `lembaga-${Date.now()}.${fileExt}`;
    const filePath = `lembaga/${fileName}`;

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
        description: "Hanya admin yang dapat menambahkan data lembaga",
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
      let fotoUrl = null;
      
      if (selectedImage) {
        toast({
          title: "Mengupload foto...",
          description: "Sedang mengupload foto ke server",
        });
        fotoUrl = await uploadImage(selectedImage);
      }

      toast({
        title: "Menyimpan data...",
        description: "Sedang menyimpan data lembaga",
      });

      const { error } = await supabase
        .from('lembaga_desa')
        .insert([
          {
            nama_lembaga: formData.nama_lembaga,
            deskripsi: formData.deskripsi,
            foto_url: fotoUrl,
          },
        ]);

      if (error) throw error;

      toast({
        title: "✅ Lembaga berhasil ditambahkan",
        description: `Data lembaga "${formData.nama_lembaga}" telah disimpan`,
      });

      setFormData({
        nama_lembaga: '',
        deskripsi: '',
      });
      setSelectedImage(null);
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error adding lembaga:', error);
      toast({
        title: "❌ Upload Gagal",
        description: error.message || "Terjadi kesalahan saat menambahkan lembaga",
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
          Tambah Lembaga
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tambah Lembaga Desa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nama_lembaga">Nama Lembaga</Label>
            <Input
              id="nama_lembaga"
              name="nama_lembaga"
              value={formData.nama_lembaga}
              onChange={handleInputChange}
              placeholder="Masukkan nama lembaga"
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
              placeholder="Deskripsi lembaga..."
              className="min-h-[120px]"
            />
          </div>

          <ImageUpload
            onImageSelected={setSelectedImage}
            label="Foto Lembaga (Opsional)"
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
                'Simpan Lembaga'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};