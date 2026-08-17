#!/usr/bin/env bash
set -uo pipefail

echo "=== network diagnostics ==="
echo "--- getent hosts ---"
getent ahosts repo.omgeving.vlaanderen.be || echo "getent failed"
echo "--- python getaddrinfo ---"
python3 - <<'PY'
import socket
for fam in (socket.AF_INET, socket.AF_INET6):
    try:
        r = socket.getaddrinfo("repo.omgeving.vlaanderen.be", 443, fam, socket.SOCK_STREAM)
        print(fam, [x[4][0] for x in r])
    except Exception as e:
        print(fam, "ERR", e)
PY
echo "--- TCP connect ---"
if (echo > /dev/tcp/repo.omgeving.vlaanderen.be/443) 2>/dev/null; then
  echo "TCP connect: OK"
else
  echo "TCP connect: FAILED"
fi

echo "=== force IPv4 preference via /etc/gai.conf ==="
printf 'precedence ::ffff:0:0/96  100\n' >> /etc/gai.conf || true
python3 - <<'PY'
import socket
print("getaddrinfo:", socket.getaddrinfo("repo.omgeving.vlaanderen.be", 443, socket.SOCK_STREAM))
PY
if (echo > /dev/tcp/repo.omgeving.vlaanderen.be/443) 2>/dev/null; then
  echo "TCP connect after gai.conf: OK"
else
  echo "TCP connect after gai.conf: FAILED"
fi

echo "=== build mkdocs ==="
bash documentatie/datamodel/build-mkdocs.sh
