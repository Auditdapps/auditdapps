import * as React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, LogIn, UserPlus, LayoutDashboard, LogOut, Rocket } from "lucide-react";
import { useUser } from "../hooks/useUser";
import { supabase } from "../lib/supabaseClient";
import logo from "../assets/img/logo.png";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// A tiny utility to join class names
function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const navigate = useNavigate();
  const { loading, user } = useUser();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onLogout = async () => {
    await supabase.auth.signOut();
    setMobileOpen(false);
    navigate("/");
  };

  const onStartAudit = () => {
    setMobileOpen(false);
    navigate("/self-audit");
  };

  const go = (path: string) => {
    setMobileOpen(false);
    navigate(path);
  };

  const linkBase =
    "px-2 py-1 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500";
  const navClass = ({ isActive }: { isActive: boolean }) =>
    cx(
      linkBase,
      isActive ? "text-indigo-700" : "text-slate-600 hover:text-indigo-700",
    );

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email || "User"} />
            <AvatarFallback>{(user?.email || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onStartAudit}>
          <Rocket className="mr-2 h-4 w-4" /> Start Audit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-700">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header
      className={cx(
        "sticky top-0 z-50 w-full transition-all",
        scrolled
          ? "bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm"
          : "bg-white",
      )}
    >
      {/* Skip link for accessibility */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 rounded bg-black px-3 py-1 text-white"
      >
        Skip to content
      </a>

      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2" aria-label="Audit Dapps home">
          <img src={logo} alt="Audit Dapps" className="h-9 w-auto" />
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={navClass}>
            About Us
          </NavLink>
          <NavLink to="/how-it-works" className={navClass}>
            How It Works
          </NavLink>
          <NavLink to="/pricing" className={navClass}>
            Pricing
          </NavLink>
          <NavLink to="/blog" className={navClass}>
            Blog
          </NavLink>
          <NavLink to="/contact" className={navClass}>
            Contact
          </NavLink>
        </nav>

        {/* Right actions (desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-32 animate-pulse rounded-md bg-slate-200" />
          ) : user ? (
            <>
              <Button variant="ghost" className="font-semibold" onClick={() => navigate("/dashboard")}>Dashboard</Button>
              <Button onClick={onStartAudit} className="rounded-full font-semibold">
                <Rocket className="mr-2 h-4 w-4" /> Start Audit
              </Button>
              <UserMenu />
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}> <LogIn className="mr-2 h-4 w-4" /> Login</Button>
              <Button variant="outline" onClick={() => navigate("/register")}>
                <UserPlus className="mr-2 h-4 w-4" /> Register
              </Button>
              <Button onClick={onStartAudit} className="rounded-full font-semibold">
                <Rocket className="mr-2 h-4 w-4" /> Start Audit
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <SheetHeader className="px-6 py-4">
                <SheetTitle className="flex items-center gap-2">
                  <img src={logo} alt="Audit Dapps" className="h-8 w-auto" />
                </SheetTitle>
              </SheetHeader>

              <div className="px-6 pb-6">
                <div className="flex flex-col gap-2 py-2">
                  <SheetClose asChild>
                    <NavLink to="/" end className={navClass} onClick={() => setMobileOpen(false)}>Home</NavLink>
                  </SheetClose>
                   <SheetClose asChild>
                    <NavLink to="/about" className={navClass} onClick={() => setMobileOpen(false)}>About Us</NavLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <NavLink to="/how-it-works" className={navClass} onClick={() => setMobileOpen(false)}>How It Works</NavLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <NavLink to="/pricing" className={navClass} onClick={() => setMobileOpen(false)}>Pricing</NavLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <NavLink to="/blog" className={navClass} onClick={() => setMobileOpen(false)}>Blog</NavLink>
                  </SheetClose>
                 
                  <SheetClose asChild>
                    <NavLink to="/contact" className={navClass} onClick={() => setMobileOpen(false)}>Contact</NavLink>
                  </SheetClose>
                </div>

                <div className="my-4 h-px w-full bg-slate-200" />

                {loading ? (
                  <div className="h-9 w-full animate-pulse rounded-md bg-slate-200" />
                ) : user ? (
                  <div className="flex flex-col gap-2">
                    <SheetClose asChild>
                      <Button variant="ghost" className="justify-start" onClick={() => go("/dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button className="justify-start rounded-full" onClick={onStartAudit}>
                      <Rocket className="mr-2 h-4 w-4" /> Start Audit
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="destructive" className="justify-start" onClick={onLogout}>
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                      </Button>
                    </SheetClose>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <SheetClose asChild>
                      <Button variant="ghost" className="justify-start" onClick={() => go("/login")}>
                      <LogIn className="mr-2 h-4 w-4" /> Login
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="outline" className="justify-start" onClick={() => go("/register")}>
                      <UserPlus className="mr-2 h-4 w-4" /> Register
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button className="justify-start rounded-full" onClick={onStartAudit}>
                      <Rocket className="mr-2 h-4 w-4" /> Start Audit
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
