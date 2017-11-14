import { Request, Response } from "express";
const mongoose = require("mongoose");

/**
 * GET /
 * Home page.
 */
export let index = (req: Request, res: Response) => {
  res.render("home", {
    title: "Herolens DMP",
    ponele: "test"
  });
};
