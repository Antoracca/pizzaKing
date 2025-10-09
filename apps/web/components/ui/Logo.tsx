'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

export default function Logo({ variant = 'default' }: { variant?: 'default' | 'white' }) {
  const textColor = variant === 'white' ? 'text-white' : 'text-gray-900';
  const accentColor = variant === 'white' ? 'from-white to-gray-100' : 'from-red-600 to-orange-600';

  return (
    <Link href="/" className="flex items-center space-x-3 group">
      {/* Pizza Icon - Design Ultra Propre */}
      <div className="relative">
        <motion.div
          whileHover={{ rotate: 360, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="relative w-12 h-12 sm:w-14 sm:h-14"
        >
          {/* Pizza complète avec design moderne */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-lg"
            fill="none"
          >
            {/* Cercle principal (pizza) */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="url(#pizzaGradient)"
              stroke="white"
              strokeWidth="3"
            />

            {/* Sections de pizza (8 parts) */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x2 = 50 + 45 * Math.cos(rad);
              const y2 = 50 + 45 * Math.sin(rad);
              return (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={x2}
                  y2={y2}
                  stroke="white"
                  strokeWidth="2"
                  opacity="0.6"
                />
              );
            })}

            {/* Pepperoni (garniture) */}
            <circle cx="40" cy="35" r="4" fill="#DC2626" />
            <circle cx="60" cy="40" r="4" fill="#DC2626" />
            <circle cx="50" cy="55" r="4" fill="#DC2626" />
            <circle cx="35" cy="60" r="3.5" fill="#DC2626" />
            <circle cx="65" cy="60" r="3.5" fill="#DC2626" />
            <circle cx="50" cy="42" r="3" fill="#F59E0B" />
            <circle cx="42" cy="52" r="3" fill="#F59E0B" />
            <circle cx="58" cy="52" r="3" fill="#F59E0B" />

            {/* Couronne au centre */}
            <g transform="translate(50, 50)">
              <path
                d="M-6,-8 L-4,-2 L0,-4 L4,-2 L6,-8 L4,-6 L0,-8 L-4,-6 Z"
                fill="#FCD34D"
                stroke="#F59E0B"
                strokeWidth="0.5"
              />
            </g>

            {/* Gradient definitions */}
            <defs>
              <linearGradient id="pizzaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DC2626" />
                <stop offset="50%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

      {/* Text Logo - Design Amélioré */}
      <div className="flex flex-col -space-y-1">
        <div className="flex items-center space-x-1.5">
          <span className={`text-xl sm:text-2xl font-black tracking-tight ${textColor} group-hover:scale-105 transition-transform`}>
            PIZZA
          </span>
          <div className="flex items-center">
            <span className={`text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r ${accentColor} bg-clip-text text-transparent`}>
              KING
            </span>
            {/* Petite couronne à côté de KING */}
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 fill-orange-500 ml-1 -mt-1" />
          </div>
        </div>
        <span className="text-[10px] sm:text-xs text-gray-500 font-semibold tracking-wide">
          Bangui • Livraison 30min
        </span>
      </div>
    </Link>
  );
}
