import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService, UpdateUserPayload } from "@/lib/services/user/userService";
import { toast } from "sonner";

export const useGetUserInfo = () => {
  return useQuery({
    queryKey: ["userInfo"],
    queryFn: () => userService.getUser(),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => userService.updateUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
      queryClient.invalidateQueries({ queryKey: ["session"] }); // Also invalidate session if session contains name/image
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ password, currentPassword }: { password: string; currentPassword: string }) =>
      userService.changePassword(password, currentPassword),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to change password");
    },
  });
};

export const useGetSessions = () => {
  return useQuery({
    queryKey: ["userSessions"],
    queryFn: () => userService.getSessions(),
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => userService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSessions"] });
      toast.success("Session revoked successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to revoke session");
    },
  });
};
