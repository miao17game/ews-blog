type IEnv = "prod" | "dev";

async function start() {
  const ENV: IEnv = process.env.NODE_ENV === "production" ? "prod" : "dev";
  const configs = getConfigs(ENV);
  const env = getEnvs();
  if (ENV === "prod") {
    const { bootstrap } = await import("./bootstrap.prod");
    bootstrap(configs, { env });
  } else {
    const { bootstrap } = await import("./bootstrap.dev");
    bootstrap(configs, { env });
  }
}

function getConfigs(env: IEnv) {
  if (env === "prod") {
    return require("./configs/config").configs;
  }
  return require("./configs/config.dev").configs;
}

function getEnvs() {
  const envs: { [prop: string]: string } = {};
  for (const key in process.env) {
    if (key.startsWith("EWS_") && process.env.hasOwnProperty(key)) {
      envs[key.slice(4)] = process.env[key];
    }
  }
  return envs;
}

start();
