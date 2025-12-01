'use client'

import React from 'react';
import { X, Mail, MessageSquare, Copy, Facebook, Twitter } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { safeWindowOpen } from '@/lib/urlSecurity';
import toast from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productUrl: string;
}

export default function ShareModal({ isOpen, onClose, productName, productUrl }: ShareModalProps) {
  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      toast.success('Link copied to clipboard!');
      analytics.trackEvent('product_share', {
        props: {
          product_name: productName,
          share_method: 'copy_link'
        }
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = productUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copied to clipboard!');
      analytics.trackEvent('product_share', {
        props: {
          product_name: productName,
          share_method: 'copy_link'
        }
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this product on Paisán`);
    const body = encodeURIComponent(`I found this product on Paisán.\n\n${productName}\n\n${productUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    
    analytics.trackEvent('product_share', {
      props: {
        product_name: productName,
        share_method: 'email'
      }
    });
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`I found this product on Paisán.\n\n${productName}\n\n${productUrl}`);
    safeWindowOpen(`https://wa.me/?text=${text}`);
    
    analytics.trackEvent('product_share', {
      props: {
        product_name: productName,
        share_method: 'whatsapp'
      }
    });
  };

  const handleFacebookShare = () => {
    const shareUrl = encodeURIComponent(productUrl);
    safeWindowOpen(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`);
    
    analytics.trackEvent('product_share', {
      props: {
        product_name: productName,
        share_method: 'facebook'
      }
    });
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Check out this product on Paisán: ${productName}`);
    const url = encodeURIComponent(productUrl);
    safeWindowOpen(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
    
    analytics.trackEvent('product_share', {
      props: {
        product_name: productName,
        share_method: 'twitter'
      }
    });
  };

  const handleRedditShare = () => {
    const title = encodeURIComponent(`Check out this product on Paisán: ${productName}`);
    const url = encodeURIComponent(productUrl);
    safeWindowOpen(`https://www.reddit.com/submit?title=${title}&url=${url}`);
    
    analytics.trackEvent('product_share', {
      props: {
        product_name: productName,
        share_method: 'reddit'
      }
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">
          Share Product
        </h2>

        <div className="space-y-4">
          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <Copy className="w-6 h-6 text-[#F4A024]" />
            </div>
            <div className="text-left">
              <div className="text-gray-100 font-medium">Copy Link</div>
              <div className="text-gray-400 text-sm">Copy product URL to clipboard</div>
            </div>
          </button>

          {/* Email */}
          <button
            onClick={handleEmailShare}
            className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-gray-100 font-medium">Email</div>
              <div className="text-gray-400 text-sm">Share via email</div>
            </div>
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-gray-100 font-medium">WhatsApp</div>
              <div className="text-gray-400 text-sm">Share via WhatsApp</div>
            </div>
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebookShare}
            className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Facebook className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-gray-100 font-medium">Facebook</div>
              <div className="text-gray-400 text-sm">Share on Facebook</div>
            </div>
          </button>

          {/* X (Twitter) */}
          <button
            onClick={handleTwitterShare}
            className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <Twitter className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-gray-100 font-medium">X (Twitter)</div>
              <div className="text-gray-400 text-sm">Share on X</div>
            </div>
          </button>

          {/* Reddit */}
          <button
            onClick={handleRedditShare}
            className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-gray-100 font-medium">Reddit</div>
              <div className="text-gray-400 text-sm">Share on Reddit</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}