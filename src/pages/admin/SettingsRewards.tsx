import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import SkeletonLoader from '@/components/SkeletonLoader';
import AdminSidebar from '@/components/AdminSidebar';
import { Gift } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Reward {
  id: number;
  name: string;
  description: string;
  points_required: number;
  stock: number;
  is_active: boolean;
  image?: string;
  expiry_date?: string;
}

const SettingsRewards = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [form, setForm] = useState<Partial<Reward>>({});
  const [isEdit, setIsEdit] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRewardId, setSelectedRewardId] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/rewards', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setRewards(data);
      } else {
        setRewards([]);
        toast.error('Gagal memuat data reward: Response bukan array');
      }
    } catch (e) {
      setRewards([]);
      toast.error('Gagal memuat data reward');
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.name || !form.points_required || !form.stock) {
      toast.error('Nama, poin, dan stok wajib diisi');
      return;
    }
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/rewards/${form.id}` : '/api/rewards';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          points_required: Number(form.points_required),
          stock: Number(form.stock),
          image: form.image,
          expiry_date: form.expiry_date
        })
      });
      if (!res.ok) throw new Error('Gagal menyimpan data');
      toast.success(isEdit ? 'Reward berhasil diupdate' : 'Reward berhasil ditambahkan');
      setForm({});
      setIsEdit(false);
      setOpenModal(false);
      fetchData();
    } catch (e) {
      toast.error('Gagal menyimpan data');
    }
  };

  const openAddModal = () => {
    setForm({});
    setIsEdit(false);
    setOpenModal(true);
  };

  const openEditModal = (reward: Reward) => {
    setForm(reward);
    setIsEdit(true);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setForm({});
    setIsEdit(false);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/rewards/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success('Reward berhasil dihapus');
      fetchData();
    } catch (e) {
      toast.error('Gagal menghapus reward');
    }
  };

  const handleToggleStatus = async (reward: Reward) => {
    try {
      const res = await fetch(`/api/rewards/${reward.id}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Gagal mengubah status');
      toast.success('Status reward berhasil diubah');
      fetchData();
    } catch (e) {
      toast.error('Gagal mengubah status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 lg:ml-0 p-4 lg:p-8">
        <Card className="mb-8 shadow-lg border-bank-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl"><Gift className="w-6 h-6" /> Pengaturan Tukar Poin</CardTitle>
            <Dialog open={openModal} onOpenChange={setOpenModal}>
              <DialogTrigger asChild>
                <Button type="button" className="btn-primary flex items-center gap-2" onClick={openAddModal}><span className="hidden sm:inline">Tambah Reward</span> <span className="sm:hidden">+</span></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEdit ? 'Edit Reward' : 'Tambah Reward'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <Input name="name" value={form.name || ''} onChange={handleChange} placeholder="Nama Reward" required />
                  <Input name="points_required" type="number" min="0" value={form.points_required || ''} onChange={handleChange} placeholder="Poin Dibutuhkan" required />
                  <Input name="stock" type="number" min="0" value={form.stock || ''} onChange={handleChange} placeholder="Stok" required />
                  <Input name="description" value={form.description || ''} onChange={handleChange} placeholder="Deskripsi" />
                  <Input name="image" value={form.image || ''} onChange={handleChange} placeholder="URL Gambar (opsional)" />
                  <Input name="expiry_date" type="date" value={form.expiry_date || ''} onChange={handleChange} placeholder="Tanggal Expired (opsional)" />
                  <div className="col-span-full">
                    <label htmlFor="is_active" className="block mb-1 font-medium">Status</label>
                    <select id="is_active" name="is_active" value={form.is_active ? '1' : '0'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === '1' }))} className="w-full border rounded px-3 py-2">
                      <option value="1">Aktif</option>
                      <option value="0">Nonaktif</option>
                    </select>
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
              <Input placeholder="Cari reward..." className="max-w-xs" />
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
                    <th className="p-3 font-semibold text-left">Nama</th>
                    <th className="p-3 font-semibold text-left">Poin</th>
                    <th className="p-3 font-semibold text-left">Stok</th>
                    <th className="p-3 font-semibold text-left">Status</th>
                    <th className="p-3 font-semibold text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map(reward => (
                    <tr key={reward.id} className="group hover:bg-bank-green-50 transition-all duration-150 border-b last:border-b-0">
                      <td className="p-3 font-semibold text-bank-green-700 flex items-center gap-2">
                        {reward.image && <img src={reward.image} alt="img" className="w-7 h-7 rounded object-cover border" />}
                        <span>{reward.name}</span>
                      </td>
                      <td className="p-3 text-blue-700 font-bold">{reward.points_required}</td>
                      <td className="p-3">{reward.stock}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold transition-all duration-300 animate-pulse ${reward.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{reward.is_active ? 'Aktif' : 'Nonaktif'}</span>
                      </td>
                      <td className="p-3 space-x-1 flex gap-1">
                        <Button type="button" size="sm" variant="outline" className="border-bank-green-200 text-bank-green-700 hover:bg-bank-green-100 hover:text-bank-green-900 flex items-center gap-1" onClick={() => openEditModal(reward)}><svg className="mr-1" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg> Edit</Button>
                        <Button type="button" size="sm" variant="destructive" className="hover:bg-red-100 hover:text-red-800 flex flex-row items-center gap-1" onClick={() => { setSelectedRewardId(reward.id); setOpenDeleteDialog(true); }}>
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="mr-1"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg> Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid md:hidden gap-4 mt-4">
              {rewards.map(reward => (
                <div key={reward.id} className="w-full max-w-full bg-white rounded-xl shadow px-3 py-4 flex flex-col gap-2 border border-bank-green-100">
                  <div className="flex items-center gap-3">
                    {reward.image
                      ? <img src={reward.image} alt="img" className="w-10 h-10 rounded object-cover border" />
                      : <div className="w-10 h-10 bg-bank-green-100 rounded flex items-center justify-center text-2xl">🎁</div>
                    }
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-bank-green-700 text-base break-words">{reward.name}</div>
                      <div className="text-xs text-gray-400">Reward</div>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold transition-all duration-300 animate-pulse ${reward.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{reward.is_active ? 'Aktif' : 'Nonaktif'}</span>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Poin</div>
                      <div className="font-bold text-blue-700">{reward.points_required}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Stok</div>
                      <div className="font-bold">{reward.stock}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button type="button" size="sm" variant="outline" className="border-bank-green-200 text-bank-green-700 hover:bg-bank-green-100 hover:text-bank-green-900 flex flex-row items-center gap-1 flex-1 w-full" onClick={() => openEditModal(reward)}><svg className="mr-1" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg> Edit</Button>
                    <Button type="button" size="sm" variant="destructive" className="hover:bg-red-100 hover:text-red-800 flex flex-row items-center gap-1 flex-1 w-full" onClick={() => { setSelectedRewardId(reward.id); setOpenDeleteDialog(true); }}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="mr-1"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg> Hapus</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <ConfirmDialog
          isOpen={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={() => { if (selectedRewardId) handleDelete(selectedRewardId); }}
          title="Hapus Reward?"
          description="Reward yang dihapus tidak bisa dikembalikan. Yakin ingin menghapus?"
          confirmText="Hapus"
          cancelText="Batal"
          type="danger"
        />
      </div>
    </div>
  );
};

export default SettingsRewards; 