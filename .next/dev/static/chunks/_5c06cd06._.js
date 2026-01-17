(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// A simple utility function to merge class names, inspired by clsx and tailwind-merge.
// This is a core utility for building components with variants, as seen in shadcn/ui.
__turbopack_context__.s([
    "cn",
    ()=>cn
]);
function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
// Simplified CVA (Class Variance Authority)
const buttonVariants = ({ variant, size, className })=>{
    const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
    const variants = {
        default: "bg-primary text-white shadow hover:bg-primary/90",
        destructive: "bg-red-500 text-white shadow-sm hover:bg-red-500/90",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-white shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
    };
    const sizes = {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
    };
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(base, variants[variant || 'default'], sizes[size || 'default'], className);
};
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c = ({ className, variant = 'default', size = 'default', ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        className: buttonVariants({
            variant,
            size,
            className
        }),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 35,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Button;
Button.displayName = 'Button';
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$React.forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layout/Container.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Container",
    ()=>Container
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
;
;
const Container = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(4);
    if ($[0] !== "8e305fc500187552bf26d839bc7357e9284807457012caa6d41861115940d601") {
        for(let $i = 0; $i < 4; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "8e305fc500187552bf26d839bc7357e9284807457012caa6d41861115940d601";
    }
    const { children, className: t1 } = t0;
    const className = t1 === undefined ? "" : t1;
    const t2 = `container mx-auto px-4 sm:px-6 lg:px-8 ${className}`;
    let t3;
    if ($[1] !== children || $[2] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t2,
            children: children
        }, void 0, false, {
            fileName: "[project]/components/layout/Container.tsx",
            lineNumber: 23,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = children;
        $[2] = t2;
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    return t3;
};
_c = Container;
var _c;
__turbopack_context__.k.register(_c, "Container");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useTheme.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$providers$2f$ThemeProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/providers/ThemeProvider.tsx [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
const useTheme = ()=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(1);
    if ($[0] !== "b555f5a6e6cb33f2b8c579ade1dfbd67227744914dfd9e23b25bb86ce290b0ca") {
        for(let $i = 0; $i < 1; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "b555f5a6e6cb33f2b8c579ade1dfbd67227744914dfd9e23b25bb86ce290b0ca";
    }
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$providers$2f$ThemeProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeContext"]);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
_s(useTheme, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useTranslation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTranslation",
    ()=>useTranslation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$providers$2f$I18nProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/providers/I18nProvider.tsx [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
const useTranslation = ()=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(1);
    if ($[0] !== "4f8a5f48f352a7f8cf267970ed3c150d8c916d9da4db9c10e010fc08585502a7") {
        for(let $i = 0; $i < 1; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "4f8a5f48f352a7f8cf267970ed3c150d8c916d9da4db9c10e010fc08585502a7";
    }
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$providers$2f$I18nProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["I18nContext"]);
    if (!context) {
        throw new Error("useTranslation must be used within an I18nProvider");
    }
    return context;
};
_s(useTranslation, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useCart.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCart",
    ()=>useCart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$providers$2f$CartProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/providers/CartProvider.tsx [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
const useCart = ()=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(1);
    if ($[0] !== "48b3c56b34777a1201e2308b1e8206980eae550e8ae58d818c8e7c8554fd3332") {
        for(let $i = 0; $i < 1; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "48b3c56b34777a1201e2308b1e8206980eae550e8ae58d818c8e7c8554fd3332";
    }
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$providers$2f$CartProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartContext"]);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
_s(useCart, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useCountUp.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCountUp",
    ()=>useCountUp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
const useCountUp = (endValue, t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(5);
    if ($[0] !== "e0578fc302fadf6dd1b4c3a76fd654677e7757ddd859ea41b080746f4b8e86e2") {
        for(let $i = 0; $i < 5; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "e0578fc302fadf6dd1b4c3a76fd654677e7757ddd859ea41b080746f4b8e86e2";
    }
    const duration = t0 === undefined ? 2000 : t0;
    const [count, setCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const requestRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    const startTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(undefined);
    let t1;
    let t2;
    if ($[1] !== duration || $[2] !== endValue) {
        t1 = ()=>{
            const animate = (timestamp)=>{
                if (startTimeRef.current === undefined) {
                    startTimeRef.current = timestamp;
                }
                const elapsedTime = timestamp - (startTimeRef.current ?? 0);
                const progress = Math.min(elapsedTime / duration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const currentVal = easedProgress * endValue;
                setCount(currentVal);
                if (elapsedTime < duration) {
                    requestRef.current = requestAnimationFrame(animate);
                }
            };
            startTimeRef.current = undefined;
            requestRef.current = requestAnimationFrame(animate);
            return ()=>{
                if (requestRef.current) {
                    cancelAnimationFrame(requestRef.current);
                }
            };
        };
        t2 = [
            endValue,
            duration
        ];
        $[1] = duration;
        $[2] = endValue;
        $[3] = t1;
        $[4] = t2;
    } else {
        t1 = $[3];
        t2 = $[4];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t1, t2);
    return count;
};
_s(useCountUp, "349SG7QEBFgYgJIOQisUgM3j3Oo=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useProducts.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useProducts",
    ()=>useProducts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
const useProducts = (initialProducts)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(7);
    if ($[0] !== "7e1bc5bec3fa2aab80496d853c718f9c626c12c8606dc6e2ff9d1665b0b3fe26") {
        for(let $i = 0; $i < 7; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7e1bc5bec3fa2aab80496d853c718f9c626c12c8606dc6e2ff9d1665b0b3fe26";
    }
    const [filteredProducts, setFilteredProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialProducts);
    const [sortOption, setSortOption] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("featured");
    let sortable;
    if ($[1] !== filteredProducts || $[2] !== sortOption) {
        sortable = [
            ...filteredProducts
        ];
        bb0: switch(sortOption){
            case "newest":
                {
                    sortable.sort(_temp);
                    break bb0;
                }
            case "price-asc":
                {
                    sortable.sort(_temp2);
                    break bb0;
                }
            case "price-desc":
                {
                    sortable.sort(_temp3);
                    break bb0;
                }
            case "featured":
            default:
        }
        $[1] = filteredProducts;
        $[2] = sortOption;
        $[3] = sortable;
    } else {
        sortable = $[3];
    }
    const sortedProducts = sortable;
    let t0;
    if ($[4] !== sortOption || $[5] !== sortedProducts) {
        t0 = {
            sortedProducts,
            sortOption,
            setSortOption,
            setFilteredProducts
        };
        $[4] = sortOption;
        $[5] = sortedProducts;
        $[6] = t0;
    } else {
        t0 = $[6];
    }
    return t0;
};
_s(useProducts, "ZZpjqyN1gxmdKvXmeCvDAFRV1Zg=");
function _temp(a_1, b_1) {
    return (b_1.isNew === true ? 1 : -1) - (a_1.isNew === true ? 1 : -1);
}
function _temp2(a_0, b_0) {
    return a_0.price - b_0.price;
}
function _temp3(a, b) {
    return b.price - a.price;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/usePagination.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePagination",
    ()=>usePagination
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
const usePagination = (data, itemsPerPage)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(17);
    if ($[0] !== "dcd0f607b24e68500c3217f7fbc11186dd5d4f8927545a03a2f960059a87ac6a") {
        for(let $i = 0; $i < 17; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "dcd0f607b24e68500c3217f7fbc11186dd5d4f8927545a03a2f960059a87ac6a";
    }
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    let t0;
    bb0: {
        if (data.length === 0) {
            t0 = 1;
            break bb0;
        }
        t0 = Math.ceil(data.length / itemsPerPage);
    }
    const totalPages = t0;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    let t1;
    if ($[1] !== data || $[2] !== endIndex || $[3] !== startIndex) {
        t1 = data.slice(startIndex, endIndex);
        $[1] = data;
        $[2] = endIndex;
        $[3] = startIndex;
        $[4] = t1;
    } else {
        t1 = $[4];
    }
    const currentPageData = t1;
    let t2;
    if ($[5] !== totalPages) {
        t2 = ()=>{
            setCurrentPage((prev)=>Math.min(prev + 1, totalPages));
        };
        $[5] = totalPages;
        $[6] = t2;
    } else {
        t2 = $[6];
    }
    const nextPage = t2;
    let t3;
    if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = ()=>{
            setCurrentPage(_temp);
        };
        $[7] = t3;
    } else {
        t3 = $[7];
    }
    const prevPage = t3;
    let t4;
    let t5;
    if ($[8] !== currentPage || $[9] !== totalPages) {
        t4 = ()=>{
            if (totalPages > 0 && currentPage > totalPages) {
                setCurrentPage(1);
            }
        };
        t5 = [
            currentPage,
            totalPages
        ];
        $[8] = currentPage;
        $[9] = totalPages;
        $[10] = t4;
        $[11] = t5;
    } else {
        t4 = $[10];
        t5 = $[11];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t4, t5);
    let t6;
    if ($[12] !== currentPage || $[13] !== currentPageData || $[14] !== nextPage || $[15] !== totalPages) {
        t6 = {
            currentPage,
            totalPages,
            setCurrentPage,
            nextPage,
            prevPage,
            currentPageData
        };
        $[12] = currentPage;
        $[13] = currentPageData;
        $[14] = nextPage;
        $[15] = totalPages;
        $[16] = t6;
    } else {
        t6 = $[16];
    }
    return t6;
};
_s(usePagination, "GDYsIxij9y/ZFL42bMqqthZmeP4=");
function _temp(prev_0) {
    return Math.max(prev_0 - 1, 1);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useUser.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useUser",
    ()=>useUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$providers$2f$UserProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/providers/UserProvider.tsx [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
const useUser = ()=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(1);
    if ($[0] !== "5791f92cd30793e8705316387cd5708baa98c293b6ab7762e12e66438c97bfe6") {
        for(let $i = 0; $i < 1; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "5791f92cd30793e8705316387cd5708baa98c293b6ab7762e12e66438c97bfe6";
    }
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$providers$2f$UserProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UserContext"]);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
_s(useUser, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTheme$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTheme.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useCart.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCountUp$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useCountUp.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useProducts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useProducts.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$usePagination$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/usePagination.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useUser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useUser.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/organisms/Hero.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Hero",
    ()=>Hero,
    "HeroUI",
    ()=>HeroUI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Container$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/Container.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const HeroUI = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(28);
    if ($[0] !== "af0cde75ac9f36b1f9ba0ea96371382ffd12f5b1e041130665f1f4ba04f2fa15") {
        for(let $i = 0; $i < 28; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "af0cde75ac9f36b1f9ba0ea96371382ffd12f5b1e041130665f1f4ba04f2fa15";
    }
    const { imageUrl, titlePart1, titleLearning, titlePlay, subtitle, shopButtonText, exploreButtonText, onShopClick } = t0;
    let t1;
    if ($[1] !== titleLearning) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-primary",
            children: titleLearning
        }, void 0, false, {
            fileName: "[project]/components/organisms/Hero.tsx",
            lineNumber: 39,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = titleLearning;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    let t2;
    if ($[3] !== titlePlay) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-secondary",
            children: titlePlay
        }, void 0, false, {
            fileName: "[project]/components/organisms/Hero.tsx",
            lineNumber: 47,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = titlePlay;
        $[4] = t2;
    } else {
        t2 = $[4];
    }
    let t3;
    if ($[5] !== t1 || $[6] !== t2 || $[7] !== titlePart1) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
            className: "text-4xl md:text-6xl font-bold text-foreground leading-tight",
            children: [
                titlePart1,
                " ",
                t1,
                " & ",
                t2
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Hero.tsx",
            lineNumber: 55,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[5] = t1;
        $[6] = t2;
        $[7] = titlePart1;
        $[8] = t3;
    } else {
        t3 = $[8];
    }
    let t4;
    if ($[9] !== subtitle) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0",
            children: subtitle
        }, void 0, false, {
            fileName: "[project]/components/organisms/Hero.tsx",
            lineNumber: 65,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[9] = subtitle;
        $[10] = t4;
    } else {
        t4 = $[10];
    }
    let t5;
    if ($[11] !== onShopClick || $[12] !== shopButtonText) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            size: "lg",
            onClick: onShopClick,
            children: shopButtonText
        }, void 0, false, {
            fileName: "[project]/components/organisms/Hero.tsx",
            lineNumber: 73,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[11] = onShopClick;
        $[12] = shopButtonText;
        $[13] = t5;
    } else {
        t5 = $[13];
    }
    let t6;
    if ($[14] !== exploreButtonText) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "outline",
            size: "lg",
            onClick: _temp,
            children: exploreButtonText
        }, void 0, false, {
            fileName: "[project]/components/organisms/Hero.tsx",
            lineNumber: 82,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[14] = exploreButtonText;
        $[15] = t6;
    } else {
        t6 = $[15];
    }
    let t7;
    if ($[16] !== t5 || $[17] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4",
            children: [
                t5,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Hero.tsx",
            lineNumber: 90,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[16] = t5;
        $[17] = t6;
        $[18] = t7;
    } else {
        t7 = $[18];
    }
    let t8;
    if ($[19] !== t3 || $[20] !== t4 || $[21] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center lg:text-left",
            children: [
                t3,
                t4,
                t7
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Hero.tsx",
            lineNumber: 99,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[19] = t3;
        $[20] = t4;
        $[21] = t7;
        $[22] = t8;
    } else {
        t8 = $[22];
    }
    let t9;
    if ($[23] !== imageUrl) {
        t9 = imageUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "hidden lg:flex justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative w-[450px] h-[450px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-3xl opacity-30"
                    }, void 0, false, {
                        fileName: "[project]/components/organisms/Hero.tsx",
                        lineNumber: 109,
                        columnNumber: 115
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: imageUrl,
                        alt: "FindEg.com hero image",
                        className: "relative w-full h-full object-cover rounded-2xl shadow-xl transform rotate-3"
                    }, void 0, false, {
                        fileName: "[project]/components/organisms/Hero.tsx",
                        lineNumber: 109,
                        columnNumber: 228
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/organisms/Hero.tsx",
                lineNumber: 109,
                columnNumber: 69
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/organisms/Hero.tsx",
            lineNumber: 109,
            columnNumber: 22
        }, ("TURBOPACK compile-time value", void 0));
        $[23] = imageUrl;
        $[24] = t9;
    } else {
        t9 = $[24];
    }
    let t10;
    if ($[25] !== t8 || $[26] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: "bg-muted dark:bg-card/50 overflow-hidden",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Container$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Container"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24",
                    children: [
                        t8,
                        t9
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/organisms/Hero.tsx",
                    lineNumber: 117,
                    columnNumber: 84
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/organisms/Hero.tsx",
                lineNumber: 117,
                columnNumber: 73
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/organisms/Hero.tsx",
            lineNumber: 117,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[25] = t8;
        $[26] = t9;
        $[27] = t10;
    } else {
        t10 = $[27];
    }
    return t10;
};
_c = HeroUI;
const Hero = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(24);
    if ($[0] !== "af0cde75ac9f36b1f9ba0ea96371382ffd12f5b1e041130665f1f4ba04f2fa15") {
        for(let $i = 0; $i < 24; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "af0cde75ac9f36b1f9ba0ea96371382ffd12f5b1e041130665f1f4ba04f2fa15";
    }
    const { imageUrl } = t0;
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    let t1;
    if ($[1] !== router) {
        t1 = ()=>{
            router.push("/shop");
        };
        $[1] = router;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const handleShopClick = t1;
    let t2;
    if ($[3] !== t) {
        t2 = t("hero_title_part1");
        $[3] = t;
        $[4] = t2;
    } else {
        t2 = $[4];
    }
    let t3;
    if ($[5] !== t) {
        t3 = t("hero_title_learning");
        $[5] = t;
        $[6] = t3;
    } else {
        t3 = $[6];
    }
    let t4;
    if ($[7] !== t) {
        t4 = t("hero_title_play");
        $[7] = t;
        $[8] = t4;
    } else {
        t4 = $[8];
    }
    let t5;
    if ($[9] !== t) {
        t5 = t("hero_subtitle");
        $[9] = t;
        $[10] = t5;
    } else {
        t5 = $[10];
    }
    let t6;
    if ($[11] !== t) {
        t6 = t("hero_button_shop");
        $[11] = t;
        $[12] = t6;
    } else {
        t6 = $[12];
    }
    let t7;
    if ($[13] !== t) {
        t7 = t("hero_button_explore");
        $[13] = t;
        $[14] = t7;
    } else {
        t7 = $[14];
    }
    let t8;
    if ($[15] !== handleShopClick || $[16] !== imageUrl || $[17] !== t2 || $[18] !== t3 || $[19] !== t4 || $[20] !== t5 || $[21] !== t6 || $[22] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(HeroUI, {
            imageUrl: imageUrl,
            titlePart1: t2,
            titleLearning: t3,
            titlePlay: t4,
            subtitle: t5,
            shopButtonText: t6,
            exploreButtonText: t7,
            onShopClick: handleShopClick
        }, void 0, false, {
            fileName: "[project]/components/organisms/Hero.tsx",
            lineNumber: 205,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[15] = handleShopClick;
        $[16] = imageUrl;
        $[17] = t2;
        $[18] = t3;
        $[19] = t4;
        $[20] = t5;
        $[21] = t6;
        $[22] = t7;
        $[23] = t8;
    } else {
        t8 = $[23];
    }
    return t8;
};
_s(Hero, "rZOoNnNNKuTtxJzRzd4A3w4GsCM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c1 = Hero;
function _temp() {
    return document.querySelector("#categories")?.scrollIntoView({
        behavior: "smooth"
    });
}
var _c, _c1;
__turbopack_context__.k.register(_c, "HeroUI");
__turbopack_context__.k.register(_c1, "Hero");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/atoms/Price.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Price",
    ()=>Price
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
;
;
const Price = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(21);
    if ($[0] !== "56b81a67d3422c84156231ac7b907d8ddafde30f87cb99fb4158ae44f77e5a3d") {
        for(let $i = 0; $i < 21; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "56b81a67d3422c84156231ac7b907d8ddafde30f87cb99fb4158ae44f77e5a3d";
    }
    const { price, strikePrice, currency: t1, className: t2 } = t0;
    const currency = t1 === undefined ? "$" : t1;
    const className = t2 === undefined ? "" : t2;
    const hasDiscount = typeof strikePrice === "number" && strikePrice > price;
    if (hasDiscount) {
        const t3 = `flex items-baseline gap-2 ${className}`;
        let t4;
        if ($[1] !== price) {
            t4 = price.toFixed(2);
            $[1] = price;
            $[2] = t4;
        } else {
            t4 = $[2];
        }
        let t5;
        if ($[3] !== currency || $[4] !== t4) {
            t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-2xl font-bold text-primary",
                children: [
                    currency,
                    t4
                ]
            }, void 0, true, {
                fileName: "[project]/components/atoms/Price.tsx",
                lineNumber: 38,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[3] = currency;
            $[4] = t4;
            $[5] = t5;
        } else {
            t5 = $[5];
        }
        let t6;
        if ($[6] !== strikePrice) {
            t6 = strikePrice.toFixed(2);
            $[6] = strikePrice;
            $[7] = t6;
        } else {
            t6 = $[7];
        }
        let t7;
        if ($[8] !== currency || $[9] !== t6) {
            t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-lg font-medium text-muted-foreground line-through",
                children: [
                    currency,
                    t6
                ]
            }, void 0, true, {
                fileName: "[project]/components/atoms/Price.tsx",
                lineNumber: 55,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[8] = currency;
            $[9] = t6;
            $[10] = t7;
        } else {
            t7 = $[10];
        }
        let t8;
        if ($[11] !== t3 || $[12] !== t5 || $[13] !== t7) {
            t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: t3,
                children: [
                    t5,
                    t7
                ]
            }, void 0, true, {
                fileName: "[project]/components/atoms/Price.tsx",
                lineNumber: 64,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[11] = t3;
            $[12] = t5;
            $[13] = t7;
            $[14] = t8;
        } else {
            t8 = $[14];
        }
        return t8;
    }
    const t3 = `text-2xl font-bold text-primary ${className}`;
    let t4;
    if ($[15] !== price) {
        t4 = price.toFixed(2);
        $[15] = price;
        $[16] = t4;
    } else {
        t4 = $[16];
    }
    let t5;
    if ($[17] !== currency || $[18] !== t3 || $[19] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: t3,
            children: [
                currency,
                t4
            ]
        }, void 0, true, {
            fileName: "[project]/components/atoms/Price.tsx",
            lineNumber: 85,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[17] = currency;
        $[18] = t3;
        $[19] = t4;
        $[20] = t5;
    } else {
        t5 = $[20];
    }
    return t5;
};
_c = Price;
var _c;
__turbopack_context__.k.register(_c, "Price");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/atoms/DiscountBadge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DiscountBadge",
    ()=>DiscountBadge,
    "DiscountBadgeUI",
    ()=>DiscountBadgeUI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
const DiscountBadgeUI = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(4);
    if ($[0] !== "8da9e8e605ce07f6875e0d522c3068a7502537647870749a4af877ce065f50f6") {
        for(let $i = 0; $i < 4; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "8da9e8e605ce07f6875e0d522c3068a7502537647870749a4af877ce065f50f6";
    }
    const { discountText, className: t1 } = t0;
    const className = t1 === undefined ? "" : t1;
    const t2 = `bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full ${className}`;
    let t3;
    if ($[1] !== discountText || $[2] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t2,
            children: discountText
        }, void 0, false, {
            fileName: "[project]/components/atoms/DiscountBadge.tsx",
            lineNumber: 24,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = discountText;
        $[2] = t2;
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    return t3;
};
_c = DiscountBadgeUI;
const DiscountBadge = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(8);
    if ($[0] !== "8da9e8e605ce07f6875e0d522c3068a7502537647870749a4af877ce065f50f6") {
        for(let $i = 0; $i < 8; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "8da9e8e605ce07f6875e0d522c3068a7502537647870749a4af877ce065f50f6";
    }
    const { price, strikePrice, className } = t0;
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    if (strikePrice <= price) {
        return null;
    }
    let t1;
    if ($[1] !== price || $[2] !== strikePrice || $[3] !== t) {
        const discount = Math.round((strikePrice - price) / strikePrice * 100);
        t1 = t("discount_badge", {
            percent: discount
        });
        $[1] = price;
        $[2] = strikePrice;
        $[3] = t;
        $[4] = t1;
    } else {
        t1 = $[4];
    }
    const discountText = t1;
    let t2;
    if ($[5] !== className || $[6] !== discountText) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DiscountBadgeUI, {
            discountText: discountText,
            className: className
        }, void 0, false, {
            fileName: "[project]/components/atoms/DiscountBadge.tsx",
            lineNumber: 75,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[5] = className;
        $[6] = discountText;
        $[7] = t2;
    } else {
        t2 = $[7];
    }
    return t2;
};
_s(DiscountBadge, "vu2xTFBfHkv41zWfADiErp1aWcA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c1 = DiscountBadge;
var _c, _c1;
__turbopack_context__.k.register(_c, "DiscountBadgeUI");
__turbopack_context__.k.register(_c1, "DiscountBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/icons.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "iconPaths",
    ()=>iconPaths
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const iconPaths = {
    pen: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M16.5862 3.92893L19.4147 6.75736L7.82893 18.3431L4.34315 18.3431L4.34315 14.8574L16.5862 3.92893ZM20.8289 5.34315L18 2.51472L19.4147 1.10051C19.8052 0.710009 20.4384 0.710009 20.8289 1.10051L22.2431 2.51472C22.6337 2.90524 22.6337 3.53841 22.2431 3.92893L20.8289 5.34315ZM3 19.3431L3 20.3431C3 20.8954 3.44772 21.3431 4 21.3431L13.5 21.3431L13.5 19.3431L3 19.3431Z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 4,
        columnNumber: 8
    }, ("TURBOPACK compile-time value", void 0)),
    puzzle: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M22 17H19V15H22V13C22 12.4477 21.5523 12 21 12H19C18.4477 12 18 11.5523 18 11V9C18 8.44772 17.5523 8 17 8H15V5H17V2H11V5H13V7C13 7.55228 13.4477 8 14 8H15V11H12V9H5V11H2V17H5V15H8V17H11V20C11 20.5523 11.4477 21 12 21H14C14.5523 21 15 20.5523 15 20V17H22Z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 5,
        columnNumber: 11
    }, ("TURBOPACK compile-time value", void 0)),
    backpack: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M19.5 6.5C19.5 5.67157 18.8284 5 18 5H15V3.5C15 2.11929 13.8807 1 12.5 1H11.5C10.1193 1 9 2.11929 9 3.5V5H6C5.17157 5 4.5 5.67157 4.5 6.5V10H19.5V6.5ZM4 22C4 22.5523 4.44772 23 5 23H19C19.5523 23 20 22.5523 20 22V11H4V22ZM7 14C7 13.4477 7.44772 13 8 13H16C16.5523 13 17 13.4477 17 14V18C17 18.5523 16.5523 19 16 19H8C7.44772 19 7 18.5523 7 18V14Z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 6,
        columnNumber: 13
    }, ("TURBOPACK compile-time value", void 0)),
    search: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M18.031 16.617L22.314 20.899L20.899 22.314L16.617 18.031C15.0237 19.3082 13.042 20.0029 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20.0029 13.042 19.3082 15.0237 18.031 16.617ZM16.025 15.875C17.2941 14.5699 18.0029 12.8204 18 11C18 7.132 14.867 4 11 4C7.132 4 4 7.132 4 11C4 14.867 7.132 18 11 18C12.8204 18.0029 14.5699 17.2941 15.875 16.025Z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 7,
        columnNumber: 11
    }, ("TURBOPACK compile-time value", void 0)),
    chat: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M20 2H4C2.89543 2 2 2.89543 2 4V22L6 18H20C21.1046 18 22 17.1046 22 16V4C22 2.89543 21.1046 2 20 2Z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 8,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0)),
    send: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M3.478 2.405A.75.75 0 002.25 3.126l18 9a.75.75 0 000 1.348l-18 9a.75.75 0 00-1.228-.721l4.068-6.81-4.068-6.81a.75.75 0 00-.54-.421z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 9,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0)),
    mail: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M1.5 4.5H22.5V6H1.5V4.5ZM1.5 20.5H22.5V19H1.5V20.5ZM1.5 7.5H3.268L12 14.536L20.732 7.5H22.5V17.5H1.5V7.5Z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 10,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0)),
    phone: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M21 16.42v3.536a1 1 0 0 1-1.212.971A18.342 18.342 0 0 1 3.5 4.71a1 1 0 0 1 .97-1.213h3.536a1 1 0 0 1 .971 1.212 15.341 15.341 0 0 0 1.122 3.791 1 1 0 0 1-.418 1.169l-1.54 1.155a13.341 13.341 0 0 0 5.656 5.656l1.155-1.54a1 1 0 0 1 1.169-.418 15.343 15.343 0 0 0 3.79 1.122 1 1 0 0 1 1.213.971z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 11,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0)),
    location: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M12 20.899l-5.657-5.657a8 8 0 1 1 11.314 0L12 20.899zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 12,
        columnNumber: 13
    }, ("TURBOPACK compile-time value", void 0)),
    dashboard: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 13,
        columnNumber: 14
    }, ("TURBOPACK compile-time value", void 0)),
    package: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.236L18.667 8 12 11.764 5.333 8 12 4.236zM5 15.91l6 3.333v-7.25L5 8.667v7.243zm8 0v-7.243L19 8.667v7.25l-6 3.333z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 14,
        columnNumber: 12
    }, ("TURBOPACK compile-time value", void 0)),
    users: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M9 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm11-5h-2v2h2v-2zm0 4h-2v2h2v-2zm0-8h-2v2h2V4z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 15,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0)),
    google: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.28-.059-1.688-.073-4.947-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 16,
        columnNumber: 11
    }, ("TURBOPACK compile-time value", void 0)),
    shoppingCart: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
        fill: "none",
        stroke: "currentColor"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 17,
        columnNumber: 17
    }, ("TURBOPACK compile-time value", void 0)),
    magicWand: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M12 6.25278V2.75M8.75 7.5L6.42969 5.17969M15.25 7.5L17.5703 5.17969M6.25278 12H2.75M17.7472 12H21.25M8.75 16.5L6.42969 18.8203M15.25 16.5L17.5703 18.8203M12 17.7472V21.25"
            }, void 0, false, {
                fileName: "[project]/lib/icons.tsx",
                lineNumber: 18,
                columnNumber: 16
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
            }, void 0, false, {
                fileName: "[project]/lib/icons.tsx",
                lineNumber: 18,
                columnNumber: 244
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true),
    menu: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M4 6h16M4 12h16M4 18h16",
        fill: "none",
        stroke: "currentColor"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 19,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0)),
    x: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M6 18L18 6M6 6l12 12",
        fill: "none",
        stroke: "currentColor"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 20,
        columnNumber: 6
    }, ("TURBOPACK compile-time value", void 0)),
    heart: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "2",
        d: "M4.318 6.318a4.5 4.5 0 016.364 0L12 7.672l1.318-1.354a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z",
        fill: "none",
        stroke: "currentColor"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 21,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0)),
    bookmark: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "2",
        d: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
        fill: "none",
        stroke: "currentColor"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 22,
        columnNumber: 13
    }, ("TURBOPACK compile-time value", void 0)),
    sun: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z",
        fill: "none",
        stroke: "currentColor"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 23,
        columnNumber: 8
    }, ("TURBOPACK compile-time value", void 0)),
    moon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
        fill: "none",
        stroke: "currentColor"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 24,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0)),
    chevronDown: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M19 9l-7 7-7-7",
        fill: "none",
        stroke: "currentColor"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 25,
        columnNumber: 16
    }, ("TURBOPACK compile-time value", void 0)),
    chevronRight: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
        d: "M9 5l7 7-7 7",
        fill: "none",
        stroke: "currentColor"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 26,
        columnNumber: 17
    }, ("TURBOPACK compile-time value", void 0)),
    plus: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5C13 4.44772 12.5523 4 12 4Z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 27,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0)),
    minus: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M5 12C5 11.4477 5.44772 11 6 11H18C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H6C5.44772 13 5 12.5523 5 12Z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 28,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0)),
    trash: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M7 6V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6H20C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H4C3.44772 8 3 7.55228 3 7C3 6.44772 3.44772 6 4 6H7ZM7 8H17V20C17 21.1046 16.1046 22 15 22H9C7.89543 22 7 21.1046 7 20V8Z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 29,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0)),
    grid: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M14 10V4H20V10H14ZM4 10V4H10V10H4ZM14 20V14H20V20H14ZM4 20V14H10V20H4Z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 30,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0)),
    list: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 31,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0)),
    facebook: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M14 13.5H16.5L17.5 9.5H14V7.5C14 6.47 14 5.5 16 5.5H17.5V2.14C17.174 2.097 15.943 2 14.643 2C11.928 2 10 3.657 10 6.7V9.5H7V13.5H10V22H14V13.5Z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 32,
        columnNumber: 13
    }, ("TURBOPACK compile-time value", void 0)),
    instagram: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.28-.059-1.688-.073-4.947-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 33,
        columnNumber: 14
    }, ("TURBOPACK compile-time value", void 0)),
    twitter: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.212 3.793 4.649-.65.177-1.354.23-2.06.088.621 1.954 2.425 3.379 4.565 3.419-1.724 1.35-3.882 2.083-6.234 2.083-.404 0-.79-.023-1.175-.068 2.226 1.433 4.872 2.27 7.734 2.27 9.284 0 14.376-7.618 14.376-14.376 0-.218-.005-.436-.013-.652.984-.709 1.838-1.599 2.52-2.624z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 34,
        columnNumber: 12
    }, ("TURBOPACK compile-time value", void 0)),
    star: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
        d: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
    }, void 0, false, {
        fileName: "[project]/lib/icons.tsx",
        lineNumber: 35,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0))
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/atoms/Icon.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Icon",
    ()=>Icon
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$icons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/icons.tsx [app-client] (ecmascript)");
;
;
;
const Icon = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(9);
    if ($[0] !== "dd0e512de2539e3a86300e25c6f21353576e72a89448594ab9eb4a3593cce6d5") {
        for(let $i = 0; $i < 9; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "dd0e512de2539e3a86300e25c6f21353576e72a89448594ab9eb4a3593cce6d5";
    }
    let className;
    let name;
    let props;
    if ($[1] !== t0) {
        ({ name, className, ...props } = t0);
        $[1] = t0;
        $[2] = className;
        $[3] = name;
        $[4] = props;
    } else {
        className = $[2];
        name = $[3];
        props = $[4];
    }
    const t1 = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$icons$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["iconPaths"][name];
    let t2;
    if ($[5] !== className || $[6] !== props || $[7] !== t1) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            className: className,
            ...props,
            children: t1
        }, void 0, false, {
            fileName: "[project]/components/atoms/Icon.tsx",
            lineNumber: 37,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[5] = className;
        $[6] = props;
        $[7] = t1;
        $[8] = t2;
    } else {
        t2 = $[8];
    }
    return t2;
};
_c = Icon;
var _c;
__turbopack_context__.k.register(_c, "Icon");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/molecules/ProductCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductCard",
    ()=>ProductCard,
    "ProductCardUI",
    ()=>ProductCardUI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Price$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Price.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$DiscountBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/DiscountBadge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useCart.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useUser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useUser.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Icon.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
const ProductCardUI = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(49);
    if ($[0] !== "6e22c00cfd89b23cbf6a90ee27db66b8d65212d9aaccf99f12bbb5995a31431a") {
        for(let $i = 0; $i < 49; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "6e22c00cfd89b23cbf6a90ee27db66b8d65212d9aaccf99f12bbb5995a31431a";
    }
    const { product, onAddToCart, onToggleWishlist, isSaved, addToCartText, likeText, saveText, onCardClick } = t0;
    const [isLiked, setIsLiked] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleIconClick = _temp;
    const t1 = `product-${product.id}`;
    let t2;
    if ($[1] !== t1) {
        t2 = {
            viewTransitionName: t1
        };
        $[1] = t1;
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    const t3 = t2;
    const t4 = product.imageUrl || product.images[0];
    let t5;
    if ($[3] !== product.name || $[4] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            src: t4,
            alt: product.name,
            className: "w-full h-56 object-cover"
        }, void 0, false, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 57,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = product.name;
        $[4] = t4;
        $[5] = t5;
    } else {
        t5 = $[5];
    }
    let t6;
    if ($[6] !== isLiked) {
        t6 = (e_0)=>handleIconClick(e_0, ()=>setIsLiked(!isLiked));
        $[6] = isLiked;
        $[7] = t6;
    } else {
        t6 = $[7];
    }
    const t7 = isLiked ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-muted text-muted-foreground hover:bg-border";
    let t8;
    if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
            name: "heart",
            className: "w-5 h-5"
        }, void 0, false, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 75,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[8] = t8;
    } else {
        t8 = $[8];
    }
    let t9;
    if ($[9] !== likeText || $[10] !== t6 || $[11] !== t7) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            size: "icon",
            onClick: t6,
            "aria-label": likeText,
            className: t7,
            children: t8
        }, void 0, false, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 82,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[9] = likeText;
        $[10] = t6;
        $[11] = t7;
        $[12] = t9;
    } else {
        t9 = $[12];
    }
    const t10 = isSaved ? "bg-primary/20 text-primary hover:bg-primary/30" : "bg-muted text-muted-foreground hover:bg-border";
    let t11;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
            name: "bookmark",
            className: "w-5 h-5"
        }, void 0, false, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 93,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[13] = t11;
    } else {
        t11 = $[13];
    }
    let t12;
    if ($[14] !== onToggleWishlist || $[15] !== saveText || $[16] !== t10) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            size: "icon",
            onClick: onToggleWishlist,
            "aria-label": saveText,
            className: t10,
            children: t11
        }, void 0, false, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 100,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[14] = onToggleWishlist;
        $[15] = saveText;
        $[16] = t10;
        $[17] = t12;
    } else {
        t12 = $[17];
    }
    let t13;
    if ($[18] !== t12 || $[19] !== t9) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute top-3 ltr:left-3 rtl:right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            children: [
                t9,
                t12
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 110,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[18] = t12;
        $[19] = t9;
        $[20] = t13;
    } else {
        t13 = $[20];
    }
    let t14;
    if ($[21] !== product.price || $[22] !== product.strikePrice) {
        t14 = product.strikePrice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$DiscountBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiscountBadge"], {
            price: product.price,
            strikePrice: product.strikePrice,
            className: "absolute top-3 ltr:right-3 rtl:left-3"
        }, void 0, false, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 119,
            columnNumber: 34
        }, ("TURBOPACK compile-time value", void 0));
        $[21] = product.price;
        $[22] = product.strikePrice;
        $[23] = t14;
    } else {
        t14 = $[23];
    }
    let t15;
    if ($[24] !== t13 || $[25] !== t14 || $[26] !== t5) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative",
            children: [
                t5,
                t13,
                t14
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 128,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[24] = t13;
        $[25] = t14;
        $[26] = t5;
        $[27] = t15;
    } else {
        t15 = $[27];
    }
    let t16;
    if ($[28] !== product.category) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-sm text-muted-foreground",
            children: product.category
        }, void 0, false, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 138,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[28] = product.category;
        $[29] = t16;
    } else {
        t16 = $[29];
    }
    let t17;
    if ($[30] !== product.name) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
            className: "text-lg font-semibold text-card-foreground truncate mt-1",
            children: product.name
        }, void 0, false, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 146,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[30] = product.name;
        $[31] = t17;
    } else {
        t17 = $[31];
    }
    let t18;
    if ($[32] !== product.price || $[33] !== product.strikePrice) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Price$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Price"], {
            price: product.price,
            strikePrice: product.strikePrice,
            className: "mt-2"
        }, void 0, false, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 154,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[32] = product.price;
        $[33] = product.strikePrice;
        $[34] = t18;
    } else {
        t18 = $[34];
    }
    let t19;
    if ($[35] === Symbol.for("react.memo_cache_sentinel")) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
            name: "shoppingCart",
            className: "w-5 h-5 ltr:mr-2 rtl:ml-2"
        }, void 0, false, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 163,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[35] = t19;
    } else {
        t19 = $[35];
    }
    let t20;
    if ($[36] !== addToCartText || $[37] !== onAddToCart) {
        t20 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            className: "w-full mt-4 mt-auto",
            onClick: onAddToCart,
            children: [
                t19,
                addToCartText
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 170,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[36] = addToCartText;
        $[37] = onAddToCart;
        $[38] = t20;
    } else {
        t20 = $[38];
    }
    let t21;
    if ($[39] !== t16 || $[40] !== t17 || $[41] !== t18 || $[42] !== t20) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-5 flex flex-col flex-grow",
            children: [
                t16,
                t17,
                t18,
                t20
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 179,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[39] = t16;
        $[40] = t17;
        $[41] = t18;
        $[42] = t20;
        $[43] = t21;
    } else {
        t21 = $[43];
    }
    let t22;
    if ($[44] !== onCardClick || $[45] !== t15 || $[46] !== t21 || $[47] !== t3) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-card rounded-lg shadow-md overflow-hidden group transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl border flex flex-col cursor-pointer",
            onClick: onCardClick,
            style: t3,
            children: [
                t15,
                t21
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 190,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[44] = onCardClick;
        $[45] = t15;
        $[46] = t21;
        $[47] = t3;
        $[48] = t22;
    } else {
        t22 = $[48];
    }
    return t22;
};
_s(ProductCardUI, "eHCM9bKEgGkXltnJZ+5NUCvkPlo=");
_c = ProductCardUI;
const ProductCard = (t0)=>{
    _s1();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(31);
    if ($[0] !== "6e22c00cfd89b23cbf6a90ee27db66b8d65212d9aaccf99f12bbb5995a31431a") {
        for(let $i = 0; $i < 31; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "6e22c00cfd89b23cbf6a90ee27db66b8d65212d9aaccf99f12bbb5995a31431a";
    }
    const { product } = t0;
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const { addToCart } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"])();
    const { isLoggedIn, currentUser, toggleWishlistItem } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useUser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [, startTransition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransition"])();
    let t1;
    if ($[1] !== currentUser?.wishlist || $[2] !== isLoggedIn || $[3] !== product.id) {
        t1 = isLoggedIn && !!currentUser?.wishlist.includes(product.id);
        $[1] = currentUser?.wishlist;
        $[2] = isLoggedIn;
        $[3] = product.id;
        $[4] = t1;
    } else {
        t1 = $[4];
    }
    const isSaved = t1;
    let t2;
    if ($[5] !== addToCart || $[6] !== product) {
        t2 = (e)=>{
            e.stopPropagation();
            let selectedVariant;
            if (product.variants) {
                selectedVariant = Object.keys(product.variants).reduce((acc, key)=>{
                    const firstAvailableOption = product.variants?.[key].options.find(_temp2);
                    if (firstAvailableOption) {
                        acc[key] = firstAvailableOption.value;
                    }
                    return acc;
                }, {});
            }
            addToCart(product, 1, selectedVariant);
        };
        $[5] = addToCart;
        $[6] = product;
        $[7] = t2;
    } else {
        t2 = $[7];
    }
    const handleAddToCart = t2;
    let t3;
    if ($[8] !== isLoggedIn || $[9] !== product.id || $[10] !== router || $[11] !== toggleWishlistItem) {
        t3 = (e_0)=>{
            e_0.stopPropagation();
            if (isLoggedIn) {
                toggleWishlistItem(product.id);
            } else {
                router.push("/registration");
            }
        };
        $[8] = isLoggedIn;
        $[9] = product.id;
        $[10] = router;
        $[11] = toggleWishlistItem;
        $[12] = t3;
    } else {
        t3 = $[12];
    }
    const handleToggleWishlist = t3;
    let t4;
    if ($[13] !== product.id || $[14] !== router) {
        t4 = ()=>{
            if (document.startViewTransition) {
                document.startViewTransition(()=>{
                    startTransition(()=>{
                        router.push(`/product/${product.id}`);
                    });
                });
            } else {
                router.push(`/product/${product.id}`);
            }
        };
        $[13] = product.id;
        $[14] = router;
        $[15] = t4;
    } else {
        t4 = $[15];
    }
    const handleCardClick = t4;
    let t5;
    if ($[16] !== t) {
        t5 = t("product_card_add_to_cart");
        $[16] = t;
        $[17] = t5;
    } else {
        t5 = $[17];
    }
    let t6;
    if ($[18] !== t) {
        t6 = t("product_card_like");
        $[18] = t;
        $[19] = t6;
    } else {
        t6 = $[19];
    }
    let t7;
    if ($[20] !== t) {
        t7 = t("product_card_save");
        $[20] = t;
        $[21] = t7;
    } else {
        t7 = $[21];
    }
    let t8;
    if ($[22] !== handleAddToCart || $[23] !== handleCardClick || $[24] !== handleToggleWishlist || $[25] !== isSaved || $[26] !== product || $[27] !== t5 || $[28] !== t6 || $[29] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProductCardUI, {
            product: product,
            onAddToCart: handleAddToCart,
            onToggleWishlist: handleToggleWishlist,
            isSaved: isSaved,
            addToCartText: t5,
            likeText: t6,
            saveText: t7,
            onCardClick: handleCardClick
        }, void 0, false, {
            fileName: "[project]/components/molecules/ProductCard.tsx",
            lineNumber: 329,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[22] = handleAddToCart;
        $[23] = handleCardClick;
        $[24] = handleToggleWishlist;
        $[25] = isSaved;
        $[26] = product;
        $[27] = t5;
        $[28] = t6;
        $[29] = t7;
        $[30] = t8;
    } else {
        t8 = $[30];
    }
    return t8;
};
_s1(ProductCard, "MyOi2xuCBsyPEq0/M5fXyLjsfCQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useUser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransition"]
    ];
});
_c1 = ProductCard;
function _temp(e, action) {
    e.preventDefault();
    e.stopPropagation();
    action();
}
function _temp2(opt) {
    return opt.stock > 0;
}
var _c, _c1;
__turbopack_context__.k.register(_c, "ProductCardUI");
__turbopack_context__.k.register(_c1, "ProductCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/molecules/CategoryCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CategoryCard",
    ()=>CategoryCard,
    "CategoryCardUI",
    ()=>CategoryCardUI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const CategoryCardUI = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(15);
    if ($[0] !== "7aa1c72fc7c9fc55db49744e53e3d561b8fd630006956d2fa3028d1e491da3e7") {
        for(let $i = 0; $i < 15; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7aa1c72fc7c9fc55db49744e53e3d561b8fd630006956d2fa3028d1e491da3e7";
    }
    const { category, name, description } = t0;
    let t1;
    if ($[1] !== category.imageUrl || $[2] !== category.name) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            src: category.imageUrl,
            alt: category.name,
            className: "w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        }, void 0, false, {
            fileName: "[project]/components/molecules/CategoryCard.tsx",
            lineNumber: 27,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = category.imageUrl;
        $[2] = category.name;
        $[3] = t1;
    } else {
        t1 = $[3];
    }
    let t2;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"
        }, void 0, false, {
            fileName: "[project]/components/molecules/CategoryCard.tsx",
            lineNumber: 36,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[4] = t2;
    } else {
        t2 = $[4];
    }
    let t3;
    if ($[5] !== name) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
            className: "text-2xl font-bold text-white mb-1",
            children: name
        }, void 0, false, {
            fileName: "[project]/components/molecules/CategoryCard.tsx",
            lineNumber: 43,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[5] = name;
        $[6] = t3;
    } else {
        t3 = $[6];
    }
    let t4;
    if ($[7] !== description) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-white/90",
            children: description
        }, void 0, false, {
            fileName: "[project]/components/molecules/CategoryCard.tsx",
            lineNumber: 51,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[7] = description;
        $[8] = t4;
    } else {
        t4 = $[8];
    }
    let t5;
    if ($[9] !== t3 || $[10] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute bottom-0 left-0 p-6",
            children: [
                t3,
                t4
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/CategoryCard.tsx",
            lineNumber: 59,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[9] = t3;
        $[10] = t4;
        $[11] = t5;
    } else {
        t5 = $[11];
    }
    let t6;
    if ($[12] !== t1 || $[13] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "group relative overflow-hidden rounded-lg shadow-lg transform hover:-translate-y-2 transition-transform duration-300",
            children: [
                t1,
                t2,
                t5
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/CategoryCard.tsx",
            lineNumber: 68,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[12] = t1;
        $[13] = t5;
        $[14] = t6;
    } else {
        t6 = $[14];
    }
    return t6;
};
_c = CategoryCardUI;
const CategoryCard = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(19);
    if ($[0] !== "7aa1c72fc7c9fc55db49744e53e3d561b8fd630006956d2fa3028d1e491da3e7") {
        for(let $i = 0; $i < 19; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7aa1c72fc7c9fc55db49744e53e3d561b8fd630006956d2fa3028d1e491da3e7";
    }
    const { category } = t0;
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    let t1;
    if ($[1] !== category.name) {
        let t2;
        if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
            t2 = /\s/g;
            $[3] = t2;
        } else {
            t2 = $[3];
        }
        t1 = category.name.toLowerCase().replace(t2, "_");
        $[1] = category.name;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const nameKey = `category_${t1}_title`;
    let t2;
    if ($[4] !== category.name) {
        let t3;
        if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
            t3 = /\s/g;
            $[6] = t3;
        } else {
            t3 = $[6];
        }
        t2 = category.name.toLowerCase().replace(t3, "_");
        $[4] = category.name;
        $[5] = t2;
    } else {
        t2 = $[5];
    }
    const descKey = `category_${t2}_desc`;
    let t3;
    if ($[7] !== category.name || $[8] !== nameKey || $[9] !== t) {
        t3 = t(nameKey) || category.name;
        $[7] = category.name;
        $[8] = nameKey;
        $[9] = t;
        $[10] = t3;
    } else {
        t3 = $[10];
    }
    const name = t3;
    let t4;
    if ($[11] !== category.description || $[12] !== descKey || $[13] !== t) {
        t4 = t(descKey) || category.description;
        $[11] = category.description;
        $[12] = descKey;
        $[13] = t;
        $[14] = t4;
    } else {
        t4 = $[14];
    }
    const description = t4;
    let t5;
    if ($[15] !== category || $[16] !== description || $[17] !== name) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CategoryCardUI, {
            category: category,
            name: name,
            description: description
        }, void 0, false, {
            fileName: "[project]/components/molecules/CategoryCard.tsx",
            lineNumber: 150,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[15] = category;
        $[16] = description;
        $[17] = name;
        $[18] = t5;
    } else {
        t5 = $[18];
    }
    return t5;
};
_s(CategoryCard, "vu2xTFBfHkv41zWfADiErp1aWcA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c1 = CategoryCard;
var _c, _c1;
__turbopack_context__.k.register(_c, "CategoryCardUI");
__turbopack_context__.k.register(_c1, "CategoryCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Input = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c = ({ className, type, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50', className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/input.tsx",
        lineNumber: 9,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Input;
Input.displayName = 'Input';
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Input$React.forwardRef");
__turbopack_context__.k.register(_c1, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/organisms/ImageGenerator.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ImageGenerator",
    ()=>ImageGenerator,
    "ImageGeneratorUI",
    ()=>ImageGeneratorUI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Icon.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const ImageGeneratorUI = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(39);
    if ($[0] !== "9e725d15731f57cc206d387bccdfd1b60ca66c07971772c15594a047b89a38ec") {
        for(let $i = 0; $i < 39; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "9e725d15731f57cc206d387bccdfd1b60ca66c07971772c15594a047b89a38ec";
    }
    const { prompt, setPrompt, generatedImage, isLoading, error, onGenerate, title, subtitle, placeholder, generateButtonText, loadingButtonText, resultTitle, resultAlt } = t0;
    let t1;
    let t2;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"
        }, void 0, false, {
            fileName: "[project]/components/organisms/ImageGenerator.tsx",
            lineNumber: 50,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full"
        }, void 0, false, {
            fileName: "[project]/components/organisms/ImageGenerator.tsx",
            lineNumber: 51,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = t1;
        $[2] = t2;
    } else {
        t1 = $[1];
        t2 = $[2];
    }
    let t3;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "inline-block bg-white/20 p-3 rounded-full mb-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                name: "magicWand",
                className: "w-8 h-8 text-white"
            }, void 0, false, {
                fileName: "[project]/components/organisms/ImageGenerator.tsx",
                lineNumber: 60,
                columnNumber: 74
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/organisms/ImageGenerator.tsx",
            lineNumber: 60,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    let t4;
    if ($[4] !== title) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            className: "text-3xl font-bold text-white mb-2",
            children: title
        }, void 0, false, {
            fileName: "[project]/components/organisms/ImageGenerator.tsx",
            lineNumber: 67,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[4] = title;
        $[5] = t4;
    } else {
        t4 = $[5];
    }
    let t5;
    if ($[6] !== subtitle) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-white/90 mb-8 max-w-2xl mx-auto",
            children: subtitle
        }, void 0, false, {
            fileName: "[project]/components/organisms/ImageGenerator.tsx",
            lineNumber: 75,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[6] = subtitle;
        $[7] = t5;
    } else {
        t5 = $[7];
    }
    let t6;
    if ($[8] !== setPrompt) {
        t6 = (e)=>setPrompt(e.target.value);
        $[8] = setPrompt;
        $[9] = t6;
    } else {
        t6 = $[9];
    }
    let t7;
    if ($[10] !== isLoading || $[11] !== placeholder || $[12] !== prompt || $[13] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
            type: "text",
            value: prompt,
            onChange: t6,
            placeholder: placeholder,
            className: "h-12 text-base border-2 border-transparent focus-visible:ring-white bg-white/90 text-neutral-900 placeholder:text-neutral-800/60",
            disabled: isLoading
        }, void 0, false, {
            fileName: "[project]/components/organisms/ImageGenerator.tsx",
            lineNumber: 91,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[10] = isLoading;
        $[11] = placeholder;
        $[12] = prompt;
        $[13] = t6;
        $[14] = t7;
    } else {
        t7 = $[14];
    }
    const t8 = isLoading ? loadingButtonText : generateButtonText;
    let t9;
    if ($[15] !== isLoading || $[16] !== onGenerate || $[17] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "secondary",
            size: "lg",
            onClick: onGenerate,
            disabled: isLoading,
            className: "shrink-0",
            children: t8
        }, void 0, false, {
            fileName: "[project]/components/organisms/ImageGenerator.tsx",
            lineNumber: 103,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[15] = isLoading;
        $[16] = onGenerate;
        $[17] = t8;
        $[18] = t9;
    } else {
        t9 = $[18];
    }
    let t10;
    if ($[19] !== t7 || $[20] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col sm:flex-row gap-4",
            children: [
                t7,
                t9
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/ImageGenerator.tsx",
            lineNumber: 113,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[19] = t7;
        $[20] = t9;
        $[21] = t10;
    } else {
        t10 = $[21];
    }
    let t11;
    if ($[22] !== error) {
        t11 = error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "mt-4 text-red-200",
            children: error
        }, void 0, false, {
            fileName: "[project]/components/organisms/ImageGenerator.tsx",
            lineNumber: 122,
            columnNumber: 20
        }, ("TURBOPACK compile-time value", void 0));
        $[22] = error;
        $[23] = t11;
    } else {
        t11 = $[23];
    }
    let t12;
    if ($[24] !== t10 || $[25] !== t11) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-2xl mx-auto",
            children: [
                t10,
                t11
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/ImageGenerator.tsx",
            lineNumber: 130,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[24] = t10;
        $[25] = t11;
        $[26] = t12;
    } else {
        t12 = $[26];
    }
    let t13;
    if ($[27] !== isLoading) {
        t13 = isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-12 flex justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-spin rounded-full h-16 w-16 border-b-2 border-white"
            }, void 0, false, {
                fileName: "[project]/components/organisms/ImageGenerator.tsx",
                lineNumber: 139,
                columnNumber: 67
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/organisms/ImageGenerator.tsx",
            lineNumber: 139,
            columnNumber: 24
        }, ("TURBOPACK compile-time value", void 0));
        $[27] = isLoading;
        $[28] = t13;
    } else {
        t13 = $[28];
    }
    let t14;
    if ($[29] !== generatedImage || $[30] !== resultAlt || $[31] !== resultTitle) {
        t14 = generatedImage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-12",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-xl font-semibold text-white mb-4",
                    children: resultTitle
                }, void 0, false, {
                    fileName: "[project]/components/organisms/ImageGenerator.tsx",
                    lineNumber: 147,
                    columnNumber: 52
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white p-2 rounded-lg shadow-xl inline-block",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: generatedImage,
                        alt: resultAlt,
                        className: "max-w-full h-auto md:max-w-md rounded"
                    }, void 0, false, {
                        fileName: "[project]/components/organisms/ImageGenerator.tsx",
                        lineNumber: 147,
                        columnNumber: 188
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/components/organisms/ImageGenerator.tsx",
                    lineNumber: 147,
                    columnNumber: 124
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/ImageGenerator.tsx",
            lineNumber: 147,
            columnNumber: 29
        }, ("TURBOPACK compile-time value", void 0));
        $[29] = generatedImage;
        $[30] = resultAlt;
        $[31] = resultTitle;
        $[32] = t14;
    } else {
        t14 = $[32];
    }
    let t15;
    if ($[33] !== t12 || $[34] !== t13 || $[35] !== t14 || $[36] !== t4 || $[37] !== t5) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            id: "ai-generator",
            className: "py-16 lg:py-24 bg-muted",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container mx-auto px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-primary rounded-2xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden",
                    children: [
                        t1,
                        t2,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative z-10",
                            children: [
                                t3,
                                t4,
                                t5,
                                t12,
                                t13,
                                t14
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/organisms/ImageGenerator.tsx",
                            lineNumber: 157,
                            columnNumber: 221
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/organisms/ImageGenerator.tsx",
                    lineNumber: 157,
                    columnNumber: 114
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/organisms/ImageGenerator.tsx",
                lineNumber: 157,
                columnNumber: 74
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/organisms/ImageGenerator.tsx",
            lineNumber: 157,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[33] = t12;
        $[34] = t13;
        $[35] = t14;
        $[36] = t4;
        $[37] = t5;
        $[38] = t15;
    } else {
        t15 = $[38];
    }
    return t15;
};
_c = ImageGeneratorUI;
// Mock image generator that uses placeholder images
const generateMockImage = async (prompt)=>{
    // Simulate API delay
    await new Promise((resolve)=>setTimeout(resolve, 1500));
    // Return a placeholder image based on the prompt
    const seed = encodeURIComponent(prompt.slice(0, 20));
    return `https://picsum.photos/seed/${seed}/512/512`;
};
const ImageGenerator = ()=>{
    _s();
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const [prompt, setPrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [generatedImage, setGeneratedImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleGenerate = async ()=>{
        if (!prompt.trim()) {
            setError(t('generator_error_prompt'));
            return;
        }
        setError(null);
        setIsLoading(true);
        setGeneratedImage(null);
        try {
            const imageUrl = await generateMockImage(prompt);
            setGeneratedImage(imageUrl);
        } catch (err) {
            setError(t('generator_error_failed'));
            console.error(err);
        } finally{
            setIsLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ImageGeneratorUI, {
        prompt: prompt,
        setPrompt: setPrompt,
        generatedImage: generatedImage,
        isLoading: isLoading,
        error: error,
        onGenerate: handleGenerate,
        title: t('generator_title'),
        subtitle: t('generator_subtitle'),
        placeholder: t('generator_placeholder'),
        generateButtonText: t('generator_button_generate'),
        loadingButtonText: t('generator_button_loading'),
        resultTitle: t('generator_result_title'),
        resultAlt: t('generator_result_alt')
    }, void 0, false, {
        fileName: "[project]/components/organisms/ImageGenerator.tsx",
        lineNumber: 205,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ImageGenerator, "2SSZvD9n7zYqmqxNNs30W3Hycu4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c1 = ImageGenerator;
var _c, _c1;
__turbopack_context__.k.register(_c, "ImageGeneratorUI");
__turbopack_context__.k.register(_c1, "ImageGenerator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layout/Grid.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Grid",
    ()=>Grid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
;
;
const Grid = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(4);
    if ($[0] !== "21f4b4513e0f74cc568174d73d3f0c468a913a11f7b687a1928e1017f1a2d432") {
        for(let $i = 0; $i < 4; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "21f4b4513e0f74cc568174d73d3f0c468a913a11f7b687a1928e1017f1a2d432";
    }
    const { children, className: t1 } = t0;
    const className = t1 === undefined ? "" : t1;
    const t2 = `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 ${className}`;
    let t3;
    if ($[1] !== children || $[2] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t2,
            children: children
        }, void 0, false, {
            fileName: "[project]/components/layout/Grid.tsx",
            lineNumber: 23,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = children;
        $[2] = t2;
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    return t3;
};
_c = Grid;
var _c;
__turbopack_context__.k.register(_c, "Grid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/molecules/AdBanner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdBanner",
    ()=>AdBanner,
    "AdBannerUI",
    ()=>AdBannerUI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const AdBannerUI = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(17);
    if ($[0] !== "4e10f7d0e53a23a3eecd9e09608aaac4177871ea666ad25f2f10b5064b7ea5be") {
        for(let $i = 0; $i < 17; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "4e10f7d0e53a23a3eecd9e09608aaac4177871ea666ad25f2f10b5064b7ea5be";
    }
    const { className: t1, title, subtitle, ctaText, onCtaClick } = t0;
    const className = t1 === undefined ? "" : t1;
    const t2 = `bg-secondary/10 dark:bg-secondary/20 rounded-lg p-8 ${className}`;
    let t3;
    if ($[1] !== title) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
            className: "text-2xl font-bold text-secondary-dark dark:text-secondary",
            children: title
        }, void 0, false, {
            fileName: "[project]/components/molecules/AdBanner.tsx",
            lineNumber: 34,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = title;
        $[2] = t3;
    } else {
        t3 = $[2];
    }
    let t4;
    if ($[3] !== subtitle) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-muted-foreground mt-1",
            children: subtitle
        }, void 0, false, {
            fileName: "[project]/components/molecules/AdBanner.tsx",
            lineNumber: 42,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = subtitle;
        $[4] = t4;
    } else {
        t4 = $[4];
    }
    let t5;
    if ($[5] !== t3 || $[6] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                t3,
                t4
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/AdBanner.tsx",
            lineNumber: 50,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[5] = t3;
        $[6] = t4;
        $[7] = t5;
    } else {
        t5 = $[7];
    }
    let t6;
    if ($[8] !== ctaText || $[9] !== onCtaClick) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "secondary",
            size: "lg",
            onClick: onCtaClick,
            className: "shrink-0",
            children: ctaText
        }, void 0, false, {
            fileName: "[project]/components/molecules/AdBanner.tsx",
            lineNumber: 59,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[8] = ctaText;
        $[9] = onCtaClick;
        $[10] = t6;
    } else {
        t6 = $[10];
    }
    let t7;
    if ($[11] !== t5 || $[12] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col md:flex-row items-center justify-between gap-6",
            children: [
                t5,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/AdBanner.tsx",
            lineNumber: 68,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[11] = t5;
        $[12] = t6;
        $[13] = t7;
    } else {
        t7 = $[13];
    }
    let t8;
    if ($[14] !== t2 || $[15] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t2,
            children: t7
        }, void 0, false, {
            fileName: "[project]/components/molecules/AdBanner.tsx",
            lineNumber: 77,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[14] = t2;
        $[15] = t7;
        $[16] = t8;
    } else {
        t8 = $[16];
    }
    return t8;
};
_c = AdBannerUI;
const AdBanner = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(15);
    if ($[0] !== "4e10f7d0e53a23a3eecd9e09608aaac4177871ea666ad25f2f10b5064b7ea5be") {
        for(let $i = 0; $i < 15; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "4e10f7d0e53a23a3eecd9e09608aaac4177871ea666ad25f2f10b5064b7ea5be";
    }
    const { className } = t0;
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    let t1;
    if ($[1] !== router) {
        t1 = ()=>{
            router.push("/shop");
        };
        $[1] = router;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const handleCtaClick = t1;
    let t2;
    if ($[3] !== t) {
        t2 = t("ad_banner_title");
        $[3] = t;
        $[4] = t2;
    } else {
        t2 = $[4];
    }
    let t3;
    if ($[5] !== t) {
        t3 = t("ad_banner_subtitle");
        $[5] = t;
        $[6] = t3;
    } else {
        t3 = $[6];
    }
    let t4;
    if ($[7] !== t) {
        t4 = t("ad_banner_cta");
        $[7] = t;
        $[8] = t4;
    } else {
        t4 = $[8];
    }
    let t5;
    if ($[9] !== className || $[10] !== handleCtaClick || $[11] !== t2 || $[12] !== t3 || $[13] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AdBannerUI, {
            className: className,
            title: t2,
            subtitle: t3,
            ctaText: t4,
            onCtaClick: handleCtaClick
        }, void 0, false, {
            fileName: "[project]/components/molecules/AdBanner.tsx",
            lineNumber: 141,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[9] = className;
        $[10] = handleCtaClick;
        $[11] = t2;
        $[12] = t3;
        $[13] = t4;
        $[14] = t5;
    } else {
        t5 = $[14];
    }
    return t5;
};
_s(AdBanner, "rZOoNnNNKuTtxJzRzd4A3w4GsCM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c1 = AdBanner;
var _c, _c1;
__turbopack_context__.k.register(_c, "AdBannerUI");
__turbopack_context__.k.register(_c1, "AdBanner");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/constants.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "brandLogos",
    ()=>brandLogos,
    "categories",
    ()=>categories,
    "cookieSettings",
    ()=>cookieSettings,
    "faqData",
    ()=>faqData,
    "orders",
    ()=>orders,
    "products",
    ()=>products,
    "reviews",
    ()=>reviews
]);
const products = [
    {
        id: 1,
        name: 'Premium Gel Pen Set',
        description: 'A set of 12 high-quality gel pens in vibrant colors. Perfect for journaling and art projects.',
        longDescription: 'Experience smooth, skip-free writing with our Premium Gel Pen Set. This collection features 12 unique colors, each formulated with high-pigment ink that dries quickly to prevent smudging. The ergonomic grip ensures comfort during long writing sessions, making them ideal for students, artists, and professionals alike. Whether you are color-coding your notes or creating intricate mandalas, these pens deliver consistent performance and brilliant results.',
        price: 19.99,
        strikePrice: 24.99,
        category: 'Stationary',
        images: [
            'https://images.unsplash.com/photo-1585336261022-69c66d117f6e?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800'
        ],
        isNew: true,
        rating: 4.8,
        reviewsCount: 124,
        variants: {
            'Pack Size': {
                name: 'Pack Size',
                options: [
                    {
                        value: '12-pack',
                        label: '12 Pack',
                        priceModifier: 0,
                        stock: 50
                    },
                    {
                        value: '24-pack',
                        label: '24 Pack',
                        priceModifier: 15,
                        stock: 30
                    }
                ]
            }
        }
    },
    {
        id: 2,
        name: 'Wooden Building Blocks',
        description: 'Classic 50-piece wooden block set for creative play and motor skill development.',
        longDescription: 'Spark your child\'s imagination with our Classic Wooden Building Blocks. This 50-piece set includes a variety of shapes and sizes, all crafted from sustainably sourced hardwood and finished with non-toxic, child-safe paints. These blocks are designed to encourage open-ended play, helping children develop fine motor skills, spatial awareness, and problem-solving abilities. From towering castles to futuristic cities, the possibilities are endless with this timeless toy.',
        price: 34.99,
        category: 'Toys',
        images: [
            'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800'
        ],
        rating: 4.9,
        reviewsCount: 86
    },
    {
        id: 3,
        name: 'Ergonomic School Backpack',
        description: 'Durable and comfortable backpack with multiple compartments and reflective safety strips.',
        longDescription: 'Our Ergonomic School Backpack is designed with your child\'s comfort and safety in mind. Featuring padded shoulder straps and a breathable back panel, it provides excellent support even when fully loaded. The durable, water-resistant fabric protects school supplies from the elements, while multiple compartments keep everything organized. For added safety, we\'ve included high-visibility reflective strips on the front and sides, ensuring your child is seen during early morning or late afternoon commutes.',
        price: 45.00,
        strikePrice: 55.00,
        category: 'School Items',
        images: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800'
        ],
        rating: 4.7,
        reviewsCount: 210,
        variants: {
            'Color': {
                name: 'Color',
                options: [
                    {
                        value: 'blue',
                        label: 'Ocean Blue',
                        priceModifier: 0,
                        stock: 15
                    },
                    {
                        value: 'pink',
                        label: 'Rose Pink',
                        priceModifier: 0,
                        stock: 10
                    },
                    {
                        value: 'green',
                        label: 'Forest Green',
                        priceModifier: 0,
                        stock: 20
                    }
                ]
            }
        }
    },
    {
        id: 4,
        name: 'Watercolor Paint Set',
        description: 'Professional grade 24-color watercolor set with two brushes and a mixing palette.',
        longDescription: 'Unleash your inner artist with our Professional Watercolor Paint Set. This comprehensive kit features 24 highly pigmented, artist-grade colors that blend beautifully to create a vast spectrum of shades. The set includes two high-quality synthetic brushes (round and flat) and a built-in mixing palette in the lid, making it perfect for painting at home or on the go. Whether you are a seasoned professional or just starting your artistic journey, this set provides the quality and versatility you need.',
        price: 29.99,
        category: 'Stationary',
        images: [
            'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800'
        ],
        rating: 4.6,
        reviewsCount: 45
    },
    {
        id: 5,
        name: 'Solar System Puzzle',
        description: '1000-piece educational puzzle featuring detailed illustrations of our solar system.',
        longDescription: 'Embark on a journey through space with our Solar System Puzzle. This 1000-piece challenge features a stunningly detailed and scientifically accurate illustration of our sun, planets, and major moons. Made from high-quality, recycled cardboard with a glare-free finish, each piece is uniquely cut to ensure a perfect fit. It\'s not just a puzzle; it\'s an educational experience that provides hours of entertainment for space enthusiasts of all ages.',
        price: 24.50,
        category: 'Toys',
        images: [
            'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800'
        ],
        isNew: true,
        rating: 4.8,
        reviewsCount: 67
    },
    {
        id: 6,
        name: 'Insulated Lunch Box',
        description: 'BPA-free insulated lunch box that keeps food fresh for hours. Easy to clean and carry.',
        longDescription: 'Keep your meals fresh and delicious with our Insulated Lunch Box. The high-density insulation and leak-proof liner work together to maintain the temperature of your food, whether you want it cold or warm. The spacious interior fits a variety of containers, while the exterior mesh pocket is perfect for a water bottle. Made from durable, BPA-free materials, it features a reinforced handle and a removable shoulder strap for easy carrying. The wipe-clean interior makes maintenance a breeze.',
        price: 18.00,
        category: 'School Items',
        images: [
            'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=800'
        ],
        rating: 4.5,
        reviewsCount: 156
    },
    {
        id: 7,
        name: 'Leather Bound Journal',
        description: 'Handcrafted genuine leather journal with 200 pages of premium cream paper.',
        longDescription: 'Capture your thoughts and inspirations in our Handcrafted Leather Bound Journal. Each journal is made from genuine, top-grain leather that develops a beautiful patina over time. Inside, you\'ll find 200 pages of acid-free, cream-colored paper that is perfect for writing, sketching, or even light watercolor. The sturdy binding allows the journal to lay flat, providing a comfortable writing surface. It\'s a sophisticated and durable companion for your daily reflections or creative ideas.',
        price: 39.99,
        category: 'Stationary',
        images: [
            'https://images.unsplash.com/photo-1544816153-12ad5d7133a2?auto=format&fit=crop&q=80&w=800'
        ],
        rating: 4.9,
        reviewsCount: 92
    },
    {
        id: 8,
        name: 'Remote Control Robot',
        description: 'Programmable RC robot with voice control, dancing mode, and gesture sensing.',
        longDescription: 'Meet your new robotic friend! Our Remote Control Robot is packed with interactive features that will delight children and tech enthusiasts alike. Use the included remote or simple voice commands to make it walk, slide, and turn. It features a fun dancing mode with built-in music and gesture sensing technology that allows you to control its movements with your hands. You can even program a sequence of up to 50 actions for the robot to perform. It\'s a fun and engaging way to introduce children to the basics of robotics and programming.',
        price: 59.99,
        strikePrice: 79.99,
        category: 'Toys',
        images: [
            'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&q=80&w=800'
        ],
        rating: 4.7,
        reviewsCount: 112
    },
    {
        id: 9,
        name: 'Sketchbook A4',
        description: 'Hardcover sketchbook with 100 sheets of 150gsm acid-free paper. Ideal for all dry media.',
        longDescription: 'Our Hardcover A4 Sketchbook is the perfect canvas for your artistic creations. It contains 100 sheets (200 pages) of 150gsm, acid-free paper that is specifically designed for dry media like pencil, charcoal, graphite, and pastels. The heavy-weight paper prevents bleed-through and can even handle light washes of ink. The durable hardcover protects your work, while the elegant black finish gives it a professional look. Whether you are a student or a professional artist, this sketchbook is an essential tool for your kit.',
        price: 14.99,
        category: 'Stationary',
        images: [
            'https://images.unsplash.com/photo-1544816153-12ad5d7133a2?auto=format&fit=crop&q=80&w=800'
        ],
        rating: 4.8,
        reviewsCount: 78
    },
    {
        id: 10,
        name: 'Plush Teddy Bear',
        description: 'Ultra-soft and cuddly 12-inch teddy bear. Made from premium hypoallergenic materials.',
        longDescription: 'Give the gift of comfort with our Ultra-Soft Plush Teddy Bear. Standing 12 inches tall, this classic bear is made from premium, hypoallergenic plush fabric that is incredibly soft to the touch. It\'s stuffed with high-quality, resilient filling that keeps its shape even after countless hugs. With its friendly embroidered face and soft, squishy paws, it\'s the perfect companion for children of all ages. It\'s also machine washable, making it easy to keep clean and fresh for years of love.',
        price: 15.00,
        category: 'Toys',
        images: [
            'https://images.unsplash.com/photo-1559440666-37443442d766?auto=format&fit=crop&q=80&w=800'
        ],
        rating: 4.9,
        reviewsCount: 230
    },
    {
        id: 11,
        name: 'Graphite Pencil Set',
        description: 'Set of 12 professional drawing pencils ranging from 8B to 4H. Includes a metal tin.',
        longDescription: 'Master the art of shading and sketching with our Professional Graphite Pencil Set. This collection includes 12 high-quality pencils in a full range of hardness, from the soft and dark 8B to the hard and light 4H. The leads are break-resistant and provide smooth, consistent lines. The set comes in a sleek, protective metal tin, keeping your pencils organized and easy to transport. Whether you are working on detailed technical drawings or expressive portraits, this set offers the precision and versatility required by serious artists.',
        price: 12.50,
        category: 'Stationary',
        images: [
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800'
        ],
        rating: 4.7,
        reviewsCount: 54
    },
    {
        id: 12,
        name: 'Kids Play Tent',
        description: 'Easy-to-assemble indoor/outdoor play tent. Stimulates imaginative play and provides a cozy space.',
        longDescription: 'Create a magical hideaway for your little ones with our Kids Play Tent. This lightweight and portable tent is incredibly easy to assemble, featuring a simple pop-up design or sturdy, easy-to-connect poles. It\'s perfect for indoor playrooms or sunny days in the backyard. The breathable fabric and mesh windows ensure good ventilation, while the tie-back door provides easy access. It\'s a wonderful space for reading, playing with toys, or letting their imaginations run wild. When playtime is over, it folds down compactly into its own carrying bag for easy storage.',
        price: 35.00,
        category: 'Toys',
        images: [
            'https://images.unsplash.com/photo-1560131113-90435970868a?auto=format&fit=crop&q=80&w=800'
        ],
        rating: 4.6,
        reviewsCount: 89
    }
];
const categories = [
    {
        name: 'Stationary',
        description: 'High-quality pens, notebooks, and art supplies.',
        imageUrl: 'https://images.unsplash.com/photo-1585336261022-69c66d117f6e?auto=format&fit=crop&q=80&w=800',
        count: 124
    },
    {
        name: 'Toys',
        description: 'Educational and fun toys for all ages.',
        imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800',
        count: 86
    },
    {
        name: 'School Items',
        description: 'Backpacks, lunchboxes, and more for school.',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
        count: 210
    }
];
const orders = [
    {
        id: 'ORD-001',
        customerName: 'Sarah J.',
        date: '2024-08-01',
        total: 125.50,
        status: 'delivered',
        items: [
            {
                productId: 1,
                productName: 'Premium Gel Pen Set',
                quantity: 2,
                price: 19.99
            },
            {
                productId: 3,
                productName: 'Ergonomic School Backpack',
                quantity: 1,
                price: 45.00
            }
        ]
    },
    {
        id: 'ORD-002',
        customerName: 'Mark T.',
        date: '2024-08-05',
        total: 45.00,
        status: 'shipped',
        items: [
            {
                productId: 3,
                productName: 'Ergonomic School Backpack',
                quantity: 1,
                price: 45.00
            }
        ]
    },
    {
        id: 'ORD-003',
        customerName: 'Emily R.',
        date: '2024-08-10',
        total: 210.20,
        status: 'processing',
        items: [
            {
                productId: 2,
                productName: 'Wooden Building Blocks',
                quantity: 3,
                price: 34.99
            },
            {
                productId: 5,
                productName: 'Solar System Puzzle',
                quantity: 2,
                price: 24.50
            }
        ]
    },
    {
        id: 'ORD-004',
        customerName: 'David L.',
        date: '2024-08-12',
        total: 89.99,
        status: 'delivered',
        items: [
            {
                productId: 8,
                productName: 'Remote Control Robot',
                quantity: 1,
                price: 59.99
            },
            {
                productId: 4,
                productName: 'Watercolor Paint Set',
                quantity: 1,
                price: 29.99
            }
        ]
    },
    {
        id: 'ORD-005',
        customerName: 'Jessica M.',
        date: '2024-08-15',
        total: 34.50,
        status: 'cancelled',
        items: [
            {
                productId: 2,
                productName: 'Wooden Building Blocks',
                quantity: 1,
                price: 34.50
            }
        ]
    }
];
const reviews = [
    {
        id: 1,
        productId: 1,
        author: 'Sarah J.',
        rating: 5,
        date: '2024-07-15',
        comment: 'These pens are amazing! The colors are so vibrant and they write so smoothly. I use them for my bullet journal every day.'
    },
    {
        id: 2,
        productId: 1,
        author: 'Mark T.',
        rating: 4,
        date: '2024-07-20',
        comment: 'Great set of pens. A couple of them were a bit scratchy at first, but they seem to have broken in now. Good value for the price.'
    },
    {
        id: 3,
        productId: 2,
        author: 'Emily R.',
        rating: 5,
        date: '2024-07-22',
        comment: 'My son loves these blocks! They are very well made and the colors are beautiful. Great for building all sorts of things.'
    },
    {
        id: 4,
        productId: 3,
        author: 'David L.',
        rating: 5,
        date: '2024-07-25',
        comment: 'This backpack is very sturdy and has lots of pockets. My daughter says it\'s very comfortable to wear, even when it\'s full of books.'
    },
    {
        id: 5,
        productId: 3,
        author: 'Jessica M.',
        rating: 4,
        date: '2024-07-28',
        comment: 'Good quality backpack. The zippers seem a bit stiff, but hopefully they will loosen up with use. Overall, I\'m happy with the purchase.'
    },
    {
        id: 6,
        productId: 1,
        author: 'Alex B.',
        rating: 5,
        date: '2024-08-01',
        comment: 'Best gel pens I\'ve ever used. No smudging at all, which is great because I\'m left-handed!'
    },
    {
        id: 7,
        productId: 2,
        author: 'Chris K.',
        rating: 4,
        date: '2024-08-03',
        comment: 'Nice set of blocks. I wish there were a few more of the larger pieces, but my kids still have fun with them.'
    },
    {
        id: 8,
        productId: 5,
        author: 'Space Enthusiast',
        rating: 5,
        date: '2024-07-10',
        comment: 'This puzzle is challenging but so rewarding! The image is beautiful and the pieces fit together perfectly. Highly recommend for any space lover.'
    },
    {
        id: 9,
        productId: 3,
        author: 'MomOfTwo',
        rating: 4,
        date: '2024-07-14',
        comment: 'Good quality backpack. Wish it had a dedicated water bottle pocket on the side, but otherwise it\'s great.'
    },
    {
        id: 10,
        productId: 1,
        author: 'PlannerAddict',
        rating: 5,
        date: '2024-07-28',
        comment: 'I buy this set every year. I just love how smooth they are. The new colors in this version are beautiful!'
    },
    {
        id: 11,
        productId: 2,
        author: 'ParentOfTwo',
        rating: 5,
        date: '2024-07-29',
        comment: 'Absolutely timeless. My kids love these blocks more than their tablets. The quality is fantastic and they feel very durable.'
    },
    {
        id: 12,
        productId: 4,
        author: 'Hobby Painter',
        rating: 4,
        date: '2024-07-28',
        comment: 'For the price, this is a great set. The colors are bright and it comes with everything you need to start. Perfect for a beginner.'
    },
    {
        id: 13,
        productId: 6,
        author: 'Mike P.',
        rating: 5,
        date: '2024-07-27',
        comment: 'Keeps food cold all day. The material is easy to clean and it has held up really well after months of daily use. Great purchase.'
    },
    {
        id: 14,
        productId: 9,
        author: 'Art Student',
        rating: 5,
        date: '2024-07-26',
        comment: 'The paper quality is excellent for pencil and charcoal. Very little smudging and it has a nice tooth. Will buy again.'
    },
    {
        id: 15,
        productId: 10,
        author: 'Grandma G.',
        rating: 5,
        date: '2024-07-25',
        comment: 'Bought this for my grandson and he takes it everywhere. It is so incredibly soft and cuddly. A perfect classic teddy bear.'
    },
    {
        id: 16,
        productId: 11,
        author: 'Designer Dan',
        rating: 4,
        date: '2024-07-24',
        comment: 'A solid set of pencils for sketching. The range of hardness is great for shading. The tin case is a nice touch.'
    },
    {
        id: 17,
        productId: 12,
        author: 'Liam\'s Mom',
        rating: 5,
        date: '2024-07-23',
        comment: 'Easy to set up and bigger than I expected! My son has turned it into his little clubhouse. It\'s been a huge hit.'
    },
    {
        id: 18,
        productId: 7,
        author: 'Writer Gal',
        rating: 3,
        date: '2024-07-22',
        comment: 'The leather cover is nice, but the paper is a bit thin for my liking. My fountain pen ink bleeds through slightly. Better for ballpoint pens.'
    },
    {
        id: 19,
        productId: 8,
        author: 'STEM Dad',
        rating: 5,
        date: '2024-07-21',
        comment: 'What a fantastic toy! My daughter and I had a blast building the different robots. It\'s educational and really fun to see it work with solar power.'
    },
    {
        id: 20,
        productId: 3,
        author: 'Tom W.',
        rating: 5,
        date: '2024-07-20',
        comment: 'I was hesitant about the price, but this backpack is worth every penny. The support it offers for my daughter\'s back is noticeable. Very well made.'
    }
];
const brandLogos = [
    {
        name: 'Brand A',
        logoUrl: 'https://tailwindui.com/img/logos/158x48/transistor-logo-gray-400.svg'
    },
    {
        name: 'Brand B',
        logoUrl: 'https://tailwindui.com/img/logos/158x48/reform-logo-gray-400.svg'
    },
    {
        name: 'Brand C',
        logoUrl: 'https://tailwindui.com/img/logos/158x48/tuple-logo-gray-400.svg'
    },
    {
        name: 'Brand D',
        logoUrl: 'https://tailwindui.com/img/logos/158x48/savvycal-logo-gray-400.svg'
    },
    {
        name: 'Brand E',
        logoUrl: 'https://tailwindui.com/img/logos/158x48/statamic-logo-gray-400.svg'
    }
];
const cookieSettings = [
    {
        id: 'required',
        titleKey: 'cookie_category_required',
        descriptionKey: 'cookie_category_required_desc',
        isMutable: false
    },
    {
        id: 'analytics',
        titleKey: 'cookie_category_analytics',
        descriptionKey: 'cookie_category_analytics_desc',
        isMutable: true
    },
    {
        id: 'marketing',
        titleKey: 'cookie_category_marketing',
        descriptionKey: 'cookie_category_marketing_desc',
        isMutable: true
    }
];
const faqData = [
    {
        questionKey: 'faq_q1',
        answerKey: 'faq_a1'
    },
    {
        questionKey: 'faq_q2',
        answerKey: 'faq_a2'
    },
    {
        questionKey: 'faq_q3',
        answerKey: 'faq_a3'
    },
    {
        questionKey: 'faq_q4',
        answerKey: 'faq_a4'
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/molecules/ScrollingLogoCloud.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ScrollingLogoCloud",
    ()=>ScrollingLogoCloud
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/constants.ts [app-client] (ecmascript)");
;
;
;
const ScrollingLogoCloud = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(8);
    if ($[0] !== "d941baa6ef2406261c3adb4e4df7208607026220bdb0d4b59d84717e6a2f233e") {
        for(let $i = 0; $i < 8; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "d941baa6ef2406261c3adb4e4df7208607026220bdb0d4b59d84717e6a2f233e";
    }
    const { direction: t1, logos: t2 } = t0;
    const direction = t1 === undefined ? "left" : t1;
    const logos = t2 === undefined ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["brandLogos"] : t2;
    if (!logos || logos.length === 0) {
        return null;
    }
    let t3;
    if ($[1] !== logos) {
        t3 = [
            ...logos,
            ...logos
        ];
        $[1] = logos;
        $[2] = t3;
    } else {
        t3 = $[2];
    }
    const extendedLogos = t3;
    const animationClass = direction === "left" ? "animate-scroll-x" : "animate-scroll-x-reverse";
    const t4 = `inline-block ${animationClass} group-hover:[animation-play-state:paused]`;
    let t5;
    if ($[3] !== extendedLogos) {
        t5 = extendedLogos.map(_temp);
        $[3] = extendedLogos;
        $[4] = t5;
    } else {
        t5 = $[4];
    }
    let t6;
    if ($[5] !== t4 || $[6] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "group relative overflow-hidden whitespace-nowrap [mask-image:_linear-gradient(to_right,_transparent_0,_black_128px,_black_calc(100%-128px),_transparent_100%)]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: t4,
                children: t5
            }, void 0, false, {
                fileName: "[project]/components/molecules/ScrollingLogoCloud.tsx",
                lineNumber: 49,
                columnNumber: 186
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/molecules/ScrollingLogoCloud.tsx",
            lineNumber: 49,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[5] = t4;
        $[6] = t5;
        $[7] = t6;
    } else {
        t6 = $[7];
    }
    return t6;
};
_c = ScrollingLogoCloud;
function _temp(brand, index) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "inline-flex items-center justify-center w-48 mx-8 align-middle",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            className: "max-h-10 w-auto",
            src: brand.logoUrl,
            alt: brand.name
        }, void 0, false, {
            fileName: "[project]/components/molecules/ScrollingLogoCloud.tsx",
            lineNumber: 59,
            columnNumber: 121
        }, this)
    }, `${brand.name}-${index}`, false, {
        fileName: "[project]/components/molecules/ScrollingLogoCloud.tsx",
        lineNumber: 59,
        columnNumber: 10
    }, this);
}
var _c;
__turbopack_context__.k.register(_c, "ScrollingLogoCloud");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/views/HomePage.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$Hero$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/organisms/Hero.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$ProductCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/molecules/ProductCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$CategoryCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/molecules/CategoryCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$ImageGenerator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/organisms/ImageGenerator.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Container$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/Container.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Grid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/Grid.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$AdBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/molecules/AdBanner.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Icon.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$ScrollingLogoCloud$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/molecules/ScrollingLogoCloud.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const HomePage = ()=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(76);
    if ($[0] !== "69ceffb0c6e32d0f615bbbd1aa6e8cc456e333292445872881fe93b9152ff1b1") {
        for(let $i = 0; $i < 76; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "69ceffb0c6e32d0f615bbbd1aa6e8cc456e333292445872881fe93b9152ff1b1";
    }
    const { t, language } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [isAnimating, setIsAnimating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    let T0;
    let T1;
    let handlePageChange;
    let t0;
    let t1;
    let t2;
    let t3;
    let t4;
    let t5;
    let t6;
    let totalPages;
    if ($[1] !== currentPage || $[2] !== isAnimating || $[3] !== t) {
        const featuredProducts = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["products"].slice(0, 8);
        totalPages = Math.ceil(featuredProducts.length / 4);
        let t7;
        if ($[15] !== isAnimating || $[16] !== totalPages) {
            t7 = (newPage)=>{
                if (newPage < 1 || newPage > totalPages || isAnimating) {
                    return;
                }
                setIsAnimating(true);
                setTimeout(()=>{
                    setCurrentPage(newPage);
                    setIsAnimating(false);
                }, 300);
            };
            $[15] = isAnimating;
            $[16] = totalPages;
            $[17] = t7;
        } else {
            t7 = $[17];
        }
        handlePageChange = t7;
        const currentProducts = featuredProducts.slice((currentPage - 1) * 4, currentPage * 4);
        if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
            t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$Hero$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Hero"], {
                imageUrl: "https://picsum.photos/seed/heroimage/800/600"
            }, void 0, false, {
                fileName: "[project]/views/HomePage.tsx",
                lineNumber: 66,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[18] = t6;
        } else {
            t6 = $[18];
        }
        t4 = "featured-products";
        t5 = "py-16 lg:py-24 bg-muted";
        T1 = __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Container$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Container"];
        let t8;
        if ($[19] !== t) {
            t8 = t("featured_products_title");
            $[19] = t;
            $[20] = t8;
        } else {
            t8 = $[20];
        }
        if ($[21] !== t8) {
            t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-3xl font-bold text-center text-foreground mb-2",
                children: t8
            }, void 0, false, {
                fileName: "[project]/views/HomePage.tsx",
                lineNumber: 83,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[21] = t8;
            $[22] = t2;
        } else {
            t2 = $[22];
        }
        let t9;
        if ($[23] !== t) {
            t9 = t("featured_products_subtitle");
            $[23] = t;
            $[24] = t9;
        } else {
            t9 = $[24];
        }
        if ($[25] !== t9) {
            t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-center text-muted-foreground mb-12 max-w-2xl mx-auto",
                children: t9
            }, void 0, false, {
                fileName: "[project]/views/HomePage.tsx",
                lineNumber: 98,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[25] = t9;
            $[26] = t3;
        } else {
            t3 = $[26];
        }
        t1 = `transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`;
        T0 = __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Grid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Grid"];
        t0 = currentProducts.map(_temp);
        $[1] = currentPage;
        $[2] = isAnimating;
        $[3] = t;
        $[4] = T0;
        $[5] = T1;
        $[6] = handlePageChange;
        $[7] = t0;
        $[8] = t1;
        $[9] = t2;
        $[10] = t3;
        $[11] = t4;
        $[12] = t5;
        $[13] = t6;
        $[14] = totalPages;
    } else {
        T0 = $[4];
        T1 = $[5];
        handlePageChange = $[6];
        t0 = $[7];
        t1 = $[8];
        t2 = $[9];
        t3 = $[10];
        t4 = $[11];
        t5 = $[12];
        t6 = $[13];
        totalPages = $[14];
    }
    let t7;
    if ($[27] !== T0 || $[28] !== t0) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(T0, {
            children: t0
        }, void 0, false, {
            fileName: "[project]/views/HomePage.tsx",
            lineNumber: 136,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[27] = T0;
        $[28] = t0;
        $[29] = t7;
    } else {
        t7 = $[29];
    }
    let t8;
    if ($[30] !== t1 || $[31] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t1,
            children: t7
        }, void 0, false, {
            fileName: "[project]/views/HomePage.tsx",
            lineNumber: 145,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[30] = t1;
        $[31] = t7;
        $[32] = t8;
    } else {
        t8 = $[32];
    }
    let t9;
    if ($[33] !== currentPage || $[34] !== handlePageChange || $[35] !== isAnimating || $[36] !== language || $[37] !== t || $[38] !== totalPages) {
        t9 = totalPages > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-center items-center mt-12 gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    variant: "outline",
                    size: "icon",
                    onClick: ()=>handlePageChange(currentPage - 1),
                    disabled: currentPage === 1 || isAnimating,
                    "aria-label": t("pagination_previous"),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                        name: "chevronRight",
                        className: `w-5 h-5 ${language === "en" ? "rotate-180" : ""}`
                    }, void 0, false, {
                        fileName: "[project]/views/HomePage.tsx",
                        lineNumber: 154,
                        columnNumber: 260
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/views/HomePage.tsx",
                    lineNumber: 154,
                    columnNumber: 90
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-muted-foreground font-medium text-sm w-8 text-center",
                    children: [
                        currentPage,
                        " / ",
                        totalPages
                    ]
                }, void 0, true, {
                    fileName: "[project]/views/HomePage.tsx",
                    lineNumber: 154,
                    columnNumber: 360
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    variant: "outline",
                    size: "icon",
                    onClick: ()=>handlePageChange(currentPage + 1),
                    disabled: currentPage === totalPages || isAnimating,
                    "aria-label": t("pagination_next"),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                        name: "chevronRight",
                        className: `w-5 h-5 ${language === "ar" ? "rotate-180" : ""}`
                    }, void 0, false, {
                        fileName: "[project]/views/HomePage.tsx",
                        lineNumber: 154,
                        columnNumber: 640
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/views/HomePage.tsx",
                    lineNumber: 154,
                    columnNumber: 465
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/views/HomePage.tsx",
            lineNumber: 154,
            columnNumber: 28
        }, ("TURBOPACK compile-time value", void 0));
        $[33] = currentPage;
        $[34] = handlePageChange;
        $[35] = isAnimating;
        $[36] = language;
        $[37] = t;
        $[38] = totalPages;
        $[39] = t9;
    } else {
        t9 = $[39];
    }
    let t10;
    if ($[40] !== T1 || $[41] !== t2 || $[42] !== t3 || $[43] !== t8 || $[44] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(T1, {
            children: [
                t2,
                t3,
                t8,
                t9
            ]
        }, void 0, true, {
            fileName: "[project]/views/HomePage.tsx",
            lineNumber: 167,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[40] = T1;
        $[41] = t2;
        $[42] = t3;
        $[43] = t8;
        $[44] = t9;
        $[45] = t10;
    } else {
        t10 = $[45];
    }
    let t11;
    if ($[46] !== t10 || $[47] !== t4 || $[48] !== t5) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            id: t4,
            className: t5,
            children: t10
        }, void 0, false, {
            fileName: "[project]/views/HomePage.tsx",
            lineNumber: 179,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[46] = t10;
        $[47] = t4;
        $[48] = t5;
        $[49] = t11;
    } else {
        t11 = $[49];
    }
    let t12;
    if ($[50] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$AdBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdBanner"], {}, void 0, false, {
            fileName: "[project]/views/HomePage.tsx",
            lineNumber: 189,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[50] = t12;
    } else {
        t12 = $[50];
    }
    let t13;
    if ($[51] !== t) {
        t13 = t("shop_by_category_title");
        $[51] = t;
        $[52] = t13;
    } else {
        t13 = $[52];
    }
    let t14;
    if ($[53] !== t13) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            className: "text-3xl font-bold text-center text-foreground mb-2",
            children: t13
        }, void 0, false, {
            fileName: "[project]/views/HomePage.tsx",
            lineNumber: 204,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[53] = t13;
        $[54] = t14;
    } else {
        t14 = $[54];
    }
    let t15;
    if ($[55] !== t) {
        t15 = t("shop_by_category_subtitle");
        $[55] = t;
        $[56] = t15;
    } else {
        t15 = $[56];
    }
    let t16;
    if ($[57] !== t15) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-center text-muted-foreground mb-12 max-w-2xl mx-auto",
            children: t15
        }, void 0, false, {
            fileName: "[project]/views/HomePage.tsx",
            lineNumber: 220,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[57] = t15;
        $[58] = t16;
    } else {
        t16 = $[58];
    }
    let t17;
    if ($[59] === Symbol.for("react.memo_cache_sentinel")) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-1 md:grid-cols-3 gap-8",
            children: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categories"].map(_temp2)
        }, void 0, false, {
            fileName: "[project]/views/HomePage.tsx",
            lineNumber: 228,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[59] = t17;
    } else {
        t17 = $[59];
    }
    let t18;
    if ($[60] !== t14 || $[61] !== t16) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            id: "categories",
            className: "py-16 lg:py-24 bg-background",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Container$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Container"], {
                children: [
                    t14,
                    t16,
                    t17
                ]
            }, void 0, true, {
                fileName: "[project]/views/HomePage.tsx",
                lineNumber: 235,
                columnNumber: 77
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/views/HomePage.tsx",
            lineNumber: 235,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[60] = t14;
        $[61] = t16;
        $[62] = t18;
    } else {
        t18 = $[62];
    }
    let t19;
    if ($[63] !== t) {
        t19 = t("brand_showcase_title");
        $[63] = t;
        $[64] = t19;
    } else {
        t19 = $[64];
    }
    let t20;
    if ($[65] !== t19) {
        t20 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            className: "text-center text-lg font-semibold text-muted-foreground mb-10",
            children: t19
        }, void 0, false, {
            fileName: "[project]/views/HomePage.tsx",
            lineNumber: 252,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[65] = t19;
        $[66] = t20;
    } else {
        t20 = $[66];
    }
    let t21;
    if ($[67] === Symbol.for("react.memo_cache_sentinel")) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$ScrollingLogoCloud$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollingLogoCloud"], {
                    direction: "left"
                }, void 0, false, {
                    fileName: "[project]/views/HomePage.tsx",
                    lineNumber: 260,
                    columnNumber: 38
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$ScrollingLogoCloud$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollingLogoCloud"], {
                    direction: "right"
                }, void 0, false, {
                    fileName: "[project]/views/HomePage.tsx",
                    lineNumber: 260,
                    columnNumber: 77
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/views/HomePage.tsx",
            lineNumber: 260,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[67] = t21;
    } else {
        t21 = $[67];
    }
    let t22;
    if ($[68] !== t20) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: "bg-background py-16 lg:py-24",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Container$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Container"], {
                children: [
                    t20,
                    t21
                ]
            }, void 0, true, {
                fileName: "[project]/views/HomePage.tsx",
                lineNumber: 267,
                columnNumber: 61
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/views/HomePage.tsx",
            lineNumber: 267,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[68] = t20;
        $[69] = t22;
    } else {
        t22 = $[69];
    }
    let t23;
    if ($[70] === Symbol.for("react.memo_cache_sentinel")) {
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$ImageGenerator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ImageGenerator"], {}, void 0, false, {
            fileName: "[project]/views/HomePage.tsx",
            lineNumber: 275,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[70] = t23;
    } else {
        t23 = $[70];
    }
    let t24;
    if ($[71] !== t11 || $[72] !== t18 || $[73] !== t22 || $[74] !== t6) {
        t24 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                t6,
                t11,
                t12,
                t18,
                t22,
                t23
            ]
        }, void 0, true);
        $[71] = t11;
        $[72] = t18;
        $[73] = t22;
        $[74] = t6;
        $[75] = t24;
    } else {
        t24 = $[75];
    }
    return t24;
};
_s(HomePage, "YFKxSK86t0uy1bVMi3CYKqnqTtY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c = HomePage;
const __TURBOPACK__default__export__ = HomePage;
function _temp(product) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$ProductCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProductCard"], {
        product: product
    }, product.id, false, {
        fileName: "[project]/views/HomePage.tsx",
        lineNumber: 295,
        columnNumber: 10
    }, this);
}
function _temp2(category) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$CategoryCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CategoryCard"], {
        category: category
    }, category.name, false, {
        fileName: "[project]/views/HomePage.tsx",
        lineNumber: 298,
        columnNumber: 10
    }, this);
}
var _c;
__turbopack_context__.k.register(_c, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_5c06cd06._.js.map