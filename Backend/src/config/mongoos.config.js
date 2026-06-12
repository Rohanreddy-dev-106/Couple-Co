import mongoose from "mongoose";

export default async function Connection() {
    const URL = process.env.MONGODB_CONNECTION_STRING;
    try {
        const db = await mongoose.connect(URL);
        console.log(`Mongodb is connected..${db}`);

    } catch (error) {
        console.log(error.message);

    }
}