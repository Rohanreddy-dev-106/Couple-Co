import React from "react";
import SEO from "../components/SEO.jsx";
import { Mail, Phone, Camera, Briefcase, MapPin, ArrowUpRight } from "lucide-react";

export default function ContactPage() {
  const contactLinks = [
    {
      title: "Instagram",
      value: "@couplechaos_store",
      href: "https://instagram.com",
      icon: <Camera className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />,
      color: "bg-pink-50 text-pink-500 border-pink-200",
      hover: "hover:bg-pink-500 hover:text-white hover:border-pink-500"
    },
    {
      title: "Email",
      value: "hello@couplechaos.com",
      href: "mailto:hello@couplechaos.com",
      icon: <Mail className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />,
      color: "bg-blue-50 text-blue-500 border-blue-200",
      hover: "hover:bg-blue-500 hover:text-white hover:border-blue-500"
    },
    {
      title: "Phone",
      value: "+91 98765 43210",
      href: "tel:+919876543210",
      icon: <Phone className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />,
      color: "bg-green-50 text-green-500 border-green-200",
      hover: "hover:bg-green-500 hover:text-white hover:border-green-500"
    },
    {
      title: "LinkedIn",
      value: "CoupleChaos",
      href: "https://linkedin.com",
      icon: <Briefcase className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={2.5} />,
      color: "bg-indigo-50 text-indigo-500 border-indigo-200",
      hover: "hover:bg-indigo-500 hover:text-white hover:border-indigo-500"
    }
  ];

  return (
    <>
      <SEO 
        title="Contact Us" 
        description="Get in touch with Couple Chaos. Reach out via email, phone, or Instagram for support and inquiries."
        keywords="contact couple chaos, customer support, couple chaos email" 
      />
      <div className="min-h-[calc(100vh-80px)] bg-[#fbfbf6] px-4 py-12 flex items-center justify-center relative overflow-hidden">
      
      {/* Grid pattern background layer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 hero-gradient-shimmer"></div>
        <div className="absolute inset-0 hero-grid-bg"></div>
        <div className="absolute inset-0 hero-dots-bg opacity-40"></div>
        {/* Fade edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbf6] via-transparent to-[#fbfbf6] opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#fbfbf6] via-transparent to-[#fbfbf6] opacity-30"></div>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden animate-fade-in-up relative z-10">
        
        {/* Header inside the box */}
        <div className="bg-black py-4 px-6 sm:py-5 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase mb-0.5">
              Contact Us
            </h1>
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-xs mx-auto px-4">
              Got a question, feedback, or just want to say hi? Drop us a line.
            </p>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-[#cfff04] opacity-10 rounded-full blur-2xl"></div>
        </div>

        {/* Links List */}
        <div className="p-4 sm:p-6 flex flex-col gap-2 sm:gap-3">
          {contactLinks.map((link, idx) => (
            <a
              key={link.title}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center p-3 sm:p-4 rounded-2xl hover:bg-gray-50 border-2 border-transparent hover:border-gray-100 transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={`p-2.5 sm:p-3 rounded-xl border-2 transition-colors duration-300 ${link.color} ${link.hover} shrink-0`}>
                {React.cloneElement(link.icon, { className: "h-4 w-4 sm:h-5 sm:w-5" })}
              </div>
              <div className="ml-4 sm:ml-5 flex-1 min-w-0">
                <h3 className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                  {link.title}
                </h3>
                <p className="text-sm sm:text-base font-black text-black truncate">
                  {link.value}
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300 group-hover:text-black transition-colors shrink-0" strokeWidth={3} />
            </a>
          ))}
        </div>

      </div>
      </div>
    </>
  );
}
