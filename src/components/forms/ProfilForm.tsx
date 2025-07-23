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

interface ProfilFormProps {
  onSuccess?: () => void;
}

const kategoriOptions = [
  { value: 'sejarah', label: 'Sejarah' },
  { value: 'visi_misi', label: 'Visi Misi' },
  { value: 'letak_geografis', label: 'Letak Geografis' },
  { value: 'demografi', label: 'Demografi' },
  { value: 'struktur', label: 'Struktur Organisasi' },
];

export const ProfilForm: React.FC<ProfilFormProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    isi: '',
    kategori: '' as 'sejarah' | 'visi_misi' | 'letak_geografis' | 'demografi' | 'struktur' | '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `profil-${Date.now()}.${fileExt}`;
    const filePath = `profil/${fileName}`;

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
    setLoading(true);

    try {
      let gambarUrl = null;
      
      if (selectedImage) {
        gambarUrl = await uploadImage(selectedImage);
      }

      const { error } = await supabase
        .from('profil_desa')
        .insert([
          {
            judul: formData.judul,
            isi: formData.isi,
            kategori: formData.kategori as 'sejarah' | 'visi_misi' | 'letak_geografis' | 'demografi' | 'struktur',
            gambar_url: gambarUrl,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Profil berhasil ditambahkan",
        description: "Data profil desa telah disimpan",
      });

      setFormData({
        judul: '',
        isi: '',
        kategori: '',
      });
      setSelectedImage(null);
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menambahkan profil",
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Profil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tambah Profil Desa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="judul">Judul</Label>
            <Input
              id="judul"
              name="judul"
              value={formData.judul}
              onChange={handleInputChange}
              placeholder="Masukkan judul profil"
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
            <Label htmlFor="isi">Konten</Label>
            <Textarea
              id="isi"
              name="isi"
              value={formData.isi}
              onChange={handleInputChange}
              placeholder="Tulis konten profil di sini..."
              className="min-h-[120px]"
            />
          </div>

          <ImageUpload
            onImageSelected={setSelectedImage}
            label="Gambar Profil (Opsional)"
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
                'Simpan Profil'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};