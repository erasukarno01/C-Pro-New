import { createRootRoute, createRoute, createRouter as createTanStackRouter } from "@tanstack/react-router";
import { LayoutDashboard, Home, Box, Users, Settings, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import { Outlet, Link } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme";

// Root Route
export const rootRoute = createRootRoute({
  component: function RootLayout() {
    return <Outlet />;
  },
});

// Layout Route (Dashboard with sidebar)
export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "dashboard",
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
      <aside className={cn("relative flex flex-col border-r border-border bg-white transition-all duration-300 shadow-sm", collapsed ? "w-20" : "w-64")}>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">NX</span>
              </div>
              <div>
                <span className="font-bold text-foreground">Nexus</span>
                <p className="text-xs text-muted-foreground">MES System</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">N</span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white shadow-sm hover:bg-blue-50 transition-colors text-muted-foreground"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* User */}
        <div className="border-t border-border p-4">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
              JD
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-slate-50">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 rounded-lg border border-border bg-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors shadow-sm"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon className="h-4 w-4 text-slate-600" /> : <Sun className="h-4 w-4 text-yellow-400" />}
            </button>
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-green-500 absolute -top-0.5 -right-0.5 animate-pulse" />
              <div className="h-9 w-9 rounded-lg border border-border bg-white flex items-center justify-center text-sm shadow-sm">🔔</div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 text-foreground relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 -left-40 h-[600px] w-[600px] rounded-full orb-blue animate-pulse" />
        <div className="absolute bottom-20 -right-40 h-[500px] w-[500px] rounded-full orb-cyan animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-gradient-to-r from-blue-100/30 to-cyan-100/30 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">NX</span>
              </div>
              <span className="text-xl font-bold text-foreground">Nexus MES</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-blue-600">Home</Link>
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-sm font-medium mb-8 shadow-sm">
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
              <button className="w-full sm:w-auto px-8 py-3 rounded-xl border-2 border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 transition-colors shadow-sm">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white border-t border-border">
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
              <div key={i} className="modern-card p-6 hover:border-blue-200">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-4 text-2xl">
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
      <footer className="border-t border-border bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">NX</span>
              </div>
              <span className="font-semibold text-foreground">Nexus MES</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Nexus. All rights reserved.
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
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
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
          <button key={i} className="modern-card p-6 text-left hover:border-blue-200 flex items-center gap-4">
            <span className="text-2xl">{action.icon}</span>
            <div>
              <p className="font-semibold text-foreground">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Components Route
export const componentsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/components",
  component: ComponentsPage,
});

function ComponentsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Components</h2>
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
  path: "/users",
  component: UsersPage,
});

function UsersPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">User Management</h2>
      <div className="modern-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-border">
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
              <tr key={i} className="border-b border-border hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-foreground">{user.name}</td>
                <td className="p-4 text-muted-foreground">{user.email}</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{user.role}</span>
                </td>
                <td className="p-4">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-medium", user.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700")}>
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
  path: "/settings",
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