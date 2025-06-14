import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminSidebar from '@/components/AdminSidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Users, Plus, Edit, Trash2, Mail, Phone, MapPin, Star, TrendingUp, UserCheck } from 'lucide-react';

interface Nasabah {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  total_points: number;
  created_at: string;
}

const AdminNasabah = () => {
  const navigate = useNavigate();
  const [nasabahList, setNasabahList] = useState<Nasabah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNasabah, setSelectedNasabah] = useState<Nasabah | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [deleteNasabah, setDeleteNasabah] = useState<Nasabah | null>(null);

  // Mock data untuk demo
  const mockNasabah: Nasabah[] = [
    {
      id: 1,
      name: 'Siti Nurhaliza',
      email: 'siti@example.com',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 123, Jakarta',
      total_points: 1250,
      created_at: '2024-01-15'
    },
    {
      id: 2,
      name: 'Budi Santoso',
      email: 'budi@example.com',
      phone: '081234567891',
      address: 'Jl. Sudirman No. 456, Bandung',
      total_points: 890,
      created_at: '2024-02-10'
    },
    {
      id: 3,
      name: 'Ahmad Wijaya',
      email: 'ahmad@example.com',
      phone: '081234567892',
      address: 'Jl. Gatot Subroto No. 789, Surabaya',
      total_points: 2100,
      created_at: '2024-03-05'
    }
  ];

  useEffect(() => {
    // Check if user is logged in and is admin
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

    // Simulate loading
    setTimeout(() => {
      setNasabahList(mockNasabah);
      setIsLoading(false);
    }, 1500);
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddDialog = () => {
    setDialogMode('add');
    setFormData({ name: '', email: '', phone: '', address: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (nasabah: Nasabah) => {
    setDialogMode('edit');
    setSelectedNasabah(nasabah);
    setFormData({
      name: nasabah.name,
      email: nasabah.email,
      phone: nasabah.phone,
      address: nasabah.address
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (dialogMode === 'add') {
      const newNasabah: Nasabah = {
        id: Math.max(...nasabahList.map(n => n.id)) + 1,
        ...formData,
        total_points: 0,
        created_at: new Date().toISOString().split('T')[0]
      };

      setNasabahList(prev => [...prev, newNasabah]);
      toast.success("Nasabah baru berhasil ditambahkan!", {
        description: `${formData.name} telah terdaftar sebagai nasabah`,
      });
    } else if (selectedNasabah) {
      const updatedNasabah = {
        ...selectedNasabah,
        ...formData
      };

      setNasabahList(prev =>
        prev.map(n => n.id === selectedNasabah.id ? updatedNasabah : n)
      );
      toast.success("Data nasabah berhasil diperbarui!", {
        description: `Informasi ${formData.name} telah diperbaharui`,
      });
    }

    setIsDialogOpen(false);
    setSelectedNasabah(null);
  };

  const handleDelete = (nasabah: Nasabah) => {
    setDeleteNasabah(nasabah);
  };

  const confirmDelete = () => {
    if (deleteNasabah) {
      setNasabahList(prev => prev.filter(n => n.id !== deleteNasabah.id));
      toast.success("Nasabah berhasil dihapus!", {
        description: `${deleteNasabah.name} telah dihapus dari sistem`,
      });
      setDeleteNasabah(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
          <SkeletonLoader type="table" />
        </div>
      </div>
    );
  }

  // Stats calculation
  const stats = {
    total: nasabahList.length,
    totalPoints: nasabahList.reduce((sum, n) => sum + n.total_points, 0),
    avgPoints: nasabahList.length > 0 ? Math.round(nasabahList.reduce((sum, n) => sum + n.total_points, 0) / nasabahList.length) : 0,
    activeThisMonth: nasabahList.filter(n => {
      const createdDate = new Date(n.created_at);
      const currentDate = new Date();
      return createdDate.getMonth() === currentDate.getMonth() && createdDate.getFullYear() === currentDate.getFullYear();
    }).length
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <div className="flex-1 lg:ml-0">
        <main className="p-4 lg:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
              <Users className="w-6 h-6 mr-3 text-bank-green-600" />
              Kelola Nasabah
            </h2>
            <p className="text-gray-600">
              Kelola data nasabah Bank Sampah Digital
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Nasabah</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-bank-green-100 to-bank-green-200 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-bank-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Poin</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalPoints.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Rata-rata Poin</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.avgPoints}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Baru Bulan Ini</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.activeThisMonth}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-orange-600" />
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
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    Daftar Nasabah
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    Kelola dan pantau data nasabah Bank Sampah Digital
                  </CardDescription>
                </div>
                <button onClick={openAddDialog} className="btn-add group">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Tambah Nasabah
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700">Nama</TableHead>
                    <TableHead className="font-semibold text-gray-700">Email</TableHead>
                    <TableHead className="font-semibold text-gray-700">Telepon</TableHead>
                    <TableHead className="font-semibold text-gray-700">Alamat</TableHead>
                    <TableHead className="font-semibold text-gray-700">Total Poin</TableHead>
                    <TableHead className="font-semibold text-gray-700">Bergabung</TableHead>
                    <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nasabahList.map((nasabah) => (
                    <TableRow key={nasabah.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-bank-green-100 to-bank-green-200 rounded-full flex items-center justify-center">
                            <span className="text-bank-green-700 font-semibold text-sm">
                              {nasabah.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {nasabah.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {nasabah.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {nasabah.phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-xs truncate" title={nasabah.address}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {nasabah.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm flex items-center gap-1 w-fit">
                          <Star className="w-3 h-3" />
                          {nasabah.total_points} poin
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">{new Date(nasabah.created_at).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <button
                            className="btn-edit group flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                            onClick={() => openEditDialog(nasabah)}
                            title="Edit Nasabah"
                          >
                            <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                            Edit
                          </button>
                          <button
                            className="btn-delete group flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                            onClick={() => handleDelete(nasabah)}
                            title="Hapus Nasabah"
                          >
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                            Hapus
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>

          {/* Add/Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {dialogMode === 'add' ? 'Tambah Nasabah Baru' : 'Edit Data Nasabah'}
                </DialogTitle>
                <DialogDescription>
                  {dialogMode === 'add'
                    ? 'Masukkan data nasabah baru'
                    : 'Perbarui data nasabah'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="masukkan@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">No. Telepon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="08XXXXXXXXXX"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Alamat</Label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Masukkan alamat lengkap"
                    className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] rounded-md"
                    required
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" className="btn-primary">
                    {dialogMode === 'add' ? 'Tambah' : 'Simpan'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Confirm Delete Dialog */}
          <ConfirmDialog
            isOpen={!!deleteNasabah}
            onClose={() => setDeleteNasabah(null)}
            onConfirm={confirmDelete}
            title="Hapus Nasabah"
            description={`Apakah Anda yakin ingin menghapus nasabah ${deleteNasabah?.name}? Semua data transaksi dan poin yang terkait akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.`}
            confirmText="Hapus"
            cancelText="Batal"
            type="danger"
          />
    </div>
  );
};

export default AdminNasabah;
