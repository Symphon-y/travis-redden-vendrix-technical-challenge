import { z } from 'zod';
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------

/**
 * ! !!!!!!! ATTENTION !!!!!!!!
 *
 * @docs  https://github.com/colinhacks/zod#strings
 * TODO: Adjust the "User" schema below to whatever you think makes sense.
 * No adjustments needed for any other schema
 *
 * ! !!!!!!!!!!!!!!!!!!!!!!!!!!
 */

/**
 * * *******************
 *    DB Models
 * * *******************
 */
export const userRoles = [
  'Controller',
  'Administrator',
  'Base user',
  'Astronaut',
] as const;
const userRoleSchema = z.enum(userRoles);
export type UserRole = z.infer<typeof userRoleSchema>;

/**
 * @summary     Schema for a "user" entity type
 */

export const User = z.object({
  _id: z.string().uuid(),
  role: userRoleSchema,
  name: z.object({
    familyName: z.string().min(1).max(2000),
    givenName: z.string().min(1).max(2000),
    middleName: z.string().optional(),
    suffix: z.string().optional(),
    title: z.string().optional(),
  }),
  dateOfBirth: z.date(),
  email: z.string().email(),
});
export type User = z.infer<typeof User>;

// ----------------------------------------------------------------------

/**
 * * *******************
 *    Mutations
 * * *******************
 */
export const createUserSchema = User.pick({
  role: true,
  name: true,
  dateOfBirth: true,
  email: true,
});
export type CreateUser = z.infer<typeof createUserSchema>;

export const updateUserSchema = User.pick({
  role: true,
  name: true,
  dateOfBirth: true,
  email: true,
}).partial();
export type UpdateUser = z.infer<typeof updateUserSchema>;

// ----------------------------------------------------------------------

/**
 * * *******************
 *    Default Values
 * * *******************
 */
export const defaultValuesUser = (): CreateUser => ({
  role: 'Astronaut',
  name: {
    familyName: '',
    givenName: '',
    middleName: undefined,
    suffix: undefined,
    title: undefined,
  },
  dateOfBirth: new Date(),
  email: '',
});
