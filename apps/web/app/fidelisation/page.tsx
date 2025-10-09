'use client';

import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Gift,
  Zap,
  Star,
  Trophy,
  Ticket,
  Timer,
  Sparkles,
  Pizza,
  Wallet,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import type { LoyaltyTier } from '@pizza-king/shared';
import {
  LOYALTY_TIER_BENEFITS,
  LOYALTY_TIER_LABELS,
  LOYALTY_TIER_THRESHOLDS
} from '@pizza-king/shared';

const tierOrder: LoyaltyTier[] = ['bronze', 'silver', 'gold', 'platinum'];

const tierGradients: Record<LoyaltyTier, string> = {
  bronze: 'from-amber-700 to-orange-600',
  silver: 'from-slate-500 to-slate-400',
  gold: 'from-yellow-400 to-amber-500',
  platinum: 'from-purple-500 to-indigo-500'
};

const tierIcons = {
  bronze: Sparkles,
  silver: Star,
  gold: Crown,
  platinum: Trophy
} as const;

const earningMoments = [
  {
    title: 'Commandes en ligne',
    description: '1 point de base pour chaque 500 FCFA dépensés sur le site ou l’app.',
    icon: Pizza
  },
  {
    title: 'Objectifs hebdomadaires',
    description: 'Bonus +25 pts quand vos trois commandes de la semaine dépassent 10 000 FCFA.',
    icon: Zap
  },
  {
    title: 'Parrainage d’amis',
    description: '75 points pour vous et 75 points pour votre filleul à sa première commande.',
    icon: Gift
  },
  {
    title: 'Moments VIP',
    description: 'Doublement des points pendant les soirées match et événements spéciaux.',
    icon: Ticket
  }
];

const faqItems = [
  {
    question: 'Quand mes points expirent-ils ?',
    answer: 'Les points restent actifs 12 mois après la dernière commande. Passez simplement une commande pour les prolonger.'
  },
  {
    question: 'Comment profiter de mes récompenses ?',
    answer: 'Depuis votre espace compte, sélectionnez la récompense disponible avant de valider votre panier.'
  },
  {
    question: 'Puis-je combiner offres et points ?',
    answer: 'Oui, les promotions en cours sont cumulables avec les réductions liées à votre palier.'
  }
];

export default function LoyaltyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-red-50 via-white to-white">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg">
                Programme Fidélité Pizza King
              </Badge>
              <h1 className="text-4xl font-black leading-tight text-gray-900 md:text-5xl">
                Gagnez des points à chaque bouchée.
              </h1>
              <p className="text-lg text-gray-600 md:text-xl">
                Notre programme transforme chaque commande en avantages exclusifs : réductions, cadeaux, livraison premium et expériences VIP.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-orange-200 hover:from-red-700 hover:to-orange-700">
                  Rejoindre le programme
                </Button>
                <Button variant="outline" className="border-red-200 bg-white text-red-600 hover:bg-red-50">
                  Consulter mon solde
                </Button>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-red-100 bg-white/60 px-6 py-4 shadow-sm backdrop-blur">
                <ShieldCheck className="h-10 w-10 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Livraison prioritaire dès le palier Argent</p>
                  <p className="text-sm text-gray-600">Des délais réduits garantis aux membres premium.</p>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative mx-auto w-full max-w-md"
            >
              <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-r from-red-200 via-orange-200 to-yellow-100 blur-2xl" />
              <div className="relative rounded-[28px] border border-red-100 bg-white p-8 shadow-2xl">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Membre Actuel</span>
                  <span className="flex items-center gap-2 font-semibold text-red-600">
                    <Crown className="h-4 w-4" />
                    Palier Or
                  </span>
                </div>
                <div className="mt-6 flex items-end gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Solde</p>
                    <p className="text-4xl font-black text-gray-900">640 pts</p>
                  </div>
                  <div className="rounded-2xl bg-red-50 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-widest text-red-500">Récompense à débloquer</p>
                    <p className="text-lg font-semibold text-gray-900">Pizza Calzone offerte</p>
                  </div>
                </div>
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Progression vers Platine</span>
                    <span>360 pts restants</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-red-100">
                    <div className="h-3 w-[64%] rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
                  </div>
                </div>
                <div className="mt-6 grid gap-3 rounded-2xl bg-red-50 p-4 text-sm text-gray-700">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-red-500" />
                    <span>1 000 FCFA = 20 points (palier Or)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HeartHandshake className="h-5 w-5 text-red-500" />
                    <span>Double points le week-end fidélité</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Timer className="h-5 w-5 text-red-500" />
                    <span>Livraison express &lt; 20 min</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tiers */}
        <section className="border-y border-red-100 bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Quatre paliers motivants</h2>
              <p className="mt-4 text-lg text-gray-600">
                Chaque niveau débloque des avantages supplémentaires et augmente la vitesse d’accumulation des points.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-4">
              {tierOrder.map((tier) => {
                const Icon = tierIcons[tier];
                const nextThreshold = tierOrder.find((candidate) => LOYALTY_TIER_THRESHOLDS[candidate] > LOYALTY_TIER_THRESHOLDS[tier]);

                return (
                  <Card key={tier} className="relative overflow-hidden border-red-100">
                    <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${tierGradients[tier]}`} />
                    <CardHeader className="flex flex-col items-start space-y-4 pt-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-2xl text-gray-900">
                        {LOYALTY_TIER_LABELS[tier]}
                      </CardTitle>
                      <p className="text-sm font-semibold uppercase tracking-wider text-red-500">
                        Dès {LOYALTY_TIER_THRESHOLDS[tier]} pts
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4 pb-6">
                      <ul className="space-y-3 text-sm text-gray-700">
                        {LOYALTY_TIER_BENEFITS[tier].map((benefit) => (
                          <li key={benefit} className="flex items-start gap-2 leading-snug">
                            <Star className="mt-0.5 h-4 w-4 text-red-400" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        {nextThreshold
                          ? `Plus que ${LOYALTY_TIER_THRESHOLDS[nextThreshold] - LOYALTY_TIER_THRESHOLDS[tier]} points pour passer ${LOYALTY_TIER_LABELS[nextThreshold]}`
                          : 'Profitez de tous nos avantages exclusifs !'}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How to earn */}
        <section className="container mx-auto px-4 py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr,1.2fr] lg:items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                Accumulez des points toute la semaine
              </h2>
              <p className="text-lg text-gray-600">
                Chaque interaction avec Pizza King vous rapproche d’une récompense. Combinez les moments de gain pour accélérer votre progression.
              </p>
              <div className="space-y-4">
                {earningMoments.map((moment) => (
                  <div key={moment.title} className="flex gap-4 rounded-2xl border border-red-100 bg-white px-5 py-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                      <moment.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">{moment.title}</p>
                      <p className="text-sm text-gray-600">{moment.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-red-100 bg-white/80 shadow-lg shadow-red-100">
              <CardHeader>
                <Badge variant="secondary" className="border border-red-100 bg-red-50 text-red-600">
                  Exemple de commande Platine
                </Badge>
                <CardTitle className="text-2xl text-gray-900">Gains cumulés sur un mois</CardTitle>
                <p className="text-sm text-gray-600">
                  Avec quatre commandes familiales et un événement spécial, un membre Platine peut générer plus de 1 200 points en 30 jours.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-red-100 bg-gradient-to-br from-white via-red-50 to-white px-5 py-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Total dépensé</span>
                    <span>85 000 FCFA</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-lg font-semibold text-gray-900">
                    <span>Points de base (x2)</span>
                    <span>340 pts</span>
                  </div>
                </div>
                <div className="grid gap-3">
                  {[
                    { label: 'Bonus week-end fidélité', value: '+180 pts' },
                    { label: 'Parrainage confirmé', value: '+75 pts' },
                    { label: 'Objectif hebdomadaire débloqué', value: '+100 pts' },
                    { label: 'Participation événements VIP', value: '+80 pts' }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm text-gray-700">
                      <span>{item.label}</span>
                      <span className="font-semibold text-red-600">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-red-500/10 px-5 py-4 text-center">
                  <p className="text-sm font-semibold uppercase tracking-wide text-red-500">Total mensuel</p>
                  <p className="mt-1 text-3xl font-black text-gray-900">1 215 points</p>
                  <p className="mt-2 text-xs text-gray-600">Suffisant pour un menu XL offert ou deux livraisons gratuites.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-red-100 bg-gradient-to-b from-white to-red-50 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Questions fréquentes</h2>
              <p className="mt-4 text-lg text-gray-600">
                Nous simplifions le programme pour que vous profitiez de vos avantages sans effort.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {faqItems.map((faq) => (
                <Card key={faq.question} className="border-red-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
                      <Sparkles className="h-5 w-5 text-red-500" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-red-100 bg-white px-8 py-10 text-center shadow-md">
              <h3 className="text-2xl font-semibold text-gray-900">Besoin d’un accompagnement personnalisé ?</h3>
              <p className="mt-2 text-sm text-gray-600">
                Contactez le Service Royals pour planifier vos commandes entreprises et événements privés.
              </p>
              <Button
                variant="outline"
                className="mt-6 border-red-200 text-red-600 hover:bg-red-50"
              >
                Être contacté par un conseiller
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
