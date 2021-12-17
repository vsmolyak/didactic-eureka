import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot, UrlTree
} from "@angular/router";
import { MsalBroadcastService, MsalGuard, MsalService } from '@azure/msal-angular';
import { Location, PlatformLocation } from '@angular/common';
import { MSALGuardConfigFactory } from './auth.config';

import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard extends MsalGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    msalService: MsalService,
    router: Router,
    activatedRoute: ActivatedRoute,
    location: Location,
    platformLocation: PlatformLocation,
    broadcastService: MsalBroadcastService
  ) {
    super(
      MSALGuardConfigFactory(),
      broadcastService,
      msalService,
      location,
      router,
    );
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    if (!this.auth.isLoggedIn && location.pathname.length > 1) {
      localStorage.setItem('post_login_request_url', location.href);
    }
    return super.canActivate(route, state);
  }
}
