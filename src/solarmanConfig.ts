// Configuration for the Solarman battery table.

/**
 * Optional display names for batteries, keyed by serial number.
 * Either the device SN from the plant device list or the "SN1" value
 * (Connected Device SN) can be used as key. Unmapped batteries show their SN.
 *
 * Example:
 *   'ABC123456': 'Batteri 1 (källaren)',
 */
export const BATTERY_NAMES: Record<string, string> = {};

/** API calls allowed per year on the current Solarman plan. */
export const ANNUAL_CALL_LIMIT = 200_000
/** Fraction of the limit we plan to use, leaving headroom for restarts etc. */
export const BUDGET_SAFETY_FACTOR = 0.9
/** Calls per day reserved for fetching the device list (page reloads). */
export const DEVICE_LIST_CALLS_PER_DAY = 5

/** Office hours (local time), [start, end). Data is polled more often then. */
export const OFFICE_START_HOUR = 6
export const OFFICE_END_HOUR = 20

/** Fastest allowed polling interval during office hours, in minutes. */
export const MIN_OFFICE_INTERVAL_MIN = 4
/** Polling interval outside office hours, in minutes. */
export const OFF_HOURS_INTERVAL_MIN = 120

/** Retry delay if the device list could not be fetched, in minutes. */
export const DEVICE_LIST_RETRY_MIN = 15
