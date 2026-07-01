import { APIResponse } from "../util/api.response.js";
import { ApiError } from "../util/api.error.js";
import OrdersRepo from "./orders.repo.js";
import orderModel from "./order.schema.js";
import { sendOrderToQikink, resolveQikinkVariantId } from "../services/qikink.service.js";

export default class Ordercontroller {
    _OrdersRepo;

    constructor() {
        this._OrdersRepo = new OrdersRepo();
    }

    async CreateCard(req, res, next) {
        try {
            const data = req.body;
            data.user = req.user?.UserID;

            const result = await this._OrdersRepo.createCard(data);

            return res
                .status(201)
                .json(new APIResponse(201, "Item added to cart", result));
        } catch (error) {
            return res
                .status(400)
                .json(new ApiError(400, "Failed to add item to cart", error.message));
        }
    }

    async ReadCard(req, res, next) {
        try {
            const userId = req.user?.UserID;
            const result = await this._OrdersRepo.readCards(userId);

            return res
                .status(200)
                .json(new APIResponse(200, "Cart fetched successfully", result));
        } catch (error) {
            return res
                .status(404)
                .json(new ApiError(404, "Cart not found", error.message));
        }
    }

    async DeleteCard(req, res, next) {
        try {
            const { id } = req.params;
            await this._OrdersRepo.deleteCards(id);

            return res
                .status(200)
                .json(new APIResponse(200, "Cart item deleted successfully"));
        } catch (error) {
            return res
                .status(404)
                .json(new ApiError(404, "Delete failed", error.message));
        }
    }

    async ClearCard(req, res, next) {
        try {
            const userId = req.user?.UserID;
            await this._OrdersRepo.deleteAll(userId);

            return res
                .status(200)
                .json(new APIResponse(200, "Cart cleared successfully"));
        } catch (error) {
            return res
                .status(400)
                .json(new ApiError(400, "Failed to clear cart", error.message));
        }

    }
    async UpdateCard(req, res, next) {
        try {
            const { id, quantity } = req.query;

            if (!id || !quantity) {
                return res
                    .status(400)
                    .json(new ApiError(400, "Cart item id and quantity are required"));
            }

            const result = await this._OrdersRepo.updateQuantity(
                id,
                Number(quantity)
            );

            if (!result) {
                return res
                    .status(404)
                    .json(new ApiError(404, "Cart item not found"));
            }

            return res
                .status(200)
                .json(new APIResponse(200, "Cart updated successfully", result));
        } catch (error) {
            return res
                .status(400)
                .json(new ApiError(400, "Update cart failed", error.message));
        }
    }

    //order controller
    async Placeorder(req, res, next) {
        try {
            const data = req.body;
            data.userId = req.user?.UserID;
            const result = await this._OrdersRepo.createorders(data);
            const orderIds = result.orders;

            // Mark all orders as confirmed
            await this._OrdersRepo.updateOrderStatus(orderIds, "Processing");

            // Push each order to Qikink for POD fulfillment
            const fulfillmentResults = [];
            for (const orderId of orderIds) {
                try {
                    const order = await orderModel
                        .findById(orderId)
                        .populate("productId");

                    if (!order) continue;

                    // Only push if the product has a Qikink variant mapped for this size
                    if (!resolveQikinkVariantId(order.productId, order.size)) {
                        console.warn(
                            `Skipping Qikink push for order ${orderId}: no Qikink variant for size "${order.size || "default"}"`
                        );
                        fulfillmentResults.push({ orderId, status: "skipped_no_variant" });
                        continue;
                    }

                    const qikinkResult = await sendOrderToQikink({
                        order,
                        product: order.productId,
                        shippingAddress: order.shippingAddress,
                    });

                    const qikinkOrderId = qikinkResult.qikinkOrderId;

                    await orderModel.findByIdAndUpdate(orderId, {
                        status: "Sent to Fulfillment",
                        qikinkOrderId,
                        fulfilledAt: new Date(),
                    });

                    fulfillmentResults.push({
                        orderId,
                        qikinkOrderId,
                        status: "sent",
                    });
                } catch (fulfillErr) {
                    console.error(`Qikink push failed for order ${orderId}:`, fulfillErr.message);
                    // Don't fail the whole order — log and continue
                    fulfillmentResults.push({ orderId, status: "fulfillment_failed", error: fulfillErr.message });
                }
            }

            return res.status(200).json(
                new APIResponse(200, "Order placed successfully", {
                    orderIds,
                    fulfillmentResults,
                })
            );
        } catch (error) {
            console.error("Placeorder Error:", error);
            return res
                .status(400)
                .json(new ApiError(400, error.message || "Failed to create order", error));
        }
    }

    async GetMyOrders(req, res, next) {
        try {
            const userId = req.user?.UserID;
            const result = await this._OrdersRepo.getUserOrders(userId);
            return res
                .status(200)
                .json(new APIResponse(200, "Your orders fetched successfully", result));
        } catch (error) {
            return res
                .status(400)
                .json(new ApiError(400, "Failed to fetch your orders", error.message));
        }
    }

    async GetAllOrdersAdmin(req, res, next) {
        try {
            const result = await this._OrdersRepo.getAllOrders();
            return res
                .status(200)
                .json(new APIResponse(200, "All orders fetched successfully", result));
        } catch (error) {
            return res
                .status(400)
                .json(new ApiError(400, "Failed to fetch orders", error.message));
        }
    }

    async DeleteOrderAdmin(req, res, next) {
        try {
            const { id } = req.params;
            await this._OrdersRepo.deleteOrderAdmin(id);
            return res.status(200).json(new APIResponse(200, "Order deleted successfully"));
        } catch (error) {
            return res.status(400).json(new ApiError(400, "Delete order failed", error.message));
        }
    }
}


