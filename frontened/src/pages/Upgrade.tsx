import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Sparkles, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { billingApi } from '../api/billingApi';
import { authApi } from '../api/authApi';

export default function Upgrade() {
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [sessionPaid, setSessionPaid] = useState(false);
  const navigate = useNavigate();

  const sessionId = searchParams.get('session_id');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    if (canceled) {
      toast.error('Upgrade canceled. You can try again anytime.');
    }
  }, [canceled]);

  useEffect(() => {
    const confirmSession = async () => {
      if (!sessionId) return;
      setLoading(true);
      try {
        await billingApi.confirmCheckoutSession(sessionId);
        await refreshUser();
        setSessionPaid(true);
        toast.success('Your premium upgrade is active!');
      } catch (error) {
        toast.error(error as string);
      } finally {
        setLoading(false);
      }
    };

    confirmSession();
  }, [sessionId, refreshUser]);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const data = await billingApi.createCheckoutSession();
      window.location.href = data.url;
    } catch (error) {
      toast.error(error as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <Sparkles className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold text-foreground mt-4">Upgrade to StudyGenie Premium</h1>
        <p className="text-muted-foreground mt-2">
          Unlock Study Planner and AI Chat, plus faster responses and priority support.
        </p>
      </div>

      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Premium Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-success" />
              <p className="text-sm text-foreground">Unlock AI Chat and Study Planner access</p>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-success" />
              <p className="text-sm text-foreground">Secure checkout powered by Stripe</p>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-success" />
              <p className="text-sm text-foreground">One-time payment of $9.99 to unlock premium</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {user?.isPremium || sessionPaid ? (
        <Card className="border border-border bg-card p-6 text-center">
          <p className="text-lg font-semibold text-foreground">You are now a premium member.</p>
          <p className="text-sm text-muted-foreground mt-2">Study Planner and AI Chat are unlocked.</p>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </Card>
      ) : (
        <div className="flex justify-center">
          <Button onClick={handleUpgrade} disabled={loading} className="min-w-[180px]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upgrade Now'}
          </Button>
        </div>
      )}
    </div>
  );
}
