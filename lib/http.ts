"use client";

import axios, { AxiosError } from "axios";
import { getSession, signOut } from "next-auth/react";

const baseURL = (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTPUBLICBASEURL || "").replace(/\/+$/, "");

function assertBaseUrl() {
  if (baseURL) {
    return;
  }

  throw new Error("Missing API base URL. Set NEXT_PUBLIC_BASE_URL in zenolok_front-end/.env");
}

export const publicApiClient = axios.create({
  baseURL,
  withCredentials: true,
});

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

publicApiClient.interceptors.request.use((config) => {
  assertBaseUrl();
  return config;
});

apiClient.interceptors.request.use(async (config) => {
  assertBaseUrl();

  const session = await getSession();
  const token = session?.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      await signOut({ callbackUrl: "/auth/login" });
    }

    return Promise.reject(error);
  }
);
