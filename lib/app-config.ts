import packageJson from "../package.json";

export const appConfig = {
  name: "BlazeNeuro Developer",
  description: "Developer Portal",
  version: packageJson.version,
  packageName: packageJson.name,
} as const;
