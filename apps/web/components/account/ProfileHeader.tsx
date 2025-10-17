'use client';

import { type ChangeEvent } from 'react';
import { User as UserIcon, Upload, Mail, CheckCircle, Award, CalendarClock, Phone, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { User } from '@pizza-king/shared';
import { formatPhone } from './utils';

type Props = {
  user: User;
  photoURL?: string | null;
  emailVerified: boolean;
  photoLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onPhotoClick: () => void;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSendVerificationEmail: () => void;
  onManageProfile: () => void;
};

export default function ProfileHeader({
  user,
  photoURL,
  emailVerified,
  photoLoading,
  fileInputRef,
  onPhotoClick,
  onPhotoChange,
  onSendVerificationEmail,
  onManageProfile,
}: Props) {
  const displayName = user.firstName || user.lastName
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    : (user.displayName ?? 'Compte Pizza King');

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="h-32 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600" />
      <CardContent className="relative px-4 pb-6 sm:px-8">
        <div className="relative -mt-16">
          <div className="flex flex-col gap-6 rounded-3xl bg-white px-6 py-6 shadow-xl sm:flex-row sm:items-center sm:gap-10 sm:px-10 sm:py-8">
            {/* Photo de profil */}
            <div className="relative mx-auto h-28 w-28 flex-shrink-0 sm:mx-0">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-gray-100 text-3xl font-bold text-orange-500 shadow-md">
                {photoURL || user.photoURL ? (
                  <img
                    src={photoURL || user.photoURL || ''}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-14 w-14 text-orange-500" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={onPhotoChange}
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="absolute bottom-2 right-2 rounded-full bg-white text-gray-700 shadow hover:bg-gray-100"
                onClick={onPhotoClick}
                disabled={photoLoading}
              >
                {photoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Informations utilisateur */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {displayName}
                  </h1>
                  <div className="space-y-1">
                    {/* Email avec badge de vérification */}
                    <p className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      <span>{user.email}</span>
                      {emailVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle className="h-3 w-3" />
                          Vérifié
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={onSendVerificationEmail}
                          className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 hover:bg-red-200"
                        >
                          Vérifier
                        </button>
                      )}
                    </p>

                    {/* Téléphone avec badge de vérification */}
                    <p className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span>{formatPhone(user.phoneNumber)}</span>
                      {user.phoneVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle className="h-3 w-3" />
                          Vérifié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
                          Non vérifié
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="self-start rounded-full border-2 border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-600"
                  onClick={onManageProfile}
                >
                  Gérer mon profil
                </Button>
              </div>

              {/* Badges de fidélité et date de création */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="gap-1 rounded-full border border-orange-200 bg-orange-50 text-orange-600">
                  <Award className="h-3 w-3" />
                  {user.loyaltyPoints ?? 0} points •{' '}
                  {user.loyaltyTier?.toUpperCase?.() ?? 'BRONZE'}
                </Badge>
                {user.createdAt && (
                  <Badge variant="outline" className="gap-1 rounded-full">
                    <CalendarClock className="h-3 w-3" />
                    Membre depuis{' '}
                    {formatDate(
                      new Date(
                        user.createdAt?.toDate?.() ?? user.createdAt
                      )
                    )}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
