'use client'

import React from 'react';
import { X } from 'lucide-react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsAndConditionsModal({ isOpen, onClose }: TermsAndConditionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden relative">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-[#F4A024]">Terms of Service</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors bg-gray-800 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-4">
              By using Paisán, users agree to use the platform only for lawful purposes and acknowledge that Paisán serves solely as a connector between buyers and Latin American suppliers and their associated marketplaces. Paisán does not purport to own or sell any of these products directly, all ownership and corresponding benefits is attributed to the product's suppliers and respective marketplaces.
            </p>

            <p className="text-gray-300 mb-4">
              All product listings, pricing, and supplier details are provided by third parties, and while we strive for accuracy, Paisán does not guarantee this information. We currently do not handle payments, shipments, or contracts between buyers and suppliers, and are not liable for any losses or issues that may arise from those transactions.
            </p>

            <p className="text-gray-300 mb-6">
              We reserve the right to remove any content, listings, or suppliers that violate our policies or engage in fraudulent or unethical behavior.
            </p>

            <h3 className="text-xl font-bold text-[#F4A024] mb-4">Buyer Guidelines</h3>
            <p className="text-gray-300 mb-4">
              Buyers are expected to engage in respectful, professional communication with suppliers. To foster a safe and productive environment, the following behaviors are strictly prohibited:
            </p>
            <ul className="list-disc pl-5 text-gray-300 mb-4">
              <li>Harassment, threats, or abusive language</li>
              <li>Inappropriate, off-topic, or spammy messages</li>
              <li>Misrepresentation of intent or identity</li>
            </ul>

            <p className="text-gray-300 mb-4">
              Violations of these guidelines may result in warnings, restrictions, or permanent suspension from the platform.
            </p>

            <p className="text-gray-300 mb-6">
              All communication with suppliers should remain business-focused. Repeated inappropriate or unsolicited contact may be treated as harassment.
            </p>

            <h3 className="text-xl font-bold text-[#F4A024] mb-4">Suppliers</h3>
            <p className="text-gray-300 mb-4">
              We reserve the right to remove or restrict supplier accounts that:
            </p>
            <ul className="list-disc pl-5 text-gray-300 mb-4">
              <li>Post misleading, false, or deceptive listings</li>
              <li>Fail to uphold communication standards</li>
              <li>Breach platform rules or local laws</li>
            </ul>

            <p className="text-gray-300 mb-4">
              Currently, Paisán only accepts suppliers based in <span className="font-bold text-[#F4A024]">Mexico</span> to maintain quality control and ensure dependable service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}