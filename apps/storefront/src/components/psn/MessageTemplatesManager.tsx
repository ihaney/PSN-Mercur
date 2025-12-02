'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, MessageSquare, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import { getCurrentUser } from '@/lib/data/user-actions';
import { createClientSupabaseClient } from '@/lib/supabase-client';

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

interface MessageTemplatesManagerProps {
  supplierId: string;
  onSelectTemplate?: (content: string) => void;
  compactMode?: boolean;
}

const TEMPLATE_CATEGORIES = [
  { value: 'greeting', label: 'Greeting' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'availability', label: 'Availability' },
  { value: 'product_info', label: 'Product Info' },
  { value: 'payment', label: 'Payment' },
  { value: 'return_policy', label: 'Return Policy' },
  { value: 'general', label: 'General' },
  { value: 'closing', label: 'Closing' }
];

export default function MessageTemplatesManager({
  supplierId,
  onSelectTemplate,
  compactMode = false
}: MessageTemplatesManagerProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchTemplates();
  }, [supplierId]);

  const fetchTemplates = async () => {
    try {
      const supabase = createClientSupabaseClient();
      if (!supabase) {
        console.error('Supabase not configured');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('supplier_id', supplierId)
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      const supabase = createClientSupabaseClient();
      if (!supabase) {
        toast.error('Service unavailable');
        return;
      }

      const { error } = await supabase
        .from('message_templates')
        .insert({
          supplier_id: supplierId,
          title: formData.title,
          content: formData.content,
          category: formData.category,
          created_by: user.id
        });

      if (error) throw error;

      toast.success('Template created successfully');
      setIsCreating(false);
      setFormData({ title: '', content: '', category: 'general' });
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const supabase = createClientSupabaseClient();
      if (!supabase) {
        toast.error('Service unavailable');
        return;
      }

      const { error } = await supabase
        .from('message_templates')
        .update({
          title: formData.title,
          content: formData.content,
          category: formData.category
        })
        .eq('id', editingTemplate.id);

      if (error) throw error;

      toast.success('Template updated successfully');
      setEditingTemplate(null);
      setFormData({ title: '', content: '', category: 'general' });
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const supabase = createClientSupabaseClient();
      if (!supabase) {
        toast.error('Service unavailable');
        return;
      }

      const { error } = await supabase
        .from('message_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;

      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleSelectTemplate = async (template: MessageTemplate) => {
    if (onSelectTemplate) {
      const supabase = createClientSupabaseClient();
      if (supabase) {
        await supabase.rpc('increment_template_usage', { p_template_id: template.id });
      }
      onSelectTemplate(template.content);
      toast.success('Template inserted');
    }
  };

  const startEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      content: template.content,
      category: template.category
    });
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingTemplate(null);
    setIsCreating(false);
    setFormData({ title: '', content: '', category: 'general' });
  };

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (compactMode && !isCreating && !editingTemplate) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium dark:text-gray-300 light:text-gray-700">Quick Replies</h3>
          <button
            onClick={() => setIsCreating(true)}
            className="text-sm text-[#F4A024] hover:text-[#F4A024]/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredTemplates.slice(0, 5).map(template => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className="px-3 py-1.5 text-xs dark:bg-gray-700 light:bg-gray-100 dark:text-gray-200 light:text-gray-700 rounded-full hover:bg-[#F4A024] hover:text-gray-900 transition-colors"
            >
              {template.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold dark:text-gray-100 light:text-gray-900">
          Message Templates
        </h2>
        {!isCreating && !editingTemplate && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        )}
      </div>

      {(isCreating || editingTemplate) && (
        <div className="p-4 dark:bg-gray-800/50 light:bg-gray-50 rounded-lg border dark:border-gray-700 light:border-gray-200">
          <h3 className="text-lg font-semibold dark:text-gray-100 light:text-gray-900 mb-4">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Pricing Information"
                className="w-full px-3 py-2 dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A024]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A024]"
              >
                {TEMPLATE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-1">
                Message Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter your template message..."
                rows={4}
                className="w-full px-3 py-2 dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A024] resize-none"
              />
              <p className="text-xs dark:text-gray-400 light:text-gray-600 mt-1">
                {formData.content.length} / 5000 characters
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                {editingTemplate ? 'Save Changes' : 'Create Template'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 dark:bg-gray-700 light:bg-gray-200 dark:text-gray-200 light:text-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {!isCreating && !editingTemplate && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#F4A024] text-gray-900'
                  : 'dark:bg-gray-700 light:bg-gray-100 dark:text-gray-300 light:text-gray-700 hover:bg-gray-600'
              }`}
            >
              All ({templates.length})
            </button>
            {TEMPLATE_CATEGORIES.map(cat => {
              const count = templates.filter(t => t.category === cat.value).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat.value
                      ? 'bg-[#F4A024] text-gray-900'
                      : 'dark:bg-gray-700 light:bg-gray-100 dark:text-gray-300 light:text-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 dark:text-gray-400 light:text-gray-400 mx-auto mb-4" />
              <p className="dark:text-gray-400 light:text-gray-600">
                No templates yet. Create your first template to respond quickly to common inquiries.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="p-4 dark:bg-gray-800/50 light:bg-gray-50 rounded-lg border dark:border-gray-700 light:border-gray-200 hover:border-[#F4A024] transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium dark:text-gray-100 light:text-gray-900">
                          {template.title}
                        </h3>
                        <span className="px-2 py-0.5 text-xs dark:bg-gray-700 light:bg-gray-200 dark:text-gray-300 light:text-gray-700 rounded">
                          {TEMPLATE_CATEGORIES.find(c => c.value === template.category)?.label}
                        </span>
                      </div>
                      <p className="text-sm dark:text-gray-400 light:text-gray-600">
                        Used {template.usage_count} times
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onSelectTemplate && (
                        <button
                          onClick={() => handleSelectTemplate(template)}
                          className="p-2 dark:text-gray-400 light:text-gray-600 hover:text-[#F4A024] transition-colors"
                          title="Use template"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(template)}
                        className="p-2 dark:text-gray-400 light:text-gray-600 hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 dark:text-gray-400 light:text-gray-600 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm dark:text-gray-300 light:text-gray-700 line-clamp-2">
                    {template.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
