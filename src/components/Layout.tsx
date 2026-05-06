import { Outlet, Link, useLocation } from "react-router-dom";
import { ClipboardCheck, LayoutDashboard, FileText, Settings, UserCircle, LogOut, Users } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";

export default function Layout() {
  const location = useLocation();
  const { user, school, isAdmin, logout } = useAuth();

  const navItems = [];
  if (isAdmin) {
    navItems.push({ label: "Admin Panel", icon: Users, path: "/admin" });
  }
  
  if (school || isAdmin) {
    navItems.push({ label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" });
    navItems.push({ label: "Mark Scripts", icon: ClipboardCheck, path: "/mark" });
    navItems.push({ label: "Analytics & Reports", icon: FileText, path: "/analytics" });
  }
  navItems.push({ label: "Settings", icon: Settings, path: "/settings" });

  const remainingStudents = school ? Math.max(0, school.maxStudents - school.registeredStudentsCount) : 0;

  return (
    <div className="flex h-screen w-full font-sans bg-[#F7F6F2] text-[#1A1A1A] p-4 lg:p-8">
      <div className="flex w-full h-full border-4 border-[#1A1A1A] bg-white overflow-hidden shadow-[8px_8px_0_0_#1A1A1A]">
      {/* Sidebar */}
      <aside className="w-64 border-r-2 border-[#1A1A1A] bg-white flex flex-col">
        <div className="h-20 flex items-center px-6 border-b-2 border-[#1A1A1A]">
          <ClipboardCheck className="w-6 h-6 mr-3 text-[#1A1A1A]" />
          <span className="font-serif font-black text-xl italic tracking-tighter">Examiner Asst.</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors border-2",
                    isActive
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                      : "text-[#1A1A1A]/70 border-transparent hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 mr-4", isActive ? "text-white" : "text-[#1A1A1A]/50")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t-2 border-[#1A1A1A]">
          <div className="flex items-center cursor-pointer hover:bg-[#F7F6F2] p-2 -mx-2 rounded transition-colors" onClick={logout}>
            <UserCircle className="w-8 h-8 text-[#1A1A1A]/50" />
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-bold text-[#1A1A1A] truncate">{isAdmin ? 'Admin' : (school?.name || user?.displayName || 'User')}</p>
              <p className="text-[10px] text-[#1A1A1A]/70 truncate">{user?.email}</p>
            </div>
            <button className="text-[#1A1A1A]/50 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#F7F6F2]">
        <div className="h-20 flex justify-between items-center px-8 border-b-2 border-[#1A1A1A] bg-white">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-mono text-[#1A1A1A]">
                {school && !isAdmin && (
                  <>Students Remaining: <span className={cn("text-base font-black ml-2", remainingStudents <= 0 ? "text-red-600" : remainingStudents <= 5 ? "text-amber-600" : "text-green-600")}>{remainingStudents}</span></>
                )}
                {isAdmin && <span className="text-blue-600">ADMINISTRATOR SESSION</span>}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#1A1A1A]/50 shrink-0">Waec Engine Active</span>
        </div>
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      </div>
    </div>
  );
}
