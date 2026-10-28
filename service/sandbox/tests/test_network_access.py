import urllib.request

print("[*] Attempting outbound network request...")
try:
    urllib.request.urlopen("https://google.com", timeout=2)
    print("[-] Network leak: connection succeeded!")
except Exception as e:
    print(f"[+] Network isolation confirmed: {type(e).__name__}")