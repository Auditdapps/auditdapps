export type QuestionType = "single" | "multi";

export type OrganizationQuestion = {
  question: string;
  options: string[];
  type: QuestionType;
};

export const organizationQuestions: OrganizationQuestion[] = [
  /* =========================
   * Blockchain & Protocol (informational)
   * ========================= */
  {
    question:
      "What consensus mechanism does the organization’s DApp rely on, and if custom, how is it implemented?",
    type: "single",
    options: [
      "Proof of Work",
      "Proof of Stake",
      "Delegated Proof of Stake (DPoS)",
      "Proof of Authority (PoA)",
      "Practical Byzantine Fault Tolerance (PBFT)",
      "Others"
    ]
  },

  /* =========================
   * Project Scope & Alignment (controls)
   * ========================= */
  {
    question:
      "Is the scope of the DApp project clearly defined, including functionalities and user interactions aligned with organizational goals?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },

  /* =========================
   * Development Practices (controls)
   * ========================= */
  {
    question:
      "Does the organization have standardized coding best practices for DApp development and implementation?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Does the organization implement secure protocols (e.g., TLS/HTTPS, secure oracles) for in-app and out-of-app communications?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Does the organization collaborate with external parties to share CTI and review DApp security?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Does the organization conduct security awareness campaigns for developers and users?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },

  /* =========================
   * Security Audits & Risk Management (controls)
   * ========================= */
  {
    question:
      "How frequently are DApps audited against prevalent and emerging threats (incl. third-party audits)?",
    type: "single",
    options: ["Quarterly (with third-party)", "Annually", "Ad-hoc or rarely", "N/A"]
  },
  {
    question:
      "Is there a standardized reporting channel for security events and CTI (e.g., MITRE-aligned)?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Is there a standardized customer disclosure channel for incidents and risk levels?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Does the organization engage reputable third-party firms for regular security audits?",
    type: "single",
    options: ["Yes (reputable & regular)", "Partial (infrequent/limited)", "No", "N/A"]
  },
  {
    question:
      "How often does the organization carry out formal risk assessments of DApps and business logic?",
    type: "single",
    options: ["Monthly", "Quarterly", "Annually", "Ad-hoc", "N/A"]
  },
  {
    question:
      "Is there a formalized incident response plan (recovery and communications)?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },

  /* =========================
   * Smart Contract Lifecycle (controls)
   * ========================= */
  {
    question:
      "Are smart contracts subject to automated static analysis and/or formal verification before deployment?",
    type: "single",
    options: ["Yes (FV + SAST)", "Partial (SAST only)", "No", "N/A"]
  },
  {
    question:
      "Are contracts reviewed by ≥2 independent reviewers and accompanied by unit/integration tests with coverage thresholds?",
    type: "single",
    options: ["Yes (≥80%)", "Partial (<80%)", "No", "N/A"]
  },
  {
    question:
      "If upgradeable proxies are used, are upgrade risks addressed (admin key controls, initializer guards, UUPS/Transparent best practices)?",
    type: "single",
    options: [
      "Yes",
      "Partial",
      "No",
      "Not using upgradeable contracts (N/A)"
    ]
  },

  /* =========================
   * Key Management & Access Control (controls)
   * ========================= */
  {
    question:
      "Are administrative and treasury operations protected with multisig and/or HSM?",
    type: "single",
    options: ["Yes (multisig/HSM)", "Partial", "No", "N/A"]
  },
  {
    question:
      "Are keys rotated, access revocation enforced, and secrets stored in a secure vault (e.g., KMS/Vault)?",
    type: "single",
    options: ["Yes (rotation + revocation + vault)", "Partial", "No", "N/A"]
  },
  {
    question:
      "Are on-chain roles and off-chain privileges separated (least privilege) and auditable?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },

  /* =========================
   * Change Management & Governance (controls)
   * ========================= */
  {
    question:
      "Is there a formal change management process for upgrades/releases (tickets, approvals, rollback plans)?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Are emergency pause/kill-switch mechanisms implemented and routinely tested?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "For protocols with governance, are decision records and processes documented and auditable?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },

  /* =========================
   * Monitoring & Incident Detection (controls)
   * ========================= */
  {
    question:
      "Is on-chain activity monitored for anomalies (e.g., admin actions, event anomalies, MEV/exploit signatures)?",
    type: "single",
    options: ["Yes (automated)", "Partial", "No", "N/A"]
  },
  {
    question:
      "Are automated alerts configured (Slack/Discord/PagerDuty/webhooks) with runbooks?",
    type: "single",
    options: ["Yes (with runbooks)", "Partial (alerts only)", "No", "N/A"]
  },
  {
    question:
      "Are logs and security telemetry retained with integrity protections for forensics?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  }
];
