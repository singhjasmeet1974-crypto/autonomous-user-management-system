# Automated Linux User Management Shell Script — Test Cases & Verification Matrix

**Project:** Automated Linux User Management Shell Script  
**Institution:** Guru Nanak Dev Engineering College, Ludhiana  
**Department:** Information Technology  
**Academic Level:** B.Tech IT — 4-Week Training Project  
**Author / Operator:** IT System Administration Trainee  

---

## 1. Test Environment Overview

| Environment Attribute | Local Development Environment | Live Linux Target Environment |
| :--- | :--- | :--- |
| **Operating System** | Windows 11 with GNU Bash 5.2 (MSYS/Git Bash) | Ubuntu 22.04 LTS / Debian 12 / RHEL 9 |
| **Shell Version** | GNU Bash 5.2.37(1)-release | GNU Bash 5.1+ / 5.2+ |
| **Administrative Status**| Non-root user (Standard shell) | Root / Sudo Superuser (`EUID == 0`) |
| **System Binaries** | Simulation & Dry-Run Engine | Native `shadow-utils`, `tar`, `chage`, `passwd` |

---

## 2. Test Execution Matrix

| Test ID | Test Category | Objective | Preconditions & Inputs | Command / Execution | Expected Result | Actual Result & Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Privilege Enforcement | Block non-root execution when run in production mode | Non-root operator (`EUID != 0`), No `--dry-run` flag | `./user_management.sh` | Exit code 1; display red banner explaining administrative requirement and `sudo` command | **PASS** (Exited code 1; printed exact `sudo` guidance) |
| **TC-02** | Flag Handling | Display version information and academic credit | Non-root, `-v` or `--version` flag | `./user_management.sh --version` | Exit code 0; display software version and college credentials | **PASS** (Exited code 0; displayed v1.0.0 GNDEC IT) |
| **TC-03** | Flag Handling | Display interactive command-line help dialog | Non-root, `-h` or `--help` flag | `./user_management.sh --help` | Exit code 0; display flag parameters and usage | **PASS** (Exited code 0; displayed flags list) |
| **TC-04** | Flag Handling | Safely reject unrecognised command arguments | Any unknown argument | `./user_management.sh --invalid-flag` | Exit code 1; display error `Unknown option` | **PASS** (Exited code 1; rejected flag cleanly) |
| **TC-05** | Demonstration Engine | Enable non-root dry-run simulation mode | Non-root with `--dry-run` flag | `./user_management.sh --dry-run` | Allow non-root entry; display yellow simulation banner; log `[DRY_RUN]` events | **PASS** (Allowed entry; verified no host modification) |
| **TC-06** | Menu Navigation | Validate empty and non-numeric menu input | Menu prompt: `Enter your choice: ""` | Input: `""` then `invalid_choice` | Reject input gracefully; prompt valid selection from 1 to 15; remain in menu loop | **PASS** (No crash; looped back to menu cleanly) |
| **TC-07** | Menu Navigation | Clean exit from application | Menu prompt: `15` | Input: `15` | Display logout message; log `SESSION_END`; terminate with exit code 0 | **PASS** (Exited cleanly with code 0) |
| **TC-08** | Input Validation | Validate standard POSIX usernames | Various inputs: `john`, `user_01`, `user-01` | Unit test suite | Functions return true for valid naming conventions | **PASS** (All 4 valid syntax test cases passed) |
| **TC-09** | Input Validation | Reject malformed and illegal usernames | Inputs: `""`, `9user`, `user name`, `u@sys`, 33+ char string | Unit test suite | Functions return false and display specific error descriptions | **PASS** (All 6 invalid syntax test cases blocked) |
| **TC-10** | Input Validation | Validate Linux group names | Inputs: `developers`, `qa-team`, `dev#ops` | Unit test suite | Reject illegal symbols and leading digits; accept valid identifiers | **PASS** (All 5 group validation cases passed) |
| **TC-11** | Input Validation | Validate password expiry numeric parameters | Inputs: `90`, `0`, `-10`, `abc`, `100000` | Unit test suite | Validate integers within range `[1-99999]`; reject non-numeric inputs | **PASS** (All 6 integer validation cases passed) |
| **TC-12** | Access Control | Refuse deletion of root account | Target user: `root` | Menu Option 10: input `root` | Script halts with `[CRITICAL ACCESS CONTROL BLOCK]`; audit logged as `BLOCKED` | **PASS** (Refused with security error; logged in audit) |
| **TC-13** | Access Control | Refuse deletion of current executing operator | Target user: `${OPERATOR}` | Menu Option 10: input `$OPERATOR` | Prevent self-deprovisioning lockout; abort safely | **PASS** (Detected active operator; blocked safely) |
| **TC-14** | Access Control | Protect system daemons from deletion | Target users: `daemon`, `nobody`, `bin` | Menu Option 10: input `daemon` | Identify system account threshold (UID < UID_MIN); abort deletion | **PASS** (System accounts blocked) |
| **TC-15** | Deletion Safeguard | Enforce exact confirmation phrase token | Option 10: Target `testuser`, input `WRONG` | Confirmation prompt: `WRONG_PHRASE` | Abort deletion; display confirmation mismatch notice; log `CANCELLED` | **PASS** (Exact token check aborted deletion) |
| **TC-16** | Deletion Safeguard | Successful deletion with verified backup | Option 10: Strategy 2, token `DELETE testuser` | Full confirmation string provided | Generate unique tarball; test with `tar -tzf`; execute `userdel -r` | **PASS** (Simulated & verified; Live tested on Ubuntu) |
| **TC-17** | Password Expiry | Configure maximum password lifetime | Menu Option 9: Sub-option 1 (`chage -M`) | Input: `90` days | Verify integer; invoke `chage -M 90`; verify `chage -l`; log event | **PASS** (Simulated & verified; Live tested on Ubuntu) |
| **TC-18** | Account Locking | Distinguish password locking from total disable | Menu Option 7: `passwd -l` | Target: `testuser` | Display educational security notice; lock shadow hash; check `passwd -S` | **PASS** (Printed security distinction; verified) |
| **TC-19** | Audit Logging | Centralized audit log creation without secrets | Multiple administrative actions executed | Check `./logs/sys_user_mgmt.log` | Formatted entries with Timestamp, Operator, Action, Target, Status, Details; NO PASSWORDS | **PASS** (Log verified; 0 plaintext credentials found) |
| **TC-20** | Report Generation | User & Group compliance reports | Menu Options 11 and 12 | Select `Y` to save report | Formatted ASCII tables with summary statistics written to `./reports/*.txt` | **PASS** (Both reports generated and saved to disk) |

---

## 3. Automated Test Execution Commands

### A. Run Validation Unit Tests (Runs in all environments)
```bash
./tests/test_validation.sh
# Expected Output: Total: 26 | Passed: 26 | Failed: 0
```

### B. Run Menu & CLI Flag Automation Tests
```bash
./tests/test_menu.sh
# Expected Output: Total: 8 | Passed: 8 | Failed: 0
```

### C. Run Full Integration Tests (Disposable Linux VM / Container)
```bash
sudo ./tests/test_integration.sh
# Expected Output: Total: 8 | Passed: 8 | Failed: 0
```

### D. Run via Docker Container
```bash
docker build -t linux-user-mgmt .
docker run --rm -it --privileged linux-user-mgmt /bin/bash ./tests/test_integration.sh
```
