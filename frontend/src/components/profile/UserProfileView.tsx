import { Eyebrow } from "@/components/ui/eyebrow";
import { FadeIn } from "@/components/motion/FadeIn";
import type { UserInteraction, UserInterest, UserProfile } from "@/lib/types/users";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { UserAvatarUploadControls } from "@/components/profile/UserAvatarUploadControls";
import { UserInteractionList } from "@/components/profile/UserInteractionList";
import { UserInterestBadges } from "@/components/interests/UserInterestBadges";
import { InterestPickerDialog } from "@/components/interests/InterestPickerDialog";
import { AdminRequestSection } from "@/components/profile/AdminRequestSection";
import type {
  AdminRequestEligibility,
  AdminRequestItem,
} from "@/lib/types/adminRequests";
import { cn } from "@/lib/utils";

interface UserProfileViewProps {
  profile: UserProfile;
  interactions: UserInteraction[];
  isOwnProfile: boolean;
  avatarPreviewUrl?: string | null;
  isUploadingAvatar?: boolean;
  onSelectAvatar?: (file: File) => void;
  onRemoveAvatar?: () => void;
  onInterestsUpdated?: (interests: UserInterest[]) => void;
  showAdminRequestSection?: boolean;
  adminRequests?: AdminRequestItem[];
  adminEligibility?: AdminRequestEligibility | null;
  isLoadingAdminRequests?: boolean;
  onAdminRequestCreated?: (request: AdminRequestItem) => void;
}

export function UserProfileView({
  profile,
  interactions,
  isOwnProfile,
  avatarPreviewUrl = null,
  isUploadingAvatar = false,
  onSelectAvatar,
  onRemoveAvatar,
  onInterestsUpdated,
  showAdminRequestSection = false,
  adminRequests = [],
  adminEligibility = null,
  isLoadingAdminRequests = false,
  onAdminRequestCreated,
}: UserProfileViewProps) {
  const displayAvatarUrl = avatarPreviewUrl ?? profile.avatar_url;
  const canEditAvatar =
    isOwnProfile && onSelectAvatar !== undefined && onRemoveAvatar !== undefined;

  return (
    <div className="flex flex-col gap-10 lg:gap-12">
      <FadeIn>
        <section className="rounded-2xl border border-border/15 bg-card p-5 shadow-[var(--shadow-card)] sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-start lg:gap-10">
            <div className="relative shrink-0">
              <UserAvatar
                username={profile.username}
                avatarUrl={displayAvatarUrl}
                size="lg"
                className="rounded-2xl ring-2 ring-accent/20 ring-offset-2 ring-offset-card"
              />
              {canEditAvatar && isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/70 backdrop-blur-sm">
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
                <span
                  className={cn(
                    "font-medium",
                    profile.reputation_score < 0
                      ? "text-destructive"
                      : "text-accent"
                  )}
                >
                  {profile.reputation_score}
                </span>
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
      </FadeIn>

      {showAdminRequestSection ? (
        isLoadingAdminRequests || !adminEligibility ? (
          <div className="skeleton-shimmer h-32 rounded-2xl border border-border/15" />
        ) : onAdminRequestCreated ? (
          <AdminRequestSection
            requests={adminRequests}
            eligibility={adminEligibility}
            reputationScore={profile.reputation_score}
            onRequestCreated={onAdminRequestCreated}
          />
        ) : null
      ) : null}

      <section>
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-3 lg:mb-5">
          <Eyebrow>Interações</Eyebrow>
          <UserInterestBadges interests={profile.interests ?? []} />
          {isOwnProfile && onInterestsUpdated && (
            <InterestPickerDialog
              initialInterests={profile.interests ?? []}
              onSaved={onInterestsUpdated}
            />
          )}
        </div>
        <UserInteractionList interactions={interactions} />
      </section>
    </div>
  );
}
