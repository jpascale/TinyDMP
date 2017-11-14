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
    res.render("user", {
      title: user,
      visits: visits
    });
  });
};