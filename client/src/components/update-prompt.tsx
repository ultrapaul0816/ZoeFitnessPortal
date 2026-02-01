import { useServiceWorker } from "@/hooks/use-service-worker";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";
import { useState } from "react";

export default function UpdatePrompt() {
  const { updateAvailable, updateApp } = useServiceWorker();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-3 shadow-lg animate-in slide-in-from-top duration-300">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin-slow" />
          <span className="text-sm font-medium">
            A new version is available!
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={updateApp}
            className="bg-white text-pink-600 hover:bg-pink-50"
          >
            Update Now
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-pink-400 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
