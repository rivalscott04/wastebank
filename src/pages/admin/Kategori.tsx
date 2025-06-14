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
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminSidebar from '@/components/AdminSidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Package, Plus, Edit, Trash2, Tag, TrendingUp, Calendar } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  created_at: string;
}

const AdminKategori = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');

  // Mock data untuk demo
  const mockCategories: Category[] = [
    { id: 1, name: 'Plastik', created_at: '2024-01-01' },
    { id: 2, name: 'Kertas', created_at: '2024-01-02' },
    { id: 3, name: 'Logam', created_at: '2024-01-03' },
    { id: 4, name: 'Kaca', created_at: '2024-01-04' }
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
      setCategories(mockCategories);
      setIsLoading(false);
    }, 1000);
  }, [navigate]);

  const openAddDialog = () => {
    setDialogMode('add');
    setFormData({ name: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setDialogMode('edit');
    setSelectedCategory(category);
    setFormData({ name: category.name });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (dialogMode === 'add') {
      const newCategory: Category = {
        id: Math.max(...categories.map(c => c.id)) + 1,
        name: formData.name,
        created_at: new Date().toISOString().split('T')[0]
      };

      setCategories(prev => [...prev, newCategory]);
      toast.success("Kategori baru berhasil ditambahkan!", {
        description: `Kategori "${formData.name}" telah ditambahkan`,
      });
    } else if (selectedCategory) {
      const updatedCategory = {
        ...selectedCategory,
        name: formData.name
      };

      setCategories(prev =>
        prev.map(c => c.id === selectedCategory.id ? updatedCategory : c)
      );
      toast.success("Kategori berhasil diperbarui!", {
        description: `Kategori "${formData.name}" telah diperbaharui`,
      });
    }

    setIsDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleDelete = (category: Category) => {
    setDeleteCategory(category);
  };

  const confirmDelete = () => {
    if (deleteCategory) {
      setCategories(prev => prev.filter(c => c.id !== deleteCategory.id));
      toast.success("Kategori berhasil dihapus!", {
        description: `Kategori "${deleteCategory.name}" telah dihapus dari sistem`,
      });
      setDeleteCategory(null);
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
    total: categories.length,
    recentlyAdded: categories.filter(c => {
      const createdDate = new Date(c.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate >= weekAgo;
    }).length,
    thisMonth: categories.filter(c => {
      const createdDate = new Date(c.created_at);
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
              <Package className="w-6 h-6 mr-3 text-bank-green-600" />
              Kelola Kategori
            </h2>
            <p className="text-gray-600">
              Kelola kategori sampah untuk sistem Bank Sampah Digital
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Kategori</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-bank-green-100 to-bank-green-200 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-bank-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Baru Minggu Ini</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.recentlyAdded}</p>
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
                    <p className="text-sm font-medium text-gray-600 mb-1">Bulan Ini</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-bank-green-50 to-bank-blue-50 rounded-t-lg border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-bank-green-500 to-bank-green-600 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    Daftar Kategori
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    Kelola kategori sampah yang dapat diterima sistem
                  </CardDescription>
                </div>
                <button onClick={openAddDialog} className="btn-add group">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Tambah Kategori
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700">ID</TableHead>
                    <TableHead className="font-semibold text-gray-700">Nama Kategori</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tanggal Dibuat</TableHead>
                    <TableHead className="font-semibold text-gray-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-semibold text-gray-700">{category.id}</TableCell>
                      <TableCell className="font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-bank-green-100 to-bank-green-200 rounded-lg flex items-center justify-center">
                            <Tag className="w-4 h-4 text-bank-green-600" />
                          </div>
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(category.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <button
                            className="btn-edit group flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                            onClick={() => openEditDialog(category)}
                            title="Edit Kategori"
                          >
                            <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                            Edit
                          </button>
                          <button
                            className="btn-delete group flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
                            onClick={() => handleDelete(category)}
                            title="Hapus Kategori"
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
                  {dialogMode === 'add' ? 'Tambah Kategori Baru' : 'Edit Kategori'}
                </DialogTitle>
                <DialogDescription>
                  {dialogMode === 'add'
                    ? 'Masukkan nama kategori sampah baru'
                    : 'Perbarui nama kategori sampah'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Kategori</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    placeholder="Masukkan nama kategori"
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
            isOpen={!!deleteCategory}
            onClose={() => setDeleteCategory(null)}
            onConfirm={confirmDelete}
            title="Hapus Kategori"
            description={`Apakah Anda yakin ingin menghapus kategori "${deleteCategory?.name}"? Semua data sampah yang terkait dengan kategori ini akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.`}
            confirmText="Hapus"
            cancelText="Batal"
            type="danger"
          />
    </div>
  );
};

export default AdminKategori;
