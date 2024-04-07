import parnianExpress from "./server";

const app = parnianExpress();

app.listen(2000, () => {
  console.log(`app listening on port 2000`);
});

app.get("/products/:id", (req: any, res: any) => {});
app.get("/products", (req: any, res: any) => {
  console.log(req.params);
  console.log(req.query);
  // for route /products?page=1&pageSize=10, req.query has value  { page: '1', pageSize: '10' }
});
app.post("/products", (req: any, res: any) => {
  console.log(req.body);
  // req.body should contain whatever you sent across as client
});
