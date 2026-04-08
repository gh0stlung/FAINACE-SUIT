🔐 Security Policy

📦 Supported Versions

We only support the latest release of FINANCE SUITE.

Version| Supported
Latest| ✅
Older| ❌

---

🧠 Security Model

FINANCE SUITE is a local-first, client-side application.

- No backend
- No cloud storage
- No external API dependency
- All data stored in browser ("localStorage")

This removes most traditional risks like:

- Server breaches
- Database leaks
- API exploits

---

⚠️ Real Risks (Important)

Because data is stored locally, the main risks are:

- Device compromise (malware, shared device)
- Browser data clearing (cache / storage wipe)
- Manual tampering via developer tools
- No built-in encryption layer

👉 This is a user-controlled system, not a managed cloud service.

---

🚨 Reporting Vulnerabilities

If you discover a vulnerability (logic flaw, data corruption, UI exploit):

1. open a public issue
2. Include:
   - Clear description
   - Steps to reproduce
   - Screenshots / proof

⏱ Expected response: within 48 hours

---

🛡️ Recommended User Practices

- Use a personal device only
- Avoid using in public/shared browsers
- Backup data manually (export or browser backup)
- Do not modify storage manually unless you understand the structure

---

⚖️ Disclaimer

This software is provided "as is".

- The developer is not responsible for:
  - Data loss due to browser clearing
  - Device-level compromise
  - User misconfiguration

You are fully responsible for managing and securing your data.

---

🔮 Future Security Enhancements (Planned)

- Optional local encryption layer
- Export/import with validation
- Data integrity checks

---
