# Attempts to allocate 512MB RAM (Exceeding the 128MB limit)
try:
    print("[*] Allocating memory...")
    large_list = [bytearray(1024 * 1024) for _ in range(512)]
    print("[-] Memory attack succeeded (Security failure)")
except MemoryError:
    print("[+] Caught MemoryError within process.")