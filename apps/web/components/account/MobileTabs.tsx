'use client';

import type { ElementType } from 'react';

type TabId = 'overview' | 'settings' | 'security';

type Tab = {
  id: TabId;
  name: string;
  icon: ElementType;
};

type Props = {
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
};

export default function MobileTabs({ tabs, activeTab, onTabChange }: Props) {
  return (
    <div className="mb-6 flex rounded-2xl bg-white p-1 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition ${
            activeTab === tab.id
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <tab.icon className="h-4 w-4" />
          {tab.name}
        </button>
      ))}
    </div>
  );
}
