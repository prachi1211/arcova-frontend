import { Link } from 'react-router-dom';

const footerSections = [
  {
    title: 'Platform',
    links: [
      { label: 'Start Exploring', href: '/search' },
      { label: 'For Travellers', href: '/auth/signup' },
      { label: 'For Hosts', href: '/auth/signup' },
      { label: 'AI Concierge', href: '/auth/signup' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our Story', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    /* surface — base floor, continuous with CTA — no border line needed */
    <footer className="bg-[#0e1322] pt-16 md:pt-24 pb-8 md:pb-12 relative overflow-hidden">
      {/* Very subtle ambient glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-gold-500/[0.15] to-transparent" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-16 mb-16 md:mb-24">

          {/* Brand — 4 cols */}
          <div className="col-span-2 md:col-span-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 mb-8 group cursor-pointer"
            >
              {/* Logo mark — surface-high on surface base */}
              <div className="w-10 h-10 bg-[#25293a] flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-6">
                <span className="text-gold-400 font-heading text-xl font-bold">A</span>
              </div>
              <span className="font-heading text-xl font-bold text-[#e3e3db] tracking-tight">
                ARCOVA
              </span>
            </button>
            <p className="text-[#e3e3db]/45 text-[15px] leading-relaxed mb-8 max-w-xs">
              Where every arc of your journey finds its perfect cova — your destination,
              reimagined through AI.
            </p>
            <div className="flex gap-5">
              {['Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#e3e3db]/40 hover:text-gold-400 transition-colors duration-200"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns — 2 cols each */}
          {footerSections.map((section) => (
            <div key={section.title} className="md:col-span-2">
              <h4 className="font-heading text-lg font-semibold mb-6 tracking-tight text-[#e3e3db]/80">
                {section.title}
              </h4>
              <ul className="space-y-3.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-sm text-[#e3e3db]/40 hover:text-gold-400 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-[#e3e3db]/40 hover:text-gold-400 transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter — 4 cols */}
          <div className="col-span-2 md:col-span-4">
            <h4 className="font-heading text-lg font-semibold mb-6 tracking-tight text-[#e3e3db]/80">
              Newsletter
            </h4>
            <p className="text-sm text-[#e3e3db]/40 mb-5 leading-relaxed">
              Curated travel insights, new destinations, and platform updates — delivered monthly.
            </p>
            <div className="flex gap-2">
              {/* Recessed input — surface-high on surface base */}
              <input
                type="email"
                placeholder="Email address"
                className="flex-grow h-11 px-5 rounded-full bg-[#25293a] border border-white/[0.06] focus:border-gold-500/30 focus:outline-none focus:ring-1 focus:ring-gold-500/20 text-sm text-[#e3e3db] placeholder:text-[#e3e3db]/30 transition-colors duration-200"
              />
              {/* Gold gradient submit */}
              <button
                className="h-11 px-6 rounded-full text-[13px] font-semibold text-navy-950 hover:opacity-90 active:opacity-80 transition-all duration-200 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #eec068 0%, #9c7625 100%)' }}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar — tonal separator via spacing only */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#e3e3db]/25">
          <p>&copy; {new Date().getFullYear()} Arcova. All rights reserved.</p>
          <div className="flex gap-8 md:gap-10">
            <a href="#" className="hover:text-[#e3e3db]/60 transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-[#e3e3db]/60 transition-colors duration-200">Terms of Service</a>
            <a href="#" className="hover:text-[#e3e3db]/60 transition-colors duration-200">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
