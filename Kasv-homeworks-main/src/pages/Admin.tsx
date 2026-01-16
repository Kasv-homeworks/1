import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, StickyNote, ArrowLeft, Trash2, FileEdit } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_PASSWORD = "Argho@12345";

const Admin = () => {
  const navigate = useNavigate();
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setShowPasswordDialog(false);
      toast.success("Access granted!");
    } else {
      toast.error("Incorrect password!");
      setPassword("");
    }
  };

  const handleDeletePasswordSubmit = () => {
    if (deletePassword === ADMIN_PASSWORD) {
      setShowDeleteDialog(false);
      setShowDeleteConfirm(true);
      setDeletePassword("");
    } else {
      toast.error("Incorrect password!");
      setDeletePassword("");
    }
  };

  const handleDeleteEverything = async () => {
    setIsDeleting(true);
    try {
      const { error: homeworksError } = await supabase
        .from("homeworks")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      const { error: notesError } = await supabase
        .from("notes")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      const { error: subjectNotesError } = await supabase
        .from("subject_notes")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (homeworksError || notesError || subjectNotesError) {
        throw new Error("Failed to delete some data");
      }

      toast.success("All data deleted successfully!");
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete data");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={showPasswordDialog} onOpenChange={() => navigate("/")}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Access</DialogTitle>
            <DialogDescription>
              Please enter the admin password to continue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handlePasswordSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button onClick={handlePasswordSubmit} className="w-full">
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground mb-3 sm:mb-4">
            Admin Panel
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto px-4">
            Upload and manage homework assignments and notes
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          <Card
            className="p-6 sm:p-8 text-center hover:shadow-glow transition-all duration-300 cursor-pointer animate-slide-up bg-card/95 backdrop-blur"
            onClick={() => navigate("/upload")}
            style={{ animationDelay: "0.1s" }}
          >
            <div className="bg-gradient-primary rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
              Upload Homework
            </h2>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
              Upload homework with files and text
            </p>
            <Button className="w-full">Go to Upload</Button>
          </Card>

          <Card
            className="p-6 sm:p-8 text-center hover:shadow-glow transition-all duration-300 cursor-pointer animate-slide-up bg-card/95 backdrop-blur"
            onClick={() => navigate("/upload-notes")}
            style={{ animationDelay: "0.2s" }}
          >
            <div className="bg-gradient-primary rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <StickyNote className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
              Upload Notes
            </h2>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
              Upload subject notes with images
            </p>
            <Button className="w-full">Upload Notes</Button>
          </Card>

          <Card
            className="p-6 sm:p-8 text-center hover:shadow-glow transition-all duration-300 cursor-pointer animate-slide-up bg-card/95 backdrop-blur"
            onClick={() => navigate("/homeworks?edit=true")}
            style={{ animationDelay: "0.3s" }}
          >
            <div className="bg-gradient-primary rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FileEdit className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
              Edit Homeworks
            </h2>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
              View and edit homework entries
            </p>
            <Button className="w-full">Edit Homeworks</Button>
          </Card>

          <Card
            className="p-6 sm:p-8 text-center hover:shadow-glow transition-all duration-300 cursor-pointer animate-slide-up bg-card/95 backdrop-blur"
            onClick={() => setShowDeleteDialog(true)}
            style={{ animationDelay: "0.4s" }}
          >
            <div className="bg-destructive rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Trash2 className="h-8 w-8 sm:h-10 sm:w-10 text-destructive-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
              Delete Everything
            </h2>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
              Delete all data from database
            </p>
            <Button variant="destructive" className="w-full">
              Delete All Data
            </Button>
          </Card>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Password</DialogTitle>
            <DialogDescription>
              Enter admin password to proceed with deletion
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleDeletePasswordSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleDeletePasswordSubmit} className="w-full">
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              homeworks, notes, and subject notes from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Deny</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEverything}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Allow"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
