// Mode lokal: `npm run dev:local` (vite --mode emulator) memuat Frontend/.env.emulator.
// `import.meta.env` hanya ada di Vite; opsional-chaining menjaga tes Node tetap jalan.
export const USE_EMULATOR = import.meta.env?.VITE_USE_EMULATOR === 'true'
