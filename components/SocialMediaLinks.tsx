// File: components/SocialMediaLinks.jsx

import React from "react";
// Pastikan import icon sesuai dengan library yang Anda pakai (contoh: lucide-react, react-icons, dll)
import { Instagram, Facebook, Youtube } from "lucide-react";

const SocialMediaLinks = () => {
  const socialLinks = [
    {
      icon: Instagram,
      color: "hover:bg-pink-600",
      href: "https://www.instagram.com/disdik_banjarmasin?igsh=ank2bWR4anA3Y2tt",
    },
    {
      icon: Facebook,
      color: "hover:bg-brand-primary",
      href: "https://www.facebook.com/share/1BSEjYXn2p/",
    },
    {
      icon: Youtube,
      color: "hover:bg-red-600",
      href: "https://youtube.com/@dinaspendidikankotabanjarm5448?si=bzyM0JXPoW0asGaR",
    },
  ];

  return (
    <div className="flex space-x-4">
      {socialLinks.map((social, index) => {
        const Icon = social.icon;
        return (
          <a
            key={index}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            className={`w-10 h-10 bg-brand-footer rounded-lg flex items-center justify-center ${social.color} transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 text-white`}
            aria-label={`Kunjungi kami di ${social.href}`} // Bagus untuk aksesibilitas
          >
            <Icon className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
};

export default SocialMediaLinks;
