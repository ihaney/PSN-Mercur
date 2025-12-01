'use client'

import React, { useMemo } from 'react';
import SupplierCard from './SupplierCard';
import ProductCard from './ProductCard';
import { Product } from '../types';

interface Citation {
  index: number;
  url: string;
  title: string;
  domain: string;
}

interface SupplierMatch {
  Supplier_ID: string;
  Supplier_Title: string;
  Supplier_Description?: string;
  ai_business_summary?: string;
  Supplier_Country_Name?: string;
  country_image?: string;
  Supplier_City_Name?: string;
  Supplier_Location?: string;
  Supplier_Source_ID?: string;
  Supplier_Website?: string;
  Supplier_Email?: string;
  Supplier_Whatsapp?: string;
  product_keywords?: string;
  Supplier_Logo?: string;
  profile_picture_url?: string;
  is_verified?: boolean;
  Supplier_Category?: string;
  product_count?: number;
  score: number;
  matchType?: string;
}

interface ProductMatch extends Product {
  score: number;
}

interface StreamedContentWithCardsProps {
  text: string;
  citations: Citation[];
  suppliers: SupplierMatch[];
  products: ProductMatch[];
  query: string;
  onCitationClick: (citation: Citation) => void;
}

const FormattedTextContent = ({
  text,
  citations,
  onCitationClick,
}: {
  text: string;
  citations: Citation[];
  onCitationClick: (citation: Citation) => void;
}) => {
  const formattedContent = useMemo(() => {
    const parts = text.split(/(\[\d+\])/g);
    const formatted: React.ReactNode[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      const citationMatch = part.match(/^\[(\d+)\]$/);
      if (citationMatch) {
        const citationNum = parseInt(citationMatch[1]);
        const citation = citations.find(c => c.index === citationNum);

        if (citation) {
          formatted.push(
            <sup key={`citation-${citationNum}-${i}`}>
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  onCitationClick(citation);
                }}
                className="text-[#F4A024] hover:text-[#E09020] underline decoration-2 hover:decoration-[#E09020] font-bold mx-1 cursor-pointer transition-all duration-200 inline-block px-1 py-0.5 rounded hover:bg-[#F4A024]/10 relative"
                style={{ zIndex: 10 }}
                aria-label={`Source ${citationNum}: ${citation.title}`}
                title={`Click to view source: ${citation.title}`}
              >
                [{citationNum}]
              </a>
            </sup>
          );
        } else {
          formatted.push(
            <sup key={`no-citation-${citationNum}-${i}`} className="text-[#F4A024] font-medium mx-0.5">
              [{citationNum}]
            </sup>
          );
        }
      } else if (part) {
        const lines = part.split('\n');
        lines.forEach((line, idx) => {
          if (line.match(/^###\s+(.+)/)) {
            const heading = line.replace(/^###\s+/, '');
            formatted.push(
              <h3 key={`heading-${i}-${idx}`} className="text-xl font-bold text-white mt-8 mb-4">
                {heading}
              </h3>
            );
          } else if (line.trim()) {
            formatted.push(
              <span key={`text-${i}-${idx}`}>
                {line}
                {idx < lines.length - 1 && <br />}
              </span>
            );
          } else if (idx < lines.length - 1) {
            formatted.push(<br key={`br-${i}-${idx}`} />);
          }
        });
      }
    }

    return formatted;
  }, [text, citations, onCitationClick, citations.length]);

  return (
    <div className="text-gray-300 leading-relaxed text-left max-w-4xl" style={{ lineHeight: '1.8' }}>
      {formattedContent}
    </div>
  );
};

export default function StreamedContentWithCards({
  text,
  citations,
  suppliers,
  products,
  query,
  onCitationClick,
}: StreamedContentWithCardsProps) {
  return (
    <div className="space-y-8">
      {/* AI-Generated Market Intelligence */}
      {text && (
        <div>
          <FormattedTextContent
            text={text}
            citations={citations}
            onCitationClick={onCitationClick}
          />
        </div>
      )}

      {/* Suppliers and Products Section */}
      {(suppliers.length > 0 || products.length > 0) && (
        <div className="mt-12 pt-8 border-t border-gray-700">

          {/* Suppliers Section */}
          {suppliers.length > 0 && (
            <div className="mb-10">
              <h4 className="text-lg font-semibold text-gray-200 mb-4">
                Suppliers ({suppliers.length})
              </h4>
              <div className="space-y-4">
                {suppliers.slice(0, 5).map((supplier, supplierIdx) => (
                  <SupplierCard
                    key={supplier.Supplier_ID || supplierIdx}
                    supplier={supplier}
                    priority={true}
                    index={supplierIdx}
                  />
                ))}
              </div>
              {suppliers.length > 5 && (
                <p className="text-sm text-gray-400 mt-4">
                  Showing top 5 of {suppliers.length} suppliers
                </p>
              )}
            </div>
          )}

          {/* Products Section */}
          {products.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-200 mb-4">
                Products ({products.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, 6).map((product, productIdx) => (
                  <ProductCard
                    key={product.id || productIdx}
                    product={product}
                    priority={true}
                    index={productIdx}
                  />
                ))}
              </div>
              {products.length > 6 && (
                <p className="text-sm text-gray-400 mt-4">
                  Showing top 6 of {products.length} products
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}