import { Component, OnInit } from '@angular/core';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import {Logger, CryptoUtils, AuthenticationParameters, InteractionRequiredAuthError, ClientAuthError} from 'msal';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'MSAL - Angular 9 Sample App';
  isIframe = false;
  loggedIn = false;
  apiReqResult: unknown;

  constructor(
    private broadcastService: BroadcastService,
    private authService: MsalService,
    private http: HttpClient,
    ) { }

  ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener;

    this.checkoutAccount();

    this.broadcastService.subscribe('msal:loginSuccess', () => {
      this.checkoutAccount();
    });

    this.broadcastService.subscribe(
      'msal:acquireTokenFailure',
      (r: InteractionRequiredAuthError | ClientAuthError) => {/*debugger*/
        if (
          r instanceof InteractionRequiredAuthError ||
          r instanceof ClientAuthError
        ) {
          this.authService.logout();
        }
      }
    )


    this.authService.handleRedirectCallback((authError, response) => {
      if (authError) {
        console.error('Redirect Error: ', authError.errorMessage);
        return;
      }

      console.log('Redirect Success: ', response);

      /*this.authService.acquireTokenRedirect({
        scopes: [
          "openid",
          "profile"
        ],
        clientId: 'a21036de-755c-4895-83d7-f331c9a19e5a',
        authority: 'https://OrganizationAADB2C1.b2clogin.com/OrganizationAADB2C1.onmicrosoft.com/B2C_1_SI',
        redirectUri: "http://localhost:4200",
        postLogoutRedirectUri: "http://localhost:4200",
        navigateToLoginRequestUrl: false,
        validateAuthority: false,
        account: this.authService.getAccount(),
        forceRefresh: true,

      } as AuthenticationParameters)*//*.then(res => {
        debugger
      }, err => {
        debugger
      })*/

    });



    this.authService.setLogger(new Logger((logLevel, message, piiEnabled) => {
      console.log('MSAL Logging: ', message);
    }, {
      correlationId: CryptoUtils.createNewGuid(),
      piiLoggingEnabled: false
    }));


    this.http.get('http://localhost:5000/hello').subscribe(res => {
      this.apiReqResult = res;
    })
  }

  checkoutAccount() {
    this.loggedIn = !!this.authService.getAccount();
  }

  login() {
    const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

      this.authService.loginRedirect();
    // if (isIE) {
    //   this.authService.loginRedirect();
    // } else {
    //   this.authService.loginPopup();
    // }
  }

  logout() {
    this.authService.logout();
  }
}
