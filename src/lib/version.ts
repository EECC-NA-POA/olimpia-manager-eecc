// Version information for the application
export const APP_VERSION = {
  version: '1.0.0', // Semantic version - update this manually for releases
  commitHash: import.meta.env.VITE_COMMIT_HASH || 'dev',
  buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
  environment: import.meta.env.MODE,
};

export const getVersionString = () => {
  const { version, commitHash, environment } = APP_VERSION;
  const shortHash = commitHash.substring(0, 7);
  return `v${version}-${shortHash} (${environment})`;
};

export const getFullVersionInfo = () => {
  return {
    ...APP_VERSION,
    displayVersion: getVersionString(),
  };
};
