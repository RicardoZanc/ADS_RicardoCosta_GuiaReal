import type { UserInteraction, UserProfile } from "@/lib/types/users";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { UserAvatarUploadControls } from "@/components/profile/UserAvatarUploadControls";
import { UserInteractionList } from "@/components/profile/UserInteractionList";

interface UserProfileViewProps {
  profile: UserProfile;
  interactions: UserInteraction[];
  isOwnProfile: boolean;
  avatarPreviewUrl?: string | null;
  isUploadingAvatar?: boolean;
  onSelectAvatar?: (file: File) => void;
  onRemoveAvatar?: () => void;
}

export function UserProfileView({
  profile,
  interactions,
  isOwnProfile,
  avatarPreviewUrl = null,
  isUploadingAvatar = false,
  onSelectAvatar,
  onRemoveAvatar,
}: UserProfileViewProps) {
  const displayAvatarUrl = avatarPreviewUrl ?? profile.avatar_url;
  const canEditAvatar =
    isOwnProfile && onSelectAvatar !== undefined && onRemoveAvatar !== undefined;

  return (
    <div className="flex flex-col gap-10 lg:gap-12">
      <section className="border border-border/30 p-5 sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-start lg:gap-10">
          <div className="relative shrink-0">
            <UserAvatar
              username={profile.username}
              avatarUrl={displayAvatarUrl}
              size="lg"
            />
            {canEditAvatar && isUploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <p className="font-mono text-small text-foreground">Enviando...</p>
              </div>
            )}

            {canEditAvatar && (
              <div className="mt-4 lg:hidden">
                <UserAvatarUploadControls
                  previewUrl={displayAvatarUrl}
                  isUploading={isUploadingAvatar}
                  onSelect={onSelectAvatar}
                  onRemove={onRemoveAvatar}
                />
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-3 lg:pt-1">
            {isOwnProfile && profile.email && (
              <p className="text-body text-muted lg:text-h4">{profile.email}</p>
            )}
            <p className="text-body text-foreground lg:text-h4">
              <span className="text-muted">Reputação:</span>{" "}
              <span className="font-medium">{profile.reputation_score}</span>
            </p>
          </div>

          {canEditAvatar && (
            <div className="hidden lg:block">
              <UserAvatarUploadControls
                previewUrl={displayAvatarUrl}
                isUploading={isUploadingAvatar}
                onSelect={onSelectAvatar}
                onRemove={onRemoveAvatar}
                align="end"
              />
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-mono text-small font-medium tracking-widest text-accent uppercase lg:mb-5">
          Interações
        </h2>
        <UserInteractionList interactions={interactions} />
      </section>
    </div>
  );
}
