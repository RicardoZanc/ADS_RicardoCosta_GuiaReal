"use client";

import { UserAvatar } from "@/components/profile/UserAvatar";
import { UserAvatarUploadControls } from "@/components/profile/UserAvatarUploadControls";

interface UserAvatarFieldProps {
  username: string;
  previewUrl: string | null;
  disabled?: boolean;
  isUploading?: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

export function UserAvatarField({
  username,
  previewUrl,
  disabled = false,
  isUploading = false,
  onSelect,
  onRemove,
}: UserAvatarFieldProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-fit">
        <UserAvatar username={username} avatarUrl={previewUrl} size="lg" />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <p className="font-mono text-small text-foreground">Enviando...</p>
          </div>
        )}
      </div>

      <UserAvatarUploadControls
        previewUrl={previewUrl}
        disabled={disabled}
        isUploading={isUploading}
        onSelect={onSelect}
        onRemove={onRemove}
      />
    </div>
  );
}
