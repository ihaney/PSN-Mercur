'use client'

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import latinAmericaGeoJSON from '@/lib/helpers/latinAmericaGeoJSON.json';
import {
  calculateFeatureCollectionBBox,
  coordinatesToSVGPath,
  projectToSVG,
  calculateCentroid,
  normalizeCountryName,
  type BBox,
  type ViewBox
} from '@/lib/helpers/mapProjection';

interface CountryData {
  Country_ID: string;
  Country_Title: string;
  Country_Image: string | null;
  Country_About?: string;
  product_count: number;
  supplier_count: number;
  latitude?: number;
  longitude?: number;
}

interface LatinAmericaInteractiveMapProps {
  countryData?: CountryData[];
  height?: string;
  showTooltip?: boolean;
  allowNavigation?: boolean;
  showAllCountries?: boolean;
}

interface ProcessedCountry {
  name: string;
  path: string;
  centroid: [number, number];
  projectedCentroid: [number, number];
  data?: CountryData;
}

interface CountryShapeProps {
  country: ProcessedCountry;
  isHovered: boolean;
  isSelected: boolean;
  hasData: boolean;
  allowNavigation: boolean;
  showAllCountries: boolean;
  onHover: (name: string | null) => void;
  onClick: (country: ProcessedCountry) => void;
}

const CountryShape = React.memo(function CountryShape({
  country,
  isHovered,
  isSelected,
  hasData,
  allowNavigation,
  showAllCountries,
  onHover,
  onClick
}: CountryShapeProps) {
  const isClickable = allowNavigation && hasData;
  const shouldDisplay = hasData || showAllCountries;

  if (!shouldDisplay) return null;

  return (
    <g>
      {/* Country fill with glow */}
      <path
        d={country.path}
        className={`latin-map-country ${hasData ? 'has-data' : 'no-data'}`}
        fill={
          isHovered || isSelected
            ? hasData
              ? 'rgba(244, 160, 36, 0.75)'
              : 'rgba(244, 160, 36, 0.5)'
            : hasData
              ? 'rgba(244, 160, 36, 0.25)'
              : 'rgba(244, 160, 36, 0.03)'
        }
        stroke="none"
        style={{
          filter: (isHovered || isSelected) ? 'url(#country-hover-glow)' : 'url(#country-glow)'
        }}
        onMouseEnter={() => hasData && onHover(country.name)}
        onMouseLeave={() => onHover(null)}
        onClick={() => isClickable && onClick(country)}
      />

      {/* Country border with separate styling */}
      <path
        d={country.path}
        fill="none"
        stroke={(isHovered || isSelected) ? '#FDB751' : '#D68A1F'}
        strokeWidth={(isHovered || isSelected) ? 2.8 : hasData ? 2.2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={(isHovered || isSelected) ? 0.95 : hasData ? 0.7 : 0.4}
        style={{
          filter: 'url(#border-glow)',
          pointerEvents: 'none'
        }}
      />
    </g>
  );
});

export default function LatinAmericaInteractiveMap({
  countryData = [],
  height = '800px',
  showTooltip = true,
  allowNavigation = true,
  showAllCountries = true
}: LatinAmericaInteractiveMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const viewBox: ViewBox = { width: 1000, height: 1400 };

  const { countries, bbox } = useMemo(() => {
    const features = latinAmericaGeoJSON.features;
    const calculatedBbox = calculateFeatureCollectionBBox(features);

    const countryDataMap = new Map<string, CountryData>();
    countryData.forEach(country => {
      const normalized = normalizeCountryName(country.Country_Title);
      countryDataMap.set(normalized, country);
    });

    const processedCountries: ProcessedCountry[] = features.map((feature) => {
      const countryName = feature.properties.NAME || feature.properties.ADMIN || feature.properties.name || 'Unknown';
      let coordinates = feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;

      const path = coordinatesToSVGPath(coordinates, calculatedBbox, viewBox, 0.1, 0.95);
      const centroid = calculateCentroid(coordinates);
      const projectedCentroid = projectToSVG(
        centroid[0],
        centroid[1],
        calculatedBbox,
        viewBox,
        0.95
      );

      const normalizedName = normalizeCountryName(countryName);
      const data = countryDataMap.get(normalizedName);

      return {
        name: countryName,
        path,
        centroid,
        projectedCentroid,
        data
      };
    });

    return { countries: processedCountries, bbox: calculatedBbox };
  }, [countryData]);

  const handleCountryClick = useCallback((country: ProcessedCountry) => {
    if (selectedCountry === country.name) {
      setSelectedCountry(null);
    } else {
      setSelectedCountry(country.name);
    }

    if (allowNavigation && country.data && country.data.Country_ID && country.data.product_count > 0) {
      router.push(`/${locale}/country-search?country=${country.data.Country_ID}&mode=products`);
    }
  }, [selectedCountry, allowNavigation, router, locale]);

  const handleHover = useCallback((name: string | null) => {
    setHoveredCountry(name);
  }, []);

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!hoveredCountry || !svgRef.current || !showTooltip) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setTooltipPosition({ x, y });
  };

  const hoveredCountryData = hoveredCountry
    ? countries.find(c => c.name === hoveredCountry)
    : null;

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      <style>{`
        .latin-map-country {
          transition: all 0.3s ease;
        }

        .latin-map-country.has-data {
          cursor: pointer;
        }

        .latin-map-country.has-data:hover {
          filter: drop-shadow(0 0 20px rgba(244, 160, 36, 0.8)) drop-shadow(0 0 40px rgba(244, 160, 36, 0.4));
        }

        .latin-map-country.no-data {
          cursor: default;
          opacity: 0.4;
        }

        .latin-map-country.static-display {
          cursor: pointer;
          opacity: 1;
        }

        .latin-map-country.static-display:hover {
          filter: drop-shadow(0 0 16px rgba(244, 160, 36, 0.7)) drop-shadow(0 0 32px rgba(244, 160, 36, 0.3));
        }
      `}</style>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHoveredCountry(null);
          setTooltipPosition(null);
        }}
        style={{ display: 'block', background: 'transparent' }}
      >
        <defs>
          {/* Ambient background glow */}
          <radialGradient id="mapAmbientGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F4A024" stopOpacity="0.15" />
            <stop offset="60%" stopColor="#F4A024" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#F4A024" stopOpacity="0" />
          </radialGradient>

          {/* Dual-layer glow for countries - inspired by WhyPaisanBetter */}
          <filter id="country-glow">
            <feGaussianBlur stdDeviation="6" result="outer" />
            <feFlood floodColor="#FFD480" floodOpacity="0.18" result="innerColor" />
            <feComposite in="innerColor" in2="outer" operator="in" result="inner" />
            <feMerge>
              <feMergeNode in="outer" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="inner" />
            </feMerge>
          </filter>

          {/* Enhanced hover glow with multiple layers */}
          <filter id="country-hover-glow">
            <feGaussianBlur stdDeviation="8" result="outerGlow" />
            <feGaussianBlur stdDeviation="4" result="midGlow" />
            <feFlood floodColor="#FFD480" floodOpacity="0.25" result="innerColor" />
            <feComposite in="innerColor" in2="outerGlow" operator="in" result="inner" />
            <feMerge>
              <feMergeNode in="outerGlow" />
              <feMergeNode in="midGlow" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="inner" />
            </feMerge>
          </filter>

          {/* Soft glow for borders */}
          <filter id="border-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Ambient background circle */}
        <ellipse
          cx="500"
          cy="700"
          rx="400"
          ry="600"
          fill="url(#mapAmbientGlow)"
          opacity="0.6"
        />

        {countries.map((country) => {
          const isHovered = hoveredCountry === country.name;
          const isSelected = selectedCountry === country.name;
          const hasData = !!country.data;

          return (
            <CountryShape
              key={country.name}
              country={country}
              isHovered={isHovered}
              isSelected={isSelected}
              hasData={hasData}
              allowNavigation={allowNavigation}
              showAllCountries={showAllCountries}
              onHover={handleHover}
              onClick={handleCountryClick}
            />
          );
        })}
      </svg>

      {showTooltip && hoveredCountryData && hoveredCountryData.data && tooltipPosition && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: `${Math.min(Math.max(tooltipPosition.x, 100), (containerRef.current?.offsetWidth ?? 1000) - 100)}px`,
            top: `${Math.max(tooltipPosition.y - 20, 60)}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {hoveredCountryData.data && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border-2 border-[#F4A024] p-4 min-w-[200px] backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                {hoveredCountryData.data.Country_Image && (
                  <img
                    src={hoveredCountryData.data.Country_Image}
                    alt={hoveredCountryData.name}
                    className="w-12 h-12 object-contain rounded-lg"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {hoveredCountryData.data.Country_Title || hoveredCountryData.name}
                  </h3>
                  <p className={`text-sm font-medium ${(hoveredCountryData.data.product_count ?? 0) > 0 ? 'text-[#F4A024]' : 'text-gray-500 dark:text-gray-400'}`}>
                    {(hoveredCountryData.data.product_count ?? 0).toLocaleString()} {(hoveredCountryData.data.product_count ?? 0) === 1 ? 'product' : 'products'}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Suppliers:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(hoveredCountryData.data.supplier_count ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {allowNavigation && (hoveredCountryData.data.product_count ?? 0) > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Click to explore products
                  </p>
                </div>
              )}

              {(hoveredCountryData.data.product_count ?? 0) === 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    No products available yet
                  </p>
                </div>
              )}

              <div
                className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
                style={{
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '8px solid #F4A024',
                  bottom: '-8px'
                }}
              />
            </div>
          )}
        </div>
      )}

      {selectedCountry && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-[#F4A024] text-gray-900 font-bold px-6 py-3 rounded-full shadow-2xl border-2 border-white dark:border-gray-800">
            {selectedCountry}
          </div>
        </div>
      )}

    </div>
  );
}
