import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Edit2, Plus, Loader2, X, ChevronUp } from 'lucide-react';
import { useProperty, useUpdateProperty, useCreateRoomType, useUpdateRoomType } from '@/hooks/useProperties';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { AMENITY_LABELS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { RoomType } from '@/types';

const INPUT_CLASS = 'w-full h-11 rounded-xl border border-warm-200 bg-white px-4 text-sm text-navy-950 placeholder:text-warm-400 outline-none transition-all duration-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15';
const LABEL_CLASS = 'block text-sm font-medium text-navy-950 mb-1.5';
const ERROR_CLASS = 'text-xs text-red-600 mt-1';

const propertySchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  city: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  address: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  star_rating: z.coerce.number().min(1).max(5).optional(),
  property_type: z.enum(['hotel', 'resort', 'vacation_rental', 'hostel', 'boutique', '']).optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.object({ url: z.string() })).default([]),
  total_rooms: z.coerce.number().int().min(1).default(1),
});

const roomSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  max_guests: z.coerce.number().int().min(1).default(2),
  bed_type: z.string().optional(),
  base_price_dollars: z.coerce.number().min(0, 'Required'),
  total_inventory: z.coerce.number().int().min(1).default(1),
  amenities: z.array(z.string()).default([]),
});

type PropertyFormData = z.infer<typeof propertySchema>;
type RoomFormData = z.infer<typeof roomSchema>;

function RoomCard({ room, propertyId }: { room: RoomType; propertyId: string }) {
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { mutateAsync: updateRoom } = useUpdateRoomType();

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema) as Resolver<RoomFormData>,
    defaultValues: {
      name: room.name,
      description: room.description,
      max_guests: room.maxGuests,
      bed_type: '',
      base_price_dollars: room.basePriceCents / 100,
      total_inventory: room.totalRooms,
      amenities: room.amenities,
    },
  });

  const selectedAmenities = form.watch('amenities');
  const toggleAmenity = (key: string) => {
    const current = selectedAmenities ?? [];
    if (current.includes(key)) {
      form.setValue('amenities', current.filter((a) => a !== key));
    } else {
      form.setValue('amenities', [...current, key]);
    }
  };

  const onSave = async (data: RoomFormData) => {
    setError('');
    setSuccess('');
    try {
      await updateRoom({
        propertyId,
        roomId: room.id,
        name: data.name,
        description: data.description,
        max_guests: data.max_guests,
        bed_type: data.bed_type,
        base_price_cents: Math.round(data.base_price_dollars * 100),
        total_inventory: data.total_inventory,
        amenities: data.amenities,
      });
      setSuccess('Room updated.');
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update room.');
    }
  };

  return (
    <div className="bg-warm-50 rounded-xl border border-warm-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-navy-950 text-sm">{room.name}</h4>
          <p className="text-xs text-warm-500 mt-0.5">
            Up to {room.maxGuests} guests · {room.totalRooms} rooms · {formatCurrency(room.basePriceCents)}/night
          </p>
          <StatusBadge status={room.status} className="mt-1.5" />
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="p-2 rounded-lg border border-warm-200 text-warm-500 hover:text-navy-950 hover:border-warm-300 transition-colors"
        >
          {editing ? <ChevronUp size={16} /> : <Edit2 size={16} />}
        </button>
      </div>

      {editing && (
        <form onSubmit={form.handleSubmit(onSave)} className="mt-4 space-y-3 border-t border-warm-200 pt-4">
          {success && <p className="text-xs text-emerald-600">{success}</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Name *</label>
              <input {...form.register('name')} className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Bed Type</label>
              <input {...form.register('bed_type')} className={INPUT_CLASS} placeholder="King, Twin…" />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Description</label>
            <textarea {...form.register('description')} rows={2} className="w-full rounded-xl border border-warm-200 bg-white px-4 py-2.5 text-sm text-navy-950 placeholder:text-warm-400 outline-none transition-all duration-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15 resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LABEL_CLASS}>Max Guests</label>
              <input {...form.register('max_guests')} type="number" min="1" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Price/night ($)</label>
              <input {...form.register('base_price_dollars')} type="number" step="0.01" min="0" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Inventory</label>
              <input {...form.register('total_inventory')} type="number" min="1" className={INPUT_CLASS} />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Amenities</label>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {Object.entries(AMENITY_LABELS).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={selectedAmenities?.includes(key) ?? false} onChange={() => toggleAmenity(key)} className="w-3.5 h-3.5 rounded border-warm-300 accent-gold-500" />
                  <span className="text-xs text-warm-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-warm-700 border border-warm-200 hover:border-warm-300 transition-colors">Cancel</button>
            <button type="submit" disabled={form.formState.isSubmitting} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-semibold transition-colors disabled:opacity-60">
              {form.formState.isSubmitting && <Loader2 size={12} className="animate-spin" />}
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function AddRoomForm({ propertyId, onDone }: { propertyId: string; onDone: () => void }) {
  const { mutateAsync: createRoom } = useCreateRoomType();
  const [error, setError] = useState('');

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema) as Resolver<RoomFormData>,
    defaultValues: { max_guests: 2, total_inventory: 1, base_price_dollars: 0, amenities: [] },
  });

  const onSubmit = async (data: RoomFormData) => {
    setError('');
    try {
      await createRoom({
        propertyId,
        name: data.name,
        description: data.description,
        max_guests: data.max_guests,
        bed_type: data.bed_type,
        base_price_cents: Math.round(data.base_price_dollars * 100),
        total_inventory: data.total_inventory,
        amenities: data.amenities,
      });
      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create room.');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="bg-warm-50 rounded-xl border border-dashed border-warm-300 p-4 space-y-3">
      <h4 className="font-semibold text-navy-950 text-sm">New Room Type</h4>
      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS}>Name *</label>
          <input {...form.register('name')} className={cn(INPUT_CLASS, form.formState.errors.name && 'border-red-400')} placeholder="Deluxe King" />
          {form.formState.errors.name && <p className={ERROR_CLASS}>{form.formState.errors.name.message}</p>}
        </div>
        <div>
          <label className={LABEL_CLASS}>Bed Type</label>
          <input {...form.register('bed_type')} className={INPUT_CLASS} placeholder="King" />
        </div>
      </div>
      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea {...form.register('description')} rows={2} className="w-full rounded-xl border border-warm-200 bg-white px-4 py-2.5 text-sm text-navy-950 placeholder:text-warm-400 outline-none transition-all duration-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15 resize-none" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={LABEL_CLASS}>Max Guests</label>
          <input {...form.register('max_guests')} type="number" min="1" className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Price/night ($) *</label>
          <input {...form.register('base_price_dollars')} type="number" step="0.01" min="0" className={cn(INPUT_CLASS, form.formState.errors.base_price_dollars && 'border-red-400')} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Inventory</label>
          <input {...form.register('total_inventory')} type="number" min="1" className={INPUT_CLASS} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onDone} className="px-3 py-1.5 rounded-lg text-xs font-medium text-warm-700 border border-warm-200 hover:border-warm-300 transition-colors">Cancel</button>
        <button type="submit" disabled={form.formState.isSubmitting} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-semibold transition-colors disabled:opacity-60">
          {form.formState.isSubmitting && <Loader2 size={12} className="animate-spin" />}
          Add Room
        </button>
      </div>
    </form>
  );
}

export default function PropertyDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: property, isLoading } = useProperty(id);
  const { mutateAsync: updateProperty } = useUpdateProperty();
  const [tab, setTab] = useState<'details' | 'rooms'>('details');
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');
  const [showAddRoom, setShowAddRoom] = useState(false);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema) as Resolver<PropertyFormData>,
    values: property
      ? {
          name: property.name,
          description: property.description,
          city: property.city,
          country: property.country,
          address: property.address,
          latitude: property.latitude,
          longitude: property.longitude,
          star_rating: property.starRating || undefined,
          property_type: undefined,
          amenities: property.amenities,
          images: property.imageUrls.map((url) => ({ url })),
          total_rooms: property.totalRooms,
        }
      : undefined,
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control: form.control, name: 'images' });
  const selectedAmenities = form.watch('amenities');

  const toggleAmenity = (key: string) => {
    const current = selectedAmenities ?? [];
    if (current.includes(key)) {
      form.setValue('amenities', current.filter((a) => a !== key), { shouldDirty: true });
    } else {
      form.setValue('amenities', [...current, key], { shouldDirty: true });
    }
  };

  const onSave = async (data: PropertyFormData) => {
    setServerError('');
    setSuccess('');
    try {
      await updateProperty({
        id,
        name: data.name,
        description: data.description,
        city: data.city,
        country: data.country,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        star_rating: data.star_rating,
        property_type: data.property_type as 'hotel' | 'resort' | 'vacation_rental' | 'hostel' | 'boutique' | undefined,
        amenities: data.amenities,
        images: data.images.filter((i) => i.url).map((i) => i.url),
        total_rooms: data.total_rooms,
      });
      setSuccess('Property saved.');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Save failed.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!property) {
    return <div className="text-center py-20 text-warm-500">Property not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title={property.name}
        actions={
          <Link to="/host/properties" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-warm-200 text-sm font-medium text-warm-700 hover:border-warm-300 transition-colors">
            <ArrowLeft size={15} /> Properties
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-warm-100 rounded-xl mb-6 w-fit">
        {(['details', 'rooms'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-navy-950 shadow-sm' : 'text-warm-600 hover:text-navy-950'}`}
          >
            {t === 'details' ? 'Details' : 'Room Types'}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {tab === 'details' && (
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
          {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{success}</div>}
          {serverError && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{serverError}</div>}

          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={property.status} />
            <span className="text-xs text-warm-400">Status managed by admin</span>
          </div>

          <section className="bg-white rounded-2xl border border-warm-200 p-6">
            <h2 className="font-heading text-base font-semibold text-navy-950 mb-5">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className={LABEL_CLASS}>Property Name *</label>
                <input {...form.register('name')} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Description</label>
                <textarea {...form.register('description')} rows={3} className="w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-sm text-navy-950 placeholder:text-warm-400 outline-none transition-all duration-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/15 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Property Type</label>
                  <select {...form.register('property_type')} className={INPUT_CLASS}>
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
                  <select {...form.register('star_rating')} className={INPUT_CLASS}>
                    <option value="">Select</option>
                    {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-warm-200 p-6">
            <h2 className="font-heading text-base font-semibold text-navy-950 mb-5">Location</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>City *</label>
                  <input {...form.register('city')} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Country *</label>
                  <input {...form.register('country')} className={INPUT_CLASS} />
                </div>
              </div>
              <div>
                <label className={LABEL_CLASS}>Address</label>
                <input {...form.register('address')} className={INPUT_CLASS} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>Latitude</label>
                  <input {...form.register('latitude')} type="number" step="any" className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Longitude</label>
                  <input {...form.register('longitude')} type="number" step="any" className={INPUT_CLASS} />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-warm-200 p-6">
            <h2 className="font-heading text-base font-semibold text-navy-950 mb-5">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(AMENITY_LABELS).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={selectedAmenities?.includes(key) ?? false} onChange={() => toggleAmenity(key)} className="w-4 h-4 rounded border-warm-300 accent-gold-500" />
                  <span className="text-sm text-warm-700 group-hover:text-navy-950 transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-warm-200 p-6">
            <h2 className="font-heading text-base font-semibold text-navy-950 mb-5">Images (URLs)</h2>
            <div className="space-y-3">
              {imageFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input {...form.register(`images.${index}.url`)} className={cn(INPUT_CLASS, 'flex-1')} placeholder="https://example.com/image.jpg" />
                  {imageFields.length > 1 && (
                    <button type="button" onClick={() => removeImage(index)} className="p-2 rounded-xl border border-warm-200 text-warm-500 hover:text-red-500 hover:border-red-200 transition-colors">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              {imageFields.length < 5 && (
                <button type="button" onClick={() => appendImage({ url: '' })} className="flex items-center gap-1.5 text-sm text-gold-600 hover:text-gold-500 transition-colors font-medium">
                  <Plus size={15} /> Add image URL
                </button>
              )}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-warm-200 p-6">
            <h2 className="font-heading text-base font-semibold text-navy-950 mb-5">Inventory</h2>
            <div className="max-w-xs">
              <label className={LABEL_CLASS}>Total Rooms</label>
              <input {...form.register('total_rooms')} type="number" min="1" className={INPUT_CLASS} />
            </div>
          </section>

          <div className="flex justify-end pb-4">
            <button
              type="submit"
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-navy-950 text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(212,168,83,0.25)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {form.formState.isSubmitting && <Loader2 size={15} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Rooms Tab */}
      {tab === 'rooms' && (
        <div className="space-y-4">
          {(property.roomTypes ?? []).length === 0 && !showAddRoom && (
            <p className="text-sm text-warm-500 text-center py-8">No room types yet. Add one below.</p>
          )}
          {(property.roomTypes ?? []).map((room) => (
            <RoomCard key={room.id} room={room} propertyId={id} />
          ))}

          {showAddRoom ? (
            <AddRoomForm propertyId={id} onDone={() => setShowAddRoom(false)} />
          ) : (
            <button
              onClick={() => setShowAddRoom(true)}
              className="w-full py-3 rounded-xl border border-dashed border-warm-300 text-sm font-medium text-warm-600 hover:border-gold-400 hover:text-gold-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Room Type
            </button>
          )}
        </div>
      )}
    </div>
  );
}
