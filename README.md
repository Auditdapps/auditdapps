# AuditDapps

AuditDapps is a security self-audit and risk assessment platform for digital applications and organisations.

Originally focused on Web3 smart contract security, AuditDapps has expanded to support both Web3 and Web2 security self-audits. The platform helps teams identify risks early through guided self-audits, deterministic analysis, and AI-assisted review, before engaging in expensive third-party audits.

The goal is simple: reduce preventable vulnerabilities and improve security readiness across modern digital systems.

AuditDapps is designed to complement, not replace, professional security audits.

---

## Screenshots

### Landing Page
![Landing page](docs/screenshots/landing.png)

### Self-Audit Flow
![Self audit flow](docs/screenshots/self-audit.png)

### Results & Findings
![Audit results](docs/screenshots/reports.png)

---

## Why AuditDapps

Many security issues are not caused by advanced attacks, but by:
- missed best-practice checks
- rushed deployments
- lack of structured internal review
- limited access to early security expertise
- poor visibility into security hygiene over time

AuditDapps addresses this gap by providing:
- a structured, guided self-audit flow
- deterministic analysis where applicable
- AI-assisted explanation and remediation guidance
- consistent security baselines
- an audit trail teams can iterate on before formal audits

---

## Supported Security Domains

AuditDapps provides security self-audits and risk assessment for:

- Web3 and blockchain applications
- Web2 web applications and APIs
- Backend services and infrastructure
- Organisational security practices
- Digital processes and operational security

---

## What does "AuditDapps" mean?

AuditDapps stands for **Audit Digital Applications and Processes**.

The platform is designed to support security audits across both Web2 and Web3 systems using structured frameworks, automated checks, and AI-assisted recommendations.

---

## Core Features

### Guided Self-Audit
A step-by-step checklist that adapts to developer vs organisation workflows, application type (Web2 or Web3), and security maturity.

### Deterministic Analysis
For supported targets, AuditDapps integrates deterministic analysis tools to identify concrete security issues before AI involvement.

For Web3, this includes Slither-based static analysis executed via an isolated backend service.

Findings are deterministic, explainable, and displayed separately from AI output to preserve trust.

### AI-Assisted Analysis
AI is used only after deterministic checks to:
- summarise security posture
- explain impact and risk
- suggest remediation steps

AI output is never treated as ground truth and does not replace deterministic findings.

### Audit History and Tracking
Authenticated users can view previous audits, track implemented recommendations, and maintain a security improvement record over time.

---

## Tech Stack

**Frontend**
- React
- TypeScript
- Tailwind CSS
- Vite
- Framer Motion
- Vitest

**Backend and Platform**
- Supabase (Postgres, Auth, Storage)
- Supabase Edge Functions
- FastAPI (Python)
- Slither
- OpenAI API

---

## Documentation

The repository is organised with dedicated documentation for deeper technical and operational details:

- **Architecture overview:** `ARCHITECTURE.md`
- **Security and responsible disclosure:** `SECURITY.md`
- **Contributing guidelines:** `CONTRIBUTING.md`
- **Releases and versioning:** `RELEASE.md`

These documents are intentionally kept separate to avoid duplication in the README.

---

## Project Status

### Available Today
- Guided self-audit flow
- Web3 deterministic static analysis (Slither)
- AI-assisted findings and summaries
- Web2 and Web3 audit paths
- PDF audit report export
- Audit history for authenticated users
- Rate limiting and abuse protection

### Next
- Expanded Web2 automated checks (OWASP Top 10, API security, dependency risks)
- Async job handling for long-running scans
- Improved report formatting and export reliability
- Organisational and team plans
- Compliance readiness modules (ISO 27001 Lite, SOC 2 readiness)

AuditDapps is currently in public beta and evolving based on user feedback.

---

## License

This project is licensed under the **MIT License**.  
See `LICENSE` for details.

---

## Maintainers

AuditDapps is developed and maintained by the AuditDapps engineering team.

Lead Engineer: **Blessed (luckaty)**
