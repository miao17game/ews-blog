type IEnv = "prod" | "dev";

async function start() {
  const ENV: IEnv = process.env.NODE_ENV === "production" ? "prod" : "dev";
  const configs = getConfigs(ENV);
  if (ENV === "prod") {
    const { bootstrap } = await import("./bootstrap.prod");
    bootstrap(configs);
  } else {
    const { bootstrap } = await import("./bootstrap.dev");
    bootstrap(configs);
  }
}

function getConfigs(env: IEnv) {
  if (env === "prod") {
    return require("./configs/config").configs;
  }
  return require("./configs/config.dev").configs;
}

start();
