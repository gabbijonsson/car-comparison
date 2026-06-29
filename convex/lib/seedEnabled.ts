/** Demo data seeding runs only when ENABLE_DATA_SEED=true (set on dev, not prod). */
export function isDataSeedingEnabled(): boolean {
  return process.env.ENABLE_DATA_SEED === 'true'
}
