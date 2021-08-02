import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService} from '@azure/msal-angular';
// import {Logger, CryptoUtils, AuthenticationParameters, InteractionRequiredAuthError, ClientAuthError} from 'msal';
import {HttpClient} from "@angular/common/http";
import {
  AuthenticationResult,
  EventMessage,
  EventType,
  InteractionRequiredAuthError,
  InteractionStatus,
  RedirectRequest
} from "@azure/msal-browser";
import {filter, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'MSAL - Angular 9 Sample App';
  isIframe = false;
  loggedIn = false;
  apiReqResult: unknown;
  loginDisplay: boolean;
  // tslint:disable-next-line:variable-name
  private readonly _destroying$ = new Subject<void>();

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private msalBroadcastService: MsalBroadcastService,
    private authService: MsalService,
    private http: HttpClient,
  ) {
  }

  ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener;

    // this.setLoginDisplay();
    // this.apiCall();
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
        this.checkAndSetActiveAccount();
        this.apiCall();
      });

    this.msalBroadcastService.msalSubject$.pipe(
      filter((event: EventMessage) => event.eventType === EventType.ACQUIRE_TOKEN_FAILURE
        || event.eventType === EventType.LOGIN_FAILURE
        || event.eventType === EventType.SSO_SILENT_FAILURE),
    ).subscribe((r) => {/*debugger*/
        if (
          r instanceof InteractionRequiredAuthError
          // TODO: check if need to upgrade this check
          // || r instanceof ClientAuthError
        ) {
          this.authService.logout();
        }
      }
    );

    this.authService.instance.handleRedirectPromise().then(tokenResponse => {
      let accountObj = null;
      if (tokenResponse !== null) {
        accountObj = tokenResponse.account;
        const id_token = tokenResponse.idToken;
        const access_token = tokenResponse.accessToken;
      } else {
        const currentAccounts = this.authService.instance.getAllAccounts();
        if (!currentAccounts || currentAccounts.length === 0) {
          // No user signed in
          return;
        } else if (currentAccounts.length > 1) {
          // More than one user signed in, find desired user with getAccountByUsername(username)
        } else {
          accountObj = currentAccounts[0];
        }
      }

      const username = accountObj.username;
    })
      .catch(error => {});

    // this.authService.handleRedirectObservable()
    //   .pipe(
    //     // filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS || msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS),
    //     takeUntil(this._destroying$)
    //   ).subscribe((result: AuthenticationResult) => {
    //
    //   console.log('Redirect Success: ', result);
    //
    //   /*this.authService.acquireTokenRedirect({
    //     scopes: [
    //       "openid",
    //       "profile"
    //     ],
    //     clientId: 'a21036de-755c-4895-83d7-f331c9a19e5a',
    //     authority: 'https://OrganizationAADB2C1.b2clogin.com/OrganizationAADB2C1.onmicrosoft.com/B2C_1_SI',
    //     redirectUri: "http://localhost:4200",
    //     postLogoutRedirectUri: "http://localhost:4200",
    //     navigateToLoginRequestUrl: false,
    //     validateAuthority: false,
    //     account: this.authService.getAccount(),
    //     forceRefresh: true,
    //
    //   } as AuthenticationParameters)*//*.then(res => {
    //     debugger
    //   }, err => {
    //     debugger
    //   })*/
    //
    // }, (err) => {
    //   // if (result.) {
    //     console.error('Redirect Error: ', err.message);
    //     return;
    //   // }
    // });
  }

  login(userFlowRequest?: RedirectRequest) {
    const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

    this.authService.loginRedirect();
    // if (isIE) {
    //   this.authService.loginRedirect();
    // } else {
    //   this.authService.loginPopup();
    // }
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginRedirect({...this.msalGuardConfig.authRequest, ...userFlowRequest} as RedirectRequest);
    } else {
      this.authService.loginRedirect(userFlowRequest);
    }
  }

  logout() {
    this.authService.logout();
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  apiCall() {
    this.http.get('http://localhost:5000/hello').subscribe(res => {
      this.apiReqResult = res;
    });

  }

  checkAndSetActiveAccount() {
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    const activeAccount = this.authService.instance.getActiveAccount();

    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      const accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

}
