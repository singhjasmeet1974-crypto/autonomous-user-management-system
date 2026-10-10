#!/usr/bin/env bash
# ==============================================================================
# Test Suite: Full Linux System Administration Integration Tests
# Project:    Automated Linux User Management Shell Script
# College:    Guru Nanak Dev Engineering College, Ludhiana (Dept of IT)
# Notice:     Run ONLY in a disposable test environment (Ubuntu VM or Docker)
#             DO NOT run directly on production Linux servers!
# ==============================================================================

set -uo pipefail

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

TEST_USER="test_dev_01"
TEST_GROUP="test_grp_01"
BACKUP_DIR="./backups"
PASS_COUNT=0
FAIL_COUNT=0

printf "${CYAN}${BOLD}======================================================================${RESET}\n"
printf "${CYAN}${BOLD}       DISPOSABLE LINUX INTEGRATION TEST SUITE                        ${RESET}\n"
printf "${CYAN}${BOLD}======================================================================${RESET}\n\n"

# Verify environment
if [ "$EUID" -ne 0 ]; then
    printf "${RED}Error: Integration tests require root privileges inside a disposable VM/container.${RESET}\n"
    printf "Please run with: sudo ./tests/test_integration.sh\n"
    exit 1
fi

cleanup() {
    printf "\n${YELLOW}Cleaning up test artifacts...${RESET}\n"
    userdel -r "$TEST_USER" >/dev/null 2>&1 || true
    groupdel "$TEST_GROUP" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Step 1: Create Group
printf "${BOLD}[Step 1] Creating Test Group '${TEST_GROUP}'...${RESET}\n"
if groupadd "$TEST_GROUP"; then
    printf "  [${GREEN}PASS${RESET}] Group '${TEST_GROUP}' created\n"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    printf "  [${RED}FAIL${RESET}] Failed to create group\n"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# Step 2: Create User
printf "${BOLD}[Step 2] Creating Test User '${TEST_USER}' with /bin/bash and home directory...${RESET}\n"
if useradd -m -s "/bin/bash" -c "Integration Test User" "$TEST_USER"; then
    printf "  [${GREEN}PASS${RESET}] User account created\n"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    printf "  [${RED}FAIL${RESET}] useradd failed\n"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# Step 3: Verify User Home Directory
printf "${BOLD}[Step 3] Verifying /home/${TEST_USER} existence...${RESET}\n"
if [ -d "/home/$TEST_USER" ]; then
    printf "  [${GREEN}PASS${RESET}] Home directory exists with correct path\n"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    printf "  [${RED}FAIL${RESET}] Home directory missing\n"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# Step 4: Add User to Group (preserving supplementary groups)
printf "${BOLD}[Step 4] Adding '${TEST_USER}' to supplementary group '${TEST_GROUP}'...${RESET}\n"
if usermod -aG "$TEST_GROUP" "$TEST_USER"; then
    if id -Gn "$TEST_USER" | grep -w -q "$TEST_GROUP"; then
        printf "  [${GREEN}PASS${RESET}] User successfully added to group (id -Gn verified)\n"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        printf "  [${RED}FAIL${RESET}] Group membership not detected in id output\n"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
else
    printf "  [${RED}FAIL${RESET}] usermod -aG failed\n"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# Step 5: Lock User Account
printf "${BOLD}[Step 5] Locking account with passwd -l...${RESET}\n"
if passwd -l "$TEST_USER" >/dev/null 2>&1 || usermod -L "$TEST_USER" 2>/dev/null; then
    printf "  [${GREEN}PASS${RESET}] Account locked successfully\n"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    printf "  [${RED}FAIL${RESET}] Locking command returned non-zero\n"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# Step 6: Unlock User Account
printf "${BOLD}[Step 6] Unlocking account with passwd -u...${RESET}\n"
if passwd -u "$TEST_USER" >/dev/null 2>&1 || usermod -U "$TEST_USER" 2>/dev/null; then
    printf "  [${GREEN}PASS${RESET}] Account unlocked successfully\n"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    printf "  [${RED}FAIL${RESET}] Unlocking command returned non-zero\n"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# Step 7: Configure Password Aging with chage
printf "${BOLD}[Step 7] Setting maximum password age to 60 days via chage -M 60...${RESET}\n"
if chage -M 60 "$TEST_USER" >/dev/null 2>&1; then
    if chage -l "$TEST_USER" | grep -q "60"; then
        printf "  [${GREEN}PASS${RESET}] Password aging updated and verified\n"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        printf "  [${RED}FAIL${RESET}] chage -l did not reflect new max age\n"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
else
    printf "  [${RED}FAIL${RESET}] chage command failed\n"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# Step 8: Safe Deletion with Verified Backup
printf "${BOLD}[Step 8] Testing Safe Deletion workflow (tar backup verification)...${RESET}\n"
mkdir -p "$BACKUP_DIR"
ARCHIVE="${BACKUP_DIR}/test_backup_${TEST_USER}.tar.gz"

# Place a sample file in user's home
echo "Important Student File" > "/home/$TEST_USER/project.txt"

if tar -czpf "$ARCHIVE" -C "/home" "$TEST_USER" >/dev/null 2>&1; then
    if tar -tzf "$ARCHIVE" >/dev/null 2>&1; then
        printf "  [${GREEN}PASS${RESET}] Home directory archive created and verified with tar -tzf\n"
        PASS_COUNT=$((PASS_COUNT + 1))

        # Perform deletion
        if userdel -r "$TEST_USER" >/dev/null 2>&1; then
            if ! id "$TEST_USER" >/dev/null 2>&1; then
                printf "  [${GREEN}PASS${RESET}] User account and home directory removed cleanly\n"
                PASS_COUNT=$((PASS_COUNT + 1))
            else
                printf "  [${RED}FAIL${RESET}] User account still exists after deletion\n"
                FAIL_COUNT=$((FAIL_COUNT + 1))
            fi
        else
            printf "  [${RED}FAIL${RESET}] userdel -r failed\n"
            FAIL_COUNT=$((FAIL_COUNT + 1))
        fi
    else
        printf "  [${RED}FAIL${RESET}] Backup archive corrupted\n"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
    rm -f "$ARCHIVE" 2>/dev/null || true
else
    printf "  [${RED}FAIL${RESET}] Failed to create tar backup\n"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# Summary
printf "\n${CYAN}======================================================================${RESET}\n"
printf "${BOLD}INTEGRATION TEST SUMMARY:${RESET} Total: %d | ${GREEN}Passed: %d${RESET} | ${RED}Failed: %d${RESET}\n" \
    $((PASS_COUNT + FAIL_COUNT)) "$PASS_COUNT" "$FAIL_COUNT"
printf "${CYAN}======================================================================${RESET}\n"

if [ "$FAIL_COUNT" -eq 0 ]; then
    printf "${GREEN}${BOLD}ALL INTEGRATION TESTS PASSED CLEANLY!${RESET}\n"
    exit 0
else
    printf "${RED}${BOLD}INTEGRATION TESTS COMPLETED WITH FAILURES.${RESET}\n"
    exit 1
fi
