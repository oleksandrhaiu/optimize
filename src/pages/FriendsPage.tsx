import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useFriends } from '@/hooks/useFriends';
import { FriendsManager } from '@/components/settings/FriendsManager';
import { Skeleton } from '@/components/ui/LoadingSpinner';

export const FriendsPage: React.FC = () => {
  const { session } = useAuthStore();
  const userId = session?.user.id;
  const { friends, loading, removeFriend, refetch } = useFriends(userId);

  return (
    <div>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Friends</h1>
          <p className="text-text-muted text-sm mt-0.5">Find accountability partners and track together.</p>
        </div>

        <div className="rounded-2xl p-6 page-transition" style={{ background: 'rgb(12,13,22)', border: '1px solid rgb(28,30,52)' }}>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            </div>
          ) : (
            <FriendsManager
              friends={friends}
              onRemove={removeFriend}
              onRefetch={refetch}
            />
          )}
        </div>
      </main>
    </div>
  );
};
