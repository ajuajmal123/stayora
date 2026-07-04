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
        { name: "Resort Booking", href: "#" },
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
            <Link href="https://www.instagram.com/stayo_ra?igsh=MTJvdG10NGJ6c2Q2bQ==" className="hover:text-gold transition-colors" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </Link>
            <Link href="https://wa.me/918590120810" className="hover:text-gold transition-colors" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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
        <p>© {new Date().getFullYear()} StayoraS. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="#" className="hover:text-gold transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-gold transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
