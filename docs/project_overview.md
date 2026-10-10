# Project Overview: Automated Linux User Management Shell Script

**Institution:** Guru Nanak Dev Engineering College, Ludhiana  
**Department:** Department of Information Technology  
**Program:** Bachelor of Technology in Information Technology (B.Tech IT)  
**Academic Module:** Four-Week Industrial / Institutional Training Project  
**Project Version:** 1.0.0  
**Target Operating Systems:** Ubuntu Linux, Debian GNU/Linux, Red Hat Enterprise Linux (RHEL), Rocky Linux, AlmaLinux  
**Primary Language:** GNU Bash 4.0+  

---

## 1. Executive Summary

The **Automated Linux User Management Shell Script** is a production-oriented, security-focused command-line utility built to automate routine user account provisioning, role-based group assignments, password lifecycle enforcement, and safe account deprovisioning on enterprise Linux servers. 

Developed as part of the four-week B.Tech Information Technology training curriculum at Guru Nanak Dev Engineering College (GNDEC), Ludhiana, this project demonstrates real-world Linux system administration, defensive shell scripting patterns, POSIX compliance, and enterprise audit logging standards.

---

## 2. Problem Statement

In enterprise and academic multi-user Linux server environments, system administrators repeatedly perform critical account management tasks. When executed manually via scattered ad-hoc command-line utilities (`useradd`, `usermod`, `userdel`, `groupadd`, `gpasswd`, `passwd`, `chage`), several severe operational and security challenges emerge:

1. **Human Error & Inconsistency:** Manual input often results in invalid usernames, forgotten home directory creation, misconfigured default shells, or inconsistent group memberships.
2. **Accidental Account Overwriting & Data Loss:** Running `userdel -r` manually without an automated, verified backup poses catastrophic data-loss risks to university and corporate data.
3. **Privilege Escalation & Accidental Lockout:** Inexperienced administrators might accidentally lock, modify, or delete critical system service accounts (`root`, `daemon`, `systemd`) or their own active administrative session.
4. **Lack of Audit Trails:** Ad-hoc terminal commands often lack tamper-evident, centralized audit records detailing *who* executed *what* action on *which* account and *whether* it succeeded.
5. **Credential Leakage:** Scripts frequently compromise server security by accepting plaintext passwords in command-line arguments or recording passwords in command histories and logs.

---

## 3. Project Objectives

1. **Lifecycle Automation:** Provide an integrated, interactive terminal interface for managing the complete lifecycle of Linux user accounts from onboarding to deprovisioning.
2. **Strict Access Control Enforcement:** Verify superuser (`root` / `sudo`) privileges prior to executing protected system calls, with clear guidance for unprivileged users.
3. **Input Validation & Sanitization:** Prevent command injection and account corruption by validating all usernames, group names, GECOS comments, and numeric aging inputs against POSIX and Linux shadow standards.
4. **Role-Based Group Administration:** Facilitate group creation, addition, and removal while strictly preserving existing supplementary group memberships (`usermod -aG`).
5. **Authentication Security Policies:** Automate password aging enforcement via `chage` and provide explicit clarity between password hash locking (`passwd -l`) and complete account disabling.
6. **Defensive Deletion Safeguards:** Prevent accidental deletion of `root`, system daemons, and the active administrator. Require verified `tar` archive backups before removing user home directories, coupled with mandatory token confirmations (`DELETE <username>`).
7. **Compliance Reporting & Audit Logging:** Maintain timestamped audit records in `/var/log/sys_user_mgmt.log` integrated with the Linux `logger` syslog facility, with zero plaintext credential exposure.
8. **Demonstration Safety:** Provide a built-in `--dry-run` simulation engine allowing faculty evaluation and classroom demonstrations without altering host operating system state.

---

## 4. Technology Stack & Prerequisites

| Component | Specification | Rationale |
| :--- | :--- | :--- |
| **Operating System** | Ubuntu 20.04/22.04 LTS, Debian 11/12, RHEL 8/9 | Standard enterprise server distributions |
| **Shell Engine** | GNU Bash 4.0 or higher | Native associative arrays, regex operators `=~`, parameter transformations |
| **Core Utilities** | `useradd`, `usermod`, `userdel`, `groupadd`, `gpasswd` | Standard Linux `shadow-utils` package |
| **Security Utilities** | `passwd`, `chage`, `getent`, `id`, `logger` | Native PAM authentication and shadow database query tools |
| **Archival Utility** | GNU `tar`, `gzip` | Standard POSIX archival for user home directory preservation |
| **Text Processing** | GNU `grep`, `gawk`, `coreutils` | Reliable parsing of `/etc/passwd`, `/etc/group`, `/etc/login.defs` |

---

## 5. System Specifications & Supported Distributions

### Hardware Requirements:
- **Processor:** 1 GHz single-core x86_64 or ARM64 processor (virtual or physical)
- **RAM:** 512 MB minimum (1 GB recommended)
- **Disk Space:** 50 MB free disk space for script, log files, and home directory backups

### Tested Operating Environments:
- **Ubuntu Server 22.04 LTS / 24.04 LTS** (Direct production execution)
- **Debian GNU/Linux 12 (Bookworm)** (Direct production execution)
- **Red Hat Enterprise Linux 9 / Rocky Linux 9** (Direct production execution)
- **Docker Container (Ubuntu 22.04 base)** (Isolated automated testing)
- **Windows 11 with Git Bash / MSYS2** (Supported via `--dry-run` demonstration mode)
