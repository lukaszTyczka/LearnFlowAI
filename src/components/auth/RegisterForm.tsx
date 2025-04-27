import React, { useState, useId } from "react";
import { useStore } from "@nanostores/react";
import { $isAuthLoading, $authError, signUp } from "../../stores/authStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

export const RegisterForm: React.FC = () => {
  const isLoading = useStore($isAuthLoading);
  const error = useStore($authError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const passwordErrorId = useId();
  const formErrorId = useId();

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
      setSuccessMessage(result.message ?? "Registration successful! Check your email to verify.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Register</CardTitle>
        <CardDescription>Create a new account to get access</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {successMessage && <div className="text-sm text-green-600 dark:text-green-400">{successMessage}</div>}
          {!successMessage && (
            <>
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
                  placeholder="Enter your password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  aria-describedby={passwordError ? passwordErrorId : error ? formErrorId : undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={confirmPasswordId}>Confirm Password</Label>
                <Input
                  id={confirmPasswordId}
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  aria-describedby={passwordError ? passwordErrorId : error ? formErrorId : undefined}
                />
              </div>
              {passwordError && (
                <div id={passwordErrorId} className="text-sm text-red-500 dark:text-red-400">
                  {passwordError}
                </div>
              )}
              {error && (
                <div id={formErrorId} className="text-sm text-red-500 dark:text-red-400">
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
          <div className="text-sm text-center text-muted-foreground">
            {successMessage ? "Account created!" : "Already have an account?"}{" "}
            <Button
              type="button"
              variant="link"
              className="px-0 h-auto text-purple-600 hover:text-purple-800"
              onClick={() => (window.location.href = "/login")}
              disabled={isLoading && !error && !successMessage}
            >
              {successMessage ? "Go to Login" : "Login"}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
