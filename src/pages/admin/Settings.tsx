import React from 'react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/AdminSidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';

interface WasteCategory {
  id: number;
  name: string;
}

interface WastePrice {
  id: number;
  category_id: number;
  price_per_kg: number;
  points_per_kg: number;
  icon: string;
  category: WasteCategory;
}

const Settings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [wastePrices, setWastePrices] = useState<WastePrice[]>([]);
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [form, setForm] = useState({
    id: 0,
    category_id: '',
    price_per_kg: '',
    points_per_kg: '',
    icon: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catRes, priceRes] = await Promise.all([
        fetch('/api/waste-categories', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json()),
        fetch('/api/waste-prices', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json())
      ]);
      setCategories(catRes);
      setWastePrices(priceRes);
    } catch (e) {
      toast.error('Gagal memuat data harga sampah');
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSelect = (value: string) => {
    setForm(f => ({ ...f, category_id: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.category_id || !form.price_per_kg || !form.points_per_kg) {
      toast.error('Semua field wajib diisi');
      return;
    }
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/waste-prices/${form.id}` : '/api/waste-prices';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          category_id: Number(form.category_id),
          price_per_kg: Number(form.price_per_kg),
          points_per_kg: Number(form.points_per_kg),
          icon: form.icon
        })
      });
      if (!res.ok) throw new Error('Gagal menyimpan data');
      toast.success(isEdit ? 'Harga berhasil diupdate' : 'Harga berhasil ditambahkan');
      setForm({ id: 0, category_id: '', price_per_kg: '', points_per_kg: '', icon: '' });
      setIsEdit(false);
      fetchData();
    } catch (e) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleEdit = (price: WastePrice) => {
    setForm({
      id: price.id,
      category_id: String(price.category_id),
      price_per_kg: String(price.price_per_kg),
      points_per_kg: String(price.points_per_kg),
      icon: price.icon || ''
    });
    setIsEdit(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus harga ini?')) return;
    try {
      const res = await fetch(`/api/waste-prices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success('Harga berhasil dihapus');
      fetchData();
    } catch (e) {
      toast.error('Gagal menghapus harga');
    }
  };

  const usedCategoryIds = isEdit ? [] : wastePrices.map(wp => String(wp.category_id));

  const openAddModal = () => {
    setForm({ id: 0, category_id: '', price_per_kg: '', points_per_kg: '', icon: '' });
    setIsEdit(false);
    setOpen(true);
  };

  const openEditModal = (price: WastePrice) => {
    setForm({
      id: price.id,
      category_id: String(price.category_id),
      price_per_kg: String(price.price_per_kg),
      points_per_kg: String(price.points_per_kg),
      icon: price.icon || ''
    });
    setIsEdit(true);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setForm({ id: 0, category_id: '', price_per_kg: '', points_per_kg: '', icon: '' });
    setIsEdit(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 lg:ml-0 p-4 lg:p-8">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pengaturan Harga Sampah</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button type="button" className="btn-primary" onClick={openAddModal}>Tambah Harga</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEdit ? 'Edit Harga Sampah' : 'Tambah Harga Sampah'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <label className="block mb-1 font-medium">Kategori</label>
                    <Select value={form.category_id} onValueChange={handleSelect} disabled={isEdit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={String(cat.id)} disabled={usedCategoryIds.includes(String(cat.id)) && !isEdit && form.category_id !== String(cat.id)}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Harga per Kg (Rp)</label>
                    <Input name="price_per_kg" type="number" min="0" value={form.price_per_kg} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Poin per Kg</label>
                    <Input name="points_per_kg" type="number" min="0" value={form.points_per_kg} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Icon (emoji)</label>
                    <Input name="icon" value={form.icon} onChange={handleChange} placeholder="Contoh: 🥤" disabled={isEdit} />
                  </div>
                  <div className="col-span-full flex gap-2 justify-end mt-2">
                    <Button type="submit" className="btn-primary">{isEdit ? 'Update' : 'Tambah'}</Button>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
                    </DialogClose>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Harga Sampah</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <SkeletonLoader type="table" /> : (
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Icon</th>
                      <th className="p-2 border">Kategori</th>
                      <th className="p-2 border">Harga/Kg</th>
                      <th className="p-2 border">Poin/Kg</th>
                      <th className="p-2 border">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wastePrices.map(price => (
                      <tr key={price.id} className="hover:bg-gray-50">
                        <td className="p-2 border text-2xl text-center">{price.icon}</td>
                        <td className="p-2 border">{price.category?.name || '-'}</td>
                        <td className="p-2 border">Rp {Number(price.price_per_kg).toLocaleString('id-ID')}</td>
                        <td className="p-2 border">{price.points_per_kg} poin</td>
                        <td className="p-2 border space-x-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => openEditModal(price)}>Edit</Button>
                          <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(price.id)}>Hapus</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings; 