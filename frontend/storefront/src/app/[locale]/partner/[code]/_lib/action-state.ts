/** What a Partner Workspace Server Action tells its Client Component. */
export interface ActionState {
  status: 'idle' | 'done' | 'error';
  message?: string;
  /** The edit lost to a newer one; the caller should reload the row. */
  stale?: boolean;
}

/** An error state whose message is looked up in a map typed by the service's error union. */
export function actionError<E extends string>(messages: Record<E, string>, error: E): ActionState {
  return { status: 'error', message: messages[error] };
}
