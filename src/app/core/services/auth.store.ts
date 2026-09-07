import { Injectable, signal } from '@angular/core';
import { LoginCredentials } from '../../shared/models/credentials.model';

const CREDENTIALS_KEY = 'spotify.auth.credentials';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly credentials = signal<LoginCredentials | null>(this.readStored());

  set(credentials: LoginCredentials | null): void {
    this.credentials.set(credentials);

    if (credentials) {
      sessionStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
      return;
    }

    sessionStorage.removeItem(CREDENTIALS_KEY);
  }

  get(): LoginCredentials | null {
    return this.credentials();
  }

  header(): string | null {
    const credentials = this.credentials();

    if (!credentials) {
      return null;
    }

    return `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
  }

  private readStored(): LoginCredentials | null {
    const raw = sessionStorage.getItem(CREDENTIALS_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as LoginCredentials;
    } catch {
      sessionStorage.removeItem(CREDENTIALS_KEY);
      return null;
    }
  }
}
