import * as microsoftTeams from "@microsoft/teams-js";

export const TEAMS_SIGNIN_MODAL = 'teams-login-modal';

export const isIframe = () => window !== window.parent && !window.opener;

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
  const microsoftTeamsLib = microsoftTeams || window.microsoftTeams;

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
