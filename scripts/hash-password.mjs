// Genera ADMIN_PASSWORD_HASH. Uso: npm run admin:hash
// La contraseña se pide por teclado (sin mostrarla) o por stdin; nunca como argumento.
import { stdin, stdout, stderr } from "node:process";
import { hashPassword } from "../src/lib/auth/password.ts";

const MIN_LENGTH = 12;

function readHidden(prompt) {
  return new Promise((resolve) => {
    if (!stdin.isTTY) {
      let data = "";
      stdin.setEncoding("utf8");
      stdin.on("data", (c) => (data += c));
      stdin.on("end", () => resolve(data.replace(/\r?\n$/, "")));
      return;
    }
    stderr.write(prompt);
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (ch) => {
      for (const c of ch) {
        if (c === "\r" || c === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          stderr.write("\n");
          return resolve(value);
        }
        if (c === "\u0003") process.exit(130); // Ctrl+C
        if (c === "\u007f") value = value.slice(0, -1);
        else value += c;
      }
    };
    stdin.on("data", onData);
  });
}

const password = await readHidden("Contraseña del administrador: ");
if (password.length < MIN_LENGTH) {
  stderr.write(`La contraseña debe tener al menos ${MIN_LENGTH} caracteres.\n`);
  process.exit(1);
}
if (stdin.isTTY) {
  const again = await readHidden("Repite la contraseña: ");
  if (again !== password) {
    stderr.write("Las contraseñas no coinciden.\n");
    process.exit(1);
  }
}
stdout.write(`ADMIN_PASSWORD_HASH=${await hashPassword(password)}\n`);
