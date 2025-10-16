'use client';

import { usePathname } from 'next/navigation';

export default function RouteViewport({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div id="route-viewport" data-route={pathname} className="contents">
      {children}
    </div>
  );
}

