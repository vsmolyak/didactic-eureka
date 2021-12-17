import * as microsoftTeams from '@microsoft/teams-js';

import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TeamsContextService {
  private _msTeams;
  private _context: microsoftTeams.Context;
  private _msTeamsInitialized: boolean;

  get msTeams() {
    return this._msTeamsInitialized ? this._msTeams : null;
  }

  get context() {
    return this._context;
  }

  get isTeamsTab() {
    // tslint:disable-next-line: no-bitwise
    return typeof this._context !== 'undefined';
  }

  public async getTeamsContext(): Promise<microsoftTeams.Context> {
    if (this._context) {
      console.log(
        '%c TeamsContextService - ALREADY ',
        'background: #222; color: red'
      );
      return new Promise<microsoftTeams.Context>((res) => {
        res(this._context);
      });
    } else {
      return new Promise<microsoftTeams.Context>((res) => {
        this._msTeams.getContext((context) => {
          console.log(
            '%c TeamsContextService - GETTING ',
            'background: #222; color: red'
          );
          this._context = context;
          res(this._context);
        });
      });
    }
  }

  constructor() {
    this._msTeamsInitialized = false;
    this._msTeams = microsoftTeams;

    microsoftTeams.initialize(() => {
      this._msTeamsInitialized = true;
    });
    microsoftTeams.getContext((context) => {
      this._context = context;
    });
  }
}
