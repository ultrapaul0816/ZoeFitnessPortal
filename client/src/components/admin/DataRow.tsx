export function DataRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between items-baseline py-2 border-b border-gray-100">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className="text-gray-900 font-medium text-sm">{value || "—"}</span>
    </div>
  );
}
