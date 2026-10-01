import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { cwd, env } from 'node:process'

/* OLD IMPLEMENTATION - KEPT FOR REFERENCE
export default defineConfig({
  plugins: [react()],
})
*/

// NEW VERCEL-COMPATIBLE IMPLEMENTATION
export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, cwd(), "VITE_")
  const apiUrl = environment.VITE_API_URL

  if (env.VERCEL === "1") {
    if (!apiUrl) {
      throw new Error("Set VITE_API_URL in the Vercel frontend project environment variables.")
    }

    const parsedApiUrl = new URL(apiUrl)
    if (["localhost", "127.0.0.1"].includes(parsedApiUrl.hostname)) {
      throw new Error("VITE_API_URL must point to the deployed backend on Vercel, not localhost.")
    }
  }

  return {
    plugins: [react()],
  }
})
