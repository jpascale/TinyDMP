const express = require("express");

const router = express();

router.get("/trck", (req: any, res: any) => {
  console.log("aaaaaaaa");
  return res.send("ok :)");
});


export default router;