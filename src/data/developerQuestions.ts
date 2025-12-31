export type QuestionType = "single" | "multi";

export type DeveloperQuestion = {
  question: string;
  options: string[];
  type: QuestionType;
};

export const developerQuestions: DeveloperQuestion[] = [
  /* =========================
   * Blockchain & Protocol Design (informational)
   * ========================= */
  {
    question:
      "What consensus mechanism does the DApp’s underlying blockchain or protocol rely on?",
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
  {
    question:
      "Is the DApp designed to operate across multiple blockchains, and if so, how are cross-chain interactions secured?",
    type: "multi",
    options: [
      "Secure cross-chain messaging (e.g., CCIP, LayerZero)",
      "Native bridges with additional safeguards",
      "Light-client verification",
      "No, single-chain only",
      "Others"
    ]
  },

  /* =========================
   * Project Scope & Architecture (controls)
   * ========================= */
  {
    question:
      "Is the scope of the DApp project clearly defined, including functionalities and user interactions?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Does the DApp employ isolation of different modules in its underlying design?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },

  /* =========================
   * Coding Standards & Development Practices (controls)
   * ========================= */
  {
    question:
      "Do you have standard coding procedures that inform the development of smart contracts?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Do your coding procedures follow established security frameworks (OWASP, ConsenSys, or CISA security-by-design)?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },

  /* =========================
   * Security Measures (controls)
   * ========================= */
  {
    question:
      "What cryptographic concepts and techniques are utilized in the DApp?",
    type: "multi",
    options: [
      "Encryption",
      "Public-key cryptography",
      "Digital signatures",
      "Hash functions",
      "Zero-knowledge proofs",
      "Multi-party computation",
      "Homomorphic encryption",
      "None",
      "Others"
    ]
  },
  {
    question:
      "Are security functions such as input validation and access control implemented within the smart contract?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Does the smart contract enforce least privilege through role-based access control (e.g., OpenZeppelin AccessControl)?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Does the smart contract include mechanisms to prevent re-entrancy attacks?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Are state variables properly encapsulated with suitable access modifiers?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Is the smart contract designed to handle overflow/underflow vulnerabilities?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Does the smart contract use a secure randomness source for critical operations?",
    type: "single",
    options: ["Yes", "Partial", "No", "Not required (N/A)"]
  },
  {
    question:
      "Is the DApp designed with a fallback or receive function secured against misuse?",
    type: "single",
    options: ["Yes", "Partial", "No", "Not implemented (N/A)"]
  },
  {
    question:
      "Are upgradeability and self-destruct functionalities safeguarded against unauthorized or accidental triggers?",
    type: "single",
    options: [
      "Yes",
      "Partial",
      "No",
      "Not upgradeable / no self-destruct (N/A)"
    ]
  },
  {
    question:
      "Does the DApp include an emergency pause/stop (circuit breaker) feature?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Does the smart contract include mitigations for gas limit DoS (e.g., pull over push, bounded loops)?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Has the DApp been analyzed for economic attack vectors (flash loans, oracle manipulation)?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Does the DApp incorporate privacy-preserving techniques where applicable?",
    type: "single",
    options: ["Yes", "Partial", "No", "Not applicable (N/A)"]
  },

  /* =========================
   * Testing & Optimization (controls)
   * ========================= */
  {
    question:
      "Is the code well-organized and aligned with best practices for readability and maintainability?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Have comprehensive unit and integration tests been conducted with coverage targets?",
    type: "single",
    options: ["Yes (≥80%)", "Partial (<80%)", "No", "N/A"]
  },
  {
    question:
      "Has the contract been tested for gas optimization?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Has the smart contract undergone formal verification and/or static analysis?",
    type: "single",
    options: ["Yes (FV + SAST)", "Partial (SAST only)", "No", "N/A"]
  },
  {
    question:
      "Has the contract been tested against front-running and reordering attacks?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },

  /* =========================
   * Documentation & Auditing (controls)
   * ========================= */
  {
    question:
      "Is there comprehensive documentation detailing the implementation of security recommendations?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Has the DApp undergone external audits by reputable firms?",
    type: "single",
    options: ["Yes (reputable)", "Partial (informal/limited)", "No", "N/A"]
  },
  {
    question:
      "Is there a documented incident response plan post-deployment?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },

  /* =========================
   * Standards & Dependencies (controls)
   * ========================= */
  {
    question:
      "Does the smart contract comply with relevant token standards or interoperability protocols?",
    type: "single",
    options: ["Yes, fully", "Partial", "No", "N/A"]
  },
  {
    question:
      "Are external libraries and dependencies vetted and kept up to date?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "Is the smart contract compatible with recommended best practices (e.g., ConsenSys, OpenZeppelin)?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },

  /* =========================
   * User-Facing Security (controls)
   * ========================= */
  {
    question:
      "Does the DApp front-end include protections against phishing/malicious approvals/tx manipulation?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },

  /* =========================
   * Events & Monitoring (controls)
   * ========================= */
  {
    question:
      "Are events used effectively to log important contract actions for monitoring?",
    type: "single",
    options: ["Yes", "Partial", "No", "N/A"]
  },
  {
    question:
      "How promptly are identified vulnerabilities addressed and remediated?",
    type: "single",
    options: ["Within 24 hours", "Within a week", "Not promptly", "N/A"]
  }
];
