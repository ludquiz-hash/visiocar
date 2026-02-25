import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  CreditCard, 
  Settings, 
  Plus,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function Layout({ children }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/claims', label: 'Dossiers', icon: FileText },
    { path: '/team', label: 'Équipe', icon: Users },
    { path: '/billing', label: 'Abonnement', icon: CreditCard },
    { path: '/settings', label: 'Paramètres', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10">
        <Link to="/dashboard" className="text-xl font-bold text-[#007AFF]">
          VisioCar
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[#151921] border-r border-white/10
          transform transition-transform duration-300
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6">
            <Link to="/dashboard" className="text-2xl font-bold text-[#007AFF] hidden lg:block">
              VisioCar
            </Link>
          </div>

          <nav className="px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-colors
                    ${isActive 
                      ? 'bg-[#007AFF]/10 text-[#007AFF]' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Link
              to="/wizard"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-[#007AFF]/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouveau dossier
            </Link>

            <div className="mt-4 flex items-center gap-3 px-4 py-3 border-t border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#007AFF] to-[#BF5AF2] flex items-center justify-center">
                <span className="text-sm font-bold">
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.full_name || profile?.email}</p>
                <p className="text-xs text-white/40 truncate">{profile?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}