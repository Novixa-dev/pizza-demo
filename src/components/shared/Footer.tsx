"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  Pizza,
  MapPin,
  Phone,
  Clock,
  Instagram,
  Heart,
  ExternalLink,
} from "lucide-react";

export default function Footer() {
  const { language, dict } = useApp();

  return (
    <footer className="bg-[#090b0e] text-stone-300 border-t border-[#1a202a] pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#1a202a]">
          {/* Col 1: Brand & Slogan */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#e45a38] flex items-center justify-center text-white shadow-lg shadow-orange-950/50">
                <Pizza className="w-5 h-5 text-amber-200" />
              </div>
              <span className="text-xl font-black text-white font-cairo">
                {dict.brand.name}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {language === "ar"
                ? "متخصصون في عمل أشهى أنواع البيتزا الإيطالية والفطائر الطازجة في المكلا بعجينة يومية ومكونات فاخرة مخبوزة على الحجر."
                : "Specializing in mouthwatering Italian stone-baked pizzas and fresh fatayer in Mukalla with artisanal dough and premium ingredients."}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/pizza_house66/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[#14181f] border border-[#222934] hover:bg-[#e45a38] hover:border-[#e45a38] text-stone-300 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                aria-label="Instagram @pizza_house66"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/967772207788"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[#14181f] border border-[#222934] hover:bg-emerald-600 hover:border-emerald-600 text-stone-300 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                aria-label="WhatsApp 772207788"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Operating Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-cairo">
              <Clock className="w-4 h-4 text-[#e45a38]" />
              <span>{language === "ar" ? "أوقات العمل الرسمية" : "Operating Hours"}</span>
            </h4>
            <ul className="text-xs text-stone-400 space-y-2">
              <li className="flex justify-between border-b border-[#1a202a] pb-1.5">
                <span>{language === "ar" ? "السبت – الخميس (صباحاً):" : "Sat – Thu (Morning):"}</span>
                <span className="text-stone-200 font-outfit">8:00 AM – 12:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-[#1a202a] pb-1.5">
                <span>{language === "ar" ? "السبت – الخميس (مساءً):" : "Sat – Thu (Evening):"}</span>
                <span className="text-stone-200 font-outfit">4:00 PM – 11:30 PM</span>
              </li>
              <li className="flex justify-between">
                <span>{language === "ar" ? "الجمعة:" : "Friday:"}</span>
                <span className="text-stone-200 font-outfit">4:00 PM – 11:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Location & Contacts */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-cairo">
              <MapPin className="w-4 h-4 text-[#e45a38]" />
              <span>{language === "ar" ? "العنوان والتواصل" : "Location & Contact"}</span>
            </h4>
            <div className="text-xs text-stone-400 space-y-2">
              <p className="leading-relaxed">
                {language === "ar"
                  ? "حضرموت، المكلا، فوه، حي المساكن (بالقرب من مستوصف النور وجامعة الأحقاف ومدرسة السلال)."
                  : "Hadhramaut, Mukalla, Fuwa, Al-Masaken District (near Al-Noor Clinic and Al-Ahgaff University)."}
              </p>
              <p className="font-outfit text-stone-200">
                {language === "ar" ? "هاتف أرضي: " : "Landline: "}
                <span className="text-[#e45a38] font-bold">05375561</span>
              </p>
              <p className="font-outfit text-stone-200">
                {language === "ar" ? "واتساب / جوال: " : "WhatsApp / Mobile: "}
                <span className="text-emerald-400 font-bold">+967 772207788</span>
              </p>
            </div>
          </div>

          {/* Col 4: Quick Links & Platform */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-cairo">
              {language === "ar" ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="text-xs space-y-2 text-stone-400">
              <li>
                <a href="/menu" className="hover:text-[#e45a38] transition-colors">
                  {dict.nav.menu}
                </a>
              </li>
              <li>
                <a href="/history" className="hover:text-[#e45a38] transition-colors">
                  {dict.nav.orderHistory}
                </a>
              </li>
              <li>
                <a href="/track" className="hover:text-[#e45a38] transition-colors">
                  {dict.nav.trackOrder}
                </a>
              </li>
              <li>
                <a href="/kitchen" className="hover:text-[#e45a38] transition-colors flex items-center gap-1">
                  <span>{dict.kitchen.title}</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-[#e45a38] transition-colors flex items-center gap-1">
                  <span>{dict.admin.title}</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Brand & Novixa Restaurant Reference */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <p>
            {language === "ar"
              ? `جميع الحقوق محفوظة © ${new Date().getFullYear()} مطعم بيتزا هاوس المكلا (Pizza House).`
              : `All rights reserved © ${new Date().getFullYear()} Pizza House Mukalla.`}
          </p>
          <div className="flex items-center gap-1.5">
            <span>
              {language === "ar"
                ? "مدعوم بواسطة منصة العمليات الرقمية للمطاعم"
                : "Powered by Digital Restaurant Platform"}
            </span>
            <span className="font-bold text-[#e45a38] font-outfit">Novixa Restaurant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
