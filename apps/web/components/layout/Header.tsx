'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCart,
  UserRound,
  Menu as MenuIcon,
  Phone,
  MapPin,
  X,
  ChevronDown,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import Logo from '@/components/ui/Logo';
import {
  useState,
  useEffect,
  forwardRef,
  type ComponentPropsWithoutRef,
} from 'react';
import type { LinkProps } from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@pizza-king/shared';
import NavAccountMenu from './NavAccountMenu';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/menu', label: 'Menu' },
  { href: '/offres', label: 'Offres & Promotions' },
  { href: '/fidelisation', label: 'Fidélisation' },
  { href: '/about', label: 'À Propos' },
  { href: '/support', label: 'Support' },
];

// Type-safe MotionLink component with proper types
type MotionLinkProps = Omit<
  ComponentPropsWithoutRef<'a'>,
  keyof MotionProps | 'href'
> &
  Partial<LinkProps> &
  MotionProps & {
    children?: React.ReactNode;
  };

const MotionLink = forwardRef<HTMLAnchorElement, MotionLinkProps>(
  function MotionLink(props, ref) {
    const {
      whileHover,
      whileTap,
      initial,
      animate,
      exit,
      transition,
      children,
      href,
      style,
      ...rest
    } = props;

    // Pull out Next Link-specific props so they don't get passed to the <a> element
    const {
      replace,
      scroll,
      shallow,
      prefetch,
      locale,
      // include any other Link props you use explicitly here
      ...possibleAnchorProps
    } = rest as Partial<LinkProps> & Record<string, unknown>;

    // Build props for motion wrapper and anchor separately to avoid incompatible event handler types
    const motionWrapperProps = {
      whileHover,
      whileTap,
      initial,
      animate,
      exit,
      transition,
      style: { display: 'inline-block', ...style } as React.CSSProperties,
    };

    const anchorProps = possibleAnchorProps as ComponentPropsWithoutRef<'a'>;

    return (
      <motion.div
        whileHover={motionWrapperProps.whileHover}
        whileTap={motionWrapperProps.whileTap}
        initial={motionWrapperProps.initial}
        animate={motionWrapperProps.animate}
        exit={motionWrapperProps.exit}
        transition={motionWrapperProps.transition}
        style={motionWrapperProps.style}
      >
        <Link {...({ href } as LinkProps)} legacyBehavior>
          <a ref={ref} {...anchorProps}>
            {children}
          </a>
        </Link>
      </motion.div>
    );
  }
);

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount, openCart } = useCart();
  const { user, firebaseUser, loading: authLoading, signOut } = useAuth();
  const pathname = usePathname();

  // Detect scroll for header shadow effect with throttling
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleNavClick = () => setMobileMenuOpen(false);

  const renderNavLinks = (isMobile = false) =>
    NAV_LINKS.map(({ href, label }) => {
      const isActive = pathname === href;

      if (isMobile) {
        return (
          <MotionLink
            key={href}
            href={href}
            onClick={handleNavClick}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'group relative flex items-center justify-between rounded-2xl px-5 py-4 text-base font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:py-5',
              isActive
                ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-600 shadow-[0_10px_30px_-18px_rgba(220,38,38,0.55)]'
                : 'text-gray-700 hover:bg-gray-50'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="flex items-center gap-3">
              {isActive && (
                <motion.span
                  layoutId="mobile-active-indicator"
                  className="h-2 w-2 rounded-full bg-red-600"
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                'h-4 w-4 transition-all duration-200',
                isActive
                  ? 'rotate-[-90deg] text-red-500 opacity-100'
                  : 'translate-x-1 text-gray-400 opacity-0'
              )}
            />
          </MotionLink>
        );
      }

      return (
        <MotionLink
          key={href}
          href={href}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'group relative isolate inline-flex items-center rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-300 focus-visible:bg-red-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white xl:px-5 xl:py-3 xl:text-base',
            isActive ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
          )}
          aria-current={isActive ? 'page' : undefined}
        >
          <span className="relative z-10">{label}</span>
          {isActive && (
            <motion.span
              layoutId="desktop-active-underline"
              className="pointer-events-none absolute inset-x-3 bottom-0.5 h-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 lg:inset-x-4"
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            />
          )}
        </MotionLink>
      );
    });

  return (
    <>
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="container relative z-10 px-4 py-2.5 sm:px-6 lg:py-3">
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
            {/* Left Section */}
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <div className="flex items-center gap-2 text-xs text-white/90 sm:hidden">
                <Clock className="h-4 w-4" />
                <div className="flex flex-col leading-tight">
                  <span className="font-medium">
                    Livraison express à Bangui
                  </span>
                  <span className="font-medium">
                    en 30 min ou c&apos;est gratuit
                  </span>
                </div>
              </div>

              <motion.a
                href="tel:+23672134848"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm transition-all hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-red-600 sm:w-auto sm:justify-start sm:px-4 sm:py-2 sm:text-sm"
              >
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="xs:inline hidden">+236 72 13 48 48</span>
                <span className="xs:hidden">Appeler</span>
              </motion.a>

              <div className="hidden items-center gap-2 text-xs text-white/90 sm:inline-flex md:hidden">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Livraison en 30 min</span>
              </div>

              <div className="hidden items-center gap-2 text-xs text-white/90 md:inline-flex lg:text-sm">
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                  Livraison à Bangui en 30 min
                </span>
              </div>

              <div className="hidden items-center gap-2 text-xs text-white/90 lg:inline-flex">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">
                  Zone de livraison disponible
                </span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="hidden items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm sm:inline-flex lg:text-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                <span>-20% sur votre 1ère commande</span>
              </motion.div>

              <Link href="/offres" className="hidden sm:block">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm transition-all hover:border-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-red-600"
                >
                  Voir les offres
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-50 border-b bg-white transition-shadow duration-200',
          isScrolled
            ? 'border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.08)]'
            : 'border-gray-100 shadow-none'
        )}
      >
        <div className="container px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-3 sm:py-4 lg:py-5">
            {/* Left: Menu Button + Logo */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Mobile Menu Toggle */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-11 w-11 rounded-xl border-2 transition-all duration-300 sm:h-12 sm:w-12',
                    mobileMenuOpen
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600'
                  )}
                  onClick={() => setMobileMenuOpen(prev => !prev)}
                  aria-label="Menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <AnimatePresence mode="wait">
                    {mobileMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="h-5 w-5 sm:h-6 sm:w-6" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              {/* Logo */}
              <div className="flex-shrink-0">
                <Logo />
              </div>
            </div>

            {/* Center: Desktop Navigation */}
            <nav
              aria-label="Navigation principale"
              className="hidden flex-1 flex-wrap items-center justify-center gap-1.5 lg:flex xl:gap-2.5"
            >
              {renderNavLinks()}
            </nav>

            {/* Right: Cart + User */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cart Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-11 w-11 rounded-xl border-2 border-gray-200 bg-white text-gray-700 transition-all duration-300 hover:border-red-300 hover:bg-red-50 hover:text-red-600 sm:h-12 sm:w-12"
                  onClick={openCart}
                  aria-label="Panier"
                >
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-orange-600 text-xs font-bold text-white shadow-lg ring-2 ring-white"
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </Button>
              </motion.div>

              {/* User Account */}
              {authLoading ? (
                <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-100 sm:h-12 sm:w-12" />
              ) : user ? (
                <NavAccountMenu
                  user={user}
                  photoURL={firebaseUser?.photoURL ?? null}
                  email={firebaseUser?.email ?? user.email}
                  onSignOut={signOut}
                />
              ) : (
                <Link href="/auth/login">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 rounded-xl border-2 border-gray-200 bg-white p-2 text-gray-700 transition-all duration-300 hover:border-red-300 hover:bg-red-50 sm:h-12 sm:w-12"
                    >
                      <Image
                        src="/connexion.png"
                        alt="Connexion"
                        width={24}
                        height={24}
                        className="h-full w-full object-contain"
                      />
                    </Button>
                  </motion.div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="border-t border-gray-200 bg-white lg:hidden"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.3 }}
                className="container px-4 pb-6 pt-4 sm:px-6"
              >
                <nav
                  aria-label="Navigation principale mobile"
                  className="flex flex-col gap-2"
                >
                  {renderNavLinks(true)}
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
