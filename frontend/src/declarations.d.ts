declare module "*.svg";
declare module "*.png";

export { };
declare global {
	interface Window {
		appConfig?: AppConfig;
	}
}