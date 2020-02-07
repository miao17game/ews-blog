import { IBootstrapOptions, bootstrap as base, useNunjucks } from "./bootstrap.prod";

export async function bootstrap(options: Partial<IBootstrapOptions> = {}) {
  return base({
    ...options,
    staticOptions: { maxAge: 0 },
    beforeListen: app => {
      app.engine("html", useNunjucks(app, { noCache: true }).render);
      app.enableCors({
        origin: [/http:localhost:[0-9]{1,5}/, /http:\/\/127\.0\.0\.1:[0-9]{1,5}/],
        credentials: true,
      });
    },
  });
}
