// if window is undefined, we are in server
// if window is defined, on the client, window is actived
export const isServer = () => typeof window === 'undefined'