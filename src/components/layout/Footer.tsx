"use client";

import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  const footerLinks = [
    {
      title: "Explore",
      links: [
        { name: "Private Villas", href: "#" },
        { name: "Penthouses", href: "#" },
        { name: "Curated Resorts", href: "#" },
        { name: "Destinations", href: "#" },
      ],
    },
    {
      title: "Services",
      links: [
        { name: "Chauffeur Services", href: "#" },
        { name: "Private Jet Booking", href: "#" },
        { name: "Concierge 24/7", href: "#" },
        { name: "Exclusive Events", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "Our Story", href: "/about" },
        { name: "Partner With Us", href: "#" },
        { name: "Press & Media", href: "#" },
        { name: "Careers", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-emerald-deep text-luxury-cream border-t border-gold/15 pt-10 pb-6 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
        
        {/* Brand description */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Link href="/" className="flex items-center group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/image.png" alt="Stayora Logo" className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-102" />
          </Link>
          <p className="text-xs text-luxury-cream/60 leading-relaxed max-w-sm">
            Stayora redefines the art of travel. We connect discerning travelers with the world’s most exquisite, private properties and bespoke experiences, crafted for absolute comfort.
          </p>
          <div className="flex items-center gap-4 text-gold-subtle">
            <Link href="#" className="hover:text-gold transition-colors" aria-label="Instagram">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </Link>
            <Link href="#" className="hover:text-gold transition-colors" aria-label="Facebook">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </Link>
            <Link href="#" className="hover:text-gold transition-colors" aria-label="Twitter">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Link Columns */}
        {footerLinks.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <h4 className="text-[10px] uppercase tracking-widest text-gold font-bold">{column.title}</h4>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-luxury-cream/60 hover:text-gold transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-gold/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-luxury-cream/40">
        <p>© {new Date().getFullYear()} Stayora Enterprises. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="#" className="hover:text-gold transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-gold transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
