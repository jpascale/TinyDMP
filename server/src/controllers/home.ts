import { Request, Response } from "express";
const mongoose = require("mongoose");
const Visit = require("../models/Visit.js");

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
      const c = categories[visit.content.category];
      if (c) {
        categories[visit.content.category] = c + 1;
      } else {
        categories[visit.content.category] = 1;
      }

      if (visit.url.indexOf("lanacion.com") > 0) {
        websites[0].count += 1;
      } else if (visit.url.indexOf("clarin.com") > 0) {
        websites[1].count += 1;
      } else if (visit.url.indexOf("infobae.com") > 0) {
        websites[2].count += 1;
      }
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
};