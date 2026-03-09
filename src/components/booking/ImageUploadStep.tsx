import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadStepProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUploadStep({ images, onChange }: ImageUploadStepProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    if (images.length + files.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    setUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        continue;
      }

      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from("repair-images")
        .upload(fileName, file);

      if (error) {
        toast.error(`Failed to upload ${file.name}`);
        console.error(error);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from("repair-images")
          .getPublicUrl(fileName);
        newImages.push(publicUrl);
      }
    }

    onChange([...images, ...newImages]);
    setUploading(false);
  }, [images, onChange, user]);

  const removeImage = useCallback((indexToRemove: number) => {
    onChange(images.filter((_, index) => index !== indexToRemove));
  }, [images, onChange]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Upload Images (Optional)</h2>
      <p className="text-muted-foreground mb-6">
        Add up to 3 photos to help us understand the issue better
      </p>

      <div className="grid grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg border border-border overflow-hidden group"
          >
            <img
              src={url}
              alt={`Upload ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {images.length < 3 && (
          <label
            className={cn(
              "aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors",
              uploading && "pointer-events-none opacity-50"
            )}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Upload</span>
              </>
            )}
          </label>
        )}

        {images.length === 0 && (
          <>
            <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground/25" />
            </div>
            <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground/25" />
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Supported formats: JPG, PNG, WebP. Max size: 5MB per image.
      </p>
    </div>
  );
}
