import express from "express";
import orderModel from "./order.schema.js";

const webhookRouter = express.Router();

const statusMap = {
    pending: "Pending",
    processing: "Processing",
    printed: "Processing",
    "sent to fulfillment": "Sent to Fulfillment",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    canceled: "Cancelled",
};

function mapQikinkStatus(status) {
    if (!status) return null;
    return statusMap[status.toLowerCase()] || null;
}

// ─── Qikink Webhook ──────────────────────────────────────────────────────────
// Register in Qikink Dashboard → Settings → Webhooks
// URL: https://yourdomain.com/api/webhook/qikink
webhookRouter.post("/qikink", async (req, res) => {
    try {
        const webhookSecret = process.env.QIKINK_WEBHOOK_SECRET;
        if (webhookSecret) {
            const incomingSecret =
                req.headers["x-qikink-signature"] ||
                req.headers["x-webhook-secret"] ||
                req.body?.secret;

            if (incomingSecret !== webhookSecret) {
                return res.status(401).json({ error: "Invalid webhook secret" });
            }
        }

        const {
            reference_id,
            order_id,
            status,
            tracking_number,
            tracking_url,
            courier_name,
        } = req.body;

        console.log(
            `[Qikink Webhook] reference_id=${reference_id}, order_id=${order_id}, status=${status}, tracking=${tracking_number || "N/A"}`
        );

        const updateData = {};
        const mappedStatus = mapQikinkStatus(status);

        if (mappedStatus) updateData.status = mappedStatus;
        if (tracking_number) updateData.trackingNumber = tracking_number;
        if (tracking_url) updateData.trackingUrl = tracking_url;
        if (courier_name) updateData.courierName = courier_name;
        if (order_id) updateData.qikinkOrderId = String(order_id);

        if (!reference_id && !order_id) {
            return res.status(400).json({ error: "reference_id or order_id is required" });
        }

        let updatedOrder = null;

        if (reference_id) {
            updatedOrder = await orderModel.findByIdAndUpdate(reference_id, updateData, { new: true });
        }

        if (!updatedOrder && order_id) {
            updatedOrder = await orderModel.findOneAndUpdate(
                { qikinkOrderId: String(order_id) },
                updateData,
                { new: true }
            );
        }

        if (!updatedOrder) {
            console.warn(`[Qikink Webhook] No matching order for reference_id=${reference_id}, order_id=${order_id}`);
            return res.status(404).json({ error: "Order not found" });
        }

        console.log(`[Qikink Webhook] Order ${updatedOrder._id} updated → ${mappedStatus || status}`);
        return res.status(200).json({ received: true });
    } catch (err) {
        console.error("[Qikink Webhook] Error:", err.message);
        return res.status(500).json({ error: "Webhook processing failed" });
    }
});

export default webhookRouter;
