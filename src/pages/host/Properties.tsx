import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Star, MapPin, Edit, AlertTriangle, Clock } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { HotelCardSkeleton } from '@/components/shared/LoadingSkeleton';
import type { PropertyStatus } from '@/types';

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Under Review', value: 'pending_review' },
];

export default function Properties() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: properties, isLoading } = useProperties(statusFilter ? { status: statusFilter } : undefined);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Properties"
        description="Manage your hotel listings and room types."
        actions={
          <Link
            to="/host/properties/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-navy-950 text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(212,168,83,0.25)]"
          >
            <Plus size={16} />
            Add Property
          </Link>
        }
      />

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-navy-950 text-white'
                : 'bg-white border border-warm-200 text-warm-700 hover:border-warm-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <HotelCardSkeleton key={i} />)}
        </div>
      ) : !properties || properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties yet"
          description="Add your first property to start accepting bookings."
          action={
            <Link
              to="/host/properties/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-950 text-white text-sm font-medium hover:bg-navy-800 transition-colors"
            >
              <Plus size={15} /> Add Property
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Image */}
              <div className="h-44 bg-warm-100 relative overflow-hidden">
                {property.thumbnailUrl ? (
                  <img src={property.thumbnailUrl} alt={property.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 size={32} className="text-warm-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={property.status as PropertyStatus} />
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-semibold text-navy-950 text-base mb-1 truncate">{property.name}</h3>
                <p className="text-xs text-warm-500 flex items-center gap-1 mb-3">
                  <MapPin size={11} />
                  {property.city}, {property.country}
                </p>

                {/* Pending notice */}
                {property.status === 'pending_review' && (
                  <div className="flex items-start gap-2 bg-gold-50 border border-gold-200 rounded-lg px-3 py-2 mb-3">
                    <Clock size={12} className="text-gold-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-gold-700 font-medium">Awaiting admin approval</p>
                  </div>
                )}

                {/* Rejection notice */}
                {property.status === 'inactive' && property.rejectionReason && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                    <AlertTriangle size={12} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-700">
                      <span className="font-semibold">Rejected:</span> {property.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-warm-500">
                    <span className="flex items-center gap-1">
                      <Star size={11} className="text-gold-500 fill-gold-500" />
                      {property.starRating} star
                    </span>
                    <span>{property.totalRooms} rooms</span>
                  </div>
                  <Link
                    to={`/host/properties/${property.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-950 text-white text-xs font-medium hover:bg-navy-800 transition-colors"
                  >
                    <Edit size={12} /> Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
