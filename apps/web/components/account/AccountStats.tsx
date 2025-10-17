'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, TrendingUp, RotateCcw, Pizza } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import type { User } from '@pizza-king/shared';
import StatModal from './StatModal';

type Props = {
  user: User;
};

type StatType = 'orders' | 'spent' | 'refunds' | 'favorite';

export default function AccountStats({ user }: Props) {
  const [openModal, setOpenModal] = useState<StatType | null>(null);

  const stats = [
    {
      id: 'orders' as StatType,
      label: 'Commandes',
      value: user.totalOrders ?? 0,
      icon: ShoppingBag,
      color: 'text-blue-600',
      background: 'bg-blue-50',
      hoverBackground: 'hover:bg-blue-100',
    },
    {
      id: 'spent' as StatType,
      label: 'Dépensé',
      value: formatPrice(user.totalSpent ?? 0),
      icon: TrendingUp,
      color: 'text-emerald-600',
      background: 'bg-emerald-50',
      hoverBackground: 'hover:bg-emerald-100',
    },
    {
      id: 'refunds' as StatType,
      label: 'Remboursé',
      value: formatPrice(0), // TODO: Ajouter totalRefunds dans User
      icon: RotateCcw,
      color: 'text-orange-600',
      background: 'bg-orange-50',
      hoverBackground: 'hover:bg-orange-100',
    },
    {
      id: 'favorite' as StatType,
      label: 'Plus commandé',
      value: user.stats?.favoriteProducts?.length ?? 0,
      icon: Pizza,
      color: 'text-purple-600',
      background: 'bg-purple-50',
      hoverBackground: 'hover:bg-purple-100',
    },
  ];

  const renderModalContent = (statId: StatType) => {
    switch (statId) {
      case 'orders':
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

      case 'spent':
        return (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <TrendingUp className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">
                Total dépensé : {formatPrice(user.totalSpent ?? 0)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Détail des dépenses disponible prochainement
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
                Aucun produit favori
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
    const stat = stats.find((s) => s.id === statId);
    return stat?.label || '';
  };

  const currentStat = stats.find((s) => s.id === openModal);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
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

      {/* Modals */}
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
