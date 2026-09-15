import { useState } from 'react';
import { ShoppingBag, Search, User, Menu, X, LogOut, CheckCircle } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const { toggleDrawer, getTotalItems } = useCartStore();
  const { user, isAuthenticated, openAuthModal, logout } = useAuthStore();
  const totalItems = getTotalItems();

  const navLinks = [
    { label: 'Shop Catalog', href: '#catalog' },
    { label: 'Formulations', href: '#catalog' },
    { label: 'The Ritual', href: '#ritual' },
    { label: 'Our Philosophy', href: '#philosophy' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-velora-canvas/90 backdrop-blur-md border-b border-velora-border transition-all">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-velora-primary hover:text-velora-emerald transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Left Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs uppercase tracking-luxury text-velora-primary/80 hover:text-velora-emerald transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Center Editorial Brand Identity */}
        <div className="text-center cursor-pointer">
          <a href="/" className="inline-block">
            <h1 className="font-serif text-2xl lg:text-3xl tracking-editorial text-velora-primary font-normal uppercase">
              Velora
            </h1>
            <span className="block text-[9px] tracking-[0.35em] text-velora-muted uppercase font-light -mt-1">
              Skin Laboratory
            </span>
          </a>
        </div>

        {/* Right Actions: Search, Auth, Cart */}
        <div className="flex items-center space-x-5 lg:space-x-6">
          <button
            className="text-velora-primary hover:text-velora-emerald transition-colors hidden sm:block"
            aria-label="Search"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>

          {/* User Account / Profile Menu */}
          <div className="relative">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 text-xs tracking-wider text-velora-primary font-medium hover:text-velora-emerald transition-colors"
                >
                  <User size={18} strokeWidth={1.5} />
                  <span className="hidden sm:inline-block max-w-[90px] truncate">
                    {user?.name ? user.name.split(' ')[0] : 'Account'}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-velora-surface border border-velora-border shadow-xl py-3 px-4 z-50 text-xs">
                    <div className="border-b border-velora-border pb-2.5 mb-2.5">
                      <p className="font-medium text-velora-primary truncate">{user?.name}</p>
                      <p className="text-[11px] text-velora-muted truncate">{user?.email}</p>
                      {user?.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-velora-emerald mt-1">
                          <CheckCircle size={10} /> Verified Member
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 text-stone-600 hover:text-rose-700 transition-colors pt-1"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="text-velora-primary hover:text-velora-emerald transition-colors p-1"
                aria-label="Sign in"
              >
                <User size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Cart Bag Icon with dynamic counter badge */}
          <button
            onClick={toggleDrawer}
            className="relative text-velora-primary hover:text-velora-emerald transition-colors p-1"
            aria-label="Cart"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-velora-emerald text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-velora-border bg-velora-canvas px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs uppercase tracking-luxury text-velora-primary font-medium"
            >
              {link.label}
            </a>
          ))}
          {!isAuthenticated && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal('login');
              }}
              className="block w-full text-left text-xs uppercase tracking-luxury text-velora-emerald font-medium pt-2 border-t border-velora-border"
            >
              Sign In / Register
            </button>
          )}
        </div>
      )}
    </header>
  );
};