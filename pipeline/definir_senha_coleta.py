"""Gera a senha do usuário "coleta" sem que ela apareça na tela.

1. Sorteia uma senha forte.
2. Grava a senha no .env.local (fora do Git) e nos segredos do GitHub.
3. Imprime só o "verificador" SCRAM: um hash que o Postgres guarda no lugar
   da senha. É ele que vai no comando ALTER ROLE, então a senha em si nunca
   passa pelo banco, por logs ou pelo chat.

Uso: python definir_senha_coleta.py
"""

import base64
import hashlib
import hmac
import os
import re
import secrets
import shutil
import subprocess
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ENV_LOCAL = RAIZ / ".env.local"
VARIAVEL = "COLETA_DB_PASSWORD"
ITERACOES = 4096  # padrão do Postgres para SCRAM-SHA-256


def verificador_scram(senha: str) -> str:
    """Mesmo formato que o Postgres gera para SCRAM-SHA-256 (RFC 5802)."""
    salt = os.urandom(16)
    salted = hashlib.pbkdf2_hmac("sha256", senha.encode(), salt, ITERACOES)
    client_key = hmac.digest(salted, b"Client Key", "sha256")
    stored_key = hashlib.sha256(client_key).digest()
    server_key = hmac.digest(salted, b"Server Key", "sha256")
    b64 = lambda b: base64.b64encode(b).decode()  # noqa: E731
    return f"SCRAM-SHA-256${ITERACOES}:{b64(salt)}${b64(stored_key)}:{b64(server_key)}"


def gravar_env_local(senha: str) -> None:
    texto = ENV_LOCAL.read_text(encoding="utf-8") if ENV_LOCAL.exists() else ""
    linha = f"{VARIAVEL}={senha}"
    padrao = re.compile(rf"^{VARIAVEL}=.*$", re.MULTILINE)
    if padrao.search(texto):
        texto = padrao.sub(linha, texto)
    else:
        texto += ("" if texto.endswith("\n") or not texto else "\n") + linha + "\n"
    ENV_LOCAL.write_text(texto, encoding="utf-8")


def gravar_segredo_github(senha: str) -> bool:
    gh = shutil.which("gh") or r"C:\Program Files\GitHub CLI\gh.exe"
    if not Path(gh).exists() and not shutil.which("gh"):
        return False
    # A senha vai pela entrada padrão, nunca como argumento visível.
    resultado = subprocess.run(
        [gh, "secret", "set", VARIAVEL], input=senha, text=True,
        cwd=RAIZ, capture_output=True,
    )
    return resultado.returncode == 0


def main() -> None:
    senha = secrets.token_urlsafe(32)  # ~256 bits, só letras, números, - e _
    gravar_env_local(senha)
    no_github = gravar_segredo_github(senha)
    print(f"Senha gravada em .env.local ({VARIAVEL}).")
    print("Segredo do GitHub:", "gravado." if no_github else "NÃO gravado (rode de novo com o gh logado).")
    print("Verificador para o ALTER ROLE:")
    print(verificador_scram(senha))


if __name__ == "__main__":
    main()
