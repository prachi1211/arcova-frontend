import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { addMonths, subMonths, startOfMonth, endOfMonth, format, eachDayOfInterval, getDay, startOfDay } from 'date-fns';
import { useProperties } from '@/hooks/useProperties';
import { useProperty } from '@/hooks/useProperties';
import { useAvailability, useBulkUpdateAvailability } from '@/hooks/useAvailability';
import { PageHeader } from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';
import type { Availability } from '@/types';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Availability() {
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  // Bulk update inputs
  const [availableRooms, setAvailableRooms] = useState('');
  const [isClosed, setIsClosed] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startStr = format(monthStart, 'yyyy-MM-dd');
  const endStr = format(monthEnd, 'yyyy-MM-dd');

  const { data: properties } = useProperties();
  const { data: property } = useProperty(selectedPropertyId);
  const { data: availabilityData, isLoading: availLoading } = useAvailability({
    propertyId: selectedPropertyId,
    start: startStr,
    end: endStr,
  });
  const { mutateAsync: bulkUpdate } = useBulkUpdateAvailability();

  // Map date string → availability
  const availabilityMap = useMemo(() => {
    const map = new Map<string, Availability>();
    for (const a of availabilityData ?? []) {
      map.set(a.date, a);
    }
    return map;
  }, [availabilityData]);

  // Build calendar grid
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = getDay(monthStart); // 0 = Sun

  const toggleDate = (dateStr: string) => {
    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
    if (dateStr < today) return; // Can't select past dates
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  };

  const handleApply = async () => {
    if (!selectedRoomTypeId || selectedDates.size === 0) return;
    setError('');
    setSuccess('');
    try {
      await bulkUpdate({
        entries: Array.from(selectedDates).map((date) => ({
          room_type_id: selectedRoomTypeId,
          date,
          available_rooms: parseInt(availableRooms) || 0,
          is_closed: isClosed,
        })),
      });
      setSuccess(`Updated ${selectedDates.size} dates successfully.`);
      setSelectedDates(new Set());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed.');
    }
  };

  const getCellStyle = (dateStr: string) => {
    const avail = availabilityMap.get(dateStr);
    const isSelected = selectedDates.has(dateStr);
    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const isPast = dateStr < today;

    if (isSelected) return 'bg-gold-500 text-navy-950 font-semibold';
    if (isPast) return 'bg-warm-50 text-warm-300 cursor-default';
    if (!avail) return 'bg-white hover:bg-warm-50 text-navy-950 cursor-pointer';
    if (avail.isClosed) return 'bg-red-50 text-red-400 cursor-pointer hover:bg-red-100';
    if (avail.availableRooms === 0) return 'bg-red-50 text-red-500 cursor-pointer hover:bg-red-100';
    return 'bg-emerald-50 text-emerald-700 cursor-pointer hover:bg-emerald-100';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Availability" description="Manage room availability by date." />

      {/* Selectors */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-950 mb-2">Property</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => { setSelectedPropertyId(e.target.value); setSelectedRoomTypeId(''); setSelectedDates(new Set()); }}
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
              onChange={(e) => { setSelectedRoomTypeId(e.target.value); setSelectedDates(new Set()); }}
              disabled={!selectedPropertyId}
              className="w-full h-11 rounded-xl border border-warm-200 bg-white px-4 text-sm text-navy-950 outline-none transition-all focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15 disabled:opacity-50"
            >
              <option value="">Select a room type</option>
              {property?.roomTypes?.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {!selectedPropertyId ? (
        <div className="text-center py-16 text-warm-500 text-sm">Select a property and room type to manage availability.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-warm-200 shadow-sm p-5">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-warm-100 transition-colors">
                <ChevronLeft size={18} className="text-navy-950" />
              </button>
              <h2 className="font-heading text-base font-semibold text-navy-950">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-warm-100 transition-colors">
                <ChevronRight size={18} className="text-navy-950" />
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-warm-400 py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            {availLoading ? (
              <div className="h-48 flex items-center justify-center text-sm text-warm-400">Loading availability…</div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for offset */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}

                {/* Day cells */}
                {days.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const avail = availabilityMap.get(dateStr);
                  return (
                    <div
                      key={dateStr}
                      onClick={() => toggleDate(dateStr)}
                      className={cn(
                        'rounded-lg p-1.5 text-center transition-all select-none',
                        getCellStyle(dateStr),
                      )}
                    >
                      <div className="text-xs font-medium">{format(day, 'd')}</div>
                      {avail && !avail.isClosed && (
                        <div className="text-[10px] mt-0.5 opacity-75">{avail.availableRooms}</div>
                      )}
                      {avail?.isClosed && (
                        <div className="text-[10px] mt-0.5 opacity-75">Closed</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-warm-100 text-xs text-warm-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" /> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-200" /> Closed</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gold-500" /> Selected</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border border-warm-200" /> No data</span>
            </div>
          </div>

          {/* Bulk update panel */}
          <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-5 h-fit">
            <h3 className="font-heading text-sm font-semibold text-navy-950 mb-4">
              Bulk Update
              {selectedDates.size > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-md bg-gold-100 text-gold-700 text-xs font-semibold">
                  {selectedDates.size} selected
                </span>
              )}
            </h3>

            {selectedDates.size === 0 ? (
              <p className="text-sm text-warm-400">Click dates on the calendar to select them, then set availability here.</p>
            ) : (
              <div className="space-y-4">
                {success && <p className="text-xs text-emerald-600">{success}</p>}
                {error && <p className="text-xs text-red-600">{error}</p>}

                <div>
                  <label className="block text-sm font-medium text-navy-950 mb-1.5">Available Rooms</label>
                  <input
                    type="number"
                    min="0"
                    value={availableRooms}
                    onChange={(e) => setAvailableRooms(e.target.value)}
                    className="w-full h-10 rounded-xl border border-warm-200 bg-white px-3 text-sm text-navy-950 outline-none transition-all focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15"
                    placeholder="e.g. 5"
                    disabled={isClosed}
                  />
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isClosed}
                    onChange={(e) => setIsClosed(e.target.checked)}
                    className="w-4 h-4 rounded border-warm-300 accent-gold-500"
                  />
                  <span className="text-sm text-warm-700">Close these dates</span>
                </label>

                {!selectedRoomTypeId && (
                  <p className="text-xs text-amber-600">Select a room type to apply changes.</p>
                )}

                <button
                  onClick={handleApply}
                  disabled={!selectedRoomTypeId || selectedDates.size === 0}
                  className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply to {selectedDates.size} date{selectedDates.size !== 1 ? 's' : ''}
                </button>

                <button
                  onClick={() => setSelectedDates(new Set())}
                  className="w-full py-2 rounded-xl border border-warm-200 text-warm-600 text-sm font-medium hover:border-warm-300 transition-colors"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
