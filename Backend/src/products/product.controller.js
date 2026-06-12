import { APIResponse } from "../util/api.response.js";
import { ApiError } from "../util/api.error.js";
import Productrepo from "./product.repo.js";

export default class Productcontroller {
    _Productrepo;

    constructor() {
        this._Productrepo = new Productrepo();
    }

    async Createproduct(req, res, next) {
        try {
            const data = req.body;
            data.createdBy = req.user?.UserID;

            const result = await this._Productrepo.createproduct(data);
            return res
                .status(200)
                .json(new APIResponse(200, "product created...", result));
        } catch (error) {
            let errorMessage = error.message || "product creation Failed";
            if (error.code === 11000) {
                errorMessage = "A product with this name already exists. Please choose a different name.";
            }
            return res
                .status(404)
                .json(new ApiError(404, errorMessage, error.message));
        }
    }

    async UpdateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const  data  = req.body;
            const product=await this._Productrepo.findbyid(id);
            if (!product) {
                return res.status(404).json(new ApiError(404, "product not found"));
            }

            if (req.user?.role !== "admin" && product.createdBy?.toString() !== req.user?.UserID.toString()) {
                return res
                    .status(403)
                    .json(
                        new ApiError(
                            403,
                            "permission denied only created user or admin can update..."
                        )
                    );
            } else {
               const result= await this._Productrepo.updateproduct(id, data);
                return res
                    .status(201)
                    .json(new APIResponse(201, "Updated success",result));
            }
        } catch (error) {
            return res
                .status(404)
                .json(new ApiError(404, "Update Failed", error.message));
        }
    }

    async Readproduct(req, res, next) {
        try {
            const result = await this._Productrepo.readproducts();
            return res
                .status(200)
                .json(new APIResponse(200, "product fetched...", result));
        } catch (error) {
            return res
                .status(404)
                .json(new ApiError(404, "product not found", error.message));
        }
    }

    async DeleteProduct(req, res, next) {
        try {
            const { id } = req.params;
            const product = await this._Productrepo.findbyid(id);
            if (!product) {
                return res.status(404).json(new ApiError(404, "product not found"));
            }

            if (req.user?.role !== "admin" && product.createdBy?.toString() !== req.user?.UserID.toString()) {
                return res
                    .status(403)
                    .json(
                        new ApiError(
                            403,
                            "permission denied only created user or admin can delete..."
                        )
                    );
            }
            else {
                await this._Productrepo.deleteproduct(id);
                return res
                    .status(200)
                    .json(new APIResponse(200, "product deleted successfully"));
            }
        } catch (error) {
            return res
                .status(404)
                .json(new ApiError(404, "delete failed", error.message));
        }
    }

    async GetProductById(req, res, next) {
        try {
            const { id } = req.params;
            const product = await this._Productrepo.findbyid(id);
            if (!product) {
                return res.status(404).json(new ApiError(404, "product not found"));
            }
            return res
                .status(200)
                .json(new APIResponse(200, "product fetched...", product));
        } catch (error) {
            return res
                .status(500)
                .json(new ApiError(500, "product fetch failed", error.message));
        }
    }
}
