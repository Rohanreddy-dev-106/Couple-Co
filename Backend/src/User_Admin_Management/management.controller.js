import { APIResponse } from "../util/api.response.js";
import { ApiError } from "../util/api.error.js";
import Managementrepo from "./management.repo.js";

export default class Managementcontroller {
    _managementrepository;

    constructor() {
        this._managementrepository = new Managementrepo();
    }

    // Search products (text search)
    async searchproducts(req, res) {
        try {
            const { name, description, category } = req.query;

            const result = await this._managementrepository.searchproducts(
                name,
                description,
                category
            );

            return res
                .status(200)
                .json(new APIResponse(200, "Products fetched", result));
        } catch (error) {
            return res
                .status(500)
                .json(new ApiError(500, "Search failed", error.message));
        }
    }

    //  Get all products
    async getallproducts(req, res) {
        try {
            const result = await this._managementrepository.getallproducts();

            return res
                .status(200)
                .json(new APIResponse(200, "All products fetched", result));
        } catch (error) {
            return res
                .status(500)
                .json(new ApiError(500, "Fetch failed", error.message));
        }
    }
    
    // Get total revenue
    async totalrevenue(req, res) {
        try {
            const revenue = await this._managementrepository.totalrevenue();
            return res.status(200).json(new APIResponse(200, "Total revenue fetched", { totalRevenue: revenue }));
        } catch (error) {
            return res.status(500).json(new ApiError(500, "Fetch failed", error.message));
        }
    }

    //  Product details
    async productdetails(req, res) {
        try {
            const { name } = req.params;

            const result = await this._managementrepository.productdetails(
                name,
            
            );

            if (!result) {
                throw new Error("Product not found");
            }

            return res
                .status(200)
                .json(new APIResponse(200, "Product details fetched", result));
        } catch (error) {
            return res
                .status(404)
                .json(new ApiError(404, "Product not found", error.message));
        }
    }

    //  Filter by category
    async filterproductbycat(req, res) {
        try {
            const { category } = req.params;

            const result =
                await this._managementrepository.filterproductbycat(category);

            return res
                .status(200)
                .json(new APIResponse(200, "Filtered by category", result));
        } catch (error) {
            return res
                .status(500)
                .json(new ApiError(500, "Filter failed", error.message));
        }
    }

    //  Filter by price
    async filterproductbyprice(req, res) {
        try {
            const { minprice, maxprice } = req.query;

            const result =
                await this._managementrepository.filterproductbyprice(
                    minprice,
                    maxprice
                );

            return res
                .status(200)
                .json(new APIResponse(200, "Filtered by price", result));
        } catch (error) {
            return res
                .status(500)
                .json(new ApiError(500, "Filter failed", error.message));
        }
    }

    // Total products (category based)
    async totalproducts(req, res) {
        try {
            const { category } = req.params;

            const result =
                await this._managementrepository.Totalproducts(category);

            return res
                .status(200)
                .json(new APIResponse(200, "Total products", result));
        } catch (error) {
            return res
                .status(500)
                .json(new ApiError(500, "Count failed", error.message));
        }
    }

    //  Remove user (admin)
    async removeuser(req, res) {
        try {
            const { userid } = req.params;

            await this._managementrepository.removeusers(userid);

            return res
                .status(200)
                .json(new APIResponse(200, "User removed successfully"));
        } catch (error) {
            return res
                .status(500)
                .json(new ApiError(500, "User removal failed", error.message));
        }
    }

    //  Remove admin
    async removeadmin(req, res) {
        try {
            const { adminid } = req.params;

            await this._managementrepository.removeadmin(adminid);

            return res
                .status(200)
                .json(new APIResponse(200, "Admin removed successfully"));
        } catch (error) {
            return res
                .status(500)
                .json(new ApiError(500, "Admin removal failed", error.message));
        }
    }


}
