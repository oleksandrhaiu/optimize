import React from 'react';
import { ProfileSettings } from '@/components/settings/ProfileSettings';

export const ProfilePage: React.FC = () => {
  return (
    <div>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Profile & Preferences</h1>
          <p className="text-text-muted text-sm mt-0.5">Customize your account, appearance, and sounds.</p>
        </div>

        <div className="rounded-2xl p-6 page-transition" style={{ background: 'rgb(12,13,22)', border: '1px solid rgb(28,30,52)' }}>
          <ProfileSettings />
        </div>
      </main>
    </div>
  );
};
