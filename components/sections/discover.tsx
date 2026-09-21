import { Reveal } from '@/components/shared/reveal';
import { Play } from 'lucide-react';

const galleryItems = [
  {
    type: 'video',
    src: '/images/backgrounds/1.mp4',
    alt: 'Logements haut standing à Kribi',
    label: 'Logements haut standing',
    span: 'col-span-2 row-span-2',
  },
  {
    type: 'video',
    src: '/images/backgrounds/2.mp4',
    alt: 'Faire du jet-ski sur la plage à Kribi',
    label: 'Faire du jet‑ski sur la plage',
    span: '',
  },
  {
    type: 'video',
    src: '/images/backgrounds/3.mp4',
    alt: 'Bouée gonflable sur la mer',
    label: 'Bouée gonflable sur la mer',
    span: '',
  },
  {
    type: 'video',
    src: '/images/backgrounds/4.mp4',
    alt: 'Faire du water ball',
    label: 'Faire du water ball',
    span: '',
  },
  {
    type: 'image',
    src: '/images/backgrounds/5.jpeg',
    alt: 'Coucher de soleil sur la mer',
    label: 'Coucher de soleil sur la mer',
    span: '',
  },
];

export function Discover() {
  return (
    <section id="decouvrir" className="bg-warm py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="max-w-3xl">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-sun">
            Découvrir Kribi
          </span>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
            Kribi, bien plus qu'une destination.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-navy/70 sm:text-lg">
            Entre océan, nature, gastronomie et culture, Kribi offre une
            multitude d'expériences. KribiLand vous aide à les découvrir
            simplement.
          </p>
        </Reveal>

        {/* Editorial gallery */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
          {/* Large card (1.mp4) */}
          <Reveal className="group relative col-span-2 row-span-2 overflow-hidden rounded-2xl sm:col-span-2 shadow-xl min-h-[300px] sm:min-h-[480px]">
            <video
              src={galleryItems[0].src}
              autoPlay
              loop
              muted
              playsInline
              className="h-full min-h-[300px] sm:min-h-[480px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white/90 border border-white/20">
              <span className="h-2 w-2 rounded-full bg-sun animate-pulse" />
              <Play className="w-3 h-3 fill-white text-white" />
              Vidéo KribiLand
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="font-display text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                {galleryItems[0].label}
              </span>
            </div>
          </Reveal>

          {/* Small cards (2.mp4, 3.mp4, 4.mp4, 5.jpeg) */}
          {galleryItems.slice(1).map((item, i) => (
            <Reveal
              key={item.label}
              delay={i * 100}
              className="group relative overflow-hidden rounded-2xl shadow-md min-h-[160px] sm:min-h-[235px]"
            >
              {item.type === 'video' ? (
                <video
                  src={item.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full min-h-[160px] sm:min-h-[235px] w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.src}
                  alt={item.alt}
                  className="h-full min-h-[160px] sm:min-h-[235px] w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />
              {item.type === 'video' && (
                <div className="absolute top-3 right-3 rounded-full bg-black/40 backdrop-blur-sm p-1.5 border border-white/20 text-white">
                  <Play className="w-2.5 h-2.5 fill-white text-white" />
                </div>
              )}
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-sm font-semibold text-white leading-tight block drop-shadow-sm">
                  {item.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Stats */}
        <Reveal delay={200} className="mt-12 flex flex-wrap gap-8 sm:gap-16">
          <div>
            <div className="font-display text-3xl font-bold text-navy sm:text-4xl">
              30+
            </div>
            <div className="mt-1 text-sm text-navy/60">Plages à explorer</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-navy sm:text-4xl">
              50+
            </div>
            <div className="mt-1 text-sm text-navy/60">Lieux à découvrir</div>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-navy sm:text-4xl">
              1
            </div>
            <div className="mt-1 text-sm text-navy/60">Destination à vivre</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
