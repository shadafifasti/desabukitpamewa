import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Download, Upload, Trash2, Calendar, FileIcon } from "lucide-react";

interface ProdukHukum {
  id: string;
  judul: string;
  deskripsi: string | null;
  kategori: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  tanggal_upload: string;
}

export default function SuratKeputusan() {
  const [documents, setDocuments] = useState<ProdukHukum[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    file: null as File | null
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('produk_hukum')
        .select('*')
        .eq('kategori', 'surat_keputusan')
        .order('tanggal_upload', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Gagal memuat dokumen');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Hanya file PDF yang diizinkan');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Ukuran file maksimal 10MB');
        return;
      }
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !formData.judul.trim()) {
      toast.error('Judul dan file PDF wajib diisi');
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = 'pdf';
      const fileName = `${Date.now()}-${formData.file.name}`;
      const filePath = `surat_keputusan/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('produk-hukum')
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('produk-hukum')
        .getPublicUrl(filePath);

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('produk_hukum')
        .insert({
          judul: formData.judul.trim(),
          deskripsi: formData.deskripsi.trim() || null,
          kategori: 'surat_keputusan',
          file_url: publicUrl,
          file_name: formData.file.name,
          file_size: formData.file.size
        });

      if (dbError) throw dbError;

      toast.success('Dokumen berhasil diunggah');
      setFormData({ judul: "", deskripsi: "", file: null });
      setIsDialogOpen(false);
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Gagal mengunggah dokumen');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/');
      const filePath = urlParts.slice(-2).join('/'); // Get last 2 parts (folder/filename)

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('produk-hukum')
        .remove([filePath]);

      if (storageError) console.warn('Storage delete error:', storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from('produk_hukum')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      toast.success('Dokumen berhasil dihapus');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Gagal menghapus dokumen');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Surat Keputusan</h1>
          <p className="text-gray-600">
            Kumpulan dokumen Surat Keputusan yang berlaku di Desa Bukit Pamewa
          </p>
        </div>

        {/* Upload Button for Admin */}
        {user && (
          <div className="mb-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Surat Keputusan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Surat Keputusan</DialogTitle>
                  <DialogDescription>
                    Upload dokumen PDF Surat Keputusan baru
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="judul">Judul Surat Keputusan *</Label>
                    <Input
                      id="judul"
                      value={formData.judul}
                      onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
                      placeholder="Contoh: SK No. 1 Tahun 2024 tentang..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
                    <Textarea
                      id="deskripsi"
                      value={formData.deskripsi}
                      onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                      placeholder="Deskripsi singkat tentang surat keputusan ini..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="file">File PDF *</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Maksimal 10MB, hanya file PDF
                    </p>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={uploading} className="flex-1">
                      {uploading ? 'Mengunggah...' : 'Upload'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Documents List */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada dokumen Surat Keputusan
              </h3>
              <p className="text-gray-500">
                {user ? 'Klik tombol "Upload Surat Keputusan" untuk menambahkan dokumen pertama' : 'Dokumen akan ditampilkan di sini setelah diunggah oleh admin'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{doc.judul}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(doc.tanggal_upload)}
                      </CardDescription>
                    </div>
                    <FileIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  {doc.deskripsi && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {doc.deskripsi}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {formatFileSize(doc.file_size)}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => window.open(doc.file_url, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    {user && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Dokumen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus dokumen "{doc.judul}"? 
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(doc.id, doc.file_url)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
