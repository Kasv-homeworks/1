import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload as UploadIcon, ArrowLeft, FileText } from "lucide-react";
const Upload = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    homework_date: "",
    subject: "",
    homework_text: "",
  });

  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(file => {
        const fileType = file.type;
        return (
          fileType === "application/pdf" ||
          fileType.startsWith("image/") ||
          fileType === "text/plain"
        );
      });
      
      if (validFiles.length !== selectedFiles.length) {
        toast.error("Some files were skipped - only PDF, images, or text files are allowed");
      }
      
      if (validFiles.length > 0) {
        setFiles(validFiles);
      } else {
        toast.error("Please upload only PDF, images, or text files");
        e.target.value = "";
      }
    }
  };

  const uploadToCloudinary = async (file: File): Promise<{ url: string; type: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "home for web");

    const cloudName = await supabase.functions.invoke("get-cloudinary-name");
    
    const resourceType = file.type.startsWith("image/") ? "image" : "raw";
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName.data}/${resourceType}/upload`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload to Cloudinary");
    }

    const data = await response.json();
    return { url: data.secure_url, type: file.type };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.homework_date || !formData.subject || !formData.homework_text) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUploading(true);

    try {
      let fileUrls: string[] = [];
      let fileTypes: string[] = [];

      if (files.length > 0) {
        const uploadResults = await Promise.all(
          files.map(file => uploadToCloudinary(file))
        );
        fileUrls = uploadResults.map(result => result.url);
        fileTypes = uploadResults.map(result => result.type);
      }

      const { error } = await supabase.from("homeworks").insert({
        title: formData.title,
        homework_date: formData.homework_date,
        subject: formData.subject,
        homework_text: formData.homework_text,
        file_urls: fileUrls.length > 0 ? fileUrls : null,
        file_types: fileTypes.length > 0 ? fileTypes : null,
      });

      if (error) throw error;

      toast.success("Homework uploaded successfully!");
      setFormData({ title: "", homework_date: "", subject: "", homework_text: "" });
      setFiles([]);
      navigate("/homeworks");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload homework");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 px-4 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Upload Homework
            </CardTitle>
            <CardDescription className="text-sm">Fill in the details and upload your homework</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter homework title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.homework_date}
                  onChange={(e) => setFormData({ ...formData, homework_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Enter subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="homework">Homework *</Label>
                <Textarea
                  id="homework"
                  placeholder="Enter your homework details here..."
                  className="min-h-[150px] sm:min-h-[200px]"
                  value={formData.homework_text}
                  onChange={(e) => setFormData({ ...formData, homework_text: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Upload Files (PDF, Image, or Text) - Multiple allowed</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,image/*,.txt"
                    multiple
                    className="cursor-pointer"
                  />
                  {files.length > 0 && <FileText className="h-5 w-5 text-primary" />}
                </div>
                {files.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {files.length} file{files.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isUploading}
              >
                <UploadIcon className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Homework"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
