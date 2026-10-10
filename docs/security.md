# Security Architecture & Defensive Engineering

**Institution:** Guru Nanak Dev Engineering College, Ludhiana  
**Department:** Department of Information Technology  
**Project:** Automated Linux User Management Shell Script  

---

## 1. Cybersecurity Threat Model & Mitigation Matrix

| Threat Category | Specific Attack / Risk Scenario | Engineering Mitigation in `user_management.sh` |
| :--- | :--- | :--- |
| **Command Injection** | Metacharacters injected via username or GECOS comment (e.g. `user; rm -rf /`) | Strict POSIX regex validation `^[a-z_][a-z0-9_-]*$`; all shell variables quoted `"$var"`; colon characters stripped from GECOS to prevent `/etc/passwd` field desynchronization. |
| **Privilege Escalation** | Unprivileged users running low-level account modification calls | Pre-flight check verifies `EUID == 0` before any execution; non-root execution cleanly blocked with `sudo` guidance (unless explicitly run in non-destructive `--dry-run` simulation mode). |
| **Credential Leakage** | Plaintext passwords passed via script arguments or recorded in shell histories/logs | Passwords are NEVER accepted as CLI arguments or variables; account creation delegates to standard PAM `passwd` binary with native tty masking; zero secrets written to audit logs. |
| **Denial of Service / Lockout** | Administrator accidentally locking or deleting `root` or active administrative session | Hardcoded protection guard explicitly shields `root`, system accounts (UID < `UID_MIN` from `/etc/login.defs`), and current `$OPERATOR` / `$SUDO_USER`. |
| **Irreversible Data Loss** | Running destructive account deletion without verified data preservation | Two-choice deletion policy; mandatory GNU `tar` compression of home directories to `/var/backups/user_mgmt_backups/`; archive integrity verified via `tar -tzf` before deletion; strict confirmation token `DELETE <username>`. |
| **Audit Log Tampering** | Unauthorized users reading or altering administrative audit records | Audit log created with restrictive permissions (`0600`); simultaneous broadcast to syslog daemon (`logger -t sys_user_mgmt`) ensuring remote forwarding compliance. |

---

## 2. Authentication Deep-Dive: Password Locking vs. Disabling

A fundamental cybersecurity concept emphasized in Linux system administration is the distinction between **password locking** and **complete account disabling**:

### What `passwd -l` Does:
1. When `passwd -l <username>` (or `usermod -L`) is invoked, the Linux shadow utility prepends an exclamation mark (`!`) to the encrypted password hash stored in `/etc/shadow`.
2. This invalidates password-based authentication because no cryptographic hash can match the modified string.
3. **What it does NOT do:**
   - It does **not** revoke SSH public keys stored in `~/.ssh/authorized_keys`.
   - It does **not** terminate currently active user sessions or open shell connections.
   - It does **not** stop running background processes, `screen`/`tmux` sessions, or scheduled user `cron` jobs.
   - It does **not** disable Kerberos tickets or active sudo sessions.

### Complete Account Deprovisioning Requirements:
In high-security environments, complete account deactivation requires a multi-step checklist:
1. Lock password hash (`passwd -l <user>`).
2. Expire account immediately (`chage -E 0 <user>` or `usermod --expiredate 1 <user>`).
3. Set login shell to `/usr/sbin/nologin` or `/bin/false`.
4. Terminate active user processes (`pkill -u <user>`).
5. Remove or rename SSH keys (`~/.ssh/authorized_keys`).

The application explicitly educates the administrator on this distinction during menu Option 7.

---

## 3. Credential Hygiene & Zero-Trust Password Handling

Many beginner automation scripts violate core security principles by:
- Accepting passwords as command-line arguments (visible in `ps aux` and `/proc` process tables).
- Storing shared default passwords (e.g. `Password123!`) for new users.
- Echoing passwords into `useradd -p` (which expects pre-hashed strings, leading to plaintext passwords in `/etc/shadow`).

### Secure Pattern Implemented in this Project:
1. **Interactive Delegation:** After `useradd` creates the user account structure, the administrator is prompted to provision an initial password directly through the native PAM `passwd` binary.
2. **Immediate Rotation Enforcement:** The administrator is given the option to enforce `chage -d 0 <username>`. This sets the password last changed date to Epoch day 0, forcing the employee or student to choose their own confidential password upon their very first terminal or SSH login.

---

## 4. Defensive Deletion & Home Directory Archival

The deletion workflow (Option 10) represents the most destructive capability of the application. It applies the **Principle of Verified Fail-Safe Defaults**:

1. **Pre-Check Filter:** If the target account is `root`, has a UID below `UID_MIN` (e.g. 1000), or matches the active administrator, the script halts with an explicit security block.
2. **Integrity-First Archival:**
   ```bash
   tar -czpf "$archive_path" -C "$(dirname "$homedir")" "$(basename "$homedir")"
   if ! tar -tzf "$archive_path" >/dev/null 2>&1; then
       # Abort deletion if archive test fails
       exit 1
   fi
   ```
   If the archive is corrupt, truncated, or incomplete, the script **never deletes the account**.
3. **Explicit Token Confirmation:** The operator must manually type `DELETE <username>`. Blank inputs, lowercase variations, or timeouts immediately trigger a safe cancellation.

---

## 5. Audit Logging Architecture

Compliance standards (such as ISO/IEC 27001, NIST SP 800-53, and CIS Benchmarks) mandate accountability for administrative actions:

```
[TIMESTAMP] [OPERATOR: operator_name] [ACTION: ACTION_CODE] [TARGET: target_entity] [STATUS: OUTCOME] [DETAILS: description]
```

### Log Properties:
- **Location:** `/var/log/sys_user_mgmt.log` (Fallback: `./logs/sys_user_mgmt.log`).
- **File Permissions:** Created with `chmod 0600` (read/write by root only).
- **Dual-Dispatch:** Uses both local file appending and `logger -t sys_user_mgmt` for systemd journal / rsyslog integration.
- **Zero Secrets:** No passwords, hashes, or sensitive credentials are ever written.
