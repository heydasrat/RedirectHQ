const apiUrl = new URL(
  import.meta.env.VITE_API_URL || "/v1/api",
  window.location.origin,
);

const configuredShortBase = import.meta.env.VITE_SHORT_URL_BASE;

export const shortUrlBase = configuredShortBase
  ? `${configuredShortBase.replace(/\/+$/, "")}/`
  : `${apiUrl.origin}${apiUrl.pathname.replace(/\/+$/, "")}/url/r/`;

export const shortUrlFor = (shortCode) =>
  `${shortUrlBase}${encodeURIComponent(shortCode)}`;