import cluster from "cluster";
import { Master } from "./clusters";

function bootstrap() {
  if (cluster.isMaster) {
    Master.Create(cluster);
    return;
  }
  require("./main");
}

bootstrap();
