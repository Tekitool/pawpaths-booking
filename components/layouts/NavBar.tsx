// app/(homepage)/components/sections/NavBar.tsx

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useScrolled, useScrollDirection } from '@/app/(homepage)/hooks/useScrollAnimation';

/* ──────────────────────────────────────────────────────────────────────────
   NAV CONFIGURATION
   ────────────────────────────────────────────────────────────────────────── */

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Products', href: '/products' },
  { label: 'Tools', href: '/tools' },
  { label: 'Contact', href: '/contact' },
];

const CTA = { label: 'Get a Quote Now', href: '/enquiry' } as const;

/* ──────────────────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
   ────────────────────────────────────────────────────────────────────────── */

const mobileMenuVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
  open: {
    opacity: 1,
    height: 'auto' as const,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const mobileItemVariants = {
  closed: { opacity: 0, x: -16 },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.05 * i, duration: 0.3 },
  }),
};

/* ──────────────────────────────────────────────────────────────────────────
   NAVBAR COMPONENT
   ────────────────────────────────────────────────────────────────────────── */

export default function NavBar() {
  const scrolled = useScrolled(20);
  const scrollDir = useScrollDirection(8);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Hide when scrolling down (and not at top), show when scrolling up or at top
  const hidden = scrollDir === 'down' && scrolled && !mobileOpen;

  return (
    <>
      <motion.header
        animate={{ y: hidden ? '-110%' : '0%' }}
        transition={{
          type: 'spring' as const,
          stiffness: 260,
          damping: 30,
        }}
        className="sticky top-0 z-50 flex justify-center px-4 py-3"
        role="banner"
      >
        {/* ── Floating pill container ─────────────────────────────────── */}
        <motion.nav
          aria-label="Main navigation"
          initial={false}
          animate={{
            backgroundColor: scrolled
              ? 'rgba(255, 255, 255, 0.92)'
              : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
            boxShadow: scrolled
              ? '0 4px 30px rgba(77, 42, 0, 0.08)'
              : '0 2px 12px rgba(77, 42, 0, 0.04)',
          }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-6xl rounded-2xl border border-brand-brown/5 px-4 sm:px-6"
        >
          {/* ── Desktop row ───────────────────────────────────────────── */}
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0"
              aria-label="Pawpaths — home"
            >
              <Image
                src="/pplogo.svg"
                alt="Pawpaths logo"
                width={160}
                height={40}
                priority
              />
            </Link>

            {/* Desktop links */}
            <ul className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="
                      relative px-4 py-2 text-sm font-medium text-brand-taupe
                      rounded-lg
                      transition-colors duration-200
                      hover:text-brand-brown hover:bg-brand-cream/40
                      focus-visible:outline-2 focus-visible:outline-offset-2
                      focus-visible:outline-brand-amber
                    "
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop CTA + Mobile toggle */}
            <div className="flex items-center gap-3">
              <Link
                href={CTA.href}
                className="
                  hidden lg:inline-flex items-center
                  rounded-xl px-5 py-2.5
                  text-sm font-semibold text-white
                  bg-brand-brown
                  shadow-soft
                  transition-all duration-200
                  hover:bg-brand-brown-light hover:shadow-medium
                  active:scale-[0.97]
                  focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-brand-amber
                "
              >
                {CTA.label}
              </Link>

              {/* Mobile hamburger */}
              <button
                type="button"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="
                  lg:hidden flex items-center justify-center
                  w-10 h-10 rounded-lg
                  text-brand-brown
                  transition-colors duration-200
                  hover:bg-brand-cream/50
                  focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-brand-amber
                "
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={22} strokeWidth={2.5} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={22} strokeWidth={2.5} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* ── Mobile menu panel ─────────────────────────────────────── */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                id="mobile-menu"
                role="menu"
                variants={mobileMenuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="lg:hidden overflow-hidden border-t border-brand-brown/5"
              >
                <ul className="flex flex-col gap-1 py-4">
                  {NAV_ITEMS.map((item, i) => (
                    <motion.li
                      key={item.label}
                      custom={i}
                      variants={mobileItemVariants}
                      initial="closed"
                      animate="open"
                      role="menuitem"
                    >
                      <Link
                        href={item.href}
                        onClick={closeMobile}
                        className="
                          flex items-center px-4 py-3
                          text-base font-medium text-brand-taupe
                          rounded-xl
                          transition-colors duration-200
                          hover:text-brand-brown hover:bg-brand-cream/40
                          active:bg-brand-cream/60
                        "
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                {/* Mobile CTA */}
                <div className="pb-4 px-4">
                  <Link
                    href={CTA.href}
                    onClick={closeMobile}
                    className="
                      flex items-center justify-center w-full
                      rounded-xl px-5 py-3
                      text-base font-semibold text-white
                      bg-brand-brown
                      shadow-soft
                      transition-all duration-200
                      hover:bg-brand-brown-light hover:shadow-medium
                      active:scale-[0.97]
                    "
                  >
                    {CTA.label}
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </motion.header>

      {/* ── JSON-LD Organization Schema ─────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SiteNavigationElement',
            name: NAV_ITEMS.map((item) => item.label),
            url: NAV_ITEMS.map(
              (item) => `https://pawpathsae.com${item.href}`
            ),
          }),
        }}
      />
    </>
  );
}
