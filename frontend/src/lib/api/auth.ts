import { apiClient } from "../api";
import type { User } from "@/types/auth";

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    accessToken?: string;
  };
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/v1/auth/login", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(payload: {
  email: string;
  password: string;
  fullName: string;
  role?: "student" | "instructor";
}): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/v1/auth/register", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/v1/auth/me", {
    method: "GET",
    credentials: "include",
  });
}

export async function logoutUser(): Promise<{ success: boolean; message: string }> {
  return apiClient<{ success: boolean; message: string }>("/v1/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}
