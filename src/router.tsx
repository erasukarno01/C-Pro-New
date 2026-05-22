import { createRootRoute, createRoute, createRouter as createTanStackRouter } from "@tanstack/react-router";
import { LayoutDashboard, Home, Box, Users, Settings, ChevronLeft, ChevronRight, Sun, Moon, Eye, EyeOff, Loader2 } from "lucide-react";
import { Outlet, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme";
import { getAssignmentPreview } from "@/lib/workforce";

// Root Route
export const rootRoute = createRootRoute({
  component: function RootLayout() {
    return <Outlet />;
  },
});

// Login Route
export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate login - replace with actual Supabase auth
    setTimeout(() => {
      if (email && password) {
        // For demo: accept any non-empty credentials
        window.location.href = "/dashboard";
      } else {
        setError("Please enter email and password");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 -left-20 h-[400px] w-[400px] rounded-full bg-white/10" />
          <div className="absolute bottom-20 -right-20 h-[300px] w-[300px] rounded-full bg-white/5" />
        </div>
        <div className="flex flex-col justify-center px-16 text-white">
          <img src="/logo.png" alt="Logo" className="h-20 w-20 object-contain mb-8" />
          <h1 className="text-4xl font-bold mb-4">C-Pro Apps</h1>
          <p className="text-xl text-white/80 mb-8">Chao Long Manufacturing Execution System</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">⚡</div>
              <span className="text-white/90">Real-time Production Monitoring</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">📊</div>
              <span className="text-white/90">Advanced Analytics & Reporting</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">🔒</div>
              <span className="text-white/90">Secure & Reliable System</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">C-Pro Apps</h1>
              <p className="text-sm text-muted-foreground">Manufacturing Execution System</p>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cpro.local"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" className="rounded border-border" />
                Remember me
              </label>
              <a href="#" className="text-sm text-primary hover:text-primary/80">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={toggleTheme}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            © 2026 PT Chao Long Motor Parts Indonesia
          </p>
        </div>
      </div>
    </div>
  );
}

// Layout Route (Dashboard with sidebar)
export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardLayout,
});

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" as const },
    { icon: Home, label: "Home", to: "/" as const },
    { icon: Box, label: "Components", to: "/dashboard/components" as const },
    { icon: Users, label: "Users", to: "/dashboard/users" as const },
    { icon: Settings, label: "Settings", to: "/dashboard/settings" as const },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn("relative flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 shadow-sm", collapsed ? "w-20" : "w-64")}>
        {/* Logo */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-16 items-center justify-between border-b border-sidebar-border px-4 w-full text-left hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className={cn("h-10 w-10 object-contain shadow-md", collapsed ? "h-8 w-8" : "h-10 w-10")}
            />
            {!collapsed && (
              <div>
                <span className="font-bold text-foreground">C-Pro Apps</span>
                <p className="text-xs text-muted-foreground">Chao Long Manufacturing Execution System</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all border border-transparent hover:border-sidebar-border"
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-sidebar-border p-4">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
              CL
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">Chao Long</p>
                <p className="text-xs text-muted-foreground truncate">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-content">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-header px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 rounded-lg border border-border bg-background hover:bg-accent flex items-center justify-center transition-colors shadow-sm"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon className="h-4 w-4 text-foreground" /> : <Sun className="h-4 w-4 text-yellow-400" />}
            </button>
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-green-500 absolute -top-0.5 -right-0.5 animate-pulse" />
              <div className="h-9 w-9 rounded-lg border border-border bg-background flex items-center justify-center text-sm shadow-sm">🔔</div>
            </div>
          </div>
        </header>
        <div className="flex-1 p-6"><Outlet /></div>
      </main>
    </div>
  );
}

// Index Route (Home)
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexPage,
});

function IndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted text-foreground relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 -left-40 h-[600px] w-[600px] rounded-full orb-blue animate-pulse dark:orb-blue" />
        <div className="absolute bottom-20 -right-40 h-[500px] w-[500px] rounded-full orb-cyan animate-pulse delay-1000 dark:orb-cyan" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-gradient-to-r from-blue-100/30 to-cyan-100/30 blur-3xl dark:from-blue-900/20 dark:to-cyan-900/20" />
      </div>

      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain shadow-md" />
              <span className="text-xl font-bold text-foreground">C-Pro Apps</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-primary hover:text-primary/80">Home</Link>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">Dashboard</Link>
              <button className="px-5 py-2 rounded-lg gradient-btn text-sm font-medium text-white shadow-md">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-primary text-sm font-medium mb-8 shadow-sm">
              🚀 Smart Manufacturing Excellence
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground">
              Build the Future of
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent block mt-2">
                Manufacturing
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              A modern Manufacturing Execution System built with cutting-edge technology.
              Streamline your production, monitor in real-time, and optimize efficiency.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-3 rounded-xl gradient-btn text-white font-semibold shadow-lg flex items-center justify-center gap-2"
              >
                Launch Dashboard
                <span>→</span>
              </Link>
              <button className="w-full sm:w-auto px-8 py-3 rounded-xl border-2 border-border text-primary font-semibold hover:bg-accent transition-colors shadow-sm">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-card border-t border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-muted-foreground">Everything you need to manage your manufacturing operations</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "⚡", title: "Real-time Monitoring", desc: "Track production metrics in real-time with live dashboards and alerts" },
              { icon: "🔒", title: "Secure & Reliable", desc: "Enterprise-grade security with role-based access control" },
              { icon: "📊", title: "Advanced Analytics", desc: "Deep insights with comprehensive reporting and analytics" },
              { icon: "🔄", title: "Workflow Automation", desc: "Automate repetitive tasks and streamline operations" },
              { icon: "📱", title: "Mobile Ready", desc: "Access your dashboard from any device, anywhere" },
              { icon: "🔧", title: "Easy Integration", desc: "Connect with existing systems via RESTful APIs" },
            ].map((feature, i) => (
              <div key={i} className="modern-card p-6 hover:border-primary/50">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mb-4 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
              <span className="font-semibold text-foreground">C-Pro Apps</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 PT Chao Long Motor Parts Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Dashboard Index Route
export const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  component: DashboardIndex,
});

function DashboardIndex() {
  const assignmentPreview = getAssignmentPreview();

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Production", value: "12,847", change: "+12.5%", color: "blue" },
          { label: "Active Machines", value: "48/52", change: "+2", color: "green" },
          { label: "Efficiency Rate", value: "94.2%", change: "+3.1%", color: "cyan" },
          { label: "Quality Rate", value: "99.1%", change: "+0.8%", color: "indigo" },
        ].map((stat, i) => (
          <div key={i} className="modern-card p-6">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
            <p className={cn("text-xs font-medium mt-1", stat.change.startsWith("+") ? "text-green-600" : "text-red-600")}>
              {stat.change} from last week
            </p>
          </div>
        ))}
      </div>

      {/* Welcome Card */}
      <div className="modern-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
            <span className="text-xl">🏭</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Welcome to Nexus MES</h3>
            <p className="text-sm text-muted-foreground">Smart Manufacturing Execution System</p>
          </div>
        </div>
        <p className="text-muted-foreground">
          Monitor your production floor, track KPIs, and optimize your manufacturing process with real-time insights.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Start Production", icon: "▶️", desc: "Begin new production run" },
          { title: "View Reports", icon: "📊", desc: "Access production reports" },
          { title: "System Status", icon: "💚", desc: "Check system health" },
        ].map((action, i) => (
          <button key={i} className="modern-card p-6 text-left hover:border-primary/50 flex items-center gap-4">
            <span className="text-2xl">{action.icon}</span>
            <div>
              <p className="font-semibold text-foreground">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Runtime Assignment Validation Preview */}
      <div className="modern-card p-6 border border-border/60">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Runtime Assignment Validation</h3>
            <p className="text-sm text-muted-foreground">Preview validasi operator ke workstation sebelum assignment disimpan.</p>
          </div>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold border",
              assignmentPreview.decision === "eligible"
                ? "bg-green-500/10 text-green-700 border-green-200"
                : assignmentPreview.decision === "needs-review"
                  ? "bg-yellow-500/10 text-yellow-700 border-yellow-200"
                  : "bg-red-500/10 text-red-700 border-red-200",
            )}
          >
            {assignmentPreview.decision}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border p-4 bg-background/50">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Matched Requirements</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{assignmentPreview.matchedRequirements.length}</p>
          </div>
          <div className="rounded-lg border border-border p-4 bg-background/50">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Missing Requirements</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{assignmentPreview.missingRequirements.length}</p>
          </div>
          <div className="rounded-lg border border-border p-4 bg-background/50">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Eligible</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{assignmentPreview.eligible ? "Yes" : "No"}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border p-4 bg-background/50">
            <p className="text-sm font-semibold text-foreground mb-2">Reasons</p>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
              {assignmentPreview.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border p-4 bg-background/50">
            <p className="text-sm font-semibold text-foreground mb-2">Missing Requirements Detail</p>
            {assignmentPreview.missingRequirements.length > 0 ? (
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                {assignmentPreview.missingRequirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada requirement yang hilang.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Components Route
export const componentsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "components",
  component: ComponentsPage,
});

function ComponentsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">UI Components</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {["Button", "Card", "Input", "Table", "Badge", "Avatar", "Select", "Modal"].map((item, i) => (
          <div key={i} className="modern-card p-6 text-center hover:border-blue-200">
            <p className="font-semibold text-foreground">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Users Route
export const usersRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "users",
  component: UsersPage,
});

function UsersPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">User Management</h2>
      <div className="modern-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Name</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Email</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Role</th>
              <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Alice Johnson", email: "alice@nexus.com", role: "Admin", status: "Active" },
              { name: "Bob Smith", email: "bob@nexus.com", role: "Operator", status: "Active" },
              { name: "Carol White", email: "carol@nexus.com", role: "Supervisor", status: "Inactive" },
            ].map((user, i) => (
              <tr key={i} className="border-b border-border hover:bg-accent transition-colors">
                <td className="p-4 font-medium text-foreground">{user.name}</td>
                <td className="p-4 text-muted-foreground">{user.email}</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">{user.role}</span>
                </td>
                <td className="p-4">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-medium", user.status === "Active" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground")}>
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Settings Route
export const settingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "settings",
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Settings</h2>
      <div className="modern-card p-6">
        <p className="text-muted-foreground">System settings and configuration coming soon...</p>
      </div>
    </div>
  );
}

// Create Route Tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  dashboardRoute.addChildren([dashboardIndexRoute, componentsRoute, usersRoute, settingsRoute]),
]);

// Create Router
export const router = createTanStackRouter({
  routeTree,
  defaultPreload: "viewport",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}