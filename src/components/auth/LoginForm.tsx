import React, { useState, useId } from "react";
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

  const emailId = useId();
  const passwordId = useId();
  const resetEmailId = useId();
  const formErrorId = useId();

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
      <Card className="w-full max-w-md mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
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
                <Label htmlFor={resetEmailId}>Email</Label>
                <Input
                  id={resetEmailId}
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  aria-describedby={error ? formErrorId : undefined}
                />
              </div>
            )}
            {error && !resetSent && (
              <div id={formErrorId} className="text-sm text-red-500 dark:text-red-400">
                {error}
              </div>
            )}
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
              className="w-full"
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
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleLoginSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={emailId}>Email</Label>
            <Input
              id={emailId}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              aria-describedby={error ? formErrorId : undefined}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={passwordId}>Password</Label>
            <Input
              id={passwordId}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              aria-describedby={error ? formErrorId : undefined}
            />
          </div>
          <div className="text-right">
            <Button
              type="button"
              variant="link"
              className="px-0 h-auto text-sm text-purple-600 hover:text-purple-800"
              onClick={() => {
                setResetMode(true);
                $authError.set(null);
              }}
              disabled={isLoading}
            >
              Forgot Password?
            </Button>
          </div>
          {error && (
            <div id={formErrorId} className="text-sm text-red-500 dark:text-red-400">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Button
              type="button"
              variant="link"
              className="px-0 h-auto text-purple-600 hover:text-purple-800"
              onClick={() => (window.location.href = "/register")}
              disabled={isLoading}
            >
              Register
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
