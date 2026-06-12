import Usermodel from "./users.schema.js";
import profilemodel from "./user.profile.schema.js";
import bcrypt from "bcrypt";

export default class Userrepo {

    async Register(data) {
        try {
            data.password = await bcrypt.hash(data.password, 12);
            const user = new Usermodel(data);
            return await user.save();
        } catch (error) {
            console.log("Register Error:", error.message);
            throw error;
        }
    }

    async ResetPassword(id, newpassword) {
        try {
            if (!id || !newpassword) {
                console.log("User ID and new password are required");
            }

            const hashedPassword = await bcrypt.hash(newpassword, 10);

            const user = await Usermodel.findByIdAndUpdate(
                id,
                { $set: { password: hashedPassword } },
                { new: true }
            );

            if (!user) {
                throw new ApiError(404, "User not found");
            }

            return user;
        } catch (error) {
            console.log(error.message);
        }
    }

    async Findemail(email_recived) {
        try {
            const user = await Usermodel.findOne({ email: email_recived });
            if (!user) {
                console.log("user not found");
                
            }
            return user;
        } catch (error) {
            console.log(error.message);
        }
    }

    // Upsert: create if not exists, update if exists
    async CreateProfile(data) {
        try {
            const { user, ...rest } = data;
            const profile = await profilemodel.findOneAndUpdate(
                { user },
                { $set: { user, ...rest } },
                { new: true, upsert: true, runValidators: true }
            );
            return profile;
        } catch (error) {
            console.log("CreateProfile Error:", error.message);
            throw error;
        }
    }

    async UpdateProfile(userId, data) {
        try {
            const filter_data = {};
            for (const key in data) {
                if (data[key] !== undefined && data[key] !== "") {
                    filter_data[key] = data[key];
                }
            }

            // upsert: create the profile if it doesn't exist yet
            const profile = await profilemodel.findOneAndUpdate(
                { user: userId },
                { $set: { user: userId, ...filter_data } },
                { new: true, upsert: true, runValidators: true }
            );

            return profile;
        } catch (error) {
            console.log("UpdateProfile Error:", error.message);
            throw error;
        }
    }

    async StoreRefreshToken(id, token) {
    try {
        const user = await Usermodel.findByIdAndUpdate(
            id,
            { $set: { refreshToken: token } },
            { new: true }
        );
        if (!user) {
            throw new Error("User not found while storing refresh token");
        }
        return user;
    } catch (error) {
        console.log("StoreRefreshToken Error:", error.message);
    }
}


    async GetRefreshToken(id) {
        try {
            const docfind = await Usermodel.findById(id);
            return docfind?.refreshToken; // safe optional chaining
        } catch (error) {
            console.log(error.message);
        }
    }

    async FindUser(id) {
        try {
            return await Usermodel.findById(id);
        } catch (err) {
            console.log(err.message);
        }
    }

    async Clearrefreshtoken(id) {
        try {
            return await Usermodel.findByIdAndUpdate(
                id,
                { $unset: { refreshToken: "" } }
            );
        } catch (err) {
            console.log(err.message);
        }
    }

    async getprofile(UserID) {
        try {
            return await profilemodel.findOne({user:UserID});
        } catch (err) {
            console.log(err.message);
        }
    }
}
