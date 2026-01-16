import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, BookOpen, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Homework {
  id: string;
  title: string;
  homework_date: string;
  subject: string;
  homework_text: string;
  file_urls: string[] | null;
  file_types: string[] | null;
  created_at: string;
}

const Homeworks = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    subject: "",
    homework_date: "",
    homework_text: ""
  });
  useEffect(() => {
    fetchHomeworks();
  }, []);
  const fetchHomeworks = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("homeworks").select("*").order("homework_date", {
        ascending: false
      });
      if (error) throw error;
      setHomeworks(data || []);
    } catch (error) {
      console.error("Error fetching homeworks:", error);
      toast.error("Failed to load homeworks");
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this homework?")) return;
    try {
      const {
        error
      } = await supabase.from("homeworks").delete().eq("id", id);
      if (error) throw error;
      toast.success("Homework deleted successfully");
      fetchHomeworks();
    } catch (error) {
      console.error("Error deleting homework:", error);
      toast.error("Failed to delete homework");
    }
  };

  const handleEdit = (homework: Homework) => {
    setEditingHomework(homework);
    setEditForm({
      title: homework.title,
      subject: homework.subject,
      homework_date: homework.homework_date,
      homework_text: homework.homework_text
    });
  };

  const handleUpdate = async () => {
    if (!editingHomework) return;
    try {
      const { error } = await supabase
        .from("homeworks")
        .update({
          title: editForm.title,
          subject: editForm.subject,
          homework_date: editForm.homework_date,
          homework_text: editForm.homework_text
        })
        .eq("id", editingHomework.id);

      if (error) throw error;
      toast.success("Homework updated successfully");
      setEditingHomework(null);
      fetchHomeworks();
    } catch (error) {
      console.error("Error updating homework:", error);
      toast.error("Failed to update homework");
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return null;
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType === "application/pdf") return "📄";
    return "📝";
  };
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading homeworks...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background py-4 sm:py-8 px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => navigate("/")} className="mb-4 sm:mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            All Homeworks
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Browse and view all uploaded homeworks</p>
        </div>

        {homeworks.length === 0 ? <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No homeworks yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first homework to get started
              </p>
              <Button onClick={() => navigate("/upload")}>Upload Homework</Button>
            </CardContent>
          </Card> : <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {homeworks.map(homework => <Card 
                key={homework.id} 
                className={`shadow-card hover:shadow-glow transition-all duration-300 animate-scale-in ${isEditMode ? 'cursor-pointer' : ''}`}
                onClick={isEditMode ? () => handleEdit(homework) : undefined}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg sm:text-xl mb-2">{homework.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        {formatDate(homework.homework_date)}
                      </CardDescription>
                    </div>
                    {isEditMode && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={(e) => handleDelete(homework.id, e)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Badge className="w-fit mt-2 text-xs">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {homework.subject}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm sm:text-base">Homework:</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap break-words">
                        {homework.homework_text}
                      </p>
                    </div>

                    {homework.file_urls && homework.file_urls.length > 0 && <div>
                        <h4 className="font-semibold mb-2 text-sm sm:text-base">Attachments:</h4>
                        <div className="space-y-4">
                          {homework.file_urls.map((url, index) => {
                            const fileType = homework.file_types?.[index];
                            const isImage = fileType?.startsWith("image/");
                            
                            if (isImage) {
                              return (
                                <div key={index} className="space-y-2">
                                  <img 
                                    src={url} 
                                    alt={`Homework attachment ${index + 1}`}
                                    className="w-full rounded-lg border border-border"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                     onClick={async (e) => {
                                       e.stopPropagation();
                                       try {
                                        const response = await fetch(url);
                                        const blob = await response.blob();
                                        const blobUrl = URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = blobUrl;
                                        link.download = `homework-image-${index + 1}.jpg`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        URL.revokeObjectURL(blobUrl);
                                        toast.success("Image downloaded successfully");
                                      } catch (error) {
                                        console.error("Download failed:", error);
                                        toast.error("Failed to download image");
                                      }
                                    }}
                                  >
                                    Download Image
                                  </Button>
                                  <p className="text-xs text-muted-foreground text-center">
                                    Click the upper button for download the image
                                  </p>
                                </div>
                              );
                            }
                            
                            return (
                              <a 
                                key={index}
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-2 text-primary hover:underline text-xs sm:text-sm"
                              >
                                <span className="text-lg sm:text-xl">{getFileIcon(fileType)}</span>
                                File {index + 1}
                              </a>
                            );
                          })}
                        </div>
                      </div>}
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </div>

      <Dialog open={!!editingHomework} onOpenChange={() => setEditingHomework(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Homework</DialogTitle>
            <DialogDescription>
              Make changes to the homework details below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={editForm.subject}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={editForm.homework_date}
                onChange={(e) => setEditForm({ ...editForm, homework_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="text">Homework Text</Label>
              <Textarea
                id="text"
                value={editForm.homework_text}
                onChange={(e) => setEditForm({ ...editForm, homework_text: e.target.value })}
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingHomework(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Homeworks;