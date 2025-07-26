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
import { toast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Package, Plus, Edit, Trash2, Tag, TrendingUp, Calendar } from 'lucide-react';
import { wasteService } from '@/services/waste.service';

interface Category {
  id: number;
  name: string;
  created_at: string;
  price_per_kg?: number;
  points_per_kg?: number;
}

const AdminKategori = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    price_per_kg: '', 
    points_per_kg: '' 
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      toast.error('Akses Ditolak', { description: 'Anda tidak memiliki akses ke halaman admin' });
      navigate('/');
      return;
    }
    // Fetch kategori dari API
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const data = await wasteService.getCategories();
        setCategories(data);
      } catch (e) {
        toast.error('Gagal memuat kategori');
      }
      setIsLoading(false);
    };
    fetchCategories();
  }, [navigate]);

  const openAddDialog = () => {
    setDialogMode('add');
    setFormData({ name: '', price_per_kg: '', points_per_kg: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setDialogMode('edit');
    setSelectedCategory(category);
    setFormData({ 
      name: category.name, 
      price_per_kg: category.price_per_kg ? category.price_per_kg.toString() : '', 
      points_per_kg: category.points_per_kg ? category.points_per_kg.toString() : '' 
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {

      
      if (dialogMode === 'add') {
        const result = await wasteService.createCategory({ 
          name: formData.name,
          price_per_kg: Number(formData.price_per_kg),
          points_per_kg: Number(formData.points_per_kg)
        });
        toast.success('Kategori baru berhasil ditambahkan!');
        
        // Trigger dashboard refresh
        window.dispatchEvent(new CustomEvent('dashboard-refresh'));
        localStorage.setItem('dashboard-update', Date.now().toString());
      } else if (selectedCategory) {
        const result = await wasteService.updateCategory(selectedCategory.id, { 
          name: formData.name,
          price_per_kg: Number(formData.price_per_kg),
          points_per_kg: Number(formData.points_per_kg)
        });
        toast.success('Kategori berhasil diperbarui!');
        
        // Trigger dashboard refresh
        window.dispatchEvent(new CustomEvent('dashboard-refresh'));
        localStorage.setItem('dashboard-update', Date.now().toString());
      }
      // Refresh data
      const data = await wasteService.getCategories();
      setCategories(data);
      setIsDialogOpen(false);
      setSelectedCategory(null);
    } catch (e: any) {
      toast.error(`Gagal menyimpan kategori: ${e.response?.data?.message || e.message}`);
    }
    setIsLoading(false);
  };

  const handleDelete = (category: Category) => {
    setDeleteCategory(category);
  };

  const confirmDelete = async () => {
    if (deleteCategory) {
      setIsLoading(true);
      try {
        await wasteService.deleteCategory(deleteCategory.id);
        toast.success('Kategori berhasil dihapus!');
        // Refresh data
        const data = await wasteService.getCategories();
        setCategories(data);
      } catch (e) {
        toast.error('Gagal menghapus kategori');
      }
      setDeleteCategory(null);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar role="admin" />
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
      <Sidebar role="admin" />

      <div className="flex-1 lg:ml-0">
        <main className="p-4 lg:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold flex items-center gap-2 pl-12 lg:pl-0">
              <Package className="w-6 h-6 mr-3 text-bank-green-600" />
              Kelola Kategori
            </h1>
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
                    <TableHead className="font-semibold text-gray-700">Harga per Kg</TableHead>
                    <TableHead className="font-semibold text-gray-700">Poin per Kg</TableHead>
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
                          <span className="font-medium text-green-600">
                            Rp {category.price_per_kg ? category.price_per_kg.toLocaleString() : '0'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-blue-600">
                            {category.points_per_kg || '0'} poin
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {category.created_at && !isNaN(new Date(category.created_at).getTime())
                            ? new Date(category.created_at).toLocaleDateString('id-ID')
                            : <span className="text-gray-400 italic">-</span>
                          }
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

          <div className="grid md:hidden gap-4 mt-4">
            {categories.map(category => (
              <div key={category.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-bank-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-bank-green-100 to-bank-green-200 rounded-lg flex items-center justify-center">
                    <Tag className="w-6 h-6 text-bank-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-bank-green-700 text-base">{category.name}</div>
                    <div className="text-xs text-gray-400">Kategori</div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-green-600 font-medium">Rp {category.price_per_kg ? category.price_per_kg.toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-blue-600 font-medium">{category.points_per_kg || '0'} poin</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" /> 
                    {category.created_at && !isNaN(new Date(category.created_at).getTime()) ? new Date(category.created_at).toLocaleDateString('id-ID') : <span className="text-gray-400 italic">-</span>}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button type="button" size="sm" variant="outline" className="border-bank-green-200 text-bank-green-700 hover:bg-bank-green-100 hover:text-bank-green-900 flex flex-row items-center gap-1 flex-1" onClick={() => openEditDialog(category)}><Edit className="mr-1 w-4 h-4" /> Edit</Button>
                  <Button type="button" size="sm" variant="destructive" className="hover:bg-red-100 hover:text-red-800 flex flex-row items-center gap-1 flex-1" onClick={() => handleDelete(category)}><Trash2 className="mr-1 w-4 h-4" /> Hapus</Button>
                </div>
              </div>
            ))}
          </div>
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
                    ? 'Masukkan nama kategori sampah baru beserta harga dan poin'
                    : 'Perbarui nama kategori sampah beserta harga dan poin'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Kategori</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama kategori"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_per_kg">Harga per Kg (Rp)</Label>
                    <Input
                      id="price_per_kg"
                      name="price_per_kg"
                      type="number"
                      min="0"
                      value={formData.price_per_kg}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_per_kg: e.target.value }))}
                      placeholder="3000"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="points_per_kg">Poin per Kg</Label>
                    <Input
                      id="points_per_kg"
                      name="points_per_kg"
                      type="number"
                      min="0"
                      value={formData.points_per_kg}
                      onChange={(e) => setFormData(prev => ({ ...prev, points_per_kg: e.target.value }))}
                      placeholder="3"
                      required
                    />
                  </div>
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
