import React from "react";
import { Button } from "../../ui/button";

interface DashboardTopBarProps {
  userEmail: string | undefined;
  onLogout: () => void;
}

const DashboardTopBar: React.FC<DashboardTopBarProps> = ({ userEmail, onLogout }) => {
  return (
    <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="h-full flex items-center justify-end space-x-4 px-4">
        {userEmail && <p className="text-sm text-muted-foreground mr-[20px]">{userEmail}</p>}
        <Button size="sm" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DashboardTopBar;
