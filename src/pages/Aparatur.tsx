import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export default function Aparatur() {
  const [aparaturData, setAparaturData] = useState<Tables<"aparatur_desa">[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    jabatan: '',
    foto: null as File | null
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAparaturData();
  }, []);

  const fetchAparaturData = async () => {
    try {
      const { data, error } = await supabase
        .from('aparatur_desa')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAparaturData(data || []);
    } catch (error) {
      console.error('Error fetching aparatur data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data aparatur",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `aparatur/${fileName}`;

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
    if (!formData.nama || !formData.jabatan) {
      toast({
        title: "Error",
        description: "Nama dan jabatan harus diisi",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      let fotoUrl = null;
      
      if (formData.foto) {
        fotoUrl = await uploadImage(formData.foto);
      }

      const { error } = await supabase
        .from('aparatur_desa')
        .insert({
          nama: formData.nama,
          jabatan: formData.jabatan,
          foto_url: fotoUrl
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data aparatur berhasil ditambahkan"
      });

      setFormData({ nama: '', jabatan: '', foto: null });
      setIsDialogOpen(false);
      fetchAparaturData();
    } catch (error) {
      console.error('Error adding aparatur:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan data aparatur",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, foto: file }));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-4">Aparatur Desa</h1>
            <p className="text-lg text-muted-foreground">
              Struktur organisasi dan aparatur pemerintah Desa Bukit Pamewa
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Tambah Aparatur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Aparatur Desa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nama">Nama</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="jabatan">Jabatan</Label>
                  <Input
                    id="jabatan"
                    value={formData.jabatan}
                    onChange={(e) => setFormData(prev => ({ ...prev, jabatan: e.target.value }))}
                    placeholder="Masukkan jabatan"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="foto">Foto (Opsional)</Label>
                  <Input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                
                <Button type="submit" disabled={uploading} className="w-full">
                  {uploading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {aparaturData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {aparaturData.map((aparatur) => (
              <Card key={aparatur.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    {aparatur.foto_url ? (
                      <img
                        src={aparatur.foto_url}
                        alt={aparatur.nama}
                        className="w-24 h-24 object-cover rounded-full mx-auto"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-full mx-auto flex items-center justify-center">
                        <Users className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{aparatur.nama}</h3>
                  <p className="text-primary font-medium">{aparatur.jabatan}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Belum Ada Data Aparatur</h3>
              <p className="text-muted-foreground mb-4">
                Silakan tambahkan data aparatur desa menggunakan tombol di atas
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}