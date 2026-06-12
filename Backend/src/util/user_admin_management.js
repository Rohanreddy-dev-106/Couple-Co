import Usermodel from "../Users/users.schema.js";
async function Deleteplease(id) {
    try {
        if (!id) {
            console.log("Please provide userid..");
            return;
        }
        return await Usermodel.findByIdAndDelete(id);
    }
    catch (error) {
        console.log(error.message);

    }

}
export default Deleteplease;