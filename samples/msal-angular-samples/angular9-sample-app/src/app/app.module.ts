import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';

import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ProfileComponent} from './profile/profile.component';
import {InteractionType, IPublicClientApplication, PublicClientApplication, LogLevel} from '@azure/msal-browser';
import {
  MsalModule,
  MsalInterceptor,
  MsalService,
  MSAL_INSTANCE,
  MsalBroadcastService,
  MsalGuard,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalInterceptorConfiguration,
  MsalGuardConfiguration,
} from '@azure/msal-angular';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {HomeComponent} from './home/home.component';
import {aad_access_scopes, b2cPolicies, environment, loginRequest, tokenRequest} from '../environments/environment';
import {checkInTeams} from "./utils";
import {LoginComponent} from "./login/login.component";
import {TeamsLoginModalComponent} from "./teams-login-modal/teams-login-modal.component";

// export const protectedResourceMap: [string, string[]][] = [
//   ['http://localhost:5000/hello', ['https://OrganizationAADB2C1.onmicrosoft.com/api/demo.read']]
// ];

export const CARDS_API = {
  url: 'https://vantage-dev.azure-api.net/vantage/boards/v4/',
  key: 'e583acd16f97406e97de9bae1f877f34',
};

export const DATA_API = {
  url: 'https://vantage-dev.azure-api.net/data/v1/',
  key: 'e6b62958232f438d80c282507562210d',
};

export const DATA_API_V4 = {
  url: 'https://vantage-dev.azure-api.net/data/v4/',
};

export const CONFIG_API = {
  url: 'https://vantage-dev.azure-api.net/vantage/config/v1/',
};

export const PROFILES_API = {
  url: 'https://vantage-dev.azure-api.net/vantage/profiles/v1/',
};

export const SI_STAGING_API = {
  url: 'https://vantage-dev.azure-api.net/staging/v1/',
};

export const SI_DATA_UPLOAD_API = {
  url: 'https://vantage-dev.azure-api.net/si/storage/v1/',
};

export const APIS = [
  CARDS_API,
  DATA_API,
  DATA_API_V4,
  CONFIG_API,
  SI_STAGING_API,
  SI_DATA_UPLOAD_API,
  PROFILES_API,
];

export const protectedResourceMap: [string, string[]][] = [
  [CARDS_API.url, aad_access_scopes],
  [DATA_API.url, aad_access_scopes],
  [DATA_API_V4.url, aad_access_scopes],
  [CONFIG_API.url, aad_access_scopes],
  // [SI_STAGING_API.url, aad_si_staging_scope],
  // [SI_DATA_UPLOAD_API.url, aad_si_dataupload_scope],
  // [PROFILES_API.url, aad_profiles_scopes],
];


const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      // clientId: 'a21036de-755c-4895-83d7-f331c9a19e5a',
      //  authority: 'https://OrganizationAADB2C1.b2clogin.com/OrganizationAADB2C1.onmicrosoft.com/B2C_1_SI',
      // redirectUri: 'http://localhost:4200',
      // postLogoutRedirectUri: 'http://localhost:4200',
      // knownAuthorities: ['OrganizationAADB2C1.b2clogin.com']
      clientId: environment.aad_config.clientId,
      authority: b2cPolicies.authorities.signUpSignIn.authority,
      knownAuthorities: ['https://vantageaadb2cdev.b2clogin.com'],
      redirectUri: environment.aad_config.redirectUri,
      postLogoutRedirectUri: environment.aad_config.postLogoutRedirectUri,
      navigateToLoginRequestUrl: checkInTeams(),
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: isIE, // set to true for IE 11
    },
    system: {
      loggerOptions: {
        loggerCallback: function loggerCallback(logLevel: LogLevel, message: string) {
          console.log(message);
        },
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false,
      }
    }
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMapConfig = new Map<string, Array<string>>(protectedResourceMap);
  console.log(protectedResourceMapConfig);
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: protectedResourceMapConfig,
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [...loginRequest.scopes, ...tokenRequest.scopes],
    },
  };
}

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    HomeComponent,
    LoginComponent,
    TeamsLoginModalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatToolbarModule,
    MatButtonModule,
    MatListModule,
    MsalModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
  ],
  bootstrap: [AppComponent, /*MsalRedirectComponent*/]
})
export class AppModule {
}
