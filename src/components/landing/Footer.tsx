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
    <footer className="bg-white text-navy-950 pt-16 md:pt-24 pb-8 md:pb-12 border-t border-warm-200">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-16 mb-16 md:mb-24">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 mb-8 group cursor-pointer"
            >
              <div className="w-10 h-10 bg-navy-950 flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-6">
                <span className="text-gold-500 font-heading text-xl font-bold">A</span>
              </div>
              <span className="font-heading text-xl font-bold text-navy-950 tracking-tight">
                ARCOVA
              </span>
            </button>
            <p className="text-warm-500 text-[15px] leading-relaxed mb-8 max-w-xs">
              Where every arc of your journey finds its perfect cova — your destination,
              reimagined through AI.
            </p>
            <div className="flex gap-5">
              {['Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-[12px] font-semibold uppercase tracking-[0.12em] text-navy-950 hover:text-gold-600 transition-colors duration-200"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="md:col-span-2">
              <h4 className="font-heading text-lg font-semibold mb-6 tracking-tight">
                {section.title}
              </h4>
              <ul className="space-y-3.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="text-sm text-warm-500 hover:text-gold-600 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-warm-500 hover:text-gold-600 transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-4">
            <h4 className="font-heading text-lg font-semibold mb-6 tracking-tight">Newsletter</h4>
            <p className="text-sm text-warm-500 mb-5 leading-relaxed">
              Curated travel insights, new destinations, and platform updates — delivered monthly.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="flex-grow h-11 px-5 rounded-full bg-warm-100 border border-warm-200 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none text-sm text-navy-950 placeholder:text-warm-400 transition-colors duration-200"
              />
              <button className="h-11 px-6 rounded-full bg-gold-500 text-[13px] font-semibold text-navy-950 hover:bg-gold-400 active:bg-gold-600 transition-colors duration-200 whitespace-nowrap">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-warm-200 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.15em] text-warm-400">
          <p>&copy; {new Date().getFullYear()} Arcova. All rights reserved.</p>
          <div className="flex gap-8 md:gap-10">
            <a href="#" className="hover:text-navy-950 transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-navy-950 transition-colors duration-200">Terms of Service</a>
            <a href="#" className="hover:text-navy-950 transition-colors duration-200">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
