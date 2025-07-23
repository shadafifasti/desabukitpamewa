import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MapPin, Users, FileText, Building2, UsersRound, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { ProfilForm } from "@/components/forms/ProfilForm";

export default function Profil() {
  const [profilData, setProfilData] = useState<Tables<"profil_desa">[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfilData();
  }, []);

  const fetchProfilData = async () => {
    try {
      const { data, error } = await supabase
        .from('profil_desa')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProfilData(data || []);
    } catch (error) {
      console.error('Error fetching profil data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDataByCategory = (category: string) => {
    return profilData.find(item => item.kategori === category);
  };

  const handleDeleteProfil = async (id: number, gambarUrl?: string | null) => {
    try {
      // Hapus gambar dari storage jika ada
      if (gambarUrl) {
        const fileName = gambarUrl.split('/').pop();
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('galeridesa')
            .remove([`profil/${fileName}`]);
          
          if (storageError) {
            console.error('Error deleting image from storage:', storageError);
          }
        }
      }

      // Hapus data dari database
      const { error } = await supabase
        .from('profil_desa')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Data profil berhasil dihapus",
        description: "Data telah dihapus dari sistem",
      });

      // Refresh data
      fetchProfilData();
    } catch (error: any) {
      console.error('Error deleting profil:', error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menghapus data profil",
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
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Profil Desa Bukit Pamewa</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Informasi lengkap mengenai sejarah, visi misi, geografis, struktur organisasi, dan lembaga desa
          </p>
        </div>


        <Tabs defaultValue="sejarah" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
            <TabsTrigger value="sejarah">Sejarah</TabsTrigger>
            <TabsTrigger value="visi-misi">Visi & Misi</TabsTrigger>
            <TabsTrigger value="geografis">Geografis</TabsTrigger>
            <TabsTrigger value="struktur">Struktur</TabsTrigger>
            <TabsTrigger value="demografi">Demografi</TabsTrigger>
          </TabsList>

          <TabsContent value="sejarah" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="w-6 h-6" />
                    Sejarah Desa
                  </CardTitle>
                  {isAdmin && getDataByCategory('sejarah') && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Data Sejarah</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data sejarah desa? 
                            Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteProfil(getDataByCategory('sejarah')!.id, getDataByCategory('sejarah')?.gambar_url)}
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
              <CardContent>
                {getDataByCategory('sejarah') ? (
                  <div>
                    {getDataByCategory('sejarah')?.gambar_url && (
                      <img 
                        src={getDataByCategory('sejarah')?.gambar_url || ''} 
                        alt="Sejarah Desa"
                        className="w-full h-64 object-cover rounded-lg mb-6"
                      />
                    )}
                    <h3 className="text-xl font-semibold mb-4">{getDataByCategory('sejarah')?.judul}</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {getDataByCategory('sejarah')?.isi}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Desa Bukit Pamewa atau singkatan dari Bukit Padang Mentawai Jawa, adalah sebuah desa yang berada di wilayah Kecamatan Sipora Utara, Kabupaten Kepulauan Mentawai, Provinsi Sumatra Barat, Indonesia. Desa ini terdiri dari 3 dusun yaitu Bukit Subur, Pamewa Indah, dan Subur Makmur.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visi-misi" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <Users className="w-6 h-6" />
                    Visi & Misi
                  </CardTitle>
                  {isAdmin && getDataByCategory('visi_misi') && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Data Visi Misi</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data visi misi desa? 
                            Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteProfil(getDataByCategory('visi_misi')!.id, getDataByCategory('visi_misi')?.gambar_url)}
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
              <CardContent>
                {getDataByCategory('visi_misi') ? (
                  <div>
                    {getDataByCategory('visi_misi')?.gambar_url && (
                      <img 
                        src={getDataByCategory('visi_misi')?.gambar_url || ''} 
                        alt="Visi Misi"
                        className="w-full h-64 object-cover rounded-lg mb-6"
                      />
                    )}
                    <h3 className="text-xl font-semibold mb-4">{getDataByCategory('visi_misi')?.judul}</h3>
                    <div className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                      {getDataByCategory('visi_misi')?.isi}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-3">Visi:</h4>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        Menjadi desa yang sejahtera, maju, dan mandiri berdasarkan nilai-nilai gotong royong.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-3">Misi:</h4>
                      <ul className="text-muted-foreground space-y-2 text-lg">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          Meningkatkan kesejahteraan masyarakat
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          Mengembangkan potensi ekonomi lokal
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          Melestarikan budaya dan tradisi
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          Membangun infrastruktur yang memadai
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geografis" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <MapPin className="w-6 h-6" />
                    Letak Geografis
                  </CardTitle>
                  {isAdmin && getDataByCategory('letak_geografis') && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Data Geografis</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data letak geografis desa? 
                            Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteProfil(getDataByCategory('letak_geografis')!.id, getDataByCategory('letak_geografis')?.gambar_url)}
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
              <CardContent>
                {getDataByCategory('letak_geografis') ? (
                  <div>
                    {getDataByCategory('letak_geografis')?.gambar_url && (
                      <img 
                        src={getDataByCategory('letak_geografis')?.gambar_url || ''} 
                        alt="Letak Geografis"
                        className="w-full h-64 object-cover rounded-lg mb-6"
                      />
                    )}
                    <h3 className="text-xl font-semibold mb-4">{getDataByCategory('letak_geografis')?.judul}</h3>
                    <div className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                      {getDataByCategory('letak_geografis')?.isi}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Desa Bukit Pamewa terletak di Kecamatan Sipora Utara, Kabupaten Kepulauan Mentawai, Provinsi Sumatra Barat.
                    </p>
                    <div>
                      <h4 className="text-xl font-semibold mb-3">Berbatasan dengan:</h4>
                      <ul className="text-muted-foreground space-y-2 text-lg">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                          Utara: Desa Sipora Jaya
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                          Selatan: Desa Saureinu
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                          Barat: Desa Sido Makmur
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                          Timur: Desa Goisooinan
                        </li>
                      </ul>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="font-semibold text-xl">Luas Wilayah: 689,15 Ha</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="struktur" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <Building2 className="w-6 h-6" />
                    Struktur Organisasi Pemerintahan Desa
                  </CardTitle>
                  {isAdmin && getDataByCategory('struktur') && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Data Struktur Organisasi</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data struktur organisasi? 
                            Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteProfil(getDataByCategory('struktur')!.id, getDataByCategory('struktur')?.gambar_url)}
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
              <CardContent>
                {getDataByCategory('struktur')?.gambar_url ? (
                  <div className="flex justify-center">
                    <img 
                      src={getDataByCategory('struktur')?.gambar_url || ''} 
                      alt="Struktur Organisasi Pemerintahan Desa"
                      className="w-full max-w-full h-auto object-contain rounded-lg shadow-md"
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Belum ada struktur organisasi yang diunggah. Kalau perlu edit bagian database nya supaya sesuai dengan Supabase.
                    </p>
                    {isAdmin && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Gunakan form di bawah untuk mengunggah gambar struktur organisasi.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demografi" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <UsersRound className="w-6 h-6" />
                    Demografi Desa
                  </CardTitle>
                  {isAdmin && getDataByCategory('demografi') && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Data Demografi</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data demografi desa? 
                            Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteProfil(getDataByCategory('demografi')!.id, getDataByCategory('demografi')?.gambar_url)}
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
              <CardContent>
                {getDataByCategory('demografi') ? (
                  <div>
                    {getDataByCategory('demografi')?.gambar_url && (
                      <img 
                        src={getDataByCategory('demografi')?.gambar_url || ''} 
                        alt="Demografi Desa"
                        className="w-full h-64 object-cover rounded-lg mb-6"
                      />
                    )}
                    <h3 className="text-xl font-semibold mb-4">{getDataByCategory('demografi')?.judul}</h3>
                    <div className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                      {getDataByCategory('demografi')?.isi}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          BPD (Badan Permusyawaratan Desa)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          Mewakili aspirasi masyarakat dan pengawasan terhadap pemerintah desa. BPD berperan sebagai mitra kerja pemerintah desa dalam menjalankan pemerintahan dan pembangunan.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Karang Taruna
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          Wadah organisasi kepemudaan untuk kegiatan sosial dan pemberdayaan remaja. Berperan aktif dalam mengembangkan potensi dan kreativitas pemuda desa.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upload Form - Only visible to admin users */}
        {isAdmin && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Kelola Data Profil Desa</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfilForm onSuccess={fetchProfilData} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}