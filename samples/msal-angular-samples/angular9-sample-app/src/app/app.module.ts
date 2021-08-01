import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProfileComponent } from './profile/profile.component';

import {
  MsalModule,
  MsalInterceptor,
  MSAL_CONFIG,
  MSAL_CONFIG_ANGULAR,
  MsalService,
  MsalAngularConfiguration
} from '@azure/msal-angular';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { Configuration } from 'msal';

export const protectedResourceMap: [string, string[]][] = [
  // // ['https://graph.microsoft.com/v1.0/me', ['user.read']],
  // ['https://graph.microsoft.com/v1.0/me', ['https://OrganizationAADB2C1.onmicrosoft.com/a21036de-755c-4895-83d7-f331c9a19e5a/user.read']],
  // // ['https://graph.microsoft.com/v1.0/me', ['https://graph.microsoft.com/User.Read.All']]
  ['http://localhost:5000/hello', ['https://OrganizationAADB2C1.onmicrosoft.com/api/demo.read']]
];

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

function MSALConfigFactory(): Configuration {
  return {
    auth: {
      /*clientId: '6226576d-37e9-49eb-b201-ec1eeb0029b6',
      authority: "https://login.microsoftonline.com/common/",
      validateAuthority: true,
      redirectUri: "http://localhost:4200/",
      postLogoutRedirectUri: "http://localhost:4200/",
      navigateToLoginRequestUrl: true,*/
      clientId: 'a21036de-755c-4895-83d7-f331c9a19e5a',
      // authority: 'https://login.microsoftonline.com/895e1921-d61e-424d-982a-634114f99646',
      // authority: 'https://login.microsoftonline.com/895e1921-d61e-424d-982a-634114f99646',
      authority: 'https://OrganizationAADB2C1.b2clogin.com/tfp/OrganizationAADB2C1.onmicrosoft.com/B2C_1_SI',
      // authority: 'https://ImplicitFlowMigrationAADB2C.b2clogin.com/tfp/lockrock952gmail.onmicrosoft.com/B2C_1_SI',
      // authority: 'https://lockrock952gmail.b2clogin.com/tfp/lockrock952gmail.onmicrosoft.com/B2C_1_SI',
      // authority: 'https://lockrock952gmail.onmicrosoft.com/tfp/lockrock952gmail.onmicrosoft.com/B2C_1_SI',
      redirectUri: "http://localhost:4200",
      postLogoutRedirectUri: "http://localhost:4200",
      navigateToLoginRequestUrl: true,
      validateAuthority: false,
/*
      clientId: '822c4fbf-e60e-45a8-98c0-f88197f2643d',
      authority:
        'https://login.microsoftonline.com/96332844-4275-435a-8218-841a471e729f/',
      redirectUri: 'http://localhost:4200',
      postLogoutRedirectUri: 'http://localhost:4200',
      navigateToLoginRequestUrl: false,
      validateAuthority: false,

      // policies: {
      //   signUpSignIn: 'B2C_1_SI' as const,
      //   resetPassword: 'b2c_1_pwreset' as const,
      // },*/
    } as Configuration['auth'],
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: isIE, // set to true for IE 11
    },
/*
    framework: {
      isAngular:true,
      unprotectedResources: [],
      protectedResourceMap: new Map(protectedResourceMap),
    }
*/
  };
}

function MSALAngularConfigFactory(): MsalAngularConfiguration {
  return {
    popUp: false /*!isIE*/,
    consentScopes: [
      // 'https://graph.microsoft.com/User.Read.All',
      // "user.read",
      // 'https://OrganizationAADB2C1.onmicrosoft.com/a21036de-755c-4895-83d7-f331c9a19e5a/user.read',
      "openid",
      "profile",
      // "api://43600910-c62b-4d1a-bcf9-172eac054ffe/access_as_user"
      // "api://0e290e14-ccf9-4510-818d-0f355f111257/access_as_user"
    ],
    unprotectedResources: ["https://www.microsoft.com/en-us/"],
    protectedResourceMap,
    extraQueryParameters: {}
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
      provide: MSAL_CONFIG,
      useFactory: MSALConfigFactory
    },
    {
      provide: MSAL_CONFIG_ANGULAR,
      useFactory: MSALAngularConfigFactory
    },
    MsalService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
