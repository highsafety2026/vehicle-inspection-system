import { Link, useLocation } from "wouter";
import { ClipboardList, PlusCircle, LayoutDashboard } from "lucide-react";
import logoImg from "/assets/logo.png";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/inspections/new", label: "New Inspection", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-card border-r border-border flex flex-col fixed md:relative z-20 h-auto md:h-screen">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <img src={logoImg} alt="High Safety Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight text-foreground">
              هاي سيفيتي
            </h1>
            <p className="text-xs text-muted-foreground">High Safety</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                font-medium text-sm
                ${isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}
              `}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground font-mono">System v1.0.0</p>
            <p className="text-xs text-muted-foreground mt-1">Connected</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background/50">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
