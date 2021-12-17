import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';

import { AuthService } from './auth.service';
import { Inject, Injectable, Optional } from "@angular/core";
import { Observable, of } from "rxjs";
import { LOCAL_STORAGE, LOGGED_IN_AT, SESSION_DURATION } from "./constants";
import {APIS} from "../../environments/environment";

/** Temporary leave this CLASS as MsalInterceptor to avoid conflicts. */
@Injectable()
export class MsalInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    @Inject(LOCAL_STORAGE) @Optional() private localStorage: Storage,
    ) {
    if (!this.localStorage) {
      this.localStorage = window.localStorage;
    }
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const sessionDuration = this.localStorage.getItem(SESSION_DURATION),
      loggedInAt = this.localStorage.getItem(LOGGED_IN_AT),
      parsedSessionDuration = parseInt(sessionDuration),
      parsedLoggedInAt = parseInt(loggedInAt);

    if (
      !isNaN(parsedSessionDuration) &&
      !isNaN(parsedLoggedInAt) &&
      (new Date()).getTime() >= (parsedLoggedInAt + parsedSessionDuration)
    ) {
      this.auth.logOut();
      return of();
    }

    const reqApi = APIS.find((i) => req.url.includes(i.url));
    const header = {};

    if (reqApi && reqApi['key']) {
      header['Ocp-Apim-Subscription-Key'] = reqApi['key'];
    }

    const requestClone = req.clone({
      setHeaders: header,
    });
    return next.handle(requestClone);
  }
}
