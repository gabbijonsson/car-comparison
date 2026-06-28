import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  activityEventTypeValidator,
  engineTypeValidator,
  equipmentCategoryValidator,
  equipmentPriorityValidator,
  financingValidator,
  globalSettingsFieldsValidator,
  prospectStatusValidator,
  purchaseMethodValidator,
} from './lib/validators'

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
  }).index('email', ['email']),

  globalSettings: defineTable({
    key: v.literal('default'),
    ...globalSettingsFieldsValidator,
    updatedAt: v.number(),
    updatedBy: v.optional(v.id('users')),
  }).index('by_key', ['key']),

  equipment: defineTable({
    name: v.string(),
    category: equipmentCategoryValidator,
    priority: equipmentPriorityValidator,
    createdAt: v.number(),
    createdBy: v.id('users'),
  })
    .index('by_category', ['category'])
    .index('by_name', ['name']),

  prospects: defineTable({
    brand: v.string(),
    model: v.string(),
    title: v.string(),
    modelYear: v.optional(v.number()),
    registrationYear: v.optional(v.number()),
    mileage: v.optional(v.number()),
    engineType: engineTypeValidator,
    purchaseMethod: purchaseMethodValidator,
    buyPriceSek: v.number(),
    packageDescription: v.optional(v.string()),
    insuranceMonthlySek: v.number(),
    taxYearlySek: v.number(),
    serviceSmallSek: v.number(),
    serviceBigSek: v.number(),
    serviceIntervalMonths: v.number(),
    fuelConsumption: v.optional(v.number()),
    financing: v.optional(financingValidator),
    freeTextEquipmentTags: v.array(v.string()),
    status: prospectStatusValidator,
    createdBy: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_status', ['status']),

  prospectEquipment: defineTable({
    prospectId: v.id('prospects'),
    equipmentId: v.id('equipment'),
    isPresent: v.boolean(),
  })
    .index('by_prospectId', ['prospectId'])
    .index('by_equipmentId', ['equipmentId'])
    .index('by_prospectId_equipmentId', ['prospectId', 'equipmentId']),

  purchaseItems: defineTable({
    prospectId: v.id('prospects'),
    title: v.string(),
    costSek: v.number(),
    paidUpfront: v.boolean(),
  }).index('by_prospectId', ['prospectId']),

  sourceLinks: defineTable({
    prospectId: v.id('prospects'),
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id('users'),
    createdAt: v.number(),
  }).index('by_prospectId', ['prospectId']),

  notes: defineTable({
    prospectId: v.id('prospects'),
    userId: v.id('users'),
    text: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index('by_prospectId', ['prospectId']),

  ratings: defineTable({
    prospectId: v.id('prospects'),
    userId: v.id('users'),
    score: v.number(),
    updatedAt: v.number(),
  })
    .index('by_prospectId', ['prospectId'])
    .index('by_prospectId_userId', ['prospectId', 'userId']),

  vetoes: defineTable({
    prospectId: v.id('prospects'),
    userId: v.id('users'),
    createdAt: v.number(),
  })
    .index('by_prospectId', ['prospectId'])
    .index('by_prospectId_userId', ['prospectId', 'userId']),

  reminders: defineTable({
    prospectId: v.id('prospects'),
    userId: v.id('users'),
    createdAt: v.number(),
  })
    .index('by_prospectId', ['prospectId'])
    .index('by_prospectId_userId', ['prospectId', 'userId'])
    .index('by_userId', ['userId']),

  activityEvents: defineTable({
    type: activityEventTypeValidator,
    actorUserId: v.id('users'),
    prospectId: v.optional(v.id('prospects')),
    entityId: v.optional(v.string()),
    message: v.string(),
    metadata: v.optional(
      v.record(v.string(), v.union(v.string(), v.number(), v.boolean(), v.null())),
    ),
    createdAt: v.number(),
  }).index('by_createdAt', ['createdAt']),
})
