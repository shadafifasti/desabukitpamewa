import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Plus, Upload, Trash2, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import type { Tables } from "@/integrations/supabase/types";

export default function Aparatur() {
  const [aparaturData, setAparaturData] = useState<Tables<"aparatur_desa">[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    jabatan: '',
    foto: null as File | null
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

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

  const handleDelete = async (aparatur: Tables<"aparatur_desa">) => {
    if (!isAdmin) {
      toast({
        title: "Akses Ditolak",
        description: "Hanya admin yang dapat menghapus data aparatur",
        variant: "destructive"
      });
      return;
    }

    setDeleting(aparatur.id);
    
    try {
      // Hapus gambar dari storage jika ada
      if (aparatur.foto_url) {
        const fileName = aparatur.foto_url.split('/').pop();
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('galeridesa')
            .remove([`aparatur/${fileName}`]);
          
          if (storageError) {
            console.error('Error deleting image:', storageError);
          }
        }
      }

      // Hapus data dari database
      const { error } = await supabase
        .from('aparatur_desa')
        .delete()
        .eq('id', aparatur.id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data aparatur berhasil dihapus"
      });

      fetchAparaturData();
    } catch (error) {
      console.error('Error deleting aparatur:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus data aparatur",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
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
          
          {isAdmin && (
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
          )}
        </div>

        {aparaturData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {aparaturData.map((aparatur) => (
              <Card key={aparatur.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-village-green/5 to-village-brown/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Delete Button - Only for Admin */}
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 w-8 p-0"
                        disabled={deleting === aparatur.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data Aparatur</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus data aparatur <strong>{aparatur.nama}</strong>? 
                          Tindakan ini tidak dapat dibatalkan dan akan menghapus foto yang terkait.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(aparatur)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <CardContent className="p-6 text-center relative">
                  {/* Photo Frame */}
                  <div className="mb-6 relative">
                    <div className="relative mx-auto w-32 h-32">
                      {/* Decorative Frame */}
                      <div className="absolute inset-0 bg-gradient-to-br from-village-green to-village-brown rounded-full p-1">
                        <div className="w-full h-full bg-white rounded-full p-1">
                          {aparatur.foto_url ? (
                            <img
                              src={aparatur.foto_url}
                              alt={aparatur.nama}
                              className="w-full h-full object-cover rounded-full shadow-lg"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                              <UserCheck className="w-12 h-12 text-village-green" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Decorative Corner Elements */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-village-gold rounded-full shadow-md" />
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-village-brown rounded-full shadow-md" />
                    </div>
                  </div>
                  
                  {/* Name and Position */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-xl text-gray-800 group-hover:text-village-green transition-colors duration-300">
                      {aparatur.nama}
                    </h3>
                    <div className="bg-gradient-to-r from-village-green to-village-brown bg-clip-text text-transparent">
                      <p className="font-semibold text-lg">{aparatur.jabatan}</p>
                    </div>
                  </div>
                  
                  {/* Decorative Bottom Border */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-village-green to-village-brown rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="text-center py-16">
              <div className="relative mx-auto w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-village-green/20 to-village-brown/20 rounded-full">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-village-green" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Belum Ada Data Aparatur</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {isAdmin 
                  ? "Silakan tambahkan data aparatur desa menggunakan tombol 'Tambah Aparatur' di atas"
                  : "Data aparatur desa belum tersedia. Hubungi admin untuk menambahkan data."
                }
              </p>
              {isAdmin && (
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="gap-2 bg-village-green hover:bg-village-green/90"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Aparatur Pertama
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}