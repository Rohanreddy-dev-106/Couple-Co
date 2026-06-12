import jwt from "jsonwebtoken";
export default function generateAccessToken(user) {
        return jwt.sign(
            { UserID: user._id, email: user.email, role: user.role },
            process.env.ACCESSTOKEN_KEY,
            {
                algorithm: "HS256",
                expiresIn: "15m"
            }
        );
    }
