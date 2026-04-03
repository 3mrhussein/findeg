/**
 * Unified Error Catalog
 *
 * Centralized machine-readable error codes and default messages.
 */
export const ERROR_CATALOG = {
    VALIDATION_INVALID_REQUEST: {
        message: "Invalid request.",
        httpStatus: 400,
    },
    VALIDATION_INVALID_QUERY_PARAMS: {
        message: "Invalid query parameters.",
        httpStatus: 400,
    },
    VALIDATION_INVALID_REQUEST_BODY: {
        message: "Invalid request body.",
        httpStatus: 400,
    },
    VALIDATION_INVALID_ITEM_ID: {
        message: "Invalid item id.",
        httpStatus: 400,
    },
    CATALOG_INVALID_PRODUCT_ID: {
        message: "Invalid product id.",
        httpStatus: 400,
    },
    CATALOG_PRODUCT_NOT_FOUND: {
        message: "Product not found.",
        httpStatus: 404,
    },
    CATALOG_VARIANT_PRICE_NOT_FOUND: {
        message: "No price configured for this variant/UoM/customer group.",
        httpStatus: 404,
    },
    CATALOG_VARIANT_NOT_FOUND: {
        message: "Variant not found.",
        httpStatus: 404,
    },
    CATALOG_VARIANT_UOMS_FETCH_FAILED: {
        message: "Failed to retrieve variant UoMs.",
        httpStatus: 500,
    },
    CATALOG_VARIANT_UOMS_UPDATE_FAILED: {
        message: "Failed to update variant UoMs.",
        httpStatus: 500,
    },
    CATALOG_VARIANT_PRICING_FETCH_FAILED: {
        message: "Failed to retrieve variant pricing.",
        httpStatus: 500,
    },
    CATALOG_VARIANT_PRICING_UPDATE_FAILED: {
        message: "Failed to update variant pricing.",
        httpStatus: 500,
    },
    CART_EMPTY: {
        message: "Cart is empty.",
        httpStatus: 400,
    },
    CART_INSUFFICIENT_STOCK: {
        message: "Insufficient stock.",
        httpStatus: 400,
    },
    CART_ADD_ITEM_FAILED: {
        message: "Failed to add item to cart.",
        httpStatus: 500,
    },
    CART_UPDATE_ITEM_FAILED: {
        message: "Failed to update cart item.",
        httpStatus: 500,
    },
    CART_REMOVE_ITEM_FAILED: {
        message: "Failed to remove cart item.",
        httpStatus: 500,
    },
    REVIEW_NOT_FOUND: {
        message: "Review not found.",
        httpStatus: 404,
    },
    REVIEW_INVALID_RATING: {
        message: "Invalid review rating.",
        httpStatus: 400,
    },
    REVIEW_PURCHASE_REQUIRED: {
        message: "Only customers who purchased this product can review it.",
        httpStatus: 403,
    },
    REVIEW_ALREADY_SUBMITTED: {
        message: "You already reviewed this product.",
        httpStatus: 409,
    },
    REVIEW_INVALID_VOTER: {
        message: "Invalid helpful vote payload.",
        httpStatus: 400,
    },
    REVIEW_FETCH_FAILED: {
        message: "Failed to fetch product reviews.",
        httpStatus: 500,
    },
    REVIEW_CREATE_FAILED: {
        message: "Failed to create review.",
        httpStatus: 500,
    },
    REVIEW_HELPFUL_FAILED: {
        message: "Failed to mark review as helpful.",
        httpStatus: 500,
    },
    CHECKOUT_GUEST_EMAIL_REQUIRED: {
        message: "Guest email is required for guest checkout.",
        httpStatus: 400,
    },
    CHECKOUT_VALIDATE_FAILED: {
        message: "Checkout validation failed.",
        httpStatus: 500,
    },
    CHECKOUT_CREATE_ORDER_FAILED: {
        message: "Failed to create order.",
        httpStatus: 500,
    },
    ACTION_PRODUCT_CREATE_FAILED: {
        message: "Failed to create product.",
        httpStatus: 500,
    },
    ACTION_PRODUCT_UPDATE_FAILED: {
        message: "Failed to update product.",
        httpStatus: 500,
    },
    ACTION_PRODUCT_DELETE_FAILED: {
        message: "Failed to delete product.",
        httpStatus: 500,
    },
    ACTION_TAG_CREATE_FAILED: {
        message: "Failed to create tag.",
        httpStatus: 500,
    },
    ACTION_TAG_UPDATE_FAILED: {
        message: "Failed to update tag.",
        httpStatus: 500,
    },
    ACTION_TAG_DELETE_FAILED: {
        message: "Failed to delete tag.",
        httpStatus: 500,
    },
    ACTION_COLLECTION_CREATE_FAILED: {
        message: "Failed to create collection.",
        httpStatus: 500,
    },
    ACTION_COLLECTION_UPDATE_FAILED: {
        message: "Failed to update collection.",
        httpStatus: 500,
    },
    ACTION_COLLECTION_DELETE_FAILED: {
        message: "Failed to delete collection.",
        httpStatus: 500,
    },
    ACTION_COLLECTION_REORDER_FAILED: {
        message: "Failed to reorder collections.",
        httpStatus: 500,
    },
    ACTION_ORDER_STATUS_UPDATE_FAILED: {
        message: "Failed to update order status.",
        httpStatus: 500,
    },
    ACTION_ORDER_PAYMENT_STATUS_UPDATE_FAILED: {
        message: "Failed to update order payment status.",
        httpStatus: 500,
    },
    AUTH_INVALID_CREDENTIALS: {
        message: "Invalid email or password.",
        httpStatus: 401,
    },
    AUTH_ACCOUNT_NO_PASSWORD: {
        message: "Account has no password set.",
        httpStatus: 401,
    },
    AUTH_EMAIL_ALREADY_REGISTERED: {
        message: "Email already registered.",
        httpStatus: 409,
    },
    AUTH_UNAUTHORIZED: {
        message: "Authentication required or session expired.",
        httpStatus: 401,
    },
    AUTH_ADMIN_REQUIRED: {
        message: "Admin access required.",
        httpStatus: 403,
    },
    AUTH_TOKEN_REQUIRED: {
        message: "Token is required.",
        httpStatus: 400,
    },
    AUTH_INVALID_TOKEN: {
        message: "Invalid token.",
        httpStatus: 401,
    },
    AUTH_LOGIN_FAILED: {
        message: "Login failed.",
        httpStatus: 500,
    },
    AUTH_REGISTER_FAILED: {
        message: "Registration failed.",
        httpStatus: 500,
    },
    AUTH_REFRESH_FAILED: {
        message: "Token refresh failed.",
        httpStatus: 500,
    },
    AUTH_ME_FETCH_FAILED: {
        message: "Failed to fetch user session.",
        httpStatus: 500,
    },
    AUTH_GUEST_SESSION_FAILED: {
        message: "Failed to create guest session.",
        httpStatus: 500,
    },
    SYSTEM_UNEXPECTED_ERROR: {
        message: "Unexpected system error.",
        httpStatus: 500,
    },
};
/**
 * Returns catalog metadata for a code.
 */
export function getErrorDefinition(code) {
    return ERROR_CATALOG[code];
}
/**
 * Resolves a user-safe error message from unknown errors.
 */
export function resolveErrorMessage(error, fallbackCode) {
    var _a;
    if (error instanceof Error && ((_a = error.message) === null || _a === void 0 ? void 0 : _a.trim())) {
        return error.message;
    }
    return ERROR_CATALOG[fallbackCode].message;
}
