'use client';

import { useQuery } from '@tanstack/react-query';
import { doctorService } from '@/lib/services';
import { UserRound, Phone, Clock, DollarSign, Award } from 'lucide-react';
import { formatCurrency, formatPhone, DAY_LABELS } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import type { Doctor } from '@/types';

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const specialties = doctor.specialties?.map((ds) => ds.specialty.name) ?? [];
  const activeDays  = doctor.schedules?.filter((s) => s.isActive).map((s) => DAY_LABELS[s.dayOfWeek]) ?? [];

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all hover:border-border/80 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-primary">
            {doctor.fullName.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('')}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">{doctor.fullName}</p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            CRM {doctor.crm} — {doctor.crmState}
          </p>
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {specialties.map((s) => (
                <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-xs font-mono truncate">{formatPhone(doctor.phone)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-xs">{doctor.consultDuration} min</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-xs">{formatCurrency(Number(doctor.consultPrice))}</span>
        </div>
        {activeDays.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {activeDays.map((d) => (
              <span key={d} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{d}</span>
            ))}
          </div>
        )}
      </div>

      {doctor.bio && (
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-2">{doctor.bio}</p>
      )}
    </div>
  );
}

export default function DoctorsPage() {
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorService.list,
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Médicos"
        description={`${doctors.length} médico(s) ativo(s) cadastrado(s)`}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-card border border-border rounded-xl py-20 text-center">
          <UserRound className="w-12 h-12 text-muted-foreground/25 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Nenhum médico cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {doctors.map((d: Doctor) => <DoctorCard key={d.id} doctor={d} />)}
        </div>
      )}
    </div>
  );
}
