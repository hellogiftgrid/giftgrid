export const COMMUNITY_ORIGIN = "https://community.degiftgrid.com";
export const communityUrl = (path = "/") => new URL(path, COMMUNITY_ORIGIN).href;
