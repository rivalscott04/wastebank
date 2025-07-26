import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';
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
  User,
  History,
  Star
} from 'lucide-react';

interface SidebarProps {
  role: 'admin' | 'nasabah';
}

const Sidebar = ({ role }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
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
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch user points for nasabah
  useEffect(() => {
    if (role === 'nasabah') {
      const fetchUserPoints = async () => {
        try {
          const data = await authService.getCurrentUser();
          setUserPoints(data.points || 0);
        } catch (error) {
          console.error('Error fetching user points:', error);
        }
      };

      fetchUserPoints();
    }
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success("Logout Berhasil", {
      description: "Anda telah keluar dari sistem"
    });
    navigate('/');
  };

  // Menu items based on role
  const getMenuItems = () => {
    if (role === 'admin') {
      return [
        { title: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
        { title: 'Kelola Nasabah', path: '/admin/nasabah', icon: Users },
        { title: 'Kelola Kategori', path: '/admin/kategori', icon: Package },
        { title: 'Kelola Transaksi', path: '/admin/transaksi', icon: ShoppingCart },
        { title: 'Jemput Sampah', path: '/admin/penjemputan', icon: Truck },
      ];
    } else {
      return [
        { title: 'Dashboard', path: '/nasabah/dashboard', icon: BarChart3 },
        { title: 'Profil Saya', path: '/nasabah/profil', icon: User },
        { title: 'Riwayat Transaksi', path: '/nasabah/riwayat', icon: History },
        { title: 'Request Jemput', path: '/nasabah/jemput', icon: Truck },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed top-0 left-0 z-50' : 'relative'}
        h-screen bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'}
        lg:transform-none
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-green rounded-lg flex items-center justify-center">
                <Recycle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">
                  {role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                </h2>
                <p className="text-xs text-gray-500">Bank Sampah Digital</p>
              </div>
            </div>
          )}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Points Display for Nasabah */}
        {role === 'nasabah' && !isCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="bg-gradient-to-r from-bank-green-600 to-bank-green-700 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90 font-medium">Total Poin</p>
                  <p className="text-2xl font-bold mt-1">{userPoints.toLocaleString()}</p>
                  <p className="text-xs opacity-75 mt-1">Siap ditukar</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
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
          
          {/* Settings submenu for admin only */}
          {role === 'admin' && (
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
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Footer */}
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
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className={`fixed top-4 left-4 z-30 ${isCollapsed ? 'block' : 'hidden'}`}
        >
          <PanelLeft className="w-5 h-5" />
        </Button>
      )}
    </>
  );
};

export default Sidebar; 