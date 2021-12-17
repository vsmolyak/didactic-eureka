import { InjectionToken } from "@angular/core";

export const PASSWORD_REDIRECT_ERROR_CODE = "AADB2C90118"; // https://docs.microsoft.com/en-us/azure/active-directory-b2c/error-codes
export const forgot_password_procedure_started_key = "forgot_password_procedure_started";
export const LOGGED_IN_AT = "loggedInAt";
export const SESSION_DURATION = "sessionDuration";
export const LOCATION = new InjectionToken("LOCATION");
export const LOCAL_STORAGE = new InjectionToken("LOCAL_STORAGE");
export const SESSION_STORAGE = new InjectionToken("SESSION_STORAGE");
