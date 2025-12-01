'use client'

import React, { useState, useEffect } from 'react';
import { CreditCard, Loader2, Plus, Trash2, Check } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import LoadingSpinner from './LoadingSpinner';

interface PaymentMethodSelectorProps {
  onSelect: (gateway: string, methodId?: string) => void;
  selectedGateway?: string;
  selectedMethod?: string;
}

export default function PaymentMethodSelector({
  onSelect,
  selectedGateway,
  selectedMethod
}: PaymentMethodSelectorProps) {
  const {
    paymentMethods,
    availableGateways,
    loadingMethods,
    setDefaultPaymentMethod,
    removePaymentMethod
  } = usePayment();

  const [localSelectedGateway, setLocalSelectedGateway] = useState(selectedGateway || '');
  const [localSelectedMethod, setLocalSelectedMethod] = useState(selectedMethod || '');

  useEffect(() => {
    if (availableGateways.length > 0 && !localSelectedGateway) {
      const defaultGateway = availableGateways[0].gateway_name;
      setLocalSelectedGateway(defaultGateway);
      onSelect(defaultGateway);
    }
  }, [availableGateways]);

  const handleGatewaySelect = (gateway: string) => {
    setLocalSelectedGateway(gateway);
    setLocalSelectedMethod('');
    onSelect(gateway);
  };

  const handleMethodSelect = (methodId: string) => {
    setLocalSelectedMethod(methodId);
    onSelect(localSelectedGateway, methodId);
  };

  if (loadingMethods) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const gatewayMethods = paymentMethods.filter(
    method => method.type === 'card' ? localSelectedGateway === 'stripe' : localSelectedGateway === 'paypal'
  );

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Payment Gateway
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableGateways.map((gateway) => (
            <button
              key={gateway.gateway_name}
              onClick={() => handleGatewaySelect(gateway.gateway_name)}
              className={`p-4 rounded-lg border-2 transition-all ${
                localSelectedGateway === gateway.gateway_name
                  ? 'border-[#F4A024] bg-[#F4A024]/10'
                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[#F4A024]" />
                  <div className="text-left">
                    <p className="font-medium text-white">{gateway.display_name}</p>
                    <p className="text-xs text-gray-400">
                      {gateway.supported_currencies.slice(0, 3).join(', ')}
                    </p>
                  </div>
                </div>
                {localSelectedGateway === gateway.gateway_name && (
                  <Check className="w-5 h-5 text-[#F4A024]" />
                )}
              </div>
              {gateway.is_test_mode && (
                <span className="mt-2 inline-block text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                  Test Mode
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {localSelectedGateway && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Saved Payment Methods
          </label>

          {gatewayMethods.length > 0 ? (
            <div className="space-y-2">
              {gatewayMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    localSelectedMethod === method.id
                      ? 'border-[#F4A024] bg-[#F4A024]/10'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  }`}
                  onClick={() => handleMethodSelect(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {method.card_brand ? method.card_brand.toUpperCase() : 'PayPal'}
                          </span>
                          {method.last_four && (
                            <span className="text-gray-400">**** {method.last_four}</span>
                          )}
                          {method.is_default && (
                            <span className="px-2 py-0.5 bg-[#F4A024]/20 text-[#F4A024] text-xs rounded">
                              Default
                            </span>
                          )}
                        </div>
                        {method.expiry_month && method.expiry_year && (
                          <p className="text-sm text-gray-400">
                            Expires {method.expiry_month}/{method.expiry_year}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.is_default && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDefaultPaymentMethod(method.id);
                          }}
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Remove this payment method?')) {
                            removePaymentMethod(method.id);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                className="w-full p-4 rounded-lg border-2 border-dashed border-gray-600 bg-gray-700/30 hover:border-gray-500 hover:bg-gray-700/50 transition-all text-gray-300 hover:text-white"
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>Add New Payment Method</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-lg border-2 border-dashed border-gray-600 bg-gray-700/30 text-center">
              <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No saved payment methods</p>
              <button
                className="bg-[#F4A024] text-gray-900 px-6 py-2 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium"
              >
                Add Payment Method
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="font-medium text-blue-400">Secure Payment:</span> All payments are processed
          securely through our payment partners. Your payment information is encrypted and never stored on
          our servers.
        </p>
      </div>
    </div>
  );
}
