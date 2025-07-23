import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Building2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { LembagaForm } from "@/components/forms/LembagaForm";

export default function Lembaga() {
  const [lembagaData, setLembagaData] = useState<Tables<"lembaga_desa">[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    fetchLembagaData();
  }, []);

  const fetchLembagaData = async () => {
    try {
      const { data, error } = await supabase
        .from('lembaga_desa')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLembagaData(data || []);
    } catch (error) {
      console.error('Error fetching lembaga data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLembaga = async (id: string, gambarUrl: string | null) => {
    if (!isAdmin) {
      toast({
        title: "Akses Ditolak",
        description: "Hanya admin yang dapat menghapus data lembaga",
        variant: "destructive",
      });
      return;
    }

    try {
      // Hapus gambar dari storage jika ada
      if (gambarUrl) {
        const fileName = gambarUrl.split('/').pop();
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('galeridesa')
            .remove([`lembaga/${fileName}`]);
          
          if (storageError) {
            console.error('Error deleting image from storage:', storageError);
          }
        }
      }

      // Hapus data dari database
      const { error } = await supabase
        .from('lembaga_desa')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Data lembaga berhasil dihapus",
        description: "Data telah dihapus dari sistem",
      });

      // Refresh data
      fetchLembagaData();
    } catch (error: any) {
      console.error('Error deleting lembaga:', error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menghapus data lembaga",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const defaultLembaga = [
    {
      id: 'default-1',
      nama_lembaga: 'BPD (Badan Permusyawaratan Desa)',
      deskripsi: 'Mewakili aspirasi masyarakat dan pengawasan terhadap pemerintah desa. BPD berperan sebagai mitra kerja pemerintah desa dalam menjalankan pemerintahan dan pembangunan.',
      foto_url: null
    },
    {
      id: 'default-2',
      nama_lembaga: 'Karang Taruna',
      deskripsi: 'Wadah organisasi kepemudaan untuk kegiatan sosial dan pemberdayaan remaja. Berperan aktif dalam mengembangkan potensi dan kreativitas pemuda desa.',
      foto_url: null
    },
    {
      id: 'default-3',
      nama_lembaga: 'PKK (Pemberdayaan Kesejahteraan Keluarga)',
      deskripsi: 'Organisasi kemasyarakatan yang memberdayakan perempuan untuk meningkatkan kesejahteraan keluarga dan masyarakat.',
      foto_url: null
    },
    {
      id: 'default-4',
      nama_lembaga: 'LPMD (Lembaga Pemberdayaan Masyarakat Desa)',
      deskripsi: 'Lembaga yang bertugas menyusun rencana pembangunan secara partisipatif, menggerakkan swadaya gotong royong masyarakat.',
      foto_url: null
    }
  ];

  const displayData = lembagaData.length > 0 ? lembagaData : defaultLembaga;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Lembaga Desa</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Berbagai lembaga kemasyarakatan yang aktif dalam pembangunan dan pemberdayaan masyarakat Desa Bukit Pamewa
          </p>
        </div>

        {/* Upload Form - Only visible to admin users */}
        {isAdmin && (
          <div className="flex justify-center mb-8">
            <LembagaForm onSuccess={fetchLembagaData} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayData.map((lembaga) => (
            <Card key={lembaga.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      {lembaga.nama_lembaga.includes('BPD') ? (
                        <Building2 className="w-6 h-6 text-primary-foreground" />
                      ) : (
                        <Users className="w-6 h-6 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-xl">{lembaga.nama_lembaga}</span>
                  </CardTitle>
                  {isAdmin && !lembaga.id.startsWith('default-') && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Data Lembaga</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data lembaga "{lembaga.nama_lembaga}"? 
                            Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteLembaga(lembaga.id, lembaga.foto_url)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {lembaga.foto_url && (
                  <img
                    src={lembaga.foto_url}
                    alt={lembaga.nama_lembaga}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <p className="text-muted-foreground leading-relaxed text-justify">
                  {lembaga.deskripsi}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {lembagaData.length === 0 && (
          <div className="text-center mt-8 p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground">
              Data lembaga desa akan diperbarui secara berkala sesuai dengan perkembangan organisasi di desa.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}