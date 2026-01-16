import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Homeworks from "./pages/Homeworks";
import Notes from "./pages/Notes";
import UploadNotes from "./pages/UploadNotes";
import ViewNotes from "./pages/ViewNotes";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/homeworks" element={<Homeworks />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/upload-notes" element={<UploadNotes />} />
                <Route path="/view-notes" element={<ViewNotes />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
