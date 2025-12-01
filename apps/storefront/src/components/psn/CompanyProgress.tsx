'use client'

import React from 'react';
import { TrendingUp, Globe, Users, Building2 } from 'lucide-react';

interface Milestone {
  date: string;
  title: string;
  description: string;
  imageUrl: string;
  icon: React.ReactNode;
  highlight?: string;
}

const milestones: Milestone[] = [
  {
    date: 'January 2025',
    title: 'Paisán is Born',
    description: 'Paisán Inc. is founded to simplify how global businesses discover and connect with Latin American suppliers',
    imageUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600',
    icon: <Building2 className="w-6 h-6 text-[#F4A024]" />,
    highlight: 'Founded'
  },
  {
    date: 'March 2025',
    title: 'Platform Launch',
    description: 'Paisán launches with comprehensive supplier directory and product catalog, generating excitement among industry leaders',
    imageUrl: 'https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=600',
    icon: <Globe className="w-6 h-6 text-[#F4A024]" />,
    highlight: 'Launch'
  },
  {
    date: 'May 2025',
    title: 'Growing Network',
    description: 'We feature 500+ verified listings and 70+ trusted suppliers across Latin America',
    imageUrl: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=600',
    icon: <Users className="w-6 h-6 text-[#F4A024]" />,
    highlight: '500+ Listings'
  },
  {
    date: 'August 2025',
    title: 'Rapid Expansion',
    description: 'We continue growing to 2000+ verified listings and 800+ active suppliers across the region',
    imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600',
    icon: <TrendingUp className="w-6 h-6 text-[#F4A024]" />,
    highlight: '+193% Growth'
  }
];

export default function CompanyProgress() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">The Paisán Story So Far</h2>
        <p className="text-gray-600 dark:text-gray-400">Our journey to connect Latin American suppliers with global markets</p>
      </div>

      <div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-white/20 shadow-xl dark:shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:border-[#F4A024]/30 transition-colors"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('${milestone.imageUrl}')`
                }}
              />

              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/30 dark:bg-black/60" />
              
              {/* Content */}
              <div className="relative z-10 p-6 h-full flex flex-col">
                {/* Highlight Badge */}
                {milestone.highlight && (
                  <div className="absolute top-4 left-4 bg-[#F4A024] text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                    {milestone.highlight}
                  </div>
                )}

                {/* Icon */}
                <div className="mb-4 mt-8">
                  <div className="w-12 h-12 bg-[#F4A024]/30 dark:bg-[#F4A024]/20 rounded-lg flex items-center justify-center">
                    {milestone.icon}
                  </div>
                </div>

                {/* Date */}
                <div className="text-[#F4A024] text-sm font-semibold mb-2">
                  {milestone.date}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {milestone.title}
                </h3>

                {/* Description */}
                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed flex-1">
                  {milestone.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}