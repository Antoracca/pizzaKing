'use client';

import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Flame,
  MapPinned,
  HeartHandshake,
  Clock9,
  Utensils,
  Globe,
  Award,
  ShieldCheck,
  Leaf,
  Users2,
  Sparkles,
  Warehouse,
  Truck
} from 'lucide-react';

const stats = [
  { label: 'Commandes livrées', value: '320K+', helper: 'Depuis 2021' },
  { label: 'Satisfaction client', value: '4,9/5', helper: 'Notation moyenne' },
  { label: 'Délai moyen', value: '23 min', helper: 'Livraison Bangui intra-muros' },
  { label: 'Partenaires actifs', value: '48', helper: 'Livreurs & producteurs locaux' }
];

const values = [
  {
    title: 'Qualité feu de bois',
    description: 'Pâtes maturées 48h, sauces italiennes cuisinées maison et ingrédients sourcés localement.',
    icon: Flame
  },
  {
    title: 'Couverture locale',
    description: 'Un hub culinaire à Bangui, des dark kitchens mobiles pour assurer la fraîcheur partout en ville.',
    icon: MapPinned
  },
  {
    title: 'Respect & fidélité',
    description: 'Programme Royals dédié, livraison transparente et compensations immédiates en cas d’incident.',
    icon: HeartHandshake
  },
  {
    title: 'Technologie temps réel',
    description: 'Tracking GPS, algorithmes prédictifs et support KingBot inspiré des standards Amazon.',
    icon: Clock9
  }
];

const leaders = [
  {
    name: 'Marie Touadéra',
    role: 'CEO & Fondatrice',
    bio: 'Ancienne consultante foodtech, elle pilote la vision omnicanale de Pizza King.',
    focus: 'Stratégie & expérience client',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=320&h=320&fit=crop&q=80'
  },
  {
    name: 'Abdoulaye Nguemo',
    role: 'COO',
    bio: 'Ex-directeur logistique chez un leader de la livraison, il coordonne hubs et flotte.',
    focus: 'Opérations & supply chain',
    avatar: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=320&h=320&fit=crop&q=80'
  },
  {
    name: 'Sarah Békoulba',
    role: 'Chief Product Officer',
    bio: 'Spécialiste UX, elle orchestre l’app web/mobile, le support KingBot et l’analyse data.',
    focus: 'Produit & innovation',
    avatar: 'https://images.unsplash.com/photo-1544723795-4325375ed1b3?w=320&h=320&fit=crop&q=80'
  }
];

const timeline = [
  {
    year: '2021',
    title: 'Ouverture du laboratoire Pizza King',
    description: 'Première dark kitchen à Bangui, 6 pizzas signature et un canal WhatsApp pour commander.'
  },
  {
    year: '2022',
    title: 'Lancement de l’application mobile',
    description: 'Partenariat avec Expo & Firebase pour offrir tracking en direct et paiements multiples.'
  },
  {
    year: '2023',
    title: 'Programme Royals & dashboards',
    description: 'Arrivée des paliers fidélité, suivi en temps réel et cockpit analytics pour les franchisés.'
  },
  {
    year: '2024',
    title: 'Extension nationale',
    description: 'Dark kitchens itinérantes, intégration de Stripe/PayPal et support KingBot 24/7.'
  },
  {
    year: '2025',
    title: 'Vers l’Afrique centrale',
    description: 'Feuille de route pour Douala et Brazzaville, avec un modèle franchise clé en main.'
  }
];

const sustainability = [
  {
    title: 'Chaîne du froid maîtrisée',
    description: 'Fleet de scooters électriques avec caissons isolés connectés au hub IoT.',
    icon: ShieldCheck
  },
  {
    title: 'Packaging responsable',
    description: 'Boîtes recyclées, couverts en amidon et programme de reprise pour les entreprises.',
    icon: Leaf
  },
  {
    title: 'Formation inclusive',
    description: 'Academy interne offrant certifications barista, hygiène HACCP et support client.',
    icon: Users2
  }
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-red-50/30 to-white">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-red-100 bg-gradient-to-br from-red-50 via-white to-orange-50 py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
              <div className="space-y-6">
                <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md">
                  À propos de Pizza King
                </Badge>
                <h1 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
                  L’expérience pizza la plus rapide et la plus fiable d’Afrique centrale.
                </h1>
                <p className="text-lg text-gray-600 md:text-xl">
                  Nous associons la tradition des pizzaiolos napolitains à une organisation logistique digne des leaders mondiaux.
                  Chaque fonctionnalité de notre plateforme est pensée pour livrer une émotion gourmande, dans les meilleures conditions.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg hover:from-red-700 hover:to-orange-700">
                    Explorer notre vision 2025
                  </Button>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    Rejoindre l’aventure
                  </Button>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                    <Sparkles className="h-4 w-4 text-red-500" />
                    <span>Recettes exclusives élaborées à Bangui</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                    <Warehouse className="h-4 w-4 text-orange-500" />
                    <span>Hub logistique intelligent & cold chain</span>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative mx-auto w-full max-w-lg"
              >
                <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-r from-red-200 via-orange-200 to-yellow-100 blur-2xl" />
                <div className="relative overflow-hidden rounded-[32px] border border-red-100 bg-white/90 p-8 shadow-2xl">
                  <img
                    alt="Pizza King Lab"
                    src="https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=960&h=640&fit=crop&q=80"
                    className="h-60 w-full rounded-3xl object-cover"
                  />
                  <div className="mt-6 grid gap-4 text-sm text-gray-700">
                    <div className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3">
                      <span>Dark kitchens actives</span>
                      <span className="font-semibold">6 hubs</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-orange-50 px-4 py-3">
                      <span>Capacité par service</span>
                      <span className="font-semibold">600 pizzas / heure</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                      <span>Taux de commandes suivies</span>
                      <span className="font-semibold">98 %</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats & Values */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr,1fr] lg:items-start">
            <Card className="border-red-100 shadow-md">
              <CardHeader>
                <Badge variant="secondary" className="border border-red-100 bg-red-50 text-red-600">
                  Quelques chiffres
                </Badge>
                <CardTitle className="text-2xl text-gray-900">Ce qui nous anime chaque jour</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-red-100 bg-white px-6 py-5">
                    <p className="text-sm uppercase tracking-wide text-gray-500">{item.label}</p>
                    <p className="mt-2 text-3xl font-black text-gray-900">{item.value}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.helper}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-6">
              {values.map((value) => {
                const Icon = value.icon;

                return (
                  <Card key={value.title} className="border-red-100 shadow-sm">
                    <CardContent className="flex gap-4 px-5 py-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{value.title}</p>
                        <p className="text-sm text-gray-600">{value.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="border-y border-red-100 bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Notre histoire</h2>
              <p className="mt-3 text-gray-600">
                Pizza King est née du désir d’offrir une qualité artisanale avec la réactivité d’un leader e-commerce.
              </p>
            </div>

            <div className="mt-12 space-y-8">
              {timeline.map((step, index) => (
                <div key={step.year} className="relative flex flex-col gap-6 rounded-3xl border border-red-100 bg-white px-6 py-6 shadow-sm lg:flex-row lg:items-center">
                  <div className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-orange-600 text-2xl font-bold text-white">
                    {step.year}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{step.description}</p>
                  </div>
                  <div className="flex-none text-sm text-gray-400">
                    Étape {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">L’équipe dirigeante</h2>
            <p className="mt-3 text-gray-600">
              Des profils complémentaires, entre gastronomie, supply chain et innovation produit.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {leaders.map((leader) => (
              <Card key={leader.name} className="border-red-100 shadow-sm">
                <CardContent className="space-y-4 px-6 py-6">
                  <div className="overflow-hidden rounded-2xl border border-red-100">
                    <img
                      src={leader.avatar}
                      alt={leader.name}
                      className="h-52 w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-900">{leader.name}</p>
                    <p className="text-sm font-medium uppercase tracking-wide text-red-500">{leader.role}</p>
                  </div>
                  <p className="text-sm text-gray-600">{leader.bio}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Award className="h-4 w-4 text-orange-500" />
                    <span>{leader.focus}</span>
                  </div>
                  <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                    Contacter {leader.name.split(' ')[0]}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Sustainability */}
        <section className="border-y border-red-100 bg-gradient-to-b from-white to-red-50 py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Impact & responsabilité</h2>
                <p className="text-lg text-gray-600">
                  Pizza King s’engage à accélérer l’économie locale tout en réduisant son empreinte carbone.
                  Nous accompagnons nos livreurs avec des programmes de propriété de scooter et des formations continues.
                </p>
                <div className="grid gap-4">
                  {sustainability.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className="flex gap-4 rounded-2xl border border-red-100 bg-white px-5 py-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Card className="border-red-100 bg-white/80 shadow-md">
                <CardHeader className="space-y-3">
                  <Badge className="bg-white text-red-600">Opérations terrain</Badge>
                  <CardTitle className="text-2xl text-gray-900">Dark kitchens & flotte</CardTitle>
                  <p className="text-sm text-gray-600">
                    Une infrastructure pensée pour servir 24/7, même lors des pics de commande sport & nocturnes.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3">
                    <span className="font-semibold text-gray-900">Fleet électrique</span>
                    <span>70 % en 2025</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-orange-50 px-4 py-3">
                    <span className="font-semibold text-gray-900">Capteurs IoT par véhicule</span>
                    <span>5 points de contrôle</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                    <span className="font-semibold text-gray-900">Temps de charge en hub</span>
                    <span>20 min moyenne</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-white px-4 py-3">
                    <Truck className="h-5 w-5 text-red-500" />
                    <span>Partenariats logistiques avec URBI, ScootX et coursiers indépendants certifiés.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
