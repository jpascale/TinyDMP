const express = require("express");
const mongoose = require("mongoose");
const router = express();
mongoose.Promise = global.Promise;

const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


const visitSchema = new mongoose.Schema({
  ip: String,
  name: String,
  url: String,
}, { timestamps: true });


const Visit = mongoose.model("Visit", visitSchema);

router.get("/trck", (req: any, res: any) => {
  console.log("Team Czerwonagóra & Paszkejl");
  const name = req.query.name;
  const ip = req.query.ip;
  const url = req.query.url;

  const save = req.query.save;

  if (save === "true" && name && ip && url) {
    const data = new Visit({ ip, name, url });
    data.save()
      .then((item: any) => {
        return res.send("item saved to database");
      })
      .catch((err: any) => {
        return res.send("unable to save to database");
      });
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  }
});

router.get("/all", (req: any, res: any) => {

  Visit.find({ name: "paszkejl2" }, function (err: any, users: any) {
    const visitMap: any = {};

    users.forEach(function (visit: any) {
      visitMap[visit._id] = visit;
    });

    console.log(JSON.stringify(visitMap));
    res.send(visitMap);
  });

});

export default router;