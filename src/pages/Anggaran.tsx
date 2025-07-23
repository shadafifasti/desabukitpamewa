import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DollarSign, Search, FileText, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { AnggaranForm } from "@/components/forms/AnggaranForm";

export default function Anggaran() {
  const [anggaranData, setAnggaranData] = useState<Tables<"transparansi_anggaran">[]>([]);
  const [filteredData, setFilteredData] = useState<Tables<"transparansi_anggaran">[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    fetchAnggaranData();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        closeImageModal();
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  useEffect(() => {
    let filtered = anggaranData;
    
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedYear) {
      filtered = filtered.filter((item) => item.tahun === selectedYear);
    }
    
    setFilteredData(filtered);
  }, [searchTerm, selectedYear, anggaranData]);

  const fetchAnggaranData = async () => {
    try {
      const { data, error } = await supabase
        .from('transparansi_anggaran')
        .select('*')
        .order('tahun', { ascending: false });
      
      if (error) throw error;
      setAnggaranData(data || []);
      setFilteredData(data || []);
    } catch (error) {
      console.error('Error fetching anggaran data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnggaran = async (id: string, gambarUrl: string | null) => {
    if (!isAdmin) {
      toast({
        title: "Akses Ditolak",
        description: "Hanya admin yang dapat menghapus data anggaran",
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
            .remove([`anggaran/${fileName}`]);
          
          if (storageError) {
            console.error('Error deleting image from storage:', storageError);
          }
        }
      }

      // Hapus data dari database
      const { error } = await supabase
        .from('transparansi_anggaran')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Data anggaran berhasil dihapus",
        description: "Data telah dihapus dari sistem",
      });

      // Refresh data
      fetchAnggaranData();
    } catch (error: any) {
      console.error('Error deleting anggaran:', error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menghapus data anggaran",
        variant: "destructive",
      });
    }
  };

  const getUniqueYears = () => {
    const years = anggaranData.map(item => item.tahun);
    return [...new Set(years)].sort((a, b) => b - a);
  };

  const openImageModal = (imageUrl: string, title: string) => {
    setSelectedImage({ url: imageUrl, title });
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'pendapatan': 'bg-green-100 text-green-800',
      'belanja': 'bg-red-100 text-red-800',
      'pembiayaan': 'bg-blue-100 text-blue-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.default;
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
          <h1 className="text-4xl font-bold text-primary mb-4">Transparansi Anggaran</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Informasi transparan mengenai pengelolaan anggaran dan keuangan Desa Bukit Pamewa
          </p>
        </div>

        {/* Upload Form - Only visible to admin users */}
        {isAdmin && (
          <div className="flex justify-center mb-8">
            <AnggaranForm onSuccess={fetchAnggaranData} />
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cari informasi anggaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={selectedYear === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedYear(null)}
            >
              Semua Tahun
            </Badge>
            {getUniqueYears().map((year) => (
              <Badge
                key={year}
                variant={selectedYear === year ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </Badge>
            ))}
          </div>
        </div>

        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(item.kategori)}>
                        {item.kategori}
                      </Badge>
                      <Badge variant="outline">
                        {item.tahun}
                      </Badge>
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
                            <AlertDialogTitle>Hapus Data Anggaran</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus data anggaran "{item.judul}"? 
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteAnggaran(item.id, item.gambar_url)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  <CardTitle className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5" />
                    {item.judul}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.gambar_url && (
                    <img
                      src={item.gambar_url}
                      alt={item.judul}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImageModal(item.gambar_url!, item.judul)}
                    />
                  )}
                  {item.deskripsi && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.deskripsi.length > 150 
                        ? `${item.deskripsi.substring(0, 150)}...` 
                        : item.deskripsi
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm || selectedYear ? "Tidak Ada Hasil" : "Belum Ada Data Anggaran"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedYear
                  ? "Tidak ditemukan data anggaran dengan kriteria yang dipilih"
                  : "Data transparansi anggaran akan segera ditambahkan"
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card className="mt-8 bg-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informasi Transparansi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Transparansi anggaran desa merupakan komitmen kami untuk memberikan informasi yang jelas dan terbuka kepada masyarakat mengenai pengelolaan keuangan desa. Data yang ditampilkan meliputi rencana anggaran, realisasi, dan pertanggungjawaban penggunaan dana desa.
            </p>
          </CardContent>
        </Card>

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={closeImageModal}
          >
            <div className="relative w-full h-full max-w-6xl max-h-full overflow-auto">
              {/* Close Button - Fixed Position */}
              <Button
                variant="outline"
                size="icon"
                className="fixed top-6 right-6 z-20 bg-white hover:bg-gray-100 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  closeImageModal();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
              
              {/* Scrollable Content Container */}
              <div className="min-h-full flex flex-col items-center justify-center py-8 px-4">
                <div className="relative bg-white rounded-lg shadow-2xl max-w-full">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    className="w-full h-auto max-w-none rounded-lg"
                    style={{ maxHeight: 'none' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  {/* Image Title */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4 rounded-b-lg">
                    <h3 className="font-semibold text-lg">{selectedImage.title}</h3>
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="mt-4 text-center text-white/80 text-sm">
                  <p>Scroll untuk melihat gambar secara penuh • Tekan ESC atau klik di luar untuk menutup</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}