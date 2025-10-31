'use client';

import { useState, type ChangeEvent } from 'react';
import {
  User as UserIcon,
  Upload,
  CheckCircle,
  Award,
  Loader2,
  ShoppingBag,
  TrendingUp,
  Mail,
  Phone,
  CalendarClock,
  RotateCcw,
  Pizza,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';
import { formatPhone } from './utils';
import type { User } from '@pizza-king/shared';
import StatModal from './StatModal';
import type { AccountStatsSnapshot } from './AccountStats';

type Props = {
  user: User;
  emailVerified: boolean;
  photoLoading: boolean;
  photoURL?: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onPhotoClick: () => void;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSendVerificationEmail: () => void;
  stats: AccountStatsSnapshot;
};

type StatType = 'orders' | 'spent' | 'refunds' | 'favorite';

type StatCard = {
  id: StatType;
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  background: string;
};

export default function MobileProfileHeader({
  user,
  emailVerified,
  photoLoading,
  photoURL,
  fileInputRef,
  onPhotoClick,
  onPhotoChange,
  onSendVerificationEmail,
  stats,
}: Props) {
  const [openModal, setOpenModal] = useState<StatType | null>(null);

  const displayName = user.firstName || user.lastName
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    : (user.displayName ?? 'Compte Pizza King');

  const favoriteCount =
    stats.favoriteCount ?? user.stats?.favoriteProducts?.length ?? 0;

  const statCards: StatCard[] = [
    {
      id: 'orders' as StatType,
      label: 'Commandes',
      value: stats.totalOrders ?? 0,
      icon: ShoppingBag,
      color: 'text-blue-600',
      background: 'bg-blue-50',
    },
    {
      id: 'spent' as StatType,
      label: 'Dépensé',
      value: formatPrice(stats.totalSpent ?? 0),
      icon: TrendingUp,
      color: 'text-emerald-600',
      background: 'bg-emerald-50',
    },
    {
      id: 'refunds' as StatType,
      label: 'Remboursé',
      value: formatPrice(0),
      icon: RotateCcw,
      color: 'text-orange-600',
      background: 'bg-orange-50',
    },
    {
      id: 'favorite' as StatType,
      label: 'Plus commandé',
      value: favoriteCount,
      icon: Pizza,
      color: 'text-purple-600',
      background: 'bg-purple-50',
    },
  ];

  const renderModalContent = (statId: StatType) => {
    switch (statId) {
      case 'orders':
        if (!stats.totalOrders) {
          return (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
              <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">
                Aucune commande pour le moment
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Vos commandes apparaîtront ici
              </p>
            </div>
          );
        }

        return (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
            <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">
              {stats.totalOrders.toLocaleString()} commande
              {stats.totalOrders > 1 ? 's' : ''}
            </p>
            {stats.averageOrderValue > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                Panier moyen : {formatPrice(stats.averageOrderValue)}
              </p>
            )}
          </div>
        );

      case 'spent':
        return (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
            <TrendingUp className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">
              Total : {formatPrice(stats.totalSpent ?? 0)}
            </p>
            {stats.averageOrderValue > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                Panier moyen : {formatPrice(stats.averageOrderValue)}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Détails disponibles prochainement</p>
          </div>
        );

      case 'refunds':
        return (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
            <RotateCcw className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">
              Aucun remboursement
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Historique disponible ici
            </p>
          </div>
        );

      case 'favorite':
        return (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
            <Pizza className="mx-auto mb-3 h-10 w-10 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">
                {favoriteCount > 0
                  ? `Vos ${favoriteCount} produits préférés apparaissent ici`
                  : 'Aucun produit favori'}
              </p>
            <p className="mt-1 text-xs text-gray-500">
              Commandez pour voir vos préférences
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStat = statCards.find(card => card.id === openModal);

  return (
    <div className="mb-6 rounded-3xl bg-white p-6 shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-orange-400 bg-gradient-to-br from-orange-400 to-red-500 text-lg font-bold text-white shadow-md">
            {photoURL || user.photoURL ? (
              <img
                src={photoURL || user.photoURL || ''}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="h-8 w-8 text-white" />
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
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white p-0 text-gray-700 shadow hover:bg-gray-100"
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

        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">{displayName}</h1>

          {/* Email avec badge de vérification */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
            <Mail className="h-3 w-3 text-gray-400" />
            <span className="truncate max-w-[140px]">{user.email}</span>
            {emailVerified ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                <CheckCircle className="h-2.5 w-2.5" />
                Vérifié
              </span>
            ) : (
              <button
                type="button"
                onClick={onSendVerificationEmail}
                className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 hover:bg-red-200"
              >
                Vérifier
              </button>
            )}
          </div>

          {/* Téléphone avec badge de vérification */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
            <Phone className="h-3 w-3 text-gray-400" />
            <span>{formatPhone(user.phoneNumber)}</span>
            {user.phoneVerified ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                <CheckCircle className="h-2.5 w-2.5" />
                Vérifié
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-600">
                Non vérifié
              </span>
            )}
          </div>

          {/* Date d'inscription et points */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {user.createdAt && (
              <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                <CalendarClock className="h-3 w-3" />
                Depuis {formatDate(new Date(user.createdAt?.toDate?.() ?? user.createdAt))}
              </span>
            )}
            <Badge className="rounded-full bg-orange-50 text-orange-600 border-orange-200 text-[10px] px-1.5 py-0.5">
              <Award className="h-3 w-3 mr-0.5" />
              {user.loyaltyPoints ?? 0} pts
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Mobile Grid - Cliquables */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(stat => (
          <button
            key={stat.label}
            onClick={() => setOpenModal(stat.id)}
            className="rounded-2xl bg-gray-50 p-3 text-center transition-all hover:bg-gray-100 hover:shadow-md active:scale-95"
          >
            <div
              className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${stat.background}`}
            >
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-sm font-bold text-gray-900">{stat.value}</p>
          </button>
        ))}
      </div>

      {/* Modals */}
      {openModal && currentStat && (
        <StatModal
          isOpen={!!openModal}
          onClose={() => setOpenModal(null)}
          title={currentStat.label}
          icon={currentStat.icon}
          iconColor={currentStat.color}
          iconBackground={currentStat.background}
        >
          {renderModalContent(openModal)}
        </StatModal>
      )}
    </div>
  );
}
