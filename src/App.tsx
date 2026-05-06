import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import Initiatives from "./pages/Initiatives.tsx";
import Matrix from "./pages/Matrix.tsx";
import Compare from "./pages/Compare.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import PresentHub from "./pages/PresentHub.tsx";
import PresentLayer from "./pages/PresentLayer.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PresentHub />} />
          <Route path="/present" element={<PresentHub />} />
          <Route path="/present/:layerId" element={<PresentLayer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/initiatives" element={<Initiatives />} />
          <Route path="/matrix" element={<Matrix />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
