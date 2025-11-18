import { PrismaClient, Role, ClientStatus, CertificationType } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create Admin User
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@biolab-consulting.com" },
    update: {},
    create: {
      email: "admin@biolab-consulting.com",
      name: "Admin BioLab",
      password: adminPassword,
      role: Role.ADMIN,
      locale: "it",
    },
  });
  console.log("✅ Created admin user");

  // Create Consultants
  const consultantPassword = await hash("consultant123", 12);
  const consultant1 = await prisma.user.upsert({
    where: { email: "marco.rossi@biolab-consulting.com" },
    update: {},
    create: {
      email: "marco.rossi@biolab-consulting.com",
      name: "Marco Rossi",
      password: consultantPassword,
      role: Role.CONSULTANT,
      locale: "it",
    },
  });

  const consultant2 = await prisma.user.upsert({
    where: { email: "anna.mueller@biolab-consulting.com" },
    update: {},
    create: {
      email: "anna.mueller@biolab-consulting.com",
      name: "Anna Müller",
      password: consultantPassword,
      role: Role.CONSULTANT,
      locale: "de",
    },
  });
  console.log("✅ Created consultants");

  // Create Sample Clients
  const client1 = await prisma.client.create({
    data: {
      companyName: "Azienda Agricola Maso Alto",
      vatNumber: "IT12345678901",
      fiscalCode: "RSSMRC80A01L378X",
      contactPerson: "Mario Rossi",
      email: "info@masoalto.it",
      phone: "+39 0471 123456",
      mobile: "+39 348 1234567",
      address: "Via Montagna 15",
      city: "Bolzano",
      province: "BZ",
      postalCode: "39100",
      region: "Trentino-Alto Adige",
      country: "IT",
      status: ClientStatus.ACTIVE,
      certificationTypes: [CertificationType.ORGANIC_CROP, CertificationType.EU_BIO],
      hectares: 25.5,
      crops: ["Mele", "Vigneto", "Grano"],
      leadSource: "Referral",
      leadScore: 85,
      tags: ["premium", "mele", "alto-adige"],
      consultantId: consultant1.id,
      lastContactDate: new Date(),
      nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const client2 = await prisma.client.create({
    data: {
      companyName: "Bergbauernhof Unterhuber",
      vatNumber: "IT98765432109",
      contactPerson: "Hans Unterhuber",
      email: "hans@unterhuber-hof.com",
      phone: "+39 0472 987654",
      mobile: "+39 335 9876543",
      address: "Feldweg 8",
      city: "Brunico",
      province: "BZ",
      postalCode: "39031",
      region: "Trentino-Alto Adige",
      country: "IT",
      status: ClientStatus.PROSPECT,
      certificationTypes: [CertificationType.ORGANIC_LIVESTOCK, CertificationType.DEMETER],
      hectares: 15.0,
      animals: ["Mucche da latte", "Capre", "Galline"],
      leadSource: "Website",
      leadScore: 65,
      tags: ["livestock", "demeter"],
      consultantId: consultant2.id,
      nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  const client3 = await prisma.client.create({
    data: {
      companyName: "Cantina Sociale Merano",
      vatNumber: "IT55566677788",
      contactPerson: "Giuseppe Verdi",
      email: "giuseppe@cantinamerano.it",
      phone: "+39 0473 555666",
      address: "Via delle Vigne 42",
      city: "Merano",
      province: "BZ",
      postalCode: "39012",
      region: "Trentino-Alto Adige",
      country: "IT",
      status: ClientStatus.LEAD,
      certificationTypes: [CertificationType.ORGANIC_PROCESSING],
      leadSource: "Trade Show",
      leadScore: 45,
      tags: ["vino", "processing"],
      consultantId: consultant1.id,
    },
  });

  console.log("✅ Created clients");

  // Create Certifications
  await prisma.certification.create({
    data: {
      clientId: client1.id,
      type: CertificationType.EU_BIO,
      certifyingBody: "ICEA",
      certNumber: "IT-BIO-006-12345",
      status: "active",
      applicationDate: new Date("2023-01-15"),
      inspectionDate: new Date("2023-03-20"),
      issueDate: new Date("2023-04-10"),
      expiryDate: new Date("2024-12-31"),
      renewalDate: new Date("2024-11-01"),
    },
  });

  await prisma.certification.create({
    data: {
      clientId: client2.id,
      type: CertificationType.ORGANIC_LIVESTOCK,
      certifyingBody: "Bioland",
      status: "in_progress",
      applicationDate: new Date("2024-01-10"),
      inspectionDate: new Date("2024-03-15"),
    },
  });

  console.log("✅ Created certifications");

  // Create Tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Preparare documentazione certificazione bio",
        description: "Raccogliere tutti i documenti necessari per il rinnovo certificazione EU Bio di Maso Alto",
        priority: "HIGH",
        status: "IN_PROGRESS",
        assignedToId: consultant1.id,
        createdById: admin.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        tags: ["certificazione", "urgente"],
      },
      {
        title: "Sopralluogo Bergbauernhof Unterhuber",
        description: "Prima ispezione per valutazione conformità allevamento biologico",
        priority: "MEDIUM",
        status: "TODO",
        assignedToId: consultant2.id,
        createdById: admin.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        tags: ["sopralluogo", "livestock"],
      },
      {
        title: "Follow-up preventivo Cantina Merano",
        description: "Chiamare per discutere preventivo certificazione processing",
        priority: "MEDIUM",
        status: "TODO",
        assignedToId: consultant1.id,
        createdById: consultant1.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        tags: ["preventivo", "follow-up"],
      },
    ],
  });

  console.log("✅ Created tasks");

  // Create Quotes
  const quote1 = await prisma.quote.create({
    data: {
      quoteNumber: "Q-2024-001",
      clientId: client3.id,
      status: "SENT",
      title: "Certificazione Biologica Processing - Cantina",
      description: "Servizio completo di consulenza e supporto per ottenimento certificazione bio processing",
      subtotal: 3500,
      tax: 770,
      total: 4270,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sentAt: new Date(),
      items: {
        create: [
          {
            description: "Consulenza iniziale e audit pre-certificazione",
            quantity: 1,
            unitPrice: 800,
            total: 800,
          },
          {
            description: "Preparazione documentazione (n. 15 ore)",
            quantity: 15,
            unitPrice: 80,
            total: 1200,
          },
          {
            description: "Assistenza durante ispezione",
            quantity: 1,
            unitPrice: 500,
            total: 500,
          },
          {
            description: "Supporto post-certificazione (6 mesi)",
            quantity: 1,
            unitPrice: 1000,
            total: 1000,
          },
        ],
      },
    },
  });

  console.log("✅ Created quotes");

  // Create Inspections
  await prisma.inspection.create({
    data: {
      clientId: client1.id,
      scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      inspectorId: consultant1.id,
      location: "Via Montagna 15, Bolzano",
      latitude: 46.4983,
      longitude: 11.3548,
      status: "scheduled",
      checklist: {
        items: [
          { id: 1, text: "Verifica registri colturali", checked: false },
          { id: 2, text: "Controllo magazzino sementi", checked: false },
          { id: 3, text: "Ispezione campi", checked: false },
          { id: 4, text: "Verifica piano concimazione", checked: false },
        ],
      },
    },
  });

  console.log("✅ Created inspections");

  // Create Sample Timesheets
  await prisma.timesheet.createMany({
    data: [
      {
        userId: consultant1.id,
        clientId: client1.id,
        date: new Date("2024-11-15"),
        startTime: new Date("2024-11-15T09:00:00"),
        endTime: new Date("2024-11-15T12:30:00"),
        duration: 3.5,
        description: "Preparazione documentazione rinnovo certificazione",
        category: "Consulenza",
        billable: true,
        hourlyRate: 80,
        amount: 280,
      },
      {
        userId: consultant2.id,
        clientId: client2.id,
        date: new Date("2024-11-16"),
        startTime: new Date("2024-11-16T14:00:00"),
        endTime: new Date("2024-11-16T17:00:00"),
        duration: 3.0,
        description: "Sopralluogo preliminare allevamento",
        category: "Sopralluogo",
        billable: true,
        hourlyRate: 80,
        amount: 240,
      },
    ],
  });

  console.log("✅ Created timesheets");

  // Create Knowledge Base Categories
  const category1 = await prisma.category.create({
    data: {
      name: "Normative e Regolamenti",
      slug: "normative-regolamenti",
      description: "Normativa europea e nazionale sul biologico",
      icon: "book-open",
    },
  });

  const category2 = await prisma.category.create({
    data: {
      name: "Guide Pratiche",
      slug: "guide-pratiche",
      description: "Guide operative per agricoltori",
      icon: "clipboard-list",
    },
  });

  console.log("✅ Created categories");

  // Create Sample Articles
  await prisma.article.createMany({
    data: [
      {
        title: "Regolamento UE 2018/848: Cosa Cambia",
        slug: "regolamento-ue-2018-848",
        content: "Il nuovo regolamento europeo sulla produzione biologica...",
        excerpt: "Analisi delle principali novità del regolamento UE 2018/848",
        categoryId: category1.id,
        tags: ["normativa", "UE", "2018/848"],
        published: true,
        publishedAt: new Date(),
        locale: "it",
      },
      {
        title: "Come Convertire un'Azienda al Biologico",
        slug: "conversione-biologico",
        content: "La conversione al biologico richiede un periodo di transizione...",
        excerpt: "Guida passo-passo per convertire la tua azienda agricola al biologico",
        categoryId: category2.id,
        tags: ["conversione", "guida", "pratica"],
        published: true,
        publishedAt: new Date(),
        locale: "it",
      },
      {
        title: "Zertifizierung in Südtirol: Überblick",
        slug: "zertifizierung-suedtirol",
        content: "Überblick über die Bio-Zertifizierung in Südtirol...",
        excerpt: "Ein umfassender Leitfaden zur Bio-Zertifizierung in Südtirol",
        categoryId: category2.id,
        tags: ["südtirol", "zertifizierung"],
        published: true,
        publishedAt: new Date(),
        locale: "de",
      },
    ],
  });

  console.log("✅ Created articles");

  // Create Settings
  await prisma.setting.createMany({
    data: [
      {
        key: "company_name",
        value: "BioLab Consulting",
      },
      {
        key: "company_address",
        value: {
          street: "Via Roma 100",
          city: "Bolzano",
          province: "BZ",
          postalCode: "39100",
          country: "IT",
        },
      },
      {
        key: "default_hourly_rate",
        value: 80,
      },
      {
        key: "tax_rate",
        value: 22,
      },
      {
        key: "email_signature",
        value: "BioLab Consulting - Esperti in certificazioni biologiche",
      },
    ],
  });

  console.log("✅ Created settings");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
