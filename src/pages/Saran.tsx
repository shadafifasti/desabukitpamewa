import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Send, MessageCircle, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import type { Tables } from "@/integrations/supabase/types";

export default function Saran() {
  const [saranData, setSaranData] = useState<Tables<"saran_masyarakat">[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama_pengirim: '',
    saran: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    fetchSaranData();
  }, []);

  const fetchSaranData = async () => {
    try {
      const { data, error } = await supabase
        .from('saran_masyarakat')
        .select('*')
        .order('tanggal', { ascending: false });
      
      if (error) throw error;
      setSaranData(data || []);
    } catch (error) {
      console.error('Error fetching saran data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_pengirim || !formData.saran) {
      toast({
        title: "Error",
        description: "Nama dan saran harus diisi",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('saran_masyarakat')
        .insert({
          nama_pengirim: formData.nama_pengirim,
          saran: formData.saran
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Saran Anda telah berhasil dikirim"
      });

      setFormData({ nama_pengirim: '', saran: '' });
      fetchSaranData();
    } catch (error) {
      console.error('Error submitting saran:', error);
      toast({
        title: "Error",
        description: "Gagal mengirim saran",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saran_masyarakat')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Saran berhasil dihapus"
      });

      fetchSaranData();
    } catch (error) {
      console.error('Error deleting saran:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus saran",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Saran Masyarakat</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Berikan saran dan masukan untuk kemajuan Desa Bukit Pamewa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Saran */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Kirim Saran
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
                  <label className="block text-sm font-medium mb-2">Saran</label>
                  <Textarea
                    value={formData.saran}
                    onChange={(e) => setFormData(prev => ({ ...prev, saran: e.target.value }))}
                    placeholder="Sampaikan saran Anda untuk kemajuan desa..."
                    rows={6}
                    required
                  />
                </div>
                
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Mengirim...' : 'Kirim Saran'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Daftar Saran */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Saran Masyarakat
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-300 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : saranData.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {saranData.slice(0, 10).map((saran) => (
                    <div key={saran.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{saran.nama_pengirim}</h4>
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Saran</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus saran dari {saran.nama_pengirim}? 
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(saran.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {saran.saran.length > 100 
                          ? `${saran.saran.substring(0, 100)}...`
                          : saran.saran
                        }
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(saran.tanggal).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Belum ada saran</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}