import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_AUTH_REDIRECT } from '../interceptors/auth.context';
import { LoginCredentials } from '../../shared/models/credentials.model';
import { User } from '../../shared/models/user.model';
import { AuthStore } from './auth.store';

const USER_KEY = 'spotify.auth.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(AuthStore);

  readonly user = signal<User | null>(this.readStoredUser());
  readonly isAuthenticated = computed(() => this.store.get() !== null);

  login(credentials: LoginCredentials): Observable<User> {
    const user: User = { username: credentials.username };
    this.store.set(credentials);

    return this.http
      .get<unknown>(`${environment.apiUrl}/lists`, {
        headers: new HttpHeaders({
          Authorization: this.store.header() ?? '',
        }),
        context: new HttpContext().set(SKIP_AUTH_REDIRECT, true),
      })
      .pipe(
        map(() => user),
        tap(() => this.persistUser(user)),
        catchError((error) => {
          this.logout();
          return throwError(() => error);
        }),
      );
  }

  logout(): void {
    sessionStorage.removeItem(USER_KEY);
    this.store.set(null);
    this.user.set(null);
  }

  private persistUser(user: User): void {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    this.user.set(user);
  }

  private readStoredUser(): User | null {
    const raw = sessionStorage.getItem(USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      sessionStorage.removeItem(USER_KEY);
      return null;
    }
  }
}
