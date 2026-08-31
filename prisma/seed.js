const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial database data...');

  // 1. Create Default Users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const engineerPasswordHash = await bcrypt.hash('engineer123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@cloverdigital.com.my',
      name: 'System Administrator',
      password: adminPasswordHash,
      role: 'ADMIN',
      phone: '+60 12-345 6789',
    },
  });

  const engineer = await prisma.user.upsert({
    where: { username: 'skding' },
    update: {},
    create: {
      username: 'skding',
      email: 'skding@cloverdigital.com.my',
      name: 'SK Ding',
      password: engineerPasswordHash,
      role: 'ENGINEER',
      phone: '+60 16-789 0123',
    },
  });

  console.log('Created/verified users: admin, skding');

  // 2. Default System Settings
  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      companyName: 'Clover Digital Sdn Bhd',
      companyReg: '201501034912',
      companyAddr: '7A Jalan PP2/1, Taman Putra Prima, 47100 Puchong, Selangor',
      companyEmail: 'admin@cloverdigital.com.my',
      companyWeb: 'www.cloverdigital.com.my',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: false,
      smtpUser: '',
      smtpPass: '',
      smtpFromEmail: 'reports@cloverdigital.com.my',
      smtpFromName: 'Clover Digital Service Dispatch',
    },
  });

  // 3. Maintenance Checklist Template (Full match to sample-maintenance-report.docx)
  let maintenanceTemplate = await prisma.checklistTemplate.findFirst({
    where: { title: 'Standard PLC & SCADA Building Automation PM Checklist' },
  });

  if (!maintenanceTemplate) {
    maintenanceTemplate = await prisma.checklistTemplate.create({
      data: {
        title: 'Standard PLC & SCADA Building Automation PM Checklist',
        category: 'BMS & Industrial Automation',
        description: 'Comprehensive step-by-step preventive maintenance checklist for PLC controllers, SCADA workstations, Ethernet communications, and 24Vdc power supplies.',
        isDefault: true,
        sections: [
          {
            id: 'sec_1_1',
            code: '1.1',
            title: 'System Preparation & Status Indication',
            instructions: 'Contact system custodian on-site. Before starting routine tests, check system status. All modules should indicate healthy state.',
            items: [
              { id: '1_1_a', text: 'Contact the system custodian on-site and discuss any item to be investigated', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_1_b_proc', text: 'Processor: RUN LED on (Chiller Plant PLC 1)', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_1_b_plc2', text: 'Processor: RUN LED on (Chiller Plant PLC 2)', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_1_b_l2', text: 'Processor: RUN LED on (Level 2 PLC)', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_1_b_l5b', text: 'Processor: RUN LED on (Level 5B PLC)', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_1_b_l6', text: 'Processor: RUN LED on (Level 6 PLC)', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_1_b_l7', text: 'Processor: RUN LED on (Level 7 PLC)', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_1_b_l8', text: 'Processor: RUN LED on (Level 8 PLC)', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_1_b_l9', text: 'Processor: RUN LED on (Level 9 PLC)', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_1_b_l10', text: 'Processor: RUN LED on (Level 10 PLC)', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_1_b_l11', text: 'Processor: RUN LED on (Level 11 PLC)', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_1_b_l12', text: 'Processor: RUN LED on (Level 12 PLC)', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_1_b_l13', text: 'Processor: RUN LED on (Level 13 PLC)', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_1_b_l14', text: 'Processor: RUN LED on (Level 14 PLC)', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_1_b_l15', text: 'Processor: RUN LED on (Level 15 PLC)', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_1_b_l16', text: 'Processor: RUN LED on (Level 16 PLC)', type: 'status', options: ['OK', 'PL', 'N/A'] },
            ],
          },
          {
            id: 'sec_1_2',
            code: '1.2',
            title: 'PLC Software Backup',
            instructions: 'Create controller logic backup and verify dual-location storage.',
            items: [
              { id: '1_2_a', text: 'Create logic back-up for each controller', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_2_b', text: 'Store back-up on PM folder in Client engineering workstation', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_2_c', text: 'Store back-up on offline storage and keep by CDSB', type: 'status', options: ['OK', 'PL', 'N/A'] },
            ],
          },
          {
            id: 'sec_1_3',
            code: '1.3',
            title: 'SCADA Software Backup',
            instructions: 'Create system and database backup for SCADA workstation.',
            items: [
              { id: '1_3_a', text: 'Create system and database back-up for SCADA workstation', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_3_b', text: 'Store back-up on PM folder in Client engineering workstation', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_3_c', text: 'Store back-up on offline storage and keep by CDSB', type: 'status', options: ['OK', 'PL', 'N/A'] },
            ],
          },
          {
            id: 'sec_1_4',
            code: '1.4',
            title: 'Communications Tests - PLC to SCADA Station',
            instructions: 'Launch command prompt at SCADA (192.168.1.2). Ping all PLC Ethernet modules and ensure healthy round-trip replies.',
            items: [
              { id: '1_4_ping_scada', text: 'SCADA Station (192.168.1.2) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_4_ping_ch1', text: 'Chiller Plant PLC 1 (192.168.1.10) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_4_ping_ch2', text: 'Chiller Plant PLC 2 (192.168.1.11) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_4_ping_l2', text: 'Level 2 PLC (192.168.1.14) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_4_ping_l5b', text: 'Level 5B PLC (192.168.1.15) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_4_ping_l6', text: 'Level 6 PLC (192.168.1.16) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_4_ping_l7', text: 'Level 7 PLC (192.168.1.17) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_4_ping_l8', text: 'Level 8 PLC (192.168.1.18) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_4_ping_l9', text: 'Level 9 PLC (192.168.1.19) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_4_ping_l10', text: 'Level 10 PLC (192.168.1.20) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_4_ping_l11', text: 'Level 11 PLC (192.168.1.21) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_4_ping_l12', text: 'Level 12 PLC (192.168.1.22) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_4_ping_l13', text: 'Level 13 PLC (192.168.1.23) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_4_ping_l14', text: 'Level 14 PLC (192.168.1.24) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_4_ping_l15', text: 'Level 15 PLC (192.168.1.25) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_4_ping_l16', text: 'Level 16 PLC (192.168.1.26) Ping Test', type: 'status', options: ['OK', 'PL', 'N/A'] },
            ],
          },
          {
            id: 'sec_1_5',
            code: '1.5',
            title: 'Power Supplies (Specification: 24Vdc ±5%)',
            instructions: 'Measure DC voltage on field power supply units. Acceptable range: 22.8Vdc to 25.2Vdc.',
            items: [
              { id: '1_5_ch', text: 'Chiller Plant Panel 24Vdc Power Supply', type: 'measurement', spec: '24Vdc ±5%', unit: 'Vdc', target: 24.0, tolerance: 1.2, options: ['OK', 'PL', 'N/A'] },
              { id: '1_5_l2', text: 'Level 2 Panel 24Vdc Power Supply', type: 'measurement', spec: '24Vdc ±5%', unit: 'Vdc', target: 24.0, tolerance: 1.2, options: ['OK', 'PL', 'N/A'] },
              { id: '1_5_l5b', text: 'Level 5B Panel 24Vdc Power Supply', type: 'measurement', spec: '24Vdc ±5%', unit: 'Vdc', target: 24.0, tolerance: 1.2, options: ['OK', 'PL', 'N/A'] },
              { id: '1_5_l6', text: 'Level 6 Panel 24Vdc Power Supply', type: 'measurement', spec: '24Vdc ±5%', unit: 'Vdc', target: 24.0, tolerance: 1.2, options: ['OK', 'PL', 'N/A'] },
              { id: '1_5_l7', text: 'Level 7 Panel 24Vdc Power Supply', type: 'measurement', spec: '24Vdc ±5%', unit: 'Vdc', target: 24.0, tolerance: 1.2, options: ['OK', 'PL', 'N/A'] },
              { id: '1_5_l8', text: 'Level 8 Panel 24Vdc Power Supply', type: 'measurement', spec: '24Vdc ±5%', unit: 'Vdc', target: 24.0, tolerance: 1.2, options: ['OK', 'PL', 'N/A'] },
              { id: '1_5_l9', text: 'Level 9 Panel 24Vdc Power Supply', type: 'measurement', spec: '24Vdc ±5%', unit: 'Vdc', target: 24.0, tolerance: 1.2, options: ['OK', 'PL', 'N/A'] },
              { id: '1_5_l10', text: 'Level 10 Panel 24Vdc Power Supply', type: 'measurement', spec: '24Vdc ±5%', unit: 'Vdc', target: 24.0, tolerance: 1.2, options: ['OK', 'PL', 'N/A'] },
              { id: '1_5_l11', text: 'Level 11 Panel 24Vdc Power Supply', type: 'measurement', spec: '24Vdc ±5%', unit: 'Vdc', target: 24.0, tolerance: 1.2, options: ['OK', 'PL', 'N/A'] },
              { id: '1_5_l12', text: 'Level 12 Panel 24Vdc Power Supply', type: 'measurement', spec: '24Vdc ±5%', unit: 'Vdc', target: 24.0, tolerance: 1.2, options: ['OK', 'PL', 'N/A'] },
              { id: '1_5_l13', text: 'Level 13 Panel 24Vdc Power Supply', type: 'measurement', spec: '24Vdc ±5%', unit: 'Vdc', target: 24.0, tolerance: 1.2, options: ['OK', 'PL', 'N/A'] },
              { id: '1_5_l14', text: 'Level 14 Panel 24Vdc Power Supply', type: 'measurement', spec: '24Vdc ±5%', unit: 'Vdc', target: 24.0, tolerance: 1.2, options: ['OK', 'PL', 'N/A'] },
              { id: '1_5_l15', text: 'Level 15 Panel 24Vdc Power Supply', type: 'measurement', spec: '24Vdc ±5%', unit: 'Vdc', target: 24.0, tolerance: 1.2, options: ['OK', 'PL', 'N/A'] },
              { id: '1_5_l16', text: 'Level 16 Panel 24Vdc Power Supply', type: 'measurement', spec: '24Vdc ±5%', unit: 'Vdc', target: 24.0, tolerance: 1.2, options: ['OK', 'PL', 'N/A'] },
            ],
          },
          {
            id: 'sec_1_6',
            code: '1.6',
            title: 'Instrumentation and Thermostat',
            instructions: 'Cross-verify live instrumentation and thermostat sensor values against physical gauges.',
            items: [
              { id: '1_6_a', text: 'Check instrument readings on SCADA screen', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_6_b', text: 'Check thermostat temperature sensors on SCADA screen', type: 'status', options: ['OK', 'PL', 'N/A'] },
            ],
          },
          {
            id: 'sec_1_7',
            code: '1.7',
            title: 'System Specific Checks',
            instructions: 'Ad-hoc or site-specific custom equipment inspections.',
            items: [
              { id: '1_7_a', text: 'Main Incoming Power & Phase Monitor Relay', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_7_b', text: 'Emergency Trip Button & Safety Interlocks', type: 'status', options: ['OK', 'PL', 'N/A'] },
              { id: '1_7_c', text: 'Control Panel Internal Cooling Fan & Filter Cleanliness', type: 'status', options: ['OK', 'PL', 'N/A'] },
            ],
          },
        ],
      },
    });
  }

  // 4. Sample Master Customers, Sites & Assets
  let customerTNB = await prisma.customer.findFirst({
    where: { name: 'TNB Engineering Corporation Sdn Bhd' },
    include: { sites: { include: { equipment: true } } },
  });

  if (!customerTNB) {
    customerTNB = await prisma.customer.create({
      data: {
        name: 'TNB Engineering Corporation Sdn Bhd',
        regNo: '199301012345',
        email: 'facility@tnbec.com.my',
        phone: '+60 3-2282 5555',
        address: 'Level 8, Menara TNB, No. 19, Jalan Timur, 46200 Petaling Jaya, Selangor',
        contactPerson: 'En. Ahmad Zaki',
        sites: {
          create: [
            {
              name: 'IJN Chiller Plant',
              address: 'Institut Jantung Negara, 145 Jalan Tun Razak, 50400 Kuala Lumpur',
              contactPerson: 'En. Shahril (Facility Engineer)',
              contactPhone: '+60 12-987 6543',
              contactEmail: 'shahril@ijn.com.my',
              defaultTemplateId: maintenanceTemplate.id,
              equipment: {
                create: [
                  {
                    name: 'Variable Frequency Drive STLP1',
                    tagNo: 'VFD-STLP1',
                    model: 'Danfoss VLT 6000',
                    serialNo: 'DF-6000-88192',
                    description: 'Secondary Chilled Water Pump 1 VFD',
                  },
                  {
                    name: 'Variable Frequency Drive STLP2',
                    tagNo: 'VFD-STLP2',
                    model: 'Danfoss VLT 6000',
                    serialNo: 'DF-6000-88193',
                    description: 'Secondary Chilled Water Pump 2 VFD',
                  },
                ],
              },
            },
          ],
        },
      },
      include: { sites: { include: { equipment: true } } },
    });
  }

  let customerKawan = await prisma.customer.findFirst({
    where: { name: 'Kawan Engineering Sdn Bhd' },
    include: { sites: true },
  });

  if (!customerKawan) {
    customerKawan = await prisma.customer.create({
      data: {
        name: 'Kawan Engineering Sdn Bhd',
        regNo: '200401009876',
        email: 'projects@kawaneng.com.my',
        phone: '+60 3-8060 1122',
        address: 'No 15, Jalan Industri PBP 3, Taman Perindustrian Pusat Bandar Puchong, 47100 Puchong',
        contactPerson: 'Mr. Lee Wei Hong',
        sites: {
          create: [
            {
              name: 'Pangkalan Bun Site, Indonesia',
              address: 'Kec. Arut Sel., Kabupaten Kotawaringin Barat, Kalimantan Tengah 74112, Indonesia',
              contactPerson: 'Mr. Budi Santoso',
              contactPhone: '+62 812-3456-7890',
              contactEmail: 'budi.caop@kawaneng.com',
              defaultTemplateId: maintenanceTemplate.id,
            },
          ],
        },
      },
      include: { sites: true },
    });
  }

  console.log('Created/verified Customers: TNB Engineering, Kawan Engineering');

  // 5. Sample Initial Reports (Using upsert to prevent unique constraint conflicts)
  // Sample 1: Service Report ESR-26/011
  const tnbSite = customerTNB?.sites?.[0];
  if (tnbSite) {
    await prisma.report.upsert({
      where: { reportNumber: 'ESR-26/011' },
      update: {},
      create: {
        reportNumber: 'ESR-26/011',
        type: 'SERVICE',
        status: 'COMPLETED',
        customerId: customerTNB.id,
        siteId: tnbSite.id,
        authorId: engineer.id,
        title: 'VFD Critical Output Failure & Replacement Assessment',
        reportDate: new Date('2026-08-21T09:30:00Z'),
        attendanceDate: new Date('2026-08-21T09:30:00Z'),
        data: {
          reportedFault: 'STLP1 & 2 failed to run. Inverter show running but no power output to pump.',
          engineersReport: `The existing Danfoss VLT 6000 Variable Frequency Drive (VFD) for STLP1 and STLP 2 have suffered a critical failure, resulting in zero power output to the connected motor. Given the unit's age (~19 years), operation runtime (~50,000 hours), and obsolete support status, direct replacement with a modern equivalent VFD is strongly recommended over component repair.

At 50,000 operating hours, critical internal hardware—such as DC bus capacitors, power card gate drivers, IGBT modules, and internal cooling fans—has reached end-of-life. Repairing only the output stage circuit will leave other worn components intact, causing high likelihood of secondary failures shortly after startup.

The Danfoss VLT 6000 series is mature legacy hardware. Sourcing refurbished or old-stock replacement circuit boards incurs high costs and extended lead times, without restoring warranty coverage or reliable operation.`,
          downtimeRisk: {
            repair: 'Long lead time to source legacy components with zero guarantee of system reliability post-repair.',
            replacement: 'Modern drives offer direct mechanical/electrical migration paths, seamless protocol integration, superior energy efficiency, full 12 month warranties, and readily available spare parts.',
          },
          equipmentTags: ['STLP1', 'STLP2'],
          recommendations: 'Procure and retrofit 2 units of modern Danfoss FC-102 series VFDs. Re-terminate existing control wiring and configure Modbus RTU communication to BMS.',
        },
        engineerName: 'SK Ding',
        engineerSignedAt: new Date('2026-08-21T16:00:00Z'),
        customerName: 'En. Shahril',
        customerDesignation: 'Facility Engineer',
        customerSignedAt: new Date('2026-08-21T16:30:00Z'),
      },
    });
  }

  // Sample 2: Daily Site Report
  const kawanSite = customerKawan?.sites?.[0];
  if (kawanSite) {
    await prisma.report.upsert({
      where: { reportNumber: 'DSR-26/089' },
      update: {},
      create: {
        reportNumber: 'DSR-26/089',
        type: 'SITE_WORK',
        status: 'COMPLETED',
        customerId: customerKawan.id,
        siteId: kawanSite.id,
        authorId: engineer.id,
        title: 'SCADA Graphic Update & Reactor B Dosing Logic Modification',
        projectCode: 'CAOP-IDN-2026',
        reportDate: new Date('2026-08-01T08:00:00Z'),
        attendanceDate: new Date('2026-08-01T08:00:00Z'),
        startTime: '08:30 AM',
        endTime: '06:30 PM',
        normalHours: 8.0,
        otHours: 2.0,
        data: {
          workDescription: `1. Latest graphic updated at SCADA workstation.
2. H2O and PFAD flow to sonification tank need change from sharing with Reactor A to Reactor B.
3. Client request to put start/stop and all setting for each operation on reactor dosing at the side of reactor page.
4. *Suppose return flight will be on 1/8/24 but client request to prolong the stay due to unforeseen circumstances on running for Reactor B. After the meeting held this morning with the end user CEO, confirmed that running of Reactor B on dosing and cooling sequence will only proceed after changes on motor sizing, electrical and mechanical work are completed. Client estimated need to return to site 2 weeks later and requested PLC programmer standby ~3 weeks later.`,
          witnessName: 'Mr. Budi Santoso',
          verifiedName: 'Mr. Lee Wei Hong',
        },
        engineerName: 'SK Ding',
        engineerSignedAt: new Date('2026-08-01T18:45:00Z'),
        customerName: 'Mr. Budi Santoso',
        customerDesignation: 'Site Operations Lead',
        customerSignedAt: new Date('2026-08-01T19:00:00Z'),
      },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
