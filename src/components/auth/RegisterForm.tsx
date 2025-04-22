import React, { useState } from "react";
import { useStore } from "@nanostores/react";
import { $isAuthLoading, $authError, signUp } from "../../stores/authStore";
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

export const RegisterForm: React.FC = () => {
  const isLoading = useStore($isAuthLoading);
  const error = useStore($authError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setSuccessMessage(null);
    $authError.set(null);

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    const result = await signUp(email, password);
    if (result.success) {
      setSuccessMessage(result.message);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      window.location.href = "/app/dashboard";
    }
  };

  return (
    <Card className="w-[400px] mx-auto mt-8">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create a new account to get access</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {successMessage && (
            <div className="text-sm text-green-600 dark:text-green-400">
              {successMessage}
            </div>
          )}
          {!successMessage && (
            <>
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
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              {passwordError && (
                <div className="text-sm text-red-500 dark:text-red-400">
                  {passwordError}
                </div>
              )}
              {error && (
                <div className="text-sm text-red-500 dark:text-red-400">
                  {error}
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {!successMessage && (
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => (window.location.href = "/login")}
            disabled={isLoading && successMessage !== null}
          >
            {successMessage ? "Go to Login" : "Already have an account? Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
