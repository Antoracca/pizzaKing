'use client';

import Link from 'next/link';
import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, UserCircle, CalendarClock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatPrice } from '@/lib/utils';
import type { User } from '@pizza-king/shared';

type Props = {
  user: User;
  photoURL?: string | null;
  email?: string | null;
  onSignOut: () => Promise<void>;
};

const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    try {
      // @ts-expect-error Firestore Timestamp
      return value.toDate();
    } catch (error) {
      return null;
    }
  }
  return null;
};

export default function NavAccountMenu({ user, photoURL, email, onSignOut }: Props) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current || menuRef.current.contains(event.target as Node)) {
        return;
      }
      setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const displayName = useMemo(() => {
    if (user.firstName || user.lastName) {
      return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    }
    return user.displayName || email || 'Compte Pizza King';
  }, [user.firstName, user.lastName, user.displayName, email, user]);

  const avatarInitials = useMemo(() => {
    if (displayName) {
      return displayName
        .split(' ')
        .filter(Boolean)
        .map(part => part[0]?.toUpperCase())
        .slice(0, 2)
        .join('');
    }
    return 'PK';
  }, [displayName]);

  const createdAt = useMemo(() => toDate(user.createdAt), [user.createdAt]);
  const lastLoginAt = useMemo(() => toDate(user.lastLoginAt), [user.lastLoginAt]);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await onSignOut();
      setOpen(false);
    } finally {
      setSigningOut(false);
    }
  };

  const loyaltyLabel = `${user.loyaltyPoints ?? 0} pts • ${user.loyaltyTier?.toUpperCase?.() ?? 'N/A'}`;
  const notificationSummary = useMemo(() => {
    const notifications = (user.preferences as any)?.notifications;
    if (!notifications) return null;
    const channels: string[] = [];
    if (notifications.push) channels.push('Push');
    if (notifications.email) channels.push('Email');
    if (notifications.sms) channels.push('SMS');
    if (notifications.whatsapp) channels.push('WhatsApp');
    return channels.length ? channels.join(' • ') : null;
  }, [user.preferences]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        className="flex h-auto items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-gray-800 transition-all hover:border-red-300 hover:bg-red-50 sm:h-12"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-orange-400 bg-gradient-to-br from-orange-400 to-red-500 text-white text-sm font-bold shadow-md sm:h-10 sm:w-10">
          {photoURL ? (
            <img src={photoURL} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            avatarInitials
          )}
        </div>
        <div className="hidden text-left md:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{displayName}</p>
          <p className="text-xs text-gray-500 leading-tight capitalize">{user.role}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-sm origin-top-right rounded-3xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black/5 z-[80] sm:w-80">
          <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-orange-200 bg-orange-50 text-orange-600 text-base font-bold sm:h-14 sm:w-14">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  avatarInitials
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate sm:text-base">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{email ?? user.email}</p>
              </div>
            </div>

            <div className="mt-3 grid gap-2 rounded-2xl bg-gray-50 p-3 text-xs text-gray-600 sm:mt-4 sm:gap-3 sm:p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 sm:text-sm">
                <Sparkles className="h-3.5 w-3.5 text-orange-500 sm:h-4 sm:w-4" />
                {loyaltyLabel}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <UserCircle className="h-3.5 w-3.5 text-gray-400 sm:h-4 sm:w-4" />
                Rôle : <span className="font-medium text-gray-800 capitalize">{user.role}</span>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-2 text-xs">
                  <UserCircle className="h-3.5 w-3.5 text-gray-400 sm:h-4 sm:w-4" />
                  Téléphone : <span className="font-medium text-gray-800 truncate">{user.phoneNumber}</span>
                </div>
              )}
              {createdAt && (
                <div className="flex items-center gap-2 text-xs">
                  <CalendarClock className="h-3.5 w-3.5 text-gray-400 sm:h-4 sm:w-4" />
                  Compte créé :{' '}
                  <span className="font-medium text-gray-800 truncate">
                    {formatDate(createdAt)}
                  </span>
                </div>
              )}
              {notificationSummary && (
                <div className="rounded-xl border border-orange-100 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 sm:px-3 sm:py-2 sm:text-sm">
                  Notifications : <span className="text-gray-600 font-semibold">{notificationSummary}</span>
                </div>
              )}
              {typeof user.totalOrders === 'number' && (
                <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 sm:px-3 sm:py-2 sm:text-sm">
                  <span>Total commandes</span>
                  <span>{user.totalOrders}</span>
                </div>
              )}
              {typeof user.totalSpent === 'number' && (
                <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 sm:px-3 sm:py-2 sm:text-sm">
                  <span>Dépensé</span>
                  <span className="truncate ml-2">{formatPrice(user.totalSpent)}</span>
                </div>
              )}
              {lastLoginAt && (
                <p className="text-[10px] text-gray-400 sm:text-[11px]">
                  Dernière connexion : {formatDate(lastLoginAt)}
                </p>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:mt-4">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="block w-full rounded-xl border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-700 transition hover:border-orange-400 hover:text-orange-600 sm:px-4 sm:py-2.5 sm:text-sm"
              >
                Voir mon compte
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center gap-2 rounded-xl border border-transparent text-xs font-semibold text-red-600 hover:bg-red-50 sm:text-sm"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {signingOut ? 'Déconnexion...' : 'Se déconnecter'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
