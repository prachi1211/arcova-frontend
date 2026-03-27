import { motion } from 'motion/react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const destinations = [
  {
    name: 'Santorini',
    country: 'Greece',
    price: 'From $189/night',
    tag: 'Trending',
    search: 'Santorini',
    image:
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Maldives',
    country: 'Indian Ocean',
    price: 'From $320/night',
    tag: 'Luxury',
    search: 'Maldives',
    image:
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    price: 'From $130/night',
    tag: 'Cultural',
    search: 'Kyoto',
    image:
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Marrakech',
    country: 'Morocco',
    price: 'From $95/night',
    tag: 'Exotic',
    search: 'Marrakech',
    image:
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
  },
];

export function Destinations() {
  const navigate = useNavigate();

  return (
    /* surface — base floor level, sits between surface-low sections */
    <section id="destinations" className="relative py-24 md:py-36 bg-[#0e1322] overflow-hidden">
      {/* Section identity: top hairline + centred bottom warmth */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[1px] bg-gradient-to-r from-transparent via-gold-500/[0.10] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gold-500/[0.03] rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 md:mb-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-12 h-px bg-gold-500/60" />
            <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-[0.25em]">
              Curated Destinations
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-[#e3e3db] leading-[1.05] tracking-tight">
              Destinations Worth
              <br />
              the <span className="italic text-gold-400">Journey.</span>
            </h2>
            <div className="flex flex-col items-start md:items-end gap-4">
              <p className="text-base md:text-lg text-[#e3e3db]/50 max-w-md leading-relaxed md:text-right">
                Explore our handpicked collection of premium properties. Click any destination to
                browse available stays.
              </p>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gold-400 hover:text-gold-300 transition-colors group"
              >
                View all destinations
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 4-card grid — no box-shadows that use pure black */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {destinations.map((dest, index) => (
            <motion.button
              key={dest.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
              onClick={() => navigate(`/search?destination=${encodeURIComponent(dest.search)}`)}
              className="group relative rounded-[2rem] overflow-hidden aspect-[3/4] cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-left w-full"
            >
              {/* Image */}
              <img
                src={dest.image}
                alt={`${dest.name}, ${dest.country}`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1322]/85 via-[#0e1322]/25 to-transparent" />
              {/* Subtle gold tint on hover */}
              <div className="absolute inset-0 bg-gold-500/0 group-hover:bg-gold-500/[0.04] transition-colors duration-500" />

              {/* Tag — glass chip, no hard white */}
              <div className="absolute top-4 left-4">
                <span className="inline-block px-3 py-1 rounded-full bg-[#25293a]/70 backdrop-blur-sm text-[10px] font-bold text-[#e3e3db]/85 uppercase tracking-wider border border-white/[0.08]">
                  {dest.tag}
                </span>
              </div>

              {/* Hover arrow — glass circle */}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#25293a]/0 group-hover:bg-[#25293a]/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 border border-white/[0.1]">
                <ArrowUpRight size={16} className="text-gold-400" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <h3 className="font-heading text-2xl font-semibold text-[#e3e3db] tracking-tight mb-0.5">
                  {dest.name}
                </h3>
                <p className="text-[13px] text-[#e3e3db]/55 mb-1.5">{dest.country}</p>
                <p className="text-[13px] font-semibold text-gold-400">{dest.price}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Arc · Cova tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-16 md:mt-20 text-center"
        >
          <p className="text-sm text-[#e3e3db]/30 tracking-wide">
            <span className="font-heading text-lg italic text-[#e3e3db]/45">Arc</span>
            <span className="mx-2 text-[#e3e3db]/20">&middot;</span>
            the journey
            <span className="mx-3 text-gold-500/60">—</span>
            <span className="font-heading text-lg italic text-[#e3e3db]/45">Cova</span>
            <span className="mx-2 text-[#e3e3db]/20">&middot;</span>
            the destination
          </p>
        </motion.div>
      </div>
    </section>
  );
}
