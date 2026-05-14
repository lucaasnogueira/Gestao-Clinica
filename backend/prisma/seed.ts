import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // ========================
  // ADMIN USER
  // ========================
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@clinica.com" },
    update: {
      password: adminPassword,
    },
    create: {
      email: "admin@clinica.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin criado: ${admin.email}`);

  // ========================
  // SPECIALTIES
  // ========================
  const specialties = [
    { name: "Clínica Geral", description: "Atendimento geral", icon: "🏥" },
    {
      name: "Cardiologia",
      description: "Especialidade do coração",
      icon: "❤️",
    },
    { name: "Dermatologia", description: "Doenças de pele", icon: "🔬" },
    {
      name: "Ortopedia",
      description: "Sistema músculo-esquelético",
      icon: "🦴",
    },
    { name: "Ginecologia", description: "Saúde feminina", icon: "👩‍⚕️" },
    { name: "Pediatria", description: "Saúde infantil", icon: "👶" },
    { name: "Neurologia", description: "Sistema nervoso", icon: "🧠" },
    { name: "Oftalmologia", description: "Saúde ocular", icon: "👁️" },
    { name: "Odontologia", description: "Saúde bucal", icon: "🦷" },
    { name: "Psiquiatria", description: "Saúde mental", icon: "🧘" },
  ];

  for (const specialty of specialties) {
    await prisma.specialty.upsert({
      where: { name: specialty.name },
      update: {},
      create: specialty,
    });
  }
  console.log(`✅ ${specialties.length} especialidades criadas`);

  // ========================
  // DOCTOR USER
  // ========================
  const doctorPassword = await bcrypt.hash("Doctor@123", 12);
  const doctorUser = await prisma.user.upsert({
    where: { email: "dr.silva@clinica.com" },
    update: {},
    create: {
      email: "dr.silva@clinica.com",
      password: doctorPassword,
      role: Role.DOCTOR,
    },
  });

  const specialty = await prisma.specialty.findFirst({
    where: { name: "Clínica Geral" },
  });

  const doctor = await prisma.doctor.upsert({
    where: { crm: "CRM12345" },
    update: {},
    create: {
      userId: doctorUser.id,
      fullName: "Dr. João Silva",
      crm: "CRM12345",
      crmState: "SP",
      phone: "(11) 98765-4321",
      bio: "Médico clínico geral com 10 anos de experiência.",
      consultDuration: 30,
      consultPrice: 200.0,
    },
  });

  if (specialty) {
    await prisma.doctorSpecialty.upsert({
      where: {
        doctorId_specialtyId: {
          doctorId: doctor.id,
          specialtyId: specialty.id,
        },
      },
      update: {},
      create: { doctorId: doctor.id, specialtyId: specialty.id },
    });
  }

  // Schedule: Seg-Sex, 8h-18h
  for (let day = 1; day <= 5; day++) {
    await prisma.schedule.upsert({
      where: { doctorId_dayOfWeek: { doctorId: doctor.id, dayOfWeek: day } },
      update: {},
      create: {
        doctorId: doctor.id,
        dayOfWeek: day,
        startTime: "08:00",
        endTime: "18:00",
        slotDuration: 30,
        breakStart: "12:00",
        breakEnd: "13:00",
      },
    });
  }
  console.log(`✅ Médico criado: ${doctor.fullName}`);

  // ========================
  // RECEPTIONIST
  // ========================
  const receptionistPassword = await bcrypt.hash("Recepcao@123", 12);
  await prisma.user.upsert({
    where: { email: "recepcao@clinica.com" },
    update: {},
    create: {
      email: "recepcao@clinica.com",
      password: receptionistPassword,
      role: Role.RECEPTIONIST,
    },
  });
  console.log("✅ Recepcionista criada");

  // ========================
  // DEMO USER
  // ========================
  const demoPassword = await bcrypt.hash("Demo@123", 12);
  await prisma.user.upsert({
    where: { email: "demo@clinica.com" },
    update: {
      password: demoPassword,
    },
    create: {
      email: "demo@clinica.com",
      password: demoPassword,
      role: Role.DEMO,
    },
  });
  console.log("✅ Usuário Demo criado");

  // ========================
  // INSURANCES
  // ========================
  const insurances = [
    { name: "Unimed", ansCode: "12345" },
    { name: "Bradesco Saúde", ansCode: "23456" },
    { name: "SulAmérica", ansCode: "34567" },
    { name: "Amil", ansCode: "45678" },
  ];
  for (const ins of insurances) {
    await prisma.insurance.upsert({
      where: { name: ins.name },
      update: {},
      create: ins,
    });
  }
  console.log(`✅ ${insurances.length} convênios criados`);

  // ========================
  // SAMPLE PATIENT
  // ========================
  await prisma.patient.upsert({
    where: { cpf: "12345678901" },
    update: {},
    create: {
      fullName: "Maria Oliveira",
      cpf: "12345678901",
      dateOfBirth: new Date("1985-03-15"),
      gender: "FEMALE",
      bloodType: "O_POSITIVE",
      phone: "(11) 91234-5678",
      email: "maria.oliveira@email.com",
      address: {
        street: "Rua das Flores",
        number: "123",
        complement: "Apto 4",
        city: "São Paulo",
        state: "SP",
        zip: "01234-567",
      },
      allergies: ["Dipirona", "Penicilina"],
      chronicConditions: ["Hipertensão"],
      emergencyContact: {
        name: "José Oliveira",
        phone: "(11) 99876-5432",
        relationship: "Esposo",
      },
    },
  });
  console.log("✅ Paciente exemplo criado");

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📋 Credenciais de acesso:");
  console.log("   Admin:          admin@clinica.com    / Admin@123");
  console.log("   Médico:         dr.silva@clinica.com / Doctor@123");
  console.log("   Recepcionista:  recepcao@clinica.com / Recepcao@123");
  console.log("   Demo (Restrito): demo@clinica.com    / Demo@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
