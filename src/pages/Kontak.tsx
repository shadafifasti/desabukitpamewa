import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Mail, MapPin, MessageCircle, Settings, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";

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
  updated_at?: string;
}

export default function Kontak() {
  const [kontakData, setKontakData] = useState<KontakData>({
    whatsapp: null,
    telepon: null,
    email: null,
    alamat: null
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    fetchKontakData();
  }, []);

  const fetchKontakData = async () => {
    try {
      const { data, error } = await supabase
        .from('kontak_desa')
        .select('*')
        .eq('aktif', true);
      
      if (error) throw error;
      
      // Organize data by jenis_kontak
      const organizedData: KontakData = {
        whatsapp: null,
        telepon: null,
        email: null,
        alamat: null
      };
      
      data?.forEach((kontak: KontakDesa) => {
        if (kontak.jenis_kontak && organizedData.hasOwnProperty(kontak.jenis_kontak)) {
          organizedData[kontak.jenis_kontak] = kontak;
        }
      });
      
      setKontakData(organizedData);
    } catch (error) {
      console.error('Error fetching kontak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (jenis: 'whatsapp' | 'telepon' | 'email' | 'alamat') => {
    switch (jenis) {
      case 'telepon': return <Phone className="w-8 h-8 text-white" />;
      case 'whatsapp': return <MessageCircle className="w-8 h-8 text-white" />;
      case 'email': return <Mail className="w-8 h-8 text-white" />;
      case 'alamat': return <MapPin className="w-8 h-8 text-white" />;
    }
  };

  const getIconBg = (jenis: 'whatsapp' | 'telepon' | 'email' | 'alamat') => {
    switch (jenis) {
      case 'telepon': return 'bg-blue-500';
      case 'whatsapp': return 'bg-green-500';
      case 'email': return 'bg-red-500';
      case 'alamat': return 'bg-purple-500';
    }
  };

  const getLabel = (jenis: 'whatsapp' | 'telepon' | 'email' | 'alamat') => {
    switch (jenis) {
      case 'telepon': return 'No. Telepon';
      case 'whatsapp': return 'WhatsApp';
      case 'email': return 'Email';
      case 'alamat': return 'Alamat';
    }
  };

  const formatValue = (jenis: 'whatsapp' | 'telepon' | 'email' | 'alamat', nilai: string) => {
    if (jenis === 'whatsapp' && nilai) {
      return `https://wa.me/${nilai.replace(/[^0-9]/g, '')}`;
    }
    if (jenis === 'email' && nilai) {
      return `mailto:${nilai}`;
    }
    return nilai;
  };

  const renderKontakCard = (jenis: 'whatsapp' | 'telepon' | 'email' | 'alamat') => {
    const kontak = kontakData[jenis];
    const hasData = kontak && kontak.nilai;
    
    return (
      <Card key={jenis} className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full ${getIconBg(jenis)}`}>
              {getIcon(jenis)}
            </div>
            <CardTitle className="text-lg font-semibold">
              {getLabel(jenis)}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="space-y-2">
              {jenis === 'whatsapp' || jenis === 'email' ? (
                <a
                  href={formatValue(jenis, kontak.nilai)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  {kontak.nilai}
                </a>
              ) : (
                <p className="font-medium text-gray-900">{kontak.nilai}</p>
              )}
              {kontak.label && kontak.label !== getLabel(jenis) && (
                <p className="text-sm text-gray-600">{kontak.label}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">Belum diisi</p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-300 rounded"></div>
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
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-primary mb-4">Kontak Desa</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hubungi kami untuk informasi lebih lanjut mengenai layanan dan kegiatan Desa Bukit Pamewa
            </p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => navigate('/admin/kontak')}
              className="ml-4"
            >
              <Settings className="w-4 h-4 mr-2" />
              Kelola Kontak
            </Button>
          )}
        </div>

        {/* 4 Kotak Kontak Tetap */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderKontakCard('whatsapp')}
          {renderKontakCard('telepon')}
          {renderKontakCard('email')}
          {renderKontakCard('alamat')}
        </div>

        {/* Jam Pelayanan */}
        <Card className="mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Jam Pelayanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Hari Kerja</h3>
                <p className="text-muted-foreground">Senin - Jumat</p>
                <p className="text-xl font-bold text-primary">08:00 - 16:00 WIB</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Weekend</h3>
                <p className="text-muted-foreground">Sabtu - Minggu</p>
                <p className="text-xl font-bold text-red-600">Tutup</p>
              </div>
            </div>
            <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800">
                <strong>Catatan:</strong> Untuk pelayanan darurat atau hal mendesak, dapat menghubungi melalui WhatsApp
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}