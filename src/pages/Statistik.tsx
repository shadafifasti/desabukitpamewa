import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { BarChart3, Search, TrendingUp, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { StatistikForm } from "@/components/forms/StatistikForm";

export default function Statistik() {
  const [statistikData, setStatistikData] = useState<Tables<"data_statistik">[]>([]);
  const [filteredData, setFilteredData] = useState<Tables<"data_statistik">[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    fetchStatistikData();
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
    let filtered = statistikData;
    
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.kategori === selectedCategory);
    }
    
    if (selectedYear) {
      filtered = filtered.filter((item) => item.tahun === selectedYear);
    }
    
    setFilteredData(filtered);
  }, [searchTerm, selectedCategory, selectedYear, statistikData]);

  const fetchStatistikData = async () => {
    try {
      const { data, error } = await supabase
        .from('data_statistik')
        .select('*')
        .order('tahun', { ascending: false });
      
      if (error) throw error;
      setStatistikData(data || []);
      setFilteredData(data || []);
    } catch (error) {
      console.error('Error fetching statistik data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStatistik = async (id: string, gambarUrl: string | null) => {
    if (!isAdmin) {
      toast({
        title: "Akses Ditolak",
        description: "Hanya admin yang dapat menghapus data statistik",
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
            .remove([`statistik/${fileName}`]);
          
          if (storageError) {
            console.error('Error deleting image from storage:', storageError);
          }
        }
      }

      // Hapus data dari database
      const { error } = await supabase
        .from('data_statistik')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Data statistik berhasil dihapus",
        description: "Data telah dihapus dari sistem",
      });

      // Refresh data
      fetchStatistikData();
    } catch (error: any) {
      console.error('Error deleting statistik:', error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menghapus data statistik",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUniqueCategories = () => {
    const categories = statistikData.map(item => item.kategori);
    return [...new Set(categories)];
  };

  const getUniqueYears = () => {
    const years = statistikData.map(item => item.tahun);
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
      'demografi': 'bg-blue-100 text-blue-800',
      'ekonomi': 'bg-green-100 text-green-800',
      'pendidikan': 'bg-purple-100 text-purple-800',
      'kesehatan': 'bg-red-100 text-red-800',
      'infrastruktur': 'bg-yellow-100 text-yellow-800',
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-300 rounded"></div>
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
          <h1 className="text-4xl font-bold text-primary mb-4">Data Statistik Desa</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Informasi data dan statistik yang mendukung perencanaan pembangunan Desa Bukit Pamewa
          </p>
        </div>

        {/* Upload Form - Only visible to admin users */}
        {isAdmin && (
          <div className="flex justify-center mb-8">
            <StatistikForm onSuccess={fetchStatistikData} />
          </div>
        )}

        {/* Search and Filter */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cari data statistik..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground self-center">Kategori:</span>
              <Badge
                variant={selectedCategory === "" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory("")}
              >
                Semua
              </Badge>
              {getUniqueCategories().map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground self-center">Tahun:</span>
              <Badge
                variant={selectedYear === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedYear(null)}
              >
                Semua
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
        </div>

        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
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
                            <AlertDialogTitle>Hapus Data Statistik</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus data statistik "{item.judul}"? 
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteStatistik(item.id, item.gambar_url)}
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
                    <TrendingUp className="w-5 h-5" />
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
                      {item.deskripsi.length > 120 
                        ? `${item.deskripsi.substring(0, 120)}...` 
                        : item.deskripsi
                      }
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Dipublikasi: {formatDate(item.tanggal)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm || selectedCategory || selectedYear ? "Tidak Ada Hasil" : "Belum Ada Data Statistik"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory || selectedYear
                  ? "Tidak ditemukan data statistik dengan kriteria yang dipilih"
                  : "Data statistik akan segera ditambahkan"
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card className="mt-8 bg-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tentang Data Statistik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Data statistik desa mencakup berbagai aspek kehidupan masyarakat seperti demografi, ekonomi, pendidikan, kesehatan, dan infrastruktur. Data ini digunakan sebagai dasar dalam perencanaan dan evaluasi program pembangunan desa.
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