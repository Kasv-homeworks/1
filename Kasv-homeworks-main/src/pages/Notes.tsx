import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Trash2, Edit2, Save } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNote.title || !newNote.content) {
      toast.error("Please fill in both title and content");
      return;
    }

    try {
      const { error } = await supabase.from("notes").insert({
        title: newNote.title,
        content: newNote.content,
      });

      if (error) throw error;

      toast.success("Note created successfully");
      setNewNote({ title: "", content: "" });
      fetchNotes();
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    }
  };

  const handleUpdateNote = async (id: string, title: string, content: string) => {
    try {
      const { error } = await supabase
        .from("notes")
        .update({ title, content })
        .eq("id", id);

      if (error) throw error;

      toast.success("Note updated successfully");
      setEditingId(null);
      fetchNotes();
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Failed to update note");
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);

      if (error) throw error;

      toast.success("Note deleted successfully");
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => navigate("/")} className="mb-4 sm:mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            My Notes
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Create and manage your notes</p>
        </div>

        <Card className="mb-6 sm:mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              Create New Note
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Note title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />
            <Textarea
              placeholder="Note content"
              className="min-h-[100px] sm:min-h-[120px]"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            />
            <Button onClick={handleCreateNote} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card
              key={note.id}
              className="shadow-card hover:shadow-glow transition-all duration-300 animate-scale-in"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  {editingId === note.id ? (
                    <Input
                      defaultValue={note.title}
                      className="flex-1"
                      id={`title-${note.id}`}
                    />
                  ) : (
                    <CardTitle className="flex-1 text-lg sm:text-xl">{note.title}</CardTitle>
                  )}
                  <div className="flex gap-1">
                    {editingId === note.id ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const titleInput = document.getElementById(
                            `title-${note.id}`
                          ) as HTMLInputElement;
                          const contentInput = document.getElementById(
                            `content-${note.id}`
                          ) as HTMLTextAreaElement;
                          handleUpdateNote(note.id, titleInput.value, contentInput.value);
                        }}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingId(note.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingId === note.id ? (
                  <Textarea
                    defaultValue={note.content}
                    className="min-h-[100px] sm:min-h-[120px]"
                    id={`content-${note.id}`}
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap break-words">
                    {note.content}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {notes.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No notes yet. Create your first note above!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notes;
