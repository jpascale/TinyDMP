import { Request, Response } from "express";
const mongoose = require("mongoose");
const Visit = require("../models/Visit.js");
const Mapping = require("../models/Map.js");

/**
 * GET /
 * Home page.
 */
export let index = (req: Request, res: Response) => {
  Visit.find({}, function (err: any, visits: any) {
    res.render("home", {
      title: "Herolens DMP",
      visits: visits
    });
  });
};

/**
 * GET /:user
 * User page.
 */
export let user = (req: Request, res: Response) => {
  const user = req.params.user;
  Visit.find({ name: user }, function (err: any, visits: any) {
    Mapping.find({}, function (err: any, mappings: any) {
      const websites: { name: string, count: number }[] = [
        {
          name: "lanacion",
          count: 0
        },
        {
          name: "clarin",
          count: 0
        },
        {
          name: "infobae",
          count: 0
        },
      ];
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

        // Websites
        if (visit.url.indexOf("lanacion.com") > 0) {
          websites[0].count += 1;
        } else if (visit.url.indexOf("clarin.com") > 0) {
          websites[1].count += 1;
        } else if (visit.url.indexOf("infobae.com") > 0) {
          websites[2].count += 1;
        }

        // Mapping
        visit.mapping = mapCategory(mappings, visit.content.category);
      });
      Object.keys(categories).forEach(element => {
        categoriesArray.push({
          name: element,
          count: categories[element]
        });
      });

      res.render("user", {
        title: user,
        visits: visits,
        categories: categoriesArray,
        websites: websites.filter(w => w.count > 0)
      });

    });
  });
};

/**
 * GET /map
 * Home page.
 */
export let map = (req: Request, res: Response) => {
  Visit.find({}, function (err: any, visits: any) {
    Mapping.find({}, function (err: any, mappings: any) {
      const categories: any = [];
      visits.forEach((visit: any) => {
        if (categories.indexOf(visit.content.category) < 0 && !isMapped(mappings, visit)) {
          categories.push(visit.content.category);
        }
      });

      res.render("map", {
        title: "Mapping",
        categories: categories
      });
    });
  });
};

const isMapped = (mappings: any, visit: any) => {
  let ret: boolean = false;
  mappings.forEach((map: any) => {
    ret = map.categories.includes(visit.content.category) || ret;
  });
  return ret;
};

const mapCategory = (mappings: any, category: any) => {
  let ret: string = "";
  mappings.forEach((map: any) => {
    if (map.categories.includes(category)) {
      ret = map.name;
    }
  });
  return ret;
};

/**
 * POST /map
 * Home page.
 */
export let mapPost = (req: Request, res: Response) => {
  const data = new Mapping(req.body);
  data.save()
    .then((item: any) => {
      req.flash("success", { msg: "Se guardo el mapping" });
      return res.redirect("/map");
    })
    .catch((err: any) => {
      req.flash("errors", { msg: "Hubo un error :(" });
      return res.redirect("/map");
    });
};