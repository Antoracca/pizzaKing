'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChefHat,
  Clock3,
  HeartHandshake,
  MapPin,
  Smartphone,
  Truck,
} from 'lucide-react';

type Step = {
  id: number;
  title: string;
  description: string;
  highlights: string[];
  icon: typeof Smartphone;
  accent: string;
  gradient: string;
};

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Choisissez votre pizza',
    description:
      'Parcourez la carte, personnalisez chaque détail et validez en quelques secondes sur web ou mobile.',
    highlights: ['Menu ultra clair', 'Paiement sécurisé', 'Suivi en temps réel'],
    icon: Smartphone,
    accent: 'border-sky-200 text-sky-600',
    gradient: 'from-sky-500 to-cyan-500',
  },
  {
    id: 2,
    title: 'Préparation minute',
    description:
      'Nos pizzaïolos étalent la pâte maison, garnissent avec des ingrédients frais puis enfournent au four à pierre.',
    highlights: ['Pâte reposée 48h', 'Produits locaux', 'Photo contrôle qualité'],
    icon: ChefHat,
    accent: 'border-orange-200 text-orange-600',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    id: 3,
    title: 'Livraison suivie',
    description:
      'Recevez les alertes clés, suivez le livreur sur la carte et récupérez votre commande bien chaude.',
    highlights: ['Notification en direct', 'Livreurs internes', 'Moins de 30 minutes'],
    icon: Truck,
    accent: 'border-emerald-200 text-emerald-600',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    id: 4,
    title: 'Savourez et gagnez',
    description:
      'Dégustez puis partagez votre expérience, cumulez des points et profitez de surprises fidélité.',
    highlights: ['Programme Pizza King', 'Support 7j/7', 'Offres personnalisées'],
    icon: HeartHandshake,
    accent: 'border-purple-200 text-purple-600',
    gradient: 'from-purple-500 to-pink-500',
  },
];

export default function HowItWorks() {
  const mobileSteps = useMemo(() => STEPS.map(step => ({ ...step })), []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-white py-16 sm:py-20 lg:py-28">
      <div className="absolute inset-x-0 top-10 mx-auto h-72 w-[90%] max-w-4xl rounded-full bg-gradient-to-r from-orange-200/60 via-rose-200/50 to-purple-200/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-600 sm:text-xs lg:px-5 lg:py-2.5 lg:text-sm">
            <Clock3 className="h-4 w-4 lg:h-5 lg:w-5" />
            <span>Processus simple et rapide</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">
            Comment fonctionne Pizza King
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base lg:text-lg lg:mt-4">
            De la sélection à la dégustation, tout est pensé pour un parcours fluide sur tous vos appareils.
          </p>
        </motion.div>

        <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 lg:hidden">
          {mobileSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="min-w-[85%] snap-center rounded-3xl border border-white/70 bg-white p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${step.accent}`}>
                    Étape {step.id.toString().padStart(2, '0')}
                  </span>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.description}</p>
                  <ul className="space-y-2">
                    {step.highlights.map(highlight => (
                      <li key={highlight} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-12 hidden gap-6 lg:grid lg:grid-cols-4 lg:gap-8 lg:mt-16">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-3xl border border-white/60 bg-white p-7 shadow-lg transition-transform hover:-translate-y-2 hover:shadow-xl lg:p-8"
              >
                <span className="absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-orange-200 to-transparent lg:block" />
                {index < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-orange-400/70 lg:block lg:h-7 lg:w-7" />
                )}

                <div className="flex items-center justify-between">
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${step.accent} lg:px-4 lg:py-1.5 lg:text-xs`}>
                    Étape {step.id.toString().padStart(2, '0')}
                  </span>
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} text-white shadow-lg lg:h-14 lg:w-14`}>
                    <Icon className="h-6 w-6 lg:h-7 lg:w-7" />
                  </span>
                </div>

                <div className="mt-7 space-y-3 lg:mt-8 lg:space-y-4">
                  <h3 className="text-xl font-semibold text-slate-900 lg:text-2xl">{step.title}</h3>
                  <p className="text-sm text-slate-600 lg:text-base lg:leading-relaxed">{step.description}</p>
                  <ul className="space-y-2.5 lg:space-y-3">
                    {step.highlights.map(highlight => (
                      <li key={highlight} className="flex items-start gap-2 text-sm text-slate-600 lg:text-base">
                        <Check className="mt-0.5 h-4 w-4 text-emerald-500 lg:h-5 lg:w-5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-orange-100 bg-white px-6 py-8 text-center shadow-lg lg:flex-row lg:justify-between lg:text-left lg:mt-16 lg:px-8 lg:py-10"
        >
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-orange-600 lg:text-base">
            <MapPin className="h-5 w-5 text-orange-500 lg:h-6 lg:w-6" />
            <span>Plus de 50 000 livraisons réussies</span>
          </div>
          <p className="text-sm text-slate-600 sm:text-base lg:max-w-2xl lg:text-lg">
            Le parcours a été pensé avec nos clients : interface adaptée mobile, notifications claires et service client humain qui réagit sous 2 minutes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
