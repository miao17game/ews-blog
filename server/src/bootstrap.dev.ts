import { IBootstrapOptions, bootstrap as base, useNunjucks } from "./bootstrap.prod";

export async function bootstrap(options: Partial<IBootstrapOptions> = {}) {
  return base({
    ...options,
    staticOptions: { maxAge: 0 },
    beforeListen: app => {
      app.engine("html", useNunjucks(app, { noCache: false }).render);
      app.enableCors({ origin: "*" });
    },
  });
}
