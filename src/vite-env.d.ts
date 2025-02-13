/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVERLESS_FUNCTION_URL: string;
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
