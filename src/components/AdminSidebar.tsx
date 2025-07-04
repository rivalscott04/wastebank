import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  Users,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Recycle,
  PanelLeft,
  X,
  ChevronDown,
  Gift
} from 'lucide-react';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isSettingsActive = location.pathname.startsWith('/admin/settings');
  const [openSetting, setOpenSetting] = useState(isSettingsActive);

  useEffect(() => {
    if (isSettingsActive) {
      setOpenSetting(true);
    } else {
      setOpenSetting(false);
    }
  }, [isSettingsActive]);

  useEffect(() => {
    if (window.innerWidth < 1024) setIsCollapsed(true);
    else setIsCollapsed(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success("Logout Berhasil", {
      description: "Anda telah keluar dari sistem"
    });
    navigate('/');
  };

  const menuItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
    { title: 'Kelola Nasabah', path: '/admin/nasabah', icon: Users },
    { title: 'Kelola Kategori', path: '/admin/kategori', icon: Package },
    { title: 'Kelola Transaksi', path: '/admin/transaksi', icon: ShoppingCart },
    { title: 'Jemput Sampah', path: '/admin/penjemputan', icon: Truck },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-xl border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'}
        lg:relative lg:transform-none
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-green rounded-lg flex items-center justify-center">
                <Recycle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Admin Panel</h2>
                <p className="text-xs text-gray-500">Bank Sampah Digital</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation - flex-1 to take remaining space */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-bank-green-100 text-bank-green-700 border border-bank-green-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium truncate">{item.title}</span>
              )}
            </NavLink>
          ))}
          {/* Pengaturan dengan submenu */}
          <div className="space-y-1">
            <button
              type="button"
              className={`flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg transition-all duration-200 group ${openSetting || isSettingsActive ? 'bg-bank-green-100 text-bank-green-700 border border-bank-green-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
              onClick={() => setOpenSetting((v) => !v)}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium truncate flex-1 text-left">Pengaturan</span>}
              {!isCollapsed && <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${openSetting ? 'rotate-180' : ''}`} />}
            </button>
            {(openSetting || isSettingsActive) && !isCollapsed && (
              <div className="ml-8 overflow-hidden transition-all duration-200 ease-in-out max-h-40 opacity-100 translate-y-0" style={{ maxHeight: openSetting || isSettingsActive ? '200px' : '0', opacity: openSetting || isSettingsActive ? 1 : 0, transform: openSetting || isSettingsActive ? 'translateY(0)' : 'translateY(-10px)' }}>
                <NavLink
                  to="/admin/settings"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-base transition-all duration-200 ${
                      location.pathname === '/admin/settings'
                        ? 'bg-bank-green-50 text-bank-green-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`
                  }
                >
                  <Package className="w-5 h-5 flex-shrink-0" />
                  <span>Harga Sampah</span>
                </NavLink>
                <NavLink
                  to="/admin/settings/rewards"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-base transition-all duration-200 ${
                      location.pathname === '/admin/settings/rewards'
                        ? 'bg-bank-green-50 text-bank-green-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`
                  }
                >
                  <Gift className="w-5 h-5 flex-shrink-0" />
                  <span>Tukar Poin</span>
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Footer - fixed at bottom */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {!isCollapsed && <span>Keluar</span>}
          </Button>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(false)}
        className={`fixed top-4 left-4 z-30 lg:hidden ${isCollapsed ? 'block' : 'hidden'}`}
      >
        <PanelLeft className="w-5 h-5" />
      </Button>
    </>
  );
};

export default AdminSidebar;