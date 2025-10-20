'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageSquare,
  FileText,
  Headset,
  Search,
  ShieldCheck,
  Clock3,
  ThumbsUp,
  Smartphone,
  PhoneCall,
  Mail,
  Link2,
} from 'lucide-react';

export default function SupportPage() {
  const phoneLink = 'tel:+23672134848';
  const secondaryPhoneLink = 'tel:+23675134848';
  const whatsappLink = 'https://wa.me/23675134848';
  const emailLink = 'mailto:support@mapizzaking.com';
  const newTicketLink = '/support/tickets/new';
  const ticketsDashboardLink = '/support/tickets';
  const helpCenterLink = '/support/articles';
  const supportChatLink = '/support/chat';

  const [showPhones, setShowPhones] = useState(false);

  const faqs = [
    {
      question: 'Comment suivre la livraison de ma commande ?',
      answer:
        'Ouvre ton espace client puis clique sur “Mes commandes”. Chaque commande affiche le statut en temps réel et la position du livreur.',
    },
    {
      question: 'Que faire si un article est manquant ou incorrect ?',
      answer:
        'Crée une réclamation depuis la section “Déclarer un problème” ou contacte-nous par téléphone. Nous renverrons l’article ou créditerons ta commande sous 24h.',
    },
    {
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer:
        'Cartes bancaires Visa/Mastercard, mobile money (Orange, Moov), paiement à la livraison et PayPal pour les commandes entreprises.',
    },
    {
      question: 'Comment modifier ou annuler une commande ?',
      answer:
        'Contacte-nous au plus vite via le chat ou le téléphone. Les modifications sont possibles tant que la préparation n’est pas lancée.',
    },
    {
      question: 'Puis-je obtenir une facture pour mon entreprise ?',
      answer:
        'Oui, indique simplement ton numéro IFU lors du règlement ou écris-nous à support@mapizzaking.com pour recevoir la facture détaillée.',
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
        <section className="bg-gradient-to-br from-orange-100 via-white to-white">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
            <div className="space-y-5 text-center">
              <Badge className="mx-auto bg-orange-100 text-orange-600 ring-1 ring-orange-200">
                Support Pizza King • 7j/7
              </Badge>
              <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
                Contacte notre support en quelques secondes
              </h1>
              <p className="mx-auto max-w-3xl text-lg text-slate-600 sm:text-xl">
                Un incident de commande, une question de paiement, un conseil ? Notre équipe te répond 7j/7 et suit ton dossier jusqu’à la résolution.
              </p>
              <Button
                size="lg"
                className="mx-auto bg-orange-500 text-white shadow-lg hover:bg-orange-600 sm:w-auto"
                asChild
              >
                <a href={supportChatLink}>
                  <Headset className="mr-2 h-5 w-5" />
                  Ouvrir le chat support
                </a>
              </Button>
              <p className="text-sm text-slate-500">
                Temps de réponse moyen observé : moins de 5 min.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
            <div className="space-y-6">
              <Card className="border border-orange-100">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                    <Headset className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Support agents en direct
                    </h3>
                    <p className="text-sm text-slate-500">
                      Accède au chat sécurisé : nous prenons en charge ta demande et te tenons informé de chaque étape.
                    </p>
                  </div>
                  <Button className="mt-auto bg-orange-500 text-white hover:bg-orange-600" asChild>
                    <a href={supportChatLink}>
                      Contacter le support
                      <MessageSquare className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border border-orange-100">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Déclarer un problème
                    </h3>
                    <p className="text-sm text-slate-500">
                      Livraison, paiement, qualité… signale l’incident en moins
                      de 2 minutes.
                    </p>
                  </div>
                  <Button className="mt-auto bg-orange-500 text-white hover:bg-orange-600" asChild>
                    <a href={newTicketLink}>
                      Créer une réclamation
                      <Link2 className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border border-orange-100">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                    <Search className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Suivre mes tickets
                    </h3>
                    <p className="text-sm text-slate-500">
                      Consulte l’état de tes demandes, ajoute une précision ou
                      ferme un ticket résolu.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-auto border-orange-200 text-orange-600 hover:bg-orange-50"
                    asChild
                  >
                    <a href={ticketsDashboardLink}>
                      Accéder au suivi
                      <Link2 className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border border-orange-100">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                    <Headset className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Centre d’aide
                    </h3>
                    <p className="text-sm text-slate-500">
                      Guides pas-à-pas pour modifier une commande, gérer ton
                      compte ou utiliser nos offres.
                    </p>
                  </div>
                  <Button variant="ghost" className="mt-auto text-orange-500 hover:bg-orange-50" asChild>
                    <a href={helpCenterLink}>
                      Explorer les guides
                      <Link2 className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-slate-100 bg-white">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                Les canaux qui te conviennent
              </h2>
              <p className="text-base text-slate-600">
                Choisis le mode de contact le plus pratique, nous te répondons
                en quelques minutes.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border border-slate-100">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Téléphone (11h – 23h)
                      </h3>
                      <p className="text-sm text-slate-500">
                        Nous te rappelons sur la ligne la plus rapide disponible.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-fit border-orange-200 text-orange-600 hover:bg-orange-50"
                      onClick={() => setShowPhones(prev => !prev)}
                    >
                      {showPhones ? 'Masquer les numéros' : 'Appeler le support'}
                    </Button>
                    {showPhones ? (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button variant="ghost" className="bg-orange-50 text-orange-600 hover:bg-orange-100" asChild>
                          <a href={phoneLink}>+236 72 13 48 48</a>
                        </Button>
                        <Button variant="ghost" className="bg-orange-50 text-orange-600 hover:bg-orange-100" asChild>
                          <a href={secondaryPhoneLink}>+236 75 13 48 48</a>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-slate-100">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        WhatsApp Business
                      </h3>
                      <p className="text-sm text-slate-500">
                        Notifications, partage de photos et suivi direct avec un
                        conseiller.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-fit border-orange-200 text-orange-600 hover:bg-orange-50"
                      asChild
                    >
                      <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        Envoyer un message
                        <MessageSquare className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-slate-100">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Email support
                      </h3>
                      <p className="text-sm text-slate-500">
                        Pour un suivi détaillé, une demande entreprise ou un
                        dossier déjà ouvert.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-fit text-orange-500 hover:bg-orange-50"
                      asChild
                    >
                      <a href={emailLink}>support@mapizzaking.com</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-slate-100">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                    <Headset className="h-5 w-5" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Chat en direct (Web)
                      </h3>
                      <p className="text-sm text-slate-500">
                        Disponible depuis ton espace client. Nos agents
                        reprennent la main en moins de 5 minutes.
                      </p>
                    </div>
                    <Button
                      className="w-fit bg-orange-500 text-white hover:bg-orange-600"
                      asChild
                    >
                      <a href={supportChatLink}>
                        Ouvrir le chat sécurisé
                        <Link2 className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-orange-100 bg-white">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                Questions fréquentes
              </h2>
              <p className="text-base text-slate-600">
                Voici les réponses rapides pour t’éviter un ticket.
              </p>
            </div>
            <div className="space-y-4">
              {faqs.map(faq => (
                <Card
                  key={faq.question}
                  className="border border-slate-100 transition hover:border-orange-200"
                >
                  <CardContent className="space-y-2 p-5">
                    <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                      <MessageSquare className="h-5 w-5 text-orange-500" />
                      {faq.question}
                    </h3>
                    <p className="text-sm text-slate-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-100 bg-white">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                Pourquoi nous faire confiance ?
              </h2>
              <p className="text-sm text-slate-500">
                Chiffres basés sur les 90 derniers jours, mis à jour chaque semaine.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-5">
                <ShieldCheck className="mb-3 h-6 w-6 text-orange-500" />
                <p className="text-2xl font-semibold text-slate-900">6h30</p>
                <p className="text-sm text-slate-600">
                  Délai moyen pour clôturer une demande standard.
                </p>
              </div>
              <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-5">
                <ThumbsUp className="mb-3 h-6 w-6 text-orange-500" />
                <p className="text-2xl font-semibold text-slate-900">4.8/5</p>
                <p className="text-sm text-slate-600">
                  Note moyenne donnée par nos clients après assistance.
                </p>
              </div>
              <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-5">
                <Clock3 className="mb-3 h-6 w-6 text-orange-500" />
                <p className="text-2xl font-semibold text-slate-900">7j/7</p>
                <p className="text-sm text-slate-600">
                  Disponibilité via chat support, téléphone et WhatsApp.
                </p>
              </div>
              <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-5">
                <Link2 className="mb-3 h-6 w-6 text-orange-500" />
                <p className="text-2xl font-semibold text-slate-900">100%</p>
                <p className="text-sm text-slate-600">
                  Historique de tickets et relances accessibles dans ton compte.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-12 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold text-slate-900">
              Prêt à discuter avec nous ?
            </h2>
            <p className="max-w-2xl text-base text-slate-600">
              Nous traitons chaque message. Lance le chat, appelle-nous ou ouvre
              un ticket : on s’occupe du reste.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="bg-orange-500 text-white hover:bg-orange-600" asChild>
                <a href={newTicketLink}>Déclarer un problème</a>
              </Button>
              <Button
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
                asChild
              >
                <a href={emailLink}>Écrire au support</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
