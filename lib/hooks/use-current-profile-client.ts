'use client';

import { useEffect, useState } from 'react';

export interface UserProfile {
  id: string;
  full_name: string;
  role: 'client' | 'host' | 'provider' | 'admin';
}

export function useCurrentProfileClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setProfile(data);
        }
      } catch (err) {
        console.error('Erreur lors du chargement du profil client:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  return { profile, loading };
}
