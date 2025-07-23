import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Home, Users, FileText, Camera, BarChart3, Building2, DollarSign, MapPin, MessageSquare, Send, Phone, LogIn, LogOut, User, Scale, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navigationItems = [
  { path: "/", label: "Beranda", icon: Home },
  { path: "/profil", label: "Profil Desa", icon: Users },
  { path: "/berita", label: "Berita", icon: FileText },
  { path: "/galeri", label: "Galeri", icon: Camera },
  { path: "/aparatur", label: "Aparatur", icon: Building2 },
  { path: "/lembaga", label: "Lembaga", icon: Users },
  { path: "/anggaran", label: "Transparansi", icon: DollarSign },
  { path: "/statistik", label: "Statistik", icon: BarChart3 },
  { path: "/kontak", label: "Kontak", icon: Phone },
  { path: "/pengaduan", label: "Pengaduan", icon: MessageSquare },
  { path: "/saran", label: "Saran", icon: Send },
];

const produkHukumItems = [
  { path: "/perdes", label: "Perdes", icon: FileText },
  { path: "/perkades", label: "Perkades", icon: FileText },
  { path: "/surat-keputusan", label: "Surat Keputusan", icon: FileText },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const NavItem = ({ item, mobile = false }: { item: typeof navigationItems[0], mobile?: boolean }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    
    return (
      <Link 
        to={item.path}
        onClick={() => mobile && setIsOpen(false)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <Icon className="w-4 h-4" />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/827e1914-6e75-49a5-a945-b4942df94646.png" 
              alt="Logo Kepulauan Mentawai" 
              className="w-8 h-10"
            />
            <div>
              <h1 className="font-semibold text-lg">Desa Bukit Pamewa</h1>
              <p className="text-xs text-muted-foreground">Kepulauan Mentawai</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            <nav className="flex items-center gap-2">
              {navigationItems.slice(0, 6).map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
              
              {/* More dropdown for remaining items */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <span>Lainnya</span>
                    <span className="ml-1">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {navigationItems.slice(6).map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link 
                          to={item.path}
                          className={`flex items-center gap-2 ${
                            isActive ? "bg-accent text-accent-foreground" : ""
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  
                  <DropdownMenuSeparator />
                  
                  {/* Produk Hukum Submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      <span>Produk Hukum</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {produkHukumItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                          <DropdownMenuItem key={item.path} asChild>
                            <Link 
                              to={item.path}
                              className={`flex items-center gap-2 ${
                                isActive ? "bg-accent text-accent-foreground" : ""
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
            
            {/* Auth Section */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden md:block">Admin</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/auth">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <img 
                    src="/lovable-uploads/827e1914-6e75-49a5-a945-b4942df94646.png" 
                    alt="Logo" 
                    className="w-8 h-10"
                  />
                  <div>
                    <h2 className="font-semibold">Desa Bukit Pamewa</h2>
                    <p className="text-sm text-muted-foreground">Kepulauan Mentawai</p>
                  </div>
                </div>
                
                <nav className="flex flex-col gap-2">
                  {navigationItems.map((item) => (
                    <NavItem key={item.path} item={item} mobile />
                  ))}
                  
                  {/* Produk Hukum Section for Mobile */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                      <Scale className="w-4 h-4" />
                      <span>Produk Hukum</span>
                    </div>
                    <div className="ml-6 flex flex-col gap-1">
                      {produkHukumItems.map((item) => (
                        <NavItem key={item.path} item={item} mobile />
                      ))}
                    </div>
                  </div>
                </nav>
                
                {/* Mobile Auth Section */}
                <div className="border-t pt-4 mt-4">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Admin</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={signOut}
                        className="w-full justify-start gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}