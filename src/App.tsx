import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import SkeletonLoader from "@/components/SkeletonLoader";

// Lazy load components for better code splitting
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

// Admin pages - lazy loaded
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminNasabah = lazy(() => import("./pages/admin/Nasabah"));
const AdminKategori = lazy(() => import("./pages/admin/Kategori"));
const PenjemputanSampah = lazy(() => import("./pages/admin/PenjemputanSampah"));
const Transaksi = lazy(() => import("./pages/admin/Transaksi"));
const Settings = lazy(() => import("./pages/admin/Settings"));


// Nasabah pages - lazy loaded
const NasabahDashboard = lazy(() => import("./pages/nasabah/Dashboard"));
const ProfilNasabah = lazy(() => import("./pages/nasabah/Profil"));
const RiwayatTransaksi = lazy(() => import("./pages/nasabah/RiwayatTransaksi"));
const RequestJemput = lazy(() => import("./pages/nasabah/RequestJemput"));

// Error page - can be loaded immediately as it's small
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Loading fallback component
const LoadingFallback = ({ type = 'dashboard' }: { type?: string }) => (
  <div className="min-h-screen bg-gray-50">
    <SkeletonLoader type={type as any} />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={
              <Suspense fallback={<LoadingFallback type="form" />}>
                <Login />
              </Suspense>
            } />
            <Route path="/register" element={
              <Suspense fallback={<LoadingFallback type="form" />}>
                <Register />
              </Suspense>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <Suspense fallback={<LoadingFallback type="dashboard" />}>
                <AdminDashboard />
              </Suspense>
            } />
            <Route path="/admin/nasabah" element={
              <Suspense fallback={<LoadingFallback type="table" />}>
                <AdminNasabah />
              </Suspense>
            } />
            <Route path="/admin/kategori" element={
              <Suspense fallback={<LoadingFallback type="table" />}>
                <AdminKategori />
              </Suspense>
            } />
            <Route path="/admin/penjemputan" element={
              <Suspense fallback={<LoadingFallback type="table" />}>
                <PenjemputanSampah />
              </Suspense>
            } />
            <Route path="/admin/transaksi" element={
              <Suspense fallback={<LoadingFallback type="table" />}>
                <Transaksi />
              </Suspense>
            } />
            <Route path="/admin/settings" element={
              <Suspense fallback={<LoadingFallback type="table" />}>
                <Settings />
              </Suspense>
            } />


            {/* Nasabah Routes */}
            <Route path="/nasabah/dashboard" element={
              <Suspense fallback={<LoadingFallback type="dashboard" />}>
                <NasabahDashboard />
              </Suspense>
            } />
            <Route path="/nasabah/profil" element={
              <Suspense fallback={<LoadingFallback type="profile" />}>
                <ProfilNasabah />
              </Suspense>
            } />
            <Route path="/nasabah/riwayat" element={
              <Suspense fallback={<LoadingFallback type="riwayat" />}>
                <RiwayatTransaksi />
              </Suspense>
            } />
            <Route path="/nasabah/jemput" element={
              <Suspense fallback={<LoadingFallback type="request-jemput" />}>
                <RequestJemput />
              </Suspense>
            } />


            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
