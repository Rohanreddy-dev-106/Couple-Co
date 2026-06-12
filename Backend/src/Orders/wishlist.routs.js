import express from "express";
import WishlistController from "./wishlist.controller.js";
import jwtAuth from "../middlewares/jwt.auth.js";

const router = express.Router();
const ctrl = new WishlistController();

// All wishlist routes require authentication
router.get("/", jwtAuth, (req, res) => ctrl.GetWishlist(req, res));
router.get("/check/:productId", jwtAuth, (req, res) => ctrl.CheckWishlisted(req, res));
router.post("/add/:productId", jwtAuth, (req, res) => ctrl.AddToWishlist(req, res));
router.delete("/remove/:productId", jwtAuth, (req, res) => ctrl.RemoveFromWishlist(req, res));
router.delete("/clear", jwtAuth, (req, res) => ctrl.ClearWishlist(req, res));

export default router;
