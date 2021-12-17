import { Component, OnInit } from '@angular/core';

import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  template: ''
})
export class MsalComponent implements OnInit {
  constructor(private Msal: MsalService) {}

  ngOnInit() {}
}
