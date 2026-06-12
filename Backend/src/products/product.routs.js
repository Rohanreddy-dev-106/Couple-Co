import express from "express";
import Productcontroller from "./product.controller.js";
import jwtAuth from "../middlewares/jwt.auth.js";
import AccessControl from "../middlewares/access.control.js";
const ProductRoute=express.Router();
const Pcontroller=new Productcontroller();

ProductRoute.post("/create", jwtAuth, AccessControl("admin"), (req, res, next) => {
    Pcontroller.Createproduct(req, res, next);
});


ProductRoute.put("/update/:id", jwtAuth, AccessControl("admin"), (req, res, next) => {
    Pcontroller.UpdateProduct(req, res, next);
});


ProductRoute.get("/get-all", (req, res, next) => {
    Pcontroller.Readproduct(req, res, next); 
});

ProductRoute.get("/:id", (req, res, next) => {
    Pcontroller.GetProductById(req, res, next);
});


ProductRoute.delete("/delete/:id", jwtAuth, AccessControl("admin"), (req, res, next) => {
    Pcontroller.DeleteProduct(req, res, next);
});



export default ProductRoute;