"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Shield } from "lucide-react";

export function EmergencyShutdown() {
  const [isShutdown, setIsShutdown] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingState, setPendingState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkShutdownStatus();
  }, []);

  const checkShutdownStatus = async () => {
    try {
      const response = await fetch("/api/admin/emergency-shutdown");
      const data = await response.json();
      setIsShutdown(data.shutdown);
    } catch (error) {
      console.error("Failed to check shutdown status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setPendingState(checked);
    setShowDialog(true);
  };

  const confirmShutdown = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/emergency-shutdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shutdown: pendingState }),
      });

      if (response.ok) {
        setIsShutdown(pendingState);
      }
    } catch (error) {
      console.error("Failed to toggle shutdown:", error);
    } finally {
      setLoading(false);
      setShowDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 opacity-50">
        <div className="h-5 w-9 bg-muted rounded-full animate-pulse" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch
          checked={isShutdown}
          onCheckedChange={handleSwitchChange}
          disabled={loading}
        />
        <div className="flex items-center space-x-1">
          {isShutdown ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <Shield className="h-4 w-4 text-green-600" />
          )}
          <span className="text-sm font-medium">
            {isShutdown ? "Shutdown" : "Active"}
          </span>
        </div>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {pendingState ? "Emergency Shutdown" : "Restore Services"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingState ? (
                <>
                  This will immediately disable ALL authentication services including:
                  <ul className="mt-2 ml-4 list-disc space-y-1">
                    <li>User login/signup</li>
                    <li>OAuth authentication</li>
                    <li>API key access</li>
                    <li>All user endpoints</li>
                  </ul>
                  <span className="mt-2 font-medium block">
                    Only admin panel will remain accessible. This action should only be used in emergencies.
                  </span>
                </>
              ) : (
                <>
                  Are you sure you want to restore all authentication services?
                  <span className="mt-2 block">
                    This will re-enable all login, signup, and API access.
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmShutdown}
              className={pendingState ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {pendingState ? "Shutdown Now" : "Restore Services"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
