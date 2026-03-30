'use client';
import { auth } from '@/utils/firebase/config';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { isAdminEmail } from '@/config/admins';
import { useState } from 'react';
import { toast } from '@/components/ui/Toast';

const actionCodeSettings = {
  url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/auth-callback`,
  handleCodeInApp: true,
};

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check admin list before even sending the link
      if (!isAdminEmail(email)) {
        throw new Error('This email is not authorised for admin access.');
      }
      
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Save email to localStorage so the callback page can confirm it
      window.localStorage.setItem('emailForSignIn', email);
      setSent(true);
      toast('Login link sent to your email!', 'success');
    } catch (error: any) {
      console.error(error);
      toast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {sent ? (
        <div className="w-full max-w-md bg-muted/30 border border-gold/20 p-8 text-center">
          <h1 className="text-3xl font-serif text-gold tracking-widest mb-6">LINK SENT</h1>
          <p className="text-muted-foreground leading-relaxed">
            A magic link has been sent to <strong>{email}</strong>.<br/>
            Please check your inbox to complete the sign-in.
          </p>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="w-full max-w-md bg-muted/30 border border-gold/20 p-8 flex flex-col gap-6">
          <h1 className="text-3xl font-serif text-gold text-center tracking-widest mb-4">ADMIN ENTRANCE</h1>
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-b border-border py-2 focus:outline-none focus:border-gold transition-colors"
              placeholder="aarushk0207@gmail.com"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-gold text-background py-4 uppercase tracking-widest text-sm hover:bg-gold-light transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Validating...' : 'Send Magic Link'}
          </button>
        </form>
      )}
    </div>
  );
}
