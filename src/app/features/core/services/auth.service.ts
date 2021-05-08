import {Injectable} from '@angular/core';
import {User} from '../models/user.model';
import {UserService} from './user.service';
import {LoginRequest} from '../models/login-request.model';
import {tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {NewUser} from '../models/new-user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: User | undefined;

  constructor(
    private readonly userService: UserService,
  ) {
  }

  login(loginRequest: LoginRequest): Observable<User | undefined> {
    return this.userService.login(loginRequest).pipe(
      tap(u => this.setUser(u))
    );
  }

  register(newUser: NewUser): Observable<User | undefined> {
    return this.userService.register(newUser).pipe(
      tap(u => this.setUser(u))
    );
  }

  logout(): void {
    localStorage.removeItem('userId');
  }

  setUser(user: User): void {
    localStorage.setItem('userId', String(user.userId));
  }

  getUser(): Observable<User | undefined> {
    const userId = +localStorage.getItem('userId');
    if (userId) {
      return this.userService.getUser(userId);
    }
    return undefined;
  }
}
