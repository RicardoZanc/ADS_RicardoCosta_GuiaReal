import { uploadImageFile } from "@/lib/uploads/imageUpload";

export async function uploadProductImage(file: File): Promise<string> {
  return uploadImageFile(file, "/uploads/product-image");
}
