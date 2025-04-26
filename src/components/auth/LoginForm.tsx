import React, { useState } from "react";
import { useStore } from "@nanostores/react";
import { $isAuthLoading, $authError, login, requestPasswordReset } from "../../stores/authStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

export const LoginForm: React.FC = () => {
  const isLoading = useStore($isAuthLoading);
  const error = useStore($authError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result) {
      window.location.href = "/app/dashboard";
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(false);
    const result = await requestPasswordReset(email);
    if (result.success) {
      setResetSent(true);
    }
  };

  if (resetMode) {
    return (
      <Card className="w-[400px] mx-auto mt-8">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {resetSent
              ? "Check your email for the password reset link."
              : "Enter your email to receive a password reset link."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResetSubmit}>
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
                  disabled={isLoading}
                />
              </div>
            )}
            {error && !resetSent && <div className="text-sm text-red-500 dark:text-red-400">{error}</div>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {!resetSent && (
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setResetMode(false);
                setResetSent(false);
                $authError.set(null);
              }}
              disabled={isLoading}
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
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleLoginSubmit}>
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
          {error && <div className="text-sm text-red-500 dark:text-red-400">{error}</div>}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setResetMode(true);
              $authError.set(null);
            }}
            disabled={isLoading}
          >
            Forgot Password?
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = "/register")}
            disabled={isLoading}
          >
            Don&apos;t have an account? Register
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
