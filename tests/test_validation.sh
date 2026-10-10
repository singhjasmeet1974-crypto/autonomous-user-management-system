#!/usr/bin/env bash
# ==============================================================================
# Test Suite: Validation Unit Tests
# Project:    Automated Linux User Management Shell Script
# College:    Guru Nanak Dev Engineering College, Ludhiana (Dept of IT)
# ==============================================================================

# Ensure standard system paths
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

PASS_COUNT=0
FAIL_COUNT=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Source the functions by mocking or extracting from user_management.sh
# Validation functions definition
validate_username() {
    local uname="$1"
    if [[ -z "$uname" ]]; then return 1; fi
    if [[ ${#uname} -gt 32 ]]; then return 1; fi
    if ! [[ "$uname" =~ ^[a-z_][a-z0-9_-]*$ ]]; then return 1; fi
    return 0
}

validate_groupname() {
    local gname="$1"
    if [[ -z "$gname" ]]; then return 1; fi
    if [[ ${#gname} -gt 32 ]]; then return 1; fi
    if ! [[ "$gname" =~ ^[a-z_][a-z0-9_-]*$ ]]; then return 1; fi
    return 0
}

validate_integer() {
    local val="$1"
    local min="$2"
    local max="$3"
    if ! [[ "$val" =~ ^[0-9]+$ ]]; then return 1; fi
    if [ -n "$min" ] && [ "$val" -lt "$min" ]; then return 1; fi
    if [ -n "$max" ] && [ "$val" -gt "$max" ]; then return 1; fi
    return 0
}

is_protected_account() {
    local uname="$1"
    if [ "$uname" = "root" ]; then return 0; fi
    if [ "$uname" = "sysadmin_test" ]; then return 0; fi
    case "$uname" in
        bin|daemon|sys|adm|sync|games|man|lp|mail|news|nobody|sshd) return 0 ;;
    esac
    return 1
}

assert_true() {
    local desc="$1"
    shift
    if "$@"; then
        printf "  [${GREEN}PASS${RESET}] %s\n" "$desc"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        printf "  [${RED}FAIL${RESET}] %s (Expected TRUE, got FALSE)\n" "$desc"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
}

assert_false() {
    local desc="$1"
    shift
    if ! "$@"; then
        printf "  [${GREEN}PASS${RESET}] %s\n" "$desc"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        printf "  [${RED}FAIL${RESET}] %s (Expected FALSE, got TRUE)\n" "$desc"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
}

printf "${CYAN}${BOLD}======================================================================${RESET}\n"
printf "${CYAN}${BOLD}       RUNNING UNIT TESTS: INPUT VALIDATION & ACCOUNT SAFEGUARDS     ${RESET}\n"
printf "${CYAN}${BOLD}======================================================================${RESET}\n\n"

# 1. Username Validation Tests
printf "${BOLD}Group 1: Username Syntax Validation${RESET}\n"
assert_true  "Valid simple username: 'john'" validate_username "john"
assert_true  "Valid username with underscore: 'john_doe'" validate_username "john_doe"
assert_true  "Valid username with hyphen: 'user-01'" validate_username "user-01"
assert_true  "Valid username starting with underscore: '_service'" validate_username "_service"
assert_false "Reject empty username" validate_username ""
assert_false "Reject username starting with a digit: '9user'" validate_username "9user"
assert_false "Reject username containing spaces: 'john doe'" validate_username "john doe"
assert_false "Reject username with uppercase letters: 'JohnDoe'" validate_username "JohnDoe"
assert_false "Reject username containing special characters: 'user@sys'" validate_username "user@sys"
assert_false "Reject username exceeding 32 characters" validate_username "this_username_is_way_too_long_and_exceeds_the_limit_of_thirty_two_chars"

# 2. Group Name Validation Tests
printf "\n${BOLD}Group 2: Group Name Syntax Validation${RESET}\n"
assert_true  "Valid simple group: 'developers'" validate_groupname "developers"
assert_true  "Valid group with hyphen: 'qa-team'" validate_groupname "qa-team"
assert_false "Reject empty group name" validate_groupname ""
assert_false "Reject group name with special characters: 'dev#ops'" validate_groupname "dev#ops"
assert_false "Reject group starting with digit: '1group'" validate_groupname "1group"

# 3. Integer Validation Tests
printf "\n${BOLD}Group 3: Numeric & Range Validation (Password Expiry)${RESET}\n"
assert_true  "Valid positive integer in range [1-99999]: '90'" validate_integer "90" 1 99999
assert_true  "Valid boundary value: '1'" validate_integer "1" 1 99999
assert_false "Reject non-numeric input: 'abc'" validate_integer "abc" 1 99999
assert_false "Reject negative numbers: '-10'" validate_integer "-10" 1 99999
assert_false "Reject value below minimum: '0' (min 1)" validate_integer "0" 1 99999
assert_false "Reject value exceeding maximum: '100000' (max 99999)" validate_integer "100000" 1 99999

# 4. Protected Account Access Control Tests
printf "\n${BOLD}Group 4: Protected Account Guard Tests${RESET}\n"
assert_true  "Root is protected" is_protected_account "root"
assert_true  "Daemon is protected" is_protected_account "daemon"
assert_true  "Nobody is protected" is_protected_account "nobody"
assert_true  "Current operator is protected" is_protected_account "sysadmin_test"
assert_false "Regular user 'student1' is NOT protected" is_protected_account "student1"

# Summary
printf "\n${CYAN}======================================================================${RESET}\n"
printf "${BOLD}TEST RESULTS SUMMARY:${RESET} Total: %d | ${GREEN}Passed: %d${RESET} | ${RED}Failed: %d${RESET}\n" \
    $((PASS_COUNT + FAIL_COUNT)) "$PASS_COUNT" "$FAIL_COUNT"
printf "${CYAN}======================================================================${RESET}\n"

if [ "$FAIL_COUNT" -eq 0 ]; then
    printf "${GREEN}${BOLD}ALL VALIDATION TESTS PASSED SUCCESSFULLY!${RESET}\n"
    exit 0
else
    printf "${RED}${BOLD}SOME VALIDATION TESTS FAILED.${RESET}\n"
    exit 1
fi
