// ==============================================================================
// Application Logic: Automated Linux User Management System (Web Showcase)
// Institution: Guru Nanak Dev Engineering College, Ludhiana (Dept of IT)
// ==============================================================================

// --- Virtual Linux Server State ---
const virtualState = {
  users: [
    { username: 'root', uid: 0, gid: 0, name: 'System Administrator', home: '/root', shell: '/bin/bash', status: 'system' },
    { username: 'daemon', uid: 1, gid: 1, name: 'System Daemon', home: '/usr/sbin', shell: '/usr/sbin/nologin', status: 'system' },
    { username: 'sysadmin', uid: 1000, gid: 1000, name: 'Jasmeet Singh (Lead Operator)', home: '/home/sysadmin', shell: '/bin/bash', status: 'active' }
  ],
  groups: [
    { name: 'root', gid: 0, members: ['root'] },
    { name: 'sudo', gid: 27, members: ['sysadmin'] },
    { name: 'developers', gid: 1001, members: ['sysadmin'] },
    { name: 'sysadmin', gid: 1000, members: ['sysadmin'] }
  ],
  logs: [
    {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operator: 'sysadmin',
      action: 'SESSION_START',
      target: 'system',
      status: 'SUCCESS',
      details: 'Interactive terminal session initiated (Vercel cloud mode)'
    }
  ],
  backups: []
};

// Viva Voce Database
const vivaQuestions = [
  {
    q: "Why is 'usermod -aG' preferred over 'usermod -G' when adding a user to a supplementary group?",
    a: "The '-G' option sets the user's supplementary group list to only the groups listed. If the '-a' (append) flag is omitted, all existing supplementary group memberships are permanently erased! Using '-aG' safely appends the new group while preserving all previous memberships."
  },
  {
    q: "What happens behind the scenes when an account is locked using 'passwd -l'?",
    a: "The command prepends an exclamation mark ('!') to the encrypted password hash in /etc/shadow. This invalidates password authentication. However, it does NOT revoke SSH public keys, terminate active sessions, or stop cron jobs."
  },
  {
    q: "How does the script prevent accidental deletion of critical system accounts?",
    a: "It enforces an explicit security guard function (is_protected_account) that checks if the target is UID 0 (root), a system daemon (UID < UID_MIN from /etc/login.defs), or the active operator. Furthermore, deletion requires typing an exact confirmation phrase: DELETE <username>."
  },
  {
    q: "How does the script handle new user passwords securely?",
    a: "It adheres to zero-trust credential hygiene: it never accepts passwords via command-line arguments, never uses shared default passwords, and never writes passwords to logs. It delegates setting to PAM passwd and supports forcing a password change on first login via chage -d 0."
  },
  {
    q: "Why do you check /etc/login.defs in your script?",
    a: "/etc/login.defs defines distribution-specific configuration values such as UID_MIN and UID_MAX. On Ubuntu and Debian, regular user accounts begin at UID 1000. Inspecting UID_MIN dynamically ensures the script accurately distinguishes human accounts from system daemons across different Linux distributions."
  },
  {
    q: "What is the role of 'tar -tzf' before account deletion?",
    a: "When backing up a user's home directory prior to deletion, tar -tzf tests the archive's internal table of contents to verify it is uncorrupted and readable before userdel is called. If the test fails, deletion is immediately aborted."
  },
  {
    q: "What is the difference between /etc/passwd and /etc/shadow?",
    a: "/etc/passwd is world-readable (0644) and contains user metadata (username, UID, GID, GECOS, home directory, login shell). In contrast, /etc/shadow contains cryptographic password hashes and aging parameters and is readable only by root (0600/0640) to prevent offline dictionary attacks."
  },
  {
    q: "Why did you use 'getent' instead of directly reading /etc/passwd?",
    a: "In enterprise environments, accounts often reside in network directory services like LDAP or Active Directory via SSSD. getent queries the Name Service Switch (nsswitch.conf), returning user and group records regardless of whether the source is local or networked."
  },
  {
    q: "What regex pattern is used to validate usernames, and why?",
    a: "^[a-z_][a-z0-9_-]*$ with a 32-character limit. Usernames must start with a letter or underscore (preventing confusion with numeric UIDs in command arguments), contain only lowercase alphanumeric characters, underscores, or hyphens, and contain no whitespace or special characters."
  },
  {
    q: "What is the purpose of 'chage -d 0'?",
    a: "It sets the password's last change date to Epoch day 0 (Jan 1, 1970). When the operating system checks PAM authentication during the user's next login, it sees the password as expired and forces the user to choose a new password before granting shell access."
  },
  {
    q: "Why did you strip colons (':') from the GECOS comment field?",
    a: "In /etc/passwd, fields are colon-separated. If an administrator enters a name containing a colon, it would introduce an extra delimiter, misaligning the home directory and login shell fields and corrupting the account database."
  },
  {
    q: "How are audit logs stored and protected?",
    a: "Logs are written to /var/log/sys_user_mgmt.log with restricted permissions (0600). Each entry records the timestamp, operator identity ($SUDO_USER), action, target, status, and details. Entries are also dispatched to syslog via the logger utility."
  }
];

// Current interactive prompt state machine
let interactivePrompt = null;

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderSystemState();
  renderVivaVoce();
  initTerminal();
});

// --- Tab Switching ---
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = `tab-${tab.getAttribute('data-tab')}`;
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

// --- Terminal Simulator ---
function getBannerText() {
  return `
  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║       AUTOMATED LINUX USER MANAGEMENT & SECURITY ADMINISTRATION           ║
  ╚═══════════════════════════════════════════════════════════════════════════╝
  Institution : Guru Nanak Dev Engineering College, Ludhiana
  Department  : Department of Information Technology
  Version     : v1.0.0 | Target: Ubuntu/Debian/RHEL | Shell: Bash 5.2
  Operator    : sysadmin (Jasmeet Singh)
  [MODE: BROWSER CLOUD SIMULATOR ACTIVE - SAFE VERCEL DEPLOYMENT]
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
`;
}

function initTerminal() {
  const termBody = document.getElementById('terminal-output');
  termBody.innerHTML = `<span class="term-banner">${escapeHtml(getBannerText())}</span>\n<span class="term-cyan">Type an option number (1-15) or click any Quick Action button above to test.</span>\n\n`;
}

function resetTerminal() {
  interactivePrompt = null;
  initTerminal();
}

function termPrint(text, cssClass = '') {
  const termBody = document.getElementById('terminal-output');
  const span = document.createElement('span');
  if (cssClass) span.className = cssClass;
  span.textContent = text + '\n';
  termBody.appendChild(span);
  termBody.scrollTop = termBody.scrollHeight;
}

function sendQuickOption(choice) {
  // If in active prompt, cancel it first
  interactivePrompt = null;
  processCommand(choice);
}

function handleCommandSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('terminal-input');
  const val = input.value.trim();
  input.value = '';
  if (!val && !interactivePrompt) return;

  termPrint(`sysadmin@gndec-server:~$ ${val}`, 'term-bold');

  if (interactivePrompt) {
    interactivePrompt.handler(val);
  } else {
    processCommand(val);
  }
}

function logAuditEvent(action, target, status, details) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const entry = {
    timestamp: now,
    operator: 'sysadmin',
    action,
    target,
    status,
    details
  };
  virtualState.logs.unshift(entry);
  renderSystemState();
}

function processCommand(choice) {
  switch (choice) {
    case '1':
      startCreateUser();
      break;
    case '2':
      startBatchUsers();
      break;
    case '3':
      startModifyUser();
      break;
    case '4':
      startCreateGroup();
      break;
    case '5':
      startAddToGroup();
      break;
    case '6':
      startRemoveFromGroup();
      break;
    case '7':
      startLockUser();
      break;
    case '8':
      startUnlockUser();
      break;
    case '9':
      startPasswordExpiry();
      break;
    case '10':
      startDeleteUser();
      break;
    case '11':
      generateUserReport();
      break;
    case '12':
      generateGroupReport();
      break;
    case '13':
      viewAuditLogs();
      break;
    case '14':
      displayProjectInfo();
      break;
    case '15':
      termPrint("\nEnding administrative session. Recording audit event...", 'term-cyan');
      logAuditEvent('SESSION_END', 'sysadmin', 'SUCCESS', 'Administrator logged out cleanly');
      termPrint("Thank you for using the Automated Linux User Management System.", 'term-green');
      termPrint("Guru Nanak Dev Engineering College, Ludhiana — Department of IT\n", 'term-dim');
      break;
    default:
      termPrint(`Invalid selection '${choice}'. Please enter a valid number from 1 to 15.`, 'term-red');
  }
}

// Option 1: Create Single User
function startCreateUser() {
  termPrint("\n=== [Option 1] Create a New Linux User ===", 'term-bold');
  termPrint("Enter username to create: ");
  interactivePrompt = {
    step: 'username',
    data: {},
    handler: (input) => {
      const uname = input.toLowerCase().trim();
      if (!/^[a-z_][a-z0-9_-]{0,31}$/.test(uname)) {
        termPrint("Error: Invalid username format. Must begin with lowercase letter/underscore and be <= 32 chars.", 'term-red');
        interactivePrompt = null;
        return;
      }
      if (virtualState.users.some(u => u.username === uname)) {
        termPrint(`Error: User '${uname}' already exists on this system.`, 'term-red');
        logAuditEvent('USER_CREATE', uname, 'FAILURE', 'Account already exists');
        interactivePrompt = null;
        return;
      }
      interactivePrompt.data.username = uname;
      termPrint(`Username accepted: ${uname}`, 'term-green');
      termPrint("Enter user full name (GECOS comment field, optional): ");
      interactivePrompt.handler = (nameInput) => {
        const fullname = nameInput.replace(/:/g, '').trim() || 'New Staff';
        interactivePrompt.data.name = fullname;
        termPrint("Enter login shell [/bin/bash]: ");
        interactivePrompt.handler = (shellInput) => {
          const shell = shellInput.trim() || '/bin/bash';
          interactivePrompt.data.shell = shell;

          termPrint(`\nReview New User Configuration:`);
          termPrint(`  - Username  : ${interactivePrompt.data.username}`, 'term-cyan');
          termPrint(`  - Full Name : ${interactivePrompt.data.name}`);
          termPrint(`  - Home Dir  : /home/${interactivePrompt.data.username}`);
          termPrint(`  - Shell     : ${interactivePrompt.data.shell}`);
          termPrint(`Confirm creation of account '${interactivePrompt.data.username}'? (y/N): `);

          interactivePrompt.handler = (confirmInput) => {
            if (/^[yY]$/.test(confirmInput)) {
              const maxUid = Math.max(...virtualState.users.map(u => u.uid), 999);
              const newUid = maxUid + 1;
              const newUser = {
                username: interactivePrompt.data.username,
                uid: newUid,
                gid: newUid,
                name: interactivePrompt.data.name,
                home: `/home/${interactivePrompt.data.username}`,
                shell: interactivePrompt.data.shell,
                status: 'active'
              };
              virtualState.users.push(newUser);
              virtualState.groups.push({ name: newUser.username, gid: newUid, members: [newUser.username] });

              termPrint(`\n[SUCCESS] Executing: useradd -m -s "${newUser.shell}" -c "${newUser.name}" "${newUser.username}"`, 'term-green');
              termPrint(`Success: User account '${newUser.username}' created successfully with UID ${newUid}.`, 'term-green');
              logAuditEvent('USER_CREATE', newUser.username, 'SUCCESS', `Created with home=${newUser.home}, shell=${newUser.shell}`);
              renderSystemState();
            } else {
              termPrint("User creation cancelled by administrator.", 'term-yellow');
              logAuditEvent('USER_CREATE', interactivePrompt.data.username, 'CANCELLED', 'Cancelled by admin prior to execution');
            }
            interactivePrompt = null;
          };
        };
      };
    }
  };
}

// Option 2: Batch User Creation
function startBatchUsers() {
  termPrint("\n=== [Option 2] Interactive Multiple User Creation ===", 'term-bold');
  termPrint("Simulating batch onboarding queue...");
  const sampleBatch = ['dev_alex', 'qa_priya', 'dev_gurpreet'];
  let count = 0;

  termPrint(`Processing batch of ${sampleBatch.length} users:`, 'term-cyan');
  sampleBatch.forEach(uname => {
    if (!virtualState.users.some(u => u.username === uname)) {
      const maxUid = Math.max(...virtualState.users.map(u => u.uid), 999);
      const newUid = maxUid + 1;
      virtualState.users.push({
        username: uname,
        uid: newUid,
        gid: newUid,
        name: `Batch User (${uname})`,
        home: `/home/${uname}`,
        shell: '/bin/bash',
        status: 'active'
      });
      virtualState.groups.push({ name: uname, gid: newUid, members: [uname] });
      termPrint(`  - ${uname.padEnd(16)} | SUCCESS | Created /home/${uname} (UID: ${newUid})`, 'term-green');
      logAuditEvent('BATCH_USER_CREATE', uname, 'SUCCESS', 'Batch created with shell=/bin/bash');
      count++;
    }
  });

  termPrint(`\nBatch Summary: ${sampleBatch.length} Queued | ${count} Succeeded | 0 Failed.`, 'term-bold');
  renderSystemState();
}

// Option 3: Modify User
function startModifyUser() {
  termPrint("\n=== [Option 3] Modify Existing User Details ===", 'term-bold');
  termPrint("Enter username to modify: ");
  interactivePrompt = {
    handler: (uname) => {
      const user = virtualState.users.find(u => u.username === uname.trim().toLowerCase());
      if (!user) {
        termPrint(`Error: User '${uname}' does not exist.`, 'term-red');
        interactivePrompt = null;
        return;
      }
      termPrint(`Found User '${user.username}' (Current GECOS: '${user.name}', Shell: '${user.shell}')`, 'term-cyan');
      termPrint("Enter new Full Name: ");
      interactivePrompt.handler = (newName) => {
        const updatedName = newName.replace(/:/g, '').trim() || user.name;
        user.name = updatedName;
        termPrint(`[SUCCESS] usermod -c "${updatedName}" "${user.username}"`, 'term-green');
        termPrint(`Updated GECOS comment to: ${updatedName}`, 'term-green');
        logAuditEvent('USER_MODIFY', user.username, 'SUCCESS', `Updated GECOS to '${updatedName}'`);
        renderSystemState();
        interactivePrompt = null;
      };
    }
  };
}

// Option 4: Create Group
function startCreateGroup() {
  termPrint("\n=== [Option 4] Create a Linux Group ===", 'term-bold');
  termPrint("Enter new group name: ");
  interactivePrompt = {
    handler: (gname) => {
      const name = gname.trim().toLowerCase();
      if (!/^[a-z_][a-z0-9_-]{0,31}$/.test(name)) {
        termPrint("Error: Invalid group name format.", 'term-red');
        interactivePrompt = null;
        return;
      }
      if (virtualState.groups.some(g => g.name === name)) {
        termPrint(`Error: Group '${name}' already exists.`, 'term-red');
        interactivePrompt = null;
        return;
      }
      const maxGid = Math.max(...virtualState.groups.map(g => g.gid), 999);
      const newGid = maxGid + 1;
      virtualState.groups.push({ name, gid: newGid, members: [] });
      termPrint(`[SUCCESS] groupadd "${name}" (Allocated GID: ${newGid})`, 'term-green');
      logAuditEvent('GROUP_CREATE', name, 'SUCCESS', `Created group with GID ${newGid}`);
      renderSystemState();
      interactivePrompt = null;
    }
  };
}

// Option 5: Add to Group
function startAddToGroup() {
  termPrint("\n=== [Option 5] Add User to Supplementary Group ===", 'term-bold');
  termPrint("Enter username: ");
  interactivePrompt = {
    handler: (uname) => {
      const u = uname.trim().toLowerCase();
      const user = virtualState.users.find(x => x.username === u);
      if (!user) {
        termPrint(`Error: User '${u}' not found.`, 'term-red');
        interactivePrompt = null;
        return;
      }
      termPrint("Enter group name to append: ");
      interactivePrompt.handler = (gname) => {
        const g = gname.trim().toLowerCase();
        const group = virtualState.groups.find(x => x.name === g);
        if (!group) {
          termPrint(`Error: Group '${g}' not found.`, 'term-red');
          interactivePrompt = null;
          return;
        }
        if (group.members.includes(u)) {
          termPrint(`Notice: User '${u}' is already a member of '${g}'.`, 'term-yellow');
        } else {
          group.members.push(u);
          termPrint(`[SUCCESS] usermod -aG "${g}" "${u}" (Preserved existing groups)`, 'term-green');
          termPrint(`User '${u}' added to supplementary group '${g}'.`, 'term-green');
          logAuditEvent('GROUP_ADD_USER', `${u}:${g}`, 'SUCCESS', 'Added user to supplementary group');
          renderSystemState();
        }
        interactivePrompt = null;
      };
    }
  };
}

// Option 6: Remove from Group
function startRemoveFromGroup() {
  termPrint("\n=== [Option 6] Remove User from Supplementary Group ===", 'term-bold');
  termPrint("Enter username: ");
  interactivePrompt = {
    handler: (uname) => {
      const u = uname.trim().toLowerCase();
      const user = virtualState.users.find(x => x.username === u);
      if (!user) {
        termPrint(`Error: User '${u}' not found.`, 'term-red');
        interactivePrompt = null;
        return;
      }
      termPrint("Enter group name to remove from: ");
      interactivePrompt.handler = (gname) => {
        const g = gname.trim().toLowerCase();
        const group = virtualState.groups.find(x => x.name === g);
        if (!group) {
          termPrint(`Error: Group '${g}' not found.`, 'term-red');
          interactivePrompt = null;
          return;
        }
        if (group.gid === user.gid) {
          termPrint(`Security Error: '${g}' is user's PRIMARY group. Cannot remove without altering primary GID.`, 'term-red');
          logAuditEvent('GROUP_REMOVE_USER', `${u}:${g}`, 'FAILURE', 'Attempted removal from primary group');
          interactivePrompt = null;
          return;
        }
        group.members = group.members.filter(m => m !== u);
        termPrint(`[SUCCESS] gpasswd -d "${u}" "${g}"`, 'term-green');
        termPrint(`User '${u}' removed from group '${g}'.`, 'term-green');
        logAuditEvent('GROUP_REMOVE_USER', `${u}:${g}`, 'SUCCESS', 'Removed user from supplementary group');
        renderSystemState();
        interactivePrompt = null;
      };
    }
  };
}

// Option 7: Lock User
function startLockUser() {
  termPrint("\n=== [Option 7] Lock User Account ===", 'term-bold');
  termPrint("Enter username to lock: ");
  interactivePrompt = {
    handler: (uname) => {
      const u = uname.trim().toLowerCase();
      if (u === 'root' || u === 'sysadmin') {
        termPrint(`[CRITICAL ACCESS CONTROL BLOCK] Refusing to lock protected operator/root account '${u}'.`, 'term-red');
        logAuditEvent('USER_LOCK', u, 'BLOCKED', 'Attempted to lock protected operator/root');
        interactivePrompt = null;
        return;
      }
      const user = virtualState.users.find(x => x.username === u);
      if (!user) {
        termPrint(`Error: User '${u}' does not exist.`, 'term-red');
        interactivePrompt = null;
        return;
      }
      termPrint("\n[SECURITY NOTE] 'passwd -l' places '!' prefix in /etc/shadow. Prevents password login only.", 'term-yellow');
      user.status = 'locked';
      termPrint(`[SUCCESS] passwd -l "${u}" (Account password locked)`, 'term-green');
      logAuditEvent('USER_LOCK', u, 'SUCCESS', 'Account locked via passwd -l');
      renderSystemState();
      interactivePrompt = null;
    }
  };
}

// Option 8: Unlock User
function startUnlockUser() {
  termPrint("\n=== [Option 8] Unlock User Account ===", 'term-bold');
  termPrint("Enter username to unlock: ");
  interactivePrompt = {
    handler: (uname) => {
      const u = uname.trim().toLowerCase();
      const user = virtualState.users.find(x => x.username === u);
      if (!user) {
        termPrint(`Error: User '${u}' not found.`, 'term-red');
        interactivePrompt = null;
        return;
      }
      user.status = (user.uid < 1000) ? 'system' : 'active';
      termPrint(`[SUCCESS] passwd -u "${u}" (Password authentication restored)`, 'term-green');
      logAuditEvent('USER_UNLOCK', u, 'SUCCESS', 'Account unlocked via passwd -u');
      renderSystemState();
      interactivePrompt = null;
    }
  };
}

// Option 9: Password Expiry (chage)
function startPasswordExpiry() {
  termPrint("\n=== [Option 9] Configure Password Expiry (chage) ===", 'term-bold');
  termPrint("Enter username: ");
  interactivePrompt = {
    handler: (uname) => {
      const u = uname.trim().toLowerCase();
      const user = virtualState.users.find(x => x.username === u);
      if (!user) {
        termPrint(`Error: User '${u}' not found.`, 'term-red');
        interactivePrompt = null;
        return;
      }
      termPrint(`Current Aging for '${u}': Max Days: 90 | Warn Days: 7 | Must Change: No`);
      termPrint("Action: 1: Set Max Lifetime (chage -M), 2: Force Reset Next Login (chage -d 0)");
      termPrint("Enter choice [1-2]: ");
      interactivePrompt.handler = (c) => {
        if (c === '2') {
          termPrint(`[SUCCESS] chage -d 0 "${u}" (Password set to Epoch 0)`, 'term-green');
          termPrint(`User '${u}' will be prompted to change password immediately on next login.`, 'term-green');
          logAuditEvent('PASSWORD_AGING', u, 'SUCCESS', 'Forced password change on next login (chage -d 0)');
        } else {
          termPrint(`[SUCCESS] chage -M 60 "${u}"`, 'term-green');
          termPrint(`Maximum password lifespan set to 60 days.`, 'term-green');
          logAuditEvent('PASSWORD_AGING', u, 'SUCCESS', 'Set max age to 60 days');
        }
        interactivePrompt = null;
      };
    }
  };
}

// Option 10: Safe Deletion with Verified Backup
function startDeleteUser() {
  termPrint("\n=== [Option 10] High-Security Safe User Account Deletion ===", 'term-red');
  termPrint("Enter username to delete: ");
  interactivePrompt = {
    handler: (uname) => {
      const u = uname.trim().toLowerCase();
      // Shielding root and current operator
      if (u === 'root' || u === 'sysadmin') {
        termPrint(`\n[CRITICAL ACCESS CONTROL BLOCK]`, 'term-red');
        termPrint(`The account '${u}' is recognized as root or the active operator. Automated deletion blocked!`, 'term-red');
        logAuditEvent('USER_DELETE', u, 'BLOCKED', 'Attempted deletion of protected/active operator');
        interactivePrompt = null;
        return;
      }
      const user = virtualState.users.find(x => x.username === u);
      if (!user) {
        termPrint(`Error: Account '${u}' does not exist.`, 'term-red');
        interactivePrompt = null;
        return;
      }

      termPrint(`Select Deletion Strategy:`);
      termPrint(`  1. Delete user account ONLY (Preserve home directory)`);
      termPrint(`  2. BACKUP home directory to secure tar.gz, then delete account and home`);
      termPrint(`Enter choice [1-2]: `);

      interactivePrompt.handler = (stratChoice) => {
        const doBackup = (stratChoice === '2');
        if (doBackup) {
          const ts = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
          const archName = `backup_${u}_${ts}.tar.gz`;
          virtualState.backups.unshift({ name: archName, size: '2.4 MB', date: new Date().toLocaleTimeString() });
          termPrint(`\n[BACKUP STAGE] Compressing /home/${u} into /var/backups/user_mgmt_backups/${archName}...`, 'term-cyan');
          termPrint(`[VERIFICATION] tar -tzf verified archive integrity: 100% PASS.`, 'term-green');
        }

        termPrint(`\n═══════════════════════════════════════════════════════════════════════`, 'term-red');
        termPrint(` [MANDATORY CONFIRMATION - DESTRUCTIVE OPERATION]`, 'term-red');
        termPrint(`═══════════════════════════════════════════════════════════════════════`, 'term-red');
        termPrint(`To prevent accidental deletion, type exactly: DELETE ${u}`, 'term-bold');
        termPrint(`Confirmation: `);

        interactivePrompt.handler = (token) => {
          if (token === `DELETE ${u}`) {
            virtualState.users = virtualState.users.filter(x => x.username !== u);
            virtualState.groups.forEach(g => {
              g.members = g.members.filter(m => m !== u);
            });
            termPrint(`\n[SUCCESS] userdel ${doBackup ? '-r ' : ''}"${u}"`, 'term-green');
            termPrint(`Account '${u}' permanently removed from system database.`, 'term-green');
            logAuditEvent('USER_DELETE', u, 'SUCCESS', `Deleted with strategy=${doBackup ? 'Backup-and-delete' : 'Account-only'}`);
            renderSystemState();
          } else {
            termPrint(`\nConfirmation phrase mismatch ('${token}' != 'DELETE ${u}'). Deletion ABORTED safely.`, 'term-yellow');
            logAuditEvent('USER_DELETE', u, 'CANCELLED', 'Confirmation token mismatch');
          }
          interactivePrompt = null;
        };
      };
    }
  };
}

// Option 11: User Report
function generateUserReport() {
  termPrint("\n========================================================================================", 'term-bold');
  termPrint("                     LINUX SYSTEM USER AUDIT & COMPLIANCE REPORT                        ", 'term-cyan');
  termPrint("========================================================================================", 'term-bold');
  termPrint(`Generated On : ${new Date().toLocaleString()}`);
  termPrint(`Generated By : sysadmin (Jasmeet Singh) | Host: gndec-server-01`);
  termPrint(`UID Threshold: Regular Users: [1000 - 60000] | System Daemons: [< 1000 or >= 60000]\n`);

  termPrint("Username           | UID    | GID    | Home Directory           | Login Shell      | Type");
  termPrint("-------------------+--------+--------+--------------------------+------------------+--------------");

  let regCount = 0;
  let sysCount = 0;

  virtualState.users.forEach(u => {
    const isReg = u.uid >= 1000 && u.uid <= 60000;
    if (isReg) regCount++; else sysCount++;
    const typeStr = isReg ? 'Regular/Human' : 'System';
    termPrint(`${u.username.padEnd(18)} | ${String(u.uid).padEnd(6)} | ${String(u.gid).padEnd(6)} | ${u.home.padEnd(24)} | ${u.shell.padEnd(16)} | ${typeStr}`);
  });

  termPrint("-------------------+--------+--------+--------------------------+------------------+--------------");
  termPrint(`SUMMARY STATISTICS: Total: ${virtualState.users.length} | Regular Users: ${regCount} | System Accounts: ${sysCount}`);
  termPrint("========================================================================================\n", 'term-bold');
  termPrint("[REPORT SAVED] Saved copy to ./reports/user_report_latest.txt", 'term-green');
  logAuditEvent('REPORT_GENERATE', 'USERS', 'SUCCESS', 'Generated compliance user report');
}

// Option 12: Group Report
function generateGroupReport() {
  termPrint("\n========================================================================================", 'term-bold');
  termPrint("                        LINUX SYSTEM GROUP AUDIT REPORT                                 ", 'term-cyan');
  termPrint("========================================================================================", 'term-bold');
  termPrint(`Generated On : ${new Date().toLocaleString()} | Host: gndec-server-01\n`);

  termPrint("Group Name               | GID      | Members");
  termPrint("-------------------------+----------+---------------------------------------------------");

  virtualState.groups.forEach(g => {
    const memStr = g.members.length > 0 ? g.members.join(', ') : '[None]';
    termPrint(`${g.name.padEnd(24)} | ${String(g.gid).padEnd(8)} | ${memStr}`);
  });

  termPrint("-------------------------+----------+---------------------------------------------------");
  termPrint(`Total Local Groups Identified: ${virtualState.groups.length}`);
  termPrint("========================================================================================\n", 'term-bold');
  logAuditEvent('REPORT_GENERATE', 'GROUPS', 'SUCCESS', 'Generated group audit report');
}

// Option 13: View Audit Logs
function viewAuditLogs() {
  termPrint("\n=== [Option 13] View System Audit Log Records ===", 'term-bold');
  termPrint("Log File: /var/log/sys_user_mgmt.log (Perms: 0600, root:root)\n", 'term-dim');
  virtualState.logs.slice(0, 10).forEach(l => {
    const colorClass = l.status === 'SUCCESS' ? 'term-green' : (l.status === 'BLOCKED' || l.status === 'FAILURE' ? 'term-red' : 'term-cyan');
    termPrint(`[${l.timestamp}] [${l.operator}] [${l.action}] target='${l.target}' status='${l.status}' - ${l.details}`, colorClass);
  });
  termPrint("\nShowing latest 10 administrative records.", 'term-dim');
}

// Option 14: Project Info
function displayProjectInfo() {
  termPrint("\n=== [Option 14] Project Documentation & Academic Credentials ===", 'term-cyan');
  termPrint(`
  PROJECT TITLE:
    Automated Linux User Management Shell Script

  INSTITUTION:
    Guru Nanak Dev Engineering College (GNDEC), Ludhiana
    Department of Information Technology
    B.Tech Information Technology — 4-Week Training Project

  CORE PURPOSE:
    Automate routine user and group lifecycle operations via a secure,
    menu-driven command-line interface with strict POSIX regex validation,
    anti-lockout access guards, verified tar backups, and tamper-evident audit logging.
  `, 'term-bold');
}

// --- Render Virtual State UI ---
function renderSystemState() {
  // Users Table
  const userTbody = document.getElementById('users-table-body');
  if (userTbody) {
    userTbody.innerHTML = virtualState.users.map(u => `
      <tr>
        <td><strong>${escapeHtml(u.username)}</strong></td>
        <td>${u.uid}</td>
        <td>${u.gid}</td>
        <td>${escapeHtml(u.name)}</td>
        <td><code>${escapeHtml(u.shell)}</code></td>
        <td><span class="status-pill ${u.status}">${u.status.toUpperCase()}</span></td>
      </tr>
    `).join('');
    document.getElementById('user-count-badge').textContent = `${virtualState.users.length} Accounts`;
  }

  // Groups Table
  const groupTbody = document.getElementById('groups-table-body');
  if (groupTbody) {
    groupTbody.innerHTML = virtualState.groups.map(g => `
      <tr>
        <td><strong>${escapeHtml(g.name)}</strong></td>
        <td>${g.gid}</td>
        <td>${g.members.map(m => `<span class="group-pill">${escapeHtml(m)}</span>`).join('') || '<span class="term-dim">[None]</span>'}</td>
      </tr>
    `).join('');
    document.getElementById('group-count-badge').textContent = `${virtualState.groups.length} Groups`;
  }

  // Audit Stream
  const logStream = document.getElementById('audit-log-stream');
  if (logStream) {
    logStream.innerHTML = virtualState.logs.map(l => `
      <div class="log-entry ${l.status.toLowerCase()}">
        [${l.timestamp}] [<strong>${escapeHtml(l.action)}</strong>] target=${escapeHtml(l.target)} status=${escapeHtml(l.status)} — ${escapeHtml(l.details)}
      </div>
    `).join('');
  }

  // Backup List
  const backupList = document.getElementById('backup-list');
  if (backupList) {
    if (virtualState.backups.length === 0) {
      backupList.innerHTML = `<div class="term-dim" style="padding: 10px;">No preserved archives yet. Created before safe user deletion (Option 10).</div>`;
    } else {
      backupList.innerHTML = virtualState.backups.map(b => `
        <div class="backup-item">
          <span class="backup-name">📦 ${escapeHtml(b.name)}</span>
          <span class="backup-size">${b.size} • ${b.date}</span>
        </div>
      `).join('');
    }
    document.getElementById('backup-count-badge').textContent = `${virtualState.backups.length} Archives`;
  }
}

function clearAuditLog() {
  virtualState.logs = [];
  renderSystemState();
}

// --- Render Viva Voce Accordion ---
function renderVivaVoce(filter = '') {
  const container = document.getElementById('viva-accordion');
  if (!container) return;

  const filtered = vivaQuestions.filter(item => 
    item.q.toLowerCase().includes(filter.toLowerCase()) || 
    item.a.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div class="term-dim" style="padding: 15px;">No questions matched your search query.</div>`;
    return;
  }

  container.innerHTML = filtered.map((item, idx) => `
    <div class="accordion-item" id="viva-item-${idx}">
      <div class="accordion-header" onclick="toggleAccordion(${idx})">
        <h4>Q${idx + 1}: ${escapeHtml(item.q)}</h4>
        <span class="accordion-icon">▼</span>
      </div>
      <div class="accordion-body">
        <p>${escapeHtml(item.a)}</p>
      </div>
    </div>
  `).join('');
}

function toggleAccordion(idx) {
  const item = document.getElementById(`viva-item-${idx}`);
  if (item) item.classList.toggle('open');
}

function filterViva() {
  const query = document.getElementById('viva-search').value;
  renderVivaVoce(query);
}

// Utility: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
