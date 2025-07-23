import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageSquare, Send, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import type { Tables } from "@/integrations/supabase/types";

export default function Pengaduan() {
  const [pengaduanData, setPengaduanData] = useState<Tables<"pengaduan_masyarakat">[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama_pengirim: '',
    isi_pengaduan: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    fetchPengaduanData();
  }, []);

  const fetchPengaduanData = async () => {
    try {
      const { data, error } = await supabase
        .from('pengaduan_masyarakat')
        .select('*')
        .order('tanggal', { ascending: false });
      
      if (error) throw error;
      setPengaduanData(data || []);
    } catch (error) {
      console.error('Error fetching pengaduan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_pengirim || !formData.isi_pengaduan) {
      toast({
        title: "Error",
        description: "Nama dan isi pengaduan harus diisi",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('pengaduan_masyarakat')
        .insert({
          nama_pengirim: formData.nama_pengirim,
          isi_pengaduan: formData.isi_pengaduan
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Pengaduan Anda telah berhasil dikirim"
      });

      setFormData({ nama_pengirim: '', isi_pengaduan: '' });
      fetchPengaduanData();
    } catch (error) {
      console.error('Error submitting pengaduan:', error);
      toast({
        title: "Error",
        description: "Gagal mengirim pengaduan",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'baru': 'bg-blue-100 text-blue-800',
      'proses': 'bg-yellow-100 text-yellow-800',
      'selesai': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pengaduan_masyarakat')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Pengaduan berhasil dihapus"
      });

      fetchPengaduanData();
    } catch (error) {
      console.error('Error deleting pengaduan:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus pengaduan",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Pengaduan Masyarakat</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sampaikan pengaduan atau keluhan Anda untuk perbaikan pelayanan desa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Pengaduan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Kirim Pengaduan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
                  <Input
                    value={formData.nama_pengirim}
                    onChange={(e) => setFormData(prev => ({ ...prev, nama_pengirim: e.target.value }))}
                    placeholder="Masukkan nama lengkap Anda"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Isi Pengaduan</label>
                  <Textarea
                    value={formData.isi_pengaduan}
                    onChange={(e) => setFormData(prev => ({ ...prev, isi_pengaduan: e.target.value }))}
                    placeholder="Jelaskan pengaduan Anda dengan detail..."
                    rows={6}
                    required
                  />
                </div>
                
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Mengirim...' : 'Kirim Pengaduan'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Daftar Pengaduan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Pengaduan Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-300 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : pengaduanData.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {pengaduanData.slice(0, 10).map((pengaduan) => (
                    <div key={pengaduan.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{pengaduan.nama_pengirim}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(pengaduan.status)}>
                            {pengaduan.status}
                          </Badge>
                          {isAdmin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Pengaduan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus pengaduan dari {pengaduan.nama_pengirim}? 
                                    Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(pengaduan.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {pengaduan.isi_pengaduan.length > 100 
                          ? `${pengaduan.isi_pengaduan.substring(0, 100)}...`
                          : pengaduan.isi_pengaduan
                        }
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(pengaduan.tanggal).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Belum ada pengaduan</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}