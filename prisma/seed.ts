import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  // SOC2 Trust Service Criteria
  { code: "CC1", name: "Control Environment", framework: "SOC2", description: "Organizational oversight, integrity, ethical values, and HR policies", sortOrder: 1 },
  { code: "CC2", name: "Communication & Information", framework: "SOC2", description: "Internal and external communication of security information", sortOrder: 2 },
  { code: "CC3", name: "Risk Assessment", framework: "SOC2", description: "Identification and analysis of risks to objectives", sortOrder: 3 },
  { code: "CC4", name: "Monitoring Activities", framework: "SOC2", description: "Ongoing evaluations and communication of deficiencies", sortOrder: 4 },
  { code: "CC5", name: "Control Activities", framework: "SOC2", description: "Policies and procedures to mitigate risks", sortOrder: 5 },
  { code: "CC6", name: "Logical & Physical Access", framework: "SOC2", description: "Controls over system access and physical security", sortOrder: 6 },
  { code: "CC7", name: "System Operations", framework: "SOC2", description: "Detection, response, and recovery from security incidents", sortOrder: 7 },
  { code: "CC8", name: "Change Management", framework: "SOC2", description: "Controls over system and infrastructure changes", sortOrder: 8 },
  { code: "CC9", name: "Risk Mitigation", framework: "SOC2", description: "Vendor management and business continuity", sortOrder: 9 },
  { code: "A1", name: "Availability", framework: "SOC2", description: "System availability per SLA commitments", sortOrder: 10 },
  { code: "C1", name: "Confidentiality", framework: "SOC2", description: "Protection of confidential information", sortOrder: 11 },
  { code: "PI1", name: "Processing Integrity", framework: "SOC2", description: "Complete, valid, accurate, and timely processing", sortOrder: 12 },
  { code: "P1", name: "Privacy", framework: "SOC2", description: "Collection, use, retention, and disposal of personal information", sortOrder: 13 },
  // HIPAA Safeguards
  { code: "HIPAA-AS", name: "Administrative Safeguards", framework: "HIPAA", description: "Policies and procedures governing ePHI access and workforce conduct", sortOrder: 14 },
  { code: "HIPAA-PS", name: "Physical Safeguards", framework: "HIPAA", description: "Physical access controls to systems and facilities handling ePHI", sortOrder: 15 },
  { code: "HIPAA-TS", name: "Technical Safeguards", framework: "HIPAA", description: "Technology controls protecting ePHI access and transmission", sortOrder: 16 },
];

type TaskSeed = {
  title: string;
  description: string;
  categoryCode: string;
  frequency: string;
  isSOC2: boolean;
  isHIPAA: boolean;
  isCommon: boolean;
  requiresApproval: boolean;
};

const tasks: TaskSeed[] = [
  // CC1 - Control Environment
  {
    title: "Security Awareness Training",
    description: "Conduct and document security awareness training for all workforce members. Retain attestations or completion records.",
    categoryCode: "CC1", frequency: "ANNUAL", isSOC2: true, isHIPAA: true, isCommon: true, requiresApproval: false,
  },
  {
    title: "Code of Conduct / Ethics Policy Review",
    description: "Review, update if needed, and re-acknowledge the code of conduct and ethics policy.",
    categoryCode: "CC1", frequency: "ANNUAL", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: true,
  },
  {
    title: "Background Check Process Review",
    description: "Verify background check procedures are in place for new hires and contractors. Document findings.",
    categoryCode: "CC1", frequency: "ANNUAL", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: false,
  },
  // CC2 - Communication & Information
  {
    title: "Security Policy Review & Acknowledgment",
    description: "Review all security policies for accuracy, obtain updated workforce acknowledgments.",
    categoryCode: "CC2", frequency: "ANNUAL", isSOC2: true, isHIPAA: true, isCommon: true, requiresApproval: true,
  },
  {
    title: "Internal Security Communications Review",
    description: "Confirm security notices, alerts, and policy updates have been communicated to relevant staff.",
    categoryCode: "CC2", frequency: "SEMI_ANNUAL", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: false,
  },
  // CC3 - Risk Assessment
  {
    title: "Annual Risk Assessment",
    description: "Perform a formal risk assessment covering all in-scope systems. Update the risk register with findings and mitigations.",
    categoryCode: "CC3", frequency: "ANNUAL", isSOC2: true, isHIPAA: true, isCommon: true, requiresApproval: true,
  },
  {
    title: "Threat Modeling Review",
    description: "Review threat models for key systems and services. Update documentation to reflect architectural changes.",
    categoryCode: "CC3", frequency: "ANNUAL", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: false,
  },
  // CC4 - Monitoring
  {
    title: "Internal Controls Self-Assessment",
    description: "Perform an internal audit of key controls. Document exceptions and remediation plans.",
    categoryCode: "CC4", frequency: "QUARTERLY", isSOC2: true, isHIPAA: false, isCommon: true, requiresApproval: false,
  },
  {
    title: "External Penetration Test",
    description: "Commission and review an external penetration test. Document findings and track remediation.",
    categoryCode: "CC4", frequency: "ANNUAL", isSOC2: true, isHIPAA: false, isCommon: true, requiresApproval: false,
  },
  // CC5 - Control Activities
  {
    title: "Control Activities Procedures Review",
    description: "Review and update documented control activity procedures to reflect current practices.",
    categoryCode: "CC5", frequency: "ANNUAL", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: true,
  },
  // CC6 - Logical & Physical Access
  {
    title: "User Access Review",
    description: "Review access rights for all users across in-scope systems. Remove or modify as appropriate. Retain evidence of review.",
    categoryCode: "CC6", frequency: "QUARTERLY", isSOC2: true, isHIPAA: true, isCommon: true, requiresApproval: true,
  },
  {
    title: "Privileged Access Review",
    description: "Review all privileged (admin) accounts. Verify necessity and appropriateness of elevated access.",
    categoryCode: "CC6", frequency: "QUARTERLY", isSOC2: true, isHIPAA: true, isCommon: true, requiresApproval: true,
  },
  {
    title: "Access Control Policy Review",
    description: "Review and update the access control policy. Obtain sign-off from appropriate owner.",
    categoryCode: "CC6", frequency: "ANNUAL", isSOC2: true, isHIPAA: true, isCommon: false, requiresApproval: true,
  },
  {
    title: "MFA Enforcement Review",
    description: "Verify MFA is enforced on all systems per policy. Document any exceptions with compensating controls.",
    categoryCode: "CC6", frequency: "SEMI_ANNUAL", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: false,
  },
  {
    title: "Password Policy Review",
    description: "Review and confirm password complexity, expiration, and lockout policies are properly enforced.",
    categoryCode: "CC6", frequency: "ANNUAL", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: false,
  },
  {
    title: "Terminated User Access Removal Audit",
    description: "Review recent terminations and confirm timely removal of system access. Retain evidence.",
    categoryCode: "CC6", frequency: "QUARTERLY", isSOC2: true, isHIPAA: true, isCommon: true, requiresApproval: false,
  },
  // CC7 - System Operations
  {
    title: "Vulnerability Scanning",
    description: "Run vulnerability scans across in-scope infrastructure. Review results and track remediation of critical/high findings.",
    categoryCode: "CC7", frequency: "QUARTERLY", isSOC2: true, isHIPAA: false, isCommon: true, requiresApproval: false,
  },
  {
    title: "Security Log & Alert Review",
    description: "Review security logs, SIEM alerts, and monitoring dashboards. Document review and any findings.",
    categoryCode: "CC7", frequency: "QUARTERLY", isSOC2: true, isHIPAA: true, isCommon: true, requiresApproval: false,
  },
  {
    title: "Incident Response Plan Test (Tabletop)",
    description: "Conduct a tabletop exercise or full IR drill. Document scenario, participants, and lessons learned.",
    categoryCode: "CC7", frequency: "ANNUAL", isSOC2: true, isHIPAA: true, isCommon: true, requiresApproval: false,
  },
  {
    title: "Patch Management Review",
    description: "Review patch cadence and verify critical patches were applied within SLA. Document outstanding patches.",
    categoryCode: "CC7", frequency: "QUARTERLY", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: false,
  },
  // CC8 - Change Management
  {
    title: "Change Log Review",
    description: "Review change management records to confirm all changes followed the approved process.",
    categoryCode: "CC8", frequency: "QUARTERLY", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: false,
  },
  {
    title: "Change Management Policy Review",
    description: "Review and update the change management policy and procedure documentation.",
    categoryCode: "CC8", frequency: "ANNUAL", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: true,
  },
  // CC9 - Risk Mitigation
  {
    title: "Vendor / Third-Party Risk Assessment",
    description: "Review security posture of critical vendors. Obtain and review SOC 2 reports, security questionnaires, or equivalent.",
    categoryCode: "CC9", frequency: "ANNUAL", isSOC2: true, isHIPAA: true, isCommon: true, requiresApproval: false,
  },
  {
    title: "Business Continuity Plan (BCP) Review & Test",
    description: "Review the BCP for accuracy. Conduct a test or walkthrough. Document results and update plan.",
    categoryCode: "CC9", frequency: "ANNUAL", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: true,
  },
  {
    title: "Disaster Recovery Plan (DRP) Review",
    description: "Review and update the DRP. Verify recovery time and point objectives are still aligned with business needs.",
    categoryCode: "CC9", frequency: "SEMI_ANNUAL", isSOC2: true, isHIPAA: true, isCommon: false, requiresApproval: true,
  },
  // A1 - Availability
  {
    title: "Capacity Planning Review",
    description: "Review current infrastructure capacity and projected growth. Document plan to address gaps.",
    categoryCode: "A1", frequency: "ANNUAL", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: false,
  },
  {
    title: "Uptime / SLA Review",
    description: "Review system uptime metrics against SLA commitments. Document any incidents and root causes.",
    categoryCode: "A1", frequency: "QUARTERLY", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: false,
  },
  // C1 - Confidentiality
  {
    title: "Data Classification Review",
    description: "Review and update the data classification policy and inventory. Confirm data handling aligns with classification.",
    categoryCode: "C1", frequency: "ANNUAL", isSOC2: true, isHIPAA: true, isCommon: false, requiresApproval: true,
  },
  {
    title: "Data Retention & Disposal Policy Review",
    description: "Review data retention schedules and disposal procedures. Verify compliant disposal of data past retention period.",
    categoryCode: "C1", frequency: "ANNUAL", isSOC2: true, isHIPAA: true, isCommon: false, requiresApproval: true,
  },
  // PI1 - Processing Integrity
  {
    title: "Data Quality & Processing Review",
    description: "Review processing logs and output validation controls. Document any data quality issues and corrective actions.",
    categoryCode: "PI1", frequency: "QUARTERLY", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: false,
  },
  {
    title: "Processing Integrity Controls Review",
    description: "Review controls ensuring complete, accurate, and timely processing of transactions.",
    categoryCode: "PI1", frequency: "ANNUAL", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: false,
  },
  // P1 - Privacy
  {
    title: "Privacy Policy Review",
    description: "Review and update the external privacy policy. Confirm it accurately reflects data practices.",
    categoryCode: "P1", frequency: "ANNUAL", isSOC2: true, isHIPAA: true, isCommon: false, requiresApproval: true,
  },
  {
    title: "Data Subject Request Process Review",
    description: "Verify the process for handling DSRs (access, deletion, correction) is documented and working.",
    categoryCode: "P1", frequency: "ANNUAL", isSOC2: true, isHIPAA: false, isCommon: false, requiresApproval: false,
  },
  // HIPAA - Administrative Safeguards
  {
    title: "HIPAA Security Risk Analysis",
    description: "Conduct a formal HIPAA Security Rule risk analysis covering all ePHI. Document threats, vulnerabilities, and safeguards.",
    categoryCode: "HIPAA-AS", frequency: "ANNUAL", isSOC2: false, isHIPAA: true, isCommon: true, requiresApproval: true,
  },
  {
    title: "HIPAA Training for All Workforce",
    description: "Conduct HIPAA privacy and security training. Retain signed attestations or completion records for each member.",
    categoryCode: "HIPAA-AS", frequency: "ANNUAL", isSOC2: false, isHIPAA: true, isCommon: true, requiresApproval: false,
  },
  {
    title: "Business Associate Agreement (BAA) Review",
    description: "Review all BAAs with vendors who access ePHI. Confirm all required BAAs are current and complete.",
    categoryCode: "HIPAA-AS", frequency: "ANNUAL", isSOC2: false, isHIPAA: true, isCommon: true, requiresApproval: false,
  },
  {
    title: "HIPAA Policies & Procedures Review",
    description: "Review and update all HIPAA-required policies and procedures. Obtain approval from designated Security/Privacy Officer.",
    categoryCode: "HIPAA-AS", frequency: "ANNUAL", isSOC2: false, isHIPAA: true, isCommon: false, requiresApproval: true,
  },
  {
    title: "Sanction Policy Review",
    description: "Review and update the workforce sanction policy for HIPAA violations. Document approval.",
    categoryCode: "HIPAA-AS", frequency: "ANNUAL", isSOC2: false, isHIPAA: true, isCommon: false, requiresApproval: true,
  },
  {
    title: "Workforce Clearance & Termination Procedure Review",
    description: "Verify workforce clearance procedures and termination checklists are current and being followed.",
    categoryCode: "HIPAA-AS", frequency: "ANNUAL", isSOC2: false, isHIPAA: true, isCommon: false, requiresApproval: false,
  },
  {
    title: "ePHI Access Log Review",
    description: "Review audit logs for ePHI access. Identify and document any anomalies or unauthorized access attempts.",
    categoryCode: "HIPAA-AS", frequency: "QUARTERLY", isSOC2: false, isHIPAA: true, isCommon: true, requiresApproval: false,
  },
  {
    title: "Contingency Plan Review & Test",
    description: "Review and test the HIPAA contingency plan including data backup, DR, and emergency access procedures.",
    categoryCode: "HIPAA-AS", frequency: "ANNUAL", isSOC2: false, isHIPAA: true, isCommon: false, requiresApproval: false,
  },
  // HIPAA - Physical Safeguards
  {
    title: "Facility Access Control Review",
    description: "Review physical access controls to areas housing systems with ePHI. Verify logs and remove stale access.",
    categoryCode: "HIPAA-PS", frequency: "ANNUAL", isSOC2: false, isHIPAA: true, isCommon: false, requiresApproval: false,
  },
  {
    title: "Workstation Use & Security Policy Review",
    description: "Review workstation use policies and physical safeguards (screen locks, clean desk, etc.).",
    categoryCode: "HIPAA-PS", frequency: "ANNUAL", isSOC2: false, isHIPAA: true, isCommon: false, requiresApproval: true,
  },
  {
    title: "Device & Media Controls Review",
    description: "Review procedures for disposal and reuse of hardware and electronic media containing ePHI.",
    categoryCode: "HIPAA-PS", frequency: "ANNUAL", isSOC2: false, isHIPAA: true, isCommon: false, requiresApproval: false,
  },
  {
    title: "Physical Security Assessment",
    description: "Assess physical security of facilities handling ePHI. Document findings and remediation items.",
    categoryCode: "HIPAA-PS", frequency: "SEMI_ANNUAL", isSOC2: false, isHIPAA: true, isCommon: false, requiresApproval: false,
  },
  // HIPAA - Technical Safeguards
  {
    title: "ePHI Access Control Audit",
    description: "Review technical access controls for all ePHI systems. Confirm role-based access and least privilege are enforced.",
    categoryCode: "HIPAA-TS", frequency: "QUARTERLY", isSOC2: false, isHIPAA: true, isCommon: true, requiresApproval: false,
  },
  {
    title: "Encryption Policy Review",
    description: "Review encryption standards for ePHI at rest and in transit. Verify current implementations comply.",
    categoryCode: "HIPAA-TS", frequency: "ANNUAL", isSOC2: false, isHIPAA: true, isCommon: false, requiresApproval: true,
  },
  {
    title: "Automatic Logoff Configuration Review",
    description: "Verify automatic session timeout is configured on all systems accessing ePHI.",
    categoryCode: "HIPAA-TS", frequency: "ANNUAL", isSOC2: false, isHIPAA: true, isCommon: false, requiresApproval: false,
  },
  {
    title: "Emergency Access Procedure Test",
    description: "Test emergency access procedures for ePHI systems. Document test results and any gaps.",
    categoryCode: "HIPAA-TS", frequency: "SEMI_ANNUAL", isSOC2: false, isHIPAA: true, isCommon: false, requiresApproval: false,
  },
  {
    title: "Audit Log Integrity & Retention Review",
    description: "Verify audit logs for ePHI systems are complete, tamper-evident, and retained per policy.",
    categoryCode: "HIPAA-TS", frequency: "SEMI_ANNUAL", isSOC2: false, isHIPAA: true, isCommon: false, requiresApproval: false,
  },
];

async function main() {
  console.log("Seeding compliance task library...");

  // Upsert categories
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const record = await prisma.controlCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: cat,
    });
    categoryMap[cat.code] = record.id;
  }

  // Upsert task templates
  for (const task of tasks) {
    const categoryId = categoryMap[task.categoryCode];
    if (!categoryId) {
      console.warn(`No category found for code: ${task.categoryCode}`);
      continue;
    }
    await prisma.taskTemplate.upsert({
      where: { id: `seed-${task.title.toLowerCase().replace(/\s+/g, "-").slice(0, 50)}` },
      update: {},
      create: {
        id: `seed-${task.title.toLowerCase().replace(/\s+/g, "-").slice(0, 50)}`,
        title: task.title,
        description: task.description,
        categoryId,
        frequency: task.frequency,
        isSOC2: task.isSOC2,
        isHIPAA: task.isHIPAA,
        isCommon: task.isCommon,
        requiresApproval: task.requiresApproval,
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${tasks.length} task templates.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
