import express from "express";
import Usercontroller from "./users.controller.js";
import jwtAuth from "../middlewares/jwt.auth.js";
const userRouts = express.Router();
const userControler = new Usercontroller();

userRouts.post("/register", (req, res, next) => {
    userControler.registation(req, res, next);
})

userRouts.post("/login", (req, res, next) => {
    userControler.login(req, res, next);
})
userRouts.post("/creatprofile", jwtAuth, (req, res, next) => {
    userControler.CreareProfile(req, res, next);
})

userRouts.put("/profile-update", jwtAuth, (req, res, next) => {
    userControler.Profileupdate(req, res, next);
})

userRouts.post("/refresh-Token", (req, res, next) => {
    userControler.CreatenewRefreshTokenAndAccessToken(req, res, next);
})
userRouts.get("/get-profile", jwtAuth, (req, res, next) => {
    userControler.Getprofilr(req, res, next);
})
userRouts.delete("/logout", jwtAuth, (req, res, next) => {
    userControler.Logout(req, res, next);
})


export default userRouts;