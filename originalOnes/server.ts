import http from "http";
import { IncomingMessage, ServerResponse, createServer } from "http";
import parse from "./url-to-regex";
import queryParse from "./query-params";

//! type
let server: any;

interface Request extends IncomingMessage {
  method?: string;
  url?: string;
  params?: any;
  query?: any;
  body?: any;
}

interface Response extends ServerResponse {
  send?: (body: any) => Response; // Define the function signature for send.
  json?: (body: any) => Response;
}

type RouteHandler = (req: Request, res: Response) => any;

interface RouteTable {
  [path: string]: { RouteHandler: any };
}

// function createResponse(res: Response) {
//   res.send = (message: string) => res.end(message);
//   res.json = (data) => {
//     res.setHeader("Content-Type", "application/json");
//     res.end(JSON.stringify(data));
//   };
//   return res;
// }
//! midlleware type
function processMiddleware(middleware: any, req: Request, res: Response) {
  if (!middleware) {
    // resolve false
    return new Promise((resolve) => resolve(true));
  }

  return new Promise((resolve) => {
    middleware(req, res, function () {
      resolve(true);
    });
  });
}

function parnianExpress() {
  let routeTable: RouteTable = {};
  let parseMethod = "json"; // json, plain text

  function readBody(req: Request) {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += "" + chunk;
      });
      req.on("end", () => {
        resolve(body);
      });
      req.on("error", (err) => {
        reject(err);
      });
    });
  }

  server = createServer(async (req: Request, res: Response) => {
    const routes: string[] = Object.keys(routeTable);
    let match = false;

    for (var i = 0; i < routes.length; i++) {
      const route = routes[i];
      const parsedRoute = parse(route);
      if (new RegExp(parsedRoute).test(req.url || "")) {
        let cb = routeTable[route];
        // let middleware =
        //   routeTable[route][`${req.method?.toLowerCase()}-middleware`];
        // console.log("regex", parsedRoute);
        const m = req.url?.match(new RegExp(parsedRoute));
        // console.log("params", m.groups);

        req.params = m?.groups;
        req.query = queryParse(req.url);

        let body: any = await readBody(req);
        if (parseMethod === "json") {
          body = body ? JSON.parse(body as string) : {};
        }
        req.body = body;

        // const result = await processMiddleware(
        //   middleware,
        //   req,
        //   createResponse(res)
        // );
        // if (result) {
        //   cb(req, res);
        // }
        console.log("routeTable");
        console.log(routeTable);
        match = true;
        break;
      }
    }
    if (!match) {
      res.statusCode = 404;
      res.end("Not found");
    }
  });

  function registerPath(path: string, cb: any, method: any, middleware?: any) {
    // if (!routeTable[path]) {
    //   routeTable[path] = {};
    // }
    routeTable[path] = {
      ...routeTable[path],
      [method]: cb,
      [method + "-middleware"]: middleware,
    };
  }

  return {
    get: (path: string, ...rest: any[]) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "get");
      } else {
        registerPath(path, rest[1], "get", rest[0]);
      }
    },
    post: (path: string, ...rest: any[]) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "post");
      } else {
        registerPath(path, rest[1], "post", rest[0]);
      }
    },
    put: (path: string, ...rest: any[]) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "put");
      } else {
        registerPath(path, rest[1], "put", rest[0]);
      }
    },
    delete: (path: string, ...rest: any[]) => {
      if (rest.length === 1) {
        registerPath(path, rest[0], "delete");
      } else {
        registerPath(path, rest[1], "delete", rest[0]);
      }
    },

    bodyParse: (method: any) => (parseMethod = method),
    listen: (port: any, cb: any) => {
      server.listen(port, cb);
    },
    _server: server,
  };
}

export default parnianExpress;
