import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ ALTERE "catalogo-produtos" para o nome exato do seu repositório no GitHub!
const REPO_NAME = 'catalogo-produtos'

export default defineConfig({
  plugins: [react()],
  base: `/${REPO_NAME}/`,
})
