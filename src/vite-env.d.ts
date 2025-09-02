/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly DEV: boolean
  readonly MODE: string
  readonly PROD: boolean
  readonly GITHUB_PAGES: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
