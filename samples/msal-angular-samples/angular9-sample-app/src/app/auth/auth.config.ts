import * as microsoftTeams from '@microsoft/teams-js';

// import {
//   CARDS_API,
//   CONFIG_API,
//   DATA_API,
//   DATA_API_V4,
//   PROFILES_API,
//   SI_DATA_UPLOAD_API,
//   SI_STAGING_API,
//   aad_access_scopes,
//   aad_profiles_scopes,
//   aad_si_dataupload_scope,
//   aad_si_staging_scope,
//   environment,
// } from 'apps/vantage-focus/src/environments/environment';
import {
  IPublicClientApplication,
  InteractionType,
  LogLevel,
  PublicClientApplication,
} from '@azure/msal-browser';
import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
} from '@azure/msal-angular';
import {
  aad_access_scopes,
  CARDS_API,
  CONFIG_API,
  DATA_API,
  DATA_API_V4,
  environment
} from 'src/environments/environment';

// export const protectedResourceMap: [string, string[]][] = [
//   [CARDS_API.url, aad_access_scopes],
//   [DATA_API.url, aad_access_scopes],
//   [DATA_API_V4.url, aad_access_scopes],
//   [CONFIG_API.url, aad_access_scopes],
//   // [SI_STAGING_API.url, aad_si_staging_scope],
//   // [SI_DATA_UPLOAD_API.url, aad_si_dataupload_scope],
//   // [PROFILES_API.url, aad_profiles_scopes],
// ];
//
//
// const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;
//
// function MSALInstanceFactory(): IPublicClientApplication {
//   return new PublicClientApplication({
//     auth: {
//       // clientId: 'a21036de-755c-4895-83d7-f331c9a19e5a',
//       //  authority: 'https://OrganizationAADB2C1.b2clogin.com/OrganizationAADB2C1.onmicrosoft.com/B2C_1_SI',
//       // redirectUri: 'http://localhost:4200',
//       // postLogoutRedirectUri: 'http://localhost:4200',
//       // knownAuthorities: ['OrganizationAADB2C1.b2clogin.com']
//       clientId: environment.aad_config.clientId,
//       authority: b2cPolicies.authorities.signUpSignIn.authority,
//       knownAuthorities: ['https://vantageaadb2cdev.b2clogin.com'],
//       redirectUri: environment.aad_config.redirectUri,
//       postLogoutRedirectUri: environment.aad_config.postLogoutRedirectUri,
//       navigateToLoginRequestUrl: checkInTeams(),
//     },
//     cache: {
//       cacheLocation: 'localStorage',
//       storeAuthStateInCookie: isIE, // set to true for IE 11
//     },
//     system: {
//       loggerOptions: {
//         loggerCallback: function loggerCallback(logLevel: LogLevel, message: string) {
//           console.log(message);
//         },
//         logLevel: LogLevel.Info,
//         piiLoggingEnabled: false,
//       }
//     }
//   });
// }
//
// export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
//   const protectedResourceMapConfig = new Map<string, Array<string>>(protectedResourceMap);
//   console.log(protectedResourceMapConfig);
//   return {
//     interactionType: InteractionType.Redirect,
//     protectedResourceMap: protectedResourceMapConfig,
//   };
// }
//
// export function MSALGuardConfigFactory(): MsalGuardConfiguration {
//   return {
//     interactionType: InteractionType.Redirect,
//     authRequest: {
//       scopes: [...loginRequest.scopes, ...tokenRequest.scopes],
//     },
//   };
// }


export const TEAMS_SIGNIN_MODAL = 'teams-login-modal';

// this checks if the app is running on IE
export const isIE =
  window.navigator.userAgent.indexOf('MSIE ') > -1 ||
  window.navigator.userAgent.indexOf('Trident/') > -1;

// this checks if the app is running within Microsoft Teams
export const isTeamsApp = () => {
  return (
    window.location.search.indexOf('context=teams') > -1 ||
    window.location.pathname.indexOf('teamsconfigtab') > -1 ||
    window.location.pathname.indexOf('teamsremovetab') > -1
  );
};

export const checkInTeams = (): boolean => {
  // eslint-disable-next-line dot-notation
  const microsoftTeamsLib = microsoftTeams || window['microsoftTeams'];

  if (!microsoftTeamsLib) {
    return false; // the Microsoft Teams library is for some reason not loaded
  }

  if (
    (window.parent === window.self && (window as any).nativeInterface) ||
    window.name === 'embedded-page-container' ||
    window.name === 'extension-tab-frame' ||
    window.name === TEAMS_SIGNIN_MODAL
  ) {
    return true;
  }
  return false;
};

/** =================== REGIONS ====================
 * 1) B2C policies and user flows
 * 2) Web API configuration parameters
 * 3) Authentication configuration parameters
 * 4) MSAL-Angular specific configuration parameters
 * =================================================
 */

// #region 1) B2C policies and user flows
/**
 * Enter here the user flows and custom policies for your B2C application,
 * To learn more about user flows, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/user-flow-overview
 * To learn more about custom policies, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview
 */
export const b2cPolicies = {
  names: environment.aad_config.policies,
  authorityDomain: environment.aad_config.authorityDomain,
  authorities: {
    signUpSignIn: {
      authority: environment.aad_config.authority,
    },
    resetPassword: {
      authority: environment.aad_config.password_authority,
    },
  },
};
// #endregion

// #region 2) Web API Configuration
/**
 * Enter here the coordinates of your Web API and scopes for access token request
 * The current application coordinates were pre-registered in a B2C tenant.
 */
// export const apiConfig: { b2cScopes: string[]; webApi: string } = {
//   b2cScopes: [aad_access_scopes],
//   webApi: CARDS_API.url
// };
// #endregion

// #region 3) Authentication Configuration
/**
 * Config object to be passed to Msal on creation. For a full list of msal.js configuration parameters,
 * visit https://azuread.github.io/microsoft-authentication-library-for-js/docs/msal/modules/_configuration_.html
 */
export const msalConfig: ConstructorParameters<
  typeof PublicClientApplication
>[0] = {
  auth: {
    clientId: environment.aad_config.clientId,
    authority: b2cPolicies.authorities.signUpSignIn.authority,
    knownAuthorities: [b2cPolicies.authorityDomain],
    redirectUri: environment.aad_config.redirectUri,
    postLogoutRedirectUri: environment.aad_config.postLogoutRedirectUri,
    navigateToLoginRequestUrl: checkInTeams(), // Avoid changing it to false - cause issue inside teams login flow
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: isIE, // Set this to "true" to save cache in cookies to address trusted zones limitations in IE
  },
  system: {
    loadFrameTimeout: 15000,
    loggerOptions: {
      loggerCallback: function loggerCallback(
        logLevel: LogLevel,
        message: string
      ) {
        console.log(message);
      },
      logLevel: LogLevel.Info,
      piiLoggingEnabled: false,
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
// #endregion

// #region 4) MSAL-Angular Configuration
// here you can define the coordinates and required permissions for your protected resources
export const protectedResourceMap: [string, string[]][] = [
  [CARDS_API.url, aad_access_scopes],
  [DATA_API.url, aad_access_scopes],
  [DATA_API_V4.url, aad_access_scopes],
  [CONFIG_API.url, aad_access_scopes],
  // [SI_STAGING_API.url, aad_si_staging_scope],
  // [SI_DATA_UPLOAD_API.url, aad_si_dataupload_scope],
  // [PROFILES_API.url, aad_profiles_scopes],
];

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMapConfig = new Map<string, Array<string>>(
    protectedResourceMap
  );
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
      scopes: [...loginRequest.scopes, 'openid', 'profile'],
    },
  };
}
