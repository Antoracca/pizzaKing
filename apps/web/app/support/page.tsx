'use client';

import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MessageSquare,
  FileText,
  Headset,
  Search,
  CircleCheck,
  Clock3,
  AlertTriangle,
  ChevronRight,
  Bot,
  User,
  ShieldAlert,
  Truck,
  PackageCheck,
  PhoneCall,
  Mail,
  Link2
} from 'lucide-react';

type SupportAction = {
  title: string;
  description: string;
  icon: any;
  cta: string;
  helper?: string;
};

type ClaimStatus = 'receptioned' | 'analysis' | 'escalated' | 'waiting_customer' | 'resolved';

type Claim = {
  id: string;
  orderId: string;
  subject: string;
  category: string;
  createdAt: string;
  lastUpdate: string;
  status: ClaimStatus;
  progress: number;
  sla: string;
  owner: string;
};

type ChatMessage = {
  sender: 'bot' | 'user';
  timestamp: string;
  content: string;
};

const supportActions: SupportAction[] = [
  {
    title: 'Nouvelle réclamation',
    description: 'Déclarez un problème de livraison, paiement ou qualité en moins de 2 minutes.',
    icon: FileText,
    cta: 'Créer une réclamation'
  },
  {
    title: 'Suivre une demande',
    description: 'Consultez l’état de vos dossiers, les échanges récents et les prochaines étapes.',
    icon: Search,
    cta: 'Voir le suivi',
    helper: '4 dossiers actifs'
  },
  {
    title: 'Parler à un agent',
    description: 'Un conseiller disponible 7j/7 via chat, téléphone ou WhatsApp Business.',
    icon: Headset,
    cta: 'Contacter le support',
    helper: 'Temps d’attente estimé : 3 min'
  }
];

const claims: Claim[] = [
  {
    id: 'PK-REQ-2308',
    orderId: '#CMD-98432',
    subject: 'Livraison incomplète – boisson manquante',
    category: 'Livraison',
    createdAt: '12 avril 2025 – 19h42',
    lastUpdate: '13 avril 2025 – 08h15',
    status: 'analysis',
    progress: 55,
    sla: 'Résolution estimée sous 12h',
    owner: 'Sarah (Support Qualité)'
  },
  {
    id: 'PK-REQ-2299',
    orderId: '#CMD-98390',
    subject: 'Erreur de facturation sur paiement mobile',
    category: 'Paiement',
    createdAt: '11 avril 2025 – 21h05',
    lastUpdate: '12 avril 2025 – 17h20',
    status: 'escalated',
    progress: 35,
    sla: 'Escalade N2 – réponse attendue',
    owner: 'Division Finance'
  },
  {
    id: 'PK-REQ-2285',
    orderId: '#CMD-98210',
    subject: 'Pizza température tiède à la réception',
    category: 'Qualité produit',
    createdAt: '10 avril 2025 – 13h27',
    lastUpdate: '12 avril 2025 – 09h02',
    status: 'waiting_customer',
    progress: 70,
    sla: 'Besoin d’un retour client sous 24h',
    owner: 'Coach Livraison Bangui'
  },
  {
    id: 'PK-REQ-2240',
    orderId: '#CMD-97560',
    subject: 'Code promotionnel non appliqué',
    category: 'Promotions',
    createdAt: '04 avril 2025 – 18h44',
    lastUpdate: '06 avril 2025 – 10h15',
    status: 'resolved',
    progress: 100,
    sla: 'Crédit fidélité appliqué',
    owner: 'Equipe Fidélisation'
  }
];

const statusConfig: Record<
  ClaimStatus,
  { label: string; badgeClass: string; description: string }
> = {
  receptioned: {
    label: 'Réceptionnée',
    badgeClass: 'bg-slate-100 text-slate-700',
    description: 'Ticket enregistré et dispatching en cours.'
  },
  analysis: {
    label: 'Analyse en cours',
    badgeClass: 'bg-blue-100 text-blue-700',
    description: 'Nos équipes vérifient la commande et contactent les intervenants.'
  },
  escalated: {
    label: 'Escaladé Niveau 2',
    badgeClass: 'bg-purple-100 text-purple-700',
    description: 'Le dossier est traité conjointement avec le support technique.'
  },
  waiting_customer: {
    label: 'En attente client',
    badgeClass: 'bg-amber-100 text-amber-700',
    description: 'Nous avons besoin d’informations complémentaires pour avancer.'
  },
  resolved: {
    label: 'Résolu',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    description: 'La solution a été communiquée et le dossier est fermé.'
  }
};

const chatbotSample: ChatMessage[] = [
  {
    sender: 'bot',
    timestamp: '09:02',
    content: 'Bonjour 👋 Je suis KingBot. Quel service souhaitez-vous pour votre commande #CMD-98432 ?'
  },
  {
    sender: 'user',
    timestamp: '09:03',
    content: 'Il manque toujours ma boisson. Pouvez-vous me confirmer l’envoi ?'
  },
  {
    sender: 'bot',
    timestamp: '09:03',
    content: 'Merci. Je consulte la réclamation PK-REQ-2308…'
  },
  {
    sender: 'bot',
    timestamp: '09:04',
    content: 'Le livreur reprogrammé arrive dans 20 minutes avec la boisson manquante. Souhaitez-vous qu’un agent humain confirme par téléphone ?'
  },
  {
    sender: 'user',
    timestamp: '09:04',
    content: 'Oui, merci de me rappeler.'
  }
];

const faqItems = [
  {
    question: 'Quels documents dois-je fournir pour une réclamation livraison ?',
    answer:
      'Une photo du reçu ou du produit concerné, ainsi que l’heure estimée de livraison. KingBot vous guidera pas à pas lors du dépôt.'
  },
  {
    question: 'Combien de temps dure une résolution standard ?',
    answer:
      '95 % des dossiers sont résolus en moins de 24h. Les cas escaladés vers la finance ou les partenaires de livraison peuvent prendre jusqu’à 48h.'
  },
  {
    question: 'Puis-je modifier ou annuler une réclamation ?',
    answer:
      'Oui. Tant que le statut n’est pas “Résolu”, vous pouvez mettre à jour ou annuler directement depuis le suivi ou via KingBot.'
  },
  {
    question: 'Comment joindre un responsable ?',
    answer:
      'Utilisez l’option “Parler à un agent” pour planifier un rappel prioritaire ou ouvrir un canal WhatsApp Business certifié.'
  }
];

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 via-white to-white">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-red-100 bg-gradient-to-br from-red-50 via-white to-orange-50 py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-[1.2fr,1fr]">
              <div className="space-y-6">
                <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md">
                  Centre Support Pizza King
                </Badge>
                <h1 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
                  Résolvez vos demandes en quelques clics.
                </h1>
                <p className="text-lg text-gray-600 md:text-xl">
                  Notre cellule Support & Satisfaction est disponible 7j/7 pour suivre vos commandes,
                  traiter vos réclamations et vous accompagner comme un partenaire privilégié.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg hover:from-red-700 hover:to-orange-700">
                    Lancer KingBot
                  </Button>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    Planifier un rappel
                  </Button>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                    <CircleCheck className="h-4 w-4 text-emerald-500" />
                    <span>Assistance certifiée Amazon-like</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                    <Clock3 className="h-4 w-4 text-red-500" />
                    <span>Temps moyen de résolution : 11h</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                    <ShieldAlert className="h-4 w-4 text-orange-500" />
                    <span>Escalade prioritaire promise</span>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative mx-auto w-full max-w-md"
              >
                <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-r from-red-200 via-orange-200 to-yellow-100 blur-2xl" />
                <div className="relative overflow-hidden rounded-[28px] border border-red-100 bg-white p-8 shadow-2xl">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Temps réel</span>
                    <span className="flex items-center gap-2 font-semibold text-red-600">
                      <Truck className="h-4 w-4" />
                      Commandes livrées aujourd’hui : 482
                    </span>
                  </div>
                  <div className="mt-6 space-y-4 text-sm text-gray-700">
                    <div className="flex justify-between rounded-2xl bg-red-50 px-4 py-3">
                      <span>Réclamations ouvertes</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between rounded-2xl bg-orange-50 px-4 py-3">
                      <span>Dossier le plus long</span>
                      <span className="font-semibold">18h (escalade finance)</span>
                    </div>
                    <div className="flex justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                      <span>Taux de satisfaction</span>
                      <span className="font-semibold">4,9/5</span>
                    </div>
                  </div>
                  <div className="mt-8 rounded-2xl border border-red-100 bg-gradient-to-br from-white via-red-50 to-white px-5 py-4 text-sm">
                    <p className="font-semibold text-gray-900">Assistance prioritaire Club Royal</p>
                    <p className="mt-1 text-gray-600">Vos réclamations sont traitées avant 2h, avec compensation fidélité immédiate.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {supportActions.map((action) => {
              const Icon = action.icon;

              return (
                <Card key={action.title} className="border-red-100 shadow-sm hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-col space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl text-gray-900">{action.title}</CardTitle>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700">
                      {action.cta}
                    </Button>
                    {action.helper ? (
                      <p className="text-xs text-gray-500">{action.helper}</p>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Claims tracking */}
        <section className="border-y border-red-100 bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Suivi des réclamations</h2>
                <p className="mt-3 max-w-2xl text-gray-600">
                  Gardez une vision claire de vos dossiers : statut, propriété, et prochaines actions.
                  Nos équipes mettent à jour l’avancement en temps réel, comme sur Amazon.
                </p>
              </div>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                Exporter en PDF
              </Button>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {claims.map((claim) => {
                const status = statusConfig[claim.status];
                const isResolved = claim.status === 'resolved';

                return (
                  <Card key={claim.id} className="border-red-100 shadow-sm">
                    <CardHeader className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">{claim.orderId}</p>
                          <CardTitle className="text-xl text-gray-900">{claim.subject}</CardTitle>
                        </div>
                        <Badge className={`${status.badgeClass} text-xs font-semibold`}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Créée : {claim.createdAt}</span>
                        <span>Dernière mise à jour : {claim.lastUpdate}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex gap-3 rounded-xl bg-red-50/70 px-4 py-3 text-sm text-gray-600">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <div>
                          <span className="font-semibold text-gray-900">{claim.category}</span>
                          <p>{status.description}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Progression</span>
                          <span>{claim.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-red-100">
                          <div
                            className={`h-2 rounded-full ${isResolved ? 'bg-emerald-500' : 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400'}`}
                            style={{ width: `${claim.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{claim.sla}</p>
                      </div>

                      <div className="grid gap-2 rounded-xl border border-red-100 bg-white px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Gestionnaire</span>
                          <span className="font-semibold text-gray-900">{claim.owner}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Actions</span>
                          <div className="flex items-center gap-2 text-xs">
                            <button className="text-red-600 hover:text-red-700">Ajouter une note</button>
                            <span className="text-gray-300">•</span>
                            <button className="text-red-600 hover:text-red-700">Télécharger l’historique</button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Create claim & live support */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <Card className="border-red-100 shadow-sm">
              <CardHeader className="space-y-3">
                <Badge variant="secondary" className="border border-red-100 bg-red-50 text-red-600">
                  Ouverture guidée
                </Badge>
                <CardTitle className="text-2xl text-gray-900">
                  Créer une nouvelle réclamation
                </CardTitle>
                <p className="text-sm text-gray-600">
                  KingBot vous assiste pour collecter toutes les informations nécessaires et garantir une prise en charge immédiate.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: '1. Sélectionnez votre commande impactée',
                    description: 'Recherche automatique par numéro, QR code ou historique fidélité.',
                    icon: PackageCheck
                  },
                  {
                    title: '2. Décrivez le problème en quelques mots',
                    description: 'Catégories pré-remplies (livraison, paiement, produit, promotion).',
                    icon: FileText
                  },
                  {
                    title: '3. Joignez des preuves si nécessaire',
                    description: 'Ajoutez photos, reçu ou note vocale. Taille maximale : 25 Mo.',
                    icon: Link2
                  },
                  {
                    title: '4. Choisissez le canal de résolution',
                    description: 'Chat en direct, rappel téléphonique, crédit fidélité ou remboursement.',
                    icon: PhoneCall
                  }
                ].map((step) => {
                  const Icon = step.icon;

                  return (
                    <div key={step.title} className="flex gap-4 rounded-2xl border border-red-100 bg-white px-5 py-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-900">{step.title}</p>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
                <Button className="mt-2 w-full bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700">
                  Commencer une nouvelle réclamation
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-100 bg-gradient-to-br from-white via-red-50 to-orange-50 shadow-sm">
              <CardHeader className="space-y-3">
                <Badge className="bg-white text-red-600">Chat intelligent + agent</Badge>
                <CardTitle className="text-2xl text-gray-900">Parler à un agent</CardTitle>
                <p className="text-sm text-gray-600">
                  KingBot traite les étapes simples puis transfère à un conseiller spécialisé selon votre besoin.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-red-100 bg-white p-4">
                  <div className="space-y-3">
                    {chatbotSample.map((message, index) => {
                      const isBot = message.sender === 'bot';
                      const Icon = isBot ? Bot : User;

                      return (
                        <div
                          key={`${message.timestamp}-${index}`}
                          className={`flex gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse text-right'}`}
                        >
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isBot ? 'bg-red-50 text-red-500' : 'bg-slate-900 text-white'}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="max-w-xs space-y-1">
                            <div className={`rounded-2xl px-4 py-3 text-sm ${isBot ? 'bg-red-50 text-gray-700' : 'bg-slate-900 text-white'}`}>
                              {message.content}
                            </div>
                            <span className="text-xs text-gray-400">{message.timestamp}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-red-100 bg-white px-4 py-3 text-sm text-gray-600">
                  <p className="font-semibold text-gray-900">Escalade automatique</p>
                  <p className="mt-1">
                    Après 5 minutes sans solution, l’agent humain reprend la main avec un résumé complet du bot.
                  </p>
                </div>
                <div className="grid gap-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Chat 24/7</span>
                    <span className="font-semibold text-gray-900">Temps d’attente : 2 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hotline</span>
                    <a href="tel:+23672134848" className="text-red-600 hover:text-red-700">
                      +236 72 13 48 48
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Courriel prioritaire</span>
                    <a href="mailto:support@pizzaking.com" className="text-red-600 hover:text-red-700">
                      support@pizzaking.com
                    </a>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                  Parler avec un conseiller
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-red-100 bg-gradient-to-b from-white to-red-50 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">FAQ support & satisfaction</h2>
              <p className="mt-3 text-gray-600">
                Les réponses aux questions les plus fréquentes, inspirées des standards Amazon.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {faqItems.map((item) => (
                <Card key={item.question} className="border-red-100 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg text-gray-900">{item.question}</CardTitle>
                    <ChevronRight className="h-5 w-5 text-red-400" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
