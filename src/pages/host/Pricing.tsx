import { useState } from 'react';
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useProperty } from '@/hooks/useProperties';
import { usePricingRules, useCreatePricingRule, useUpdatePricingRule, useDeletePricingRule, usePreviewRates } from '@/hooks/usePricing';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

const INPUT_CLASS = 'w-full h-9 rounded-xl border border-warm-200 bg-white px-3 text-sm text-navy-950 placeholder:text-warm-400 outline-none transition-all duration-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15';
const LABEL_CLASS = 'block text-xs font-medium text-navy-700 mb-1';

const RULE_TYPE_COLORS: Record<string, string> = {
  weekend: 'bg-blue-50 text-blue-700 border-blue-200',
  seasonal: 'bg-gold-100 text-gold-700 border-gold-300',
  last_minute: 'bg-red-50 text-red-700 border-red-200',
  occupancy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const RULE_TYPE_LABELS: Record<string, string> = {
  weekend: 'Weekend',
  seasonal: 'Seasonal',
  last_minute: 'Last Minute',
  occupancy: 'Occupancy',
};

function AddRuleForm({
  roomTypeId,
  onDone,
}: {
  roomTypeId: string;
  onDone: () => void;
}) {
  const { mutateAsync: createRule } = useCreatePricingRule();
  const [ruleType, setRuleType] = useState<'weekend' | 'seasonal' | 'last_minute' | 'occupancy'>('weekend');
  const [adjustmentType, setAdjustmentType] = useState<'percentage' | 'fixed'>('percentage');
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [priority, setPriority] = useState('1');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [daysBefore, setDaysBefore] = useState('');
  const [threshold, setThreshold] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !value) { setError('Name and value are required.'); return; }
    setError('');
    setLoading(true);
    try {
      await createRule({
        room_type_id: roomTypeId,
        name,
        rule_type: ruleType,
        adjustment_type: adjustmentType,
        adjustment_value: parseFloat(value),
        priority: parseInt(priority) || 1,
        ...(ruleType === 'seasonal' ? { date_from: dateFrom, date_to: dateTo } : {}),
        ...(ruleType === 'last_minute' ? { days_before_checkin: parseInt(daysBefore) || 7 } : {}),
        ...(ruleType === 'occupancy' ? { occupancy_threshold: parseFloat(threshold) || 80 } : {}),
      });
      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create rule.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-warm-50 rounded-xl border border-dashed border-warm-300 p-4 space-y-3">
      <h4 className="font-semibold text-navy-950 text-sm">New Pricing Rule</h4>
      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS}>Rule Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASS} placeholder="Weekend Surge" />
        </div>
        <div>
          <label className={LABEL_CLASS}>Priority</label>
          <input value={priority} onChange={(e) => setPriority(e.target.value)} type="number" min="1" className={INPUT_CLASS} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={LABEL_CLASS}>Rule Type</label>
          <select value={ruleType} onChange={(e) => setRuleType(e.target.value as typeof ruleType)} className={INPUT_CLASS}>
            <option value="weekend">Weekend</option>
            <option value="seasonal">Seasonal</option>
            <option value="last_minute">Last Minute</option>
            <option value="occupancy">Occupancy</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Adjustment Type</label>
          <select value={adjustmentType} onChange={(e) => setAdjustmentType(e.target.value as typeof adjustmentType)} className={INPUT_CLASS}>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed ($)</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Value *</label>
          <input value={value} onChange={(e) => setValue(e.target.value)} type="number" step="any" className={INPUT_CLASS} placeholder={adjustmentType === 'percentage' ? '15' : '20'} />
        </div>
      </div>

      {/* Conditional fields */}
      {ruleType === 'seasonal' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLASS}>From Date</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>To Date</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={INPUT_CLASS} />
          </div>
        </div>
      )}
      {ruleType === 'last_minute' && (
        <div className="max-w-xs">
          <label className={LABEL_CLASS}>Days Before Check-in</label>
          <input value={daysBefore} onChange={(e) => setDaysBefore(e.target.value)} type="number" min="1" className={INPUT_CLASS} placeholder="7" />
        </div>
      )}
      {ruleType === 'occupancy' && (
        <div className="max-w-xs">
          <label className={LABEL_CLASS}>Occupancy Threshold (%)</label>
          <input value={threshold} onChange={(e) => setThreshold(e.target.value)} type="number" min="0" max="100" className={INPUT_CLASS} placeholder="80" />
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onDone} className="px-3 py-1.5 rounded-lg text-xs font-medium text-warm-700 border border-warm-200 hover:border-warm-300 transition-colors">Cancel</button>
        <button onClick={handleSubmit} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-semibold transition-colors disabled:opacity-60">
          {loading && <Loader2 size={12} className="animate-spin" />}
          Add Rule
        </button>
      </div>
    </div>
  );
}

export default function Pricing() {
  const { data: properties } = useProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const [showAddRule, setShowAddRule] = useState(false);

  // Preview state
  const [previewStart, setPreviewStart] = useState('');
  const [previewEnd, setPreviewEnd] = useState('');
  const [previewEnabled, setPreviewEnabled] = useState(false);

  const { data: property } = useProperty(selectedPropertyId);
  const { data: rules, isLoading: rulesLoading } = usePricingRules(selectedRoomTypeId);
  const { mutateAsync: updateRule } = useUpdatePricingRule();
  const { mutateAsync: deleteRule } = useDeletePricingRule();

  const { data: previewData, isLoading: previewLoading } = usePreviewRates(
    previewEnabled && selectedRoomTypeId && previewStart && previewEnd
      ? { room_type_id: selectedRoomTypeId, start_date: previewStart, end_date: previewEnd }
      : null,
    previewEnabled,
  );

  const handleToggleActive = async (rule: { id: string; roomTypeId?: string; is_active: boolean }) => {
    await updateRule({ id: rule.id, roomTypeId: selectedRoomTypeId, is_active: !rule.is_active });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pricing rule?')) return;
    await deleteRule({ id, roomTypeId: selectedRoomTypeId });
  };

  const formatAdjustment = (rule: { adjustment_type: string; adjustment_value: number }) => {
    const sign = rule.adjustment_value >= 0 ? '+' : '';
    if (rule.adjustment_type === 'percentage') return `${sign}${rule.adjustment_value}%`;
    return `${sign}${formatCurrency(rule.adjustment_value * 100)}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Pricing Rules" description="Create dynamic pricing rules for your room types." />

      {/* Selectors */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-950 mb-2">Property</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => { setSelectedPropertyId(e.target.value); setSelectedRoomTypeId(''); setShowAddRule(false); }}
              className="w-full h-11 rounded-xl border border-warm-200 bg-white px-4 text-sm text-navy-950 outline-none transition-all focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15"
            >
              <option value="">Select a property</option>
              {properties?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-950 mb-2">Room Type</label>
            <select
              value={selectedRoomTypeId}
              onChange={(e) => { setSelectedRoomTypeId(e.target.value); setShowAddRule(false); setPreviewEnabled(false); }}
              disabled={!selectedPropertyId}
              className="w-full h-11 rounded-xl border border-warm-200 bg-white px-4 text-sm text-navy-950 outline-none transition-all focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select a room type</option>
              {property?.roomTypes?.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {!selectedRoomTypeId ? (
        <div className="text-center py-16 text-warm-500 text-sm">
          Select a property and room type to manage pricing rules.
        </div>
      ) : (
        <>
          {/* Rules */}
          <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base font-semibold text-navy-950">Active Rules</h2>
              {!showAddRule && (
                <button
                  onClick={() => setShowAddRule(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-semibold transition-colors"
                >
                  <Plus size={13} /> Add Rule
                </button>
              )}
            </div>

            {showAddRule && (
              <div className="mb-4">
                <AddRuleForm roomTypeId={selectedRoomTypeId} onDone={() => setShowAddRule(false)} />
              </div>
            )}

            {rulesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : !rules || rules.length === 0 ? (
              <EmptyState
                icon={Tag}
                title="No pricing rules"
                description="Add rules to dynamically adjust rates for weekends, seasons, or high demand."
              />
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-start gap-3 p-4 rounded-xl bg-warm-50 border border-warm-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border', RULE_TYPE_COLORS[rule.rule_type] ?? 'bg-warm-100 text-warm-600 border-warm-200')}>
                          {RULE_TYPE_LABELS[rule.rule_type] ?? rule.rule_type}
                        </span>
                        <span className="text-sm font-semibold text-navy-950">{rule.name}</span>
                        <span className={cn('text-sm font-bold', rule.adjustment_value >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                          {formatAdjustment(rule)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-warm-500">
                        <span>Priority: {rule.priority}</span>
                        {rule.date_from && rule.date_to && <span>{rule.date_from} → {rule.date_to}</span>}
                        {rule.days_before_checkin != null && <span>{rule.days_before_checkin}d before check-in</span>}
                        {rule.occupancy_threshold != null && <span>≥{rule.occupancy_threshold}% occupancy</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleActive({ id: rule.id, is_active: rule.is_active })}
                        className="text-warm-400 hover:text-navy-950 transition-colors"
                        title={rule.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {rule.is_active ? <ToggleRight size={22} className="text-gold-500" /> : <ToggleLeft size={22} />}
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1.5 rounded-lg text-warm-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rate Preview */}
          <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-5">
            <h2 className="font-heading text-base font-semibold text-navy-950 mb-4">Rate Preview</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              <div>
                <label className={LABEL_CLASS}>Start Date</label>
                <input type="date" value={previewStart} onChange={(e) => { setPreviewStart(e.target.value); setPreviewEnabled(false); }} className="h-9 rounded-xl border border-warm-200 bg-white px-3 text-sm text-navy-950 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15 transition-all" />
              </div>
              <div>
                <label className={LABEL_CLASS}>End Date</label>
                <input type="date" value={previewEnd} onChange={(e) => { setPreviewEnd(e.target.value); setPreviewEnabled(false); }} className="h-9 rounded-xl border border-warm-200 bg-white px-3 text-sm text-navy-950 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15 transition-all" />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setPreviewEnabled(true)}
                  disabled={!previewStart || !previewEnd}
                  className="h-9 px-4 rounded-xl bg-navy-950 hover:bg-navy-800 text-white text-sm font-medium transition-colors disabled:opacity-40"
                >
                  Preview
                </button>
              </div>
            </div>

            {previewLoading && <Skeleton className="h-32 w-full" />}

            {!previewLoading && previewEnabled && previewData && previewData.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-warm-200">
                      <th className="text-left text-xs font-semibold text-warm-500 pb-2">Date</th>
                      <th className="text-right text-xs font-semibold text-warm-500 pb-2">Base Rate</th>
                      <th className="text-right text-xs font-semibold text-warm-500 pb-2">Adjusted Rate</th>
                      <th className="text-center text-xs font-semibold text-warm-500 pb-2">Rule Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-100">
                    {previewData.map((p) => (
                      <tr key={p.date}>
                        <td className="py-2 text-navy-950">{p.date}</td>
                        <td className="py-2 text-right text-warm-600">{formatCurrency(p.baseRateCents)}</td>
                        <td className={cn('py-2 text-right font-medium', p.adjustmentApplied ? 'text-gold-600' : 'text-warm-600')}>
                          {formatCurrency(p.adjustedRateCents)}
                        </td>
                        <td className="py-2 text-center">
                          {p.adjustmentApplied ? (
                            <span className="inline-block w-2 h-2 rounded-full bg-gold-500" />
                          ) : (
                            <span className="inline-block w-2 h-2 rounded-full bg-warm-200" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!previewLoading && previewEnabled && (!previewData || previewData.length === 0) && (
              <p className="text-sm text-warm-400 text-center py-4">No preview data available for this date range.</p>
            )}

            {!previewEnabled && (
              <p className="text-sm text-warm-400 text-center py-4">Select a date range and click Preview to see effective rates.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
