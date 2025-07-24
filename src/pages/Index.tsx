import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Phone, Mail, Users, FileText, Camera, BarChart3, MessageSquare, Building2, UsersRound, Calendar, ArrowRight, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Layout } from "@/components/Layout";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [galleryItems, setGalleryItems] = useState<Tables<"galeri_desa">[]>([]);
  const [newsItems, setNewsItems] = useState<Tables<"berita">[]>([]);
  const [latestNews, setLatestNews] = useState<Tables<"berita">[]>([]);
  const [strukturOrganisasi, setStrukturOrganisasi] = useState<Tables<"profil_desa"> | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fetchData = async () => {
    try {
      const [galleryResponse, newsResponse, latestNewsResponse, strukturResponse] = await Promise.all([
        supabase.from('galeri_desa').select('*').order('created_at', { ascending: false }),
        supabase.from('berita').select('*').order('created_at', { ascending: false }),
        supabase.from('berita').select('*').order('tanggal', { ascending: false }).limit(3),
        supabase.from('profil_desa').select('*').eq('kategori', 'struktur').single()
      ]);
      
      if (galleryResponse.error) throw galleryResponse.error;
      if (newsResponse.error) throw newsResponse.error;
      if (latestNewsResponse.error) throw latestNewsResponse.error;
      
      setGalleryItems(galleryResponse.data || []);
      setNewsItems(newsResponse.data || []);
      setLatestNews(latestNewsResponse.data || []);
      setStrukturOrganisasi(strukturResponse.data || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url('/lovable-uploads/53023924-55e8-4d5b-9882-839388f7e7f6.png')`
        }}
      >
        <div className="container mx-auto px-4 text-center text-white">
          <div className="flex flex-col items-center mb-8">
            <img 
              src="/lovable-uploads/827e1914-6e75-49a5-a945-b4942df94646.png" 
              alt="Logo Kepulauan Mentawai" 
              className="w-32 h-40 md:w-40 md:h-48 mb-6 drop-shadow-lg"
            />
            <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-shadow">
              Desa Bukit Pamewa
            </h1>
            <h2 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-medium mb-2 text-village-gold">
              Kepulauan Mentawai
            </h2>
            <p className="font-inter text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90">
              Portal resmi informasi dan layanan masyarakat Desa Bukit Pamewa
            </p>
            <Button 
              size="lg" 
              className="bg-village-green hover:bg-village-green-dark text-white font-inter font-semibold px-8 py-3 text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Jelajahi Website
            </Button>
          </div>
        </div>
      </section>

      {/* Village Profile Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-center mb-12 text-village-green-dark">
            Profil Desa Bukit Pamewa
          </h2>
          
          <Tabs defaultValue="sejarah" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
              <TabsTrigger value="sejarah" className="font-inter">Sejarah</TabsTrigger>
              <TabsTrigger value="visi-misi" className="font-inter">Visi & Misi</TabsTrigger>
              <TabsTrigger value="geografis" className="font-inter">Geografis</TabsTrigger>
              <TabsTrigger value="struktur" className="font-inter">Struktur</TabsTrigger>
              <TabsTrigger value="lembaga" className="font-inter">Lembaga</TabsTrigger>
            </TabsList>

            <TabsContent value="sejarah" className="mt-6">
              <Card className="bg-village-green-light border-0">
                <CardHeader>
                  <CardTitle className="font-playfair text-2xl text-village-green-dark flex items-center gap-3">
                    <FileText className="w-6 h-6" />
                    Sejarah Desa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-inter text-muted-foreground leading-relaxed text-lg">
                    Desa Bukit Pamewa atau singkatan dari Bukit Padang Mentawai Jawa, adalah sebuah desa yang berada di wilayah Kecamatan Sipora Utara, Kabupaten Kepulauan Mentawai, Provinsi Sumatra Barat, Indonesia. Desa ini terdiri dari 3 dusun yaitu Bukit Subur, Pamewa Indah, dan Subur Makmur.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visi-misi" className="mt-6">
              <div className="space-y-6">
                {/* Visi Card */}
                <Card className="bg-gradient-to-br from-village-green to-village-green-dark text-white border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="font-playfair text-2xl flex items-center gap-3">
                      <Users className="w-7 h-7" />
                      VISI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                      <p className="font-inter text-xl leading-relaxed text-center font-semibold">
                        BERSATU MEMBANGUN BUKIT PAMEWA YANG JUJUR, ADIL DAN SEJAHTERA
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Misi Card */}
                <Card className="bg-white border-2 border-village-green shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="font-playfair text-2xl text-village-green-dark flex items-center gap-3">
                      <Target className="w-7 h-7" />
                      MISI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-village-green-light rounded-lg p-5 border-l-4 border-village-green">
                        <div className="flex items-start gap-3">
                          <div className="bg-village-green text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mt-1">
                            1
                          </div>
                          <p className="font-inter text-village-green-dark text-lg leading-relaxed font-medium">
                            Meningkatkan profesionalisme dan kualitas SDM aparatur desa
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-village-green-light rounded-lg p-5 border-l-4 border-village-green">
                        <div className="flex items-start gap-3">
                          <div className="bg-village-green text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mt-1">
                            2
                          </div>
                          <p className="font-inter text-village-green-dark text-lg leading-relaxed font-medium">
                            Meningkatkan pembangunan fisik dan non-fisik di berbagai bidang
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-village-green-light rounded-lg p-5 border-l-4 border-village-green">
                        <div className="flex items-start gap-3">
                          <div className="bg-village-green text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mt-1">
                            3
                          </div>
                          <p className="font-inter text-village-green-dark text-lg leading-relaxed font-medium">
                            Menggali potensi desa dalam rangka mencari sumber PAD desa
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-village-green-light rounded-lg p-5 border-l-4 border-village-green">
                        <div className="flex items-start gap-3">
                          <div className="bg-village-green text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mt-1">
                            4
                          </div>
                          <p className="font-inter text-village-green-dark text-lg leading-relaxed font-medium">
                            Mengupayakan penuntasan batas lahan dan kejelasan lahan usaha dua
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-village-green-light rounded-lg p-5 border-l-4 border-village-green">
                        <div className="flex items-start gap-3">
                          <div className="bg-village-green text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mt-1">
                            5
                          </div>
                          <p className="font-inter text-village-green-dark text-lg leading-relaxed font-medium">
                            Optimalisasi BUMDes untuk peningkatan kesejahteraan dan ekonomi desa
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="geografis" className="mt-6">
              <Card className="bg-village-green text-white">
                <CardHeader>
                  <CardTitle className="font-playfair text-2xl flex items-center gap-3">
                    <MapPin className="w-6 h-6" />
                    Letak Geografis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="font-inter opacity-90 text-lg leading-relaxed">
                      Desa Bukit Pamewa terletak di Kecamatan Sipora Utara, Kabupaten Kepulauan Mentawai, Provinsi Sumatra Barat.
                    </p>
                    <div>
                      <h4 className="font-playfair text-xl font-semibold mb-3">Berbatasan dengan:</h4>
                      <ul className="font-inter opacity-90 space-y-2 text-lg">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                          Utara: Desa Sipora Jaya
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                          Selatan: Desa Saureinu
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                          Barat: Desa Sido Makmur
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                          Timur: Desa Goisooinan
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 mt-6">
                      <p className="font-playfair font-semibold text-xl">Luas Wilayah: 689,15 Ha</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="struktur" className="mt-6">
              <Card className="bg-village-green-light border-0">
                <CardHeader>
                  <CardTitle className="font-playfair text-2xl text-village-green-dark flex items-center gap-3">
                    <Building2 className="w-6 h-6" />
                    Struktur Organisasi Pemerintahan Desa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {strukturOrganisasi?.gambar_url ? (
                    <div className="flex justify-center">
                      <img
                        src={strukturOrganisasi.gambar_url}
                        alt="Struktur Organisasi Pemerintahan Desa"
                        className="max-w-full h-auto object-contain rounded-lg shadow-md"
                        style={{ maxHeight: '600px' }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-muted-foreground font-inter">
                        Belum ada struktur organisasi yang diunggah.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lembaga" className="mt-6">
              <Card className="bg-white border-2 border-village-green">
                <CardHeader>
                  <CardTitle className="font-playfair text-2xl text-village-green-dark flex items-center gap-3">
                    <UsersRound className="w-6 h-6" />
                    Lembaga Desa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-village-green-light border-0">
                      <CardHeader>
                        <CardTitle className="font-playfair text-xl text-village-green-dark flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          BPD (Badan Permusyawaratan Desa)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-inter text-muted-foreground leading-relaxed">
                          Mewakili aspirasi masyarakat dan pengawasan terhadap pemerintah desa. BPD berperan sebagai mitra kerja pemerintah desa dalam menjalankan pemerintahan dan pembangunan.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-village-green text-white border-0">
                      <CardHeader>
                        <CardTitle className="font-playfair text-xl flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Karang Taruna
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-inter opacity-90 leading-relaxed">
                          Wadah organisasi kepemudaan untuk kegiatan sosial dan pemberdayaan remaja. Berperan aktif dalam mengembangkan potensi dan kreativitas pemuda desa.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-village-green-light">
        <div className="container mx-auto px-4">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-center mb-12 text-village-green-dark">
            Layanan & Informasi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Profil Desa */}
            <Card className="bg-white hover:shadow-lg transition-shadow duration-300 border-0">
              <CardHeader className="text-center pb-4">
                <Users className="w-12 h-12 mx-auto mb-4 text-village-green" />
                <CardTitle className="font-playfair text-xl text-village-green-dark">Profil Desa</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-inter text-center text-muted-foreground">
                  Sejarah, visi misi, dan informasi umum desa
                </CardDescription>
              </CardContent>
            </Card>

            {/* Berita Desa */}
            <Dialog>
              <DialogTrigger asChild>
                <Card className="bg-white hover:shadow-lg transition-shadow duration-300 border-0 cursor-pointer">
                  <CardHeader className="text-center pb-4">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-village-green" />
                    <CardTitle className="font-playfair text-xl text-village-green-dark">Berita Desa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="font-inter text-center text-muted-foreground">
                      Informasi terkini dan kegiatan desa
                    </CardDescription>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-playfair text-2xl text-village-green-dark">Berita Desa</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, index) => (
                        <Card key={index} className="animate-pulse">
                          <CardContent className="p-4">
                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : newsItems.length > 0 ? (
                    <div className="space-y-4">
                      {newsItems.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              {item.gambar_url && (
                                <img 
                                  src={item.gambar_url} 
                                  alt={item.judul}
                                  className="w-24 h-24 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                <h3 className="font-playfair text-lg font-semibold text-village-green-dark mb-2">
                                  {item.judul}
                                </h3>
                                {item.isi && (
                                  <p className="font-inter text-muted-foreground text-sm mb-2 line-clamp-3">
                                    {item.isi}
                                  </p>
                                )}
                                <span className="font-inter text-xs text-muted-foreground">
                                  {new Date(item.tanggal).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="font-inter text-muted-foreground">
                        Berita akan segera ditambahkan
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Galeri Desa */}
            <Dialog>
              <DialogTrigger asChild>
                <Card className="bg-white hover:shadow-lg transition-shadow duration-300 border-0 cursor-pointer">
                  <CardHeader className="text-center pb-4">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-village-green" />
                    <CardTitle className="font-playfair text-xl text-village-green-dark">Galeri Desa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="font-inter text-center text-muted-foreground">
                      Dokumentasi kegiatan dan potensi desa
                    </CardDescription>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-playfair text-2xl text-village-green-dark">Galeri Desa</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, index) => (
                        <Card key={index} className="animate-pulse">
                          <div className="aspect-video bg-gray-300 rounded-t-lg"></div>
                          <CardContent className="p-4">
                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : galleryItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {galleryItems.map((item) => (
                        <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                          {item.gambar_url && (
                            <div className="aspect-video overflow-hidden">
                              <img 
                                src={item.gambar_url} 
                                alt={item.judul}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <CardContent className="p-4">
                            <h3 className="font-playfair text-base font-semibold text-village-green-dark mb-2">
                              {item.judul}
                            </h3>
                            {item.deskripsi && (
                              <p className="font-inter text-muted-foreground text-sm mb-3 line-clamp-2">
                                {item.deskripsi}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-sm">
                              <span className="bg-village-green-light text-village-green-dark px-2 py-1 rounded-full font-inter text-xs">
                                {item.kategori}
                              </span>
                              <span className="font-inter text-muted-foreground">
                                {new Date(item.tanggal).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="font-inter text-muted-foreground">
                        Galeri akan segera diisi dengan foto-foto kegiatan desa
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Data Statistik */}
            <Card className="bg-white hover:shadow-lg transition-shadow duration-300 border-0">
              <CardHeader className="text-center pb-4">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-village-green" />
                <CardTitle className="font-playfair text-xl text-village-green-dark">Data Statistik</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="font-inter text-center text-muted-foreground">
                  Data kependudukan dan statistik desa
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-16 bg-village-green-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-village-green-dark mb-4">
              Berita Terbaru
            </h2>
            <p className="font-inter text-muted-foreground text-lg max-w-2xl mx-auto">
              Informasi terkini seputar kegiatan dan perkembangan Desa Bukit Pamewa
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : latestNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestNews.map((news) => (
                <Card key={news.id} className="bg-white hover:shadow-lg transition-all duration-300 group overflow-hidden">
                  {news.gambar_url && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={news.gambar_url} 
                        alt={news.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-village-green" />
                      <span className="font-inter text-sm text-muted-foreground">
                        {new Date(news.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <h3 className="font-playfair text-xl font-semibold text-village-green-dark mb-3 line-clamp-2 group-hover:text-village-green transition-colors">
                      {news.judul}
                    </h3>
                    
                    {news.isi && (
                      <p className="font-inter text-muted-foreground text-sm mb-4 line-clamp-3">
                        {news.isi.length > 150 ? `${news.isi.substring(0, 150)}...` : news.isi}
                      </p>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-village-green text-village-green hover:bg-village-green hover:text-white transition-colors group/btn"
                      onClick={() => navigate('/berita')}
                    >
                      <span className="font-inter font-medium">Baca Selengkapnya</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-playfair text-xl font-semibold text-village-green-dark mb-2">
                Belum Ada Berita
              </h3>
              <p className="font-inter text-muted-foreground">
                Berita terbaru akan segera ditampilkan di sini
              </p>
            </div>
          )}
          
          {latestNews.length > 0 && (
            <div className="text-center mt-12">
              <Button 
                size="lg"
                className="bg-village-green hover:bg-village-green-dark text-white font-inter font-semibold px-8 py-3"
                onClick={() => navigate('/berita')}
              >
                Lihat Semua Berita
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-center mb-12 text-village-green-dark">
            Akses Cepat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-village-green text-white hover:bg-village-green-dark transition-colors duration-300">
              <CardHeader className="text-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-4" />
                <CardTitle className="font-playfair text-xl">Pengaduan Masyarakat</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-inter mb-4 opacity-90">
                  Sampaikan keluhan dan saran untuk kemajuan desa
                </p>
                <Button 
                  variant="secondary" 
                  className="bg-white text-village-green hover:bg-gray-100"
                  onClick={() => scrollToSection('pengaduan-section')}
                >
                  Kirim Pengaduan
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-village-green hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <MapPin className="w-10 h-10 mx-auto mb-4 text-village-green" />
                <CardTitle className="font-playfair text-xl text-village-green-dark">Peta Desa</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-inter mb-4 text-muted-foreground">
                  Jelajahi lokasi-lokasi penting di desa
                </p>
                <Button className="bg-village-green hover:bg-village-green-dark">
                  Lihat Peta
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-village-gold hover:bg-opacity-90 transition-colors duration-300">
              <CardHeader className="text-center">
                <Phone className="w-10 h-10 mx-auto mb-4 text-white" />
                <CardTitle className="font-playfair text-xl text-white">Kontak Darurat</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-inter mb-4 text-white opacity-90">
                  Hubungi layanan darurat dan kontak penting
                </p>
                <Button 
                  variant="secondary" 
                  className="bg-white text-village-gold hover:bg-gray-100"
                  onClick={() => navigate('/kontak')}
                >
                  Lihat Kontak
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pengaduan Masyarakat Section */}
      <section id="pengaduan-section" className="py-16 bg-village-green">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white mb-4">
              Pengaduan Masyarakat
            </h2>
            <p className="font-inter text-white opacity-90 text-lg max-w-2xl mx-auto">
              Sampaikan aspirasi, keluhan, dan saran Anda untuk kemajuan Desa Bukit Pamewa
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-village-green" />
                <CardTitle className="font-playfair text-xl text-village-green-dark">Kirim Pengaduan</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-inter text-muted-foreground mb-6">
                  Laporkan masalah atau keluhan yang perlu ditindaklanjuti oleh pemerintah desa
                </p>
                <Button 
                  size="lg"
                  className="bg-village-green hover:bg-village-green-dark w-full"
                  onClick={() => navigate('/pengaduan')}
                >
                  Buat Pengaduan Baru
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <CardTitle className="font-playfair text-xl text-village-green-dark">Kirim Saran</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-inter text-muted-foreground mb-6">
                  Berikan masukan dan ide untuk pembangunan dan kemajuan desa
                </p>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-village-green text-village-green hover:bg-village-green hover:text-white w-full"
                  onClick={() => navigate('/saran')}
                >
                  Kirim Saran
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-6">
                <h3 className="font-playfair text-xl font-semibold text-white mb-4">
                  Komitmen Kami
                </h3>
                <p className="font-inter text-white opacity-90">
                  Setiap pengaduan dan saran akan ditindaklanjuti dalam waktu maksimal 7 hari kerja. 
                  Kami berkomitmen untuk memberikan pelayanan terbaik bagi masyarakat Desa Bukit Pamewa.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-village-green-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-playfair text-2xl font-bold mb-4">Desa Bukit Pamewa</h3>
              <p className="font-inter opacity-90">
                Jln.Pendopo-pdam km 10, kode pos: 25392
              </p>
              <p className="font-inter opacity-90">
                Kepulauan Mentawai, Sumatera Barat, Indonesia
              </p>
            </div>
            <div className="text-center">
              <h4 className="font-playfair text-lg font-semibold mb-4">Kontak</h4>
              <div className="space-y-2 font-inter">
                <div className="flex items-center justify-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>+62 xxx-xxxx-xxxx</span>
                </div>
                <div className="flex items-center justify-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>pamewa22@gmail.com</span>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <h4 className="font-playfair text-lg font-semibold mb-4">Jam Operasional</h4>
              <div className="space-y-1 font-inter opacity-90">
                <p>Senin - Jumat: 08:00 - 16:00</p>
                <p>Sabtu: 08:00 - 12:00</p>
                <p>Minggu: Tutup</p>
              </div>
            </div>
          </div>
          <div className="border-t border-village-green mt-8 pt-8 text-center font-inter opacity-75">
            <p>&copy; 2024 Desa Bukit Pamewa. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;