import Userrepo from "../Users/users.repo.js";
import jwt from "jsonwebtoken";
const storerefreshtoken = new Userrepo();
export default async function generateRefreshToken(user) {
    const refreshtoken = jwt.sign(
        { UserID: user._id },
        process.env.REFRESHTOKEN_KEY,
        {
            algorithm: "HS256",
            expiresIn: "30d"
        }
    );

    await storerefreshtoken.StoreRefreshToken(
        user._id,
        refreshtoken
    );

    return refreshtoken;
}

