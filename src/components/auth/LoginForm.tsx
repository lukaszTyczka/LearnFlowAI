import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

export const LoginForm: React.FC = () => {
  const { login, isLoading, error, user, isInitialized } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetLoading, setIsResetLoading] = useState(false);

  useEffect(() => {
    if (isInitialized && user) {
      window.location.href = "/app/dashboard";
    }
  }, [user, isInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetMode) {
      setIsResetLoading(true);
      setResetError(null);
      setResetSent(false);
      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to send reset link");
        }
        setResetSent(true);
      } catch (error: any) {
        setResetError(error.message || "Failed to send reset link");
      } finally {
        setIsResetLoading(false);
      }
    } else {
      await login(email, password);
    }
  };

  if (!isInitialized || isLoading) {
    return <div>Loading...</div>;
  }

  if (resetMode) {
    return (
      <Card className="w-[400px] mx-auto mt-8">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {resetSent
              ? "Check your email for the password reset link"
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!resetSent && (
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isResetLoading}
                />
              </div>
            )}
            {resetError && (
              <div className="text-sm text-red-500 dark:text-red-400">
                {resetError}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {!resetSent && (
              <Button
                type="submit"
                className="w-full"
                disabled={isResetLoading}
              >
                {isResetLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setResetMode(false);
                setResetError(null);
                setResetSent(false);
              }}
            >
              Back to Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  return (
    <Card className="w-[400px] mx-auto mt-8">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="text-sm text-red-500 dark:text-red-400">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setResetMode(true)}
            disabled={isLoading}
          >
            Forgot Password?
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => (window.location.href = "/register")}
            disabled={isLoading}
          >
            Don't have an account? Register
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
