import { uploadImageFile } from "@/lib/uploads/imageUpload";

export async function uploadProfileImage(file: File): Promise<string> {
  return uploadImageFile(file, "/uploads/profile-image");
}
