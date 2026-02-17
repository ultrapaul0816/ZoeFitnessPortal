import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Download } from "lucide-react";
import { WellnessBlueprintViewer } from "@/components/admin/WellnessBlueprintViewer";
import { generateBlueprintPDF } from "@/components/admin/WellnessBlueprintPDF";
import type { BlueprintData } from "@/components/admin/WellnessBlueprintTypes";

interface MyWellnessBlueprintProps {
  clientName: string;
}

export function MyWellnessBlueprint({ clientName }: MyWellnessBlueprintProps) {
  const { data, isLoading } = useQuery<{ blueprint: BlueprintData | null; generatedAt?: string; message?: string }>({
    queryKey: ["/api/coaching/my-wellness-blueprint"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin mb-3" />
        <p className="text-sm text-gray-500">Loading your blueprint...</p>
      </div>
    );
  }

  if (!data?.blueprint) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="font-serif text-lg font-bold text-gray-800 mb-2">
          Your Wellness Blueprint
        </h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          {data?.message || "Your coach is preparing a personalized wellness blueprint just for you. Check back soon!"}
        </p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <WellnessBlueprintViewer
        blueprint={data.blueprint}
        isAdmin={false}
        isApproved={true}
        onExportPDF={() => {
          generateBlueprintPDF(data.blueprint!, clientName);
        }}
      />
    </div>
  );
}
