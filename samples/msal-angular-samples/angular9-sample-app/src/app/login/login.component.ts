// import { AuthService, isTeamsApp } from '@vantage-platform/auth';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';

import {
  MSAL_GUARD_CONFIG,
  MsalBroadcastService,
  MsalGuardConfiguration,
  MsalService,
} from '@azure/msal-angular';
import { Router } from '@angular/router';
import {TeamsContextService} from '../services/teams-context.service';
import { EventType, InteractionStatus } from '@azure/msal-browser';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {isTeamsApp} from "../utils";
import {AuthService} from "../auth/auth.service";

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();
  get isLoggedIn() {
    // return this.msal.instance.getActiveAccount();
    return this.auth.isLoggedIn;
  }

  constructor(
    public auth: AuthService,
    private msal: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private router: Router,
    public ctx: TeamsContextService
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn) {
      // fix redirection to default page
      // will be changed soon
      // window.location.pathname = '/';
      this.routeAfterLogIn();
    } else {
      this.msalBroadcastService.inProgress$
        .pipe(
          filter((s) => s === InteractionStatus.None),
          take(1),
          takeUntil(this.destroy$),
          takeUntil(
            this.msalBroadcastService.msalSubject$.pipe(
              filter((ev) => ev.eventType === EventType.LOGIN_START)
            )
          )
        )
        .subscribe((s) => {
          if (!this.auth.isLoggedIn) {
            if (
              this.msal.instance.getAllAccounts().length < 1 &&
              !isTeamsApp()
            ) {
              // this.msal.loginRedirect();
              this.auth.login();
            }
            // this.auth.login(b2cPolicies.authorities.resetPassword);
          } else {
            this.routeAfterLogIn();
          }
        });
    }
  }
  logInFromTeams() {
    this.ctx.msTeams.authentication.authenticate({
      url: window.location.origin + '/teamsloginmodal',
      width: 920,
      height: 390,
      successCallback: () => this.routeAfterLogIn(),
      failureCallback: (error) => {
        console.log(error);
      },
    });
  }

  private routeAfterLogIn = async () => {
    let path =
      localStorage.getItem('post_login_request_url') ||
      window.location.origin + '/';
    localStorage.removeItem('post_login_request_url');
    if (isTeamsApp()) {
      let teamsContext = await this.ctx.getTeamsContext();
      if (teamsContext.subEntityId) {
        console.log(
          '%c LoginComponent - subEntityId:',
          'background: #222; color: #bada55'
        );
        console.log(teamsContext.subEntityId);
        debugger
        window.location.href =
          window.location.origin +
          teamsContext.subEntityId.split(';').join('&'); // temporary fix - VF-4417 - issue related to the validation for focus board guard - which is cause extra redirect
        // this.router.navigateByUrl(
        //   teamsContext.subEntityId.split(';').join('&')
        // );
      } else window.location.pathname = '/';
      // });
    } else window.location.href = path;
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
