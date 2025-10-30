'use client';

import { LogOut, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ElementType } from 'react';
import type { TabId } from './utils';

type Tab = {
  id: TabId;
  name: string;
  icon: ElementType;
};

type Props = {
  tabs: Tab[];
  activeTab: TabId;
  signingOut: boolean;
  onTabChange: (tabId: TabId) => void;
  onSignOut: () => void;
};

export default function AccountNavigation({
  tabs,
  activeTab,
  signingOut,
  onTabChange,
  onSignOut,
}: Props) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-4">
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.name}
            </button>
          ))}
          <button
            onClick={onSignOut}
            disabled={signingOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:opacity-60"
          >
            {signingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Déconnexion...</span>
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                <span>Se déconnecter</span>
              </>
            )}
          </button>
        </nav>
      </CardContent>
    </Card>
  );
}
