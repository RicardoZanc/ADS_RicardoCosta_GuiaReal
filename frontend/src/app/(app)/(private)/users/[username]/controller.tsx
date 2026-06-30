"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { ApiError } from "@/lib/errors";
import { notifyApiError } from "@/lib/notifyApiError";
import { uploadProfileImage } from "@/lib/uploads/profileImage";
import {
  fetchUserInteractions,
  fetchUserProfile,
  updateUserAvatar,
} from "@/lib/users";
import { fetchMyAdminRequests } from "@/lib/adminRequests";
import { refreshSession } from "@/lib/api";
import type { UserInteraction, UserInterest, UserProfile } from "@/lib/types/users";
import type {
  AdminRequestEligibility,
  AdminRequestItem,
} from "@/lib/types/adminRequests";

function revokeBlobUrl(url: string | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function useUserProfileController() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username);
  const authUser = useAuthStore((state) => state.user);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(true);
  const [isLoadingMoreInteractions, setIsLoadingMoreInteractions] =
    useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [adminRequests, setAdminRequests] = useState<AdminRequestItem[]>([]);
  const [adminEligibility, setAdminEligibility] =
    useState<AdminRequestEligibility | null>(null);
  const [isLoadingAdminRequests, setIsLoadingAdminRequests] = useState(false);

  const isOwnProfile = authUser?.username === profile?.username;
  const showAdminRequestSection =
    isOwnProfile && authUser !== null && !authUser.is_admin;

  useEffect(() => {
    return () => {
      revokeBlobUrl(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const loadProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    setNotFound(false);

    try {
      const data = await fetchUserProfile(username);
      setProfile(data);
      setAvatarPreviewUrl(null);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        setNotFound(true);
        setProfile(null);
      } else {
        notifyApiError(error);
        setProfile(null);
      }
    } finally {
      setIsLoadingProfile(false);
    }
  }, [username]);

  const loadInteractions = useCallback(
    async (targetPage: number, append: boolean) => {
      if (append) {
        setIsLoadingMoreInteractions(true);
      } else {
        setIsLoadingInteractions(true);
      }

      try {
        const response = await fetchUserInteractions(username, targetPage);
        setInteractions((prev) =>
          append ? [...prev, ...response.data] : response.data
        );
        setPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        notifyApiError(error);
        if (!append) {
          setInteractions([]);
        }
      } finally {
        if (append) {
          setIsLoadingMoreInteractions(false);
        } else {
          setIsLoadingInteractions(false);
        }
      }
    },
    [username]
  );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    void loadInteractions(1, false);
  }, [loadInteractions]);

  const loadAdminRequests = useCallback(async () => {
    if (!showAdminRequestSection) {
      setAdminRequests([]);
      setAdminEligibility(null);
      return;
    }

    setIsLoadingAdminRequests(true);
    try {
      const data = await fetchMyAdminRequests();
      setAdminRequests(data.requests);
      setAdminEligibility(data.eligibility);

      const hasApproved = data.requests.some(
        (request) => request.status === "APPROVED"
      );
      if (hasApproved && !authUser?.is_admin) {
        await refreshSession();
      }
    } catch (error) {
      notifyApiError(error);
      setAdminRequests([]);
      setAdminEligibility(null);
    } finally {
      setIsLoadingAdminRequests(false);
    }
  }, [authUser?.is_admin, showAdminRequestSection]);

  useEffect(() => {
    void loadAdminRequests();
  }, [loadAdminRequests]);

  const handleAdminRequestCreated = useCallback((request: AdminRequestItem) => {
    setAdminRequests((prev) => [request, ...prev]);
    setAdminEligibility((prev) =>
      prev
        ? { ...prev, can_request: false, reason: "PENDING_REQUEST" }
        : prev
    );
  }, []);

  const hasMoreInteractions = page < totalPages;

  function loadMoreInteractions() {
    if (!hasMoreInteractions || isLoadingMoreInteractions || isLoadingInteractions) {
      return;
    }
    void loadInteractions(page + 1, true);
  }

  function clearAvatarPreview() {
    setAvatarPreviewUrl((current) => {
      revokeBlobUrl(current);
      return null;
    });
  }

  async function handleSelectAvatar(file: File) {
    if (!isOwnProfile) return;

    const preview = URL.createObjectURL(file);
    setAvatarPreviewUrl((current) => {
      revokeBlobUrl(current);
      return preview;
    });
    setIsUploadingAvatar(true);

    try {
      const publicUrl = await uploadProfileImage(file);
      const updated = await updateUserAvatar(publicUrl);
      setProfile(updated);
      setAvatarPreviewUrl((current) => {
        revokeBlobUrl(current);
        return publicUrl;
      });
    } catch (error) {
      clearAvatarPreview();
      notifyApiError(error);
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    if (!isOwnProfile) return;

    clearAvatarPreview();
    setIsUploadingAvatar(true);

    try {
      const updated = await updateUserAvatar(null);
      setProfile(updated);
    } catch (error) {
      notifyApiError(error);
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  const handleInterestsUpdated = useCallback((interests: UserInterest[]) => {
    setProfile((prev) => (prev ? { ...prev, interests } : prev));
  }, []);

  return {
    profile,
    interactions,
    avatarPreviewUrl,
    notFound,
    isOwnProfile,
    isLoadingProfile,
    isLoadingInteractions,
    isLoadingMoreInteractions,
    hasMoreInteractions,
    isUploadingAvatar,
    loadMoreInteractions,
    handleSelectAvatar,
    handleRemoveAvatar,
    handleInterestsUpdated,
    adminRequests,
    adminEligibility,
    isLoadingAdminRequests,
    showAdminRequestSection,
    handleAdminRequestCreated,
  };
}
