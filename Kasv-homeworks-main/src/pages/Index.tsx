import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, StickyNote, GraduationCap, Shield } from "lucide-react";
const Index = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="absolute top-4 right-4">
          <Button
            onClick={() => navigate("/admin")}
            className="gap-2"
            size="lg"
          >
            <Shield className="h-5 w-5" />
            Admin
          </Button>
        </div>

        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <GraduationCap className="h-12 w-12 sm:h-16 sm:w-16 text-primary-foreground" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground mb-3 sm:mb-4">
            Homework Hub
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto px-4">Your central platform for uploading, managing, and accessing all your homework and Notes</p>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto">
          <Card className="p-6 sm:p-8 text-center hover:shadow-glow transition-all duration-300 cursor-pointer animate-slide-up bg-card/95 backdrop-blur" onClick={() => navigate("/homeworks")} style={{
          animationDelay: "0.1s"
        }}>
            <div className="bg-gradient-primary rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">View Homeworks</h2>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
              Browse all homework assignments
            </p>
            <Button variant="secondary" className="w-full">
              View All
            </Button>
          </Card>

          <Card className="p-6 sm:p-8 text-center hover:shadow-glow transition-all duration-300 cursor-pointer animate-slide-up bg-card/95 backdrop-blur" onClick={() => navigate("/view-notes")} style={{
          animationDelay: "0.2s"
        }}>
            <div className="bg-gradient-primary rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <StickyNote className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">View Notes</h2>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
              Browse all uploaded notes
            </p>
            <Button variant="secondary" className="w-full">
              View Notes
            </Button>
          </Card>
        </div>
      </div>
    </div>;
};
export default Index;