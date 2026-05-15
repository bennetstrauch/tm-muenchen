// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FbqFn = (...args: any[]) => void;

interface Window {
  fbq?: FbqFn;
  _fbq?: FbqFn;
}
