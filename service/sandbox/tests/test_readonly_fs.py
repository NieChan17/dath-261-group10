print("[*] Attempting to write file to system directory...")
try:
    with open("/workspace/unauthorized_file.txt", "w") as f:
        f.write("Exploit data")
    print("[-] Filesystem write succeeded!")
except OSError as e:
    print(f"[+] Read-only filesystem enforced: {e}")