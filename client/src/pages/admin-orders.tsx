import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { ShoppingBag, Search, Package, CheckCircle, XCircle, AlertCircle, IndianRupee, User, Mail, Phone, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";

function formatAmount(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { className: string; label: string }> = {
    processed: { className: "bg-green-100 text-green-800 border-green-200", label: "Processed" },
    pending: { className: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
    failed: { className: "bg-red-100 text-red-800 border-red-200", label: "Failed" },
    skipped: { className: "bg-gray-100 text-gray-600 border-gray-200", label: "Skipped" },
  };
  const v = variants[status] || variants.pending;
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>;
}

export default function AdminOrders() {
  const { isLoading: authLoading, isAdmin } = useAdminAuth();
  const { data: orders = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/shopify-orders"], enabled: isAdmin });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const filtered = orders.filter((o: any) => {
    const matchesSearch = !search || 
      `${o.customerFirstName} ${o.customerLastName}`.toLowerCase().includes(search.toLowerCase()) ||
      (o.customerEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.orderNumber || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.processingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    total: orders.length,
    processed: orders.filter((o: any) => o.processingStatus === "processed").length,
    failed: orders.filter((o: any) => o.processingStatus === "failed").length,
    skipped: orders.filter((o: any) => o.processingStatus === "skipped").length,
    pending: orders.filter((o: any) => o.processingStatus === "pending").length,
  };

  const statusFilters = [
    { value: "all", label: "All" },
    { value: "processed", label: "Processed" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
    { value: "skipped", label: "Skipped" },
  ];

  return (
    <AdminLayout activeTab="orders" onTabChange={() => {}}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-pink-500" />
          <h1 className="text-2xl font-bold text-gray-900">Shopify Orders</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold">{counts.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-500">Processed</p>
              <p className="text-2xl font-bold text-green-600">{counts.processed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-red-600">{counts.failed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-500">Skipped</p>
              <p className="text-2xl font-bold text-gray-500">{counts.skipped}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or order number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map((f) => (
              <Button
                key={f.value}
                variant={statusFilter === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No orders found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((order: any) => (
              <Card
                key={order.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{order.orderNumber || order.shopifyOrderId}</span>
                        <StatusBadge status={order.processingStatus || "pending"} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {order.customerFirstName} {order.customerLastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {order.customerEmail}
                        </span>
                        <span className="truncate max-w-[200px]">{order.productTitle}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-gray-900">{formatAmount(order.amount)}</span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Order {selectedOrder?.orderNumber || selectedOrder?.shopifyOrderId}
                {selectedOrder && <StatusBadge status={selectedOrder.processingStatus || "pending"} />}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{selectedOrder.customerFirstName} {selectedOrder.customerLastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedOrder.customerPhone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium">{formatAmount(selectedOrder.amount)} {selectedOrder.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Product</p>
                    <p className="font-medium">{selectedOrder.productTitle || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Variant</p>
                    <p className="font-medium">{selectedOrder.variantTitle || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className="font-medium">{selectedOrder.paymentStatus || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fulfillment</p>
                    <p className="font-medium">{selectedOrder.fulfillmentStatus || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Course Enrolled</p>
                    <p className="font-medium">{selectedOrder.courseEnrolled || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-medium text-xs">{selectedOrder.userId || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">WhatsApp Enabled</p>
                    <p className="font-medium">{selectedOrder.whatsappEnabled ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Sent</p>
                    <p className="font-medium">{selectedOrder.emailSent ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Shopify Order ID</p>
                    <p className="font-medium text-xs">{selectedOrder.shopifyOrderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("en-IN") : "—"}</p>
                  </div>
                </div>

                {selectedOrder.processingResult && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Processing Result</p>
                    <pre className="bg-gray-50 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap border">
                      {(() => { try { return JSON.stringify(JSON.parse(selectedOrder.processingResult), null, 2); } catch { return selectedOrder.processingResult; } })()}
                    </pre>
                  </div>
                )}

                {selectedOrder.billingAddress && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Billing Address</p>
                    <pre className="bg-gray-50 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap border">
                      {JSON.stringify(selectedOrder.billingAddress, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedOrder.rawPayload && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Raw Payload</p>
                    <pre className="bg-gray-50 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap border max-h-[300px]">
                      {JSON.stringify(selectedOrder.rawPayload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
