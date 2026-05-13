const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sync() {
  console.log('--- Iniciando Sincronização de Faturamento ---');
  
  const appointments = await prisma.appointment.findMany({
    include: {
      doctor: true,
      bill: true,
    }
  });

  console.log(`Total de agendamentos encontrados: ${appointments.length}`);
  
  let created = 0;
  let skipped = 0;

  for (const appt of appointments) {
    if (appt.bill) {
      skipped++;
      continue;
    }

    try {
      await prisma.bill.create({
        data: {
          patientId: appt.patientId,
          appointmentId: appt.id,
          insuranceId: appt.insuranceId,
          amount: appt.doctor.consultPrice,
          totalAmount: appt.doctor.consultPrice,
          status: 'PENDING',
          dueDate: appt.scheduledAt,
        }
      });
      created++;
    } catch (e) {
      console.error(`Erro ao criar fatura para agendamento ${appt.id}:`, e.message);
    }
  }

  console.log(`--- Sincronização Finalizada ---`);
  console.log(`Faturas criadas: ${created}`);
  console.log(`Faturas puladas (já existentes): ${skipped}`);
}

sync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
