import server from "./index.js";
import Connection from "./src/config/mongoos.config.js";
import seedAdmin from "./src/config/seed.admin.js";
import seedProducts from "./src/config/seed.products.js";
const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
    await Connection();
    await seedAdmin();
    await seedProducts();
    console.log(`Server is Up and Running at PORT ${PORT}`);
})