import { useQuery } from "@tanstack/react-query";
import { Loader2, BookOpen, AlertCircle } from "lucide-react";
import { WellnessBlueprintViewer } from "@/components/admin/WellnessBlueprintViewer";
import { generateBlueprintPDF } from "@/components/admin/WellnessBlueprintPDF";
import type { BlueprintData } from "@/components/admin/WellnessBlueprintTypes";

type BlueprintResponse = { blueprint: BlueprintData | null; generatedAt?: string; message?: string };

interface MyWellnessBlueprintProps {
  clientName: string;
  blueprintData?: BlueprintResponse;
}

export function MyWellnessBlueprint({ clientName, blueprintData }: MyWellnessBlueprintProps) {
  const { data: fetchedData, isLoading, isError } = useQuery<BlueprintResponse>({
    queryKey: ["/api/coaching/my-wellness-blueprint"],
    queryFn: async ({ queryKey }) => {
      const token = localStorage.getItem("coaching_auth_token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(queryKey[0] as string, {
        headers,
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      return res.json();
    },
    enabled: !blueprintData,
    staleTime: 5 * 60 * 1000,
  });

  const data = blueprintData ?? fetchedData;

  if (!blueprintData && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16" role="status" aria-label="Loading blueprint">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin mb-3" />
        <p className="text-sm text-gray-500">Loading your blueprint...</p>
      </div>
    );
  }

  if (!blueprintData && isError) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="font-serif text-lg font-bold text-gray-800 mb-2">
          Unable to load blueprint
        </h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Something went wrong loading your wellness blueprint. Please try again later or contact your coach.
        </p>
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
          if (data.blueprint) {
            generateBlueprintPDF(data.blueprint, clientName);
          }
        }}
      />
    </div>
  );
}
