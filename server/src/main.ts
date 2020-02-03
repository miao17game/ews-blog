import path from "path";
import { resolveYamlFile } from "#utils/yaml";

const ENV = process.env.NODE_ENV === "production" ? "prod" : "dev";

async function load() {
  const { configs } = await resolveYamlFile(
    path.resolve(__dirname, "configs", ENV === "prod" ? "config.yaml" : "config.dev.yaml"),
  );
  process.env.EWS__CONFIGS__PASS = JSON.stringify(configs);
  if (configs.redis.enabled) {
    require("./app");
  } else if (configs.cluster.enabled) {
    if (configs.cluster.maxCpuNum !== null) {
      process.env.MAX_CPU_NUM = configs.cluster.maxCpuNum;
    }
    require("./cluster");
  } else {
    require("./app");
  }
}

load();
