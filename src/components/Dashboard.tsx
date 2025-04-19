import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";

const Dashboard: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error: any) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard protected Page</h1>
      <Button variant="destructive" onClick={handleLogout}>
        Wyloguj się
      </Button>
    </div>
  );
};

export default Dashboard;
