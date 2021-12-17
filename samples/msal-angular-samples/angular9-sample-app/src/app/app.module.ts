import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ApplicationRef, NgModule} from '@angular/core';

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
  MsalRedirectComponent,
} from '@azure/msal-angular';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {HomeComponent} from './home/home.component';
import {aad_access_scopes, b2cPolicies, environment, loginRequest, tokenRequest} from '../environments/environment';
import {checkInTeams, isIframe} from "./utils";
import {LoginComponent} from "./login/login.component";
import {TeamsLoginModalComponent} from "./teams-login-modal/teams-login-modal.component";
import {AuthModule} from "./auth/auth.module";
import {
  isTeamsApp,
  MSALGuardConfigFactory,
  MSALInstanceFactory,
  MSALInterceptorConfigFactory
} from "./auth/auth.config";
import { MsalComponent } from './msal.component';
import {APP_BASE_HREF} from "@angular/common";

// export const protectedResourceMap: [string, string[]][] = [
//   ['http://localhost:5000/hello', ['https://OrganizationAADB2C1.onmicrosoft.com/api/demo.read']]
// ];

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    HomeComponent,
    LoginComponent,
    TeamsLoginModalComponent,
    MsalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatToolbarModule,
    MatButtonModule,
    MatListModule,
    // MsalModule,
    AuthModule.forRoot(),
  ],
  exports: [MsalComponent],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: MsalInterceptor,
    //   multi: true
    // },
    // {
    //   provide: MSAL_INSTANCE,
    //   useFactory: MSALInstanceFactory
    // },
    // {
    //   provide: MSAL_GUARD_CONFIG,
    //   useFactory: MSALGuardConfigFactory
    // },
    // {
    //   provide: MSAL_INTERCEPTOR_CONFIG,
    //   useFactory: MSALInterceptorConfigFactory
    // },
    // MsalService,
    // MsalGuard,
    // MsalBroadcastService,
  ],
  // bootstrap: [AppComponent, MsalRedirectComponent]
  entryComponents: [AppComponent, MsalComponent],
})
export class AppModule {
  ngDoBootstrap(ref: ApplicationRef) {
    // Validate if app opened inside Iframe to prevent MSAL errors
    // validate if teams app - should run inside iframe
    if (isIframe() && !isTeamsApp()) {
      console.log('Bootstrap: MSAL');
      ref.bootstrap(MsalComponent);
    } else {
      console.log('Bootstrap: App');
      ref.bootstrap(AppComponent);
    }
  }

}
