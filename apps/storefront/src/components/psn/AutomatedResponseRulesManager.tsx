'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Zap, Clock, Tag, MessageSquare, Power, PowerOff } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

interface AutomatedRule {
  id: string;
  template_id: string;
  rule_name: string;
  trigger_type: string;
  trigger_conditions: any;
  priority: number;
  delay_seconds: number;
  is_active: boolean;
  require_manual_approval: boolean;
  template?: {
    title: string;
    content: string;
  };
}

interface Template {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface AutomatedResponseRulesManagerProps {
  supplierId: string;
}

const TRIGGER_TYPES = [
  { value: 'keyword', label: 'Keyword Match', icon: Tag },
  { value: 'new_conversation', label: 'New Conversation', icon: MessageSquare },
  { value: 'time_based', label: 'Time Based', icon: Clock },
  { value: 'product_inquiry', label: 'Product Inquiry', icon: Zap }
];

export default function AutomatedResponseRulesManager({ supplierId }: AutomatedResponseRulesManagerProps) {
  const [rules, setRules] = useState<AutomatedRule[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<AutomatedRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    rule_name: '',
    template_id: '',
    trigger_type: 'keyword',
    keywords: [''],
    priority: 0,
    delay_seconds: 0,
    require_manual_approval: false
  });

  useEffect(() => {
    fetchRules();
    fetchTemplates();
  }, [supplierId]);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('automated_template_rules')
        .select(`
          *,
          template:template_id (
            title,
            content
          )
        `)
        .eq('supplier_id', supplierId)
        .order('priority', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Failed to load automation rules');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('id, title, content, category')
        .eq('supplier_id', supplierId)
        .eq('is_active', true)
        .order('title');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleCreateRule = async () => {
    if (!formData.rule_name.trim() || !formData.template_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.trigger_type === 'keyword' && formData.keywords.filter(k => k.trim()).length === 0) {
      toast.error('Please add at least one keyword');
      return;
    }

    try {
      const { data: { session } } = await // TODO: Use getCurrentUser() from @/lib/data/cookies - getSession();
      if (!session?.user) {
        toast.error('You must be logged in');
        return;
      }

      const triggerConditions: any = {};
      if (formData.trigger_type === 'keyword') {
        triggerConditions.keywords = formData.keywords.filter(k => k.trim());
      }

      const { error } = await supabase
        .from('automated_template_rules')
        .insert({
          supplier_id: supplierId,
          template_id: formData.template_id,
          rule_name: formData.rule_name,
          trigger_type: formData.trigger_type,
          trigger_conditions: triggerConditions,
          priority: formData.priority,
          delay_seconds: formData.delay_seconds,
          require_manual_approval: formData.require_manual_approval,
          created_by: session.user.id
        });

      if (error) throw error;

      toast.success('Automation rule created successfully');
      setIsCreating(false);
      resetForm();
      fetchRules();
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error('Failed to create automation rule');
    }
  };

  const handleUpdateRule = async () => {
    if (!editingRule || !formData.rule_name.trim() || !formData.template_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const triggerConditions: any = {};
      if (formData.trigger_type === 'keyword') {
        triggerConditions.keywords = formData.keywords.filter(k => k.trim());
      }

      const { error } = await supabase
        .from('automated_template_rules')
        .update({
          template_id: formData.template_id,
          rule_name: formData.rule_name,
          trigger_type: formData.trigger_type,
          trigger_conditions: triggerConditions,
          priority: formData.priority,
          delay_seconds: formData.delay_seconds,
          require_manual_approval: formData.require_manual_approval
        })
        .eq('id', editingRule.id);

      if (error) throw error;

      toast.success('Automation rule updated successfully');
      setEditingRule(null);
      resetForm();
      fetchRules();
    } catch (error) {
      console.error('Error updating rule:', error);
      toast.error('Failed to update automation rule');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return;

    try {
      const { error } = await supabase
        .from('automated_template_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast.success('Automation rule deleted successfully');
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete automation rule');
    }
  };

  const toggleRuleActive = async (rule: AutomatedRule) => {
    try {
      const { error } = await supabase
        .from('automated_template_rules')
        .update({ is_active: !rule.is_active })
        .eq('id', rule.id);

      if (error) throw error;

      toast.success(`Automation rule ${!rule.is_active ? 'enabled' : 'disabled'}`);
      fetchRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Failed to toggle automation rule');
    }
  };

  const startEdit = (rule: AutomatedRule) => {
    setEditingRule(rule);
    setFormData({
      rule_name: rule.rule_name,
      template_id: rule.template_id,
      trigger_type: rule.trigger_type,
      keywords: rule.trigger_conditions?.keywords || [''],
      priority: rule.priority,
      delay_seconds: rule.delay_seconds,
      require_manual_approval: rule.require_manual_approval
    });
    setIsCreating(false);
  };

  const resetForm = () => {
    setFormData({
      rule_name: '',
      template_id: '',
      trigger_type: 'keyword',
      keywords: [''],
      priority: 0,
      delay_seconds: 0,
      require_manual_approval: false
    });
  };

  const cancelEdit = () => {
    setEditingRule(null);
    setIsCreating(false);
    resetForm();
  };

  const addKeywordField = () => {
    setFormData({
      ...formData,
      keywords: [...formData.keywords, '']
    });
  };

  const removeKeywordField = (index: number) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((_, i) => i !== index)
    });
  };

  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...formData.keywords];
    newKeywords[index] = value;
    setFormData({
      ...formData,
      keywords: newKeywords
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold dark:text-gray-100 light:text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#F4A024]" />
            Automated Response Rules
          </h2>
          <p className="text-sm dark:text-gray-400 light:text-gray-600 mt-1">
            Set up automatic responses based on triggers
          </p>
        </div>
        {!isCreating && !editingRule && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            New Rule
          </button>
        )}
      </div>

      {templates.length === 0 && (
        <div className="p-4 dark:bg-yellow-900/20 light:bg-yellow-100 border border-yellow-500/50 rounded-lg">
          <p className="text-sm dark:text-yellow-200 light:text-yellow-800">
            You need to create message templates before setting up automation rules.
          </p>
        </div>
      )}

      {(isCreating || editingRule) && (
        <div className="p-6 dark:bg-gray-800/50 light:bg-gray-50 rounded-lg border dark:border-gray-700 light:border-gray-200">
          <h3 className="text-lg font-semibold dark:text-gray-100 light:text-gray-900 mb-4">
            {editingRule ? 'Edit Automation Rule' : 'Create New Automation Rule'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-1">
                Rule Name
              </label>
              <input
                type="text"
                value={formData.rule_name}
                onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                placeholder="e.g., Welcome Message for New Inquiries"
                className="w-full px-3 py-2 dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A024]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-1">
                Template
              </label>
              <select
                value={formData.template_id}
                onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                className="w-full px-3 py-2 dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A024]"
              >
                <option value="">Select a template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.title} ({template.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-1">
                Trigger Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TRIGGER_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, trigger_type: type.value })}
                      className={`p-3 rounded-lg border transition-all ${
                        formData.trigger_type === type.value
                          ? 'border-[#F4A024] bg-[#F4A024]/10'
                          : 'dark:border-gray-700 light:border-gray-200 dark:hover:bg-gray-700 light:hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1 mx-auto dark:text-gray-300 light:text-gray-700" />
                      <p className="text-xs dark:text-gray-300 light:text-gray-700 text-center">
                        {type.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.trigger_type === 'keyword' && (
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-1">
                  Keywords (trigger if message contains any of these)
                </label>
                <div className="space-y-2">
                  {formData.keywords.map((keyword, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => updateKeyword(index, e.target.value)}
                        placeholder="Enter keyword..."
                        className="flex-1 px-3 py-2 dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A024]"
                      />
                      {formData.keywords.length > 1 && (
                        <button
                          onClick={() => removeKeywordField(index)}
                          className="px-3 py-2 dark:bg-gray-700 light:bg-gray-200 dark:text-gray-300 light:text-gray-700 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addKeywordField}
                    className="text-sm text-[#F4A024] hover:text-[#F4A024]/80 transition-colors"
                  >
                    + Add another keyword
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-1">
                  Priority (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A024]"
                />
                <p className="text-xs dark:text-gray-400 light:text-gray-600 mt-1">
                  Higher priority rules are checked first
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 light:text-gray-700 mb-1">
                  Delay (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  max="3600"
                  value={formData.delay_seconds}
                  onChange={(e) => setFormData({ ...formData, delay_seconds: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 dark:bg-gray-700 light:bg-white dark:border-gray-600 light:border-gray-300 border rounded-lg dark:text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A024]"
                />
                <p className="text-xs dark:text-gray-400 light:text-gray-600 mt-1">
                  Wait before sending (0-3600)
                </p>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.require_manual_approval}
                  onChange={(e) => setFormData({ ...formData, require_manual_approval: e.target.checked })}
                  className="w-4 h-4 text-[#F4A024] rounded focus:ring-[#F4A024]"
                />
                <span className="text-sm dark:text-gray-300 light:text-gray-700">
                  Require manual approval before sending
                </span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={editingRule ? handleUpdateRule : handleCreateRule}
                className="flex items-center gap-2 px-4 py-2 bg-[#F4A024] text-gray-900 rounded-lg hover:bg-[#F4A024]/90 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                {editingRule ? 'Save Changes' : 'Create Rule'}
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

      {!isCreating && !editingRule && (
        <>
          {rules.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 dark:text-gray-400 light:text-gray-400 mx-auto mb-4" />
              <p className="dark:text-gray-400 light:text-gray-600">
                No automation rules yet. Create your first rule to automatically respond to customer inquiries.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className="p-4 dark:bg-gray-800/50 light:bg-gray-50 rounded-lg border dark:border-gray-700 light:border-gray-200 hover:border-[#F4A024] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium dark:text-gray-100 light:text-gray-900">
                          {rule.rule_name}
                        </h3>
                        <span className="px-2 py-0.5 text-xs dark:bg-gray-700 light:bg-gray-200 dark:text-gray-300 light:text-gray-700 rounded">
                          {TRIGGER_TYPES.find(t => t.value === rule.trigger_type)?.label}
                        </span>
                        {rule.require_manual_approval && (
                          <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-500 rounded">
                            Manual Approval
                          </span>
                        )}
                      </div>
                      <p className="text-sm dark:text-gray-400 light:text-gray-600 mb-1">
                        Template: {rule.template?.title}
                      </p>
                      <div className="flex items-center gap-4 text-xs dark:text-gray-500 light:text-gray-500">
                        <span>Priority: {rule.priority}</span>
                        <span>Delay: {rule.delay_seconds}s</span>
                        {rule.trigger_conditions?.keywords && (
                          <span>
                            Keywords: {rule.trigger_conditions.keywords.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleRuleActive(rule)}
                        className={`p-2 rounded transition-colors ${
                          rule.is_active
                            ? 'dark:text-green-400 light:text-green-600 hover:bg-green-500/20'
                            : 'dark:text-gray-400 light:text-gray-600 hover:bg-gray-600/20'
                        }`}
                        title={rule.is_active ? 'Disable rule' : 'Enable rule'}
                      >
                        {rule.is_active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => startEdit(rule)}
                        className="p-2 dark:text-gray-400 light:text-gray-600 hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 dark:text-gray-400 light:text-gray-600 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
