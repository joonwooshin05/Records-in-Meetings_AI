export interface UserProps {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  provider: 'email' | 'google';
  createdAt: Date;
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly displayName: string | null;
  readonly photoURL: string | null;
  readonly provider: 'email' | 'google';
  readonly createdAt: Date;

  constructor(props: UserProps) {
    if (!props.id) throw new Error('User id cannot be empty');
    if (!props.email) throw new Error('User email cannot be empty');

    this.id = props.id;
    this.email = props.email;
    this.displayName = props.displayName;
    this.photoURL = props.photoURL;
    this.provider = props.provider;
    this.createdAt = props.createdAt;
  }

  get initials(): string {
    if (this.displayName) {
      return this.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return this.email[0].toUpperCase();
  }

  toProps(): UserProps {
    return {
      id: this.id,
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      provider: this.provider,
      createdAt: this.createdAt,
    };
  }
}
