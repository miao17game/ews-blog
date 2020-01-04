import cluster from "cluster";
import os from "os";
import { Cluster } from "./clusters";

const CPU_NUM = os.cpus().length;

if (cluster.isMaster) {
  const master = Cluster.Create();

  for (var i = 0; i < CPU_NUM; i++) {
    cluster.fork();
  }

  cluster.on("listening", (worker, address) => {
    console.log("listening: worker " + worker.process.pid);
  });

  cluster.on("message", (worker, message: any = {}) => master.receiveMessage(message, worker));

  cluster.on("exit", (worker, code, signal) => {
    console.log("exit worker " + worker.process.pid + " died");
    master.removeWorker(worker);
    // restart a work
    cluster.fork();
  });
} else {
  require("./main");
}
