import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload as UploadIcon, ArrowLeft, Image } from "lucide-react";
const UploadNotes = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [subject, setSubject] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validImages = selectedFiles.filter(file => file.type.startsWith("image/"));
      
      if (validImages.length !== selectedFiles.length) {
        toast.error("Some files were skipped - only images are allowed");
      }
      
      if (validImages.length > 0) {
        setImages(validImages);
      } else {
        toast.error("Please upload only images");
        e.target.value = "";
      }
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "home for web");

    const cloudName = await supabase.functions.invoke("get-cloudinary-name");
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName.data}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload to Cloudinary");
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error("Please fill in the subject");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsUploading(true);

    try {
      const imageUrls = await Promise.all(
        images.map(image => uploadToCloudinary(image))
      );

      const { error } = await supabase.from("subject_notes").insert({
        subject: subject,
        image_urls: imageUrls,
      });

      if (error) throw error;

      toast.success("Note uploaded successfully!");
      setSubject("");
      setImages([]);
      navigate("/view-notes");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload note");
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
              Upload Note
            </CardTitle>
            <CardDescription>Add a subject and upload an image</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Textarea
                  id="subject"
                  placeholder="Enter subject details..."
                  className="min-h-[150px] sm:min-h-[200px]"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Upload Images * (Multiple allowed)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="images"
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    multiple
                    className="cursor-pointer"
                  />
                  {images.length > 0 && <Image className="h-5 w-5 text-primary" />}
                </div>
                {images.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {images.length} image{images.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isUploading}
              >
                <UploadIcon className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Note"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadNotes;
