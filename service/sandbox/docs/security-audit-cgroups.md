# Docker Execution Sandbox: Security Audit & cgroups Runtime Constraints

## 1. Overview
The Sandbox module isolates untrusted code executions submitted to the grading engine. Untrusted scripts run inside containerized, non-root environments with strictly bounded compute resources, read-only file systems, and restricted network egress.

## 2. Threat Vector Analysis & Mitigation Matrix

| Threat Vector | Mitigation Strategy | Applied Container Flag |
| :--- | :--- | :--- |
| **Denial of Service (OOM)** | Hard limit on RAM and Swap allocations | `--memory=128m --memory-swap=128m` |
| **CPU Starvation** | CPU quota and CFS scheduler limits | `--cpus=0.5` |
| **Fork Bomb (PID Exhaustion)**| Process limit via cgroups v2 `pids.max` | `--pids-limit=32` |
| **Data Exfiltration / SSRF** | Complete network stack disconnection | `--network none` |
| **Host System Tampering** | Immutable container root filesystem | `--read-only` |
| **Privilege Escalation** | Drop Linux capabilities & prevent SUID bits | `--cap-drop=ALL --security-opt=no-new-privileges:true` |

## 3. Local Verification Steps
1. Build runner image:
   ```bash
   docker build -t edupulse-python-runner:latest service/sandbox/runners/python/