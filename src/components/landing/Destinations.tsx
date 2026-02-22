import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const destinations = [
  {
    name: 'Santorini',
    country: 'Greece',
    price: 'From $189/night',
    tag: 'Trending',
    image:
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    price: 'From $120/night',
    tag: 'Popular',
    image:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Swiss Alps',
    country: 'Switzerland',
    price: 'From $340/night',
    tag: 'Luxury',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    price: 'From $210/night',
    tag: 'Cultural',
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
  },
];

export function Destinations() {
  return (
    <section id="destinations" className="py-24 md:py-32 bg-warm-50">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 md:mb-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-12 h-px bg-gold-500" />
            <span className="text-[11px] font-semibold text-gold-600 uppercase tracking-[0.25em]">
              Curated Destinations
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-navy-950 leading-[1.05] tracking-tight">
              Destinations Worth
              <br />
              the <span className="italic text-gold-500">Journey.</span>
            </h2>
            <p className="text-base md:text-lg text-warm-600 max-w-md leading-relaxed md:text-right">
              Every great arc deserves an extraordinary cova. Browse our curated collection of
              premium properties worldwide.
            </p>
          </div>
        </motion.div>

        {/* Destination grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {destinations.map((dest, index) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                delay: index * 0.1,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -8 }}
              className="group relative rounded-2xl md:rounded-3xl overflow-hidden aspect-[3/4] cursor-pointer shadow-lg shadow-navy-950/[0.04]"
            >
              {/* Image with zoom */}
              <img
                src={dest.image}
                alt={`${dest.name}, ${dest.country}`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent" />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gold-500/0 group-hover:bg-gold-500/[0.06] transition-colors duration-500" />

              {/* Tag */}
              <div className="absolute top-5 left-5">
                <span className="inline-block px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-navy-950 uppercase tracking-wider">
                  {dest.tag}
                </span>
              </div>

              {/* Arrow on hover */}
              <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                <ArrowUpRight size={16} className="text-navy-950" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <h3 className="font-heading text-2xl font-semibold text-white tracking-tight mb-0.5">
                  {dest.name}
                </h3>
                <p className="text-[13px] text-warm-300 mb-2">{dest.country}</p>
                <p className="text-[13px] font-semibold text-gold-400">{dest.price}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand micro-note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-16 md:mt-20 text-center"
        >
          <p className="text-sm text-warm-400 tracking-wide">
            <span className="font-heading text-lg italic text-warm-500">Arc</span>
            <span className="mx-2 text-warm-300">&middot;</span>
            the journey
            <span className="mx-3 text-gold-500">—</span>
            <span className="font-heading text-lg italic text-warm-500">Cova</span>
            <span className="mx-2 text-warm-300">&middot;</span>
            the destination
          </p>
        </motion.div>
      </div>
    </section>
  );
}
