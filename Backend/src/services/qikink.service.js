import axios from "axios";

const BASE_URL = process.env.QIKINK_API_URL || "https://sandbox.qikink.com";

let cachedToken = null;
let tokenExpiry = null;

function assertQikinkCredentials() {
    if (!process.env.QIKINK_CLIENT_ID || !process.env.QIKINK_CLIENT_SECRET) {
        throw new Error("Qikink API credentials are not configured (QIKINK_CLIENT_ID / QIKINK_CLIENT_SECRET)");
    }
}

export function resolveQikinkVariantId(product, size) {
    if (!product) return null;

    if (size && product.qikinkVariantIds) {
        const sizeVariant =
            typeof product.qikinkVariantIds.get === "function"
                ? product.qikinkVariantIds.get(size)
                : product.qikinkVariantIds[size];

        if (sizeVariant) return sizeVariant;
    }

    return product.qikinkVariantId || null;
}

function validateShippingAddress(shippingAddress) {
    const required = ["fullName", "phone", "addressLine1", "city", "state", "postalCode"];
    const missing = required.filter((field) => !shippingAddress?.[field]);
    if (missing.length) {
        throw new Error(`Missing shipping fields for Qikink: ${missing.join(", ")}`);
    }
}

// ─── Authentication ───────────────────────────────────────────────────────────
async function getAccessToken() {
    assertQikinkCredentials();

    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    const response = await axios.post(`${BASE_URL}/api/authenticate`, {
        client_id: process.env.QIKINK_CLIENT_ID,
        client_secret: process.env.QIKINK_CLIENT_SECRET,
    });

    const { access_token, expires_in } = response.data;
    if (!access_token) {
        throw new Error("Qikink authentication failed: no access token returned");
    }

    cachedToken = access_token;
    tokenExpiry = Date.now() + ((expires_in || 3600) - 60) * 1000;
    return access_token;
}

function getHeaders(token) {
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

function extractQikinkOrderId(result) {
    return result?.id || result?.order_id || result?.data?.id || result?.data?.order_id || null;
}

// ─── Create Order ─────────────────────────────────────────────────────────────
export async function sendOrderToQikink({ order, product, shippingAddress }) {
    validateShippingAddress(shippingAddress);

    const variantId = resolveQikinkVariantId(product, order.size);
    if (!variantId) {
        throw new Error(
            order.size
                ? `No Qikink variant mapped for size "${order.size}"`
                : "No Qikink variant ID configured for product"
        );
    }

    const token = await getAccessToken();

    const payload = {
        reference_id: order._id.toString(),
        shipping_address: {
            name: shippingAddress.fullName,
            phone: shippingAddress.phone,
            address1: shippingAddress.addressLine1,
            address2: shippingAddress.addressLine2 || "",
            city: shippingAddress.city,
            state: shippingAddress.state,
            zip: shippingAddress.postalCode,
            country: shippingAddress.country || "IN",
        },
        line_items: [
            {
                variant_id: variantId,
                quantity: order.quantity,
            },
        ],
    };

    const response = await axios.post(`${BASE_URL}/api/orders`, payload, {
        headers: getHeaders(token),
    });

    return {
        ...response.data,
        resolvedVariantId: variantId,
        qikinkOrderId: extractQikinkOrderId(response.data),
    };
}

// ─── Get Order Status ─────────────────────────────────────────────────────────
export async function getQikinkOrderStatus(qikinkOrderId) {
    const token = await getAccessToken();

    const response = await axios.get(`${BASE_URL}/api/orders/${qikinkOrderId}`, {
        headers: getHeaders(token),
    });

    return response.data;
}

// ─── Get Products / Variants from Qikink ──────────────────────────────────────
export async function getQikinkProducts() {
    const token = await getAccessToken();

    const response = await axios.get(`${BASE_URL}/api/products`, {
        headers: getHeaders(token),
    });

    return response.data;
}

export async function getQikinkVariants(productId) {
    const token = await getAccessToken();

    const response = await axios.get(`${BASE_URL}/api/products/${productId}/variants`, {
        headers: getHeaders(token),
    });

    return response.data;
}
