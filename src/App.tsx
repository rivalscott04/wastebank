import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminNasabah from "./pages/admin/Nasabah";
import AdminKategori from "./pages/admin/Kategori";
import PenjemputanSampah from "./pages/admin/PenjemputanSampah";
import Transaksi from "./pages/admin/Transaksi";
import NasabahDashboard from "./pages/nasabah/Dashboard";
import ProfilNasabah from "./pages/nasabah/Profil";
import RiwayatTransaksi from "./pages/nasabah/RiwayatTransaksi";
import RequestJemput from "./pages/nasabah/RequestJemput";
import TukarPoin from "./pages/nasabah/TukarPoin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/nasabah" element={<AdminNasabah />} />
          <Route path="/admin/kategori" element={<AdminKategori />} />
          <Route path="/admin/penjemputan" element={<PenjemputanSampah />} />
          <Route path="/admin/transaksi" element={<Transaksi />} />
          <Route path="/nasabah/dashboard" element={<NasabahDashboard />} />
          <Route path="/nasabah/profil" element={<ProfilNasabah />} />
          <Route path="/nasabah/riwayat" element={<RiwayatTransaksi />} />
          <Route path="/nasabah/jemput" element={<RequestJemput />} />
          <Route path="/nasabah/tukar-poin" element={<TukarPoin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
