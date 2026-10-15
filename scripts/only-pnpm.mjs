// Corre antes de instalar dependencias: este proyecto solo se instala con pnpm.
// npm y yarn también ejecutan "preinstall", así que aquí se detienen.
const agent = process.env.npm_config_user_agent ?? "";

if (!agent.startsWith("pnpm/")) {
  console.error("\n  Este proyecto usa pnpm. Instala las dependencias con:\n\n    pnpm install\n");
  process.exit(1);
}
