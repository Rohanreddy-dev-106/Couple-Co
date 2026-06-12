import express from "express";
import Managementcontroller from "./management.controller.js";
import jwtAuth from "../middlewares/jwt.auth.js";
import AccessControl from "../middlewares/access.control.js";

const managementRouter = express.Router();
const management = new Managementcontroller();

managementRouter.get("/products/search", (req, res, next) =>
    management.searchproducts(req, res, next)
);

managementRouter.get("/products", (req, res, next) =>
    management.getallproducts(req, res, next)
);

managementRouter.get("/details/:name", (req, res, next) =>
    management.productdetails(req, res, next)
);

managementRouter.get("/products/category/:category", (req, res, next) =>
    management.filterproductbycat(req, res, next)
);

managementRouter.get("/products/filter/price", (req, res, next) =>
    management.filterproductbyprice(req, res, next)
);


managementRouter.get("/products/total/:category", (req, res, next) =>
    management.totalproducts(req, res, next)
);


managementRouter.delete("/admin/user/:userid", jwtAuth, (req, res, next) =>
    management.removeuser(req, res, next)
);

managementRouter.delete("/admin/:adminid", jwtAuth, (req, res, next) =>
    management.removeadmin(req, res, next)
);

managementRouter.get("/admin/totalrevenue", jwtAuth, AccessControl("admin"), (req, res, next) =>
    management.totalrevenue(req, res, next)
);

export default managementRouter;
