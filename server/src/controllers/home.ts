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
