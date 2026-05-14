import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { SpecialtiesModule } from './specialties/specialties.module';
import { SchedulesModule } from './schedules/schedules.module';
import { InsuranceModule } from './insurance/insurance.module';
import { BillingModule } from './billing/billing.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { CepModule } from './cep/cep.module';
import { GoalsModule } from './goals/goals.module';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    // ── Config global ──────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── Rate limiting: 100 req/min geral, 5 req/min em /auth/login ──
    ThrottlerModule.forRoot([
      { name: 'global', ttl: 60000, limit: 100 },
    ]),

    // ── Core ───────────────────────────────────────────────────────
    PrismaModule,

    // ── Feature Modules ────────────────────────────────────────────
    AuthModule,
    UsersModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    SpecialtiesModule,
    SchedulesModule,
    InsuranceModule,
    BillingModule,
    NotificationsModule,
    ReportsModule,
    CepModule,
    GoalsModule,
  ],
})
export class AppModule {}
