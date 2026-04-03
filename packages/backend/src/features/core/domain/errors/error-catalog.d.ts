/**
 * Unified Error Catalog
 *
 * Centralized machine-readable error codes and default messages.
 */
export declare const ERROR_CATALOG: {
    readonly VALIDATION_INVALID_REQUEST: {
        readonly message: "Invalid request.";
        readonly httpStatus: 400;
    };
    readonly VALIDATION_INVALID_QUERY_PARAMS: {
        readonly message: "Invalid query parameters.";
        readonly httpStatus: 400;
    };
    readonly VALIDATION_INVALID_REQUEST_BODY: {
        readonly message: "Invalid request body.";
        readonly httpStatus: 400;
    };
    readonly VALIDATION_INVALID_ITEM_ID: {
        readonly message: "Invalid item id.";
        readonly httpStatus: 400;
    };
    readonly CATALOG_INVALID_PRODUCT_ID: {
        readonly message: "Invalid product id.";
        readonly httpStatus: 400;
    };
    readonly CATALOG_PRODUCT_NOT_FOUND: {
        readonly message: "Product not found.";
        readonly httpStatus: 404;
    };
    readonly CATALOG_VARIANT_PRICE_NOT_FOUND: {
        readonly message: "No price configured for this variant/UoM/customer group.";
        readonly httpStatus: 404;
    };
    readonly CATALOG_VARIANT_NOT_FOUND: {
        readonly message: "Variant not found.";
        readonly httpStatus: 404;
    };
    readonly CATALOG_VARIANT_UOMS_FETCH_FAILED: {
        readonly message: "Failed to retrieve variant UoMs.";
        readonly httpStatus: 500;
    };
    readonly CATALOG_VARIANT_UOMS_UPDATE_FAILED: {
        readonly message: "Failed to update variant UoMs.";
        readonly httpStatus: 500;
    };
    readonly CATALOG_VARIANT_PRICING_FETCH_FAILED: {
        readonly message: "Failed to retrieve variant pricing.";
        readonly httpStatus: 500;
    };
    readonly CATALOG_VARIANT_PRICING_UPDATE_FAILED: {
        readonly message: "Failed to update variant pricing.";
        readonly httpStatus: 500;
    };
    readonly CART_EMPTY: {
        readonly message: "Cart is empty.";
        readonly httpStatus: 400;
    };
    readonly CART_INSUFFICIENT_STOCK: {
        readonly message: "Insufficient stock.";
        readonly httpStatus: 400;
    };
    readonly CART_ADD_ITEM_FAILED: {
        readonly message: "Failed to add item to cart.";
        readonly httpStatus: 500;
    };
    readonly CART_UPDATE_ITEM_FAILED: {
        readonly message: "Failed to update cart item.";
        readonly httpStatus: 500;
    };
    readonly CART_REMOVE_ITEM_FAILED: {
        readonly message: "Failed to remove cart item.";
        readonly httpStatus: 500;
    };
    readonly REVIEW_NOT_FOUND: {
        readonly message: "Review not found.";
        readonly httpStatus: 404;
    };
    readonly REVIEW_INVALID_RATING: {
        readonly message: "Invalid review rating.";
        readonly httpStatus: 400;
    };
    readonly REVIEW_PURCHASE_REQUIRED: {
        readonly message: "Only customers who purchased this product can review it.";
        readonly httpStatus: 403;
    };
    readonly REVIEW_ALREADY_SUBMITTED: {
        readonly message: "You already reviewed this product.";
        readonly httpStatus: 409;
    };
    readonly REVIEW_INVALID_VOTER: {
        readonly message: "Invalid helpful vote payload.";
        readonly httpStatus: 400;
    };
    readonly REVIEW_FETCH_FAILED: {
        readonly message: "Failed to fetch product reviews.";
        readonly httpStatus: 500;
    };
    readonly REVIEW_CREATE_FAILED: {
        readonly message: "Failed to create review.";
        readonly httpStatus: 500;
    };
    readonly REVIEW_HELPFUL_FAILED: {
        readonly message: "Failed to mark review as helpful.";
        readonly httpStatus: 500;
    };
    readonly CHECKOUT_GUEST_EMAIL_REQUIRED: {
        readonly message: "Guest email is required for guest checkout.";
        readonly httpStatus: 400;
    };
    readonly CHECKOUT_VALIDATE_FAILED: {
        readonly message: "Checkout validation failed.";
        readonly httpStatus: 500;
    };
    readonly CHECKOUT_CREATE_ORDER_FAILED: {
        readonly message: "Failed to create order.";
        readonly httpStatus: 500;
    };
    readonly ACTION_PRODUCT_CREATE_FAILED: {
        readonly message: "Failed to create product.";
        readonly httpStatus: 500;
    };
    readonly ACTION_PRODUCT_UPDATE_FAILED: {
        readonly message: "Failed to update product.";
        readonly httpStatus: 500;
    };
    readonly ACTION_PRODUCT_DELETE_FAILED: {
        readonly message: "Failed to delete product.";
        readonly httpStatus: 500;
    };
    readonly ACTION_TAG_CREATE_FAILED: {
        readonly message: "Failed to create tag.";
        readonly httpStatus: 500;
    };
    readonly ACTION_TAG_UPDATE_FAILED: {
        readonly message: "Failed to update tag.";
        readonly httpStatus: 500;
    };
    readonly ACTION_TAG_DELETE_FAILED: {
        readonly message: "Failed to delete tag.";
        readonly httpStatus: 500;
    };
    readonly ACTION_COLLECTION_CREATE_FAILED: {
        readonly message: "Failed to create collection.";
        readonly httpStatus: 500;
    };
    readonly ACTION_COLLECTION_UPDATE_FAILED: {
        readonly message: "Failed to update collection.";
        readonly httpStatus: 500;
    };
    readonly ACTION_COLLECTION_DELETE_FAILED: {
        readonly message: "Failed to delete collection.";
        readonly httpStatus: 500;
    };
    readonly ACTION_COLLECTION_REORDER_FAILED: {
        readonly message: "Failed to reorder collections.";
        readonly httpStatus: 500;
    };
    readonly ACTION_ORDER_STATUS_UPDATE_FAILED: {
        readonly message: "Failed to update order status.";
        readonly httpStatus: 500;
    };
    readonly ACTION_ORDER_PAYMENT_STATUS_UPDATE_FAILED: {
        readonly message: "Failed to update order payment status.";
        readonly httpStatus: 500;
    };
    readonly AUTH_INVALID_CREDENTIALS: {
        readonly message: "Invalid email or password.";
        readonly httpStatus: 401;
    };
    readonly AUTH_ACCOUNT_NO_PASSWORD: {
        readonly message: "Account has no password set.";
        readonly httpStatus: 401;
    };
    readonly AUTH_EMAIL_ALREADY_REGISTERED: {
        readonly message: "Email already registered.";
        readonly httpStatus: 409;
    };
    readonly AUTH_UNAUTHORIZED: {
        readonly message: "Authentication required or session expired.";
        readonly httpStatus: 401;
    };
    readonly AUTH_ADMIN_REQUIRED: {
        readonly message: "Admin access required.";
        readonly httpStatus: 403;
    };
    readonly AUTH_TOKEN_REQUIRED: {
        readonly message: "Token is required.";
        readonly httpStatus: 400;
    };
    readonly AUTH_INVALID_TOKEN: {
        readonly message: "Invalid token.";
        readonly httpStatus: 401;
    };
    readonly AUTH_LOGIN_FAILED: {
        readonly message: "Login failed.";
        readonly httpStatus: 500;
    };
    readonly AUTH_REGISTER_FAILED: {
        readonly message: "Registration failed.";
        readonly httpStatus: 500;
    };
    readonly AUTH_REFRESH_FAILED: {
        readonly message: "Token refresh failed.";
        readonly httpStatus: 500;
    };
    readonly AUTH_ME_FETCH_FAILED: {
        readonly message: "Failed to fetch user session.";
        readonly httpStatus: 500;
    };
    readonly AUTH_GUEST_SESSION_FAILED: {
        readonly message: "Failed to create guest session.";
        readonly httpStatus: 500;
    };
    readonly SYSTEM_UNEXPECTED_ERROR: {
        readonly message: "Unexpected system error.";
        readonly httpStatus: 500;
    };
};
export type AppErrorCode = keyof typeof ERROR_CATALOG;
export interface AppErrorPayload {
    errorCode: AppErrorCode;
    message: string;
    details?: Record<string, unknown>;
}
/**
 * Returns catalog metadata for a code.
 */
export declare function getErrorDefinition(code: AppErrorCode): {
    readonly message: "Invalid request.";
    readonly httpStatus: 400;
} | {
    readonly message: "Invalid query parameters.";
    readonly httpStatus: 400;
} | {
    readonly message: "Invalid request body.";
    readonly httpStatus: 400;
} | {
    readonly message: "Invalid item id.";
    readonly httpStatus: 400;
} | {
    readonly message: "Invalid product id.";
    readonly httpStatus: 400;
} | {
    readonly message: "Product not found.";
    readonly httpStatus: 404;
} | {
    readonly message: "No price configured for this variant/UoM/customer group.";
    readonly httpStatus: 404;
} | {
    readonly message: "Variant not found.";
    readonly httpStatus: 404;
} | {
    readonly message: "Failed to retrieve variant UoMs.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to update variant UoMs.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to retrieve variant pricing.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to update variant pricing.";
    readonly httpStatus: 500;
} | {
    readonly message: "Cart is empty.";
    readonly httpStatus: 400;
} | {
    readonly message: "Insufficient stock.";
    readonly httpStatus: 400;
} | {
    readonly message: "Failed to add item to cart.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to update cart item.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to remove cart item.";
    readonly httpStatus: 500;
} | {
    readonly message: "Review not found.";
    readonly httpStatus: 404;
} | {
    readonly message: "Invalid review rating.";
    readonly httpStatus: 400;
} | {
    readonly message: "Only customers who purchased this product can review it.";
    readonly httpStatus: 403;
} | {
    readonly message: "You already reviewed this product.";
    readonly httpStatus: 409;
} | {
    readonly message: "Invalid helpful vote payload.";
    readonly httpStatus: 400;
} | {
    readonly message: "Failed to fetch product reviews.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to create review.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to mark review as helpful.";
    readonly httpStatus: 500;
} | {
    readonly message: "Guest email is required for guest checkout.";
    readonly httpStatus: 400;
} | {
    readonly message: "Checkout validation failed.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to create order.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to create product.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to update product.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to delete product.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to create tag.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to update tag.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to delete tag.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to create collection.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to update collection.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to delete collection.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to reorder collections.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to update order status.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to update order payment status.";
    readonly httpStatus: 500;
} | {
    readonly message: "Invalid email or password.";
    readonly httpStatus: 401;
} | {
    readonly message: "Account has no password set.";
    readonly httpStatus: 401;
} | {
    readonly message: "Email already registered.";
    readonly httpStatus: 409;
} | {
    readonly message: "Authentication required or session expired.";
    readonly httpStatus: 401;
} | {
    readonly message: "Admin access required.";
    readonly httpStatus: 403;
} | {
    readonly message: "Token is required.";
    readonly httpStatus: 400;
} | {
    readonly message: "Invalid token.";
    readonly httpStatus: 401;
} | {
    readonly message: "Login failed.";
    readonly httpStatus: 500;
} | {
    readonly message: "Registration failed.";
    readonly httpStatus: 500;
} | {
    readonly message: "Token refresh failed.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to fetch user session.";
    readonly httpStatus: 500;
} | {
    readonly message: "Failed to create guest session.";
    readonly httpStatus: 500;
} | {
    readonly message: "Unexpected system error.";
    readonly httpStatus: 500;
};
/**
 * Resolves a user-safe error message from unknown errors.
 */
export declare function resolveErrorMessage(error: unknown, fallbackCode: AppErrorCode): string;
