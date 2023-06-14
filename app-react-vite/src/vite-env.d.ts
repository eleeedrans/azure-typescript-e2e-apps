/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CLOUD_ENV: string
    readonly VITE_BACKEND_URI: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
