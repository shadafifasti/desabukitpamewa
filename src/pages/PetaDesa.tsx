import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, Upload, MapPin, Eye, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Tables } from "@/integrations/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type PetaDesa = Tables<"peta_desa">;

const PetaDesa = () => {
  const [petaData, setPetaData] = useState<PetaDesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    koordinat_lat: "",
    koordinat_lng: "",
    zoom_level: "14",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    fetchPetaData();
  }, []);

  const fetchPetaData = async () => {
    try {
      const { data, error } = await supabase
        .from("peta_desa")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPetaData(data || []);
    } catch (error) {
      console.error("Error fetching peta data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data peta desa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file maksimal 10MB",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "File harus berupa gambar",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `peta/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("peta-desa")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("peta-desa")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Hanya admin yang dapat mengelola peta desa",
        variant: "destructive",
      });
      return;
    }

    if (!formData.judul.trim()) {
      toast({
        title: "Error",
        description: "Judul harus diisi",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      let gambar_url = "";
      let gambar_filename = "";

      if (selectedFile) {
        gambar_url = await uploadImage(selectedFile);
        gambar_filename = selectedFile.name;
      }

      const petaDataToSave = {
        judul: formData.judul,
        deskripsi: formData.deskripsi || null,
        koordinat_lat: formData.koordinat_lat ? parseFloat(formData.koordinat_lat) : null,
        koordinat_lng: formData.koordinat_lng ? parseFloat(formData.koordinat_lng) : null,
        zoom_level: parseInt(formData.zoom_level),
        ...(gambar_url && { gambar_url, gambar_filename }),
      };

      if (editingId) {
        const { error } = await supabase
          .from("peta_desa")
          .update(petaDataToSave)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Peta desa berhasil diperbarui",
        });
      } else {
        const { error } = await supabase
          .from("peta_desa")
          .insert([petaDataToSave]);

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: "Peta desa berhasil ditambahkan",
        });
      }

      // Reset form
      setFormData({
        judul: "",
        deskripsi: "",
        koordinat_lat: "",
        koordinat_lng: "",
        zoom_level: "14",
      });
      setSelectedFile(null);
      setEditingId(null);
      fetchPetaData();
    } catch (error) {
      console.error("Error saving peta:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan peta desa",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (peta: PetaDesa) => {
    setFormData({
      judul: peta.judul,
      deskripsi: peta.deskripsi || "",
      koordinat_lat: peta.koordinat_lat?.toString() || "",
      koordinat_lng: peta.koordinat_lng?.toString() || "",
      zoom_level: peta.zoom_level?.toString() || "14",
    });
    setEditingId(peta.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string, gambar_url?: string) => {
    if (!isAdmin) return;

    try {
      // Delete image from storage if exists
      if (gambar_url) {
        const path = gambar_url.split("/").pop();
        if (path) {
          await supabase.storage.from("peta-desa").remove([`peta/${path}`]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from("peta_desa")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Peta desa berhasil dihapus",
      });

      fetchPetaData();
    } catch (error) {
      console.error("Error deleting peta:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus peta desa",
        variant: "destructive",
      });
    }
  };

  const openImageModal = (url: string, title: string) => {
    setSelectedImage({ url, title });
    document.body.style.overflow = "hidden";
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = "unset";
  };

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeImageModal();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-village-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data peta desa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-village-green mb-4">
          Peta Desa Bukit Pamewa
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Peta wilayah dan lokasi penting di Desa Bukit Pamewa untuk memudahkan navigasi dan informasi geografis
        </p>
      </div>

      {/* Admin Form */}
      {isAdmin && (
        <Card className="mb-8 border-village-green/20">
          <CardHeader className="bg-gradient-to-r from-village-green/10 to-village-brown/10">
            <CardTitle className="flex items-center gap-2 text-village-green">
              <Upload className="w-5 h-5" />
              {editingId ? "Edit Peta Desa" : "Upload Peta Desa"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="judul">Judul Peta *</Label>
                    <Input
                      id="judul"
                      value={formData.judul}
                      onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                      placeholder="Contoh: Peta Wilayah Desa Bukit Pamewa"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="deskripsi">Deskripsi</Label>
                    <Textarea
                      id="deskripsi"
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                      placeholder="Deskripsi peta dan informasi tambahan..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="file">Upload Gambar Peta</Label>
                    <Input
                      id="file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Format: JPG, PNG, GIF. Maksimal 10MB
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lat">Latitude</Label>
                      <Input
                        id="lat"
                        value={formData.koordinat_lat}
                        onChange={(e) => setFormData({ ...formData, koordinat_lat: e.target.value })}
                        placeholder="-6.2088"
                        type="number"
                        step="any"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng">Longitude</Label>
                      <Input
                        id="lng"
                        value={formData.koordinat_lng}
                        onChange={(e) => setFormData({ ...formData, koordinat_lng: e.target.value })}
                        placeholder="106.8456"
                        type="number"
                        step="any"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="zoom">Zoom Level</Label>
                    <Input
                      id="zoom"
                      value={formData.zoom_level}
                      onChange={(e) => setFormData({ ...formData, zoom_level: e.target.value })}
                      placeholder="14"
                      type="number"
                      min="1"
                      max="20"
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Tips Koordinat:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Buka Google Maps</li>
                      <li>• Klik kanan pada lokasi desa</li>
                      <li>• Copy koordinat yang muncul</li>
                      <li>• Paste ke form di atas</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={uploading}
                  className="bg-village-green hover:bg-village-green/90"
                >
                  {uploading ? "Menyimpan..." : editingId ? "Update Peta" : "Simpan Peta"}
                </Button>
                {editingId && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        judul: "",
                        deskripsi: "",
                        koordinat_lat: "",
                        koordinat_lng: "",
                        zoom_level: "14",
                      });
                      setSelectedFile(null);
                    }}
                  >
                    Batal Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Peta Display */}
      <div className="space-y-6">
        {petaData.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Belum Ada Peta Desa
              </h3>
              <p className="text-gray-500">
                {isAdmin 
                  ? "Gunakan form di atas untuk menambahkan peta desa pertama"
                  : "Peta desa akan ditampilkan di sini setelah admin mengunggahnya"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          petaData.map((peta) => (
            <Card key={peta.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-village-green/10 to-village-brown/10">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-village-green text-xl mb-2">
                      {peta.judul}
                    </CardTitle>
                    {peta.deskripsi && (
                      <p className="text-gray-600">{peta.deskripsi}</p>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(peta)}
                        className="hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Peta Desa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus peta "{peta.judul}"? 
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(peta.id, peta.gambar_url || undefined)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {peta.gambar_url ? (
                  <div className="relative group">
                    <img
                      src={peta.gambar_url}
                      alt={peta.judul}
                      className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openImageModal(peta.gambar_url!, peta.judul)}
                      style={{ maxHeight: '600px', objectFit: 'contain' }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Belum ada gambar peta</p>
                    </div>
                  </div>
                )}
                
                {/* Koordinat Info */}
                {(peta.koordinat_lat && peta.koordinat_lng) && (
                  <div className="p-4 bg-gray-50 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        Koordinat: {peta.koordinat_lat}, {peta.koordinat_lng}
                        {peta.zoom_level && ` (Zoom: ${peta.zoom_level})`}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div className="w-full h-full max-w-6xl max-h-full overflow-auto">
            <div className="min-h-full flex flex-col items-center justify-center py-8 px-4">
              <div className="bg-white rounded-lg shadow-2xl max-w-full">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full h-auto max-w-none rounded-lg"
                  style={{ maxHeight: 'none' }}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                  <h3 className="text-white text-lg font-semibold">{selectedImage.title}</h3>
                </div>
              </div>
              <p className="text-white/80 text-sm mt-4 text-center">
                Klik di luar gambar atau tekan ESC untuk menutup • Scroll untuk melihat detail
              </p>
            </div>
          </div>
          <button
            onClick={closeImageModal}
            className="fixed top-6 right-6 z-20 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <Trash2 className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PetaDesa;
