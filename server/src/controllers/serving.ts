const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Visit = require("../models/Visit.js");
import LimduClassifier from "../analizer/classifier_starter";

mongoose.Promise = global.Promise;
import getClassifier from "../analizer/classifier_starter";
const classifier: any = getClassifier();

const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


router.get("/trck", (req: any, res: any) => {
  console.log("Team Czerwonagóra & Paszkejl");
  const name = req.query.name;
  const ip = req.query.ip;
  const url = req.query.url;

  const category = req.query.category;
  const subcategory = req.query.subcategory;
  const text = req.query.text;

  const train = req.query.train;
  console.log(JSON.stringify(req.query));

  if (name && ip && url) {
    let save;
    if (train === "true") {
      save = { ip, name, url, content: { category, subcategory, text }, train: true };
    } else {
      save = { ip, name, url, content: { category, subcategory, text }, train: false };
    }

    const data = new Visit(save);
    console.log(JSON.stringify(save));
    data.save()
      .then((item: any) => {
        return res.send("item saved to database");
      })
      .catch((err: any) => {
        return res.send("unable to save to database");
      });
  }
});

router.get("/all", (req: any, res: any) => {

  Visit.find({}, function (err: any, users: any) {
    const visitMap: any = {};

    users.forEach(function (visit: any) {
      visitMap[visit._id] = visit;
    });

    console.log(JSON.stringify(visitMap));
    res.send(visitMap);
  });

});

router.get("/log", (req: any, res: any) => {
  const log = req.query.log;
  if (log) {
    console.log(log);
    return res.status(200).send("");
  }
  console.log("LOG VACIO " + log);
  return res.status(300).send("");
});

router.get("/filter", (req: any, res: any) => {
  const query = req.query;
  if (query) {
    Visit.find(query, function (err: any, users: any) {
      const visitMap: any = {};

      users.forEach(function (visit: any) {
        visitMap[visit._id] = visit;
      });

      console.log(JSON.stringify(visitMap));
      res.send(visitMap);
    });
  } else {
    return res.status(500).send("Must provide query params");
  }
});

router.get("/classify", (req: any, res: any) => {
  const _id = req.query.id;

  if (_id) {
    Visit.find({ _id }, function (err: any, visits: any) {
      classifier.then((c: any) => console.log(c.classify(visits[0].content.text)));
    });

  } else {
    return res.status(400).send("Provide id in query");
  }
});

export default router;