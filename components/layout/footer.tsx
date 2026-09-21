import { Compass, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const columns = [
  {
    title: 'Découvrir',
    links: [
      { label: 'Séjours', href: '#sejours' },
      { label: 'Expériences', href: '#experiences' },
      { label: 'Restaurants', href: '#restaurants' },
      { label: 'Services', href: '#services' },
    ],
  },
  {
    title: 'KribiLand',
    links: [
      { label: 'À propos', href: '#' },
      { label: 'Notre vision', href: '#' },
      { label: 'Devenir hôte', href: '/devenir-hote' },
      { label: 'Devenir prestataire', href: '/devenir-prestataire' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Aide',
    links: [
      { label: 'FAQ', href: '#' },
      { label: 'Conditions', href: '#' },
      { label: 'Confidentialité', href: '#' },
    ],
  },
];

const socials = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'Youtube' },
];

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main */}
        <div className="grid grid-cols-2 gap-8 py-16 sm:grid-cols-3 lg:grid-cols-5 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <a href="#home" className="inline-block rounded-2xl bg-white px-4 py-2.5 shadow-md border border-white/20 transition-transform hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/kribiland_logo_transparent.png"
                alt="KribiLand Logo"
                className="h-10 w-auto object-contain"
              />
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Votre porte d'entrée digitale vers Kribi. Découvrez, séjournez et
              vivez la destination autrement.
            </p>
            {/* Socials */}
            <div className="mt-6 flex items-center gap-3">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-sun hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-golden"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6">
          <p className="text-center text-xs text-white/50">
            © 2026 KribiLand. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
