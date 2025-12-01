'use client'

import React, { useState } from 'react';
import { useSupplierSocialLinks, useSocialLinkManager } from '@/hooks/useSupplierSocialLinks';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  ExternalLink,
  Save,
  X
} from 'lucide-react';
import {
  validateSocialUrl,
  getPlatformDisplayName,
  getPlatformColor,
  type SocialPlatform
} from '@/lib/socialMediaValidation';
import toast from 'react-hot-toast';

interface SocialMediaManagerProps {
  supplierId: string;
}

const AVAILABLE_PLATFORMS: SocialPlatform[] = [
  'linkedin',
  'facebook',
  'twitter',
  'instagram',
  'youtube',
  'whatsapp',
  'tiktok',
  'pinterest',
];

export default function SocialMediaManager({ supplierId }: SocialMediaManagerProps) {
  const { data: links = [], isLoading } = useSupplierSocialLinks(supplierId, false);
  const { addLink, updateLink, deleteLink } = useSocialLinkManager(supplierId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const usedPlatforms = new Set(links.map(link => link.platform));
  const availablePlatforms = AVAILABLE_PLATFORMS.filter(p => !usedPlatforms.has(p));

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-themed-secondary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-themed">Social Media Links</h2>
          <p className="text-themed-muted text-sm mt-1">
            Add your social media profiles to build trust with buyers
          </p>
        </div>

        {availablePlatforms.length > 0 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#F4A024] hover:bg-[#d88f1f] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Platform
          </button>
        )}
      </div>

      {links.length === 0 ? (
        <div className="bg-themed-card border-themed rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-themed-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-themed-muted" />
            </div>
            <h3 className="text-lg font-semibold text-themed mb-2">
              No Social Media Links Yet
            </h3>
            <p className="text-themed-muted mb-6">
              Add your social media profiles to increase trust and visibility with potential buyers
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#F4A024] hover:bg-[#d88f1f] text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Platform
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <SocialLinkCard
              key={link.id}
              link={link}
              isEditing={editingLink === link.id}
              onEdit={() => setEditingLink(link.id)}
              onCancelEdit={() => setEditingLink(null)}
              onUpdate={(updates) => {
                updateLink.mutate({ id: link.id, updates });
                setEditingLink(null);
              }}
              onDelete={() => setDeleteConfirm(link.id)}
              onToggleVisibility={() => {
                updateLink.mutate({
                  id: link.id,
                  updates: { is_visible: !link.is_visible }
                });
              }}
            />
          ))}
        </div>
      )}

      {/* Add Platform Modal */}
      {showAddModal && (
        <AddSocialLinkModal
          supplierId={supplierId}
          availablePlatforms={availablePlatforms}
          onClose={() => setShowAddModal(false)}
          onAdd={(data) => {
            addLink.mutate(data);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <ConfirmDeleteModal
          onConfirm={() => {
            deleteLink.mutate(deleteConfirm);
            setDeleteConfirm(null);
          }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

// Social Link Card Component
function SocialLinkCard({ link, isEditing, onEdit, onCancelEdit, onUpdate, onDelete, onToggleVisibility }: any) {
  const [url, setUrl] = useState(link.profile_url);
  const [error, setError] = useState('');

  const handleSave = () => {
    const validation = validateSocialUrl(link.platform, url);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid URL');
      return;
    }

    onUpdate({
      profile_url: validation.sanitizedUrl,
      profile_handle: validation.handle,
    });
  };

  return (
    <div className="bg-themed-card border-themed rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Platform Icon */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: getPlatformColor(link.platform) }}
          >
            <span className="text-lg font-bold">
              {link.platform.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Platform Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-themed">
                {getPlatformDisplayName(link.platform)}
              </h3>
              {link.is_verified && (
                <CheckCircle className="w-4 h-4 text-blue-500" fill="currentColor" />
              )}
              {!link.is_visible && (
                <span className="text-xs bg-themed-secondary text-themed-muted px-2 py-0.5 rounded">
                  Hidden
                </span>
              )}
            </div>

            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-themed-secondary border-themed text-themed text-sm"
                  placeholder={`Enter ${link.platform} URL`}
                />
                {error && (
                  <p className="text-red-500 text-xs mt-1">{error}</p>
                )}
              </div>
            ) : (
              <a
                href={link.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-themed-muted hover:text-[#F4A024] transition-colors truncate block"
              >
                {link.profile_url}
                <ExternalLink className="w-3 h-3 inline ml-1" />
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-2 hover:bg-themed-secondary rounded-lg transition-colors text-green-600"
                title="Save"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={onCancelEdit}
                className="p-2 hover:bg-themed-secondary rounded-lg transition-colors text-themed-muted"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onToggleVisibility}
                className="p-2 hover:bg-themed-secondary rounded-lg transition-colors text-themed-muted"
                title={link.is_visible ? 'Hide' : 'Show'}
              >
                {link.is_visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={onEdit}
                className="p-2 hover:bg-themed-secondary rounded-lg transition-colors text-themed-muted"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 hover:bg-themed-secondary rounded-lg transition-colors text-red-600"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Add Social Link Modal
function AddSocialLinkModal({ availablePlatforms, onClose, onAdd }: any) {
  const [platform, setPlatform] = useState<SocialPlatform | ''>('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!platform) {
      setError('Please select a platform');
      return;
    }

    const validation = validateSocialUrl(platform as SocialPlatform, url);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid URL');
      return;
    }

    onAdd({
      platform,
      profile_url: validation.sanitizedUrl,
      profile_handle: validation.handle,
      is_visible: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-themed-card rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-themed mb-6">Add Social Platform</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-themed mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value as SocialPlatform);
                setError('');
              }}
              className="w-full px-4 py-3 rounded-lg bg-themed-secondary border-themed text-themed"
            >
              <option value="">Select a platform</option>
              {availablePlatforms.map((p) => (
                <option key={p} value={p}>
                  {getPlatformDisplayName(p)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-themed mb-2">
              Profile URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 rounded-lg bg-themed-secondary border-themed text-themed"
              placeholder={platform ? `Enter your ${getPlatformDisplayName(platform as SocialPlatform)} URL` : 'Select a platform first'}
              disabled={!platform}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border-themed hover:bg-themed-secondary text-themed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-lg bg-[#F4A024] hover:bg-[#d88f1f] text-white transition-colors"
            >
              Add Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Confirm Delete Modal
function ConfirmDeleteModal({ onConfirm, onCancel }: any) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-themed-card rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-themed mb-4">Delete Social Link?</h2>
        <p className="text-themed-muted mb-6">
          Are you sure you want to delete this social media link? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-lg border-themed hover:bg-themed-secondary text-themed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
