#!/usr/bin/env bash
# ==============================================================================
# Test Suite: Menu and CLI Flag Tests
# Project:    Automated Linux User Management Shell Script
# College:    Guru Nanak Dev Engineering College, Ludhiana (Dept of IT)
# ==============================================================================

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

PASS_COUNT=0
FAIL_COUNT=0

GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

SCRIPT="./user_management.sh"

run_test() {
    local desc="$1"
    local expected_code="$2"
    local pattern="$3"
    shift 3
    
    local output
    output="$("$@" 2>&1)"
    local exit_code=$?

    local code_ok=0
    local pattern_ok=0

    if [ "$exit_code" -eq "$expected_code" ]; then
        code_ok=1
    fi

    if [ -z "$pattern" ] || echo "$output" | grep -F -q "$pattern"; then
        pattern_ok=1
    fi

    if [ "$code_ok" -eq 1 ] && [ "$pattern_ok" -eq 1 ]; then
        printf "  [${GREEN}PASS${RESET}] %s (Exit Code: %d)\n" "$desc" "$exit_code"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        printf "  [${RED}FAIL${RESET}] %s (Got Code: %d, Expected: %d)\n" "$desc" "$exit_code" "$expected_code"
        if [ "$pattern_ok" -eq 0 ]; then
            printf "         Missing expected pattern: '%s'\n" "$pattern"
        fi
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
}

printf "${CYAN}${BOLD}======================================================================${RESET}\n"
printf "${CYAN}${BOLD}       RUNNING CLI & MENU AUTOMATION TESTS                           ${RESET}\n"
printf "${CYAN}${BOLD}======================================================================${RESET}\n\n"

# Test 1: Version flag
run_test "CLI flag --version returns code 0 and displays version" \
    0 "Automated Linux User Management Shell Script v" \
    "$SCRIPT" --version

# Test 2: Help flag
run_test "CLI flag --help returns code 0 and displays usage guide" \
    0 "Usage: user_management.sh [OPTIONS]" \
    "$SCRIPT" --help

# Test 3: Short help flag
run_test "CLI flag -h returns code 0 and displays usage guide" \
    0 "Usage: user_management.sh [OPTIONS]" \
    "$SCRIPT" -h

# Test 4: Unknown argument rejection
run_test "Invalid CLI flag exits with error code 1" \
    1 "Unknown option: --invalid-flag" \
    "$SCRIPT" --invalid-flag

# Test 5: Privilege check (when running non-root without --dry-run)
if [ "$EUID" -ne 0 ]; then
    run_test "Non-root execution without --dry-run exits with error code 1 and sudo message" \
        1 "ADMINISTRATIVE PRIVILEGES REQUIRED" \
        "$SCRIPT"
fi

# Test 6: Safe dry-run exit via menu option 15
test_menu_exit() {
    printf "15\n" | "$SCRIPT" --dry-run >/dev/null 2>&1
    return $?
}
if test_menu_exit; then
    printf "  [${GREEN}PASS${RESET}] Dry-run menu option 15 terminates cleanly with exit code 0\n"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    printf "  [${RED}FAIL${RESET}] Dry-run menu option 15 returned non-zero\n"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# Test 7: Verify audit log generation
if [ -f "./logs/sys_user_mgmt.log" ]; then
    printf "  [${GREEN}PASS${RESET}] Audit log file created and populated at ./logs/sys_user_mgmt.log\n"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    printf "  [${RED}FAIL${RESET}] Audit log file was not found\n"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# Test 8: Verify reports directory creation
if [ -d "./reports" ]; then
    printf "  [${GREEN}PASS${RESET}] Reports output directory initialized\n"
    PASS_COUNT=$((PASS_COUNT + 1))
else
    printf "  [${RED}FAIL${RESET}] Reports directory missing\n"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# Summary
printf "\n${CYAN}======================================================================${RESET}\n"
printf "${BOLD}TEST RESULTS SUMMARY:${RESET} Total: %d | ${GREEN}Passed: %d${RESET} | ${RED}Failed: %d${RESET}\n" \
    $((PASS_COUNT + FAIL_COUNT)) "$PASS_COUNT" "$FAIL_COUNT"
printf "${CYAN}======================================================================${RESET}\n"

if [ "$FAIL_COUNT" -eq 0 ]; then
    printf "${GREEN}${BOLD}ALL CLI & MENU TESTS PASSED SUCCESSFULLY!${RESET}\n"
    exit 0
else
    printf "${RED}${BOLD}SOME CLI TESTS FAILED.${RESET}\n"
    exit 1
fi
