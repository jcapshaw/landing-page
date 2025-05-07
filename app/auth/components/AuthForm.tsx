"use client";

import { useState, useEffect } from "react";
import { useForm, ControllerRenderProps, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { setAuthToken, setupFetchInterceptor } from "@/lib/auth-utils";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  jobTitle: z.string().min(1, "Job title is required"),
  location: z.string().min(1, "Location is required"),
  requestAdmin: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type FormData = LoginFormData | RegisterFormData;

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Set initial state based on URL parameter
    setIsRegister(searchParams.get("register") === "true");
  }, [searchParams]);

  const form = useForm<FormData>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(isRegister && {
        firstName: "",
        lastName: "",
        phone: "",
        jobTitle: "",
        location: "",
        requestAdmin: false,
      }),
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      console.log('Attempting authentication with Supabase...');
      
      if (!isRegister) {
        // Sign in with Supabase
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        if (!authData.session) {
          throw new Error('No session returned from Supabase');
        }

        // Get the access token
        const token = authData.session.access_token;

        // Store token in localStorage for client-side use
        setAuthToken(token);

        // Set up fetch interceptor
        setupFetchInterceptor();

        // Set the session cookie via API for server-side access
        try {
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            console.warn('Failed to set session cookie via API');
          }
        } catch (error) {
          console.warn('Error setting session cookie:', error);
        }

        console.log('User signed in successfully');

        // Redirect to dashboard with token in URL for initial auth
        router.push(`/dashboard?token=${token}`);
      } else if (isRegister) {
        // Registration with Supabase
        const { data: userData, error: userError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              first_name: (data as RegisterFormData).firstName,
              last_name: (data as RegisterFormData).lastName,
              phone: (data as RegisterFormData).phone,
              job_title: (data as RegisterFormData).jobTitle,
              location: (data as RegisterFormData).location,
              role: (data as RegisterFormData).requestAdmin ? 'pending_admin' : 'salesperson',
            }
          }
        });

        if (userError) throw userError;
        
        // Show confirmation message
        form.setError("root", {
          message: "Registration successful! Please check your email to confirm your account.",
        });
        
        return;
      }
      console.log('Authentication successful, waiting for redirect...');
    } catch (error) {
      console.error("Authentication error:", error);
      let errorMessage = "Authentication failed. Please check your credentials.";
      
      if (error instanceof Error) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password.";
        } else if (error.message.includes("User already registered")) {
          errorMessage = "An account with this email already exists.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please confirm your email address before signing in.";
        }
      }
      
      form.setError("root", {
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="flex flex-col items-center space-y-2">
        <Image
          src="/ltlogo.png"
          alt="Company Logo"
          width={120}
          height={120}
          priority
        />
        <h1 className="text-2xl font-semibold">
          {isRegister ? "Create an Account" : "Welcome Back"}
        </h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control as unknown as Control<RegisterFormData>}
                  name="firstName"
                  render={({ field }: { field: ControllerRenderProps<RegisterFormData, "firstName"> }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as unknown as Control<RegisterFormData>}
                  name="lastName"
                  render={({ field }: { field: ControllerRenderProps<RegisterFormData, "lastName"> }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control as unknown as Control<RegisterFormData>}
                name="phone"
                render={({ field }: { field: ControllerRenderProps<RegisterFormData, "phone"> }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 555-5555" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as unknown as Control<RegisterFormData>}
                name="jobTitle"
                render={({ field }: { field: ControllerRenderProps<RegisterFormData, "jobTitle"> }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Senior Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as unknown as Control<RegisterFormData>}
                name="location"
                render={({ field }: { field: ControllerRenderProps<RegisterFormData, "location"> }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }: { field: ControllerRenderProps<FormData, "email"> }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="name@example.com" 
                    type="email"
                    autoComplete="username"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }: { field: ControllerRenderProps<FormData, "password"> }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Enter your password" 
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isRegister && (
            <FormField
              control={form.control as unknown as Control<RegisterFormData>}
              name="requestAdmin"
              render={({ field }: { field: ControllerRenderProps<RegisterFormData, "requestAdmin"> }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Request Admin Access</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          )}

          {form.formState.errors.root && (
            <div className="text-red-500 text-sm">{form.formState.errors.root.message}</div>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isRegister ? "Create Account" : "Sign In"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Button
            variant="link"
            onClick={() => {
              setIsRegister(!isRegister);
              router.push(!isRegister ? "/auth?register=true" : "/auth", { scroll: false });
            }}
            className="text-primary"
          >
            {isRegister
              ? "Already have an account? Sign in"
              : "Don't have an account? Register"}
          </Button>
        </div>
      </Form>
    </div>
  );
}