/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity from "../activity.js";
import type * as admin_users from "../admin/users.js";
import type * as auth from "../auth.js";
import type * as equipment from "../equipment.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as lib_activity from "../lib/activity.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_defaults from "../lib/defaults.js";
import type * as lib_equipmentHelpers from "../lib/equipmentHelpers.js";
import type * as lib_prospectHelpers from "../lib/prospectHelpers.js";
import type * as lib_seedData from "../lib/seedData.js";
import type * as lib_validators from "../lib/validators.js";
import type * as prospects from "../prospects.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as social from "../social.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activity: typeof activity;
  "admin/users": typeof admin_users;
  auth: typeof auth;
  equipment: typeof equipment;
  health: typeof health;
  http: typeof http;
  "lib/activity": typeof lib_activity;
  "lib/auth": typeof lib_auth;
  "lib/defaults": typeof lib_defaults;
  "lib/equipmentHelpers": typeof lib_equipmentHelpers;
  "lib/prospectHelpers": typeof lib_prospectHelpers;
  "lib/seedData": typeof lib_seedData;
  "lib/validators": typeof lib_validators;
  prospects: typeof prospects;
  seed: typeof seed;
  settings: typeof settings;
  social: typeof social;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
