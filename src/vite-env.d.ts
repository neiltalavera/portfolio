/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_PROFILE: {
    readonly linkedIn: string
    readonly github: string
    readonly morrowlog: string
    readonly gymTypescript: string
  }
  readonly PUBLIC_CONTACT_LIMITS: { readonly email: number; readonly title: number; readonly message: number }
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
