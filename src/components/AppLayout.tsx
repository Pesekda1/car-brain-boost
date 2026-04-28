import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { useEvaluationStore } from "@/lib/evaluation-store";
import { RotateCcw } from "lucide-react";

export function AppLayout({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle?: string; actions?: ReactNode }) {
  const reset = useEvaluationStore((s) => s.reset);
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-20 h-14 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-4">
            <SidebarTrigger />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-semibold tracking-tight truncate">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 lg:p-8 max-w-[1500px] w-full mx-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
