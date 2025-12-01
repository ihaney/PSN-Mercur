'use client'

import React, { useState } from 'react';
import { useSupplierSocialLinks, trackSocialMediaClick } from '@/hooks/useSupplierSocialLinks';
import { Linkedin, Facebook, Twitter, Instagram, Youtube, MessageCircle, Music, Image, CheckCircle } from 'lucide-react';
import {
  getPlatformColor,
  getPlatformDisplayName,
  formatFollowerCount,
  type SocialPlatform
} from '@/lib/socialMediaValidation';
import { safeWindowOpen } from '@/lib/urlSecurity';

interface SocialMediaBarProps {
  supplierId: string;
}

const PlatformIcon: React.FC<{ platform: SocialPlatform; className?: string }> = ({ platform, className = 'w-5 h-5' }) => {
  const iconMap = {
    linkedin: Linkedin,
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    youtube: Youtube,
    whatsapp: MessageCircle,
    tiktok: Music,
    pinterest: Image,
  };

  const Icon = iconMap[platform];
  return <Icon className={className} />;
};

export default function SocialMediaBar({ supplierId }: SocialMediaBarProps) {
  const { data: links = [], isLoading } = useSupplierSocialLinks(supplierId, true);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex gap-3">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="w-12 h-12 rounded-full bg-themed-secondary animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!links.length) {
    return null;
  }

  const handleClick = (link: typeof links[0]) => {
    trackSocialMediaClick(link.id, window.location.href);
    safeWindowOpen(link.profile_url);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => (
        <div key={link.id} className="relative group">
          <button
            onClick={() => handleClick(link)}
            onMouseEnter={() => setHoveredLink(link.id)}
            onMouseLeave={() => setHoveredLink(null)}
            className="relative w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg"
            style={{
              backgroundColor: getPlatformColor(link.platform as SocialPlatform),
            }}
            aria-label={`Visit ${getPlatformDisplayName(link.platform as SocialPlatform)}`}
          >
            <PlatformIcon platform={link.platform as SocialPlatform} />

            {/* Verified badge overlay */}
            {link.is_verified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-themed-card">
                <CheckCircle className="w-3 h-3 text-white" fill="currentColor" />
              </div>
            )}
          </button>

          {/* Tooltip */}
          {hoveredLink === link.id && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10 pointer-events-none">
              <div className="font-medium">
                {getPlatformDisplayName(link.platform as SocialPlatform)}
              </div>
              {link.follower_count && (
                <div className="text-gray-300 mt-0.5">
                  {formatFollowerCount(link.follower_count)} followers
                </div>
              )}
              {link.is_verified && (
                <div className="text-blue-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </div>
              )}
              {/* Arrow pointing down */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                <div className="border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
