import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(["measure-voice.js", ".next/**", "out/**", "next-env.d.ts", "verification/**", "test-results/**", "playwright-report/**"]),
]);
