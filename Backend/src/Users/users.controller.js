import { APIResponse } from "../util/api.response.js";
import { ApiError } from "../util/api.error.js";
import usersrepo from "./users.repo.js";
import generateAccessToken from "../util/accesstoken.create.js";
import generateRefreshToken from "../util/refreshtoken.create.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export default class Usercontroller {
    _userrepository;
    constructor() {
        this._userrepository = new usersrepo()
    }
    async registation(req, res, next) {
        try {
            const data = req.body;
            // Default role to "user" if not specified
            data.role = data.role || "user";
            
            const existingUser = await this._userrepository.Findemail(data.email);
            if (existingUser) {
                return res.status(400).json(new ApiError(400, "Email is already registered. Please login."));
            }

            await this._userrepository.Register(data);
            res.status(201).json(new APIResponse(201, "user is Registered.."));
        }
        catch (error) {
            console.log("Signup Error:", error.message);
            res.status(500).json(new ApiError(500, "Signup Error", error.message));
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Direct DB lookup without Redis
            const user = await this._userrepository.Findemail(email);
            if (!user) return res.status(404).send("User not found");

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(404).send("User not found");
            }
            else {
                //Create JWT tokens
                const accesstoken = generateAccessToken(user);
                const refreshtoken = await generateRefreshToken(user);
                console.log("Storing refresh token for user id:", user._id);
                console.log("Refresh token:", refreshtoken);

                // Access token: 15 minutes
                const ACCESS_COOKIE_EXPIRE = 15 * 60 * 1000;

                // Refresh token: 7 days
                const REFRESH_COOKIE_EXPIRE = 7 * 24 * 60 * 60 * 1000;


                // Store token in cookie
                res.cookie("jwtToken", accesstoken, {
                    maxAge: ACCESS_COOKIE_EXPIRE,
                    httpOnly: true,
                });

                res.cookie("refreshToken", refreshtoken, {
                    maxAge: REFRESH_COOKIE_EXPIRE,
                    httpOnly: true,
                });

                return res.status(200).json(new APIResponse(200, "Login successful", {
                    name: user.name,
                    email: user.email,
                    role: user.role
                }));
            }
        }
        catch (error) {
            return res.status(404).json(new ApiError(404, "Login is Failed", error.message))
        }
    }
    async CreareProfile(req, res, next) {
        try {
            const profile = req.body;
            profile.user = req.user.UserID;
            const saved = await this._userrepository.CreateProfile(profile);
            return res.status(201).json(new APIResponse(201, "Profile saved successfully", saved))
        }
        catch (err) {
            return res.status(400).json(new ApiError(400, "Failed to save profile", err.message))
        }
    }
    async Getprofilr(req, res, next) {
        try {
            const user = await this._userrepository.FindUser(req.user.UserID);
            if (!user) return res.status(404).send("User not found");
            
            const profile = await this._userrepository.getprofile(req.user.UserID);
            
            return res.status(200).json({
                message: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profile: profile || null
                }
            });
        }
        catch (error) {
            return res.status(404).json(new ApiError(404, "profile is not fetching...", error.message))
        }
    }
    async Profileupdate(req, res, next) {
        try {
            const data = req.body;
            const updatedProfile = await this._userrepository.UpdateProfile(req.user.UserID, data);
            return res.status(200).json(new APIResponse(200, "Profile updated successfully", updatedProfile))
        }
        catch (err) {
            return res.status(404).json(new ApiError(404, "profile is not updated..", err.message))
        }
    }
    async CreatenewRefreshTokenAndAccessToken(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken;

            const refresh_paylode = jwt.verify(
                refreshToken,
                process.env.REFRESHTOKEN_KEY
            );

            const id = refresh_paylode.UserID;

            const DatabaseRefreshToken = await this._userrepository.GetRefreshToken(id);

            if (refreshToken !== DatabaseRefreshToken) {
                return res.status(404).send("Token not found");
            }

            const user = await this._userrepository.FindUser(id);

            const accesstoken = generateAccessToken(user);
            const refreshtoken = await generateRefreshToken(user);
            console.log("Storing refresh token for user id:", user._id);
            console.log("Refresh token:", refreshtoken);

            // Access token: 15 minutes
            const ACCESS_COOKIE_EXPIRE = 15 * 60 * 1000;

            // Refresh token: 7 days
            const REFRESH_COOKIE_EXPIRE = 7 * 24 * 60 * 60 * 1000;

            res.cookie("jwtToken", accesstoken, {
                maxAge: ACCESS_COOKIE_EXPIRE,
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshtoken, {
                maxAge: REFRESH_COOKIE_EXPIRE,
                httpOnly: true,
            });

            return res.status(200).json(new APIResponse(200, "Token is found.."))

        } catch (error) {
            return res.status(401).json(new ApiError(401, "Token not found..", error.message))
        }
    }
    async Logout(req, res, next) {
        try {
            await this._userrepository.Clearrefreshtoken(req.user.UserID);

            res.clearCookie("jwtToken", {
                httpOnly: true,
            });
            res.clearCookie("refreshToken", {
                httpOnly: true,
            });


            return res.status(200).send({
                message: "Logout successful"
            });

        } catch (error) {
            console.log("Logout Error:", error.message);
            res.status(500).send("Logout failed");
        }
    }
}


