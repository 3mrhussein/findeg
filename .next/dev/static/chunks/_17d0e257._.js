(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
"[project]/components/molecules/Logo.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Logo",
    ()=>Logo,
    "LogoUI",
    ()=>LogoUI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const LogoUI = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(5);
    if ($[0] !== "b66eaecc6155c9a1ccc05c054e61cdeff68ed9acfd6458821508e5e052e90b31") {
        for(let $i = 0; $i < 5; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "b66eaecc6155c9a1ccc05c054e61cdeff68ed9acfd6458821508e5e052e90b31";
    }
    const { ariaLabel } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "w-9 h-9 transition-transform duration-300 group-hover:rotate-[-12deg]",
            viewBox: "0 0 24 24",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M19.8,2.8L21.2,4.2C21.6,4.6,21.6,5.2,21.2,5.6L16.6,10.2L13.8,7.4L18.4,2.8C18.8,2.4,19.4,2.4,19.8,2.8Z",
                    className: "text-secondary",
                    fill: "currentColor"
                }, void 0, false, {
                    fileName: "[project]/components/molecules/Logo.tsx",
                    lineNumber: 23,
                    columnNumber: 164
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M13.8,7.4L16.6,10.2L6.4,20.4L2,22L3.6,17.6L13.8,7.4Z",
                    className: "text-primary",
                    fill: "currentColor"
                }, void 0, false, {
                    fileName: "[project]/components/molecules/Logo.tsx",
                    lineNumber: 23,
                    columnNumber: 325
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: "M6.4,20.4L4.8,18.8L2,22L3.6,20.4L6.4,20.4Z",
                    className: "text-foreground",
                    fill: "currentColor"
                }, void 0, false, {
                    fileName: "[project]/components/molecules/Logo.tsx",
                    lineNumber: 23,
                    columnNumber: 435
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/Logo.tsx",
            lineNumber: 23,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "h-7 ltr:ml-2 rtl:mr-2",
            viewBox: "0 0 160 28",
            fill: "currentColor",
            xmlns: "http://www.w3.org/2000/svg",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                    className: "text-foreground",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M4.63,23.36a9.2,9.2,0,0,1-1.35-1.44c-1.2-1.8-1.76-4.1-1.68-6.48.11-3.2,1.38-5.87,3.8-7.99,1.4-.8,3.09-1.2,4.86-1.16,1.9.05,3.67.6,5.32,1.64.8.4,1.18.3,1.6-.28.3-.39.26-.74-.15-1.04-2.1-1.5-4.6-2.2-7.16-2.14-3.3.08-6.3,1.34-8.62,3.76C.1,7.5.07,9.6.2,12.35c.18,3.52.9,6.71,3,9.46.6.7.9.8,1.5.15.2-.2.27-.47.16-.7Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 156
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M16.5,9.66c-.34-.1-.6-.2-.84-.33-.6-.3-1.05-.7-1.4-1.22s-.5-1.1-.5-1.75c0-.6.2-1.2.6-1.6s.9-.6,1.5-.6c.4,0,.8.1,1.1.2.2.1.4.1.5,0,.4-.2.4-.6,0-.8-.5-.3-1-.5-1.6-.5-1,0-1.9.3-2.6.8-.7.6-1.1,1.3-1.1,2.3,0,1,.4,1.8,1.1,2.5s1.6,1,2.7,1.1c.3,0,.5,0,.8.1.6.1,1.1.3,1.5.6.4.3.7.7.8,1.1.1.5.2,1,.1,1.5-.1.8-.4,1.5-.9,2.1-.5.6-1.1,1-1.9,1.2-.8.2-1.6.2-2.4-.1-.3-.1-.5-.1-.6,0-.4.2-.4.6,0,.8.6.3,1.3.5,2,.5,1.2,0,2.3-.3,3.3-.9.9-.6,1.6-1.4,1.9-2.5.4-1.1.4-2.3,0-3.4-.3-.8-.9-1.5-1.6-2Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 480
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M23.95,16.51c.14,3.2-1.7,5.9-4.52,6.85-1.1.3-2.2.3-3.3,0-2.5-.9-4.2-3.1-4.5-5.8-.3-2.9.6-5.5,2.6-7.4,2.2-2,5.1-2.6,7.9-1.7,2.3.7,4,2.7,4.4,5.1.06.32-.15.58-.46.62-.3.04-.57-.16-.62-.46-.3-1.8-1.5-3.3-3.2-4-2.2-1-4.8-.5-6.6,1.1-1.6,1.5-2.4,3.6-2.1,5.7.3,2.1,1.6,3.9,3.6,4.6,1.6.6,3.3.4,4.7-.5,2.2-1.4,3.3-3.9,2.8-6.23-.08-.32.14-.6.45-.64.3-.04.58.15.63.46Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 968
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M20.21,4.73c.03,1.07-.7,1.97-1.75,2.18-.3.06-.6.06-.9,0-1.07-.2-1.84-1.1-1.81-2.18.03-1.07.7-1.97,1.75-2.18.3-.06.6-.06.9,0,1.07.2,1.84,1.1,1.81,2.18Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 1337
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M36.19,16.8c.1,3.4-2,6.2-5.1,6.8-1.1.2-2.2.2-3.3,0-2.8-.6-4.9-2.9-5.1-5.7-.2-2.9,1.1-5.6,3.5-7.1,2.3-1.5,5.1-1.6,7.5-.4,2.1,1,3.6,3,4.1,5.2.06.3-.15.5-.4.5-.3,0-.5-.2-.5-.5-.4-1.7-1.6-3.1-3.2-3.9-1.9-1-4.2-.9-5.9.4-2,1.5-3.1,3.8-2.9,6.2.2,2.2,1.7,4,3.8,4.6,1.4.4,2.9.3,4.2-.3,2.4-1.2,3.8-3.6,3.5-6.1-.04-.3.17-.5.4-.5.3,0,.5.2.5.5Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 1500
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M28.49,11.2c-.3,0-.5-.2-.5-.5V5.5c0-.3.2-.5.5-.5s.5.2.5.5v5.2c0,.3-.2.5-.5.5Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 1844
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M49.49,16.5c.2,3.4-1.8,6.3-4.9,7-1.1.2-2.3.2-3.4,0-2.9-.6-5.1-3-5.3-5.9-.2-2.9,1-5.7,3.4-7.3,2.4-1.6,5.3-1.6,7.8-.3,2.1,1.1,3.6,3.1,4,5.3.1.3-.1.5-.4.5-.3,0-.5-.2-.5-.5-.3-1.7-1.5-3.2-3.2-4-2-1-4.3-1-6.1.3-2.1,1.5-3.2,3.9-3,6.4.2,2.3,1.8,4.2,4,4.8,1.5.4,3.1.3,4.5-.4,2.5-1.2,4-3.8,3.6-6.4-.1-.3.1-.5.4-.5.3,0,.5.2.5.5Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 1934
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M49.89,23.3V5.5c0-.3-.2-.5-.5-.5s-.5.2-.5.5V23.3c0,.3.2.5.5.5s.5-.2.5-.5Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 2265
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M62.69,16.4c-.6,3.6-3.4,6.3-6.9,6.8-1.2.1-2.4.1-3.6,0-3.3-.4-6-2.8-6.6-6-2.1-12.2,12.7-14.2,12.4-1.2,0,.3.2.4.5.4.3,0,.5-.2.5-.5-.5-10.7-9.4-12-12.7-3.9-1.1,2.7.1,5.7,2.5,7.1,1.1.6,2.3.9,3.6.8,1.9-.1,3.6-1,4.9-2.5.2-.2.3-.2.5,0,.3.3.2.6-.1.8-1.5,1.7-3.4,2.7-5.5,2.8-1.4.1-2.8-.2-4.1-.8-2.6-1.2-4.5-3.5-5.2-6.1-.7-2.9-.3-5.8,1.3-8.4,1.8-2.8,4.6-4.5,7.8-4.8,3.6-.3,7,1.1,9.4,3.8,2.5,2.8,3.6,6.3,3.1,9.9Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 2351
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M51.89,16.9c.3,0,.5-.2.5-.5,0-2.3,1.6-4.2,3.8-4.8,1.4-.4,2.9-.3,4.2.4,1.1.6,1.9,1.6,2.3,2.8.1.3-.1.5-.4.5-.3,0-.5-.2-.5-.5-.3-1-1-1.8-1.9-2.3-1.1-.6-2.4-.6-3.5-.2-1.9.6-3.2,2.2-3.2,4.1,0,.3.2.5.5.5Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 2765
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M75.99,16.5c.2,3.4-1.8,6.3-4.9,7-1.1.2-2.3.2-3.4,0-2.9-.6-5.1-3-5.3-5.9-.2-2.9,1-5.7,3.4-7.3,2.4-1.6,5.3-1.6,7.8-.3,2.1,1.1,3.6,3.1,4,5.3.1.3-.1.5-.4.5-.3,0-.5-.2-.5-.5-.3-1.7-1.5-3.2-3.2-4-2-1-4.3-1-6.1.3-2.1,1.5-3.2,3.9-3,6.4.2,2.3,1.8,4.2,4,4.8,1.5.4,3.1.3,4.5-.4,2.5-1.2,4-3.8,3.6-6.4-.1-.3.1-.5.4-.5.3,0,.5.2.5.5Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 2976
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M76.39,23.3c0-3.3-1.3-6.4-3.8-8.5-1.1-.9-2.4-1.6-3.8-1.9-2.2-.5-4.4.2-6.1,1.6-.3.2-.3.6,0,.8.2.2.5.2.7,0,1.4-1.1,3.1-1.6,4.8-1.2,1.2.3,2.3.8,3.2,1.6,2.1,1.8,3.2,4.4,3.2,7.1,0,.3.2.5.5.5s.5-.2.5-.5Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 3307
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M91.49,16.4c-.5,3.6-3.3,6.2-6.7,6.7-1.2.2-2.4.2-3.6,0-3.3-.5-6-2.8-6.6-6.1-2.2-12.2,12.7-14.2,12.4-1.2,0,.3.2.4.5.4.3,0,.5-.2.5-.5-.5-10.7-9.4-12-12.7-3.9-1.1,2.7.1,5.7,2.5,7.1,2.8,1.7,6.2,1,8-1.4.3-.4.7-.2,1,.2.3.3.3.7-.1.9-2,1.6-4.5,2.4-7,2-1.7-.3-3.3-1.1-4.5-2.3-2.6-2.6-3.7-6.2-2.9-9.6.9-3.6,3.8-6.4,7.4-7.2,3.9-.8,7.8.6,10.4,3.5,2.6,2.9,3.6,6.7,2.8,10.3Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 3517
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M102.79,16.7c.1,3.1-2.1,5.7-5,6.1-1.1.2-2.2.1-3.2-.2-2.7-1-4.5-3.5-4.3-6.4.2-2.8,2.1-5.1,4.7-5.9,2.8-.8,5.7.1,7.3,2.5.2.3.1.7-.2.9-.3.2-.6.1-.8-.2-1.3-2-3.6-2.6-5.6-1.9-2.1.7-3.6,2.6-3.8,4.8-.2,2.3,1.2,4.4,3.3,5.2,1.5.6,3.2.3,4.4-1,2-2,2.4-5,.9-7.1-.2-.3,0-.6.3-.8.3-.2.6-.1.8.2,1.8,2.6,1.4,5.9-1,7.9Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 3889
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M123.09,16.8c.1,3.4-2,6.2-5.1,6.8-1.1.2-2.2.2-3.3,0-2.8-.6-4.9-2.9-5.1-5.7-.2-2.9,1.1-5.6,3.5-7.1,2.3-1.5,5.1-1.6,7.5-.4,2.1,1,3.6,3,4.1,5.2.1.3-.1.5-.4.5-.3,0-.5-.2-.5-.5-.3-1.7-1.5-3.1-3.1-3.9-2-1-4.2-.9-6,.4-2,1.5-3.1,3.8-2.9,6.2.2,2.2,1.7,4,3.8,4.6,1.4.4,2.9.3,4.2-.3,2.4-1.2,3.8-3.6,3.5-6.1-.1-.3.1-.5.4-.5.3,0,.5.2.5.5Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 4203
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M115.39,11.2c-.3,0-.5-.2-.5-.5V5.5c0-.3.2-.5.5-.5s.5.2.5.5v5.2c0,.3-.2.5-.5.5Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 4541
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M107.69,16.8c.1,3.4-2,6.2-5.1,6.8-1.1.2-2.2.2-3.3,0-2.8-.6-4.9-2.9-5.1-5.7-.2-2.9,1.1-5.6,3.5-7.1,2.3-1.5,5.1-1.6,7.5-.4,2.1,1,3.6,3,4.1,5.2.1.3-.1.5-.4.5-.3,0-.5-.2-.5-.5-.3-1.7-1.5-3.1-3.1-3.9-2-1-4.2-.9-6,.4-2,1.5-3.1,3.8-2.9,6.2.2,2.2,1.7,4,3.8,4.6,1.4.4,2.9.3,4.2-.3,2.4-1.2,3.8-3.6,3.5-6.1-.1-.3.1-.5.4-.5.3,0,.5.2.5.5Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 4632
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: "M100.09,11.2c-.3,0-.5-.2-.5-.5V5.5c0-.3.2-.5.5-.5s.5.2.5.5v5.2c0,.3-.2.5-.5.5Z"
                        }, void 0, false, {
                            fileName: "[project]/components/molecules/Logo.tsx",
                            lineNumber: 30,
                            columnNumber: 4970
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/molecules/Logo.tsx",
                    lineNumber: 30,
                    columnNumber: 125
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: "128.5",
                    cy: "20.5",
                    r: "2.5",
                    className: "text-secondary"
                }, void 0, false, {
                    fileName: "[project]/components/molecules/Logo.tsx",
                    lineNumber: 30,
                    columnNumber: 5065
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/Logo.tsx",
            lineNumber: 30,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    let t3;
    if ($[3] !== ariaLabel) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: "/",
            className: "flex items-center group",
            "aria-label": ariaLabel,
            children: [
                t1,
                t2
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/Logo.tsx",
            lineNumber: 37,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = ariaLabel;
        $[4] = t3;
    } else {
        t3 = $[4];
    }
    return t3;
};
_c = LogoUI;
const Logo = ()=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(5);
    if ($[0] !== "b66eaecc6155c9a1ccc05c054e61cdeff68ed9acfd6458821508e5e052e90b31") {
        for(let $i = 0; $i < 5; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "b66eaecc6155c9a1ccc05c054e61cdeff68ed9acfd6458821508e5e052e90b31";
    }
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    let t0;
    if ($[1] !== t) {
        t0 = t("logo_aria_label");
        $[1] = t;
        $[2] = t0;
    } else {
        t0 = $[2];
    }
    let t1;
    if ($[3] !== t0) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LogoUI, {
            ariaLabel: t0
        }, void 0, false, {
            fileName: "[project]/components/molecules/Logo.tsx",
            lineNumber: 66,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = t0;
        $[4] = t1;
    } else {
        t1 = $[4];
    }
    return t1;
};
_s(Logo, "vu2xTFBfHkv41zWfADiErp1aWcA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c1 = Logo;
var _c, _c1;
__turbopack_context__.k.register(_c, "LogoUI");
__turbopack_context__.k.register(_c1, "Logo");
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
"[project]/lib/navigation.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "navigationSchema",
    ()=>navigationSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Icon.tsx [app-client] (ecmascript)");
;
;
const navigationSchema = [
    {
        labelKey: 'nav_shop',
        href: '/shop'
    },
    {
        labelKey: 'nav_categories',
        href: '/categories',
        isMegaMenu: true,
        megaMenuColumns: [
            {
                titleKey: 'category_stationary_title',
                links: [
                    {
                        labelKey: 'category_stationary_pens',
                        href: '/shop?category=Stationary',
                        subLinks: [
                            {
                                labelKey: 'sub_gel_pens',
                                href: '/shop?category=Stationary&type=gel',
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                    name: "pen",
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/lib/navigation.tsx",
                                    lineNumber: 16,
                                    columnNumber: 93
                                }, ("TURBOPACK compile-time value", void 0))
                            },
                            {
                                labelKey: 'sub_ballpoint',
                                href: '/shop?category=Stationary&type=ballpoint',
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                    name: "pen",
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/lib/navigation.tsx",
                                    lineNumber: 17,
                                    columnNumber: 100
                                }, ("TURBOPACK compile-time value", void 0))
                            }
                        ]
                    },
                    {
                        labelKey: 'category_stationary_notebooks',
                        href: '/shop?category=Stationary'
                    },
                    {
                        labelKey: 'category_stationary_art',
                        href: '/shop?category=Stationary',
                        isNew: true
                    }
                ]
            },
            {
                titleKey: 'category_toys_title',
                links: [
                    {
                        labelKey: 'category_toys_educational',
                        href: '/shop?category=Toys'
                    },
                    {
                        labelKey: 'category_toys_blocks',
                        href: '/shop?category=Toys'
                    },
                    {
                        labelKey: 'category_toys_puzzles',
                        href: '/shop?category=Toys',
                        subLinks: [
                            {
                                labelKey: 'sub_jigsaw',
                                href: '/shop?category=Toys&type=jigsaw',
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                    name: "puzzle",
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/lib/navigation.tsx",
                                    lineNumber: 29,
                                    columnNumber: 88
                                }, ("TURBOPACK compile-time value", void 0))
                            },
                            {
                                labelKey: 'sub_3d_puzzles',
                                href: '/shop?category=Toys&type=3d',
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                    name: "puzzle",
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/lib/navigation.tsx",
                                    lineNumber: 30,
                                    columnNumber: 88
                                }, ("TURBOPACK compile-time value", void 0))
                            }
                        ]
                    }
                ]
            },
            {
                titleKey: 'category_school_title',
                links: [
                    {
                        labelKey: 'category_school_backpacks',
                        href: '/shop?category=School Items',
                        subLinks: [
                            {
                                labelKey: 'sub_ergonomic',
                                href: '/shop?category=School Items&type=ergonomic',
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                    name: "backpack",
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/lib/navigation.tsx",
                                    lineNumber: 38,
                                    columnNumber: 102
                                }, ("TURBOPACK compile-time value", void 0))
                            },
                            {
                                labelKey: 'sub_themed',
                                href: '/shop?category=School Items&type=themed',
                                icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                    name: "backpack",
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/lib/navigation.tsx",
                                    lineNumber: 39,
                                    columnNumber: 96
                                }, ("TURBOPACK compile-time value", void 0))
                            }
                        ]
                    },
                    {
                        labelKey: 'category_school_lunchboxes',
                        href: '/shop?category=School Items'
                    }
                ]
            }
        ]
    },
    {
        labelKey: 'nav_ai_generator',
        href: '/#ai-generator'
    },
    {
        labelKey: 'nav_about',
        href: '/about'
    },
    {
        labelKey: 'nav_my_account',
        href: '/my-account'
    },
    {
        labelKey: 'nav_dashboard',
        href: '/dashboard'
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
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
"[project]/components/atoms/QuantityInput.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QuantityInput",
    ()=>QuantityInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Icon.tsx [app-client] (ecmascript)");
'use client';
;
;
;
;
const QuantityInput = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(20);
    if ($[0] !== "8f10739f7fd42bae69a8054f53f2273748b4f6ea79ff3d1ac6a17a0848fe831b") {
        for(let $i = 0; $i < 20; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "8f10739f7fd42bae69a8054f53f2273748b4f6ea79ff3d1ac6a17a0848fe831b";
    }
    const { quantity, setQuantity, max: t1 } = t0;
    const max = t1 === undefined ? 99 : t1;
    let t2;
    if ($[1] !== max || $[2] !== quantity || $[3] !== setQuantity) {
        t2 = ()=>setQuantity(Math.min(quantity + 1, max));
        $[1] = max;
        $[2] = quantity;
        $[3] = setQuantity;
        $[4] = t2;
    } else {
        t2 = $[4];
    }
    const increment = t2;
    let t3;
    if ($[5] !== quantity || $[6] !== setQuantity) {
        t3 = ()=>setQuantity(Math.max(quantity - 1, 1));
        $[5] = quantity;
        $[6] = setQuantity;
        $[7] = t3;
    } else {
        t3 = $[7];
    }
    const decrement = t3;
    let t4;
    if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
            name: "minus",
            className: "w-4 h-4"
        }, void 0, false, {
            fileName: "[project]/components/atoms/QuantityInput.tsx",
            lineNumber: 49,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[8] = t4;
    } else {
        t4 = $[8];
    }
    let t5;
    if ($[9] !== decrement) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "ghost",
            size: "icon",
            onClick: decrement,
            className: "h-10 w-10 rounded-r-none text-muted-foreground hover:text-primary",
            "aria-label": "Decrease quantity",
            children: t4
        }, void 0, false, {
            fileName: "[project]/components/atoms/QuantityInput.tsx",
            lineNumber: 56,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[9] = decrement;
        $[10] = t5;
    } else {
        t5 = $[10];
    }
    let t6;
    if ($[11] !== quantity) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
            type: "text",
            readOnly: true,
            value: quantity,
            className: "w-12 text-center font-semibold bg-transparent focus:outline-none border-y-0 border-x",
            "aria-label": "Current quantity"
        }, void 0, false, {
            fileName: "[project]/components/atoms/QuantityInput.tsx",
            lineNumber: 64,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[11] = quantity;
        $[12] = t6;
    } else {
        t6 = $[12];
    }
    let t7;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
            name: "plus",
            className: "w-4 h-4"
        }, void 0, false, {
            fileName: "[project]/components/atoms/QuantityInput.tsx",
            lineNumber: 72,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[13] = t7;
    } else {
        t7 = $[13];
    }
    let t8;
    if ($[14] !== increment) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "ghost",
            size: "icon",
            onClick: increment,
            className: "h-10 w-10 rounded-l-none text-muted-foreground hover:text-primary",
            "aria-label": "Increase quantity",
            children: t7
        }, void 0, false, {
            fileName: "[project]/components/atoms/QuantityInput.tsx",
            lineNumber: 79,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[14] = increment;
        $[15] = t8;
    } else {
        t8 = $[15];
    }
    let t9;
    if ($[16] !== t5 || $[17] !== t6 || $[18] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center border rounded-md",
            children: [
                t5,
                t6,
                t8
            ]
        }, void 0, true, {
            fileName: "[project]/components/atoms/QuantityInput.tsx",
            lineNumber: 87,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[16] = t5;
        $[17] = t6;
        $[18] = t8;
        $[19] = t9;
    } else {
        t9 = $[19];
    }
    return t9;
};
_c = QuantityInput;
var _c;
__turbopack_context__.k.register(_c, "QuantityInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/organisms/CartDrawer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CartDrawer",
    ()=>CartDrawer,
    "CartDrawerUI",
    ()=>CartDrawerUI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$QuantityInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/QuantityInput.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useCart.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Icon.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const CartDrawerUI = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(33);
    if ($[0] !== "969d3ea346d173a582a0e1e8c6d21c196de6fe243d3aeed7faeea4c4724f247c") {
        for(let $i = 0; $i < 33; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "969d3ea346d173a582a0e1e8c6d21c196de6fe243d3aeed7faeea4c4724f247c";
    }
    const { isOpen, onToggle, items, onRemove, onUpdateQuantity, total, title, emptyText, subtotalText, checkoutText, removeItemText, shopNowText, onCheckout, onShopNow } = t0;
    const t1 = `fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`;
    let t2;
    if ($[1] !== onToggle || $[2] !== t1) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t1,
            onClick: onToggle
        }, void 0, false, {
            fileName: "[project]/components/organisms/CartDrawer.tsx",
            lineNumber: 54,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = onToggle;
        $[2] = t1;
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    const t3 = `fixed top-0 ltr:right-0 rtl:left-0 h-full w-full max-w-md bg-card shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"}`;
    let t4;
    if ($[4] !== title) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            className: "text-xl font-bold",
            children: title
        }, void 0, false, {
            fileName: "[project]/components/organisms/CartDrawer.tsx",
            lineNumber: 64,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[4] = title;
        $[5] = t4;
    } else {
        t4 = $[5];
    }
    let t5;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
            name: "x",
            className: "w-6 h-6 text-foreground"
        }, void 0, false, {
            fileName: "[project]/components/organisms/CartDrawer.tsx",
            lineNumber: 72,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[6] = t5;
    } else {
        t5 = $[6];
    }
    let t6;
    if ($[7] !== onToggle) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "ghost",
            size: "icon",
            onClick: onToggle,
            "aria-label": "Close cart",
            children: t5
        }, void 0, false, {
            fileName: "[project]/components/organisms/CartDrawer.tsx",
            lineNumber: 79,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[7] = onToggle;
        $[8] = t6;
    } else {
        t6 = $[8];
    }
    let t7;
    if ($[9] !== t4 || $[10] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-between items-center p-6 border-b",
            children: [
                t4,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/CartDrawer.tsx",
            lineNumber: 87,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[9] = t4;
        $[10] = t6;
        $[11] = t7;
    } else {
        t7 = $[11];
    }
    let t8;
    if ($[12] !== checkoutText || $[13] !== emptyText || $[14] !== items || $[15] !== onCheckout || $[16] !== onRemove || $[17] !== onShopNow || $[18] !== onUpdateQuantity || $[19] !== removeItemText || $[20] !== shopNowText || $[21] !== subtotalText || $[22] !== total) {
        t8 = items.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-grow overflow-y-auto p-6 space-y-4",
                    children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: item.imageUrl,
                                    alt: item.name,
                                    className: "w-24 h-24 object-cover rounded-md"
                                }, void 0, false, {
                                    fileName: "[project]/components/organisms/CartDrawer.tsx",
                                    lineNumber: 96,
                                    columnNumber: 194
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-grow",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold",
                                            children: item.name
                                        }, void 0, false, {
                                            fileName: "[project]/components/organisms/CartDrawer.tsx",
                                            lineNumber: 96,
                                            columnNumber: 310
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-muted-foreground",
                                            children: [
                                                "$",
                                                item.price.toFixed(2)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/organisms/CartDrawer.tsx",
                                            lineNumber: 96,
                                            columnNumber: 356
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mt-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$QuantityInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QuantityInput"], {
                                                    quantity: item.quantity,
                                                    setQuantity: (q)=>onUpdateQuantity(item.id, q, JSON.stringify(item.selectedVariant))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/organisms/CartDrawer.tsx",
                                                    lineNumber: 96,
                                                    columnNumber: 485
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "ghost",
                                                    size: "icon",
                                                    onClick: ()=>onRemove(item.id, JSON.stringify(item.selectedVariant)),
                                                    "aria-label": removeItemText,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                        name: "trash",
                                                        className: "w-5 h-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/organisms/CartDrawer.tsx",
                                                        lineNumber: 96,
                                                        columnNumber: 749
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/organisms/CartDrawer.tsx",
                                                    lineNumber: 96,
                                                    columnNumber: 613
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/organisms/CartDrawer.tsx",
                                            lineNumber: 96,
                                            columnNumber: 429
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/organisms/CartDrawer.tsx",
                                    lineNumber: 96,
                                    columnNumber: 283
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, `${item.id}-${JSON.stringify(item.selectedVariant)}`, true, {
                            fileName: "[project]/components/organisms/CartDrawer.tsx",
                            lineNumber: 96,
                            columnNumber: 107
                        }, ("TURBOPACK compile-time value", void 0)))
                }, void 0, false, {
                    fileName: "[project]/components/organisms/CartDrawer.tsx",
                    lineNumber: 96,
                    columnNumber: 31
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-6 border-t mt-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-center font-bold text-lg mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: subtotalText
                                }, void 0, false, {
                                    fileName: "[project]/components/organisms/CartDrawer.tsx",
                                    lineNumber: 96,
                                    columnNumber: 937
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "$",
                                        total.toFixed(2)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/organisms/CartDrawer.tsx",
                                    lineNumber: 96,
                                    columnNumber: 964
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/organisms/CartDrawer.tsx",
                            lineNumber: 96,
                            columnNumber: 863
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            size: "lg",
                            className: "w-full",
                            onClick: onCheckout,
                            children: checkoutText
                        }, void 0, false, {
                            fileName: "[project]/components/organisms/CartDrawer.tsx",
                            lineNumber: 96,
                            columnNumber: 1002
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/organisms/CartDrawer.tsx",
                    lineNumber: 96,
                    columnNumber: 825
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-grow flex flex-col items-center justify-center text-center p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-muted-foreground",
                    children: emptyText
                }, void 0, false, {
                    fileName: "[project]/components/organisms/CartDrawer.tsx",
                    lineNumber: 96,
                    columnNumber: 1180
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    onClick: onShopNow,
                    className: "mt-4",
                    children: shopNowText
                }, void 0, false, {
                    fileName: "[project]/components/organisms/CartDrawer.tsx",
                    lineNumber: 96,
                    columnNumber: 1232
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/CartDrawer.tsx",
            lineNumber: 96,
            columnNumber: 1095
        }, ("TURBOPACK compile-time value", void 0));
        $[12] = checkoutText;
        $[13] = emptyText;
        $[14] = items;
        $[15] = onCheckout;
        $[16] = onRemove;
        $[17] = onShopNow;
        $[18] = onUpdateQuantity;
        $[19] = removeItemText;
        $[20] = shopNowText;
        $[21] = subtotalText;
        $[22] = total;
        $[23] = t8;
    } else {
        t8 = $[23];
    }
    let t9;
    if ($[24] !== t7 || $[25] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col h-full",
            children: [
                t7,
                t8
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/CartDrawer.tsx",
            lineNumber: 114,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[24] = t7;
        $[25] = t8;
        $[26] = t9;
    } else {
        t9 = $[26];
    }
    let t10;
    if ($[27] !== t3 || $[28] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t3,
            children: t9
        }, void 0, false, {
            fileName: "[project]/components/organisms/CartDrawer.tsx",
            lineNumber: 123,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[27] = t3;
        $[28] = t9;
        $[29] = t10;
    } else {
        t10 = $[29];
    }
    let t11;
    if ($[30] !== t10 || $[31] !== t2) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                t2,
                t10
            ]
        }, void 0, true);
        $[30] = t10;
        $[31] = t2;
        $[32] = t11;
    } else {
        t11 = $[32];
    }
    return t11;
};
_c = CartDrawerUI;
const CartDrawer = ()=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(34);
    if ($[0] !== "969d3ea346d173a582a0e1e8c6d21c196de6fe243d3aeed7faeea4c4724f247c") {
        for(let $i = 0; $i < 34; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "969d3ea346d173a582a0e1e8c6d21c196de6fe243d3aeed7faeea4c4724f247c";
    }
    const { isCartOpen, toggleCart, cartItems, removeFromCart, updateQuantity, cartTotal } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"])();
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    let t0;
    if ($[1] !== router || $[2] !== toggleCart) {
        t0 = ()=>{
            toggleCart();
            router.push("/checkout");
        };
        $[1] = router;
        $[2] = toggleCart;
        $[3] = t0;
    } else {
        t0 = $[3];
    }
    const handleCheckout = t0;
    let t1;
    if ($[4] !== router || $[5] !== toggleCart) {
        t1 = ()=>{
            toggleCart();
            router.push("/shop");
        };
        $[4] = router;
        $[5] = toggleCart;
        $[6] = t1;
    } else {
        t1 = $[6];
    }
    const handleShopNow = t1;
    let t2;
    if ($[7] !== t) {
        t2 = t("cart_title");
        $[7] = t;
        $[8] = t2;
    } else {
        t2 = $[8];
    }
    let t3;
    if ($[9] !== t) {
        t3 = t("cart_empty");
        $[9] = t;
        $[10] = t3;
    } else {
        t3 = $[10];
    }
    let t4;
    if ($[11] !== t) {
        t4 = t("cart_subtotal");
        $[11] = t;
        $[12] = t4;
    } else {
        t4 = $[12];
    }
    let t5;
    if ($[13] !== t) {
        t5 = t("cart_checkout");
        $[13] = t;
        $[14] = t5;
    } else {
        t5 = $[14];
    }
    let t6;
    if ($[15] !== t) {
        t6 = t("cart_remove_item");
        $[15] = t;
        $[16] = t6;
    } else {
        t6 = $[16];
    }
    let t7;
    if ($[17] !== t) {
        t7 = t("hero_button_shop");
        $[17] = t;
        $[18] = t7;
    } else {
        t7 = $[18];
    }
    let t8;
    if ($[19] !== cartItems || $[20] !== cartTotal || $[21] !== handleCheckout || $[22] !== handleShopNow || $[23] !== isCartOpen || $[24] !== removeFromCart || $[25] !== t2 || $[26] !== t3 || $[27] !== t4 || $[28] !== t5 || $[29] !== t6 || $[30] !== t7 || $[31] !== toggleCart || $[32] !== updateQuantity) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CartDrawerUI, {
            isOpen: isCartOpen,
            onToggle: toggleCart,
            items: cartItems,
            onRemove: removeFromCart,
            onUpdateQuantity: updateQuantity,
            total: cartTotal,
            title: t2,
            emptyText: t3,
            subtotalText: t4,
            checkoutText: t5,
            removeItemText: t6,
            shopNowText: t7,
            onCheckout: handleCheckout,
            onShopNow: handleShopNow
        }, void 0, false, {
            fileName: "[project]/components/organisms/CartDrawer.tsx",
            lineNumber: 237,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[19] = cartItems;
        $[20] = cartTotal;
        $[21] = handleCheckout;
        $[22] = handleShopNow;
        $[23] = isCartOpen;
        $[24] = removeFromCart;
        $[25] = t2;
        $[26] = t3;
        $[27] = t4;
        $[28] = t5;
        $[29] = t6;
        $[30] = t7;
        $[31] = toggleCart;
        $[32] = updateQuantity;
        $[33] = t8;
    } else {
        t8 = $[33];
    }
    return t8;
};
_s(CartDrawer, "D1p4HgtTWUtro0pXel0ElAVqzFU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c1 = CartDrawer;
var _c, _c1;
__turbopack_context__.k.register(_c, "CartDrawerUI");
__turbopack_context__.k.register(_c1, "CartDrawer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/atoms/Badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
;
;
const Badge = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(5);
    if ($[0] !== "cf03f2382f81f720ca82fde16e9e37cafce8f203cc7c84bfb99d7fc59ecde5a4") {
        for(let $i = 0; $i < 5; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "cf03f2382f81f720ca82fde16e9e37cafce8f203cc7c84bfb99d7fc59ecde5a4";
    }
    const { children, variant: t1, className: t2 } = t0;
    const variant = t1 === undefined ? "primary" : t1;
    const className = t2 === undefined ? "" : t2;
    let t3;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = {
            primary: "bg-primary text-white",
            secondary: "bg-secondary text-white"
        };
        $[1] = t3;
    } else {
        t3 = $[1];
    }
    const variantStyles = t3;
    const t4 = `text-xs font-semibold px-2 py-0.5 rounded-full ${variantStyles[variant]} ${className}`;
    let t5;
    if ($[2] !== children || $[3] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: t4,
            children: children
        }, void 0, false, {
            fileName: "[project]/components/atoms/Badge.tsx",
            lineNumber: 37,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[2] = children;
        $[3] = t4;
        $[4] = t5;
    } else {
        t5 = $[4];
    }
    return t5;
};
_c = Badge;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/atoms/IndicatorCircle.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IndicatorCircle",
    ()=>IndicatorCircle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
;
;
const IndicatorCircle = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(4);
    if ($[0] !== "2f14e9b9b56c19ef3afa7c692f930edd99ecedf6fd691ef9a5ccd0ee3aa192d4") {
        for(let $i = 0; $i < 4; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "2f14e9b9b56c19ef3afa7c692f930edd99ecedf6fd691ef9a5ccd0ee3aa192d4";
    }
    const { count, className: t1 } = t0;
    const className = t1 === undefined ? "" : t1;
    const t2 = `absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-secondary text-white text-xs font-bold border-2 border-card ${className}`;
    let t3;
    if ($[1] !== count || $[2] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: t2,
            children: count
        }, void 0, false, {
            fileName: "[project]/components/atoms/IndicatorCircle.tsx",
            lineNumber: 23,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = count;
        $[2] = t2;
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    return t3;
};
_c = IndicatorCircle;
var _c;
__turbopack_context__.k.register(_c, "IndicatorCircle");
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
"[project]/components/organisms/Header.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Header",
    ()=>Header,
    "HeaderUI",
    ()=>HeaderUI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$Logo$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/molecules/Logo.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$navigation$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/navigation.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$CartDrawer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/organisms/CartDrawer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$IndicatorCircle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/IndicatorCircle.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTheme$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTheme.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useCart.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useUser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useUser.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Icon.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
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
const LanguageSwitcher = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(4);
    if ($[0] !== "9536e216aa46b5e002189623d202728618a5c923df7d5858901e067ba2ef8ba7") {
        for(let $i = 0; $i < 4; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "9536e216aa46b5e002189623d202728618a5c923df7d5858901e067ba2ef8ba7";
    }
    const { language, onToggleLanguage } = t0;
    const t1 = language === "en" ? "AR" : "EN";
    let t2;
    if ($[1] !== onToggleLanguage || $[2] !== t1) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "ghost",
            onClick: onToggleLanguage,
            size: "sm",
            children: t1
        }, void 0, false, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 36,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = onToggleLanguage;
        $[2] = t1;
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    return t2;
};
_c = LanguageSwitcher;
const ThemeSwitcher = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(6);
    if ($[0] !== "9536e216aa46b5e002189623d202728618a5c923df7d5858901e067ba2ef8ba7") {
        for(let $i = 0; $i < 6; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "9536e216aa46b5e002189623d202728618a5c923df7d5858901e067ba2ef8ba7";
    }
    const { theme, onToggleTheme } = t0;
    const t1 = theme === "light" ? "moon" : "sun";
    let t2;
    if ($[1] !== t1) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
            name: t1,
            className: "w-6 h-6"
        }, void 0, false, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 64,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = t1;
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    let t3;
    if ($[3] !== onToggleTheme || $[4] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "ghost",
            size: "icon",
            onClick: onToggleTheme,
            "aria-label": "Toggle theme",
            children: t2
        }, void 0, false, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 72,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = onToggleTheme;
        $[4] = t2;
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    return t3;
};
_c1 = ThemeSwitcher;
const NavLink = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(37);
    if ($[0] !== "9536e216aa46b5e002189623d202728618a5c923df7d5858901e067ba2ef8ba7") {
        for(let $i = 0; $i < 37; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "9536e216aa46b5e002189623d202728618a5c923df7d5858901e067ba2ef8ba7";
    }
    const { item, onClick, t } = t0;
    const [isMegaMenuOpen, setIsMegaMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    let t1;
    if ($[1] !== item.labelKey || $[2] !== onClick || $[3] !== router) {
        t1 = (e, href)=>{
            if (item.labelKey === "nav_ai_generator") {
                e.preventDefault();
                router.push("/");
                setTimeout(_temp, 100);
            }
            onClick();
        };
        $[1] = item.labelKey;
        $[2] = onClick;
        $[3] = router;
        $[4] = t1;
    } else {
        t1 = $[4];
    }
    const handleClick = t1;
    if (item.isMegaMenu) {
        let t2;
        let t3;
        if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
            t2 = ()=>setIsMegaMenuOpen(true);
            t3 = ()=>setIsMegaMenuOpen(false);
            $[5] = t2;
            $[6] = t3;
        } else {
            t2 = $[5];
            t3 = $[6];
        }
        const t4 = item.href;
        let t5;
        if ($[7] !== handleClick || $[8] !== item.href) {
            t5 = (e_0)=>handleClick(e_0, item.href);
            $[7] = handleClick;
            $[8] = item.href;
            $[9] = t5;
        } else {
            t5 = $[9];
        }
        let t6;
        if ($[10] !== item.labelKey || $[11] !== t) {
            t6 = t(item.labelKey);
            $[10] = item.labelKey;
            $[11] = t;
            $[12] = t6;
        } else {
            t6 = $[12];
        }
        let t7;
        if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
            t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                name: "chevronDown",
                className: "w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 152,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[13] = t7;
        } else {
            t7 = $[13];
        }
        let t8;
        if ($[14] !== item.href || $[15] !== t5 || $[16] !== t6) {
            t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: t4,
                onClick: t5,
                className: "relative text-foreground hover:text-primary transition-colors font-medium group text-lg md:text-base flex items-center gap-1",
                children: [
                    t6,
                    " ",
                    t7
                ]
            }, void 0, true, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 159,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[14] = item.href;
            $[15] = t5;
            $[16] = t6;
            $[17] = t8;
        } else {
            t8 = $[17];
        }
        let t9;
        if ($[18] !== handleClick || $[19] !== isMegaMenuOpen || $[20] !== item.megaMenuColumns || $[21] !== t) {
            t9 = isMegaMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-full ltr:left-1/2 rtl:right-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 mt-2 w-max max-w-4xl bg-card rounded-lg shadow-lg border p-6 z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-3 gap-x-12 gap-y-6",
                    children: item.megaMenuColumns?.map((col)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "font-bold text-card-foreground mb-4",
                                    children: t(col.titleKey)
                                }, void 0, false, {
                                    fileName: "[project]/components/organisms/Header.tsx",
                                    lineNumber: 169,
                                    columnNumber: 308
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "space-y-3",
                                    children: col.links.map((link)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: link.href,
                                                    onClick: (e_1)=>handleClick(e_1, link.href),
                                                    className: "text-muted-foreground hover:text-primary transition-colors flex items-center justify-between",
                                                    children: [
                                                        t(link.labelKey),
                                                        link.isNew && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                            variant: "primary",
                                                            className: "ltr:ml-2 rtl:mr-2",
                                                            children: "NEW"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/organisms/Header.tsx",
                                                            lineNumber: 169,
                                                            columnNumber: 661
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/organisms/Header.tsx",
                                                    lineNumber: 169,
                                                    columnNumber: 455
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                link.subLinks && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                    className: "ltr:pl-4 rtl:pr-4 mt-2 space-y-2 border-l-2 border-border ltr:border-l-primary rtl:border-r-primary",
                                                    children: link.subLinks.map((sub)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                href: sub.href,
                                                                onClick: (e_2)=>handleClick(e_2, sub.href),
                                                                className: "flex items-center gap-2 text-sm text-muted-foreground/80 hover:text-primary",
                                                                children: [
                                                                    sub.icon,
                                                                    " ",
                                                                    t(sub.labelKey)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/organisms/Header.tsx",
                                                                lineNumber: 169,
                                                                columnNumber: 918
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, sub.labelKey, false, {
                                                            fileName: "[project]/components/organisms/Header.tsx",
                                                            lineNumber: 169,
                                                            columnNumber: 895
                                                        }, ("TURBOPACK compile-time value", void 0)))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/organisms/Header.tsx",
                                                    lineNumber: 169,
                                                    columnNumber: 753
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, link.labelKey, true, {
                                            fileName: "[project]/components/organisms/Header.tsx",
                                            lineNumber: 169,
                                            columnNumber: 431
                                        }, ("TURBOPACK compile-time value", void 0)))
                                }, void 0, false, {
                                    fileName: "[project]/components/organisms/Header.tsx",
                                    lineNumber: 169,
                                    columnNumber: 382
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, col.titleKey, true, {
                            fileName: "[project]/components/organisms/Header.tsx",
                            lineNumber: 169,
                            columnNumber: 284
                        }, ("TURBOPACK compile-time value", void 0)))
                }, void 0, false, {
                    fileName: "[project]/components/organisms/Header.tsx",
                    lineNumber: 169,
                    columnNumber: 199
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 169,
                columnNumber: 30
            }, ("TURBOPACK compile-time value", void 0));
            $[18] = handleClick;
            $[19] = isMegaMenuOpen;
            $[20] = item.megaMenuColumns;
            $[21] = t;
            $[22] = t9;
        } else {
            t9 = $[22];
        }
        let t10;
        if ($[23] !== t8 || $[24] !== t9) {
            t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                onMouseEnter: t2,
                onMouseLeave: t3,
                children: [
                    t8,
                    t9
                ]
            }, void 0, true, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 180,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[23] = t8;
            $[24] = t9;
            $[25] = t10;
        } else {
            t10 = $[25];
        }
        return t10;
    }
    const t2 = item.href;
    let t3;
    if ($[26] !== handleClick || $[27] !== item.href) {
        t3 = (e_3)=>handleClick(e_3, item.href);
        $[26] = handleClick;
        $[27] = item.href;
        $[28] = t3;
    } else {
        t3 = $[28];
    }
    let t4;
    if ($[29] !== item.labelKey || $[30] !== t) {
        t4 = t(item.labelKey);
        $[29] = item.labelKey;
        $[30] = t;
        $[31] = t4;
    } else {
        t4 = $[31];
    }
    let t5;
    if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"
        }, void 0, false, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 210,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[32] = t5;
    } else {
        t5 = $[32];
    }
    let t6;
    if ($[33] !== item.href || $[34] !== t3 || $[35] !== t4) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: t2,
            onClick: t3,
            className: "relative text-foreground hover:text-primary transition-colors font-medium group text-lg md:text-base",
            children: [
                t4,
                t5
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 217,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[33] = item.href;
        $[34] = t3;
        $[35] = t4;
        $[36] = t6;
    } else {
        t6 = $[36];
    }
    return t6;
};
_s(NavLink, "gkzOKIb8e+0xxh/QD4o/asZSNgs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c2 = NavLink;
const HeaderUI = (t0)=>{
    _s1();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(124);
    if ($[0] !== "9536e216aa46b5e002189623d202728618a5c923df7d5858901e067ba2ef8ba7") {
        for(let $i = 0; $i < 124; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "9536e216aa46b5e002189623d202728618a5c923df7d5858901e067ba2ef8ba7";
    }
    const { handleSearch, t, language, onToggleLanguage, theme, onToggleTheme, cartCount, isCartOpen, onToggleCart, isLoggedIn, onLogout } = t0;
    const [isMenuOpen, setIsMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    let t1;
    if ($[1] !== handleSearch || $[2] !== isMenuOpen || $[3] !== searchQuery) {
        t1 = (e)=>{
            e.preventDefault();
            if (searchQuery.trim()) {
                handleSearch(searchQuery.trim());
                setSearchQuery("");
                if (isMenuOpen) {
                    setIsMenuOpen(false);
                }
            }
        };
        $[1] = handleSearch;
        $[2] = isMenuOpen;
        $[3] = searchQuery;
        $[4] = t1;
    } else {
        t1 = $[4];
    }
    const onSearchSubmit = t1;
    let t2;
    let t3;
    if ($[5] !== isCartOpen || $[6] !== isMenuOpen) {
        t2 = ()=>{
            document.body.style.overflow = isMenuOpen || isCartOpen ? "hidden" : "auto";
        };
        t3 = [
            isMenuOpen,
            isCartOpen
        ];
        $[5] = isCartOpen;
        $[6] = isMenuOpen;
        $[7] = t2;
        $[8] = t3;
    } else {
        t2 = $[7];
        t3 = $[8];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t2, t3);
    let t10;
    let t4;
    let t5;
    let t6;
    let t7;
    let t8;
    let t9;
    if ($[9] !== cartCount || $[10] !== isLoggedIn || $[11] !== isMenuOpen || $[12] !== language || $[13] !== onLogout || $[14] !== onSearchSubmit || $[15] !== onToggleCart || $[16] !== onToggleLanguage || $[17] !== onToggleTheme || $[18] !== router || $[19] !== searchQuery || $[20] !== t || $[21] !== theme) {
        let t11;
        if ($[29] !== isLoggedIn) {
            t11 = (item)=>isLoggedIn || item.href !== "/my-account" && item.href !== "/dashboard";
            $[29] = isLoggedIn;
            $[30] = t11;
        } else {
            t11 = $[30];
        }
        const mainNavItems = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$navigation$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["navigationSchema"].filter(t11);
        let t12;
        if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
            t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-shrink-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$Logo$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Logo"], {}, void 0, false, {
                    fileName: "[project]/components/organisms/Header.tsx",
                    lineNumber: 321,
                    columnNumber: 44
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 321,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[31] = t12;
        } else {
            t12 = $[31];
        }
        let t13;
        if ($[32] !== t) {
            t13 = (item_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavLink, {
                    item: item_0,
                    onClick: ()=>setIsMenuOpen(false),
                    t: t
                }, item_0.labelKey, false, {
                    fileName: "[project]/components/organisms/Header.tsx",
                    lineNumber: 328,
                    columnNumber: 23
                }, ("TURBOPACK compile-time value", void 0));
            $[32] = t;
            $[33] = t13;
        } else {
            t13 = $[33];
        }
        let t14;
        if ($[34] === Symbol.for("react.memo_cache_sentinel")) {
            t14 = (e_0)=>setSearchQuery(e_0.target.value);
            $[34] = t14;
        } else {
            t14 = $[34];
        }
        let t15;
        if ($[35] !== t) {
            t15 = t("search_placeholder");
            $[35] = t;
            $[36] = t15;
        } else {
            t15 = $[36];
        }
        let t16;
        if ($[37] !== searchQuery || $[38] !== t15) {
            t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                type: "text",
                value: searchQuery,
                onChange: t14,
                placeholder: t15,
                className: "w-32 lg:w-48 bg-muted border-transparent h-9 rounded-full ltr:pl-4 rtl:pr-4 ltr:pr-10 rtl:pl-10 text-sm transition-all duration-300 focus:w-48 lg:focus:w-64"
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 351,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[37] = searchQuery;
            $[38] = t15;
            $[39] = t16;
        } else {
            t16 = $[39];
        }
        let t17;
        if ($[40] === Symbol.for("react.memo_cache_sentinel")) {
            t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                size: "icon",
                variant: "ghost",
                type: "submit",
                className: "absolute top-1/2 -translate-y-1/2 ltr:right-0 rtl:left-0 h-9 w-9 text-muted-foreground hover:text-primary",
                "aria-label": "Search",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                    name: "search",
                    className: "w-5 h-5"
                }, void 0, false, {
                    fileName: "[project]/components/organisms/Header.tsx",
                    lineNumber: 360,
                    columnNumber: 201
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 360,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[40] = t17;
        } else {
            t17 = $[40];
        }
        let t18;
        if ($[41] !== onSearchSubmit || $[42] !== t16) {
            t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden sm:flex",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: onSearchSubmit,
                    className: "relative",
                    children: [
                        t16,
                        t17
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/organisms/Header.tsx",
                    lineNumber: 367,
                    columnNumber: 45
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 367,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[41] = onSearchSubmit;
            $[42] = t16;
            $[43] = t18;
        } else {
            t18 = $[43];
        }
        let t19;
        if ($[44] !== onToggleTheme || $[45] !== theme) {
            t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeSwitcher, {
                theme: theme,
                onToggleTheme: onToggleTheme
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 376,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[44] = onToggleTheme;
            $[45] = theme;
            $[46] = t19;
        } else {
            t19 = $[46];
        }
        let t20;
        if ($[47] !== language || $[48] !== onToggleLanguage) {
            t20 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LanguageSwitcher, {
                language: language,
                onToggleLanguage: onToggleLanguage
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 385,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[47] = language;
            $[48] = onToggleLanguage;
            $[49] = t20;
        } else {
            t20 = $[49];
        }
        let t21;
        if ($[50] !== t19 || $[51] !== t20) {
            t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden sm:flex items-center space-x-1",
                children: [
                    t19,
                    t20
                ]
            }, void 0, true, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 394,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[50] = t19;
            $[51] = t20;
            $[52] = t21;
        } else {
            t21 = $[52];
        }
        let t22;
        if ($[53] !== t) {
            t22 = t("header_cart_button");
            $[53] = t;
            $[54] = t22;
        } else {
            t22 = $[54];
        }
        let t23;
        if ($[55] === Symbol.for("react.memo_cache_sentinel")) {
            t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                name: "shoppingCart",
                className: "w-6 h-6 text-foreground"
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 411,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[55] = t23;
        } else {
            t23 = $[55];
        }
        let t24;
        if ($[56] !== cartCount) {
            t24 = cartCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$IndicatorCircle$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IndicatorCircle"], {
                count: cartCount
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 418,
                columnNumber: 30
            }, ("TURBOPACK compile-time value", void 0));
            $[56] = cartCount;
            $[57] = t24;
        } else {
            t24 = $[57];
        }
        let t25;
        if ($[58] !== onToggleCart || $[59] !== t22 || $[60] !== t24) {
            t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                variant: "ghost",
                size: "icon",
                onClick: onToggleCart,
                className: "relative",
                "aria-label": t22,
                children: [
                    t23,
                    t24
                ]
            }, void 0, true, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 426,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[58] = onToggleCart;
            $[59] = t22;
            $[60] = t24;
            $[61] = t25;
        } else {
            t25 = $[61];
        }
        let t26;
        if ($[62] !== isLoggedIn || $[63] !== onLogout || $[64] !== router || $[65] !== t) {
            t26 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden sm:flex items-center gap-2",
                children: !isLoggedIn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "ghost",
                            onClick: ()=>router.push("/registration"),
                            children: t("header_signin_button")
                        }, void 0, false, {
                            fileName: "[project]/components/organisms/Header.tsx",
                            lineNumber: 436,
                            columnNumber: 81
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: ()=>router.push("/registration"),
                            children: t("header_signup_button")
                        }, void 0, false, {
                            fileName: "[project]/components/organisms/Header.tsx",
                            lineNumber: 436,
                            columnNumber: 186
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "outline",
                        onClick: onLogout,
                        children: t("my_account_logout")
                    }, void 0, false, {
                        fileName: "[project]/components/organisms/Header.tsx",
                        lineNumber: 436,
                        columnNumber: 283
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false)
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 436,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[62] = isLoggedIn;
            $[63] = onLogout;
            $[64] = router;
            $[65] = t;
            $[66] = t26;
        } else {
            t26 = $[66];
        }
        let t27;
        if ($[67] === Symbol.for("react.memo_cache_sentinel")) {
            t27 = ()=>setIsMenuOpen(true);
            $[67] = t27;
        } else {
            t27 = $[67];
        }
        let t28;
        if ($[68] === Symbol.for("react.memo_cache_sentinel")) {
            t28 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "md:hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    variant: "ghost",
                    size: "icon",
                    onClick: t27,
                    "aria-label": "Open menu",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                        name: "menu",
                        className: "w-6 h-6 text-foreground"
                    }, void 0, false, {
                        fileName: "[project]/components/organisms/Header.tsx",
                        lineNumber: 454,
                        columnNumber: 113
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/components/organisms/Header.tsx",
                    lineNumber: 454,
                    columnNumber: 40
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 454,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[68] = t28;
        } else {
            t28 = $[68];
        }
        let t29;
        if ($[69] !== t18 || $[70] !== t21 || $[71] !== t25 || $[72] !== t26) {
            t29 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center space-x-2",
                children: [
                    t18,
                    t21,
                    t25,
                    t26,
                    t28
                ]
            }, void 0, true, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 461,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[69] = t18;
            $[70] = t21;
            $[71] = t25;
            $[72] = t26;
            $[73] = t29;
        } else {
            t29 = $[73];
        }
        const t30 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex w-full justify-between items-center py-4 gap-4",
            children: [
                t12,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                    className: "hidden md:flex items-center gap-8",
                    children: mainNavItems.map(t13)
                }, void 0, false, {
                    fileName: "[project]/components/organisms/Header.tsx",
                    lineNumber: 470,
                    columnNumber: 91
                }, ("TURBOPACK compile-time value", void 0)),
                t29
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 470,
            columnNumber: 17
        }, ("TURBOPACK compile-time value", void 0));
        if ($[74] !== t30) {
            t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "bg-card/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm border-b",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-4 sm:px-6 lg:px-8",
                    children: t30
                }, void 0, false, {
                    fileName: "[project]/components/organisms/Header.tsx",
                    lineNumber: 472,
                    columnNumber: 98
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 472,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[74] = t30;
            $[75] = t10;
        } else {
            t10 = $[75];
        }
        t9 = `fixed inset-0 bg-card z-50 transform ${isMenuOpen ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"} transition-transform duration-300 ease-in-out md:hidden`;
        t6 = "container mx-auto px-4 flex flex-col h-full";
        let t31;
        if ($[76] === Symbol.for("react.memo_cache_sentinel")) {
            t31 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$Logo$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Logo"], {}, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 482,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[76] = t31;
        } else {
            t31 = $[76];
        }
        let t32;
        if ($[77] === Symbol.for("react.memo_cache_sentinel")) {
            t32 = ()=>setIsMenuOpen(false);
            $[77] = t32;
        } else {
            t32 = $[77];
        }
        if ($[78] === Symbol.for("react.memo_cache_sentinel")) {
            t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center py-4 border-b",
                children: [
                    t31,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        size: "icon",
                        onClick: t32,
                        "aria-label": "Close menu",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                            name: "x",
                            className: "w-6 h-6 text-foreground"
                        }, void 0, false, {
                            fileName: "[project]/components/organisms/Header.tsx",
                            lineNumber: 495,
                            columnNumber: 156
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/organisms/Header.tsx",
                        lineNumber: 495,
                        columnNumber: 82
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 495,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[78] = t7;
        } else {
            t7 = $[78];
        }
        let t33;
        if ($[79] === Symbol.for("react.memo_cache_sentinel")) {
            t33 = (e_1)=>setSearchQuery(e_1.target.value);
            $[79] = t33;
        } else {
            t33 = $[79];
        }
        let t34;
        if ($[80] !== t) {
            t34 = t("search_placeholder");
            $[80] = t;
            $[81] = t34;
        } else {
            t34 = $[81];
        }
        let t35;
        if ($[82] !== searchQuery || $[83] !== t34) {
            t35 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                type: "text",
                value: searchQuery,
                onChange: t33,
                placeholder: t34,
                className: "rounded-full ltr:pr-12 rtl:pl-12 h-11"
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 517,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[82] = searchQuery;
            $[83] = t34;
            $[84] = t35;
        } else {
            t35 = $[84];
        }
        let t36;
        if ($[85] === Symbol.for("react.memo_cache_sentinel")) {
            t36 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                size: "icon",
                variant: "ghost",
                type: "submit",
                className: "absolute top-1/2 -translate-y-1/2 ltr:right-1 rtl:left-1 text-muted-foreground",
                "aria-label": "Search",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                    name: "search",
                    className: "w-6 h-6"
                }, void 0, false, {
                    fileName: "[project]/components/organisms/Header.tsx",
                    lineNumber: 526,
                    columnNumber: 174
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 526,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[85] = t36;
        } else {
            t36 = $[85];
        }
        if ($[86] !== onSearchSubmit || $[87] !== t35) {
            t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: onSearchSubmit,
                    className: "w-full relative",
                    children: [
                        t35,
                        t36
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/organisms/Header.tsx",
                    lineNumber: 532,
                    columnNumber: 33
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/organisms/Header.tsx",
                lineNumber: 532,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[86] = onSearchSubmit;
            $[87] = t35;
            $[88] = t8;
        } else {
            t8 = $[88];
        }
        t4 = "flex flex-col items-start space-y-6 p-4";
        let t37;
        if ($[89] !== t) {
            t37 = (item_1)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavLink, {
                    item: item_1,
                    onClick: ()=>setIsMenuOpen(false),
                    t: t
                }, item_1.labelKey, false, {
                    fileName: "[project]/components/organisms/Header.tsx",
                    lineNumber: 542,
                    columnNumber: 23
                }, ("TURBOPACK compile-time value", void 0));
            $[89] = t;
            $[90] = t37;
        } else {
            t37 = $[90];
        }
        t5 = mainNavItems.map(t37);
        $[9] = cartCount;
        $[10] = isLoggedIn;
        $[11] = isMenuOpen;
        $[12] = language;
        $[13] = onLogout;
        $[14] = onSearchSubmit;
        $[15] = onToggleCart;
        $[16] = onToggleLanguage;
        $[17] = onToggleTheme;
        $[18] = router;
        $[19] = searchQuery;
        $[20] = t;
        $[21] = theme;
        $[22] = t10;
        $[23] = t4;
        $[24] = t5;
        $[25] = t6;
        $[26] = t7;
        $[27] = t8;
        $[28] = t9;
    } else {
        t10 = $[22];
        t4 = $[23];
        t5 = $[24];
        t6 = $[25];
        t7 = $[26];
        t8 = $[27];
        t9 = $[28];
    }
    let t11;
    if ($[91] !== t4 || $[92] !== t5) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            className: t4,
            children: t5
        }, void 0, false, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 580,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[91] = t4;
        $[92] = t5;
        $[93] = t11;
    } else {
        t11 = $[93];
    }
    let t12;
    if ($[94] !== onToggleTheme || $[95] !== theme) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeSwitcher, {
            theme: theme,
            onToggleTheme: onToggleTheme
        }, void 0, false, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 589,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[94] = onToggleTheme;
        $[95] = theme;
        $[96] = t12;
    } else {
        t12 = $[96];
    }
    let t13;
    if ($[97] !== language || $[98] !== onToggleLanguage) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LanguageSwitcher, {
            language: language,
            onToggleLanguage: onToggleLanguage
        }, void 0, false, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 598,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[97] = language;
        $[98] = onToggleLanguage;
        $[99] = t13;
    } else {
        t13 = $[99];
    }
    let t14;
    if ($[100] !== t12 || $[101] !== t13) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-around items-center mb-4",
            children: [
                t12,
                t13
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 607,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[100] = t12;
        $[101] = t13;
        $[102] = t14;
    } else {
        t14 = $[102];
    }
    let t15;
    if ($[103] !== isLoggedIn || $[104] !== onLogout || $[105] !== router || $[106] !== t) {
        t15 = !isLoggedIn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    size: "lg",
                    className: "w-full",
                    onClick: ()=>{
                        setIsMenuOpen(false);
                        router.push("/registration");
                    },
                    children: t("header_signup_button")
                }, void 0, false, {
                    fileName: "[project]/components/organisms/Header.tsx",
                    lineNumber: 616,
                    columnNumber: 27
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    variant: "outline",
                    size: "lg",
                    className: "w-full mt-2",
                    onClick: ()=>{
                        setIsMenuOpen(false);
                        router.push("/registration");
                    },
                    children: t("header_signin_button")
                }, void 0, false, {
                    fileName: "[project]/components/organisms/Header.tsx",
                    lineNumber: 619,
                    columnNumber: 46
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "outline",
            size: "lg",
            className: "w-full",
            onClick: ()=>{
                setIsMenuOpen(false);
                onLogout();
            },
            children: t("my_account_logout")
        }, void 0, false, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 622,
            columnNumber: 52
        }, ("TURBOPACK compile-time value", void 0));
        $[103] = isLoggedIn;
        $[104] = onLogout;
        $[105] = router;
        $[106] = t;
        $[107] = t15;
    } else {
        t15 = $[107];
    }
    let t16;
    if ($[108] !== t14 || $[109] !== t15) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-auto p-4 border-t",
            children: [
                t14,
                t15
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 636,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[108] = t14;
        $[109] = t15;
        $[110] = t16;
    } else {
        t16 = $[110];
    }
    let t17;
    if ($[111] !== t11 || $[112] !== t16 || $[113] !== t6 || $[114] !== t7 || $[115] !== t8) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t6,
            children: [
                t7,
                t8,
                t11,
                t16
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 645,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[111] = t11;
        $[112] = t16;
        $[113] = t6;
        $[114] = t7;
        $[115] = t8;
        $[116] = t17;
    } else {
        t17 = $[116];
    }
    let t18;
    if ($[117] !== t17 || $[118] !== t9) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t9,
            children: t17
        }, void 0, false, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 657,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[117] = t17;
        $[118] = t9;
        $[119] = t18;
    } else {
        t18 = $[119];
    }
    let t19;
    if ($[120] === Symbol.for("react.memo_cache_sentinel")) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$CartDrawer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartDrawer"], {}, void 0, false, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 666,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[120] = t19;
    } else {
        t19 = $[120];
    }
    let t20;
    if ($[121] !== t10 || $[122] !== t18) {
        t20 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                t10,
                t18,
                t19
            ]
        }, void 0, true);
        $[121] = t10;
        $[122] = t18;
        $[123] = t20;
    } else {
        t20 = $[123];
    }
    return t20;
};
_s1(HeaderUI, "kNac5Wwi+T+kT8TC5+7ggHWyEjw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c3 = HeaderUI;
const Header = ()=>{
    _s2();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(24);
    if ($[0] !== "9536e216aa46b5e002189623d202728618a5c923df7d5858901e067ba2ef8ba7") {
        for(let $i = 0; $i < 24; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "9536e216aa46b5e002189623d202728618a5c923df7d5858901e067ba2ef8ba7";
    }
    const { t, language, setLanguage } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const { theme, setTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTheme$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const { cartCount, isCartOpen, toggleCart } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"])();
    const { isLoggedIn, logout } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useUser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    let t0;
    if ($[1] !== language || $[2] !== setLanguage) {
        t0 = ()=>{
            setLanguage(language === "en" ? "ar" : "en");
        };
        $[1] = language;
        $[2] = setLanguage;
        $[3] = t0;
    } else {
        t0 = $[3];
    }
    const handleToggleLanguage = t0;
    let t1;
    if ($[4] !== setTheme || $[5] !== theme) {
        t1 = ()=>{
            setTheme(theme === "light" ? "dark" : "light");
        };
        $[4] = setTheme;
        $[5] = theme;
        $[6] = t1;
    } else {
        t1 = $[6];
    }
    const handleToggleTheme = t1;
    let t2;
    if ($[7] !== logout || $[8] !== router) {
        t2 = ()=>{
            logout();
            router.push("/");
        };
        $[7] = logout;
        $[8] = router;
        $[9] = t2;
    } else {
        t2 = $[9];
    }
    const handleLogout = t2;
    let t3;
    if ($[10] !== router) {
        t3 = (query)=>{
            router.push(`/search?q=${encodeURIComponent(query)}`);
        };
        $[10] = router;
        $[11] = t3;
    } else {
        t3 = $[11];
    }
    const handleSearch = t3;
    let t4;
    if ($[12] !== cartCount || $[13] !== handleLogout || $[14] !== handleSearch || $[15] !== handleToggleLanguage || $[16] !== handleToggleTheme || $[17] !== isCartOpen || $[18] !== isLoggedIn || $[19] !== language || $[20] !== t || $[21] !== theme || $[22] !== toggleCart) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(HeaderUI, {
            handleSearch: handleSearch,
            t: t,
            language: language,
            onToggleLanguage: handleToggleLanguage,
            theme: theme,
            onToggleTheme: handleToggleTheme,
            cartCount: cartCount,
            isCartOpen: isCartOpen,
            onToggleCart: toggleCart,
            isLoggedIn: isLoggedIn,
            onLogout: handleLogout
        }, void 0, false, {
            fileName: "[project]/components/organisms/Header.tsx",
            lineNumber: 759,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[12] = cartCount;
        $[13] = handleLogout;
        $[14] = handleSearch;
        $[15] = handleToggleLanguage;
        $[16] = handleToggleTheme;
        $[17] = isCartOpen;
        $[18] = isLoggedIn;
        $[19] = language;
        $[20] = t;
        $[21] = theme;
        $[22] = toggleCart;
        $[23] = t4;
    } else {
        t4 = $[23];
    }
    return t4;
};
_s2(Header, "oLyJ/KTd6t3OSMmqfp+kepYP7OE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTheme$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useUser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUser"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c4 = Header;
function _temp() {
    document.querySelector("#ai-generator")?.scrollIntoView({
        behavior: "smooth"
    });
}
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "LanguageSwitcher");
__turbopack_context__.k.register(_c1, "ThemeSwitcher");
__turbopack_context__.k.register(_c2, "NavLink");
__turbopack_context__.k.register(_c3, "HeaderUI");
__turbopack_context__.k.register(_c4, "Header");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/organisms/Footer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Footer",
    ()=>Footer,
    "FooterUI",
    ()=>FooterUI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$Logo$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/molecules/Logo.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Icon.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const FooterUI = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(44);
    if ($[0] !== "ac1c398dfb4e496ecdc1b5093589328dd5c63f62fe75d8cbc5aa3396bc47ca87") {
        for(let $i = 0; $i < 44; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "ac1c398dfb4e496ecdc1b5093589328dd5c63f62fe75d8cbc5aa3396bc47ca87";
    }
    const { onSettingsClick, tagline, shopTitle, aboutTitle, followTitle, copyrightText, cookieSettingsText, shopLinks, aboutLinks } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [
            {
                name: "facebook",
                href: "#",
                label: "Facebook"
            },
            {
                name: "instagram",
                href: "#",
                label: "Instagram"
            },
            {
                name: "twitter",
                href: "#",
                label: "Twitter"
            }
        ];
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    const socialLinks = t1;
    let t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$Logo$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Logo"], {}, void 0, false, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 66,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[2] = t2;
    } else {
        t2 = $[2];
    }
    let t3;
    if ($[3] !== tagline) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "col-span-2 lg:col-span-1",
            children: [
                t2,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-4 text-white/80",
                    children: tagline
                }, void 0, false, {
                    fileName: "[project]/components/organisms/Footer.tsx",
                    lineNumber: 73,
                    columnNumber: 56
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 73,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = tagline;
        $[4] = t3;
    } else {
        t3 = $[4];
    }
    let t4;
    if ($[5] !== shopTitle) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
            className: "font-semibold text-lg mb-4",
            children: shopTitle
        }, void 0, false, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 81,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[5] = shopTitle;
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    let t5;
    if ($[7] !== shopLinks) {
        t5 = shopLinks.map(_temp);
        $[7] = shopLinks;
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    let t6;
    if ($[9] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
            className: "space-y-2",
            children: t5
        }, void 0, false, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 97,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[9] = t5;
        $[10] = t6;
    } else {
        t6 = $[10];
    }
    let t7;
    if ($[11] !== t4 || $[12] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "col-span-1",
            children: [
                t4,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 105,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[11] = t4;
        $[12] = t6;
        $[13] = t7;
    } else {
        t7 = $[13];
    }
    let t8;
    if ($[14] !== aboutTitle) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
            className: "font-semibold text-lg mb-4",
            children: aboutTitle
        }, void 0, false, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 114,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[14] = aboutTitle;
        $[15] = t8;
    } else {
        t8 = $[15];
    }
    let t9;
    if ($[16] !== aboutLinks) {
        t9 = aboutLinks.map(_temp2);
        $[16] = aboutLinks;
        $[17] = t9;
    } else {
        t9 = $[17];
    }
    let t10;
    if ($[18] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
            className: "space-y-2",
            children: t9
        }, void 0, false, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 130,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[18] = t9;
        $[19] = t10;
    } else {
        t10 = $[19];
    }
    let t11;
    if ($[20] !== t10 || $[21] !== t8) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "col-span-1",
            children: [
                t8,
                t10
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 138,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[20] = t10;
        $[21] = t8;
        $[22] = t11;
    } else {
        t11 = $[22];
    }
    let t12;
    if ($[23] !== followTitle) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
            className: "font-semibold text-lg mb-4",
            children: followTitle
        }, void 0, false, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 147,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[23] = followTitle;
        $[24] = t12;
    } else {
        t12 = $[24];
    }
    let t13;
    if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex space-x-4",
            children: socialLinks.map(_temp3)
        }, void 0, false, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 155,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[25] = t13;
    } else {
        t13 = $[25];
    }
    let t14;
    if ($[26] !== t12) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "col-span-2 md:col-span-1",
            children: [
                t12,
                t13
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 162,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[26] = t12;
        $[27] = t14;
    } else {
        t14 = $[27];
    }
    let t15;
    if ($[28] !== t11 || $[29] !== t14 || $[30] !== t3 || $[31] !== t7) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8",
            children: [
                t3,
                t7,
                t11,
                t14
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 170,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[28] = t11;
        $[29] = t14;
        $[30] = t3;
        $[31] = t7;
        $[32] = t15;
    } else {
        t15 = $[32];
    }
    let t16;
    if ($[33] !== copyrightText) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            children: [
                "© 2024 FindEg.com. ",
                copyrightText
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 181,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[33] = copyrightText;
        $[34] = t16;
    } else {
        t16 = $[34];
    }
    let t17;
    if ($[35] !== cookieSettingsText || $[36] !== onSettingsClick) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "link",
            onClick: onSettingsClick,
            className: "text-white/70 hover:text-white mt-4 sm:mt-0 px-0",
            children: cookieSettingsText
        }, void 0, false, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 189,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[35] = cookieSettingsText;
        $[36] = onSettingsClick;
        $[37] = t17;
    } else {
        t17 = $[37];
    }
    let t18;
    if ($[38] !== t16 || $[39] !== t17) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-12 border-t border-white/20 pt-8 flex flex-col sm:flex-row justify-between items-center text-center text-white/70",
            children: [
                t16,
                t17
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 198,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[38] = t16;
        $[39] = t17;
        $[40] = t18;
    } else {
        t18 = $[40];
    }
    let t19;
    if ($[41] !== t15 || $[42] !== t18) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
            className: "bg-primary text-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container mx-auto px-4 pt-16 pb-8",
                children: [
                    t15,
                    t18
                ]
            }, void 0, true, {
                fileName: "[project]/components/organisms/Footer.tsx",
                lineNumber: 207,
                columnNumber: 53
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 207,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[41] = t15;
        $[42] = t18;
        $[43] = t19;
    } else {
        t19 = $[43];
    }
    return t19;
};
_c = FooterUI;
const Footer = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(60);
    if ($[0] !== "ac1c398dfb4e496ecdc1b5093589328dd5c63f62fe75d8cbc5aa3396bc47ca87") {
        for(let $i = 0; $i < 60; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "ac1c398dfb4e496ecdc1b5093589328dd5c63f62fe75d8cbc5aa3396bc47ca87";
    }
    const { onSettingsClick } = t0;
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    let t1;
    if ($[1] !== t) {
        t1 = t("nav_shop");
        $[1] = t;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    let t2;
    if ($[3] !== t1) {
        t2 = {
            label: t1,
            href: "/shop"
        };
        $[3] = t1;
        $[4] = t2;
    } else {
        t2 = $[4];
    }
    let t3;
    if ($[5] !== t) {
        t3 = t("nav_categories");
        $[5] = t;
        $[6] = t3;
    } else {
        t3 = $[6];
    }
    let t4;
    if ($[7] !== t3) {
        t4 = {
            label: t3,
            href: "/categories"
        };
        $[7] = t3;
        $[8] = t4;
    } else {
        t4 = $[8];
    }
    let t5;
    if ($[9] !== t) {
        t5 = t("featured_products_title");
        $[9] = t;
        $[10] = t5;
    } else {
        t5 = $[10];
    }
    let t6;
    if ($[11] !== t5) {
        t6 = {
            label: t5,
            href: "/shop"
        };
        $[11] = t5;
        $[12] = t6;
    } else {
        t6 = $[12];
    }
    let t7;
    if ($[13] !== t2 || $[14] !== t4 || $[15] !== t6) {
        t7 = [
            t2,
            t4,
            t6
        ];
        $[13] = t2;
        $[14] = t4;
        $[15] = t6;
        $[16] = t7;
    } else {
        t7 = $[16];
    }
    const shopLinks = t7;
    let t8;
    if ($[17] !== t) {
        t8 = t("footer_about_story");
        $[17] = t;
        $[18] = t8;
    } else {
        t8 = $[18];
    }
    let t9;
    if ($[19] !== t8) {
        t9 = {
            label: t8,
            href: "/about"
        };
        $[19] = t8;
        $[20] = t9;
    } else {
        t9 = $[20];
    }
    let t10;
    if ($[21] !== t) {
        t10 = t("footer_about_contact");
        $[21] = t;
        $[22] = t10;
    } else {
        t10 = $[22];
    }
    let t11;
    if ($[23] !== t10) {
        t11 = {
            label: t10,
            href: "/about"
        };
        $[23] = t10;
        $[24] = t11;
    } else {
        t11 = $[24];
    }
    let t12;
    if ($[25] !== t) {
        t12 = t("faq_title");
        $[25] = t;
        $[26] = t12;
    } else {
        t12 = $[26];
    }
    let t13;
    if ($[27] !== t12) {
        t13 = {
            label: t12,
            href: "/shop"
        };
        $[27] = t12;
        $[28] = t13;
    } else {
        t13 = $[28];
    }
    let t14;
    if ($[29] !== t) {
        t14 = t("nav_brand_kit");
        $[29] = t;
        $[30] = t14;
    } else {
        t14 = $[30];
    }
    let t15;
    if ($[31] !== t14) {
        t15 = {
            label: t14,
            href: "/brand-kit"
        };
        $[31] = t14;
        $[32] = t15;
    } else {
        t15 = $[32];
    }
    let t16;
    if ($[33] !== t11 || $[34] !== t13 || $[35] !== t15 || $[36] !== t9) {
        t16 = [
            t9,
            t11,
            t13,
            t15
        ];
        $[33] = t11;
        $[34] = t13;
        $[35] = t15;
        $[36] = t9;
        $[37] = t16;
    } else {
        t16 = $[37];
    }
    const aboutLinks = t16;
    let t17;
    if ($[38] !== t) {
        t17 = t("footer_tagline");
        $[38] = t;
        $[39] = t17;
    } else {
        t17 = $[39];
    }
    let t18;
    if ($[40] !== t) {
        t18 = t("footer_shop_title");
        $[40] = t;
        $[41] = t18;
    } else {
        t18 = $[41];
    }
    let t19;
    if ($[42] !== t) {
        t19 = t("footer_about_title");
        $[42] = t;
        $[43] = t19;
    } else {
        t19 = $[43];
    }
    let t20;
    if ($[44] !== t) {
        t20 = t("footer_follow_title");
        $[44] = t;
        $[45] = t20;
    } else {
        t20 = $[45];
    }
    let t21;
    if ($[46] !== t) {
        t21 = t("footer_copyright");
        $[46] = t;
        $[47] = t21;
    } else {
        t21 = $[47];
    }
    let t22;
    if ($[48] !== t) {
        t22 = t("footer_cookie_settings");
        $[48] = t;
        $[49] = t22;
    } else {
        t22 = $[49];
    }
    let t23;
    if ($[50] !== aboutLinks || $[51] !== onSettingsClick || $[52] !== shopLinks || $[53] !== t17 || $[54] !== t18 || $[55] !== t19 || $[56] !== t20 || $[57] !== t21 || $[58] !== t22) {
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FooterUI, {
            onSettingsClick: onSettingsClick,
            tagline: t17,
            shopTitle: t18,
            aboutTitle: t19,
            followTitle: t20,
            copyrightText: t21,
            cookieSettingsText: t22,
            shopLinks: shopLinks,
            aboutLinks: aboutLinks
        }, void 0, false, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 439,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[50] = aboutLinks;
        $[51] = onSettingsClick;
        $[52] = shopLinks;
        $[53] = t17;
        $[54] = t18;
        $[55] = t19;
        $[56] = t20;
        $[57] = t21;
        $[58] = t22;
        $[59] = t23;
    } else {
        t23 = $[59];
    }
    return t23;
};
_s(Footer, "vu2xTFBfHkv41zWfADiErp1aWcA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c1 = Footer;
function _temp(link) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: link.href,
            className: "text-white/80 hover:text-white transition-colors",
            children: link.label
        }, void 0, false, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 456,
            columnNumber: 31
        }, this)
    }, link.label, false, {
        fileName: "[project]/components/organisms/Footer.tsx",
        lineNumber: 456,
        columnNumber: 10
    }, this);
}
function _temp2(link_0) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: link_0.href,
            className: "text-white/80 hover:text-white transition-colors",
            children: link_0.label
        }, void 0, false, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 459,
            columnNumber: 33
        }, this)
    }, link_0.label, false, {
        fileName: "[project]/components/organisms/Footer.tsx",
        lineNumber: 459,
        columnNumber: 10
    }, this);
}
function _temp3(t0) {
    const { name, href, label } = t0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
        href: href,
        "aria-label": label,
        className: "text-white/80 hover:text-white transition-colors",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
            name: name,
            className: "w-6 h-6"
        }, void 0, false, {
            fileName: "[project]/components/organisms/Footer.tsx",
            lineNumber: 467,
            columnNumber: 117
        }, this)
    }, label, false, {
        fileName: "[project]/components/organisms/Footer.tsx",
        lineNumber: 467,
        columnNumber: 10
    }, this);
}
var _c, _c1;
__turbopack_context__.k.register(_c, "FooterUI");
__turbopack_context__.k.register(_c1, "Footer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/organisms/AnnouncementBar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AnnouncementBar",
    ()=>AnnouncementBar,
    "AnnouncementBarUI",
    ()=>AnnouncementBarUI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Icon.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const AnnouncementBarUI = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(10);
    if ($[0] !== "b694e6ef9cf9ec0f3f7e29800aff1120f8b47a0141782acfbf5d64327e79368c") {
        for(let $i = 0; $i < 10; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "b694e6ef9cf9ec0f3f7e29800aff1120f8b47a0141782acfbf5d64327e79368c";
    }
    const { isVisible, onClose, text, closeLabel } = t0;
    if (!isVisible) {
        return null;
    }
    let t1;
    if ($[1] !== text) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            children: text
        }, void 0, false, {
            fileName: "[project]/components/organisms/AnnouncementBar.tsx",
            lineNumber: 32,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = text;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    let t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
            name: "x",
            className: "w-4 h-4"
        }, void 0, false, {
            fileName: "[project]/components/organisms/AnnouncementBar.tsx",
            lineNumber: 40,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    let t3;
    if ($[4] !== closeLabel || $[5] !== onClose) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: onClose,
            "aria-label": closeLabel,
            className: "absolute ltr:right-0 rtl:left-0 p-1 rounded-full hover:bg-white/20 transition-colors",
            children: t2
        }, void 0, false, {
            fileName: "[project]/components/organisms/AnnouncementBar.tsx",
            lineNumber: 47,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[4] = closeLabel;
        $[5] = onClose;
        $[6] = t3;
    } else {
        t3 = $[6];
    }
    let t4;
    if ($[7] !== t1 || $[8] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-primary text-white text-sm font-medium",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container mx-auto px-4 sm:px-6 lg:px-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative flex items-center justify-center py-2",
                    children: [
                        t1,
                        t3
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/organisms/AnnouncementBar.tsx",
                    lineNumber: 56,
                    columnNumber: 125
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/organisms/AnnouncementBar.tsx",
                lineNumber: 56,
                columnNumber: 69
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/organisms/AnnouncementBar.tsx",
            lineNumber: 56,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[7] = t1;
        $[8] = t3;
        $[9] = t4;
    } else {
        t4 = $[9];
    }
    return t4;
};
_c = AnnouncementBarUI;
const AnnouncementBar = ()=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(12);
    if ($[0] !== "b694e6ef9cf9ec0f3f7e29800aff1120f8b47a0141782acfbf5d64327e79368c") {
        for(let $i = 0; $i < 12; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "b694e6ef9cf9ec0f3f7e29800aff1120f8b47a0141782acfbf5d64327e79368c";
    }
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    let t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = ()=>{
            ;
            try {
                const dismissed = localStorage.getItem("announcementDismissed");
                if (dismissed !== "true") {
                    setIsVisible(true);
                }
            } catch (t2) {
                const error = t2;
                console.error("Could not read from localStorage:", error);
                setIsVisible(true);
            }
        };
        t1 = [];
        $[1] = t0;
        $[2] = t1;
    } else {
        t0 = $[1];
        t1 = $[2];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t0, t1);
    let t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = ()=>{
            ;
            try {
                localStorage.setItem("announcementDismissed", "true");
            } catch (t3) {
                const error_0 = t3;
                console.error("Could not write to localStorage:", error_0);
            }
            setIsVisible(false);
        };
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    const handleClose = t2;
    let t3;
    if ($[4] !== t) {
        t3 = t("announcement_bar_text");
        $[4] = t;
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    let t4;
    if ($[6] !== t) {
        t4 = t("announcement_bar_close");
        $[6] = t;
        $[7] = t4;
    } else {
        t4 = $[7];
    }
    let t5;
    if ($[8] !== isVisible || $[9] !== t3 || $[10] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AnnouncementBarUI, {
            isVisible: isVisible,
            onClose: handleClose,
            text: t3,
            closeLabel: t4
        }, void 0, false, {
            fileName: "[project]/components/organisms/AnnouncementBar.tsx",
            lineNumber: 136,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[8] = isVisible;
        $[9] = t3;
        $[10] = t4;
        $[11] = t5;
    } else {
        t5 = $[11];
    }
    return t5;
};
_s(AnnouncementBar, "mrlaTogbsxQU/IEDYmXy++l1TWM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c1 = AnnouncementBar;
var _c, _c1;
__turbopack_context__.k.register(_c, "AnnouncementBarUI");
__turbopack_context__.k.register(_c1, "AnnouncementBar");
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
"[project]/components/organisms/CookieConsentBanner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CookieConsentBanner",
    ()=>CookieConsentBanner,
    "CookieConsentBannerUI",
    ()=>CookieConsentBannerUI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
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
const CookieConsentBannerUI = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(29);
    if ($[0] !== "1f06e5f200a73b0ba2f3071f2209fefe625a454fca0c71fa18bc07a7257a94e2") {
        for(let $i = 0; $i < 29; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "1f06e5f200a73b0ba2f3071f2209fefe625a454fca0c71fa18bc07a7257a94e2";
    }
    const { isVisible, onConsent, onSettingsClick, title, text, acceptText, rejectText, settingsText } = t0;
    if (!isVisible) {
        return null;
    }
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
            children: "\n                @keyframes slide-up {\n                    from { transform: translateY(100%); }\n                    to { transform: translateY(0); }\n                }\n                .animate-slide-up { animation: slide-up 0.3s ease-out; }\n            "
        }, void 0, false, {
            fileName: "[project]/components/organisms/CookieConsentBanner.tsx",
            lineNumber: 41,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    let t2;
    if ($[2] !== title) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
            className: "font-semibold",
            children: title
        }, void 0, false, {
            fileName: "[project]/components/organisms/CookieConsentBanner.tsx",
            lineNumber: 48,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[2] = title;
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    let t3;
    if ($[4] !== text) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-sm text-muted-foreground",
            children: text
        }, void 0, false, {
            fileName: "[project]/components/organisms/CookieConsentBanner.tsx",
            lineNumber: 56,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[4] = text;
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    let t4;
    if ($[6] !== t2 || $[7] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center md:text-left",
            children: [
                t2,
                t3
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/CookieConsentBanner.tsx",
            lineNumber: 64,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[6] = t2;
        $[7] = t3;
        $[8] = t4;
    } else {
        t4 = $[8];
    }
    let t5;
    if ($[9] !== onSettingsClick || $[10] !== settingsText) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            onClick: onSettingsClick,
            variant: "ghost",
            size: "sm",
            className: "w-full sm:w-auto",
            children: settingsText
        }, void 0, false, {
            fileName: "[project]/components/organisms/CookieConsentBanner.tsx",
            lineNumber: 73,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[9] = onSettingsClick;
        $[10] = settingsText;
        $[11] = t5;
    } else {
        t5 = $[11];
    }
    let t6;
    if ($[12] !== onConsent) {
        t6 = ()=>onConsent(false);
        $[12] = onConsent;
        $[13] = t6;
    } else {
        t6 = $[13];
    }
    let t7;
    if ($[14] !== rejectText || $[15] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            onClick: t6,
            variant: "outline",
            size: "sm",
            className: "w-full sm:w-auto",
            children: rejectText
        }, void 0, false, {
            fileName: "[project]/components/organisms/CookieConsentBanner.tsx",
            lineNumber: 90,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[14] = rejectText;
        $[15] = t6;
        $[16] = t7;
    } else {
        t7 = $[16];
    }
    let t8;
    if ($[17] !== onConsent) {
        t8 = ()=>onConsent(true);
        $[17] = onConsent;
        $[18] = t8;
    } else {
        t8 = $[18];
    }
    let t9;
    if ($[19] !== acceptText || $[20] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            onClick: t8,
            size: "sm",
            className: "w-full sm:w-auto",
            children: acceptText
        }, void 0, false, {
            fileName: "[project]/components/organisms/CookieConsentBanner.tsx",
            lineNumber: 107,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[19] = acceptText;
        $[20] = t8;
        $[21] = t9;
    } else {
        t9 = $[21];
    }
    let t10;
    if ($[22] !== t5 || $[23] !== t7 || $[24] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0",
            children: [
                t5,
                t7,
                t9
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/CookieConsentBanner.tsx",
            lineNumber: 116,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[22] = t5;
        $[23] = t7;
        $[24] = t9;
        $[25] = t10;
    } else {
        t10 = $[25];
    }
    let t11;
    if ($[26] !== t10 || $[27] !== t4) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm z-50 border-t shadow-lg animate-slide-up",
            children: [
                t1,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Container$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Container"], {
                    className: "py-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col md:flex-row items-center justify-between gap-4",
                        children: [
                            t4,
                            t10
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/organisms/CookieConsentBanner.tsx",
                        lineNumber: 126,
                        columnNumber: 159
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/components/organisms/CookieConsentBanner.tsx",
                    lineNumber: 126,
                    columnNumber: 131
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/CookieConsentBanner.tsx",
            lineNumber: 126,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[26] = t10;
        $[27] = t4;
        $[28] = t11;
    } else {
        t11 = $[28];
    }
    return t11;
};
_c = CookieConsentBannerUI;
const CookieConsentBanner = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(22);
    if ($[0] !== "1f06e5f200a73b0ba2f3071f2209fefe625a454fca0c71fa18bc07a7257a94e2") {
        for(let $i = 0; $i < 22; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "1f06e5f200a73b0ba2f3071f2209fefe625a454fca0c71fa18bc07a7257a94e2";
    }
    const { onSettingsClick } = t0;
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    let t1;
    let t2;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = ()=>{
            ;
            try {
                const consent = localStorage.getItem("cookieConsent");
                if (!consent) {
                    setIsVisible(true);
                }
            } catch (t3) {
                const error = t3;
                console.error("Could not read from localStorage:", error);
                setIsVisible(true);
            }
        };
        t2 = [];
        $[1] = t1;
        $[2] = t2;
    } else {
        t1 = $[1];
        t2 = $[2];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t1, t2);
    let t3;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = (acceptAll)=>{
            ;
            try {
                localStorage.setItem("cookieConsent", "true");
                const preferences = {
                    required: true,
                    analytics: acceptAll,
                    marketing: acceptAll
                };
                localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
            } catch (t4) {
                const error_0 = t4;
                console.error("Could not write to localStorage:", error_0);
            }
            setIsVisible(false);
        };
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    const handleConsent = t3;
    let t4;
    if ($[4] !== t) {
        t4 = t("cookie_consent_title");
        $[4] = t;
        $[5] = t4;
    } else {
        t4 = $[5];
    }
    let t5;
    if ($[6] !== t) {
        t5 = t("cookie_consent_text");
        $[6] = t;
        $[7] = t5;
    } else {
        t5 = $[7];
    }
    let t6;
    if ($[8] !== t) {
        t6 = t("cookie_consent_accept");
        $[8] = t;
        $[9] = t6;
    } else {
        t6 = $[9];
    }
    let t7;
    if ($[10] !== t) {
        t7 = t("cookie_consent_reject");
        $[10] = t;
        $[11] = t7;
    } else {
        t7 = $[11];
    }
    let t8;
    if ($[12] !== t) {
        t8 = t("cookie_consent_settings");
        $[12] = t;
        $[13] = t8;
    } else {
        t8 = $[13];
    }
    let t9;
    if ($[14] !== isVisible || $[15] !== onSettingsClick || $[16] !== t4 || $[17] !== t5 || $[18] !== t6 || $[19] !== t7 || $[20] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CookieConsentBannerUI, {
            isVisible: isVisible,
            onConsent: handleConsent,
            onSettingsClick: onSettingsClick,
            title: t4,
            text: t5,
            acceptText: t6,
            rejectText: t7,
            settingsText: t8
        }, void 0, false, {
            fileName: "[project]/components/organisms/CookieConsentBanner.tsx",
            lineNumber: 242,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[14] = isVisible;
        $[15] = onSettingsClick;
        $[16] = t4;
        $[17] = t5;
        $[18] = t6;
        $[19] = t7;
        $[20] = t8;
        $[21] = t9;
    } else {
        t9 = $[21];
    }
    return t9;
};
_s(CookieConsentBanner, "mrlaTogbsxQU/IEDYmXy++l1TWM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c1 = CookieConsentBanner;
var _c, _c1;
__turbopack_context__.k.register(_c, "CookieConsentBannerUI");
__turbopack_context__.k.register(_c1, "CookieConsentBanner");
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
"[project]/components/ui/dialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Dialog",
    ()=>Dialog,
    "DialogContent",
    ()=>DialogContent,
    "DialogDescription",
    ()=>DialogDescription,
    "DialogFooter",
    ()=>DialogFooter,
    "DialogHeader",
    ()=>DialogHeader,
    "DialogTitle",
    ()=>DialogTitle,
    "DialogTrigger",
    ()=>DialogTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Icon.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature();
;
;
;
;
const DialogContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const useDialog = ()=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(1);
    if ($[0] !== "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e") {
        for(let $i = 0; $i < 1; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e";
    }
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(DialogContext);
    if (!context) {
        throw new Error("useDialog must be used within a Dialog");
    }
    return context;
};
_s(useDialog, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
const Dialog = (t0)=>{
    _s1();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(10);
    if ($[0] !== "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e") {
        for(let $i = 0; $i < 10; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e";
    }
    const { children, open: controlledOpen, onOpenChange: setControlledOpen } = t0;
    const [uncontrolledOpen, setUncontrolledOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const open = controlledOpen ?? uncontrolledOpen;
    const onOpenChange = setControlledOpen ?? setUncontrolledOpen;
    let t1;
    let t2;
    if ($[1] !== onOpenChange) {
        t1 = ()=>{
            const handleEscape = (event)=>{
                if (event.key === "Escape") {
                    onOpenChange(false);
                }
            };
            document.addEventListener("keydown", handleEscape);
            return ()=>document.removeEventListener("keydown", handleEscape);
        };
        t2 = [
            onOpenChange
        ];
        $[1] = onOpenChange;
        $[2] = t1;
        $[3] = t2;
    } else {
        t1 = $[2];
        t2 = $[3];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t1, t2);
    let t3;
    if ($[4] !== onOpenChange || $[5] !== open) {
        t3 = {
            open,
            onOpenChange
        };
        $[4] = onOpenChange;
        $[5] = open;
        $[6] = t3;
    } else {
        t3 = $[6];
    }
    let t4;
    if ($[7] !== children || $[8] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogContext.Provider, {
            value: t3,
            children: children
        }, void 0, false, {
            fileName: "[project]/components/ui/dialog.tsx",
            lineNumber: 75,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[7] = children;
        $[8] = t3;
        $[9] = t4;
    } else {
        t4 = $[9];
    }
    return t4;
};
_s1(Dialog, "maGhP0viFqnC+/5weIHp7q69xoY=");
_c = Dialog;
// FIX: Correctly implement `asChild` prop to resolve type error and compose onClick handlers.
const DialogTrigger = (t0)=>{
    _s2();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(18);
    if ($[0] !== "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e") {
        for(let $i = 0; $i < 18; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e";
    }
    const { children, asChild: t1 } = t0;
    const asChild = t1 === undefined ? false : t1;
    const { onOpenChange } = useDialog();
    if (asChild) {
        let child;
        let t2;
        if ($[1] !== children) {
            child = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Children.only(children);
            t2 = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isValidElement(child);
            $[1] = children;
            $[2] = child;
            $[3] = t2;
        } else {
            child = $[2];
            t2 = $[3];
        }
        if (t2) {
            const element = child;
            let t3;
            if ($[4] !== element || $[5] !== onOpenChange) {
                let t4;
                if ($[7] !== element.props || $[8] !== onOpenChange) {
                    t4 = (e)=>{
                        if (element.props.onClick) {
                            element.props.onClick(e);
                        }
                        onOpenChange(true);
                    };
                    $[7] = element.props;
                    $[8] = onOpenChange;
                    $[9] = t4;
                } else {
                    t4 = $[9];
                }
                let t5;
                if ($[10] !== element.props || $[11] !== t4) {
                    t5 = {
                        ...element.props,
                        onClick: t4
                    };
                    $[10] = element.props;
                    $[11] = t4;
                    $[12] = t5;
                } else {
                    t5 = $[12];
                }
                t3 = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].cloneElement(element, t5);
                $[4] = element;
                $[5] = onOpenChange;
                $[6] = t3;
            } else {
                t3 = $[6];
            }
            return t3;
        }
    }
    let t2;
    if ($[13] !== onOpenChange) {
        t2 = ()=>onOpenChange(true);
        $[13] = onOpenChange;
        $[14] = t2;
    } else {
        t2 = $[14];
    }
    let t3;
    if ($[15] !== children || $[16] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: t2,
            children: children
        }, void 0, false, {
            fileName: "[project]/components/ui/dialog.tsx",
            lineNumber: 165,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[15] = children;
        $[16] = t2;
        $[17] = t3;
    } else {
        t3 = $[17];
    }
    return t3;
};
_s2(DialogTrigger, "6i8Y9RAa3IkT+aVaB4Z/zMmLBIY=", false, function() {
    return [
        useDialog
    ];
});
_c1 = DialogTrigger;
const DialogPortal = (t0)=>{
    _s3();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(4);
    if ($[0] !== "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e") {
        for(let $i = 0; $i < 4; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e";
    }
    const { children } = t0;
    const { open } = useDialog();
    let t1;
    if ($[1] !== children || $[2] !== open) {
        t1 = open ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: children
        }, void 0, false) : null;
        $[1] = children;
        $[2] = open;
        $[3] = t1;
    } else {
        t1 = $[3];
    }
    return t1;
};
_s3(DialogPortal, "7BHQHfcUjPZ/9Of+gk11ukE1XXU=", false, function() {
    return [
        useDialog
    ];
});
_c2 = DialogPortal;
const DialogOverlay = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef((t0, ref)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(10);
    if ($[0] !== "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e") {
        for(let $i = 0; $i < 10; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e";
    }
    let className;
    let props;
    if ($[1] !== t0) {
        ({ className, ...props } = t0);
        $[1] = t0;
        $[2] = className;
        $[3] = props;
    } else {
        className = $[2];
        props = $[3];
    }
    let t1;
    if ($[4] !== className) {
        t1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className);
        $[4] = className;
        $[5] = t1;
    } else {
        t1 = $[5];
    }
    let t2;
    if ($[6] !== props || $[7] !== ref || $[8] !== t1) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ref: ref,
            className: t1,
            ...props
        }, void 0, false, {
            fileName: "[project]/components/ui/dialog.tsx",
            lineNumber: 231,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[6] = props;
        $[7] = ref;
        $[8] = t1;
        $[9] = t2;
    } else {
        t2 = $[9];
    }
    return t2;
});
_c3 = DialogOverlay;
DialogOverlay.displayName = "DialogOverlay";
const DialogContent = /*#__PURE__*/ _s4(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c4 = _s4((t0, ref)=>{
    _s4();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(24);
    if ($[0] !== "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e") {
        for(let $i = 0; $i < 24; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e";
    }
    let children;
    let className;
    let props;
    if ($[1] !== t0) {
        ({ className, children, ...props } = t0);
        $[1] = t0;
        $[2] = children;
        $[3] = className;
        $[4] = props;
    } else {
        children = $[2];
        className = $[3];
        props = $[4];
    }
    const { open, onOpenChange } = useDialog();
    if (!open) {
        return null;
    }
    let t1;
    if ($[5] !== onOpenChange) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogOverlay, {
            onClick: ()=>onOpenChange(false)
        }, void 0, false, {
            fileName: "[project]/components/ui/dialog.tsx",
            lineNumber: 277,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[5] = onOpenChange;
        $[6] = t1;
    } else {
        t1 = $[6];
    }
    let t2;
    if ($[7] !== className) {
        t2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("fixed z-50 grid w-full max-w-lg gap-4 border bg-card p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className);
        $[7] = className;
        $[8] = t2;
    } else {
        t2 = $[8];
    }
    let t3;
    if ($[9] !== onOpenChange) {
        t3 = ()=>onOpenChange(false);
        $[9] = onOpenChange;
        $[10] = t3;
    } else {
        t3 = $[10];
    }
    let t4;
    let t5;
    if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
            name: "x",
            className: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/components/ui/dialog.tsx",
            lineNumber: 302,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "sr-only",
            children: "Close"
        }, void 0, false, {
            fileName: "[project]/components/ui/dialog.tsx",
            lineNumber: 303,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[11] = t4;
        $[12] = t5;
    } else {
        t4 = $[11];
        t5 = $[12];
    }
    let t6;
    if ($[13] !== t3) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            onClick: t3,
            className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
            children: [
                t4,
                t5
            ]
        }, void 0, true, {
            fileName: "[project]/components/ui/dialog.tsx",
            lineNumber: 312,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[13] = t3;
        $[14] = t6;
    } else {
        t6 = $[14];
    }
    let t7;
    if ($[15] !== children || $[16] !== props || $[17] !== ref || $[18] !== t2 || $[19] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ref: ref,
            className: t2,
            ...props,
            children: [
                children,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/components/ui/dialog.tsx",
            lineNumber: 320,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[15] = children;
        $[16] = props;
        $[17] = ref;
        $[18] = t2;
        $[19] = t6;
        $[20] = t7;
    } else {
        t7 = $[20];
    }
    let t8;
    if ($[21] !== t1 || $[22] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 z-50 flex items-center justify-center",
            children: [
                t1,
                t7
            ]
        }, void 0, true, {
            fileName: "[project]/components/ui/dialog.tsx",
            lineNumber: 332,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[21] = t1;
        $[22] = t7;
        $[23] = t8;
    } else {
        t8 = $[23];
    }
    return t8;
}, "kGXwbqc9OEH/aimt9kvhPLg9T/4=", false, function() {
    return [
        useDialog
    ];
})), "kGXwbqc9OEH/aimt9kvhPLg9T/4=", false, function() {
    return [
        useDialog
    ];
});
_c5 = DialogContent;
DialogContent.displayName = 'DialogContent';
const DialogHeader = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(9);
    if ($[0] !== "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e") {
        for(let $i = 0; $i < 9; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e";
    }
    let className;
    let props;
    if ($[1] !== t0) {
        ({ className, ...props } = t0);
        $[1] = t0;
        $[2] = className;
        $[3] = props;
    } else {
        className = $[2];
        props = $[3];
    }
    let t1;
    if ($[4] !== className) {
        t1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col space-y-1.5 text-center sm:text-left", className);
        $[4] = className;
        $[5] = t1;
    } else {
        t1 = $[5];
    }
    let t2;
    if ($[6] !== props || $[7] !== t1) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t1,
            ...props
        }, void 0, false, {
            fileName: "[project]/components/ui/dialog.tsx",
            lineNumber: 374,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[6] = props;
        $[7] = t1;
        $[8] = t2;
    } else {
        t2 = $[8];
    }
    return t2;
};
_c6 = DialogHeader;
DialogHeader.displayName = 'DialogHeader';
const DialogFooter = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(9);
    if ($[0] !== "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e") {
        for(let $i = 0; $i < 9; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e";
    }
    let className;
    let props;
    if ($[1] !== t0) {
        ({ className, ...props } = t0);
        $[1] = t0;
        $[2] = className;
        $[3] = props;
    } else {
        className = $[2];
        props = $[3];
    }
    let t1;
    if ($[4] !== className) {
        t1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className);
        $[4] = className;
        $[5] = t1;
    } else {
        t1 = $[5];
    }
    let t2;
    if ($[6] !== props || $[7] !== t1) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t1,
            ...props
        }, void 0, false, {
            fileName: "[project]/components/ui/dialog.tsx",
            lineNumber: 416,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[6] = props;
        $[7] = t1;
        $[8] = t2;
    } else {
        t2 = $[8];
    }
    return t2;
};
_c7 = DialogFooter;
DialogFooter.displayName = 'DialogFooter';
const DialogTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c8 = (t0, ref)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(10);
    if ($[0] !== "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e") {
        for(let $i = 0; $i < 10; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e";
    }
    let className;
    let props;
    if ($[1] !== t0) {
        ({ className, ...props } = t0);
        $[1] = t0;
        $[2] = className;
        $[3] = props;
    } else {
        className = $[2];
        props = $[3];
    }
    let t1;
    if ($[4] !== className) {
        t1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-lg font-semibold leading-none tracking-tight", className);
        $[4] = className;
        $[5] = t1;
    } else {
        t1 = $[5];
    }
    let t2;
    if ($[6] !== props || $[7] !== ref || $[8] !== t1) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            ref: ref,
            className: t1,
            ...props
        }, void 0, false, {
            fileName: "[project]/components/ui/dialog.tsx",
            lineNumber: 458,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[6] = props;
        $[7] = ref;
        $[8] = t1;
        $[9] = t2;
    } else {
        t2 = $[9];
    }
    return t2;
});
_c9 = DialogTitle;
DialogTitle.displayName = 'DialogTitle';
const DialogDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c10 = (t0, ref)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(10);
    if ($[0] !== "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e") {
        for(let $i = 0; $i < 10; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7f1a4528da71c57b07bb9f3383c444eabd1ef74b6026b96e19504d0fc8bc498e";
    }
    let className;
    let props;
    if ($[1] !== t0) {
        ({ className, ...props } = t0);
        $[1] = t0;
        $[2] = className;
        $[3] = props;
    } else {
        className = $[2];
        props = $[3];
    }
    let t1;
    if ($[4] !== className) {
        t1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-sm text-muted-foreground", className);
        $[4] = className;
        $[5] = t1;
    } else {
        t1 = $[5];
    }
    let t2;
    if ($[6] !== props || $[7] !== ref || $[8] !== t1) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            ref: ref,
            className: t1,
            ...props
        }, void 0, false, {
            fileName: "[project]/components/ui/dialog.tsx",
            lineNumber: 501,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[6] = props;
        $[7] = ref;
        $[8] = t1;
        $[9] = t2;
    } else {
        t2 = $[9];
    }
    return t2;
});
_c11 = DialogDescription;
DialogDescription.displayName = 'DialogDescription';
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11;
__turbopack_context__.k.register(_c, "Dialog");
__turbopack_context__.k.register(_c1, "DialogTrigger");
__turbopack_context__.k.register(_c2, "DialogPortal");
__turbopack_context__.k.register(_c3, "DialogOverlay");
__turbopack_context__.k.register(_c4, "DialogContent$React.forwardRef");
__turbopack_context__.k.register(_c5, "DialogContent");
__turbopack_context__.k.register(_c6, "DialogHeader");
__turbopack_context__.k.register(_c7, "DialogFooter");
__turbopack_context__.k.register(_c8, "DialogTitle$React.forwardRef");
__turbopack_context__.k.register(_c9, "DialogTitle");
__turbopack_context__.k.register(_c10, "DialogDescription$React.forwardRef");
__turbopack_context__.k.register(_c11, "DialogDescription");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/accordion.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Accordion",
    ()=>Accordion,
    "AccordionContent",
    ()=>AccordionContent,
    "AccordionItem",
    ()=>AccordionItem,
    "AccordionTrigger",
    ()=>AccordionTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Icon.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature();
;
;
;
;
const AccordionContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const useAccordion = ()=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(1);
    if ($[0] !== "196b0a32f2a1dbb29c29b7fd438cbcd7097b043928a5c2e7d81a83c87d5d280c") {
        for(let $i = 0; $i < 1; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "196b0a32f2a1dbb29c29b7fd438cbcd7097b043928a5c2e7d81a83c87d5d280c";
    }
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AccordionContext);
    if (!context) {
        throw new Error("Accordion components must be used within an Accordion root component");
    }
    return context;
};
_s(useAccordion, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
// --- Context for AccordionItem Value ---
const AccordionItemContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const useAccordionItem = ()=>{
    _s1();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(1);
    if ($[0] !== "196b0a32f2a1dbb29c29b7fd438cbcd7097b043928a5c2e7d81a83c87d5d280c") {
        for(let $i = 0; $i < 1; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "196b0a32f2a1dbb29c29b7fd438cbcd7097b043928a5c2e7d81a83c87d5d280c";
    }
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AccordionItemContext);
    if (!context) {
        throw new Error("AccordionTrigger/Content must be used within an AccordionItem");
    }
    return context;
};
_s1(useAccordionItem, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
// --- Accordion Root Component ---
const Accordion = /*#__PURE__*/ _s2(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c = _s2((t0, ref)=>{
    _s2();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(31);
    if ($[0] !== "196b0a32f2a1dbb29c29b7fd438cbcd7097b043928a5c2e7d81a83c87d5d280c") {
        for(let $i = 0; $i < 31; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "196b0a32f2a1dbb29c29b7fd438cbcd7097b043928a5c2e7d81a83c87d5d280c";
    }
    let children;
    let className;
    let defaultValue;
    let onValueChange;
    let props;
    let t1;
    let t2;
    if ($[1] !== t0) {
        ({ children, type: t1, defaultValue, onValueChange, collapsible: t2, className, ...props } = t0);
        $[1] = t0;
        $[2] = children;
        $[3] = className;
        $[4] = defaultValue;
        $[5] = onValueChange;
        $[6] = props;
        $[7] = t1;
        $[8] = t2;
    } else {
        children = $[2];
        className = $[3];
        defaultValue = $[4];
        onValueChange = $[5];
        props = $[6];
        t1 = $[7];
        t2 = $[8];
    }
    const type = t1 === undefined ? "single" : t1;
    const collapsible = t2 === undefined ? false : t2;
    let t3;
    if ($[9] !== defaultValue || $[10] !== type) {
        t3 = defaultValue || (type === "multiple" ? [] : "");
        $[9] = defaultValue;
        $[10] = type;
        $[11] = t3;
    } else {
        t3 = $[11];
    }
    const [value, setValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t3);
    let t4;
    if ($[12] !== collapsible || $[13] !== onValueChange || $[14] !== type || $[15] !== value) {
        t4 = (itemValue)=>{
            let newValue;
            if (type === "single") {
                newValue = value === itemValue && collapsible ? "" : itemValue;
            } else {
                const newValues = Array.isArray(value) ? [
                    ...value
                ] : [];
                const index = newValues.indexOf(itemValue);
                if (index > -1) {
                    newValues.splice(index, 1);
                } else {
                    newValues.push(itemValue);
                }
                newValue = newValues;
            }
            setValue(newValue);
            onValueChange?.(newValue);
        };
        $[12] = collapsible;
        $[13] = onValueChange;
        $[14] = type;
        $[15] = value;
        $[16] = t4;
    } else {
        t4 = $[16];
    }
    const handleValueChange = t4;
    let t5;
    if ($[17] !== handleValueChange || $[18] !== type || $[19] !== value) {
        t5 = {
            value,
            onValueChange: handleValueChange,
            type
        };
        $[17] = handleValueChange;
        $[18] = type;
        $[19] = value;
        $[20] = t5;
    } else {
        t5 = $[20];
    }
    const contextValue = t5;
    let t6;
    if ($[21] !== className) {
        t6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full", className);
        $[21] = className;
        $[22] = t6;
    } else {
        t6 = $[22];
    }
    let t7;
    if ($[23] !== children || $[24] !== props || $[25] !== ref || $[26] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ref: ref,
            className: t6,
            ...props,
            children: children
        }, void 0, false, {
            fileName: "[project]/components/ui/accordion.tsx",
            lineNumber: 160,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[23] = children;
        $[24] = props;
        $[25] = ref;
        $[26] = t6;
        $[27] = t7;
    } else {
        t7 = $[27];
    }
    let t8;
    if ($[28] !== contextValue || $[29] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AccordionContext.Provider, {
            value: contextValue,
            children: t7
        }, void 0, false, {
            fileName: "[project]/components/ui/accordion.tsx",
            lineNumber: 171,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[28] = contextValue;
        $[29] = t7;
        $[30] = t8;
    } else {
        t8 = $[30];
    }
    return t8;
}, "IlPwv2eVgSeSgH9uxAdNlvYa6NQ=")), "IlPwv2eVgSeSgH9uxAdNlvYa6NQ=");
_c1 = Accordion;
Accordion.displayName = 'Accordion';
// --- AccordionItem Component ---
const AccordionItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c2 = (t0, ref)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(16);
    if ($[0] !== "196b0a32f2a1dbb29c29b7fd438cbcd7097b043928a5c2e7d81a83c87d5d280c") {
        for(let $i = 0; $i < 16; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "196b0a32f2a1dbb29c29b7fd438cbcd7097b043928a5c2e7d81a83c87d5d280c";
    }
    let className;
    let props;
    let value;
    if ($[1] !== t0) {
        ({ className, value, ...props } = t0);
        $[1] = t0;
        $[2] = className;
        $[3] = props;
        $[4] = value;
    } else {
        className = $[2];
        props = $[3];
        value = $[4];
    }
    let t1;
    if ($[5] !== value) {
        t1 = {
            value
        };
        $[5] = value;
        $[6] = t1;
    } else {
        t1 = $[6];
    }
    let t2;
    if ($[7] !== className) {
        t2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("border-b", className);
        $[7] = className;
        $[8] = t2;
    } else {
        t2 = $[8];
    }
    let t3;
    if ($[9] !== props || $[10] !== ref || $[11] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ref: ref,
            className: t2,
            ...props
        }, void 0, false, {
            fileName: "[project]/components/ui/accordion.tsx",
            lineNumber: 231,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[9] = props;
        $[10] = ref;
        $[11] = t2;
        $[12] = t3;
    } else {
        t3 = $[12];
    }
    let t4;
    if ($[13] !== t1 || $[14] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AccordionItemContext.Provider, {
            value: t1,
            children: t3
        }, void 0, false, {
            fileName: "[project]/components/ui/accordion.tsx",
            lineNumber: 241,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[13] = t1;
        $[14] = t3;
        $[15] = t4;
    } else {
        t4 = $[15];
    }
    return t4;
});
_c3 = AccordionItem;
AccordionItem.displayName = 'AccordionItem';
// --- AccordionTrigger Component ---
const AccordionTrigger = /*#__PURE__*/ _s3(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c4 = _s3((t0, ref)=>{
    _s3();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(23);
    if ($[0] !== "196b0a32f2a1dbb29c29b7fd438cbcd7097b043928a5c2e7d81a83c87d5d280c") {
        for(let $i = 0; $i < 23; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "196b0a32f2a1dbb29c29b7fd438cbcd7097b043928a5c2e7d81a83c87d5d280c";
    }
    let children;
    let className;
    let props;
    if ($[1] !== t0) {
        ({ className, children, ...props } = t0);
        $[1] = t0;
        $[2] = children;
        $[3] = className;
        $[4] = props;
    } else {
        children = $[2];
        className = $[3];
        props = $[4];
    }
    const { value, type, onValueChange } = useAccordion();
    const { value: itemValue } = useAccordionItem();
    let t1;
    if ($[5] !== itemValue || $[6] !== type || $[7] !== value) {
        t1 = type === "multiple" && Array.isArray(value) ? value.includes(itemValue) : value === itemValue;
        $[5] = itemValue;
        $[6] = type;
        $[7] = value;
        $[8] = t1;
    } else {
        t1 = $[8];
    }
    const isOpen = t1;
    const t2 = isOpen ? "open" : "closed";
    let t3;
    if ($[9] !== itemValue || $[10] !== onValueChange) {
        t3 = ()=>onValueChange(itemValue);
        $[9] = itemValue;
        $[10] = onValueChange;
        $[11] = t3;
    } else {
        t3 = $[11];
    }
    let t4;
    if ($[12] !== className) {
        t4 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180", className);
        $[12] = className;
        $[13] = t4;
    } else {
        t4 = $[13];
    }
    let t5;
    if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
            name: "chevronDown",
            className: "h-4 w-4 shrink-0 transition-transform duration-200"
        }, void 0, false, {
            fileName: "[project]/components/ui/accordion.tsx",
            lineNumber: 318,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[14] = t5;
    } else {
        t5 = $[14];
    }
    let t6;
    if ($[15] !== children || $[16] !== isOpen || $[17] !== props || $[18] !== ref || $[19] !== t2 || $[20] !== t3 || $[21] !== t4) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
            className: "flex m-0",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                ref: ref,
                type: "button",
                "aria-expanded": isOpen,
                "data-state": t2,
                onClick: t3,
                className: t4,
                ...props,
                children: [
                    children,
                    t5
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/accordion.tsx",
                lineNumber: 325,
                columnNumber: 35
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/ui/accordion.tsx",
            lineNumber: 325,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[15] = children;
        $[16] = isOpen;
        $[17] = props;
        $[18] = ref;
        $[19] = t2;
        $[20] = t3;
        $[21] = t4;
        $[22] = t6;
    } else {
        t6 = $[22];
    }
    return t6;
}, "a6BiHWYl68UaCZNMAJbW/prCVO4=", false, function() {
    return [
        useAccordion,
        useAccordionItem
    ];
})), "a6BiHWYl68UaCZNMAJbW/prCVO4=", false, function() {
    return [
        useAccordion,
        useAccordionItem
    ];
});
_c5 = AccordionTrigger;
AccordionTrigger.displayName = 'AccordionTrigger';
// --- AccordionContent Component ---
const AccordionContent = /*#__PURE__*/ _s4(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c6 = _s4((t0, ref)=>{
    _s4();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(15);
    if ($[0] !== "196b0a32f2a1dbb29c29b7fd438cbcd7097b043928a5c2e7d81a83c87d5d280c") {
        for(let $i = 0; $i < 15; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "196b0a32f2a1dbb29c29b7fd438cbcd7097b043928a5c2e7d81a83c87d5d280c";
    }
    let children;
    let className;
    let props;
    if ($[1] !== t0) {
        ({ className, children, ...props } = t0);
        $[1] = t0;
        $[2] = children;
        $[3] = className;
        $[4] = props;
    } else {
        children = $[2];
        className = $[3];
        props = $[4];
    }
    const { value, type } = useAccordion();
    const { value: itemValue } = useAccordionItem();
    const isOpen = type === "multiple" && Array.isArray(value) ? value.includes(itemValue) : value === itemValue;
    if (!isOpen) {
        return null;
    }
    const t1 = isOpen ? "open" : "closed";
    let t2;
    if ($[5] !== className) {
        t2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("pb-4 pt-0", className);
        $[5] = className;
        $[6] = t2;
    } else {
        t2 = $[6];
    }
    let t3;
    if ($[7] !== children || $[8] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t2,
            children: children
        }, void 0, false, {
            fileName: "[project]/components/ui/accordion.tsx",
            lineNumber: 390,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[7] = children;
        $[8] = t2;
        $[9] = t3;
    } else {
        t3 = $[9];
    }
    let t4;
    if ($[10] !== props || $[11] !== ref || $[12] !== t1 || $[13] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ref: ref,
            "data-state": t1,
            className: "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
            ...props,
            children: t3
        }, void 0, false, {
            fileName: "[project]/components/ui/accordion.tsx",
            lineNumber: 399,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[10] = props;
        $[11] = ref;
        $[12] = t1;
        $[13] = t3;
        $[14] = t4;
    } else {
        t4 = $[14];
    }
    return t4;
}, "+RJSDY8qwHSdfzNWwLKjM19SCug=", false, function() {
    return [
        useAccordion,
        useAccordionItem
    ];
})), "+RJSDY8qwHSdfzNWwLKjM19SCug=", false, function() {
    return [
        useAccordion,
        useAccordionItem
    ];
});
_c7 = AccordionContent;
AccordionContent.displayName = 'AccordionContent';
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7;
__turbopack_context__.k.register(_c, "Accordion$React.forwardRef");
__turbopack_context__.k.register(_c1, "Accordion");
__turbopack_context__.k.register(_c2, "AccordionItem$React.forwardRef");
__turbopack_context__.k.register(_c3, "AccordionItem");
__turbopack_context__.k.register(_c4, "AccordionTrigger$React.forwardRef");
__turbopack_context__.k.register(_c5, "AccordionTrigger");
__turbopack_context__.k.register(_c6, "AccordionContent$React.forwardRef");
__turbopack_context__.k.register(_c7, "AccordionContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/switch.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Switch",
    ()=>Switch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Switch = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c = ({ className, checked, onCheckedChange, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        role: "switch",
        "aria-checked": checked,
        onClick: ()=>onCheckedChange(!checked),
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50', checked ? 'bg-primary' : 'bg-border', className),
        ref: ref,
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            "aria-hidden": "true",
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform', checked ? 'translate-x-4' : 'translate-x-0')
        }, void 0, false, {
            fileName: "[project]/components/ui/switch.tsx",
            lineNumber: 25,
            columnNumber: 9
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/ui/switch.tsx",
        lineNumber: 12,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Switch;
Switch.displayName = 'Switch';
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Switch$React.forwardRef");
__turbopack_context__.k.register(_c1, "Switch");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/organisms/CookieSettingsModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CookieSettingsModal",
    ()=>CookieSettingsModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$accordion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/accordion.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/switch.tsx [app-client] (ecmascript)");
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
const CookieSettingsModal = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(38);
    if ($[0] !== "7dec7c474919ea4c2a72f2c3056d988a5b3cae7300282896368ebd4d008f1c7a") {
        for(let $i = 0; $i < 38; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7dec7c474919ea4c2a72f2c3056d988a5b3cae7300282896368ebd4d008f1c7a";
    }
    const { isOpen, onOpenChange } = t0;
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = {};
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    const [preferences, setPreferences] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t1);
    let t2;
    let t3;
    if ($[2] !== isOpen) {
        t2 = ()=>{
            if (isOpen) {
                ;
                try {
                    const storedPrefs = localStorage.getItem("cookiePreferences");
                    if (storedPrefs) {
                        setPreferences(JSON.parse(storedPrefs));
                    } else {
                        const defaultPrefs = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cookieSettings"].reduce(_temp, {});
                        setPreferences(defaultPrefs);
                    }
                } catch (t4) {
                    const error = t4;
                    console.error("Could not read from localStorage:", error);
                }
            }
        };
        t3 = [
            isOpen
        ];
        $[2] = isOpen;
        $[3] = t2;
        $[4] = t3;
    } else {
        t2 = $[3];
        t3 = $[4];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t2, t3);
    let t4;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = (id)=>{
            setPreferences((prev)=>({
                    ...prev,
                    [id]: !prev[id]
                }));
        };
        $[5] = t4;
    } else {
        t4 = $[5];
    }
    const handleToggle = t4;
    let t5;
    if ($[6] !== onOpenChange || $[7] !== preferences) {
        t5 = ()=>{
            ;
            try {
                localStorage.setItem("cookieConsent", "true");
                localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
            } catch (t6) {
                const error_0 = t6;
                console.error("Could not write to localStorage:", error_0);
            }
            onOpenChange(false);
            const banner = document.querySelector(".cookie-consent-banner");
            if (banner) {
                banner.style.display = "none";
            }
        };
        $[6] = onOpenChange;
        $[7] = preferences;
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    const handleSave = t5;
    let t6;
    if ($[9] !== t) {
        t6 = t("cookie_settings_title");
        $[9] = t;
        $[10] = t6;
    } else {
        t6 = $[10];
    }
    let t7;
    if ($[11] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
            children: t6
        }, void 0, false, {
            fileName: "[project]/components/organisms/CookieSettingsModal.tsx",
            lineNumber: 114,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[11] = t6;
        $[12] = t7;
    } else {
        t7 = $[12];
    }
    let t8;
    if ($[13] !== t) {
        t8 = t("cookie_settings_description");
        $[13] = t;
        $[14] = t8;
    } else {
        t8 = $[14];
    }
    let t9;
    if ($[15] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
            children: t8
        }, void 0, false, {
            fileName: "[project]/components/organisms/CookieSettingsModal.tsx",
            lineNumber: 130,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[15] = t8;
        $[16] = t9;
    } else {
        t9 = $[16];
    }
    let t10;
    if ($[17] !== t7 || $[18] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
            children: [
                t7,
                t9
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/CookieSettingsModal.tsx",
            lineNumber: 138,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[17] = t7;
        $[18] = t9;
        $[19] = t10;
    } else {
        t10 = $[19];
    }
    let t11;
    if ($[20] !== preferences || $[21] !== t) {
        t11 = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cookieSettings"].map((setting_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$accordion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AccordionItem"], {
                value: setting_0.id,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$accordion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AccordionTrigger"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between w-full pr-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-semibold",
                                    children: t(setting_0.titleKey)
                                }, void 0, false, {
                                    fileName: "[project]/components/organisms/CookieSettingsModal.tsx",
                                    lineNumber: 147,
                                    columnNumber: 179
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    onClick: _temp2,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Switch"], {
                                        checked: preferences[setting_0.id] || false,
                                        onCheckedChange: ()=>handleToggle(setting_0.id),
                                        disabled: !setting_0.isMutable,
                                        "aria-label": t(setting_0.titleKey)
                                    }, void 0, false, {
                                        fileName: "[project]/components/organisms/CookieSettingsModal.tsx",
                                        lineNumber: 147,
                                        columnNumber: 270
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/components/organisms/CookieSettingsModal.tsx",
                                    lineNumber: 147,
                                    columnNumber: 248
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/organisms/CookieSettingsModal.tsx",
                            lineNumber: 147,
                            columnNumber: 116
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/organisms/CookieSettingsModal.tsx",
                        lineNumber: 147,
                        columnNumber: 98
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$accordion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AccordionContent"], {
                        children: t(setting_0.descriptionKey)
                    }, void 0, false, {
                        fileName: "[project]/components/organisms/CookieSettingsModal.tsx",
                        lineNumber: 147,
                        columnNumber: 481
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, setting_0.id, true, {
                fileName: "[project]/components/organisms/CookieSettingsModal.tsx",
                lineNumber: 147,
                columnNumber: 43
            }, ("TURBOPACK compile-time value", void 0)));
        $[20] = preferences;
        $[21] = t;
        $[22] = t11;
    } else {
        t11 = $[22];
    }
    let t12;
    if ($[23] !== t11) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$accordion$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Accordion"], {
            type: "multiple",
            className: "w-full",
            children: t11
        }, void 0, false, {
            fileName: "[project]/components/organisms/CookieSettingsModal.tsx",
            lineNumber: 156,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[23] = t11;
        $[24] = t12;
    } else {
        t12 = $[24];
    }
    let t13;
    if ($[25] !== t) {
        t13 = t("cookie_settings_save");
        $[25] = t;
        $[26] = t13;
    } else {
        t13 = $[26];
    }
    let t14;
    if ($[27] !== handleSave || $[28] !== t13) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogFooter"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                onClick: handleSave,
                className: "w-full",
                children: t13
            }, void 0, false, {
                fileName: "[project]/components/organisms/CookieSettingsModal.tsx",
                lineNumber: 172,
                columnNumber: 25
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/organisms/CookieSettingsModal.tsx",
            lineNumber: 172,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[27] = handleSave;
        $[28] = t13;
        $[29] = t14;
    } else {
        t14 = $[29];
    }
    let t15;
    if ($[30] !== t10 || $[31] !== t12 || $[32] !== t14) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
            className: "sm:max-w-[425px]",
            children: [
                t10,
                t12,
                t14
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/CookieSettingsModal.tsx",
            lineNumber: 181,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[30] = t10;
        $[31] = t12;
        $[32] = t14;
        $[33] = t15;
    } else {
        t15 = $[33];
    }
    let t16;
    if ($[34] !== isOpen || $[35] !== onOpenChange || $[36] !== t15) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
            open: isOpen,
            onOpenChange: onOpenChange,
            children: t15
        }, void 0, false, {
            fileName: "[project]/components/organisms/CookieSettingsModal.tsx",
            lineNumber: 191,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[34] = isOpen;
        $[35] = onOpenChange;
        $[36] = t15;
        $[37] = t16;
    } else {
        t16 = $[37];
    }
    return t16;
};
_s(CookieSettingsModal, "pEDHIc+vqCLqjRDaJho7W6dqLQo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c = CookieSettingsModal;
function _temp(acc, setting) {
    acc[setting.id] = !setting.isMutable;
    return acc;
}
function _temp2(e) {
    return e.stopPropagation();
}
var _c;
__turbopack_context__.k.register(_c, "CookieSettingsModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/organisms/Chatbot.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Chatbot",
    ()=>Chatbot,
    "ChatbotUI",
    ()=>ChatbotUI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Icon.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const ChatbotUI = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(18);
    if ($[0] !== "7f6f7ac97f5065067829ff352fe15cd7a808eadccbf43db299b5917bd3415c9e") {
        for(let $i = 0; $i < 18; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7f6f7ac97f5065067829ff352fe15cd7a808eadccbf43db299b5917bd3415c9e";
    }
    const { title, placeholder, sendLabel, greeting } = t0;
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    let t1;
    if ($[1] !== isOpen) {
        t1 = ()=>setIsOpen(!isOpen);
        $[1] = isOpen;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    let t2;
    if ($[3] !== isOpen) {
        t2 = isOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
            name: "x",
            className: "w-8 h-8"
        }, void 0, false, {
            fileName: "[project]/components/organisms/Chatbot.tsx",
            lineNumber: 40,
            columnNumber: 19
        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
            name: "chat",
            className: "w-8 h-8"
        }, void 0, false, {
            fileName: "[project]/components/organisms/Chatbot.tsx",
            lineNumber: 40,
            columnNumber: 59
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = isOpen;
        $[4] = t2;
    } else {
        t2 = $[4];
    }
    let t3;
    if ($[5] !== t1 || $[6] !== t2 || $[7] !== title) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed bottom-6 right-6 z-50",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                size: "icon",
                onClick: t1,
                className: "w-16 h-16 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-200",
                "aria-label": title,
                children: t2
            }, void 0, false, {
                fileName: "[project]/components/organisms/Chatbot.tsx",
                lineNumber: 48,
                columnNumber: 55
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/organisms/Chatbot.tsx",
            lineNumber: 48,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[5] = t1;
        $[6] = t2;
        $[7] = title;
        $[8] = t3;
    } else {
        t3 = $[8];
    }
    let t4;
    if ($[9] !== greeting || $[10] !== isOpen || $[11] !== placeholder || $[12] !== sendLabel || $[13] !== title) {
        t4 = isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm bg-card rounded-lg shadow-2xl border origin-bottom-right animate-fade-in-up",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                    children: "\n                        @keyframes fade-in-up {\n                            from { opacity: 0; transform: scale(0.9) translateY(10px); }\n                            to { opacity: 1; transform: scale(1) translateY(0); }\n                        }\n                        .animate-fade-in-up { animation: fade-in-up 0.2s ease-out; }\n                    "
                }, void 0, false, {
                    fileName: "[project]/components/organisms/Chatbot.tsx",
                    lineNumber: 58,
                    columnNumber: 172
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-center p-4 bg-muted/50 border-b",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "font-bold text-lg",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/components/organisms/Chatbot.tsx",
                            lineNumber: 58,
                            columnNumber: 624
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "ghost",
                            size: "icon",
                            onClick: ()=>setIsOpen(false),
                            "aria-label": "Close chat",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                name: "x",
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "[project]/components/organisms/Chatbot.tsx",
                                lineNumber: 58,
                                columnNumber: 763
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/components/organisms/Chatbot.tsx",
                            lineNumber: 58,
                            columnNumber: 670
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/organisms/Chatbot.tsx",
                    lineNumber: 58,
                    columnNumber: 548
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 h-80 overflow-y-auto",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-start mb-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-muted rounded-lg p-3 max-w-xs",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm",
                                children: greeting
                            }, void 0, false, {
                                fileName: "[project]/components/organisms/Chatbot.tsx",
                                lineNumber: 58,
                                columnNumber: 948
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/components/organisms/Chatbot.tsx",
                            lineNumber: 58,
                            columnNumber: 898
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/organisms/Chatbot.tsx",
                        lineNumber: 58,
                        columnNumber: 857
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/components/organisms/Chatbot.tsx",
                    lineNumber: 58,
                    columnNumber: 815
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 border-t",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                type: "text",
                                placeholder: placeholder,
                                className: "rounded-full ltr:pr-12 rtl:pl-12"
                            }, void 0, false, {
                                fileName: "[project]/components/organisms/Chatbot.tsx",
                                lineNumber: 58,
                                columnNumber: 1060
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                size: "icon",
                                type: "submit",
                                className: "absolute top-1/2 -translate-y-1/2 ltr:right-1 rtl:left-1 h-8 w-8 rounded-full",
                                "aria-label": sendLabel,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                    name: "send",
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/organisms/Chatbot.tsx",
                                    lineNumber: 58,
                                    columnNumber: 1299
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/organisms/Chatbot.tsx",
                                lineNumber: 58,
                                columnNumber: 1152
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/organisms/Chatbot.tsx",
                        lineNumber: 58,
                        columnNumber: 1033
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/components/organisms/Chatbot.tsx",
                    lineNumber: 58,
                    columnNumber: 1003
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/organisms/Chatbot.tsx",
            lineNumber: 58,
            columnNumber: 20
        }, ("TURBOPACK compile-time value", void 0));
        $[9] = greeting;
        $[10] = isOpen;
        $[11] = placeholder;
        $[12] = sendLabel;
        $[13] = title;
        $[14] = t4;
    } else {
        t4 = $[14];
    }
    let t5;
    if ($[15] !== t3 || $[16] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                t3,
                t4
            ]
        }, void 0, true);
        $[15] = t3;
        $[16] = t4;
        $[17] = t5;
    } else {
        t5 = $[17];
    }
    return t5;
};
_s(ChatbotUI, "+sus0Lb0ewKHdwiUhiTAJFoFyQ0=");
_c = ChatbotUI;
const Chatbot = ()=>{
    _s1();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(14);
    if ($[0] !== "7f6f7ac97f5065067829ff352fe15cd7a808eadccbf43db299b5917bd3415c9e") {
        for(let $i = 0; $i < 14; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "7f6f7ac97f5065067829ff352fe15cd7a808eadccbf43db299b5917bd3415c9e";
    }
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    let t0;
    if ($[1] !== t) {
        t0 = t("chatbot_title");
        $[1] = t;
        $[2] = t0;
    } else {
        t0 = $[2];
    }
    let t1;
    if ($[3] !== t) {
        t1 = t("chatbot_placeholder");
        $[3] = t;
        $[4] = t1;
    } else {
        t1 = $[4];
    }
    let t2;
    if ($[5] !== t) {
        t2 = t("chatbot_send");
        $[5] = t;
        $[6] = t2;
    } else {
        t2 = $[6];
    }
    let t3;
    if ($[7] !== t) {
        t3 = t("chatbot_greeting");
        $[7] = t;
        $[8] = t3;
    } else {
        t3 = $[8];
    }
    let t4;
    if ($[9] !== t0 || $[10] !== t1 || $[11] !== t2 || $[12] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatbotUI, {
            title: t0,
            placeholder: t1,
            sendLabel: t2,
            greeting: t3
        }, void 0, false, {
            fileName: "[project]/components/organisms/Chatbot.tsx",
            lineNumber: 124,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[9] = t0;
        $[10] = t1;
        $[11] = t2;
        $[12] = t3;
        $[13] = t4;
    } else {
        t4 = $[13];
    }
    return t4;
};
_s1(Chatbot, "vu2xTFBfHkv41zWfADiErp1aWcA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c1 = Chatbot;
var _c, _c1;
__turbopack_context__.k.register(_c, "ChatbotUI");
__turbopack_context__.k.register(_c1, "Chatbot");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(shop)/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ShopLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$Header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/organisms/Header.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$Footer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/organisms/Footer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$AnnouncementBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/organisms/AnnouncementBar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$CookieConsentBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/organisms/CookieConsentBanner.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$CookieSettingsModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/organisms/CookieSettingsModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$Chatbot$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/organisms/Chatbot.tsx [app-client] (ecmascript)");
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
function ShopLayout(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(14);
    if ($[0] !== "676331843927dd99a7c47c0d90c93aab2a4069b4c5e5bcc6f8f3e73aeeb37df5") {
        for(let $i = 0; $i < 14; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "676331843927dd99a7c47c0d90c93aab2a4069b4c5e5bcc6f8f3e73aeeb37df5";
    }
    const { children } = t0;
    const [isCookieSettingsOpen, setIsCookieSettingsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = ({
            "ShopLayout[handleOpenCookieSettings]": ()=>{
                setIsCookieSettingsOpen(true);
            }
        })["ShopLayout[handleOpenCookieSettings]"];
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    const handleOpenCookieSettings = t1;
    let t2;
    let t3;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$AnnouncementBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnnouncementBar"], {}, void 0, false, {
            fileName: "[project]/app/(shop)/layout.tsx",
            lineNumber: 38,
            columnNumber: 10
        }, this);
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$Header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Header"], {}, void 0, false, {
            fileName: "[project]/app/(shop)/layout.tsx",
            lineNumber: 39,
            columnNumber: 10
        }, this);
        $[2] = t2;
        $[3] = t3;
    } else {
        t2 = $[2];
        t3 = $[3];
    }
    let t4;
    if ($[4] !== children) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "flex-grow",
            children: children
        }, void 0, false, {
            fileName: "[project]/app/(shop)/layout.tsx",
            lineNumber: 48,
            columnNumber: 10
        }, this);
        $[4] = children;
        $[5] = t4;
    } else {
        t4 = $[5];
    }
    let t5;
    let t6;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$Footer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Footer"], {
            onSettingsClick: handleOpenCookieSettings
        }, void 0, false, {
            fileName: "[project]/app/(shop)/layout.tsx",
            lineNumber: 57,
            columnNumber: 10
        }, this);
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$CookieConsentBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CookieConsentBanner"], {
            onSettingsClick: handleOpenCookieSettings
        }, void 0, false, {
            fileName: "[project]/app/(shop)/layout.tsx",
            lineNumber: 58,
            columnNumber: 10
        }, this);
        $[6] = t5;
        $[7] = t6;
    } else {
        t5 = $[6];
        t6 = $[7];
    }
    let t7;
    if ($[8] !== isCookieSettingsOpen) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$CookieSettingsModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CookieSettingsModal"], {
            isOpen: isCookieSettingsOpen,
            onOpenChange: setIsCookieSettingsOpen
        }, void 0, false, {
            fileName: "[project]/app/(shop)/layout.tsx",
            lineNumber: 67,
            columnNumber: 10
        }, this);
        $[8] = isCookieSettingsOpen;
        $[9] = t7;
    } else {
        t7 = $[9];
    }
    let t8;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$organisms$2f$Chatbot$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Chatbot"], {}, void 0, false, {
            fileName: "[project]/app/(shop)/layout.tsx",
            lineNumber: 75,
            columnNumber: 10
        }, this);
        $[10] = t8;
    } else {
        t8 = $[10];
    }
    let t9;
    if ($[11] !== t4 || $[12] !== t7) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                t2,
                t3,
                t4,
                t5,
                t6,
                t7,
                t8
            ]
        }, void 0, true);
        $[11] = t4;
        $[12] = t7;
        $[13] = t9;
    } else {
        t9 = $[13];
    }
    return t9;
}
_s(ShopLayout, "55OC175mgumUDPw9Q7GLoz6VnKE=");
_c = ShopLayout;
var _c;
__turbopack_context__.k.register(_c, "ShopLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_17d0e257._.js.map