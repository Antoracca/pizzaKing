import Link from 'next/link';
import {
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Mail,
  MapPin,
  Clock,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

const menuLinks = [
  { label: 'Toutes les pizzas', href: '/menu' },
  { label: 'Pizzas signatures', href: '/menu?category=signatures' },
  { label: 'Pizzas classiques', href: '/menu?category=classiques' },
  { label: 'Pizzas végétariennes', href: '/menu?category=vegetariennes' },
  { label: 'Viandes & poulet', href: '/menu?category=viandes' },
  { label: 'Fromages', href: '/menu?category=fromages' },
  { label: 'Offres & promotions', href: '/offres' },
] as const;

const companyLinks = [
  { label: 'À propos', href: '/about' },
  { label: 'Carrières', href: '/careers' },
  { label: 'Franchise', href: '/franchise' },
  { label: 'Support & assistance', href: '/support' },
] as const;

const legalLinks = [
  { label: 'Politique de confidentialité', href: '/privacy' },
  { label: "Conditions d'utilisation", href: '/terms' },
] as const;

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com/pizzaking', icon: Facebook },
  { label: 'Instagram', href: 'https://instagram.com/pizzaking', icon: Instagram },
  { label: 'Twitter', href: 'https://twitter.com/pizzaking', icon: Twitter },
] as const;

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-12">
          {/* Brand + quick info */}
          <section className="flex flex-col gap-6 rounded-3xl bg-slate-900/80 p-6 ring-1 ring-white/5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex flex-col gap-4 sm:max-w-lg">
              <Logo variant="white" />
              <p className="text-sm text-slate-300 sm:text-base">
                Pizza King prépare vos recettes favorites avec des ingrédients sourcés localement,
                cuits au four à pierre et livrés chauds en moins de 30 minutes dans tout Bangui.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 sm:text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                  <Clock className="h-4 w-4 text-orange-400" />
                  7j/7 • 11h00 – 23h00
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                  Livraison gratuite à partir de 20 000 FCFA
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
              <span className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Rejoignez-nous
              </span>
              <div className="flex gap-3">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition-colors hover:bg-orange-500 hover:text-white"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* Navigation + contact */}
          <section className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr]">
            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">
                Accès rapide
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[menuLinks.slice(0, 3), menuLinks.slice(3, 6), menuLinks.slice(6)].map(
                  (group, index) => (
                    <ul key={index} className="space-y-3 text-sm">
                      {group.map(link => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="text-slate-400 transition-colors hover:text-orange-400"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">
                L'entreprise
              </h3>
              <ul className="space-y-3 text-sm">
                {companyLinks.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 transition-colors hover:text-orange-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">
                Support
              </h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-orange-400" />
                  <span>
                    Avenue de l'Indépendance, en face de l'Alliance Française
                    <br />
                    Bangui, République Centrafricaine
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-1 h-5 w-5 flex-shrink-0 text-orange-400" />
                  <div className="flex flex-col">
                    <a
                      href="tel:+23672134848"
                      className="transition-colors hover:text-orange-400"
                    >
                      +236 72 13 48 48
                    </a>
                    <a
                      href="tel:+23675134848"
                      className="transition-colors hover:text-orange-400"
                    >
                      +236 75 13 48 48
                    </a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 flex-shrink-0 text-orange-400" />
                  <a
                    href="mailto:support@pizzaking.com"
                    className="transition-colors hover:text-orange-400"
                  >
                    support@pizzaking.com
                  </a>
                </li>
              </ul>
            </div>
          </section>

          {/* Bottom bar */}
          <section className="flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500 sm:text-sm">
              © 2025 Pizza King. Tous droits réservés.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 sm:text-sm">
              {legalLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-orange-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </footer>
  );
}
