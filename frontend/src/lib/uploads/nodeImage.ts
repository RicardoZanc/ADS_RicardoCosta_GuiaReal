import { uploadImageFile } from "@/lib/uploads/imageUpload";

export async function uploadNodeImage(file: File): Promise<string> {
  return uploadImageFile(file, "/uploads/node-image");
}
