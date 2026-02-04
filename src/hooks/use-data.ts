/**
 * Re-export from use-data.tsx so requests for use-data.ts (e.g. cached) resolve.
 * The implementation lives in use-data.tsx because DataProvider contains JSX.
 */
export { DataProvider, useData, default } from "./use-data.tsx";
