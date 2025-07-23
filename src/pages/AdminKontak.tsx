import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, MessageCircle, Edit, ArrowLeft, Save } from "lucide-react";

interface KontakDesa {
  id: string;
  jenis_kontak: 'whatsapp' | 'telepon' | 'email' | 'alamat';
  label: string;
  nilai: string;
  aktif: boolean;
}

interface KontakData {
  whatsapp: KontakDesa | null;
  telepon: KontakDesa | null;
  email: KontakDesa | null;
  alamat: KontakDesa | null;
}

export default function AdminKontak() {
  const [kontakData, setKontakData] = useState<KontakData>({
    whatsapp: null,
    telepon: null,
    email: null,
    alamat: null,
  });
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    nilai: ''
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      fetchKontakData();
    }
  }, [isAdmin]);

  const fetchKontakData = async () => {
    try {
      const { data, error } = await supabase
        .from('kontak_desa')
        .select('*')
        .eq('aktif', true);
      
      if (error) throw error;
      
      const kontakMap: KontakData = {
        whatsapp: null,
        telepon: null,
        email: null,
        alamat: null,
      };
      
      data?.forEach((kontak: any) => {
        if (kontak.jenis_kontak && ['whatsapp', 'telepon', 'email', 'alamat'].includes(kontak.jenis_kontak)) {
          kontakMap[kontak.jenis_kontak as keyof KontakData] = {
            id: kontak.id,
            jenis_kontak: kontak.jenis_kontak,
            label: kontak.label || '',
            nilai: kontak.nilai || '',
            aktif: kontak.aktif
          };
        }
      });
      
      setKontakData(kontakMap);
    } catch (error) {
      console.error('Error fetching kontak data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data kontak",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type: string) => {
    const kontak = kontakData[type as keyof KontakData];
    setEditingType(type);
    setFormData({
      label: kontak?.label || getDefaultLabel(type),
      nilai: kontak?.nilai || ''
    });
  };

  const handleSave = async (type: string) => {
    if (!formData.label.trim()) {
      toast({
        title: "Error",
        description: "Label kontak tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    if (!formData.nilai.trim()) {
      toast({
        title: "Error",
        description: "Nilai kontak tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    // Validasi format berdasarkan jenis kontak
    if (type === 'whatsapp' || type === 'telepon') {
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(formData.nilai.trim())) {
        toast({
          title: "Error",
          description: "Format nomor telepon/WhatsApp tidak valid",
          variant: "destructive"
        });
        return;
      }
    }

    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.nilai.trim())) {
        toast({
          title: "Error",
          description: "Format email tidak valid",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      const existingKontak = kontakData[type as keyof KontakData];
      const kontakPayload = {
        jenis_kontak: type,
        label: formData.label.trim(),
        nilai: formData.nilai.trim(),
        aktif: true
      };

      if (existingKontak) {
        // Update existing
        const { error } = await supabase
          .from('kontak_desa')
          .update(kontakPayload)
          .eq('id', existingKontak.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('kontak_desa')
          .insert(kontakPayload);

        if (error) throw error;
      }

      toast({
        title: "Berhasil",
        description: "Kontak berhasil disimpan"
      });

      setEditingType(null);
      fetchKontakData();
    } catch (error: any) {
      console.error('Error saving kontak:', error);
      let errorMessage = "Gagal menyimpan kontak";
      
      if (error?.message) {
        if (error.message.includes('relation "kontak_desa" does not exist')) {
          errorMessage = "Tabel kontak_desa belum ada. Silakan jalankan script setup database terlebih dahulu.";
        } else if (error.message.includes('duplicate key')) {
          errorMessage = "Kontak dengan jenis ini sudah ada";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const getDefaultLabel = (type: string) => {
    switch (type) {
      case 'whatsapp': return 'WhatsApp Desa';
      case 'telepon': return 'Telepon Kantor';
      case 'email': return 'Email Desa';
      case 'alamat': return 'Alamat Kantor';
      default: return 'Kontak Desa';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageCircle className="w-6 h-6 text-white" />;
      case 'telepon': return <Phone className="w-6 h-6 text-white" />;
      case 'email': return <Mail className="w-6 h-6 text-white" />;
      case 'alamat': return <MapPin className="w-6 h-6 text-white" />;
      default: return <Phone className="w-6 h-6 text-white" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'whatsapp': return 'bg-green-500';
      case 'telepon': return 'bg-blue-500';
      case 'email': return 'bg-red-500';
      case 'alamat': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const renderKontakCard = (type: string) => {
    const kontak = kontakData[type as keyof KontakData];
    const isEditing = editingType === type;

    return (
      <Card key={type} className="relative">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${getIconBg(type)} rounded-lg flex items-center justify-center`}>
                {getIcon(type)}
              </div>
              <CardTitle className="text-lg capitalize">{type}</CardTitle>
            </div>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(type)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor={`label-${type}`}>Label</Label>
                <Input
                  id={`label-${type}`}
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Masukkan label kontak"
                />
              </div>
              <div>
                <Label htmlFor={`nilai-${type}`}>Nilai</Label>
                {type === 'alamat' ? (
                  <Textarea
                    id={`nilai-${type}`}
                    value={formData.nilai}
                    onChange={(e) => setFormData(prev => ({ ...prev, nilai: e.target.value }))}
                    placeholder="Masukkan alamat lengkap"
                    rows={3}
                  />
                ) : (
                  <Input
                    id={`nilai-${type}`}
                    value={formData.nilai}
                    onChange={(e) => setFormData(prev => ({ ...prev, nilai: e.target.value }))}
                    placeholder={`Masukkan ${type}`}
                    type={type === 'email' ? 'email' : 'text'}
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSave(type)}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingType(null)}
                >
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <p className="font-medium text-sm text-gray-600">Label:</p>
                <p className="text-gray-900">{kontak?.label || 'Belum diisi'}</p>
              </div>
              <div>
                <p className="font-medium text-sm text-gray-600">Nilai:</p>
                <p className="text-gray-900 break-all">{kontak?.nilai || 'Belum diisi'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
            <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Kelola Kontak Desa</h1>
            <p className="text-gray-600">Kelola informasi kontak desa yang ditampilkan di halaman publik</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/kontak')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Kontak
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderKontakCard('whatsapp')}
          {renderKontakCard('telepon')}
          {renderKontakCard('email')}
          {renderKontakCard('alamat')}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Petunjuk Penggunaan:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Klik tombol Edit pada setiap kartu kontak untuk mengubah informasi</li>
            <li>• Label adalah nama tampilan kontak (contoh: "WhatsApp Desa", "Telepon Kantor")</li>
            <li>• Nilai adalah informasi kontak yang sebenarnya (nomor, email, alamat)</li>
            <li>• Semua perubahan akan langsung terlihat di halaman kontak publik</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
