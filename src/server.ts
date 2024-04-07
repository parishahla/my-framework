import * as http from "http";

//! next
type Handler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next?: () => void
) => void;

type Middleware = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next: () => void
) => void;

interface RouteDefinition {
  method: string;
  path: string;
  handler: Handler;
}

class ParExpress {
  private routes: RouteDefinition[] = [];
  private middlewares: Middleware[] = [];

  public use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  public get(path: string, handler: Handler): void {
    this.routes.push({ method: "GET", path, handler });
  }

  public post(path: string, handler: Handler): void {
    this.routes.push({ method: "POST", path, handler });
  }

  public put(path: string, handler: Handler): void {
    this.routes.push({ method: "POST", path, handler });
  }

  public delete(path: string, handler: Handler): void {
    this.routes.push({ method: "POST", path, handler });
  }
  // Add other HTTP methods as needed...

  private matchRoute(method: string, url: string): RouteDefinition | undefined {
    return this.routes.find((route) => {
      const routeRegex = new RegExp(
        `^${route.path.replace(/:([^\/]+)/g, "(?<$1>[^\\/]+)")}$`
      );
      return route.method === method && routeRegex.test(url);
    });
  }

  public listen(port: number, callback?: () => void): void {
    const server = http.createServer((req, res) => {
      const matchedRoute = this.matchRoute(
        req.method as string,
        req.url as string
      );

      if (matchedRoute) {
        const routeParamsMatch = req.url?.match(
          new RegExp(matchedRoute.path.replace(/:([^\/]+)/g, "(?<$1>[^\\/]+)"))
        );
        req.params = routeParamsMatch?.groups || {};

        let middlewareIndex = 0;
        const next = () => {
          if (middlewareIndex < this.middlewares.length) {
            const middleware = this.middlewares[middlewareIndex++];
            middleware(req, res, next);
          } else {
            matchedRoute.handler(req, res);
          }
        };

        next();
      } else {
        res.statusCode = 404;
        res.end("Not Found");
      }
    });

    server.listen(port, callback);
  }
}

export default ParExpress;
