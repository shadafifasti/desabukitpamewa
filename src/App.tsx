import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Profil from "./pages/Profil";
import Aparatur from "./pages/Aparatur";
import Berita from "./pages/Berita";
import Galeri from "./pages/Galeri";
import Lembaga from "./pages/Lembaga";
import Anggaran from "./pages/Anggaran";
import Statistik from "./pages/Statistik";
import Kontak from "./pages/Kontak";
import Pengaduan from "./pages/Pengaduan";
import Saran from "./pages/Saran";
import Auth from "./pages/Auth";
import AdminKontak from "./pages/AdminKontak";
import Perdes from "./pages/Perdes";
import Perkades from "./pages/Perkades";
import SuratKeputusan from "./pages/SuratKeputusan";
import PetaDesa from "./pages/PetaDesa";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/aparatur" element={<Aparatur />} />
            <Route path="/berita" element={<Berita />} />
            <Route path="/galeri" element={<Galeri />} />
            <Route path="/lembaga" element={<Lembaga />} />
            <Route path="/anggaran" element={<Anggaran />} />
            <Route path="/statistik" element={<Statistik />} />
            <Route path="/kontak" element={<Kontak />} />
            <Route path="/pengaduan" element={<Pengaduan />} />
            <Route path="/saran" element={<Saran />} />
            <Route path="/admin/kontak" element={<AdminKontak />} />
            <Route path="/perdes" element={<Perdes />} />
            <Route path="/perkades" element={<Perkades />} />
            <Route path="/surat-keputusan" element={<SuratKeputusan />} />
            <Route path="/peta-desa" element={<PetaDesa />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
