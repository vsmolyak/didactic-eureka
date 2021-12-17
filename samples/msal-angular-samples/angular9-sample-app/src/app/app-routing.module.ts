import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import {MsalGuard, MsalRedirectComponent} from '@azure/msal-angular';
import { HomeComponent } from './home/home.component';
import {LoginComponent} from './login/login.component';
import {TeamsLoginModalComponent} from './teams-login-modal/teams-login-modal.component';
import {BrowserUtils} from '@azure/msal-browser';

const routes: Routes = [
  {
    path: 'login',
    pathMatch: 'full',
    component: LoginComponent,
  },
  {
    path: 'teamsloginmodal',
    pathMatch: 'full',
    component: TeamsLoginModalComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [
      MsalGuard
    ]
  },
  // {
  //   /**
  //    * Needed for login on page load for PathLocationStrategy.
  //    * See FAQ for details:
  //    * https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-angular/docs/FAQ.md
  //    */
  //   path: 'auth',
  //   component: MsalRedirectComponent
  // },
  {
    path: '',
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false,
    // initialNavigation: "enabled",
    // initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup()
    //   ? 'enabled' : 'disabled' // Don't perform initial navigation in iframes
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
