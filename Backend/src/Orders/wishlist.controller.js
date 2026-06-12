import { APIResponse } from "../util/api.response.js";
import { ApiError } from "../util/api.error.js";
import WishlistRepo from "./wishlist.repo.js";

const repo = new WishlistRepo();

export default class WishlistController {

    // GET /wishlist  — fetch the current user's wishlist
    async GetWishlist(req, res) {
        try {
            const userId = req.user.UserID;
            const wishlist = await repo.getWishlist(userId);
            return res
                .status(200)
                .json(new APIResponse(200, "Wishlist fetched", wishlist?.products || []));
        } catch (error) {
            return res
                .status(500)
                .json(new ApiError(500, "Failed to fetch wishlist", error.message));
        }
    }

    // POST /wishlist/add/:productId — add a product
    async AddToWishlist(req, res) {
        try {
            const userId = req.user.UserID;
            const { productId } = req.params;
            const { wishlist, added } = await repo.addProduct(userId, productId);
            const message = added ? "Product added to wishlist" : "Product already in wishlist";
            return res
                .status(200)
                .json(new APIResponse(200, message, wishlist));
        } catch (error) {
            return res
                .status(500)
                .json(new ApiError(500, "Failed to add to wishlist", error.message));
        }
    }

    // DELETE /wishlist/remove/:productId — remove a product
    async RemoveFromWishlist(req, res) {
        try {
            const userId = req.user.UserID;
            const { productId } = req.params;
            const wishlist = await repo.removeProduct(userId, productId);
            return res
                .status(200)
                .json(new APIResponse(200, "Product removed from wishlist", wishlist));
        } catch (error) {
            return res
                .status(500)
                .json(new ApiError(500, "Failed to remove from wishlist", error.message));
        }
    }

    // DELETE /wishlist/clear — clear the entire wishlist
    async ClearWishlist(req, res) {
        try {
            const userId = req.user.UserID;
            await repo.clearWishlist(userId);
            return res
                .status(200)
                .json(new APIResponse(200, "Wishlist cleared"));
        } catch (error) {
            return res
                .status(500)
                .json(new ApiError(500, "Failed to clear wishlist", error.message));
        }
    }

    // GET /wishlist/check/:productId — is this product wishlisted?
    async CheckWishlisted(req, res) {
        try {
            const userId = req.user.UserID;
            const { productId } = req.params;
            const isWishlisted = await repo.isProductWishlisted(userId, productId);
            return res
                .status(200)
                .json(new APIResponse(200, "Check done", { isWishlisted }));
        } catch (error) {
            return res
                .status(500)
                .json(new ApiError(500, "Failed to check wishlist", error.message));
        }
    }
}
