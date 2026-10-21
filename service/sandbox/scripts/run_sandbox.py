import sys
import subprocess
from pathlib import Path

def run_isolated_code(code_file_path: str, timeout_sec: int = 10):
    target = Path(code_file_path).resolve()
    if not target.is_file():
        print(f"[-] Error: Target file '{code_file_path}' does not exist.")
        sys.exit(1)

    print(f"[*] Running isolated execution for: {target.name}")
    print(f"[*] Resource limits: 0.5 CPU, 128MB RAM, 32 PIDs, no-network, read-only FS")

    # Format file path for Docker volume mounting on Windows
    mounted_path = str(target).replace("\\", "/")

    # Build the single command string for reliable execution on Windows
    docker_cmd = (
        f'docker run --rm '
        f'--name sandbox-{target.stem} '
        f'--network none '
        f'--cpus=0.5 '
        f'--memory=128m '
        f'--memory-swap=128m '
        f'--pids-limit=32 '
        f'--cap-drop=ALL '
        f'--security-opt=no-new-privileges:true '
        f'--read-only '
        f'--tmpfs /tmp:rw,noexec,nosuid,size=16m '
        f'-v "{mounted_path}":/workspace/submission.py:ro '
        f'edupulse-python-runner:latest '
        f'python3 /workspace/submission.py'
    )

    try:
        result = subprocess.run(
            docker_cmd,
            capture_output=True,
            text=True,
            timeout=timeout_sec,
            shell=True
        )
        if result.stdout:
            print("[+] Container Output:\n" + result.stdout)
        if result.stderr:
            print("[!] Container Stderr:\n" + result.stderr)
        print(f"[+] Execution finished with Exit Code: {result.returncode}")
        return result.returncode

    except subprocess.TimeoutExpired:
        print(f"[!] Alert: Execution timed out after {timeout_sec} seconds (Infinite loop or stall detected).")
        subprocess.run(f'docker rm -f sandbox-{target.stem}', shell=True, capture_output=True)
        return 124

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python service/sandbox/scripts/run_sandbox.py <path_to_code_file>")
        sys.exit(1)
    run_isolated_code(sys.argv[1])