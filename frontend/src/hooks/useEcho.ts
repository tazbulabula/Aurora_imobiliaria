import { useEffect, useState } from 'react';
import type Echo from 'laravel-echo';
import { createEcho } from '@/lib/echo';

export function useEcho() {
  const [echo, setEcho] = useState<Echo<'reverb'> | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const instance = createEcho(token);
    setEcho(instance);

    return () => {
      instance.disconnect();
    };
  }, []);

  return echo;
}