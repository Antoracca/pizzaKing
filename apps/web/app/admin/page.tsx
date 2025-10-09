'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  ShoppingBag,
  Pizza,
  Users,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const stats = [
  {
    label: "Aujourd'hui",
    value: '45',
    change: '+12%',
    trend: 'up',
    icon: ShoppingBag,
    color: 'blue',
  },
  {
    label: 'Revenus',
    value: '425k',
    change: '+8%',
    trend: 'up',
    icon: DollarSign,
    color: 'green',
  },
  {
    label: 'Clients',
    value: '1.2k',
    change: '+24%',
    trend: 'up',
    icon: Users,
    color: 'purple',
  },
  {
    label: 'Pizzas',
    value: '24',
    change: '+2',
    trend: 'up',
    icon: Pizza,
    color: 'orange',
  },
];

const recentOrders = [
  {
    id: '1',
    orderNumber: 'PK20251007001',
    customer: 'Jean Dupont',
    items: 2,
    total: 18500,
    status: 'preparing',
    time: '5 min',
  },
  {
    id: '2',
    orderNumber: 'PK20251007002',
    customer: 'Marie Kane',
    items: 1,
    total: 12000,
    status: 'confirmed',
    time: '12 min',
  },
  {
    id: '3',
    orderNumber: 'PK20251007003',
    customer: 'Ibrahim Ouédraogo',
    items: 3,
    total: 24500,
    status: 'on_route',
    time: '25 min',
  },
];

const topPizzas = [
  { name: 'Margherita Royale', orders: 145, revenue: 870000 },
  { name: 'BBQ Chicken', orders: 132, revenue: 1188000 },
  { name: '4 Fromages', orders: 98, revenue: 833000 },
  { name: 'Pepperoni', orders: 87, revenue: 696000 },
];

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('today');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-xl">
            🍕
          </div>
          <span className="text-xl font-bold">Pizza King Admin</span>
        </div>

        <nav className="space-y-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', active: true },
            { icon: ShoppingBag, label: 'Commandes', badge: 12 },
            { icon: Pizza, label: 'Menu', badge: null },
            { icon: Users, label: 'Clients', badge: null },
            { icon: Package, label: 'Livreurs', badge: 3 },
            { icon: TrendingUp, label: 'Analytics', badge: null },
          ].map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                item.active
                  ? 'bg-orange-500 shadow-lg shadow-orange-500/30'
                  : 'hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <Badge className="bg-red-500">{item.badge}</Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Vue d'ensemble de votre activité
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 font-medium"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle commande
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-xl transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <Badge variant={stat.trend === 'up' ? 'success' : 'destructive'}>
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Commandes Récentes
                  </h2>
                  <Button variant="ghost" size="sm">
                    Voir tout
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                          {order.items}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            #{order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.customer}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {formatPrice(order.total)}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-3 h-3" />
                            {order.time}
                          </div>
                        </div>
                        <Badge
                          variant={
                            order.status === 'preparing'
                              ? 'default'
                              : order.status === 'confirmed'
                              ? 'secondary'
                              : 'success'
                          }
                        >
                          {order.status === 'preparing'
                            ? 'En préparation'
                            : order.status === 'confirmed'
                            ? 'Confirmée'
                            : 'En route'}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Pizzas */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Top Pizzas
                </h2>

                <div className="space-y-4">
                  {topPizzas.map((pizza, index) => (
                    <motion.div
                      key={pizza.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">
                          {pizza.name}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {pizza.orders} commandes
                          </span>
                          <span className="font-semibold text-orange-600">
                            {formatPrice(pizza.revenue)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Actions Rapides
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Pizza className="w-4 h-4 mr-2" />
                    Ajouter une pizza
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Gérer les utilisateurs
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Voir les rapports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
