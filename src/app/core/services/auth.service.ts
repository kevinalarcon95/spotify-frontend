import { HttpClient, HttpContext } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_AUTH_REDIRECT } from '../interceptors/auth.context';
import { LoginCredentials } from '../../shared/models/credentials.model';
import { User } from '../../shared/models/user.model';

const CREDENTIALS_KEY = 'spotify.auth.credentials';
const USER_KEY = 'spotify.auth.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly credentials = signal<LoginCredentials | null>(null);

  readonly user = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.credentials() !== null);

  constructor() {
    this.restoreSession();
  }

  authorizationHeader(): string | null {
    const credentials = this.credentials();

    if (!credentials) {
      return null;
    }

    return `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
  }

  login(credentials: LoginCredentials): Observable<User> {
    return this.http
      .get<User>(`${environment.apiUrl}/auth/me`, {
        headers: { Authorization: this.toBasicHeader(credentials) },
        context: new HttpContext().set(SKIP_AUTH_REDIRECT, true),
      })
      .pipe(
        map((user) => user ?? { username: credentials.username }),
        tap((user) => this.persistSession(credentials, user)),
      );
  }

  logout(): void {
    sessionStorage.removeItem(CREDENTIALS_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.credentials.set(null);
    this.user.set(null);
  }

  private toBasicHeader(credentials: LoginCredentials): string {
    return `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
  }

  private persistSession(credentials: LoginCredentials, user: User): void {
    sessionStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    this.credentials.set(credentials);
    this.user.set(user);
  }

  private restoreSession(): void {
    const rawCredentials = sessionStorage.getItem(CREDENTIALS_KEY);
    const rawUser = sessionStorage.getItem(USER_KEY);

    if (!rawCredentials || !rawUser) {
      return;
    }

    try {
      this.credentials.set(JSON.parse(rawCredentials) as LoginCredentials);
      this.user.set(JSON.parse(rawUser) as User);
    } catch {
      this.logout();
    }
  }
}
