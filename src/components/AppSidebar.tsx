import { LayoutDashboard, ListChecks, Grid3x3, Sparkles, Car, Presentation, Radio, Layers, Briefcase } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

const presentation = [
  { title: "Discussion Hub", url: "/present", icon: Presentation, end: true },
  { title: "1 · AI in the Car", url: "/present/in-car", icon: Car },
  { title: "2 · AI in Transport", url: "/present/transport", icon: Radio },
  { title: "3 · Blending & Interp.", url: "/present/blending", icon: Layers },
  { title: "4 · Business of Data", url: "/present/business", icon: Briefcase },
];

const workspace = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Initiatives", url: "/initiatives", icon: ListChecks },
  { title: "Matrix", url: "/matrix", icon: Grid3x3 },
  { title: "Compare", url: "/compare", icon: Sparkles },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (p: string, end?: boolean) => (end ? pathname === p : pathname === p || pathname.startsWith(p + "/"));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-glow)]">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">VeloData AI</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Discussion Guide</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Presentation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {presentation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.end)}>
                    <NavLink to={item.url} end={item.end} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspace.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
