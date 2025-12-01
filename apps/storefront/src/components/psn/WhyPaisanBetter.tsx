'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface Feature {
  title: string;
  description: string;
  bulletPoints: string[];
  imageUrl: string;
  imagePosition: 'left' | 'right';
}

const features: Feature[] = [
  {
    title: 'Consolidated Public Catalog',
    description: 'The only publicly available comprehensive supplier catalog for Latin America.',
    bulletPoints: [
      'Unprecedented access to structured supplier data',
      'Multi-country coverage across Latin America',
      'Continuously enriched with AI & live data',
      'Built like a search engine, not a directory'
    ],
    imageUrl: 'https://i.postimg.cc/0j7r94pY/shutterstock-2264731949.jpg',
    imagePosition: 'left'
  },
  {
    title: 'Built for Suppliers, Not Just Buyers',
    description: 'Paisán helps Latin American manufacturers get found, verified, and trusted by real RFQs.',
    bulletPoints: [
      'Creator-influenced against data registration',
      'Fact/detective profiles are flagged or removed',
      'Claimed profiles earn trust badges',
      'Transparent supplier-driven listings and exports',
      'In-house AI to welcome long-tail suppliers',
      'Multi-lingual support for supplier and user onboarding',
      'Defect criticism websites and email producers',
      'Regional-aware Latin American business records and standardizes team selling globally-friendly formats'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
    imagePosition: 'right'
  },
  {
    title: 'Complete Product Details',
    description: 'Access full specifications, pricing, MOQs, and certifications.',
    bulletPoints: [
      'Streamline (excluded when available',
      'Export filters and MOQ clarity',
      'Consistent taxonomy across listings'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop',
    imagePosition: 'left'
  },
  {
    title: 'Direct Communication',
    description: 'More than supplier lists: no middlemen, no sellers, no delays.',
    bulletPoints: [
      'Built-in messaging with no intermediaries',
      'No delays or contact barriers',
      'Support for English + Spanish messaging',
      'Read receipts and response time soon'
    ],
    imageUrl: 'https://i.postimg.cc/QCFw5L65/shutterstock-2689075913.jpg',
    imagePosition: 'right'
  }
];

export default function WhyPaisanBetter() {
  return (
    <section className="w-full bg-gray-800 dark:bg-gray-900 py-16 lg:py-20 border border-gray-200 dark:border-white/20 rounded-2xl shadow-xl dark:shadow-none">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl lg:text-4xl font-bold text-gray-100 mb-4"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            What makes Paisán different
          </motion.h2>
          <motion.p
            className="text-gray-300 text-base lg:text-lg max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Purpose-built for Latin American sourcing. Comprehensive supplier data, verified profiles, and direct connections — all in one platform.
          </motion.p>
        </div>

        <div className="space-y-12 lg:space-y-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                feature.imagePosition === 'right' ? 'lg:grid-flow-dense' : ''
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Image */}
              <div
                className={`relative overflow-hidden rounded-2xl shadow-2xl ${
                  feature.imagePosition === 'right' ? 'lg:col-start-2' : ''
                }`}
              >
                <div className="aspect-[4/3] w-full">
                  <img
                    src={feature.imageUrl}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className={feature.imagePosition === 'right' ? 'lg:col-start-1 lg:row-start-1' : ''}>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-100 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-base lg:text-lg mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.bulletPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm lg:text-base">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#F4A024] mt-2" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
