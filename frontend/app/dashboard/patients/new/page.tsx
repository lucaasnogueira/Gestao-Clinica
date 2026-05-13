'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { InlinePatientForm } from '@/components/patients/InlinePatientForm';

export default function NewPatientPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/patients" 
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors border border-transparent hover:border-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Paciente</h1>
          <p className="text-muted-foreground text-sm">Preencha as informações divididas por etapas</p>
        </div>
      </div>

      <InlinePatientForm 
        onClose={() => router.push('/dashboard/patients')} 
      />
    </div>
  );
}
