import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
interface SubjectNote {
  id: string;
  subject: string;
  image_urls: string[];
  created_at: string;
}
const ViewNotes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<SubjectNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchNotes();
  }, []);
  const fetchNotes = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("subject_notes").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      const {
        error
      } = await supabase.from("subject_notes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Note deleted successfully");
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };
  
  const handleDownload = async (note: SubjectNote) => {
    try {
      toast.info(`Downloading ${note.image_urls.length} images...`);
      
      // Download each image individually
      for (let i = 0; i < note.image_urls.length; i++) {
        const imageUrl = note.image_urls[i];
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
        
        // Create download link for each image
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${note.subject}_image_${i + 1}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      toast.success("All images downloaded successfully");
    } catch (error) {
      console.error("Error downloading images:", error);
      toast.error("Failed to download images");
    }
  };
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background py-4 sm:py-8 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <Button variant="outline" onClick={() => navigate("/")} className="mb-4 sm:mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            All Notes
          </h1>
          <p className="text-muted-foreground">View all uploaded notes</p>
        </div>

        {notes.length === 0 ? <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No notes yet. Upload your first note!</p>
            </CardContent>
          </Card> : <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {notes.map(note => <Card key={note.id} className="shadow-card hover:shadow-glow transition-all duration-300 animate-scale-in overflow-hidden">
                <div className="space-y-2">
                  {note.image_urls.map((url, index) => <div key={index} className="aspect-video w-full overflow-hidden bg-muted">
                      <img src={url} alt={`Note ${index + 1}`} className="w-full h-full object-cover" />
                    </div>)}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="flex-1 text-lg sm:text-xl">Subject</CardTitle>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownload(note)}
                      className="shrink-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                    {note.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>)}
          </div>}
      </div>
    </div>;
};
export default ViewNotes;