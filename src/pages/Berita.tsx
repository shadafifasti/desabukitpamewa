import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileText, Search, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { BeritaForm } from "@/components/forms/BeritaForm";

export default function Berita() {
  const [beritaData, setBeritaData] = useState<Tables<"berita">[]>([]);
  const [filteredData, setFilteredData] = useState<Tables<"berita">[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    fetchBeritaData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = beritaData.filter(
        (item) =>
          item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.isi && item.isi.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(beritaData);
    }
  }, [searchTerm, beritaData]);

  const fetchBeritaData = async () => {
    try {
      const { data, error } = await supabase
        .from('berita')
        .select('*')
        .order('tanggal', { ascending: false });
      
      if (error) throw error;
      setBeritaData(data || []);
      setFilteredData(data || []);
    } catch (error) {
      console.error('Error fetching berita data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDeleteBerita = async (id: string, gambarUrl: string | null) => {
    if (!isAdmin) {
      toast({
        title: "Akses Ditolak",
        description: "Hanya admin yang dapat menghapus berita",
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
            .remove([`berita/${fileName}`]);
          
          if (storageError) {
            console.error('Error deleting image from storage:', storageError);
          }
        }
      }

      // Hapus data dari database
      const { error } = await supabase
        .from('berita')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Berita berhasil dihapus",
        description: "Berita telah dihapus dari sistem",
      });

      // Refresh data
      fetchBeritaData();
    } catch (error: any) {
      console.error('Error deleting berita:', error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menghapus berita",
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
            <div className="h-12 bg-gray-300 rounded"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Berita Desa</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Informasi terkini dan kegiatan yang sedang berlangsung di Desa Bukit Pamewa
          </p>
        </div>

        {/* Upload Form - Only visible to admin users */}
        {isAdmin && (
          <div className="flex justify-center mb-8">
            <BeritaForm onSuccess={fetchBeritaData} />
          </div>
        )}

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cari berita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredData.length > 0 ? (
          <div className="space-y-6">
            {filteredData.map((berita) => (
              <Card key={berita.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {berita.gambar_url && (
                      <div className="md:w-1/3">
                        <img
                          src={berita.gambar_url}
                          alt={berita.judul}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className={berita.gambar_url ? "md:w-2/3" : "w-full"}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formatDate(berita.tanggal)}
                          </span>
                        </div>
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Berita</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus berita "{berita.judul}"? 
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteBerita(berita.id, berita.gambar_url)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                      
                      <h2 className="text-2xl font-bold mb-4 text-foreground">
                        {berita.judul}
                      </h2>
                      
                      {berita.isi && (
                        <p className="text-muted-foreground leading-relaxed text-justify whitespace-pre-wrap">
                          {berita.isi}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? "Tidak Ada Hasil" : "Belum Ada Berita"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? `Tidak ditemukan berita dengan kata kunci "${searchTerm}"`
                  : "Berita akan segera ditambahkan"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}