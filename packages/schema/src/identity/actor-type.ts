/** Who performed an action recorded by the system. */
export const ACTOR_TYPES = ['guest', 'user', 'service'] as const;
export type ActorType = (typeof ACTOR_TYPES)[number];
