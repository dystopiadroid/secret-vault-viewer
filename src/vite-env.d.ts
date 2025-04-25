/// <reference types="vite/client" />

interface ImportMetaEnv {
  // No Azure environment variables needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
