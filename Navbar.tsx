import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Leaf, LogOut, User, CreditCard, FolderOpen, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-4 md:px-8 flex items-center justify-between glass-panel bg-white/80 backdrop-blur-md border-b border-white/20">
      <Link href="/">
        <div className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity cursor-pointer">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <span className="font-sans font-bold text-xl tracking-tight text-foreground">
            Mypropertunity
          </span>
        </div>
      </Link>

      <div className="hidden md:flex items-center gap-6">
        {isAuthenticated ? (
          <>
            <Link href="/my-analyses" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1" data-testid="link-my-analyses">
              <FolderOpen className="w-4 h-4" />
              My Analyses
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-subscription">
              Subscription
            </Link>
          </>
        ) : (
          <>
            <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isLoading ? (
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        ) : isAuthenticated && user ? (
          <>
            <Link href="/analysis" className="hidden sm:block">
              <Button size="sm" className="rounded-full px-6 shadow-lg shadow-primary/20" data-testid="button-analyze">
                Analyze Property
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity" data-testid="button-profile">
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <span className="hidden sm:inline text-muted-foreground">
                    {user.subscriptionTier !== 'free' ? (
                      <span className="text-primary font-medium capitalize">{user.subscriptionTier}</span>
                    ) : (
                      <span className="text-green-600 font-medium">Free</span>
                    )}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.firstName} {user.lastName}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer md:hidden" onClick={() => navigate('/analysis')}>
                  <Leaf className="w-4 h-4 mr-2" />
                  Analyze Property
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/my-analyses')} data-testid="menu-my-analyses">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  My Analyses
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/pricing')}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {user.subscriptionTier !== 'free' ? 'Manage Subscription' : 'Upgrade to Pro'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <a href="/api/logout">
                  <DropdownMenuItem className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </a>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    Mypropertunity
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  <a 
                    href="/#features" 
                    className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={closeMobileMenu}
                  >
                    Features
                  </a>
                  <a 
                    href="/#how-it-works" 
                    className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={closeMobileMenu}
                  >
                    How it Works
                  </a>
                  <Link 
                    href="/pricing" 
                    className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={closeMobileMenu}
                  >
                    Pricing
                  </Link>
                  <div className="border-t pt-4 mt-4 space-y-3">
                    <a href="/api/login" className="block">
                      <Button variant="outline" className="w-full rounded-full" data-testid="button-mobile-login">
                        Log In
                      </Button>
                    </a>
                    <a href="/api/login" className="block">
                      <Button className="w-full rounded-full shadow-lg shadow-primary/20" data-testid="button-mobile-signup">
                        Sign Up Free
                      </Button>
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <a href="/api/login" className="hidden sm:block">
              <Button variant="outline" size="sm" className="rounded-full px-6" data-testid="button-login">
                Log In
              </Button>
            </a>
            <a href="/api/login">
              <Button size="sm" className="rounded-full px-4 sm:px-6 shadow-lg shadow-primary/20" data-testid="button-signup">
                <span className="hidden sm:inline">Sign Up Free</span>
                <span className="sm:hidden">Sign Up</span>
              </Button>
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
