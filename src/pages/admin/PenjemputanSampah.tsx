import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import ConfirmDialog from '@/components/ConfirmDialog';
import {
  Plus,
  Edit,
  Trash2,
  Truck,
  MapPin,
  Calendar,
  Weight,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Star
} from 'lucide-react';
import { wasteService } from '@/services/waste.service';

interface PickupRequest {
  id: string;
  user_id: string;
  user_name: string;
  waste_id: string;
  waste_name: string;
  address: string;
  date_request: string;
  estimated_weight: number;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  created_at: string;
}

const PenjemputanSampah = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteRequest, setDeleteRequest] = useState<PickupRequest | null>(null);
  const [formData, setFormData] = useState({
    user_name: '',
    waste_name: '',
    address: '',
    date_request: '',
    estimated_weight: '',
    status: 'pending' as const
  });

  // Mock data
  const mockPickupRequests: PickupRequest[] = [
    {
      id: '1',
      user_id: '1',
      user_name: 'Siti Nurhaliza',
      waste_id: '1',
      waste_name: 'Plastik Botol',
      address: 'Jl. Merdeka No. 123, Jakarta Pusat',
      date_request: '2024-01-20',
      estimated_weight: 5.5,
      status: 'pending',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      user_id: '2',
      user_name: 'Budi Santoso',
      waste_id: '2',
      waste_name: 'Kertas Bekas',
      address: 'Jl. Sudirman No. 456, Jakarta Selatan',
      date_request: '2024-01-22',
      estimated_weight: 8.2,
      status: 'approved',
      created_at: '2024-01-16T14:30:00Z'
    },
    {
      id: '3',
      user_id: '3',
      user_name: 'Ahmad Wijaya',
      waste_id: '3',
      waste_name: 'Logam Bekas',
      address: 'Jl. Thamrin No. 789, Jakarta Pusat',
      date_request: '2024-01-18',
      estimated_weight: 12.0,
      status: 'completed',
      created_at: '2024-01-12T09:15:00Z'
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const userData = localStorage.getItem('user');
      if (!userData) {
        navigate('/login');
        return;
      }
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        toast.error("Akses Ditolak", {
          description: "Anda tidak memiliki akses ke halaman admin",
        });
        navigate('/');
        return;
      }
      setUser(parsedUser);
      // Fetch dari backend
      try {
        const res = await wasteService.getPickupRequests();
        // Mapping data jika perlu
        const statusMap: Record<string, PickupRequest['status']> = {
          pending: 'pending',
          approved: 'approved',
          confirmed: 'approved',
          completed: 'completed',
          cancelled: 'cancelled',
          processing: 'approved',
          in_progress: 'approved',
        };
        const data = (res.data || res).map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          user_name: item.user?.name || '-',
          waste_id: item.items?.[0]?.category_id || '-',
          waste_name: item.items && item.items.length > 0
            ? item.items.map((i: any) => i.category?.name).filter(Boolean).join(', ')
            : '-',
          address: item.pickup_address,
          date_request: item.pickup_date,
          estimated_weight: item.items?.reduce((sum: number, i: any) => sum + Number(i.estimated_weight || 0), 0),
          status: statusMap[item.status] || 'pending',
          created_at: item.createdAt
        }));
        setPickupRequests(data);
      } catch (e) {
        toast.error('Gagal memuat data penjemputan');
      }
      setIsLoading(false);
    };
    loadData();
  }, [navigate]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Menunggu' },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Disetujui' },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Disetujui' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Selesai' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Dibatalkan' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge className="bg-gray-100 text-gray-500">Status tidak diketahui</Badge>;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const openAddDialog = () => {
    setFormData({
      user_name: '',
      waste_name: '',
      address: '',
      date_request: '',
      estimated_weight: '',
      status: 'pending'
    });
    setIsAddDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Add new request
    const newRequest: PickupRequest = {
      id: Date.now().toString(),
      user_id: Date.now().toString(),
      user_name: formData.user_name,
      waste_id: Date.now().toString(),
      waste_name: formData.waste_name,
      address: formData.address,
      date_request: formData.date_request,
      estimated_weight: parseFloat(formData.estimated_weight),
      status: formData.status,
      created_at: new Date().toISOString()
    };

    setPickupRequests(prev => [...prev, newRequest]);
    toast.success("Permintaan penjemputan baru berhasil ditambahkan!", {
      description: `Permintaan dari ${formData.user_name} telah terdaftar`,
    });
    setIsAddDialogOpen(false);

    // Reset form
    setFormData({
      user_name: '',
      waste_name: '',
      address: '',
      date_request: '',
      estimated_weight: '',
      status: 'pending'
    });
  };

  const handleDelete = (request: PickupRequest) => {
    setDeleteRequest(request);
  };

  const confirmDelete = async () => {
    if (deleteRequest) {
      try {
        setIsLoading(true);
        await wasteService.deleteWasteCollection(Number(deleteRequest.id));
        
        // Refresh data dari API
        const res = await wasteService.getPickupRequests();
        const data = (res.data || res).map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          user_name: item.user?.name || 'Unknown',
          waste_id: item.items?.[0]?.category_id || '-',
          waste_name: item.items && item.items.length > 0
            ? item.items.map((i: any) => i.category?.name).filter(Boolean).join(', ')
            : '-',
          address: item.pickup_address,
          date_request: item.pickup_date,
          estimated_weight: item.items?.reduce((sum: number, i: any) => sum + Number(i.estimated_weight || 0), 0) || 0,
          status: item.status,
          created_at: item.createdAt
        }));
        setPickupRequests(data);
        
        toast.success("Permintaan penjemputan berhasil dihapus!", {
          description: `Permintaan dari ${deleteRequest.user_name} telah dihapus dari sistem`,
        });
        
        // Trigger pickup history refresh for nasabah
        window.dispatchEvent(new CustomEvent('pickup-refresh'));
        localStorage.setItem('pickup-update', Date.now().toString());
      } catch (error) {
        toast.error("Gagal menghapus permintaan penjemputan", {
          description: "Terjadi kesalahan saat menghapus data"
        });
      } finally {
        setIsLoading(false);
        setDeleteRequest(null);
      }
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      await wasteService.updatePickupStatus(Number(requestId), newStatus);
      setPickupRequests(prev => prev.map(request =>
        request.id === requestId
          ? { ...request, status: newStatus as PickupRequest['status'] }
          : request
      ));
      const statusText = {
        'pending': 'Menunggu',
        'approved': 'Disetujui',
        'completed': 'Selesai',
        'cancelled': 'Dibatalkan'
      }[newStatus] || newStatus;
      toast.success("Status berhasil diperbarui!", {
        description: `Status permintaan diubah menjadi ${statusText}`,
      });
      
      // Trigger dashboard refresh if status is completed
      if (newStatus === 'completed') {
        window.dispatchEvent(new CustomEvent('dashboard-refresh'));
        localStorage.setItem('dashboard-update', Date.now().toString());
        
        // Trigger transaction history refresh for nasabah
        window.dispatchEvent(new CustomEvent('transaction-refresh'));
        localStorage.setItem('transaction-update', Date.now().toString());
      }
      
      // Trigger pickup history refresh for nasabah (for all status changes)
      window.dispatchEvent(new CustomEvent('pickup-refresh'));
      localStorage.setItem('pickup-update', Date.now().toString());
    } catch (error: any) {
      toast.error('Gagal memperbarui status', {
        description: error?.response?.data?.message || 'Terjadi kesalahan saat update status',
      });
    }
  };

  // Stats calculation
  const stats = {
    total: pickupRequests.length,
    pending: pickupRequests.filter(r => r.status === 'pending').length,
    approved: pickupRequests.filter(r => r.status === 'approved').length,
    completed: pickupRequests.filter(r => r.status === 'completed').length,
    totalWeight: pickupRequests.reduce((sum, r) => sum + r.estimated_weight, 0)
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar role="admin" />
        <div className="flex-1 lg:ml-0 p-4 lg:p-8">
          <SkeletonLoader type="table" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role="admin" />

      <div className="flex-1 lg:ml-0">
        <main className="p-4 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold flex items-center gap-2 pl-12 lg:pl-0">
              <Truck className="w-6 h-6 mr-3 text-bank-green-600" />
              Kelola Penjemputan Sampah
            </h1>
            <p className="text-gray-600">
              Kelola permintaan penjemputan sampah dari nasabah
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Permintaan</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-bank-green-100 to-bank-green-200 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6 text-bank-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Menunggu</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Disetujui</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Selesai</p>
                    <p className="text-2xl font-bold text-bank-green-600">{stats.completed}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-bank-green-100 to-bank-green-200 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-bank-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Berat</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalWeight.toFixed(1)} Kg</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <Weight className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Table */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-bank-green-50 to-bank-blue-50 rounded-t-lg border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-bank-green-500 to-bank-green-600 rounded-xl flex items-center justify-center">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    Daftar Permintaan Penjemputan
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    Kelola permintaan penjemputan sampah dari nasabah
                  </CardDescription>
                </div>
                <button onClick={openAddDialog} className="btn-add group">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Tambah Permintaan
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700">Nasabah</TableHead>
                    <TableHead className="font-semibold text-gray-700">Jenis Sampah</TableHead>
                    <TableHead className="font-semibold text-gray-700">Alamat</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tanggal Jemput</TableHead>
                    <TableHead className="font-semibold text-gray-700">Estimasi Berat</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickupRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-800">{request.user_name}</TableCell>
                      <TableCell className="text-gray-600">{request.waste_name}</TableCell>
                      <TableCell className="text-gray-600 max-w-xs truncate" title={request.address}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {request.address}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {request.date_request && !isNaN(new Date(request.date_request).getTime())
                            ? new Date(request.date_request).toLocaleDateString('id-ID')
                            : <span className="text-gray-400 italic">-</span>
                          }
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <Weight className="w-4 h-4 text-gray-400" />
                          {request.estimated_weight} Kg
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={request.status}
                          onValueChange={(value) => handleStatusChange(request.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                Menunggu
                              </div>
                            </SelectItem>
                            <SelectItem value="confirmed">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Disetujui
                              </div>
                            </SelectItem>
                            <SelectItem value="completed">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Selesai
                              </div>
                            </SelectItem>
                            <SelectItem value="cancelled">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                Dibatalkan
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <button
                          className="btn-delete group flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                          onClick={() => handleDelete(request)}
                          title="Hapus Permintaan"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                          Hapus
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid md:hidden gap-4 mt-4">
            {pickupRequests.map(request => (
              <div key={request.id} className="w-full max-w-full bg-white rounded-xl shadow px-3 py-4 flex flex-col gap-2 border border-bank-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-bank-green-100 flex items-center justify-center font-bold text-bank-green-700 text-lg">{request.user_name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-bank-green-700 text-base break-words">{request.user_name}</div>
                    <div className="text-xs text-gray-400">Penjemputan</div>
                  </div>
                  <div>{getStatusBadge(request.status)}</div>
                </div>
                <div className="flex flex-col gap-1 mt-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500 break-words"><Star className="w-4 h-4" /> {request.waste_name}</div>
                  <div className="flex items-center gap-2 text-gray-500 break-words"><MapPin className="w-4 h-4" /> {request.address}</div>
                  <div className="flex items-center gap-2 text-gray-500 break-words"><Calendar className="w-4 h-4" /> {request.date_request && !isNaN(new Date(request.date_request).getTime()) ? new Date(request.date_request).toLocaleDateString('id-ID') : <span className="text-gray-400 italic">-</span>}</div>
                  <div className="flex items-center gap-2 text-gray-500 break-words"><Weight className="w-4 h-4" /> {request.estimated_weight} Kg</div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button type="button" size="sm" variant="destructive" className="hover:bg-red-100 hover:text-red-800 flex flex-row items-center gap-1 flex-1 w-full" onClick={() => handleDelete(request)}><Trash2 className="mr-1 w-4 h-4" /> Hapus</Button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-bank-green-600" />
              Tambah Permintaan Penjemputan
            </DialogTitle>
            <DialogDescription>
              Tambahkan permintaan penjemputan sampah baru
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user_name">Nama Nasabah</Label>
                <Input
                  id="user_name"
                  value={formData.user_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="waste_name">Jenis Sampah</Label>
                <Input
                  id="waste_name"
                  value={formData.waste_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, waste_name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_request">Tanggal Jemput</Label>
                <Input
                  id="date_request"
                  type="date"
                  value={formData.date_request}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_request: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="estimated_weight">Estimasi Berat (Kg)</Label>
                <Input
                  id="estimated_weight"
                  type="number"
                  step="0.1"
                  value={formData.estimated_weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_weight: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="btn-primary">
                Tambah Permintaan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteRequest}
        onClose={() => setDeleteRequest(null)}
        onConfirm={confirmDelete}
        title="Hapus Permintaan Penjemputan"
        description={`Apakah Anda yakin ingin menghapus permintaan penjemputan dari ${deleteRequest?.user_name}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default PenjemputanSampah;
