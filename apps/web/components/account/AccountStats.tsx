'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  TrendingUp,
  RotateCcw,
  Pizza,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import type { User } from '@pizza-king/shared';
import StatModal from './StatModal';

export type AccountStatsSnapshot = {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  favoriteCount?: number;
  lastOrderAt?: string | null;
};

type Props = {
  user: User;
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
  hoverBackground: string;
};

export default function AccountStats({ user, stats }: Props) {
  const [openModal, setOpenModal] = useState<StatType | null>(null);

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
      hoverBackground: 'hover:bg-blue-100',
    },
    {
      id: 'spent' as StatType,
      label: 'Dépensé',
      value: formatPrice(stats.totalSpent ?? 0),
      icon: TrendingUp,
      color: 'text-emerald-600',
      background: 'bg-emerald-50',
      hoverBackground: 'hover:bg-emerald-100',
    },
    {
      id: 'refunds' as StatType,
      label: 'Remboursé',
      value: formatPrice(0),
      icon: RotateCcw,
      color: 'text-orange-600',
      background: 'bg-orange-50',
      hoverBackground: 'hover:bg-orange-100',
    },
    {
      id: 'favorite' as StatType,
      label: 'Plus commandé',
      value: favoriteCount,
      icon: Pizza,
      color: 'text-purple-600',
      background: 'bg-purple-50',
      hoverBackground: 'hover:bg-purple-100',
    },
  ];

  const lastOrderDate = useMemo(() => {
    if (!stats.lastOrderAt) return null;
    const parsed = new Date(stats.lastOrderAt);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [stats.lastOrderAt]);

  const renderModalContent = (statId: StatType) => {
    switch (statId) {
      case 'orders':
        if (!stats.totalOrders) {
          return (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">
                  Aucune commande pour le moment
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Vos commandes apparaîtront ici une fois passées
                </p>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900">
                <ShoppingBag className="h-5 w-5" />
                Historique de commandes
              </div>
              <p className="text-2xl font-black text-blue-900">
                {stats.totalOrders.toLocaleString()} commande
                {stats.totalOrders > 1 ? 's' : ''}
              </p>
              {stats.averageOrderValue > 0 && (
                <p className="mt-2 text-sm text-blue-700">
                  Panier moyen : {formatPrice(stats.averageOrderValue)}
                </p>
              )}
              {lastOrderDate && (
                <p className="mt-1 text-xs text-blue-600">
                  Dernière commande le{' '}
                  {lastOrderDate.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        );

      case 'spent':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
              <TrendingUp className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
              <p className="text-sm font-semibold text-emerald-900">
                Total dépensé
              </p>
              <p className="text-2xl font-black text-emerald-900">
                {formatPrice(stats.totalSpent ?? 0)}
              </p>
              {stats.averageOrderValue > 0 && (
                <p className="mt-2 text-xs text-emerald-700">
                  Panier moyen : {formatPrice(stats.averageOrderValue)}
                </p>
              )}
              <p className="mt-2 text-xs text-emerald-700">
                Historique détaillé disponible prochainement
              </p>
            </div>
          </div>
        );

      case 'refunds':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <RotateCcw className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">
                Aucun remboursement
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Historique des remboursements disponible ici
              </p>
            </div>
          </div>
        );

      case 'favorite':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <Pizza className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">
                {favoriteCount > 0
                  ? `Vos ${favoriteCount} produits préférés apparaissent ici`
                  : 'Aucun produit favori'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Commencez à commander pour voir vos préférences
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getModalTitle = (statId: StatType) => {
    const stat = statCards.find(card => card.id === statId);
    return stat?.label || '';
  };

  const currentStat = statCards.find(card => card.id === openModal);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              onClick={() => setOpenModal(stat.id)}
              className="cursor-pointer border-0 shadow-sm transition-all hover:shadow-lg hover:scale-105"
            >
              <CardContent className="flex items-center gap-3 p-3">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${stat.background} ${stat.hoverBackground} transition-colors`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 truncate">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900 truncate">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {openModal && currentStat && (
        <StatModal
          isOpen={!!openModal}
          onClose={() => setOpenModal(null)}
          title={getModalTitle(openModal)}
          icon={currentStat.icon}
          iconColor={currentStat.color}
          iconBackground={currentStat.background}
        >
          {renderModalContent(openModal)}
        </StatModal>
      )}
    </>
  );
}
