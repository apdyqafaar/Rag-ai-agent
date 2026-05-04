"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useGetUserInfo, useUpdateUser, useChangePassword, useGetSessions, useRevokeSession } from "@/lib/hooks/user/useUser";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, User, Lock, Mail, Camera, Save, Globe, Monitor, Smartphone, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  image: z.string().url("Invalid image URL").optional().or(z.string().length(0)),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { data: user, isLoading: isUserLoading } = useGetUserInfo();
  const { data: sessions, isLoading: isSessionsLoading } = useGetSessions();
  const updateUser = useUpdateUser();
  const changePassword = useChangePassword();
  const revokeSession = useRevokeSession();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      image: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
        email: user.email || "",
        image: user.image || "",
      });
    }
  }, [user, profileForm]);

  const onProfileSubmit = (values: ProfileFormValues) => {
    updateUser.mutate(values);
  };

  const onPasswordSubmit = (values: PasswordFormValues) => {
    changePassword.mutate(
      { 
        password: values.newPassword, 
        currentPassword: values.currentPassword 
      },
      {
        onSuccess: () => {
          passwordForm.reset();
        },
      }
    );
  };

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return { browser: "Unknown", os: "Unknown" };
    
    let browser = "Browser";
    let os = "OS";

    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";

    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    return { browser, os };
  };

  if (isUserLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8 max-w-4xl">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8 max-w-4xl animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Profile Section */}
        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>
              Update your personal information and how others see you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-xl">
                    <AvatarImage src={profileForm.watch("image")} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="relative">
                    <Button onClick={()=>{
                      toast.info("Past your photo url on profile image url",{
                        description:"You can find your photo url on google drive or any image hosting website"
                      })
                    }} type="button" variant="outline" size="sm" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Change Avatar
                    </Button>
                    {/* Note: Real file upload would go here */}
                  </div>
                </div>

                <div className="flex-1 w-full space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        className="pl-10"
                        {...profileForm.register("name")}
                      />
                    </div>
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-destructive font-medium">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="pl-10"
                        {...profileForm.register("email")}
                      />
                    </div>
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-destructive font-medium">
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Profile Image URL</Label>
                    <Input
                      id="image"
                      placeholder="https://example.com/avatar.png"
                      {...profileForm.register("image")}
                    />
                    {profileForm.formState.errors.image && (
                      <p className="text-sm text-destructive font-medium">
                        {profileForm.formState.errors.image.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={updateUser.isPending}
                  className="gap-2 px-8"
                >
                  {updateUser.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Change your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
           {
            user?.accounts[0].providerId==="google"?(
              <div className="flex flex-col items-center justify-center gap-2 py-10">
                <Globe className="h-8 w-8 text-primary" />
                <p className="text-muted-foreground">You are logged in with Google</p>
              </div>
            ):(
              <>
               <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register("currentPassword")}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive font-medium">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register("newPassword")}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive font-medium">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register("confirmPassword")}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive font-medium">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  variant="outline"
                  disabled={changePassword.isPending}
                  className="gap-2 px-8"
                >
                  {changePassword.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  Update Password
                </Button>
              </div>
            </form>
            </>
            )
           }
          </CardContent>
        </Card>

        {/* Sessions Section */}
        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Active Sessions</CardTitle>
            </div>
            <CardDescription>
              Manage your active sessions across different devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSessionsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sessions?.map((session: any) => {
                  const { browser, os } = parseUserAgent(session.userAgent);
                  return (
                    <div key={session.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          {os === "Android" || os === "iOS" ? (
                            <Smartphone className="h-5 w-5" />
                          ) : (
                            <Monitor className="h-5 w-5" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{browser} on {os}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {session.ipAddress || "Unknown IP"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last active: {new Date(session.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => revokeSession.mutate(session.id)}
                        disabled={revokeSession.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}