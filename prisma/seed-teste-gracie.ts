import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { addDays, format, subDays, startOfWeek } from "date-fns";

async function main() {
  const tursoDbUrl = "file:./prisma/tenants/teste-gracie.db";
  
  console.log("Conectando ao banco do tenant teste-gracie...");
  
  const prisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: tursoDbUrl,
    }),
  });

  const adminEmail = "filipe@faixappreta.com.br";
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    console.error("Admin filipe@faixappreta.com.br nao encontrado no tenant teste-gracie.");
    return;
  }

  console.log("Limpando dados antigos (exceto admin)...");
  await prisma.booking.deleteMany({});
  await prisma.groupClass.deleteMany({});
  await prisma.privateSlot.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.notificationRead.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.graduationLog.deleteMany({});
  await prisma.planUpgradeRequest.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { not: adminEmail } } });
  await prisma.beltRequirement.deleteMany({});
  await prisma.degreeRequirement.deleteMany({});

  console.log("Criando requisitos de graduacao...");
  const belts = ["AZUL", "ROXA", "MARROM", "PRETA"];
  for (const belt of belts) {
    await prisma.beltRequirement.create({
      data: { belt, requiredClasses: belt === "AZUL" ? 100 : belt === "ROXA" ? 150 : 200 },
    });
    for (let degree = 1; degree <= 4; degree++) {
      await prisma.degreeRequirement.create({
        data: { belt, degree, requiredClasses: 25 },
      });
    }
  }
  // Requisitos para BRANCA (apenas graus)
  for (let degree = 1; degree <= 4; degree++) {
    await prisma.degreeRequirement.create({
      data: { belt: "BRANCA", degree, requiredClasses: 20 },
    });
  }

  console.log("Criando alunos...");
  const passwordHash = await bcrypt.hash("123456", 10);
  const studentsData = [
    { name: "Joao Silva", email: "joao@email.com", belt: "BRANCA", degrees: 2, initialCheckins: 5 },
    { name: "Maria Santos", email: "maria@email.com", belt: "BRANCA", degrees: 0, initialCheckins: 2, status: "PENDING" },
    { name: "Pedro Oliveira", email: "pedro@email.com", belt: "AZUL", degrees: 1, initialCheckins: 40 },
    { name: "Ana Costa", email: "ana@email.com", belt: "AZUL", degrees: 3, initialCheckins: 80 },
    { name: "Lucas Pereira", email: "lucas@email.com", belt: "ROXA", degrees: 0, initialCheckins: 120 },
    { name: "Julia Rodrigues", email: "julia@email.com", belt: "ROXA", degrees: 2, initialCheckins: 160 },
    { name: "Marcos Souza", email: "marcos@email.com", belt: "MARROM", degrees: 1, initialCheckins: 250 },
    { name: "Fernanda Lima", email: "fernanda@email.com", belt: "BRANCA", degrees: 3, initialCheckins: 15 },
    { name: "Bruno Alves", email: "bruno@email.com", belt: "BRANCA", degrees: 1, initialCheckins: 8 },
    { name: "Carla Ferreira", email: "carla@email.com", belt: "AZUL", degrees: 0, initialCheckins: 35 },
  ];

  const students = [];
  for (const s of studentsData) {
    const student = await prisma.user.create({
      data: {
        ...s,
        passwordHash,
        role: "STUDENT",
        status: s.status || "APPROVED",
        modalities: "GRAPPLING",
      },
    });
    students.push(student);
  }

  console.log("Criando aulas de grupo...");
  const groupClasses = [
    { name: "Jiu-Jitsu Iniciantes", dayOfWeek: 1, startTime: "18:00", endTime: "19:00", capacity: 20 },
    { name: "Jiu-Jitsu Avancado", dayOfWeek: 1, startTime: "19:30", endTime: "20:30", capacity: 20 },
    { name: "No-Gi Fundamentos", dayOfWeek: 2, startTime: "18:00", endTime: "19:00", capacity: 15 },
    { name: "Sparring Day", dayOfWeek: 5, startTime: "17:00", endTime: "18:30", capacity: 30 },
    { name: "Jiu-Jitsu Kids", dayOfWeek: 3, startTime: "16:00", endTime: "17:00", capacity: 12, isKids: true },
  ];

  const createdClasses = [];
  for (const gc of groupClasses) {
    const created = await prisma.groupClass.create({ data: gc });
    createdClasses.push(created);
  }

  console.log("Criando slots de aula privada...");
  for (let day = 1; day <= 5; day++) {
    await prisma.privateSlot.create({
      data: { dayOfWeek: day, startTime: "10:00", endTime: "11:00", isAvailable: true },
    });
    await prisma.privateSlot.create({
      data: { dayOfWeek: day, startTime: "14:00", endTime: "15:00", isAvailable: false, userId: students[0].id },
    });
  }

  console.log("Criando agendamentos (Bookings)...");
  const today = new Date();
  
  // Historico de presencas
  for (let i = 0; i < 30; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const date = subDays(today, Math.floor(Math.random() * 14) + 1);
    const dateStr = format(date, "yyyy-MM-dd");
    
    await prisma.booking.create({
      data: {
        userId: student.id,
        type: "GROUP",
        groupClassId: createdClasses[Math.floor(Math.random() * createdClasses.length)].id,
        date: dateStr,
        status: "CONFIRMED",
        checkedIn: true,
        checkinStatus: "PRESENTE",
      },
    });
  }

  // Agendamentos futuros
  for (let i = 0; i < 10; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const date = addDays(today, Math.floor(Math.random() * 5) + 1);
    const dateStr = format(date, "yyyy-MM-dd");
    
    await prisma.booking.create({
      data: {
        userId: student.id,
        type: "GROUP",
        groupClassId: createdClasses[Math.floor(Math.random() * createdClasses.length)].id,
        date: dateStr,
        status: "CONFIRMED",
        checkedIn: false,
      },
    });
  }

  console.log("Criando eventos e notificacoes...");
  await prisma.event.create({
    data: {
      title: "Seminario No-Gi",
      description: "Seminario especial com professor convidado.",
      date: format(addDays(today, 7), "yyyy-MM-dd"),
      createdById: admin.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: "Novo Horario de Treino",
      message: "A partir da proxima semana teremos aulas de No-Gi as 07:00.",
      createdById: admin.id,
    },
  });

  console.log("Criando solicitacoes de upgrade de plano...");
  await prisma.planUpgradeRequest.create({
    data: {
      userId: students[0].id,
      plan: "Pro",
      frequency: "mensal",
      details: "3x_semana",
      price: "150,00",
      status: "PENDING",
    },
  });

  console.log("Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
