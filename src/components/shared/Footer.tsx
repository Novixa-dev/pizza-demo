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
    <footer className="bg-[#050609] text-stone-300 border-t border-amber-500/15 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          {/* Col 1: Brand & Slogan */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff8c00] via-[#ea580c] to-[#dc2626] flex items-center justify-center text-white shadow-lg shadow-[#ff8c00]/30 border border-amber-300/30">
                <Pizza className="w-5 h-5 text-amber-100" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white font-playfair tracking-wider">
                  AURA PIZZA
                </span>
                <span className="text-[10px] text-amber-400 font-bold font-cairo">
                  {dict.brand.name} · {language === "ar" ? "المكلا" : "Mukalla"}
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {language === "ar"
                ? "متخصصون في عمل أشهى أنواع البيتزا الإيطالية والفطائر الطازجة في المكلا بعجينة يومية ومكونات فاخرة مخبوزة على الحجر."
                : language === "id"
                ? "Spesialis menyajikan pizza artisan khas Italia dan fatayer segar lezat di Mukalla dengan adonan harian dan bahan premium di atas batu alami."
                : "Specializing in mouthwatering Italian stone-baked pizzas and fresh fatayer in Mukalla with artisanal dough and premium ingredients."}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <a
                href="https://www.instagram.com/pizza_house66/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#14181f] hover:bg-[#1c222c] text-stone-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 hover:border-amber-500/30 transition-all text-xs font-bold font-outfit"
                aria-label="Instagram @pizza_house66"
              >
                <Instagram className="w-3.5 h-3.5 text-rose-400" />
                <span>@pizza_house66</span>
              </a>
              <a
                href="https://wa.me/967772207788"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#14181f] hover:bg-[#1c222c] text-stone-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all text-xs font-bold font-outfit"
                aria-label="WhatsApp 772207788"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>772207788</span>
              </a>
            </div>
          </div>

          {/* Col 2: Operating Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-cairo">
              <Clock className="w-4 h-4 text-[#C69843]" />
              <span>{language === "ar" ? "أوقات العمل الرسمية" : language === "id" ? "Jam Operasional Resmi" : "Operating Hours"}</span>
            </h4>
            <ul className="text-xs text-stone-400 space-y-2">
              <li className="flex justify-between border-b border-[#1a202a] pb-1.5">
                <span>{language === "ar" ? "السبت – الخميس (صباحاً):" : language === "id" ? "Sabtu – Kamis (Pagi):" : "Sat – Thu (Morning):"}</span>
                <span className="text-stone-200 font-outfit">8:00 AM – 12:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-[#1a202a] pb-1.5">
                <span>{language === "ar" ? "السبت – الخميس (مساءً):" : language === "id" ? "Sabtu – Kamis (Sore):" : "Sat – Thu (Evening):"}</span>
                <span className="text-stone-200 font-outfit">4:00 PM – 11:30 PM</span>
              </li>
              <li className="flex justify-between">
                <span>{language === "ar" ? "الجمعة:" : language === "id" ? "Jumat:" : "Friday:"}</span>
                <span className="text-stone-200 font-outfit">4:00 PM – 11:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Location & Contacts */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-cairo">
              <MapPin className="w-4 h-4 text-[#C69843]" />
              <span>{language === "ar" ? "العنوان والتواصل" : language === "id" ? "Alamat & Kontak" : "Location & Contact"}</span>
            </h4>
            <div className="text-xs text-stone-400 space-y-2">
              <p className="leading-relaxed">
                {language === "ar"
                  ? "حضرموت، المكلا، فوه، حي المساكن (بعد جامعة الأحقاف ومستوصف النور يمين الشارع العام)."
                  : language === "id"
                  ? "Hadhramaut, Mukalla, Fuwah, Distrik Al-Masaken (setelah Univ. Al-Ahgaff & Klinik Al-Noor, belok kanan)."
                  : "Hadhramaut, Mukalla, Fuwa, Al-Masaken (after Al-Ahgaff Univ & Al-Noor Clinic, right turn)."}
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="font-outfit text-stone-400 text-[11px]">Plus Code:</span>
                <span className="font-outfit font-bold text-stone-200 text-xs">F2QV+HPW</span>
              </div>
              <p className="font-outfit text-stone-200">
                {language === "ar" ? "هاتف ثابت: " : language === "id" ? "Telepon Rumah: " : "Landline: "}
                <a href="tel:05375561" className="text-[#EFCC80] hover:underline font-bold">05-375561</a>
              </p>
              <p className="font-outfit text-stone-200">
                {language === "ar" ? "واتساب وطلبات: " : language === "id" ? "WhatsApp & Pesanan: " : "WhatsApp & Mobile: "}
                <a href="https://wa.me/967772207788" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-bold">+967 772207788</a>
              </p>
              <p className="font-outfit text-stone-300 text-[11px]">
                {language === "ar" ? "شبكات إضافية: " : language === "id" ? "Nomor Lainnya: " : "Other lines: "}
                <span>738227788 (YOU) · 711227788 (سبأفون)</span>
              </p>
              <div className="pt-2">
                <a
                  href="https://maps.app.goo.gl/zre73sxKGyM27KvE6"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#EFCC80] hover:text-white font-bold transition-colors text-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#C69843]" />
                  <span>{language === "ar" ? "عرض على خرائط Google" : language === "id" ? "Lihat di Google Maps" : "View on Google Maps"}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Quick Links & Platform */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-cairo">
              {language === "ar" ? "روابط سريعة" : language === "id" ? "Tautan Cepat" : "Quick Links"}
            </h4>
            <ul className="text-xs space-y-2 text-stone-400">
              <li>
                <a href="/menu" className="hover:text-[#EFCC80] transition-colors">
                  {dict.nav.menu}
                </a>
              </li>
              <li>
                <a href="/history" className="hover:text-[#EFCC80] transition-colors">
                  {dict.nav.orderHistory}
                </a>
              </li>
              <li>
                <a href="/track" className="hover:text-[#EFCC80] transition-colors">
                  {dict.nav.trackOrder}
                </a>
              </li>
              <li>
                <a href="/kitchen" className="hover:text-[#EFCC80] transition-colors flex items-center gap-1">
                  <span>{dict.kitchen.title}</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-[#EFCC80] transition-colors flex items-center gap-1">
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
              : language === "id"
              ? `Hak cipta dilindungi © ${new Date().getFullYear()} Restoran Pizza House Mukalla.`
              : `All rights reserved © ${new Date().getFullYear()} Pizza House Mukalla.`}
          </p>
          <div className="flex items-center gap-1.5">
            <span>
              {language === "ar"
                ? "مدعوم بواسطة منصة العمليات الرقمية للمطاعم"
                : language === "id"
                ? "Didukung oleh Platform Operasi Digital Restoran"
                : "Powered by Digital Restaurant Platform"}
            </span>
            <span className="font-bold text-[#C69843] font-outfit">Novixa Restaurant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
