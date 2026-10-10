# College Presentation & Viva Voce Preparation Guide

**Institution:** Guru Nanak Dev Engineering College, Ludhiana  
**Department:** Department of Information Technology  
**Course:** Bachelor of Technology (Information Technology)  
**Academic Module:** 4-Week Institutional / Industrial Training Seminar  
**Project Title:** Automated Linux User Management Shell Script  

---

## 1. Presentation Structure (Slide-by-Slide Outline)

| Slide # | Slide Title | Core Talking Points for Student |
| :---: | :--- | :--- |
| **1** | Title & Credentials | - Project Title: Automated Linux User Management Shell Script<br>- Student Name, University Roll Number<br>- Department of Information Technology, Guru Nanak Dev Engineering College, Ludhiana<br>- Mentor / Faculty Supervisor acknowledgment |
| **2** | Introduction & Problem Statement | - The challenge of managing multi-user Linux enterprise and academic servers.<br>- Manual administration via fragmented CLI commands leads to syntax mistakes, configuration drift, and accidental data loss.<br>- Lack of automated backup and centralized audit trails in traditional workflows. |
| **3** | Project Objectives | - Automate user and group lifecycle in a centralized, menu-driven CLI.<br>- Prevent accidental deletion of root, system daemons, and active operators.<br>- Enforce verified GNU tar backups before account removal.<br>- Comply with password aging policies and zero-credential-leakage standards. |
| **4** | System Architecture | - Explain the modular architecture (Pre-Flight -> Input Validation -> Core Ops -> Audit Logger).<br>- Explain interaction with Linux configuration databases: `/etc/passwd`, `/etc/shadow`, `/etc/group`, `/etc/login.defs`. |
| **5** | Core Features & Implementation | - Single & interactive batch user provisioning with POSIX regex validation.<br>- Supplementary group management preserving existing memberships (`usermod -aG`).<br>- Account locking (`passwd -l`) vs. total account deactivation.<br>- Password aging policies via `chage`. |
| **6** | Defensive Security Engineering | - Privilege pre-flight check (`EUID == 0`).<br>- Anti-lockout guard protecting root and executing administrator.<br>- Strict token confirmation (`DELETE <username>`).<br>- Zero plain-text credentials in logs or command arguments. |
| **7** | Demonstration & Simulation Mode | - Explain `--dry-run` flag: allows academic demonstrations and non-root exploration without modifying host server configuration.<br>- Simulation engine outputs commands and logs `[DRY_RUN]` records safely. |
| **8** | Testing & Verification Results | - Unit testing: 26 validation tests passed.<br>- Menu automation: 8 CLI flag and navigation tests passed.<br>- Integration testing: Full Linux lifecycle tests verified on disposable Ubuntu environment. |
| **9** | Limitations & Future Scope | - Current scope: Local user accounts on standalone Linux hosts.<br>- Future enhancements: LDAP / Active Directory integration, CSV/JSON bulk onboarding, SSH public key provisioning, and web admin portal. |
| **10** | Conclusion | - Summary of learning outcomes: Bash functions, POSIX compliance, Linux security internals, and audit logging.<br>- Open the floor for Faculty Questions & Live Demonstration. |

---

## 2. Step-by-Step Live Demonstration Script

Follow this 10-step sequence during your presentation:

1. **Step 1: Project Structure Overview**
   Show the clean repository layout:
   ```bash
   ls -la
   # Highlight user_management.sh, docs/, tests/, reports/, backups/, logs/
   ```

2. **Step 2: Demonstrate Superuser Privilege Guard**
   Attempt to run without root or `sudo`:
   ```bash
   ./user_management.sh
   # Show that it halts with exit code 1 and outputs the red banner explaining sudo and --dry-run
   ```

3. **Step 3: Launch in Demonstration Mode**
   Launch safely without altering host systems:
   ```bash
   ./user_management.sh --dry-run
   # Point out the yellow [MODE: DRY-RUN / DEMONSTRATION ACTIVE] banner
   ```

4. **Step 4: Demonstrate Input Validation**
   - Select `1` (Create new user).
   - Enter invalid inputs: `9invalid`, `john doe`, `user@name`.
   - Show how the regex validation rejects each error and explains POSIX rules.
   - Enter a valid username `dev_student` and review the simulated creation command.

5. **Step 5: Demonstrate Batch User Creation**
   - Select `2` (Batch user creation).
   - Enter `user1`, `user2`, and `user1` (duplicate).
   - Show duplicate detection and the final summary table of simulated accounts.

6. **Step 6: Demonstrate Role-Based Group Administration**
   - Select `4` to simulate creating group `developers`.
   - Select `5` to add `dev_student` to `developers` (explain `usermod -aG` preserving existing groups).
   - Select `6` to show safe group removal via `gpasswd -d`.

7. **Step 7: Demonstrate Account Locking & Security Education**
   - Select `7` (Lock user account).
   - Highlight the on-screen architectural note explaining `passwd -l` vs SSH keys/active processes.

8. **Step 8: Demonstrate Defensive Deletion Safeguards**
   - Select `10` (Delete user account safely).
   - Enter `root` or your active username: show the **Critical Access Control Block**.
   - Enter `temp_user` and choose Strategy 2 (Backup & Delete).
   - Type an incorrect confirmation phrase: show the safe cancellation.
   - Retype the exact phrase `DELETE temp_user` to demonstrate verified backup and safe deletion.

9. **Step 9: Generate System Compliance Reports**
   - Select `11` to view and save the formatted system user report.
   - Select `12` to generate the group audit report.

10. **Step 10: Inspect Audit Records & Exit**
    - Select `13` to view recent entries in the audit log.
    - Highlight that each operation was recorded with timestamp, operator, and status, with zero plaintext credentials.
    - Select `15` to exit cleanly.

---

## 3. Important Linux Commands & Their Architectural Purpose

| Command & Flags | System File Affected | Architectural Purpose in Project |
| :--- | :--- | :--- |
| `useradd -m -s <sh> -c <name> <user>` | `/etc/passwd`, `/etc/shadow` | Creates user record, default shell, GECOS comment, and creates `/home/<user>` from `/etc/skel`. |
| `usermod -c "<name>" <user>` | `/etc/passwd` | Updates the 5th field (GECOS comment/full name) of the target account. |
| `usermod -s <sh> <user>` | `/etc/passwd` | Updates the login shell after verifying existence in `/etc/shells`. |
| `usermod -aG <group> <user>` | `/etc/group` | Appends user to supplementary group without overwriting existing memberships (`-a` append, `-G` supplementary). |
| `groupadd <group>` | `/etc/group` | Allocates a new GID and appends group record to `/etc/group`. |
| `gpasswd -d <user> <group>` | `/etc/group` | Removes target user from specified group without corrupting other memberships. |
| `passwd -l <user>` | `/etc/shadow` | Prepends exclamation mark (`!`) to encrypted password hash, disabling password login. |
| `passwd -u <user>` | `/etc/shadow` | Removes the `!` prefix, restoring password-based authentication. |
| `chage -M <days> <user>` | `/etc/shadow` | Sets maximum password lifespan before rotation is required. |
| `chage -d 0 <user>` | `/etc/shadow` | Sets last password change date to 0 (Jan 1, 1970), forcing password reset on next login. |
| `tar -czpf <arch> -C <dir> <file>` | Filesystem | Compresses directory into gzip archive while preserving file permissions (`-p`). |
| `tar -tzf <arch>` | Memory / Archive | Tests archive readability and integrity without extracting files. |
| `getent passwd <user>` | Name Service Switch (`nsswitch.conf`) | Queries user database across `/etc/passwd`, NIS, LDAP, or SSSD. |
| `logger -t sys_user_mgmt <msg>` | `/var/log/syslog` / `journald` | Dispatches structured log entries to system logging daemon. |

---

## 4. Top 18 Viva Voce Questions & Comprehensive Answers

### Q1: What is the primary purpose of this project?
**Answer:** The project automates multi-user Linux administration (user onboarding, group assignment, password aging, and safe deprovisioning) via a secure, modular Bash script. It eliminates manual errors, prevents accidental root lockout, enforces verified backups before deletion, and records tamper-evident audit logs.

### Q2: Why is `usermod -aG` preferred over `usermod -G` when adding a user to a supplementary group?
**Answer:** The `-G` flag sets the user's supplementary group list to *only* the groups listed. If the `-a` (append) flag is omitted, all existing supplementary group memberships are permanently erased! Using `-aG` safely appends the new group while preserving all previous memberships.

### Q3: What happens behind the scenes when an account is locked using `passwd -l`?
**Answer:** `passwd -l` modifies the second field of the user's record in `/etc/shadow` by prepending an exclamation mark (`!`) to the encrypted password hash. This makes password matching mathematically impossible. However, it does not revoke SSH public keys, terminate active sessions, or stop cron jobs.

### Q4: How does your script prevent accidental deletion of critical accounts?
**Answer:** It implements an explicit security guard function (`is_protected_account`) that checks the target against UID 0 (`root`), system daemons (UID < `UID_MIN` from `/etc/login.defs`), and the executing administrator (`$OPERATOR` / `$SUDO_USER`). Furthermore, deletion requires typing an exact confirmation phrase (`DELETE <username>`).

### Q5: How does the script handle new user passwords securely?
**Answer:** It adheres to zero-trust credential hygiene: it never accepts passwords via command-line arguments, never uses shared default passwords, and never writes passwords to logs. Instead, it delegates password setting directly to the interactive PAM `passwd` binary and allows the admin to enforce a password reset on first login via `chage -d 0`.

### Q6: Why do you check `/etc/login.defs` in your script?
**Answer:** `/etc/login.defs` defines distribution-specific configuration values such as `UID_MIN` and `UID_MAX`. On Ubuntu and Debian, regular user accounts begin at UID 1000, whereas on older RHEL systems they began at 500. Reading `UID_MIN` dynamically ensures our script accurately distinguishes human accounts from system daemons across different Linux distributions.

### Q7: What is the role of `tar -tzf` before account deletion?
**Answer:** When the administrator chooses to back up a user's home directory before deletion, `tar -czpf` creates a compressed archive. `tar -tzf` tests the archive's internal table of contents to verify that it is uncorrupted and readable. If this test fails, the script immediately aborts deletion to prevent catastrophic data loss.

### Q8: What is the difference between `/etc/passwd` and `/etc/shadow`?
**Answer:** `/etc/passwd` is world-readable (`0644`) and contains user metadata (username, UID, primary GID, GECOS, home directory, login shell). In contrast, `/etc/shadow` contains cryptographic password hashes and aging parameters (expiry, inactive period, last change date) and is readable only by `root` and the `shadow` group (`0640` or `0600`) to prevent offline dictionary/brute-force attacks.

### Q9: Why did you use `getent` instead of directly reading `/etc/passwd`?
**Answer:** In modern enterprise environments, user accounts may not reside solely in local flat files like `/etc/passwd`; they may be managed via network directory services like LDAP, FreeIPA, or Active Directory via SSSD. `getent` queries the Name Service Switch (`/etc/nsswitch.conf`), returning user and group data regardless of whether the source is local or networked.

### Q10: How does your dry-run mode work and why is it valuable?
**Answer:** Invoking the script with `--dry-run` or `-d` activates simulation mode. It bypasses the root privilege requirement, simulates commands (e.g. printing `[SIMULATION] useradd ...`), logs operations with status `[DRY_RUN]`, and makes zero modifications to system files. This enables risk-free evaluation and demonstrations on any student or faculty machine.

### Q11: What regex pattern did you use to validate usernames, and why?
**Answer:** We used `^[a-z_][a-z0-9_-]*$` with a 32-character length limit. This adheres to POSIX and Linux standards: usernames must start with a lowercase letter or underscore (preventing confusion with numeric UIDs in command arguments), contain only lowercase alphanumeric characters, underscores, or hyphens, and contain no whitespace or special characters that could trigger shell injection.

### Q12: How are audit logs stored and protected?
**Answer:** Logs are written to `/var/log/sys_user_mgmt.log` (or `./logs/sys_user_mgmt.log` during test runs) with restricted permissions (`0600`). Every entry records the timestamp, operator identity (`$SUDO_USER`), action name, target entity, status, and concise details. Additionally, entries are dispatched to syslog via the `logger` utility.

### Q13: What does the GECOS field represent in Linux?
**Answer:** GECOS (General Electric Comprehensive Operating Supervisor) is the fifth field in `/etc/passwd`. Historically used to identify printer destinations in early Unix, today it holds descriptive metadata about the user, such as their full name, room number, telephone number, or department.

### Q14: Why did you strip colons (`:`) from the full name / GECOS field in your script?
**Answer:** In `/etc/passwd`, fields are separated by colons (`:`). If an administrator enters a name containing a colon (e.g. `John:Doe`), it would introduce an extra delimiter, misaligning the home directory and login shell fields and potentially corrupting the account database. Sanitizing colons prevents this.

### Q15: What is the purpose of `chage -d 0`?
**Answer:** The `chage -d 0 <username>` command sets the password's "last change date" to Epoch day 0 (January 1, 1970). When the operating system checks PAM authentication during the user's next login, it sees the password as expired and forces the user to choose a new password before granting shell access.

### Q16: How does your script determine the identity of the administrator running the script under sudo?
**Answer:** When a user executes a script with `sudo`, `$USER` becomes `root`. To identify the actual human operator, the script inspects the `$SUDO_USER` environment variable populated by the `sudo` subsystem. If `$SUDO_USER` is empty, it falls back to `$USER`.

### Q17: What shell version is required and how does the script verify it?
**Answer:** The script requires GNU Bash 4.0 or higher because it relies on modern features such as native regular expression matching (`=~`), parameter transformations (`${var,,}`), and built-in `printf -v`. On startup, it checks `${BASH_VERSINFO[0]}` and safely exits with an error message if an older shell is detected.

### Q18: What is the difference between a primary group and a supplementary group?
**Answer:** A primary group is assigned to a user upon creation and determines the GID assigned to files newly created by that user (stored in the 4th field of `/etc/passwd`). Supplementary (or secondary) groups provide additional role-based permissions (e.g. `sudo`, `docker`, `developers`) defined in `/etc/group`. A user can belong to only one primary group, but multiple supplementary groups.
