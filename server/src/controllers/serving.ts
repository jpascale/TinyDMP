const express = require("express");
const mongoose = require("mongoose");
const router = express();
const limdu = require("limdu");
const Visit = require("../models/Visit.js");
const serialize = require("serialization");
import LimduClassifier from "../analizer/classifier_starter";
const fs = require("fs");

mongoose.Promise = global.Promise;
import getClassifier from "../analizer/classifier_starter";
const classifier: any = getClassifier();

const bodyParser = require("body-parser");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


router.get("/trck", async (req: any, res: any) => {
  console.log("Team Czerwonagóra & Paszkejl");
  const name = req.query.name;
  const ip = req.query.ip;
  const url = req.query.url;

  const category = req.query.category;
  const subcategory = req.query.subcategory;
  const text = req.query.text;

  const train = req.query.train;
  console.log(JSON.stringify(req.query));

  const classifications = await (await classifier).classify(text);

  if (name && ip && url) {
    let save;
    if (train === "true" || (classifications.length === 0 && category)) {
      save = {
        ip,
        name,
        url,
        content: {
          category,
          subcategory,
          text,
          inferred_category: "-"
        },
        train: true
      };
    } else {
      save = {
        ip,
        name,
        url,
        content: {
          category,
          subcategory,
          text,
          inferred_category: classifications
        },
        train: false
      };
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
      classifier.then((c: any) => res.send(c.classify(visits[0].content.text)));
    });

  } else {
    return res.status(400).send("Provide id in query");
  }
});

router.get("/str", async (req: any, res: any) => {

  const _id = req.query.id;

  const newOjb = () => {
    const MyWinnow = limdu.classifiers.Winnow.bind(0, { retrain_count: 10 });
    const intentClassifier = new limdu.classifiers.multilabel.BinaryRelevance({
      binaryClassifierType: MyWinnow,
      normalizer: limdu.features.LowerCaseNormalizer,
    });
    return intentClassifier;
  };

  const serialization: string = serialize.toString((await classifier), newOjb);
  fs.writeFileSync("serialization.txt", serialization, "UTF-8", { "flags": "w+" });
  const deserialization = serialize.fromString(serialization, "serialization.txt");

  Visit.find({ _id }, (err: any, visits: any) => res.send(deserialization.classify(visits[0].content.text)));

  // return res.send(serialize.toString((await classifier), newOjb));

});

export default router;