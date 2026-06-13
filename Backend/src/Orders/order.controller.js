import { APIResponse } from "../util/api.response.js";
import { ApiError } from "../util/api.error.js";
import OrdersRepo from "./orders.repo.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '51g0jO6X7z2M75y67z2M75y6',
});

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
            
            const currentKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';

            const options = {
                amount: Math.round(result.totalAmount * 100), // amount in smallest currency unit
                currency: "INR",
                receipt: "receipt_" + new Date().getTime(),
            };
            
            const razorpayOrder = await razorpay.orders.create(options);
            
            return res
                .status(200)
                .json(new APIResponse(200, "Order is placed...", {
                    razorpayOrder,
                    orderIds: result.orders,
                    keyId: currentKeyId
                }));
        }
        catch (error) {
            console.error("Placeorder Error:", error);
            const errorMessage = error.error?.description || error.message || "Failed to create order";
            return res
                .status(400)
                .json(new ApiError(400, errorMessage, error));
        }
    }

    async VerifyPayment(req, res, next) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderIds } = req.body;
            
            const sign = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '51g0jO6X7z2M75y67z2M75y6')
                                       .update(sign.toString())
                                       .digest("hex");
                                       
            if (razorpay_signature === expectedSign) {
                await this._OrdersRepo.updateOrderStatus(orderIds, "Payement Done");
                return res.status(200).json(new APIResponse(200, "Payment verified successfully"));
            } else {
                return res.status(400).json(new ApiError(400, "Invalid signature"));
            }
        } catch (error) {
            return res.status(400).json(new ApiError(400, "Payment verification failed", error.message));
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


