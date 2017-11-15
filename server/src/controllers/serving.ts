const express = require("express");
const mongoose = require("mongoose");
const router = express();
const Visit = require("../models/Visit.js");
const Mapping = require("../models/Map.js");
import LimduClassifier from "../analizer/classifier_starter";

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

  if (name && ip && url) {
    let save;
    if (train === "true") {
      save = { ip, name, url, content: { category, subcategory, text, inferred_category: "-" }, train: true };
    } else {
      save = {
        ip,
        name,
        url,
        content: {
          category, subcategory, text,
          inferred_category: (await classifier).classify(text)
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

router.get("/recommend", (req: any, res: any) => {
  const user = req.query.user;
  if (user) {
    Visit.find({ name: user }, function (err: any, visits: any) {
      const categoriesArray: { name: string, count: number }[] = [];
      const categories: any = {};
      visits.forEach((visit: any) => {
        // Categories
        const c = categories[visit.content.category];
        if (c) {
          categories[visit.content.category] = c + 1;
        } else {
          categories[visit.content.category] = 1;
        }
      });
      Object.keys(categories).forEach(element => {
        categoriesArray.push({
          name: element,
          count: categories[element]
        });
      });

      // There's no real number bigger than plus Infinity
      let tmp: any = undefined;
      for (let i = categoriesArray.length - 1; i >= 0; i--) {
        if (!tmp || categoriesArray[i].count > tmp.count) {
          tmp = categoriesArray[i];
        }
      }
      res.send(tmp.name);
    });
  } else {
    return res.status(400).send("Provide user in query");
  }
});

router.get("/recommendMapping", (req: any, res: any) => {
  const user = req.query.user;
  if (user) {
    Visit.find({ name: user }, function (err: any, visits: any) {
      Mapping.find({}, function (err: any, mappings: any) {
        const categoriesArray: { name: string, count: number }[] = [];
        const categories: any = {};
        visits.forEach((visit: any) => {
          // Categories
          const cat = mapCategory(mappings, visit.content.category);
          const c = categories[cat];
          if (c) {
            categories[cat] = c + 1;
          } else {
            categories[cat] = 1;
          }
        });
        Object.keys(categories).forEach(element => {
          if (element && element.length > 0) {
            categoriesArray.push({
              name: element,
              count: categories[element]
            });
          }
        });

        // There's no real number bigger than plus Infinity
        let tmp: any = undefined;
        for (let i = categoriesArray.length - 1; i >= 0; i--) {
          if (!tmp || categoriesArray[i].count > tmp.count) {
            tmp = categoriesArray[i];
          }
        }
        res.send(tmp.name);
      });
    });
  } else {
    return res.status(400).send("Provide user in query");
  }
});

const mapCategory = (mappings: any, category: any) => {
  let ret: string = "";
  mappings.forEach((map: any) => {
    if (map.categories.includes(category)) {
      ret = map.name;
    }
  });
  return ret;
};

export default router;