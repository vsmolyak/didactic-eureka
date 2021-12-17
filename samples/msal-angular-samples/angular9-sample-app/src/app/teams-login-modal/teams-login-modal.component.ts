import * as microsoftTeams from '@microsoft/teams-js';
import { Component, OnInit } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import {TeamsContextService} from '../services/teams-context.service';
import {TEAMS_SIGNIN_MODAL} from '../utils';
import {AuthService} from '../auth/auth.service';

@Component({
  selector: 'vp-teams-login-modal',
  templateUrl: './teams-login-modal.component.html',
  styleUrls: ['./teams-login-modal.component.scss'],
})
export class TeamsLoginModalComponent implements OnInit {
  get isLoggedIn() {
    return this.msal.instance.getActiveAccount();
  }

  constructor(
    private auth: AuthService,
    private msal: MsalService,
    private msalBroadcast: MsalBroadcastService,
    public ctx: TeamsContextService
  ) {}

  ngOnInit() {
    window.name = TEAMS_SIGNIN_MODAL;
    if (
      window.location.search.indexOf('action=logout') > -1 &&
      this.msal.instance.getActiveAccount()
    ) {
      this.msal
        .logout({
          onRedirectNavigate: (url) => {
            console.log(url);
            return false;
          },
        })
        .toPromise()
        .then(() => {
          microsoftTeams.authentication.notifySuccess();
        });
    } else if (window.location.search.indexOf('action=logoutredirect') > -1) {
      microsoftTeams.authentication.notifySuccess();
    } else if (this.msal.instance.getActiveAccount()) {debugger;
      this.handleSignedIn();
    } else {debugger;
      // this.msal.loginRedirect();
      this.auth.login();
    }
  }

  private handleSignedIn(response?) {
    microsoftTeams.initialize();
    microsoftTeams.authentication.notifySuccess();
  }

  private handleSignedOut(error) {
    microsoftTeams.initialize();
    microsoftTeams.authentication.notifyFailure(error);
  }
}
