import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Plus, X, Loader2, BedDouble, Trash2, CheckCircle2 } from 'lucide-react';
import { useCreateProperty, useCreateRoomType } from '@/hooks/useProperties';
import { PageHeader } from '@/components/shared/PageHeader';
import { AMENITY_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

// ─── Step 1 schema — property details ────────────────────────────────────────

const propertySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  property_type: z.enum(['hotel', 'resort', 'vacation_rental', 'hostel', 'boutique']).optional(),
  star_rating: z.coerce.number().min(1).max(5).optional(),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  address: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.object({ url: z.string().url('Must be a valid URL').or(z.literal('')) })).default([]),
  total_rooms: z.coerce.number().int().min(1, 'At least 1 room').default(1),
});

type PropertyFormData = z.infer<typeof propertySchema>;

// ─── Step 2 room type shape ───────────────────────────────────────────────────

interface RoomTypeInput {
  name: string;
  description: string;
  bed_type: string;
  max_guests: number;
  base_price: number; // in dollars, converted to cents on submit
  total_inventory: number;
}

const emptyRoom = (): RoomTypeInput => ({
  name: '',
  description: '',
  bed_type: '',
  max_guests: 2,
  base_price: 100,
  total_inventory: 1,
});

// ─── Shared styles ───────────────────────────────────────────────────────────

const INPUT_CLASS = 'w-full h-11 rounded-xl border border-warm-200 bg-white px-4 text-sm text-navy-950 placeholder:text-warm-400 outline-none transition-all duration-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15';
const LABEL_CLASS = 'block text-sm font-medium text-navy-950 mb-1.5';
const ERROR_CLASS = 'text-xs text-red-600 mt-1';

// ─── Component ───────────────────────────────────────────────────────────────

export default function NewProperty() {
  const navigate = useNavigate();
  const { mutateAsync: createProperty } = useCreateProperty();
  const { mutateAsync: createRoomType } = useCreateRoomType();

  const [step, setStep] = useState<1 | 2>(1);
  const [roomTypes, setRoomTypes] = useState<RoomTypeInput[]>([emptyRoom()]);
  const [roomErrors, setRoomErrors] = useState<Record<number, Record<string, string>>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema) as Resolver<PropertyFormData>,
    defaultValues: { amenities: [], images: [{ url: '' }], total_rooms: 1 },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control, name: 'images' });
  const selectedAmenities = watch('amenities');

  function toggleAmenity(key: string) {
    const current = selectedAmenities ?? [];
    setValue('amenities', current.includes(key) ? current.filter((a) => a !== key) : [...current, key]);
  }

  // ── Step 1 → Step 2 ──────────────────────────────────────────────────────

  async function handleNextStep() {
    const valid = await trigger();
    if (valid) setStep(2);
  }

  // ── Room type helpers ────────────────────────────────────────────────────

  function updateRoom(index: number, field: keyof RoomTypeInput, value: string | number) {
    setRoomTypes((prev) => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
    // Clear error for this field when user edits it
    setRoomErrors((prev) => {
      const updated = { ...prev };
      if (updated[index]) delete updated[index][field];
      return updated;
    });
  }

  function addRoom() {
    setRoomTypes((prev) => [...prev, emptyRoom()]);
  }

  function removeRoom(index: number) {
    setRoomTypes((prev) => prev.filter((_, i) => i !== index));
    setRoomErrors((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  }

  function validateRooms(): boolean {
    const errors: Record<number, Record<string, string>> = {};
    roomTypes.forEach((room, i) => {
      const roomErrs: Record<string, string> = {};
      if (!room.name.trim()) roomErrs.name = 'Room name is required';
      if (!room.max_guests || room.max_guests < 1) roomErrs.max_guests = 'At least 1 guest';
      if (!room.base_price || room.base_price < 1) roomErrs.base_price = 'Price must be at least $1';
      if (!room.total_inventory || room.total_inventory < 1) roomErrs.total_inventory = 'At least 1 room';
      if (Object.keys(roomErrs).length > 0) errors[i] = roomErrs;
    });
    setRoomErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Final submit ─────────────────────────────────────────────────────────

  async function onSubmit() {
    if (!validateRooms()) return;
    setServerError('');
    setIsSubmitting(true);
    try {
      const data = getValues();
      // Step 1: create the property
      // Note: getValues() returns raw strings from HTML inputs/selects.
      // We must explicitly coerce numeric fields and strip empty optional strings.
      const property = await createProperty({
        name: data.name,
        description: data.description || undefined,
        city: data.city,
        country: data.country,
        address: data.address || undefined,
        property_type: data.property_type || undefined,
        star_rating: data.star_rating ? Number(data.star_rating) : undefined,
        latitude: data.latitude ? Number(data.latitude) : undefined,
        longitude: data.longitude ? Number(data.longitude) : undefined,
        amenities: data.amenities,
        images: data.images.filter((i) => i.url).map((i) => i.url),
        total_rooms: Number(data.total_rooms) || 1,
      });

      // Step 2: create each room type sequentially
      for (const room of roomTypes) {
        await createRoomType({
          propertyId: property.id,
          name: room.name,
          description: room.description || undefined,
          bed_type: room.bed_type || undefined,
          max_guests: room.max_guests,
          base_price_cents: Math.round(room.base_price * 100),
          total_inventory: room.total_inventory,
        });
      }

      navigate('/host/properties');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Add Property"
        description="List a new property on Arcova."
        actions={
          <Link
            to="/host/properties"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-warm-200 text-sm font-medium text-warm-700 hover:border-warm-300 transition-colors"
          >
            <ArrowLeft size={15} /> Cancel
          </Link>
        }
      />

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-8">
        {/* Step 1 */}
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
            step === 1 ? 'bg-gold-500 text-navy-950' : 'bg-emerald-500 text-white',
          )}>
            {step > 1 ? <CheckCircle2 size={14} /> : '1'}
          </div>
          <span className={cn('text-sm font-medium', step === 1 ? 'text-navy-950' : 'text-emerald-600')}>
            Property Details
          </span>
        </div>

        <div className="flex-1 h-px bg-warm-200" />

        {/* Step 2 */}
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
            step === 2 ? 'bg-gold-500 text-navy-950' : 'bg-warm-200 text-warm-500',
          )}>
            2
          </div>
          <span className={cn('text-sm font-medium', step === 2 ? 'text-navy-950' : 'text-warm-400')}>
            Room Types
          </span>
        </div>
      </div>

      {serverError && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* ── STEP 1: Property Details ─────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-8">
          {/* Basic Info */}
          <section className="bg-white rounded-2xl border border-warm-200 p-6">
            <h2 className="font-heading text-base font-semibold text-navy-950 mb-5">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className={LABEL_CLASS}>Property Name *</label>
                <input {...register('name')} className={cn(INPUT_CLASS, errors.name && 'border-red-400')} placeholder="Grand Arcova Hotel" />
                {errors.name && <p className={ERROR_CLASS}>{errors.name.message}</p>}
              </div>
              <div>
                <label className={LABEL_CLASS}>Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm text-navy-950 placeholder:text-warm-400 outline-none transition-all duration-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15 resize-none"
                  placeholder="Tell guests what makes this property special…"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Property Type</label>
                  <select {...register('property_type')} className={INPUT_CLASS}>
                    <option value="">Select type</option>
                    <option value="hotel">Hotel</option>
                    <option value="resort">Resort</option>
                    <option value="vacation_rental">Vacation Rental</option>
                    <option value="hostel">Hostel</option>
                    <option value="boutique">Boutique</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Star Rating</label>
                  <select {...register('star_rating')} className={INPUT_CLASS}>
                    <option value="">Select rating</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="bg-white rounded-2xl border border-warm-200 p-6">
            <h2 className="font-heading text-base font-semibold text-navy-950 mb-5">Location</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>City *</label>
                  <input {...register('city')} className={cn(INPUT_CLASS, errors.city && 'border-red-400')} placeholder="Dubai" />
                  {errors.city && <p className={ERROR_CLASS}>{errors.city.message}</p>}
                </div>
                <div>
                  <label className={LABEL_CLASS}>Country *</label>
                  <input {...register('country')} className={cn(INPUT_CLASS, errors.country && 'border-red-400')} placeholder="UAE" />
                  {errors.country && <p className={ERROR_CLASS}>{errors.country.message}</p>}
                </div>
              </div>
              <div>
                <label className={LABEL_CLASS}>Address</label>
                <input {...register('address')} className={INPUT_CLASS} placeholder="123 Sheikh Zayed Road" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Latitude</label>
                  <input {...register('latitude')} type="number" step="any" className={INPUT_CLASS} placeholder="25.2048" />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Longitude</label>
                  <input {...register('longitude')} type="number" step="any" className={INPUT_CLASS} placeholder="55.2708" />
                </div>
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section className="bg-white rounded-2xl border border-warm-200 p-6">
            <h2 className="font-heading text-base font-semibold text-navy-950 mb-5">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(AMENITY_LABELS).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedAmenities?.includes(key) ?? false}
                    onChange={() => toggleAmenity(key)}
                    className="w-4 h-4 rounded border-warm-300 accent-gold-500"
                  />
                  <span className="text-sm text-warm-700 group-hover:text-navy-950 transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Images */}
          <section className="bg-white rounded-2xl border border-warm-200 p-6">
            <h2 className="font-heading text-base font-semibold text-navy-950 mb-5">Images (URLs)</h2>
            <div className="space-y-3">
              {imageFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`images.${index}.url`)}
                    className={cn(INPUT_CLASS, 'flex-1')}
                    placeholder="https://example.com/image.jpg"
                  />
                  {imageFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 rounded-xl border border-warm-200 text-warm-500 hover:text-red-500 hover:border-red-200 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              {imageFields.length < 5 && (
                <button
                  type="button"
                  onClick={() => appendImage({ url: '' })}
                  className="flex items-center gap-1.5 text-sm text-gold-600 hover:text-gold-500 transition-colors font-medium"
                >
                  <Plus size={15} /> Add image URL
                </button>
              )}
            </div>
          </section>

          {/* Inventory */}
          <section className="bg-white rounded-2xl border border-warm-200 p-6">
            <h2 className="font-heading text-base font-semibold text-navy-950 mb-5">Inventory</h2>
            <div className="max-w-xs">
              <label className={LABEL_CLASS}>Total Rooms</label>
              <input {...register('total_rooms')} type="number" min="1" className={INPUT_CLASS} />
              {errors.total_rooms && <p className={ERROR_CLASS}>{errors.total_rooms.message}</p>}
            </div>
          </section>

          {/* Next button */}
          <div className="flex justify-end gap-3 pb-4">
            <Link
              to="/host/properties"
              className="px-5 py-2.5 rounded-xl border border-warm-200 text-sm font-medium text-warm-700 hover:border-warm-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit(handleNextStep)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-navy-950 text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(212,168,83,0.25)]"
            >
              Next: Add Room Types <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Room Types ───────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-gold-50 border border-gold-200 rounded-2xl px-5 py-4">
            <p className="text-sm text-navy-950 font-medium">
              Add at least one room type. Travellers will see and book these rooms.
            </p>
          </div>

          {roomTypes.map((room, index) => (
            <section key={index} className="bg-white rounded-2xl border border-warm-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
                    <BedDouble size={15} className="text-navy-700" />
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-navy-950">
                    Room Type {index + 1}
                  </h3>
                </div>
                {roomTypes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRoom(index)}
                    className="p-1.5 rounded-lg text-warm-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className={LABEL_CLASS}>Room Name *</label>
                  <input
                    value={room.name}
                    onChange={(e) => updateRoom(index, 'name', e.target.value)}
                    className={cn(INPUT_CLASS, roomErrors[index]?.name && 'border-red-400')}
                    placeholder="e.g. Deluxe King Room"
                  />
                  {roomErrors[index]?.name && <p className={ERROR_CLASS}>{roomErrors[index].name}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className={LABEL_CLASS}>Description</label>
                  <input
                    value={room.description}
                    onChange={(e) => updateRoom(index, 'description', e.target.value)}
                    className={INPUT_CLASS}
                    placeholder="e.g. Spacious room with sea view"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Bed type */}
                  <div>
                    <label className={LABEL_CLASS}>Bed Type</label>
                    <select
                      value={room.bed_type}
                      onChange={(e) => updateRoom(index, 'bed_type', e.target.value)}
                      className={INPUT_CLASS}
                    >
                      <option value="">Select bed type</option>
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Queen">Queen</option>
                      <option value="King">King</option>
                      <option value="Twin">Twin</option>
                      <option value="Bunk">Bunk</option>
                    </select>
                  </div>

                  {/* Max guests */}
                  <div>
                    <label className={LABEL_CLASS}>Max Guests *</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={room.max_guests}
                      onChange={(e) => updateRoom(index, 'max_guests', Number(e.target.value))}
                      className={cn(INPUT_CLASS, roomErrors[index]?.max_guests && 'border-red-400')}
                    />
                    {roomErrors[index]?.max_guests && <p className={ERROR_CLASS}>{roomErrors[index].max_guests}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <label className={LABEL_CLASS}>Price per Night (USD) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-warm-500 font-medium">$</span>
                      <input
                        type="number"
                        min="1"
                        value={room.base_price}
                        onChange={(e) => updateRoom(index, 'base_price', Number(e.target.value))}
                        className={cn(INPUT_CLASS, 'pl-7', roomErrors[index]?.base_price && 'border-red-400')}
                        placeholder="100"
                      />
                    </div>
                    {roomErrors[index]?.base_price && <p className={ERROR_CLASS}>{roomErrors[index].base_price}</p>}
                  </div>

                  {/* Inventory */}
                  <div>
                    <label className={LABEL_CLASS}>Number of Rooms *</label>
                    <input
                      type="number"
                      min="1"
                      value={room.total_inventory}
                      onChange={(e) => updateRoom(index, 'total_inventory', Number(e.target.value))}
                      className={cn(INPUT_CLASS, roomErrors[index]?.total_inventory && 'border-red-400')}
                      placeholder="5"
                    />
                    {roomErrors[index]?.total_inventory && <p className={ERROR_CLASS}>{roomErrors[index].total_inventory}</p>}
                  </div>
                </div>
              </div>
            </section>
          ))}

          {/* Add another room type */}
          <button
            type="button"
            onClick={addRoom}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-warm-200 text-sm font-medium text-warm-500 hover:border-gold-400 hover:text-gold-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={15} /> Add Another Room Type
          </button>

          {/* Actions */}
          <div className="flex justify-between gap-3 pb-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-warm-200 text-sm font-medium text-warm-700 hover:border-warm-300 transition-colors"
            >
              <ArrowLeft size={15} /> Back
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-navy-950 text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(212,168,83,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              {isSubmitting ? 'Submitting…' : 'Submit for Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
