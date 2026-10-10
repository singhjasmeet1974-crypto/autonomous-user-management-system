# Automated Linux User Management Shell Script

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Linux](https://img.shields.io/badge/Platform-Ubuntu%20%7C%20Debian%20%7C%20RHEL-orange.svg)](https://ubuntu.com)
[![Shell: Bash 4+](https://img.shields.io/badge/Shell-GNU%20Bash%204.0+-brightgreen.svg)](https://www.gnu.org/software/bash/)
[![Academic Project](https://img.shields.io/badge/Academic-B.Tech%20IT%20Training-purple.svg)](https://gndec.ac.in)

> **College:** Guru Nanak Dev Engineering College, Ludhiana  
> **Department:** Department of Information Technology  
> **Course:** B.Tech Information Technology — 4-Week Institutional / Industrial Training Project  
> **Version:** 1.0.0  

---

## 1. Project Title and Purpose

The **Automated Linux User Management Shell Script** is a menu-driven, enterprise-grade command-line utility developed in GNU Bash. It simplifies and automates routine Linux user and group administration tasks on multi-user servers.

The application brings structure, security, and audit compliance to administrative workflows by replacing repetitive, error-prone manual commands with an interactive terminal interface equipped with strict input validation, superuser privilege verification, safe deletion safeguards, and centralized audit logging.

---

## 2. Problem Statement

In multi-user enterprise servers, academic computing labs, and cloud instances, Linux system administrators repeatedly perform tasks such as onboarding users, assigning supplementary groups, configuring password expiry policies, locking inactive accounts, and decommissioning departed users.

Executing these operations through raw command-line tools (`useradd`, `usermod`, `userdel`, `groupadd`, `gpasswd`, `passwd`, `chage`) introduces significant risks:
- **Configuration Drift & Errors:** Missing home directories, inconsistent login shells, or forgotten group assignments.
- **Accidental Group Overwriting:** Omitting the `-a` flag in `usermod -G` inadvertently wipes out all previous secondary groups for that user.
- **Catastrophic Data Loss:** Deleting accounts with `userdel -r` without a verified backup permanently destroys user files.
- **Accidental Lockout:** Accidentally modifying or locking `root` or the executing administrator's active session.
- **Lack of Accountability:** Unrecorded administrative commands make post-incident forensic audits impossible.
- **Security Vulnerabilities:** Hardcoding default passwords or passing plaintext passwords via command-line arguments leaks credentials in process tables and shell history files.

This project delivers a defensive, automated, and auditable solution to solve these exact problems.

---

## 3. Main Objectives

1. **Automate User Lifecycle Management:** Provide a guided workflow for creating, modifying, locking, unlocking, and deleting local Linux accounts.
2. **Enforce Least Privilege & Pre-Flight Checks:** Verify root privileges before running protected commands; guide unprivileged users on how to use `sudo`.
3. **Validate All Inputs:** Enforce POSIX naming conventions on usernames and groups; sanitize inputs against command injection.
4. **Preserve Group Memberships:** Ensure supplementary group additions strictly append without replacing existing groups (`usermod -aG`).
5. **Enforce Password Security Policies:** Interface with `chage` to implement maximum password age, rotation warning windows, and mandatory password changes on first login.
6. **Defensive Deletion Safeguards:** Require explicit confirmation phrases (`DELETE <username>`) and create verified `tar` home directory backups prior to account deletion.
7. **Maintain Centralized Audit Trails:** Record every action with timestamps, operator ID, target, and status in `/var/log/sys_user_mgmt.log` and the system syslog daemon.
8. **Provide a Safe Demonstration Mode:** Include a complete `--dry-run` simulation engine allowing students and faculty to test all features safely on any machine without modifying system files.

---

## 4. Key Features

- **Professional Terminal Interface:** Clean ASCII banner with college credentials, system status, and intuitive 15-option menu.
- **Interactive Single & Batch Creation:** Provision individual accounts or queue multiple users interactively with duplicate detection.
- **Account Modification:** Modify user full names (GECOS comment) and default login shells with safety checks against `/etc/shells`.
- **Role-Based Group Administration:** Create groups, add users to supplementary groups safely, and remove memberships without altering primary groups.
- **Security Education & Account Locking:** Clear educational guidance distinguishing password-hash locking (`passwd -l`) from total account deactivation (SSH keys, active sessions, cron jobs).
- **Password Aging via `chage`:** Configure maximum password age, warning days, and forced password reset at next login (`chage -d 0`).
- **High-Security Deletion Workflow:** Multi-stage safety pipeline refusing root/system/operator deletion, offering verified `tar.gz` home directory backup, and requiring exact token confirmation.
- **Comprehensive Reporting:** Formatted ASCII compliance reports classifying regular users versus system daemons with summary statistics.
- **Zero Plaintext Secrets:** No passwords stored, passed as arguments, or written to logs.

---

## 5. Technology Stack

- **Primary Technology:** GNU Bash Shell Scripting (Bash 4.0+)
- **Operating System Binaries:** Standard Linux `shadow-utils` (`useradd`, `usermod`, `userdel`, `groupadd`, `gpasswd`, `passwd`, `chage`)
- **System Query Utilities:** `getent`, `id`, `pgrep`, `grep`, `gawk`, `coreutils`
- **Archival Tool:** GNU `tar` with gzip compression
- **Logging Integration:** Linux standard `logger` utility & local secure logfile

---

## 6. Supported Operating Systems & Limitations

### Supported Systems:
- **Ubuntu Linux:** 20.04 LTS, 22.04 LTS, 24.04 LTS
- **Debian GNU/Linux:** 11 (Bullseye), 12 (Bookworm)
- **RHEL & Clones:** Red Hat Enterprise Linux 8/9, Rocky Linux 8/9, AlmaLinux 8/9
- **Docker Containers:** Ubuntu/Debian base images with standard utilities installed
- **Windows / macOS:** Supported via `--dry-run` simulation mode using Git Bash or MSYS2

### Platform Differences & Limitations:
- **UID Thresholds:** Regular human accounts start at UID 1000 on Debian/Ubuntu and modern RHEL, but may start at UID 500 on legacy Unix systems. The script dynamically inspects `/etc/login.defs` to adapt.
- **Local Scope:** The script manages local accounts stored in `/etc/passwd` and `/etc/shadow`. It does not modify remote centralized directories (LDAP, Active Directory) directly.
- **Password Locking:** Password locking via `passwd -l` disables password-based authentication by prepending `!` to the shadow hash. It does not automatically revoke SSH authorized keys or kill existing active sessions.

---

## 7. Prerequisites and Installation

### Prerequisites on Ubuntu / Debian:
Ensure standard system administration packages are present:
```bash
sudo apt-get update
sudo apt-get install -y bash passwd coreutils tar gzip gawk procps
```

### Cloning or Downloading the Repository:
```bash
git clone https://github.com/your-username/linux-user-management.git
cd linux-user-management
```

### Setting Executable Permissions:
```bash
chmod +x user_management.sh tests/*.sh
```

---

## 8. How to Execute the Script

### A. Production Mode (Live System Administration)
Requires administrative privileges:
```bash
sudo ./user_management.sh
```

### B. Safe Demonstration / Dry-Run Mode
Explore all 15 menu features safely without root privileges and without making any host changes:
```bash
./user_management.sh --dry-run
# Or use the short flag:
./user_management.sh -d
```

### C. Display Command-Line Help
```bash
./user_management.sh --help
```

### D. Display Version & College Information
```bash
./user_management.sh --version
```

---

## 9. Interactive Menu Options & Examples

Upon launching, the interactive menu is displayed:

```
  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║       AUTOMATED LINUX USER MANAGEMENT & SECURITY ADMINISTRATION           ║
  ╚═══════════════════════════════════════════════════════════════════════════╝
  Institution : Guru Nanak Dev Engineering College, Ludhiana
  Department  : Department of Information Technology
  Version     : v1.0.0 | Target: Ubuntu/Debian/RHEL | Shell: Bash 4+
  Operator    : sysadmin
  [MODE: PRODUCTION / LIVE SYSTEM ADMINISTRATION]
  ───────────────────────────────────────────────────────────────────────────

ADMINISTRATIVE TASK MENU:
  [1]  Create a new user
  [2]  Create multiple users interactively
  [3]  Modify an existing user's details
  [4]  Create a Linux group
  [5]  Add a user to a supplementary group
  [6]  Remove a user from a supplementary group
  [7]  Lock a user account (passwd -l)
  [8]  Unlock a user account (passwd -u)
  [9]  Configure password expiry (chage)
  [10] Delete a user account safely (with backup)
  [11] Generate a system user report
  [12] Generate a group report
  [13] View recent application audit logs
  [14] Display project information and help
  [15] Exit the application
```

### Example 1: Creating a Single User (Option 1)
```
Enter username to create: dev_student
Enter user full name (GECOS comment field, optional): Dev Student
Enter login shell [/bin/bash]: /bin/bash

Review New User Configuration:
  - Username  : dev_student
  - Full Name : Dev Student
  - Home Dir  : /home/dev_student
  - Shell     : /bin/bash
Confirm creation of account 'dev_student'? (y/N): y
Success: User account 'dev_student' created successfully.
Do you wish to set an initial password for 'dev_student' now via passwd? (y/N): y
[Admin enters password securely through PAM]
Force user to change password at first login? (y/N): y
Configured: User must change password at next login.
```

### Example 2: Safe Deletion with Verified Backup (Option 10)
```
Enter username to delete: temp_user
Select Deletion Strategy:
  1. Delete user account ONLY (Preserve home directory and files)
  2. Backup home directory to secure archive, then delete account and home directory
  3. Abort deletion (Safe return)
Select strategy [1-3]: 2

Initiating Home Directory Backup Stage:
Compressing '/home/temp_user' into '/var/backups/user_mgmt_backups/backup_temp_user_20261010_180000.tar.gz'...
Backup archive created and verified successfully.

═══════════════════════════════════════════════════════════════════════
 [MANDATORY CONFIRMATION - DESTRUCTIVE OPERATION]
═══════════════════════════════════════════════════════════════════════
You are about to permanently remove account: temp_user
Strategy: Remove account AND home directory (Archive created)

To prevent accidental deletion, type exactly: DELETE temp_user
Confirmation: DELETE temp_user

Success: User account 'temp_user' has been permanently removed.
```

---

## 10. Logging and Report Locations

| Artifact | Production Path | Testing / Non-Root Fallback | Purpose & Format |
| :--- | :--- | :--- | :--- |
| **Audit Log** | `/var/log/sys_user_mgmt.log` | `./logs/sys_user_mgmt.log` | Timestamped, permission-protected (`0600`) record of all administrative events. |
| **Syslog Feed** | `/var/log/syslog` / Journal | System syslog | Broadcasts events tagged with `sys_user_mgmt` via Linux `logger`. |
| **User Reports** | `./reports/user_report_*.txt` | `./reports/user_report_*.txt` | Formatted ASCII audit table of all local accounts and UID categories. |
| **Group Reports** | `./reports/group_report_*.txt` | `./reports/group_report_*.txt` | Formatted table of groups, GIDs, and member lists. |
| **User Backups** | `/var/backups/user_mgmt_backups/` | `./backups/` | Compressed `tar.gz` archives of user home directories prior to deletion. |

---

## 11. Backup and Deletion Safeguards

The deletion subsystem incorporates a multi-layer defense-in-depth model:

1. **Protected Account Shielding:** Refuses to delete `root` (UID 0), system daemons (UID < 1000), or the currently logged-in administrator (`$SUDO_USER` / `$USER`).
2. **Active Process Warning:** Uses `pgrep -u` to notify the administrator if the target account has running background jobs.
3. **Integrity-Verified Archival:** Archives home directories using `tar -czpf` and immediately validates archive integrity with `tar -tzf`. **If the archive verification fails, the deletion is immediately aborted.**
4. **Strict Token Confirmation:** The operator must type the exact string `DELETE <username>`. Blank inputs, partial names, or cancellation words abort the process safely.
5. **No Overwrite Policy:** Backups include timestamps (`YYYYMMDD_HHMMSS`) ensuring existing archives are never overwritten.

---

## 12. Dry-Run and Automated Testing Instructions

The repository includes a comprehensive test suite that validates input parsing, flag handling, and integration workflows without touching production systems.

### A. Run Validation Unit Tests (All Platforms)
Tests 26 username, group name, numeric range, and access control edge cases:
```bash
./tests/test_validation.sh
```

### B. Run CLI Flag and Menu Tests
Tests version output, help dialogs, argument rejection, non-root guards, and menu navigation:
```bash
./tests/test_menu.sh
```

### C. Run Full Integration Tests (Disposable Linux VM or Container)
Tests real account creation, group addition, locking, unlocking, password aging, backup creation, and safe deletion:
```bash
sudo ./tests/test_integration.sh
```

### D. Testing via Docker (Zero-Impact Isolation)
Test the entire application inside an isolated Ubuntu 22.04 container:
```bash
# Build test image
docker build -t linux-user-mgmt .

# Launch interactive menu inside container
docker run --rm -it --privileged linux-user-mgmt

# Run automated integration tests inside container
docker run --rm -it --privileged linux-user-mgmt /bin/bash ./tests/test_integration.sh
```

---

## 13. Project Directory Structure

```
linux-user-management/
├── user_management.sh          # Main executable Bash application (v1.0.0)
├── Dockerfile                  # Container environment for isolated Ubuntu testing
├── README.md                   # Comprehensive project documentation
├── LICENSE                     # MIT Open Source License
├── .gitignore                  # Git exclusion rules (logs, archives, reports)
├── docs/
│   ├── project_overview.md     # Academic training synopsis and problem statement
│   ├── architecture.md         # System architecture, module specs, Mermaid diagrams
│   ├── security.md             # Threat model, credential hygiene, PAM & locking details
│   └── presentation_guide.md   # Slide outline, live demo script, 18 viva voce Q&As
├── tests/
│   ├── test_validation.sh      # Automated unit tests for input and account guards
│   ├── test_menu.sh            # Automated tests for CLI flags and menu handling
│   ├── test_integration.sh     # Disposable Linux VM/Docker integration test suite
│   └── test_cases.md           # Complete test verification matrix (20 test cases)
├── reports/
│   └── .gitkeep                # Output directory for generated compliance reports
├── backups/
│   └── .gitkeep                # Secure directory for pre-deletion tar.gz archives
└── logs/
    └── .gitkeep                # Local fallback directory for audit logging
```

---

## 14. Known Limitations

- **Local Scope Only:** Does not synchronize directly with remote directory servers (Active Directory, FreeIPA, OpenLDAP).
- **Password Locking Nuance:** `passwd -l` locks password-based authentication in `/etc/shadow`, but does not revoke existing SSH authorized keys or kill running background sessions (this is documented and highlighted in the application).
- **Interactive Focus:** Designed primarily for interactive administration; bulk onboarding currently accepts inputs interactively rather than via CSV/JSON files.

---

## 15. Future Enhancements

- **Bulk CSV / JSON Onboarding:** Non-interactive batch user provisioning from university or corporate roster files.
- **SSH Key Provisioning:** Automated generation and deployment of SSH public/private key pairs for newly onboarded administrators.
- **Centralized LDAP / AD Integration:** Synchronization with campus Active Directory or OpenLDAP servers.
- **Web Management Dashboard:** A lightweight REST API and web frontend built using Python/Flask or Node.js.
- **Automated Email Notifications:** Dispatching welcome emails to newly onboarded users with initial setup instructions.

---

## 16. References and Bibliography

1. **Shotts, William.** *The Linux Command Line: A Complete Introduction.* No Starch Press, 2019.
2. **Frisch, Æleen.** *Essential System Administration: Tools and Techniques for Linux and Unix Administration.* O'Reilly Media, 3rd Edition.
3. **Nemeth, Evi, et al.** *UNIX and Linux System Administration Handbook.* Addison-Wesley Professional, 5th Edition.
4. **Linux Foundation.** *POSIX.1-2017 / IEEE Std 1003.1 Standard for Information Technology — Portable Operating System Interface (POSIX).*
5. **Debian & Ubuntu Documentation.** *Shadow Password Suite and Login Configuration Manual (`login.defs(5)`, `useradd(8)`, `chage(1)`).*
6. **Center for Internet Security (CIS).** *CIS Ubuntu Linux Benchmark for Enterprise System Hardening.*
7. **Guru Nanak Dev Engineering College, Ludhiana.** *Department of Information Technology Training Guidelines & Curriculum Specifications.*
