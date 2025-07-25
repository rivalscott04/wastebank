import React from 'react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import SkeletonLoader from '@/components/SkeletonLoader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Package } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

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
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);

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
      <Sidebar role="admin" />
      <div className="flex-1 lg:ml-0 p-4 lg:p-8">
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <h1 className="text-2xl font-bold flex items-center gap-2 pl-12 lg:pl-0">
                <Package className="w-6 h-6 mr-3 text-bank-green-600" />
                Pengaturan Harga Sampah
              </h1>
            </CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button type="button" className="btn-primary flex items-center gap-2" onClick={openAddModal}><span className="hidden sm:inline">Tambah Harga</span> <span className="sm:hidden">+</span></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEdit ? 'Edit Harga Sampah' : 'Tambah Harga Sampah'}</DialogTitle>
                  <DialogDescription>
                    {isEdit ? 'Edit data harga sampah di bawah ini.' : 'Isi data harga sampah baru di bawah ini.'}
                  </DialogDescription>
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
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <Input placeholder="Cari kategori..." className="max-w-xs" />
              <div className="flex gap-1 items-center text-xs text-gray-500">
                <span>1-5 dari 5</span>
                <Button size="icon" variant="ghost" className="rounded-full"><span>&lt;</span></Button>
                <Button size="icon" variant="ghost" className="rounded-full"><span>&gt;</span></Button>
              </div>
            </div>
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="min-w-full bg-white rounded-xl overflow-hidden text-sm md:text-base shadow-sm">
                <thead>
                  <tr className="bg-bank-green-100 text-bank-green-800">
                    <th className="p-3 font-semibold text-left">Icon</th>
                    <th className="p-3 font-semibold text-left">Kategori</th>
                    <th className="p-3 font-semibold text-left">Harga/Kg</th>
                    <th className="p-3 font-semibold text-left">Poin/Kg</th>
                    <th className="p-3 font-semibold text-left whitespace-nowrap min-w-[160px]">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {wastePrices.map(price => (
                    <tr key={price.id} className="group hover:bg-bank-green-50 transition-all duration-150 border-b last:border-b-0">
                      <td className="p-3 font-semibold text-2xl text-center">{price.icon}</td>
                      <td className="p-3 font-semibold text-bank-green-700">{price.category?.name || '-'}</td>
                      <td className="p-3 text-blue-700 font-bold">Rp {Number(price.price_per_kg).toLocaleString('id-ID')}</td>
                      <td className="p-3"><span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold animate-pulse">{price.points_per_kg} poin</span></td>
                      <td className="p-3 space-x-1 flex gap-1 whitespace-nowrap min-w-[160px]">
                        <Button type="button" size="sm" variant="outline" className="border-bank-green-200 text-bank-green-700 hover:bg-bank-green-100 hover:text-bank-green-900 flex flex-row items-center gap-1" onClick={() => openEditModal(price)}><svg className="mr-1" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg> Edit</Button>
                        <Button type="button" size="sm" variant="destructive" className="hover:bg-red-100 hover:text-red-800 flex flex-row items-center gap-1" onClick={() => { setSelectedDeleteId(price.id); setOpenDeleteDialog(true); }}><svg className="mr-1" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg> Hapus</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid md:hidden gap-4 mt-4">
              {wastePrices.map(price => (
                <div key={price.id} className="w-full max-w-full bg-white rounded-xl shadow px-3 py-4 flex flex-col gap-2 border border-bank-green-100">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded flex items-center justify-center text-2xl bg-bank-green-100">{price.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-bank-green-700 text-base break-words">{price.category?.name || '-'}</div>
                      <div className="text-xs text-gray-400">Kategori</div>
                    </div>
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold animate-pulse whitespace-nowrap">{price.points_per_kg} poin</span>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Harga/Kg</div>
                      <div className="font-bold text-blue-700">Rp {Number(price.price_per_kg).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Poin/Kg</div>
                      <div className="font-bold">{price.points_per_kg}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button type="button" size="sm" variant="outline" className="border-bank-green-200 text-bank-green-700 hover:bg-bank-green-100 hover:text-bank-green-900 flex flex-row items-center gap-1" onClick={() => openEditModal(price)}><svg className="mr-1" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg> Edit</Button>
                    <Button type="button" size="sm" variant="destructive" className="hover:bg-red-100 hover:text-red-800 flex flex-row items-center gap-1" onClick={() => { setSelectedDeleteId(price.id); setOpenDeleteDialog(true); }}><svg className="mr-1" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg> Hapus</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <ConfirmDialog
          isOpen={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={() => { if (selectedDeleteId) handleDelete(selectedDeleteId); }}
          title="Hapus Harga Sampah?"
          description="Data harga sampah yang dihapus tidak bisa dikembalikan. Yakin ingin menghapus?"
          confirmText="Hapus"
          cancelText="Batal"
          type="danger"
        />
      </div>
    </div>
  );
};

export default Settings; 