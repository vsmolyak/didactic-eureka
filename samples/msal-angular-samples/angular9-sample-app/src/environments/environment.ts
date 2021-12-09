// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// tslint:disable-next-line:variable-name
export const aad_access_scopes = [
  'https://VantageAadB2cDev.onmicrosoft.com/card-service/user_impersonation',
];

export const environment = {
  production: false,
  aad_config: {
    clientId: 'ad9581d9-acdb-4c10-aa73-2093f418f39c',
    authority:
      'https://vantageaadb2cdev.b2clogin.com/tfp/vantageaadb2cdev.onmicrosoft.com/B2C_1_SI',
    // 'https://vantageaadb2cdev.b2clogin.com/vantageaadb2cdev.onmicrosoft.com/B2C_1_SI',
    // redirectUri: 'http://localhost:4200/login',
    // postLogoutRedirectUri: 'http://localhost:4200/login',
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    password_authority:
      'https://vantageaadb2cdev.b2clogin.com/tfp/vantageaadb2cdev.onmicrosoft.com/b2c_1_pwreset/',
    // 'https://vantageaadb2cdev.b2clogin.com/vantageaadb2cdev.onmicrosoft.com/b2c_1_pwreset/',
    access_scopes: aad_access_scopes,
    policies: {
      signUpSignIn: 'B2C_1_SI' as const,
      resetPassword: 'b2c_1_pwreset' as const,
    },
  }
};

export const b2cPolicies = {
  names: environment.aad_config.policies,
  authorities: {
    signUpSignIn: {
      authority: environment.aad_config.authority,
    },
    resetPassword: {
      authority: environment.aad_config.password_authority,
    },
  },
};

/**
 * Scopes you enter here will be consented once you authenticate. For a full list of available authentication parameters,
 * visit https://azuread.github.io/microsoft-authentication-library-for-js/docs/msal/modules/_authenticationparameters_.html
 */
export const loginRequest: { scopes: string[] } = {
  scopes: ['openid', 'profile'],
};

// Scopes you enter will be used for the access token request for your web API
export const tokenRequest: { scopes: string[] } = {
  scopes: environment.aad_config.access_scopes, // i.e. [https://fabrikamb2c.onmicrosoft.com/helloapi/demo.read]
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
