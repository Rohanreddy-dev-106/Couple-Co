import WishlistModel from "./wishlist.schema.js";

export default class WishlistRepo {

    // Get the wishlist for a user (create one if it doesn't exist yet)
    async getOrCreateWishlist(userId) {
        let wishlist = await WishlistModel.findOne({ userId });
        if (!wishlist) {
            wishlist = await WishlistModel.create({ userId, products: [] });
        }
        return wishlist;
    }

    // Get wishlist with populated products
    async getWishlist(userId) {
        const wishlist = await WishlistModel
            .findOne({ userId })
            .populate("products");
        return wishlist;
    }

    // Add a product to wishlist (avoid duplicates)
    async addProduct(userId, productId) {
        const wishlist = await this.getOrCreateWishlist(userId);
        const alreadyExists = wishlist.products.some(
            (id) => id?.toString() === productId?.toString()
        );
        if (alreadyExists) {
            return { wishlist, added: false };
        }
        wishlist.products.push(productId);
        await wishlist.save();
        return { wishlist, added: true };
    }

    // Remove a product from wishlist
    async removeProduct(userId, productId) {
        const wishlist = await WishlistModel.findOneAndUpdate(
            { userId },
            { $pull: { products: productId } },
            { new: true }
        ).populate("products");
        return wishlist;
    }

    // Clear entire wishlist
    async clearWishlist(userId) {
        return await WishlistModel.findOneAndUpdate(
            { userId },
            { $set: { products: [] } },
            { new: true }
        );
    }

    // Check if a specific product is in the wishlist
    async isProductWishlisted(userId, productId) {
        const wishlist = await WishlistModel.findOne({ userId });
        if (!wishlist) return false;
        return wishlist.products.some(
            (id) => id?.toString() === productId?.toString()
        );
    }
}
