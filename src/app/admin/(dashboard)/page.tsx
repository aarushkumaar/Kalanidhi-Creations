import { getAllPieces, getCategories, getEnquiries } from '@/utils/firebase/db';

export default async function AdminDashboard() {
  const [pieces, categories, enquiries] = await Promise.all([
    getAllPieces(),
    getCategories(),
    getEnquiries()
  ]);
  
  const stats = [
    { label: 'Total Pieces', value: pieces.length },
    { label: 'Unread Enquiries', value: enquiries.filter((e: any) => !e.isRead).length },
    { label: 'Categories', value: categories.length },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-serif text-foreground mb-4">Welcome back, Admin</h1>
      <p className="text-muted-foreground mb-12">Here's an overview of Kalanidhi's digital boutique.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-muted/30 border border-border p-6 shadow-sm">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{stat.label}</h3>
            <p className="text-4xl font-serif text-gold">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-muted/30 border border-border p-8 shadow-sm">
        <h2 className="text-xl font-serif mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {enquiries.length > 0 ? (
            <p className="text-sm text-muted-foreground">You have {enquiries.length} total enquiries to manage.</p>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
