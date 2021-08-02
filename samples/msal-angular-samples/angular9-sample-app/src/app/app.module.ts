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
  MsalGuardConfiguration
} from '@azure/msal-angular';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {HomeComponent} from './home/home.component';

export const protectedResourceMap: [string, string[]][] = [
  ['http://localhost:5000/hello', ['https://OrganizationAADB2C1.onmicrosoft.com/api/demo.read']]
];

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: 'a21036de-755c-4895-83d7-f331c9a19e5a',
       authority: 'https://OrganizationAADB2C1.b2clogin.com/OrganizationAADB2C1.onmicrosoft.com/B2C_1_SI',
      redirectUri: 'http://localhost:4200',
      postLogoutRedirectUri: 'http://localhost:4200',
      knownAuthorities: ['OrganizationAADB2C1.b2clogin.com']
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
      scopes: ['https://OrganizationAADB2C1.onmicrosoft.com/api/demo.read'],
    },
  };
}

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatToolbarModule,
    MatButtonModule,
    MatListModule,
    AppRoutingModule,
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
    MsalService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
