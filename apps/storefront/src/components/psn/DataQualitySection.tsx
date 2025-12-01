'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, Zap, Database, TrendingUp } from 'lucide-react';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  mockup: React.ReactNode;
  style: 'always-visible' | 'hover-reveal';
}

function FragmentedDataMockup() {
  const [scrollTriggered, setScrollTriggered] = useState(false);
  const vizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !scrollTriggered) {
          setScrollTriggered(true);
        }
      },
      { threshold: 0.3 }
    );
    if (vizRef.current) observer.observe(vizRef.current);
    return () => {
      if (vizRef.current) observer.unobserve(vizRef.current);
    };
  }, [scrollTriggered]);

  return (
    <div ref={vizRef} className="w-full h-full flex items-center justify-center p-2">
      <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="fragGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F4A024" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C17817" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {[
          { x: 30, y: 40, delay: 0.2 },
          { x: 120, y: 30, delay: 0.4 },
          { x: 200, y: 50, delay: 0.6 },
          { x: 50, y: 100, delay: 0.8 },
          { x: 180, y: 110, delay: 1 },
          { x: 250, y: 90, delay: 1.2 }
        ].map((item, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={scrollTriggered ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: item.delay }}
          >
            <rect
              x={item.x - 20}
              y={item.y - 15}
              width="40"
              height="30"
              rx="4"
              fill="url(#fragGradient)"
              stroke="#F4A024"
              strokeWidth="1"
            />
            <circle cx={item.x - 12} cy={item.y - 8} r="1.5" fill="#F4A024" opacity="0.6" />
            <circle cx={item.x - 6} cy={item.y - 8} r="1.5" fill="#F4A024" opacity="0.4" />
            <circle cx={item.x} cy={item.y - 8} r="1.5" fill="#F4A024" opacity="0.3" />
            <rect x={item.x - 15} y={item.y} width="20" height="2" rx="1" fill="#F4A024" opacity="0.4" />
            <rect x={item.x - 15} y={item.y + 5} width="15" height="2" rx="1" fill="#F4A024" opacity="0.3" />
          </motion.g>
        ))}

        <motion.text
          x="150"
          y="170"
          textAnchor="middle"
          fill="#F4A024"
          fontSize="24"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={scrollTriggered ? { opacity: 0.6 } : {}}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          ?
        </motion.text>
      </svg>
    </div>
  );
}

function VerificationMockup() {
  const [scrollTriggered, setScrollTriggered] = useState(false);
  const vizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !scrollTriggered) {
          setScrollTriggered(true);
        }
      },
      { threshold: 0.3 }
    );
    if (vizRef.current) observer.observe(vizRef.current);
    return () => {
      if (vizRef.current) observer.unobserve(vizRef.current);
    };
  }, [scrollTriggered]);

  return (
    <div ref={vizRef} className="w-full h-full flex items-center justify-center p-2">
      <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="verifyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F4A024" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C17817" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={scrollTriggered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <rect x="50" y="40" width="200" height="120" rx="8" fill="url(#verifyGradient)" stroke="#F4A024" strokeWidth="2" />

          <circle cx="65" cy="55" r="3" fill="#F4A024" opacity="0.6" />
          <circle cx="75" cy="55" r="3" fill="#F4A024" opacity="0.4" />
          <circle cx="85" cy="55" r="3" fill="#F4A024" opacity="0.3" />

          {[0, 1, 2].map((i) => (
            <motion.g
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={scrollTriggered ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.3 }}
            >
              <circle cx="80" cy={85 + i * 25} r="8" fill="#10B981" opacity="0.2" />
              <motion.path
                d={`M ${75} ${85 + i * 25} L ${78} ${88 + i * 25} L ${85} ${81 + i * 25}`}
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={scrollTriggered ? { pathLength: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.8 + i * 0.3 }}
              />
              <rect x="100" y={80 + i * 25} width="120" height="4" rx="2" fill="#F4A024" opacity="0.5" />
              <rect x="100" y={87 + i * 25} width="90" height="3" rx="1.5" fill="#F4A024" opacity="0.3" />
            </motion.g>
          ))}
        </motion.g>

        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={scrollTriggered ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <circle cx="230" cy="60" r="15" fill="#F4A024" opacity="0.9" />
          <path
            d="M 230 50 L 238 55 L 238 65 L 230 70 L 222 65 L 222 55 Z"
            fill="white"
            opacity="0.9"
          />
          <path
            d="M 226 60 L 229 63 L 234 57"
            stroke="#F4A024"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>
      </svg>
    </div>
  );
}

function DirectAccessMockup() {
  const [scrollTriggered, setScrollTriggered] = useState(false);
  const vizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !scrollTriggered) {
          setScrollTriggered(true);
        }
      },
      { threshold: 0.3 }
    );
    if (vizRef.current) observer.observe(vizRef.current);
    return () => {
      if (vizRef.current) observer.unobserve(vizRef.current);
    };
  }, [scrollTriggered]);

  return (
    <div ref={vizRef} className="w-full h-full flex items-center justify-center p-2">
      <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="directGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F4A024" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C17817" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <motion.g
          initial={{ opacity: 0, x: -20 }}
          animate={scrollTriggered ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <rect x="30" y="70" width="80" height="60" rx="6" fill="url(#directGradient)" stroke="#F4A024" strokeWidth="1.5" />
          <circle cx="70" cy="90" r="12" fill="#F4A024" opacity="0.3" />
          <rect x="45" y="110" width="50" height="4" rx="2" fill="#F4A024" opacity="0.5" />
          <rect x="45" y="118" width="35" height="3" rx="1.5" fill="#F4A024" opacity="0.3" />
          <text x="70" y="148" textAnchor="middle" fill="#F4A024" fontSize="8" opacity="0.7">Buyer</text>
        </motion.g>

        <motion.g
          initial={{ opacity: 0, x: 20 }}
          animate={scrollTriggered ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <rect x="190" y="70" width="80" height="60" rx="6" fill="url(#directGradient)" stroke="#F4A024" strokeWidth="1.5" />
          <circle cx="230" cy="90" r="12" fill="#F4A024" opacity="0.3" />
          <rect x="205" y="110" width="50" height="4" rx="2" fill="#F4A024" opacity="0.5" />
          <rect x="205" y="118" width="35" height="3" rx="1.5" fill="#F4A024" opacity="0.3" />
          <text x="230" y="148" textAnchor="middle" fill="#F4A024" fontSize="8" opacity="0.7">Supplier</text>
        </motion.g>

        <motion.path
          d="M 115 100 L 185 100"
          stroke="#F4A024"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={scrollTriggered ? { pathLength: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        />
        <motion.path
          d="M 175 95 L 185 100 L 175 105"
          stroke="#F4A024"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={scrollTriggered ? { pathLength: 1 } : {}}
          transition={{ duration: 0.3, delay: 1.4 }}
        />

        <motion.text
          x="150"
          y="90"
          textAnchor="middle"
          fill="#10B981"
          fontSize="9"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={scrollTriggered ? { opacity: 0.8 } : {}}
          transition={{ duration: 0.5, delay: 1.6 }}
        >
          Direct
        </motion.text>
      </svg>
    </div>
  );
}

function ComprehensiveCatalogMockup() {
  const [scrollTriggered, setScrollTriggered] = useState(false);
  const vizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !scrollTriggered) {
          setScrollTriggered(true);
        }
      },
      { threshold: 0.3 }
    );
    if (vizRef.current) observer.observe(vizRef.current);
    return () => {
      if (vizRef.current) observer.unobserve(vizRef.current);
    };
  }, [scrollTriggered]);

  return (
    <div ref={vizRef} className="w-full h-full flex items-center justify-center p-2">
      <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="catalogGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F4A024" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C17817" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <motion.g
          initial={{ opacity: 0, scale: 0.95 }}
          animate={scrollTriggered ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <rect x="40" y="30" width="220" height="140" rx="8" fill="url(#catalogGradient)" stroke="#F4A024" strokeWidth="2" />

          <circle cx="55" cy="45" r="3" fill="#F4A024" opacity="0.6" />
          <circle cx="65" cy="45" r="3" fill="#F4A024" opacity="0.4" />
          <circle cx="75" cy="45" r="3" fill="#F4A024" opacity="0.3" />

          <rect x="55" y="60" width="190" height="15" rx="7.5" fill="rgba(244,160,36,0.1)" stroke="#F4A024" strokeWidth="1" />
          <circle cx="70" cy="67.5" r="4" fill="none" stroke="#F4A024" strokeWidth="1.5" />
          <line x1="73" y1="70.5" x2="76" y2="73.5" stroke="#F4A024" strokeWidth="1.5" strokeLinecap="round" />

          {[0, 1, 2, 3, 4, 5].map((i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            return (
              <motion.g
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={scrollTriggered ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
              >
                <rect
                  x={55 + col * 60}
                  y={85 + row * 35}
                  width="50"
                  height="30"
                  rx="4"
                  fill="rgba(244,160,36,0.15)"
                  stroke="#F4A024"
                  strokeWidth="1"
                />
                <rect x={60 + col * 60} y={90 + row * 35} width="25" height="3" rx="1.5" fill="#F4A024" opacity="0.5" />
                <rect x={60 + col * 60} y={96 + row * 35} width="35" height="2" rx="1" fill="#F4A024" opacity="0.3" />
              </motion.g>
            );
          })}
        </motion.g>
      </svg>
    </div>
  );
}

function TimeSavingsMockup() {
  const [scrollTriggered, setScrollTriggered] = useState(false);
  const vizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !scrollTriggered) {
          setScrollTriggered(true);
        }
      },
      { threshold: 0.3 }
    );
    if (vizRef.current) observer.observe(vizRef.current);
    return () => {
      if (vizRef.current) observer.unobserve(vizRef.current);
    };
  }, [scrollTriggered]);

  return (
    <div ref={vizRef} className="w-full h-full flex items-center justify-center p-2">
      <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="timeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F4A024" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C17817" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={scrollTriggered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <rect x="50" y="40" width="200" height="120" rx="8" fill="url(#timeGradient)" stroke="#F4A024" strokeWidth="2" />

          <text x="150" y="65" textAnchor="middle" fill="#F4A024" fontSize="10" fontWeight="bold" opacity="0.8">Time Saved</text>

          <motion.rect
            x="80"
            y="120"
            width="140"
            height="15"
            rx="3"
            fill="#EF4444"
            opacity="0.6"
            initial={{ width: 0 }}
            animate={scrollTriggered ? { width: 140 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
          />
          <text x="75" y="130" textAnchor="end" fill="#F4A024" fontSize="8" opacity="0.7">Before</text>

          <motion.rect
            x="80"
            y="145"
            width="50"
            height="15"
            rx="3"
            fill="#10B981"
            opacity="0.8"
            initial={{ width: 0 }}
            animate={scrollTriggered ? { width: 50 } : {}}
            transition={{ duration: 0.8, delay: 1.2 }}
          />
          <text x="75" y="155" textAnchor="end" fill="#F4A024" fontSize="8" opacity="0.7">After</text>

          <motion.text
            x="150"
            y="100"
            textAnchor="middle"
            fill="#10B981"
            fontSize="24"
            fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={scrollTriggered ? { opacity: 0.9 } : {}}
            transition={{ duration: 0.5, delay: 1.6 }}
          >
            -70%
          </motion.text>
        </motion.g>
      </svg>
    </div>
  );
}

const featureCards: FeatureCard[] = [
  {
    id: 'fragmented',
    title: 'Fragmented Information',
    description: 'Latin American supplier data is scattered across dozens of platforms, often outdated or incomplete',
    icon: Search,
    mockup: <FragmentedDataMockup />,
    style: 'always-visible'
  },
  {
    id: 'verification',
    title: 'Verification Gap',
    description: 'Traditional platforms lack comprehensive verification, making it risky to connect with suppliers',
    icon: ShieldCheck,
    mockup: <VerificationMockup />,
    style: 'hover-reveal'
  },
  {
    id: 'direct',
    title: 'Direct Access',
    description: 'Remove intermediaries and connect directly with verified manufacturers and suppliers',
    icon: Zap,
    mockup: <DirectAccessMockup />,
    style: 'hover-reveal'
  },
  {
    id: 'catalog',
    title: 'Comprehensive Catalog',
    description: 'All Latin American supplier data in one searchable, organized, and constantly updated platform',
    icon: Database,
    mockup: <ComprehensiveCatalogMockup />,
    style: 'always-visible'
  },
  {
    id: 'time',
    title: 'Time Savings',
    description: 'Reduce weeks of research time to hours with structured data and advanced search capabilities',
    icon: TrendingUp,
    mockup: <TimeSavingsMockup />,
    style: 'hover-reveal'
  }
];

export default function DataQualitySection() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const getCardClassName = (cardId: string) => {
    const baseClasses = "group bg-gradient-to-br from-gray-700/40 to-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-600/20 hover:border-[#F4A024]/40 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-[#F4A024]/20";

    switch (cardId) {
      case 'fragmented':
        return `${baseClasses} lg:col-span-2`;
      case 'verification':
        return `${baseClasses} lg:col-span-1`;
      case 'direct':
        return `${baseClasses} lg:col-span-1`;
      case 'catalog':
        return `${baseClasses} lg:col-span-2`;
      case 'time':
        return `${baseClasses} lg:col-span-3`;
      default:
        return baseClasses;
    }
  };

  return (
    <section className="mb-12">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
        <div className="mb-8">
          <h2 className="text-3xl font-bold dark:text-gray-100 light:text-gray-900 mb-2">Why Paisán Exists</h2>
        </div>

        <div className="card-glow rounded-2xl bg-gray-800 dark:bg-gray-900 p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {featureCards.map((card, index) => {
            const Icon = card.icon;
            const isHovered = hoveredCard === card.id;

            return (
              <motion.div
                key={card.id}
                className={getCardClassName(card.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -8 }}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {card.style === 'always-visible' ? (
                  <>
                    <div className="h-40 lg:h-48 bg-gradient-to-br from-gray-800 to-gray-900 border-b border-gray-600/20 relative overflow-hidden">
                      {card.mockup}
                    </div>

                    <div className="p-4 lg:p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-[#F4A024]/15 group-hover:bg-[#F4A024]/25 transition-colors">
                          <Icon className="w-4 h-4 text-[#F4A024]" />
                        </div>
                        <h3 className="text-sm lg:text-base font-bold text-gray-100 group-hover:text-[#F4A024] transition-colors">
                          {card.title}
                        </h3>
                      </div>
                      <p className="text-gray-400 text-xs lg:text-sm leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`h-full bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden ${card.id === 'time' ? 'min-h-[140px] lg:min-h-[140px]' : 'min-h-[240px] lg:min-h-[280px]'}`}>
                      <div className={`absolute inset-0 transition-all duration-300 ${isHovered ? 'opacity-20' : 'opacity-100'}`}>
                        {card.mockup}
                      </div>

                      <div className="absolute top-0 left-0 right-0 p-3 lg:p-4 z-10">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-[#F4A024]/15 group-hover:bg-[#F4A024]/25 transition-colors">
                            <Icon className="w-4 h-4 text-[#F4A024]" />
                          </div>
                          <h3 className="text-sm lg:text-base font-bold text-gray-100 group-hover:text-[#F4A024] transition-colors">
                            {card.title}
                          </h3>
                        </div>
                      </div>

                      <motion.div
                        className="absolute inset-0 flex items-center justify-center p-3 lg:p-4 z-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
                      >
                        <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-[#F4A024]/40">
                          <p className="text-gray-200 text-xs leading-relaxed text-center">
                            {card.description}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
