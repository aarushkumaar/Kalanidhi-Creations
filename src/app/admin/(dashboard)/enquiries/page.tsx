'use client';

import { useState, useEffect } from 'react';
import { adminGetEnquiries, adminMarkEnquiryRead, adminDeleteEnquiry } from '@/utils/admin-api';
import { toast } from '@/components/ui/Toast';
import { Trash2 } from 'lucide-react';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEnquiries(); }, []);

  async function fetchEnquiries() {
    setLoading(true);
    try {
      const data = await adminGetEnquiries();
      setEnquiries(data.enquiries || []);
    } catch (error: any) {
      toast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await adminMarkEnquiryRead(id);
      toast('Marked as read', 'success');
      fetchEnquiries();
    } catch (error: any) {
      toast(error.message, 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this enquiry?')) return;
    try {
      await adminDeleteEnquiry(id);
      toast('Enquiry deleted', 'success');
      fetchEnquiries();
    } catch (error: any) {
      toast(error.message, 'error');
    }
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-foreground">Enquiries</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] mt-1">
            {enquiries.filter(e => !e.isRead).length} unread
          </p>
        </div>
      </div>

      <div className="bg-background border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground uppercase tracking-widest text-xs">
            <tr>
              <th className="p-4 font-normal">Date</th>
              <th className="p-4 font-normal">Name</th>
              <th className="p-4 font-normal">Email</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enq) => (
              <tr key={enq.id} className={`border-t border-border hover:bg-muted/30 transition-colors ${!enq.isRead ? 'bg-blush/20' : ''}`}>
                <td className="p-4 text-muted-foreground text-xs">
                  {enq.createdAt?._seconds
                    ? new Date(enq.createdAt._seconds * 1000).toLocaleDateString('en-IN')
                    : 'N/A'}
                </td>
                <td className="p-4 font-medium">{enq.name}</td>
                <td className="p-4 text-sm">{enq.email}</td>
                <td className="p-4">
                  {!enq.isRead ? (
                    <span className="text-gold border border-gold/30 px-2 py-0.5 text-[10px] uppercase tracking-widest">New</span>
                  ) : (
                    <span className="text-muted-foreground border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest">Read</span>
                  )}
                </td>
                <td className="p-4 text-right flex gap-3 justify-end text-xs uppercase tracking-widest">
                  <a href={`mailto:${enq.email}`} className="text-muted-foreground hover:text-gold transition-colors">Reply</a>
                  {!enq.isRead && (
                    <button onClick={() => handleMarkRead(enq.id)} className="text-muted-foreground hover:text-gold transition-colors">
                      Mark Read
                    </button>
                  )}
                  <button onClick={() => handleDelete(enq.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {enquiries.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-muted-foreground uppercase tracking-widest text-xs">
                  No enquiries found.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <div className="w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
