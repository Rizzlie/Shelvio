/** A person with a Shelvio account, as the rest of the app sees them. */
export interface User {
  readonly id: string;
  readonly email: string;
  /** Google's display name; absent when the Google profile has none. */
  readonly name: string | null;
  readonly avatarUrl: string | null;
}
