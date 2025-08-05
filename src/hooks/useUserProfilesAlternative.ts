import { useQuery } from "@tanstack/react-query";
import { fetchUserProfilesAlternative, UserProfileDataAlternative } from "@/lib/api/profiles/fetchUserProfilesAlternative";

export const useUserProfilesAlternative = (eventId: string | null) => {
  return useQuery<UserProfileDataAlternative[]>({
    queryKey: ['user-profiles-alternative', eventId],
    queryFn: () => fetchUserProfilesAlternative(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};