"use client";

import React from "react";

/**
 * Atmospheric Floating Particles Component
 * Renders cinematic environmental particles:
 * - Blurred flying green basil leaves
 * - Scattered spicy chili flakes
 * - Drifting specs of flour & golden embers
 * - Warm ambient backlighting glows
 */
export default function FloatingParticles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-10 select-none"
    >
      {/* Warm Ambient Backlighting Glows */}
      <div className="absolute top-1/4 start-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-[120px]" />
      <div className="absolute top-2/3 end-1/5 w-80 h-80 rounded-full bg-orange-600/5 blur-[100px]" />
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-amber-500/4 via-orange-500/4 to-transparent blur-[140px]" />

      {/* 1. BLURRED FLYING GREEN BASIL LEAVES (Depth of field effect) */}
      {/* Basil Leaf 1 - Top Right Floating */}
      <div
        className="absolute top-[8%] end-[8%] opacity-70 animate-float-leaf"
        style={{ animationDuration: "14s" }}
      >
        <svg
          width="42"
          height="32"
          viewBox="0 0 50 40"
          fill="none"
          className="blur-[0.6px] rotate-[25deg] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
        >
          <path
            d="M5 25 C10 10, 28 5, 45 8 C42 22, 28 35, 12 33 C6 32, 4 28, 5 25 Z"
            fill="url(#basilGrad1)"
          />
          <path
            d="M10 26 C22 20, 32 16, 42 10"
            stroke="#15803d"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <defs>
            <linearGradient id="basilGrad1" x1="5" y1="25" x2="45" y2="8">
              <stop offset="0%" stopColor="#166534" />
              <stop offset="60%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Basil Leaf 2 - Mid Left Slightly Blurred */}
      <div
        className="absolute top-[48%] start-[6%] opacity-60 animate-float-leaf-rev"
        style={{ animationDuration: "18s" }}
      >
        <svg
          width="50"
          height="38"
          viewBox="0 0 50 40"
          fill="none"
          className="blur-[1.2px] -rotate-[40deg] drop-shadow-[0_6px_16px_rgba(0,0,0,0.7)]"
        >
          <path
            d="M5 25 C10 10, 28 5, 45 8 C42 22, 28 35, 12 33 C6 32, 4 28, 5 25 Z"
            fill="url(#basilGrad2)"
          />
          <path
            d="M10 26 C22 20, 32 16, 42 10"
            stroke="#14532d"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.7"
          />
          <defs>
            <linearGradient id="basilGrad2" x1="5" y1="25" x2="45" y2="8">
              <stop offset="0%" stopColor="#14532d" />
              <stop offset="50%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#86efac" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Basil Leaf 3 - Bottom Center/Right */}
      <div
        className="absolute top-[78%] end-[22%] opacity-65 animate-float-leaf"
        style={{ animationDuration: "16s", animationDelay: "-4s" }}
      >
        <svg
          width="36"
          height="28"
          viewBox="0 0 50 40"
          fill="none"
          className="blur-[0.4px] rotate-[65deg]"
        >
          <path
            d="M5 25 C10 10, 28 5, 45 8 C42 22, 28 35, 12 33 C6 32, 4 28, 5 25 Z"
            fill="url(#basilGrad3)"
          />
          <defs>
            <linearGradient id="basilGrad3" x1="5" y1="25" x2="45" y2="8">
              <stop offset="0%" stopColor="#166534" />
              <stop offset="70%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 2. SCATTERED CHILI FLAKES */}
      {/* Chili Flake 1 */}
      <div
        className="absolute top-[18%] start-[18%] opacity-75 animate-drift-chili"
        style={{ animationDuration: "12s" }}
      >
        <div className="w-2.5 h-3 bg-gradient-to-br from-red-500 via-rose-600 to-amber-700 rounded-sm rotate-45 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
      </div>

      {/* Chili Flake 2 */}
      <div
        className="absolute top-[35%] end-[14%] opacity-80 animate-drift-chili"
        style={{ animationDuration: "15s", animationDelay: "-3s" }}
      >
        <div className="w-2 h-2.5 bg-gradient-to-tr from-amber-600 to-red-600 rounded-xs -rotate-12 shadow-[0_0_4px_rgba(220,38,38,0.5)]" />
      </div>

      {/* Chili Flake 3 */}
      <div
        className="absolute top-[65%] start-[28%] opacity-70 animate-drift-chili"
        style={{ animationDuration: "17s", animationDelay: "-7s" }}
      >
        <div className="w-3 h-2 bg-gradient-to-r from-red-600 to-rose-700 rounded-xs rotate-[30deg] shadow-[0_0_5px_rgba(220,38,38,0.5)]" />
      </div>

      {/* Chili Flake 4 */}
      <div
        className="absolute top-[82%] end-[38%] opacity-65 animate-drift-chili"
        style={{ animationDuration: "13s", animationDelay: "-5s" }}
      >
        <div className="w-2 h-2 bg-red-600 rounded-xs rotate-[70deg]" />
      </div>

      {/* 3. FLOUR SPECKS & GOLDEN EMBERS */}
      <div className="absolute top-[12%] start-[32%] w-1.5 h-1.5 rounded-full bg-white/40 blur-[0.6px] animate-pulse-flour" style={{ animationDuration: "4s" }} />
      <div className="absolute top-[28%] end-[30%] w-2 h-2 rounded-full bg-[#EFCC80]/40 blur-[0.4px] animate-pulse-flour" style={{ animationDuration: "6s", animationDelay: "-1s" }} />
      <div className="absolute top-[42%] start-[12%] w-1 h-1 rounded-full bg-white/50 blur-[0.3px] animate-pulse-flour" style={{ animationDuration: "5s", animationDelay: "-2s" }} />
      <div className="absolute top-[58%] end-[10%] w-2 h-2 rounded-full bg-[#C69843]/50 blur-[0.5px] animate-pulse-flour" style={{ animationDuration: "7s", animationDelay: "-3s" }} />
      <div className="absolute top-[72%] start-[45%] w-1.5 h-1.5 rounded-full bg-white/35 blur-[0.4px] animate-pulse-flour" style={{ animationDuration: "4.5s", animationDelay: "-4s" }} />
      <div className="absolute top-[88%] end-[25%] w-1 h-1 rounded-full bg-[#EFCC80]/40 blur-[0.3px] animate-pulse-flour" style={{ animationDuration: "5.5s" }} />
      <div className="absolute top-[22%] end-[45%] w-1 h-1 rounded-full bg-amber-400/40 blur-[0.3px] animate-pulse-flour" style={{ animationDuration: "6.5s", animationDelay: "-2.5s" }} />
      <div className="absolute top-[75%] start-[15%] w-1.5 h-1.5 rounded-full bg-white/40 blur-[0.5px] animate-pulse-flour" style={{ animationDuration: "5s", animationDelay: "-1.5s" }} />
    </div>
  );
}
