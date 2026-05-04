import { authClient } from "@/lib/auth-client";
import axios from "axios";

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  image?: string;
}

export class UserService {
  async getUser() {
    try {
      const response = await axios.get("/api/user");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch user data");
    }
  }

  async updateUser(payload: UpdateUserPayload) {
    try {
      const response = await axios.patch("/api/user", payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to update profile");
    }
  }

  async getSessions() {
    try {
      const response = await axios.get("/api/user/sessions");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch sessions");
    }
  }

  async revokeSession(sessionId: string) {
    try {
      const response = await axios.delete("/api/user/sessions", {
        data: { sessionId },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to revoke session");
    }
  }

  async changePassword(password: string, currentPassword: string) {
    const { data, error } = await authClient.changePassword({
      newPassword: password,
      currentPassword: currentPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      throw new Error(error.message || "Failed to change password");
    }

    return data;
  }
}

export const userService = new UserService();
