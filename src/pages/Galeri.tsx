import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Camera, Search, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { GaleriForm } from "@/components/forms/GaleriForm";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";

export default function Galeri() {
  const [galeriData, setGaleriData] = useState<Tables<"galeri_desa">[]>([]);
  const [filteredData, setFilteredData] = useState<Tables<"galeri_desa">[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    fetchGaleriData();
  }, []);

  useEffect(() => {
    let filtered = galeriData;
    
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
    
    setFilteredData(filtered);
  }, [searchTerm, selectedCategory, galeriData]);

  const fetchGaleriData = async () => {
    try {
      const { data, error } = await supabase
        .from('galeri_desa')
        .select('*')
        .order('tanggal', { ascending: false });
      
      if (error) throw error;
      setGaleriData(data || []);
      setFilteredData(data || []);
    } catch (error) {
      console.error('Error fetching galeri data:', error);
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

  const getUniqueCategories = () => {
    const categories = galeriData.map(item => item.kategori);
    return [...new Set(categories)];
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'kegiatan': 'bg-blue-100 text-blue-800',
      'pembangunan': 'bg-green-100 text-green-800',
      'budaya': 'bg-purple-100 text-purple-800',
      'acara': 'bg-yellow-100 text-yellow-800',
      'Alam': 'bg-emerald-100 text-emerald-800',
      'Sosial': 'bg-pink-100 text-pink-800',
      'Pembangunan': 'bg-green-100 text-green-800',
      'Budaya': 'bg-purple-100 text-purple-800',
      'Ekonomi': 'bg-orange-100 text-orange-800',
      'Dokumentasi': 'bg-gray-100 text-gray-800',
      'Lembaga': 'bg-indigo-100 text-indigo-800',
      'Anggaran': 'bg-red-100 text-red-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.default;
  };

  const handleDeleteGaleri = async (id: string, gambarUrl: string | null) => {
    if (!isAdmin) {
      toast({
        title: "Akses Ditolak",
        description: "Hanya admin yang dapat menghapus galeri",
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
            .remove([`galeri/${fileName}`]);
          
          if (storageError) {
            console.error('Error deleting image from storage:', storageError);
          }
        }
      }

      // Hapus data dari database
      const { error } = await supabase
        .from('galeri_desa')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Galeri berhasil dihapus",
        description: "Foto telah dihapus dari galeri",
      });

      // Refresh data
      fetchGaleriData();
    } catch (error: any) {
      console.error('Error deleting galeri:', error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menghapus galeri",
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Galeri Desa</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dokumentasi kegiatan dan momen bersejarah di Desa Bukit Pamewa
          </p>
        </div>

        {/* Upload Form - Only visible to admin users */}
        {isAdmin && (
          <div className="flex justify-center mb-8">
            <GaleriForm onSuccess={fetchGaleriData} />
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cari dalam galeri..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
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
        </div>

        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {item.gambar_url ? (
                        <img
                          src={item.gambar_url}
                          alt={item.judul}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted rounded-t-lg flex items-center justify-center">
                          <Camera className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className={`absolute top-2 right-2 ${getCategoryColor(item.kategori)}`}>
                        {item.kategori}
                      </Badge>
                      {/* Delete button - Only visible to admin */}
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 left-2 h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Galeri</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus foto "{item.judul}"? 
                                Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteGaleri(item.id, item.gambar_url)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {item.judul}
                      </h3>
                      {item.deskripsi && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                          {item.deskripsi}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.tanggal)}
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <div className="space-y-4">
                    {item.gambar_url && (
                      <img
                        src={item.gambar_url}
                        alt={item.judul}
                        className="w-full h-auto max-h-96 object-contain rounded-lg"
                      />
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(item.kategori)}>
                            {item.kategori}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(item.tanggal)}
                          </span>
                        </div>
                        {/* Delete button in modal - Only visible to admin */}
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="gap-2">
                                <Trash2 className="h-4 w-4" />
                                Hapus
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Galeri</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus foto "{item.judul}"? 
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteGaleri(item.id, item.gambar_url)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold mb-4">{item.judul}</h2>
                      {item.deskripsi && (
                        <p className="text-muted-foreground leading-relaxed">
                          {item.deskripsi}
                        </p>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm || selectedCategory ? "Tidak Ada Hasil" : "Belum Ada Galeri"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory
                  ? "Tidak ditemukan galeri dengan kriteria yang dipilih"
                  : "Galeri akan segera ditambahkan"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}