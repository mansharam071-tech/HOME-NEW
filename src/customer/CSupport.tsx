import React, { useState } from "react";
import { ArrowLeft, LifeBuoy, Plus, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore, storeApi } from "@/lib/store";
import { fmtDT } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const CSupport: React.FC = () => {
  const store = useStore();
  const { t } = useLang();
  const nav = useNavigate();
  const customerId = "usr_demo_customer";

  const [createOpen, setCreateOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Service Warranty");
  const [initialMsg, setInitialMsg] = useState("");

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const myTickets = store.tickets.filter((tk) => tk.user_id === customerId);
  const activeTicket = myTickets.find((tk) => tk.id === activeTicketId);

  const handleCreateTicket = () => {
    if (!subject.trim() || !initialMsg.trim()) {
      toast.error("Please fill in subject and your message");
      return;
    }
    const created = storeApi.createTicket(customerId, subject, category, initialMsg);
    toast.success(`Support ticket ${created.ticket_no} created!`);
    setSubject("");
    setInitialMsg("");
    setCreateOpen(false);
  };

  const handleSendReply = () => {
    if (!activeTicketId || !replyText.trim()) return;
    storeApi.replyTicket(activeTicketId, "customer", replyText.trim());
    setReplyText("");
    toast.success("Message sent to support team");

    // Simulate agent reply
    setTimeout(() => {
      storeApi.replyTicket(
        activeTicketId,
        "support",
        "Thank you for contacting SMARTFIX Support. We are reviewing your request."
      );
    }, 1500);
  };

  return (
    <div className="flex-1 pb-24 text-slate-900 bg-[#F8FAFC]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-3 border-b border-slate-200/80 shadow-2xs">
        <button
          onClick={() => nav("/app")}
          className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-base font-bold text-slate-900">{t("Help")} & Support</h2>
        <button
          onClick={() => setCreateOpen(true)}
          className="rounded-full bg-[#1E3A8A] p-1.5 text-white shadow-xs hover:bg-[#172554]"
          title="New Ticket"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Support Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-[#1E3A8A] to-[#172554] p-5 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#F59E0B]">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold">24x7 Customer Care</h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Warranty claims, technician queries, or invoice assistance.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-4 w-full rounded-xl bg-white/15 py-2.5 text-xs font-bold text-white hover:bg-white/25 transition-colors"
          >
            + Create New Support Ticket
          </button>
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
            My Queries & Tickets
          </h4>

          {myTickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500 bg-white">
              No tickets raised yet.
            </div>
          ) : (
            myTickets.map((tk) => (
              <div
                key={tk.id}
                onClick={() => setActiveTicketId(tk.id)}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-[#1E3A8A]/30 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-slate-700">{tk.ticket_no}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      tk.status === "open"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {tk.status}
                  </span>
                </div>
                <h4 className="font-heading text-sm font-bold text-slate-900">{tk.subject}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {tk.messages[tk.messages.length - 1]?.text}
                </p>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Category: {tk.category}</span>
                  <span>{fmtDT(tk.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticket Chat Dialog */}
      {activeTicket && (
        <Dialog open={!!activeTicket} onOpenChange={() => setActiveTicketId(null)}>
          <DialogContent className="max-w-sm" onClose={() => setActiveTicketId(null)}>
            <DialogHeader>
              <DialogTitle>{activeTicket.ticket_no}</DialogTitle>
              <p className="text-xs text-slate-500">{activeTicket.subject}</p>
            </DialogHeader>

            <div className="flex h-72 flex-col gap-2 overflow-y-auto rounded-2xl bg-slate-50 p-3 border border-slate-100">
              {activeTicket.messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-2xs ${
                    m.sender === "customer"
                      ? "self-end bg-[#1E3A8A] text-white"
                      : "self-start bg-white text-slate-800 border border-slate-200"
                  }`}
                >
                  <p>{m.text}</p>
                  <p
                    className={`mt-1 text-[9px] ${
                      m.sender === "customer" ? "text-blue-200" : "text-slate-400"
                    }`}
                  >
                    {fmtDT(m.at)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                placeholder="Reply to agent..."
                className="h-10 text-xs"
              />
              <button
                onClick={handleSendReply}
                className="rounded-xl bg-[#1E3A8A] px-4 text-white hover:bg-[#172554]"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm" onClose={() => setCreateOpen(false)}>
          <DialogHeader>
            <DialogTitle>Raise Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold"
              >
                <option value="Service Warranty">Service Warranty</option>
                <option value="Technician Conduct">Technician Conduct</option>
                <option value="Billing & Refund">Billing & Refund</option>
                <option value="Other Query">Other Query</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief issue title"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Detailed Message</label>
              <textarea
                value={initialMsg}
                onChange={(e) => setInitialMsg(e.target.value)}
                placeholder="Explain the problem..."
                className="mt-1 h-24 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#1E3A8A]"
              />
            </div>
            <button
              onClick={handleCreateTicket}
              className="mt-2 w-full rounded-xl bg-[#1E3A8A] py-3 text-xs font-bold text-white hover:bg-[#172554] shadow-sm"
            >
              Submit Ticket
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
