import React, { useState } from "react";
import { Search, Filter, UserCheck, Clock, MapPin, Eye, RefreshCw } from "lucide-react";
import { useStore, storeApi } from "@/lib/store";
import { inr, fmtDT } from "@/lib/utils";
import { StatusBadge } from "@/components/common/Shared";
import { Booking, BookingStatus } from "@/lib/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const ABookings: React.FC = () => {
  const store = useStore();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignPartnerId, setReassignPartnerId] = useState("");
  const [reassignReason, setReassignReason] = useState("Technician vehicle issue");

  const partners = store.users.filter((u) => u.role === "partner");

  const filtered = store.bookings.filter((b) => {
    if (filterStatus !== "all" && b.status !== filterStatus) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        b.booking_no.toLowerCase().includes(q) ||
        b.city_name.toLowerCase().includes(q) ||
        b.address.line.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmReassign = () => {
    if (!selectedBooking || !reassignPartnerId) {
      toast.error("Please select a partner to reassign to");
      return;
    }
    try {
      storeApi.adminReassignBooking(selectedBooking.id, reassignPartnerId, reassignReason);
      toast.success(`Booking #${selectedBooking.booking_no} reassigned!`);
      setReassignModalOpen(false);
      setSelectedBooking(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to reassign booking");
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Title & Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-extrabold text-slate-900">Live Booking Dispatch</h2>
          <p className="text-xs text-slate-500">Monitor real-time status and manually reassign technicians</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search booking # or city..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-[#1E3A8A]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="en_route">En Route</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Booking #</th>
                <th className="p-3">Service</th>
                <th className="p-3">City</th>
                <th className="p-3">Schedule</th>
                <th className="p-3">Customer OTP</th>
                <th className="p-3">Assigned Pro</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((b) => {
                const partner = store.users.find((u) => u.id === b.partner_id);
                return (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      #{b.booking_no}
                      {b.is_multi_provider && (
                        <span className="block text-[9px] font-extrabold text-purple-700 uppercase tracking-wider">
                          Multi-Service
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-medium text-slate-900">
                      <p className="truncate max-w-[160px] font-bold">{b.lines[0]?.name}</p>
                      {b.lines.length > 1 && (
                        <p className="text-[10px] text-slate-500 font-normal">
                          +{b.lines.length - 1} more ({b.lines.map((l) => l.name).join(", ")})
                        </p>
                      )}
                      {b.is_multi_provider && (
                        <span className="inline-flex items-center gap-1 mt-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.2 text-[9px] font-extrabold">
                          ⚡ {b.partner_assignments?.length || 2} Specialist Pros
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">{b.city_name}</td>
                    <td className="p-3 text-slate-600">
                      {b.slot_date} · {b.slot_time}
                    </td>
                    <td className="p-3 font-mono text-slate-700 font-bold">
                      {b.is_multi_provider && b.partner_assignments ? (
                        <span className="text-[10px] text-blue-800">
                          {b.partner_assignments.map((a) => `${a.category_name}: ${a.start_otp}`).join(" | ")}
                        </span>
                      ) : b.status === "in_progress" ? (
                        `End: ${b.end_otp}`
                      ) : (
                        `Start: ${b.start_otp}`
                      )}
                    </td>
                    <td className="p-3 font-medium text-slate-900">
                      {b.is_multi_provider && b.partner_assignments ? (
                        <div className="space-y-1">
                          {b.partner_assignments.map((a, i) => (
                            <div key={i} className="text-[11px] leading-tight">
                              <span className="font-bold text-slate-800">{a.partner_name}</span>
                              <span className="text-slate-400"> ({a.category_name})</span>
                              {a.is_transferred && (
                                <span className="ml-1 text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1 rounded">
                                  Auto-Transferred
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : partner ? (
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          {partner.name}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-slate-900">{inr(b.pricing.total)}</td>
                    <td className="p-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {!["completed", "cancelled"].includes(b.status) && (
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setReassignModalOpen(true);
                            }}
                            className="rounded-lg bg-blue-50 border border-blue-200 p-1.5 text-[#1E3A8A] hover:bg-blue-100"
                            title="Reassign Partner"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Dialog */}
      {selectedBooking && !reassignModalOpen && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-md" onClose={() => setSelectedBooking(null)}>
            <DialogHeader>
              <DialogTitle>Booking #{selectedBooking.booking_no}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3.5 text-xs pt-1">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500">City / Zone:</span>
                  <p className="font-bold text-slate-900">{selectedBooking.city_name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Start / End OTP:</span>
                  <p className="font-mono font-bold text-[#1E3A8A]">
                    {selectedBooking.start_otp} / {selectedBooking.end_otp}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Status:</span>
                  <p><StatusBadge status={selectedBooking.status} /></p>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Customer & Location</p>
                <p className="font-semibold text-slate-900 mt-1">{selectedBooking.address.label}</p>
                <p className="text-slate-600">{selectedBooking.address.line}, {selectedBooking.address.city} - {selectedBooking.address.pincode}</p>
              </div>

              <div>
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Services Booked</p>
                <div className="mt-1 divide-y divide-slate-100 border rounded-xl p-2.5 bg-white">
                  {selectedBooking.lines.map((l, i) => (
                    <div key={i} className="flex justify-between py-1 first:pt-0 last:pb-0 font-medium">
                      <span>{l.name} x {l.qty}</span>
                      <span>{inr(l.line_total)}</span>
                    </div>
                  ))}
                  {selectedBooking.extras?.map((e) => (
                    <div key={e.id} className="flex justify-between py-1 text-amber-700">
                      <span>Extra: {e.item} ({e.status})</span>
                      <span>+{inr(e.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Provider Specialist Assignments */}
              {selectedBooking.is_multi_provider && selectedBooking.partner_assignments && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      ⚡ Specialist Technicians ({selectedBooking.partner_assignments.length})
                    </p>
                    <span className="text-[10px] bg-purple-100 text-purple-900 font-extrabold px-1.5 py-0.5 rounded">
                      Smart Auto-Transfer
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedBooking.partner_assignments.map((asgn) => (
                      <div key={asgn.id} className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-900">{asgn.partner_name}</span>
                            <span className="ml-1.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold px-1.5 py-0.2">
                              {asgn.category_name} Specialist
                            </span>
                          </div>
                          <StatusBadge status={asgn.status} />
                        </div>
                        <div className="text-[11px] text-slate-600 flex justify-between">
                          <span>Services: {asgn.service_lines.map((l) => l.name).join(", ")}</span>
                          <span className="font-bold text-[#1E3A8A]">{inr(asgn.subtotal)}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 bg-slate-50 p-1 rounded flex justify-between">
                          <span>Start OTP: <b className="text-blue-800">{asgn.start_otp}</b></span>
                          <span>End OTP: <b className="text-amber-800">{asgn.end_otp}</b></span>
                          <span>Net Payout: <b className="text-emerald-700">{inr(asgn.partner_earning)}</b></span>
                        </div>
                        {asgn.is_transferred && (
                          <div className="rounded bg-amber-50 p-1.5 text-[10px] text-amber-900 border border-amber-200 leading-tight">
                            <b>⚡ Auto-Transfer Log:</b> {asgn.transfer_reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Timeline Log</p>
                <div className="mt-1 max-h-32 overflow-y-auto space-y-1.5 border rounded-xl p-2.5 bg-slate-50">
                  {selectedBooking.timeline.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600">
                      <span>{item.note || item.status}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{fmtDT(item.at)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!["completed", "cancelled"].includes(selectedBooking.status) && (
                <button
                  onClick={() => setReassignModalOpen(true)}
                  className="w-full rounded-xl bg-[#1E3A8A] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#172554]"
                >
                  Reassign to Different Technician
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reassign Partner Modal */}
      <Dialog open={reassignModalOpen} onOpenChange={setReassignModalOpen}>
        <DialogContent className="max-w-xs" onClose={() => setReassignModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Reassign Technician</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1 text-xs">
            <p className="text-slate-600">
              Reassign booking #{selectedBooking?.booking_no} to an available verified technician:
            </p>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Technician:</label>
              <select
                value={reassignPartnerId}
                onChange={(e) => setReassignPartnerId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white"
              >
                <option value="">-- Choose Partner --</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.is_online ? "Online" : "Offline"} · ★{p.rating})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Reason for Reassignment:</label>
              <Input
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="e.g. Vehicle breakdown, delayed"
              />
            </div>

            <button
              onClick={handleConfirmReassign}
              className="mt-2 w-full rounded-xl bg-[#1E3A8A] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#172554]"
            >
              Confirm Reassignment
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
