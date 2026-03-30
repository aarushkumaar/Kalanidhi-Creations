'use client';

import { useState, useEffect } from 'react';
import { getEnquiries, updateEnquiry } from '@/utils/firebase/db';
import { toast } from '@/components/ui/Toast';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  async function fetchEnquiries() {
    try {
      const data = await getEnquiries();
      setEnquiries(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await updateEnquiry(id, { isRead: true });
      toast('Enquiry marked as read', 'success');
      fetchEnquiries();
    } catch (error) {
      toast('Error updating enquiry', 'error');
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-foreground">Enquiries</h1>
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
              <tr key={enq.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-4 text-muted-foreground">
                  {enq.createdAt?.toDate?.() ? enq.createdAt.toDate().toLocaleDateString() : 'N/A'}
                </td>
                <td className="p-4 font-medium">{enq.name}</td>
                <td className="p-4">{enq.email}</td>
                <td className="p-4">
                  {!enq.isRead ? (
                    <span className="text-green-600 bg-green-600/10 border border-green-600/30 px-2 py-1 text-[10px] uppercase tracking-widest">New</span>
                  ) : (
                    <span className="text-muted-foreground bg-muted border border-border px-2 py-1 text-[10px] uppercase tracking-widest">Read</span>
                  )}
                </td>
                <td className="p-4 text-right flex gap-3 justify-end text-xs uppercase tracking-widest">
                  <a href={`mailto:${enq.email}`} className="text-muted-foreground hover:text-gold transition-colors">Reply</a>
                  {!enq.isRead && (
                    <button onClick={() => handleMarkRead(enq.id)} className="text-muted-foreground hover:text-gold transition-colors">Mark Read</button>
                  )}
                </td>
              </tr>
            ))}
            {enquiries.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-muted-foreground">No enquiries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
