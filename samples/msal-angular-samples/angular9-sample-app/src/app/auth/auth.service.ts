import {
  MSAL_GUARD_CONFIG,
  MsalBroadcastService,
  MsalGuardConfiguration,
  MsalService,
} from '@azure/msal-angular';
import { Inject, Injectable, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { b2cPolicies, checkInTeams } from './auth.config';
import {
  AccountInfo,
  AuthError,
  EventMessage,
  EventType,
  InteractionStatus,
  RedirectRequest,
} from '@azure/msal-browser';
import { filter, take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
// import { ConfigService } from '@vantage-platform/store/lib/services/config.service';
import {
  forgot_password_procedure_started_key,
  LOCAL_STORAGE,
  LOCATION,
  LOGGED_IN_AT,
  PASSWORD_REDIRECT_ERROR_CODE,
  SESSION_DURATION,
  SESSION_STORAGE,
} from './constants';
import { TeamsContextService } from './teams-context.service';
import * as microsoftTeams from '@microsoft/teams-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isIframe = false;
  private _isLoggedIn$ = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn$.pipe(/*distinctUntilChanged()*/);
  private loggedIn = false;

  get isLoggedIn(): boolean {
    return this.loggedIn;
  }

  get user(): AccountInfo {
    return this.msal.instance.getAllAccounts()[0];
  }

  constructor(
    // private configService: ConfigService,
    private msal: MsalService,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private msalBroadcastService: MsalBroadcastService,
    private activatedRoute: ActivatedRoute,
    @Inject(LOCATION) @Optional() private location: Location,
    @Inject(LOCAL_STORAGE) @Optional() private localStorage: Storage,
    @Inject(SESSION_STORAGE) @Optional() private sessionStorage: Storage,
    public ctx: TeamsContextService,
  ) {
    alert('auth service constructor');
    if (!this.location) {
      this.location = window.location;
    }
    if (!this.localStorage) {
      this.localStorage = window.localStorage;
    }
    if (!this.sessionStorage) {
      this.sessionStorage = window.sessionStorage;
    }

    this.isIframe = window !== window.parent && !window.opener;
    this.checkAndSetActiveAccount();

    // Sets login display when using popups
    this.msalBroadcastService.inProgress$
      .pipe(
        filter(
          (status: InteractionStatus) => status === InteractionStatus.None
        ),
        take(1)
      )
      .subscribe(() => {
        // this.checkAccount();
        this.checkAndSetActiveAccount();
      });

    this.msal.instance
      .handleRedirectPromise()
      .then((tokenResponse) => {
        if(checkInTeams()) {
          microsoftTeams.initialize();
          microsoftTeams.authentication.notifySuccess();
        }
        console.log('redirect success: ', tokenResponse);
      })
      .catch((err) => {
        console.error('redirect error: ', err);
      });

    this.msalBroadcastService.msalSubject$
      .pipe(filter((ev) => ev.eventType === EventType.LOGIN_SUCCESS))
      .subscribe((ev) => {
        // We need to reject id tokens that were not issued with the default sign-in policy.
        // "acr" claim in the token tells us what policy is used (NOTE: for new policies (v2.0), use "tfp" instead of "acr")
        // To learn more about b2c tokens, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
        if (
          'idToken' in ev.payload &&
          ev.payload.idTokenClaims['tfp'] !== b2cPolicies.names.signUpSignIn
        ) {
          if (
            ev.payload.idTokenClaims['tfp'].toLowerCase() ===
            b2cPolicies.names.resetPassword.toLowerCase()
          ) {
            if (this.localStorage.getItem(forgot_password_procedure_started_key
) === 'true'
            ) {
              // this.configService.getUser().subscribe();
            }
            this.localStorage.removeItem(forgot_password_procedure_started_key);
          }

          // NOTE: 'Password has been reset successfully. Require sign-in with your new password'
          return this.msal.logout();
        }
        console.log(ev);
        this.localStorage.removeItem(forgot_password_procedure_started_key);
        // this.checkAccount();
        this.checkAndSetActiveAccount();
        this.storeLogoutTimeData();

        this._isLoggedIn$.next(true);
      });

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter(
          (event: EventMessage) =>
            event.eventType === EventType.ACQUIRE_TOKEN_FAILURE
        )
      )
      .subscribe((r) => {
        if (r.error instanceof AuthError) {
          this.logOut();
        }
      });

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter(
          (event: EventMessage) => event.eventType === EventType.LOGIN_FAILURE
        )
      )
      .subscribe((error) => {
        console.error('login failed');
        console.error(error);

        // Check for forgot password error
        // Learn more about AAD error codes at https://docs.microsoft.com/en-us/azure/active-directory-b2c/error-codes
        if (error.error.message.indexOf(PASSWORD_REDIRECT_ERROR_CODE) > -1) {
          this.localStorage.setItem(
            `forgot_password_procedure_started`,
            'true'
          );
          this.login(b2cPolicies.authorities.resetPassword);
        } else if (
        'errorCode' in error.error
        && error.error.errorCode === 'interaction_in_progress'
      ) {
        // this.localStorage.clear();
        // this.sessionStorage.clear();
      }
      });

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter(
          (event: EventMessage) => event.eventType === EventType.LOGOUT_SUCCESS
        )
      )
      .subscribe((ev) => {
        console.log(
          '"loggedInAt" and "sessionDuration" is to be removed from localStorage'
        );

        this.localStorage.removeItem(LOGGED_IN_AT);
        this.localStorage.removeItem(SESSION_DURATION);

      });
  }

  storeLogoutTimeData() {
    this.localStorage.setItem(LOGGED_IN_AT, new Date().getTime().toString());
    const tokenClaims = this.msal.instance.getActiveAccount().idTokenClaims;
    if (tokenClaims && tokenClaims['exp']) {
      console.log('Expiry time to store:', tokenClaims['exp']);
      const notBefore = tokenClaims['nbf'] ?? new Date().getTime() / 1000;
      console.log(
        'id token claim "nbf":',
        tokenClaims['nbf'],
        ', value to store:',
        notBefore
      );
      const sessionDuration = (tokenClaims['exp'] - notBefore) * 1000;
      console.log('session duration to store:', sessionDuration);
      this.localStorage.setItem(SESSION_DURATION, sessionDuration.toString());
    }
  }

  checkAndSetActiveAccount() {
    this.loggedIn = this.msal.instance.getAllAccounts().length > 0;
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    const activeAccount = this.msal.instance.getActiveAccount();

    if (!activeAccount && this.msal.instance.getAllAccounts().length > 0) {
      const accounts = this.msal.instance.getAllAccounts();
      this.msal.instance.setActiveAccount(accounts[0]);
    }
  }

  login(userFlowRequest?: Partial<RedirectRequest>) {
    this.msal.loginRedirect({
      ...(this.msalGuardConfig.authRequest as any),
      ...userFlowRequest,
    });
  }

  public logOut(): void {

    if (window.name == 'embedded-page-container') {
      microsoftTeams.initialize(() => {
        this.ctx.msTeams.authentication.authenticate({
          url: window.location.origin + '/teamsloginmodal?action=logout',
          successCallback: () => {
            window.location.href =
              window.location.origin + '/login?context=teams';
          },
          failureCallback: (error) => {
            window.location.href =
              window.location.origin + '/login?context=teams';

            console.log(error);
          },
        });
      });
    } else {
      this.msal.logoutRedirect({ postLogoutRedirectUri: '/login' });
    }
  }
}
