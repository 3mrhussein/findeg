(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
"[project]/components/molecules/ImageGallery.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ImageGallery",
    ()=>ImageGallery
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const ImageGallery = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(13);
    if ($[0] !== "5d51899fc2cb090064efbe2d34fecd9d2f631ac8b57273317fea0f8c4ed155db") {
        for(let $i = 0; $i < 13; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "5d51899fc2cb090064efbe2d34fecd9d2f631ac8b57273317fea0f8c4ed155db";
    }
    const { images } = t0;
    const [mainImage, setMainImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(images[0]);
    let t1;
    if ($[1] !== mainImage) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "aspect-square w-full bg-card border border-border rounded-lg overflow-hidden",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: mainImage,
                alt: "Main product",
                className: "w-full h-full object-cover"
            }, void 0, false, {
                fileName: "[project]/components/molecules/ImageGallery.tsx",
                lineNumber: 22,
                columnNumber: 104
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/molecules/ImageGallery.tsx",
            lineNumber: 22,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = mainImage;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    let t2;
    if ($[3] !== images || $[4] !== mainImage) {
        let t3;
        if ($[6] !== mainImage) {
            t3 = (img, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `aspect-square w-full bg-card border rounded-md overflow-hidden cursor-pointer transition-all ${mainImage === img ? "border-primary ring-2 ring-primary" : "border-border"}`,
                    onClick: ()=>setMainImage(img),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: img,
                        alt: `Product thumbnail ${index + 1}`,
                        className: "w-full h-full object-cover"
                    }, void 0, false, {
                        fileName: "[project]/components/molecules/ImageGallery.tsx",
                        lineNumber: 32,
                        columnNumber: 264
                    }, ("TURBOPACK compile-time value", void 0))
                }, index, false, {
                    fileName: "[project]/components/molecules/ImageGallery.tsx",
                    lineNumber: 32,
                    columnNumber: 28
                }, ("TURBOPACK compile-time value", void 0));
            $[6] = mainImage;
            $[7] = t3;
        } else {
            t3 = $[7];
        }
        t2 = images.map(t3);
        $[3] = images;
        $[4] = mainImage;
        $[5] = t2;
    } else {
        t2 = $[5];
    }
    let t3;
    if ($[8] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-5 gap-4",
            children: t2
        }, void 0, false, {
            fileName: "[project]/components/molecules/ImageGallery.tsx",
            lineNumber: 47,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[8] = t2;
        $[9] = t3;
    } else {
        t3 = $[9];
    }
    let t4;
    if ($[10] !== t1 || $[11] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col gap-4",
            children: [
                t1,
                t3
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/ImageGallery.tsx",
            lineNumber: 55,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[10] = t1;
        $[11] = t3;
        $[12] = t4;
    } else {
        t4 = $[12];
    }
    return t4;
};
_s(ImageGallery, "ahbPxI/rbPU9G0BKP/Vtadocq0Q=");
_c = ImageGallery;
var _c;
__turbopack_context__.k.register(_c, "ImageGallery");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/molecules/VariantSelector.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VariantSelector",
    ()=>VariantSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const VariantSelector = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(23);
    if ($[0] !== "e75431fa84ad5e8d2bd1afe9bd6d27c9ded9cdcbb31e8b8430cf39320cfdb0d6") {
        for(let $i = 0; $i < 23; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "e75431fa84ad5e8d2bd1afe9bd6d27c9ded9cdcbb31e8b8430cf39320cfdb0d6";
    }
    const { variant, selectedValue, onValueChange } = t0;
    let t1;
    let t2;
    if ($[1] !== onValueChange || $[2] !== selectedValue || $[3] !== variant.options) {
        t1 = ()=>{
            if (!selectedValue) {
                const firstAvailable = variant.options.find(_temp);
                if (firstAvailable) {
                    onValueChange(firstAvailable.value);
                }
            }
        };
        t2 = [
            selectedValue,
            onValueChange,
            variant.options
        ];
        $[1] = onValueChange;
        $[2] = selectedValue;
        $[3] = variant.options;
        $[4] = t1;
        $[5] = t2;
    } else {
        t1 = $[4];
        t2 = $[5];
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect(t1, t2);
    let t3;
    if ($[6] !== selectedValue) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-muted-foreground font-normal",
            children: selectedValue
        }, void 0, false, {
            fileName: "[project]/components/molecules/VariantSelector.tsx",
            lineNumber: 55,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[6] = selectedValue;
        $[7] = t3;
    } else {
        t3 = $[7];
    }
    let t4;
    if ($[8] !== t3 || $[9] !== variant.name) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
            className: "font-semibold mb-3",
            children: [
                variant.name,
                ": ",
                t3
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/VariantSelector.tsx",
            lineNumber: 63,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[8] = t3;
        $[9] = variant.name;
        $[10] = t4;
    } else {
        t4 = $[10];
    }
    let t5;
    if ($[11] !== onValueChange || $[12] !== selectedValue || $[13] !== variant.options) {
        let t6;
        if ($[15] !== onValueChange || $[16] !== selectedValue) {
            t6 = (option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    onClick: ()=>onValueChange(option.value),
                    disabled: option.stock === 0,
                    variant: selectedValue === option.value ? "default" : "outline",
                    size: "sm",
                    children: option.value
                }, option.value, false, {
                    fileName: "[project]/components/molecules/VariantSelector.tsx",
                    lineNumber: 74,
                    columnNumber: 22
                }, ("TURBOPACK compile-time value", void 0));
            $[15] = onValueChange;
            $[16] = selectedValue;
            $[17] = t6;
        } else {
            t6 = $[17];
        }
        t5 = variant.options.map(t6);
        $[11] = onValueChange;
        $[12] = selectedValue;
        $[13] = variant.options;
        $[14] = t5;
    } else {
        t5 = $[14];
    }
    let t6;
    if ($[18] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2",
            children: t5
        }, void 0, false, {
            fileName: "[project]/components/molecules/VariantSelector.tsx",
            lineNumber: 91,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[18] = t5;
        $[19] = t6;
    } else {
        t6 = $[19];
    }
    let t7;
    if ($[20] !== t4 || $[21] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mb-6",
            children: [
                t4,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/VariantSelector.tsx",
            lineNumber: 99,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[20] = t4;
        $[21] = t6;
        $[22] = t7;
    } else {
        t7 = $[22];
    }
    return t7;
};
_s(VariantSelector, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = VariantSelector;
function _temp(opt) {
    return opt.stock > 0;
}
var _c;
__turbopack_context__.k.register(_c, "VariantSelector");
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
"[project]/components/atoms/Rating.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Rating",
    ()=>Rating
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Icon.tsx [app-client] (ecmascript)");
;
;
;
const Rating = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(15);
    if ($[0] !== "98537a0081a711072b4c2a755cdf9c65d5825e291ec13fef5aad87c89a654b63") {
        for(let $i = 0; $i < 15; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "98537a0081a711072b4c2a755cdf9c65d5825e291ec13fef5aad87c89a654b63";
    }
    const { rating, maxRating: t1, className: t2, size: t3 } = t0;
    const maxRating = t1 === undefined ? 5 : t1;
    const className = t2 === undefined ? "" : t2;
    const size = t3 === undefined ? "w-5 h-5" : t3;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);
    const t4 = `flex items-center gap-0.5 ${className}`;
    let t5;
    if ($[1] !== fullStars) {
        t5 = [
            ...Array(fullStars)
        ];
        $[1] = fullStars;
        $[2] = t5;
    } else {
        t5 = $[2];
    }
    let t6;
    if ($[3] !== size || $[4] !== t5) {
        t6 = t5.map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                name: "star",
                className: `${size} text-secondary`
            }, `full-${i}`, false, {
                fileName: "[project]/components/atoms/Rating.tsx",
                lineNumber: 41,
                columnNumber: 27
            }, ("TURBOPACK compile-time value", void 0)));
        $[3] = size;
        $[4] = t5;
        $[5] = t6;
    } else {
        t6 = $[5];
    }
    let t7;
    if ($[6] !== emptyStars) {
        t7 = [
            ...Array(emptyStars)
        ];
        $[6] = emptyStars;
        $[7] = t7;
    } else {
        t7 = $[7];
    }
    let t8;
    if ($[8] !== size || $[9] !== t7) {
        t8 = t7.map((__0, i_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                name: "star",
                className: `${size} text-muted`
            }, `empty-${i_0}`, false, {
                fileName: "[project]/components/atoms/Rating.tsx",
                lineNumber: 58,
                columnNumber: 31
            }, ("TURBOPACK compile-time value", void 0)));
        $[8] = size;
        $[9] = t7;
        $[10] = t8;
    } else {
        t8 = $[10];
    }
    let t9;
    if ($[11] !== t4 || $[12] !== t6 || $[13] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t4,
            children: [
                t6,
                t8
            ]
        }, void 0, true, {
            fileName: "[project]/components/atoms/Rating.tsx",
            lineNumber: 67,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[11] = t4;
        $[12] = t6;
        $[13] = t8;
        $[14] = t9;
    } else {
        t9 = $[14];
    }
    return t9;
};
_c = Rating;
var _c;
__turbopack_context__.k.register(_c, "Rating");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/molecules/ReviewItem.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReviewItem",
    ()=>ReviewItem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Rating$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Rating.tsx [app-client] (ecmascript)");
;
;
;
const ReviewItem = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(18);
    if ($[0] !== "f4c4c393e2b3f6fd0629498acb37a559d984d22ded6ce2d192f5d2e8504eacd7") {
        for(let $i = 0; $i < 18; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "f4c4c393e2b3f6fd0629498acb37a559d984d22ded6ce2d192f5d2e8504eacd7";
    }
    const { review } = t0;
    let t1;
    if ($[1] !== review.date) {
        t1 = new Date(review.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
        $[1] = review.date;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const formattedDate = t1;
    let t2;
    if ($[3] !== review.author) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
            className: "font-semibold text-foreground",
            children: review.author
        }, void 0, false, {
            fileName: "[project]/components/molecules/ReviewItem.tsx",
            lineNumber: 34,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = review.author;
        $[4] = t2;
    } else {
        t2 = $[4];
    }
    let t3;
    if ($[5] !== formattedDate) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-sm text-muted-foreground",
            children: formattedDate
        }, void 0, false, {
            fileName: "[project]/components/molecules/ReviewItem.tsx",
            lineNumber: 42,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[5] = formattedDate;
        $[6] = t3;
    } else {
        t3 = $[6];
    }
    let t4;
    if ($[7] !== t2 || $[8] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-between mb-2",
            children: [
                t2,
                t3
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/ReviewItem.tsx",
            lineNumber: 50,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[7] = t2;
        $[8] = t3;
        $[9] = t4;
    } else {
        t4 = $[9];
    }
    let t5;
    if ($[10] !== review.rating) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Rating$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rating"], {
            rating: review.rating,
            className: "mb-3"
        }, void 0, false, {
            fileName: "[project]/components/molecules/ReviewItem.tsx",
            lineNumber: 59,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[10] = review.rating;
        $[11] = t5;
    } else {
        t5 = $[11];
    }
    let t6;
    if ($[12] !== review.comment) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-muted-foreground leading-relaxed",
            children: review.comment
        }, void 0, false, {
            fileName: "[project]/components/molecules/ReviewItem.tsx",
            lineNumber: 67,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[12] = review.comment;
        $[13] = t6;
    } else {
        t6 = $[13];
    }
    let t7;
    if ($[14] !== t4 || $[15] !== t5 || $[16] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-muted/50 p-6 rounded-lg",
            children: [
                t4,
                t5,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/ReviewItem.tsx",
            lineNumber: 75,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[14] = t4;
        $[15] = t5;
        $[16] = t6;
        $[17] = t7;
    } else {
        t7 = $[17];
    }
    return t7;
};
_c = ReviewItem;
var _c;
__turbopack_context__.k.register(_c, "ReviewItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/label.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Label = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/label.tsx",
        lineNumber: 8,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Label;
Label.displayName = 'Label';
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Label$React.forwardRef");
__turbopack_context__.k.register(_c1, "Label");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/textarea.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Textarea",
    ()=>Textarea
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Textarea = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].forwardRef(_c = ({ className, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50', className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/textarea.tsx",
        lineNumber: 10,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Textarea;
Textarea.displayName = 'Textarea';
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Textarea$React.forwardRef");
__turbopack_context__.k.register(_c1, "Textarea");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
// FIX: Replaced entire corrupted file with a correct implementation of Card components.
// This fixes the React declaration errors and the missing export errors.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Card = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('rounded-xl border bg-card text-card-foreground shadow', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 10,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Card;
Card.displayName = 'Card';
const CardHeader = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c2 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col space-y-1.5 p-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 22,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c3 = CardHeader;
CardHeader.displayName = 'CardHeader';
const CardTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c4 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('font-semibold leading-none tracking-tight', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 34,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c5 = CardTitle;
CardTitle.displayName = 'CardTitle';
const CardDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c6 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-sm text-muted-foreground', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 46,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c7 = CardDescription;
CardDescription.displayName = 'CardDescription';
const CardContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c8 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('p-6 pt-0', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 58,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c9 = CardContent;
CardContent.displayName = 'CardContent';
const CardFooter = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c10 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center p-6 pt-0', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 66,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c11 = CardFooter;
CardFooter.displayName = 'CardFooter';
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11;
__turbopack_context__.k.register(_c, "Card$React.forwardRef");
__turbopack_context__.k.register(_c1, "Card");
__turbopack_context__.k.register(_c2, "CardHeader$React.forwardRef");
__turbopack_context__.k.register(_c3, "CardHeader");
__turbopack_context__.k.register(_c4, "CardTitle$React.forwardRef");
__turbopack_context__.k.register(_c5, "CardTitle");
__turbopack_context__.k.register(_c6, "CardDescription$React.forwardRef");
__turbopack_context__.k.register(_c7, "CardDescription");
__turbopack_context__.k.register(_c8, "CardContent$React.forwardRef");
__turbopack_context__.k.register(_c9, "CardContent");
__turbopack_context__.k.register(_c10, "CardFooter$React.forwardRef");
__turbopack_context__.k.register(_c11, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/molecules/ReviewForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReviewForm",
    ()=>ReviewForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/textarea.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Icon.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
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
const ReviewForm = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(21);
    if ($[0] !== "8af2f9cc0e8b4d64e5f58489459a4c7d5024678bad506aa36c6fdf7748d22ba7") {
        for(let $i = 0; $i < 21; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "8af2f9cc0e8b4d64e5f58489459a4c7d5024678bad506aa36c6fdf7748d22ba7";
    }
    const { onSubmit } = t0;
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const [author, setAuthor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [rating, setRating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [hoverRating, setHoverRating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [comment, setComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [submitted, setSubmitted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    let t1;
    if ($[1] !== author || $[2] !== comment || $[3] !== onSubmit || $[4] !== rating) {
        t1 = (e)=>{
            e.preventDefault();
            if (author && rating > 0 && comment) {
                onSubmit({
                    author,
                    rating,
                    comment
                });
                setAuthor("");
                setRating(0);
                setComment("");
                setSubmitted(true);
                setTimeout(()=>setSubmitted(false), 3000);
            }
        };
        $[1] = author;
        $[2] = comment;
        $[3] = onSubmit;
        $[4] = rating;
        $[5] = t1;
    } else {
        t1 = $[5];
    }
    const handleSubmit = t1;
    let t2;
    if ($[6] !== t) {
        t2 = t("product_write_review");
        $[6] = t;
        $[7] = t2;
    } else {
        t2 = $[7];
    }
    let t3;
    if ($[8] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                children: t2
            }, void 0, false, {
                fileName: "[project]/components/molecules/ReviewForm.tsx",
                lineNumber: 71,
                columnNumber: 22
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/molecules/ReviewForm.tsx",
            lineNumber: 71,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[8] = t2;
        $[9] = t3;
    } else {
        t3 = $[9];
    }
    let t4;
    if ($[10] !== author || $[11] !== comment || $[12] !== handleSubmit || $[13] !== hoverRating || $[14] !== rating || $[15] !== submitted || $[16] !== t) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
            children: submitted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center p-4 bg-primary/10 text-primary font-medium rounded-md",
                children: t("product_review_success")
            }, void 0, false, {
                fileName: "[project]/components/molecules/ReviewForm.tsx",
                lineNumber: 79,
                columnNumber: 36
            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "author",
                                children: t("product_review_form_name")
                            }, void 0, false, {
                                fileName: "[project]/components/molecules/ReviewForm.tsx",
                                lineNumber: 79,
                                columnNumber: 214
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                id: "author",
                                value: author,
                                onChange: (e_0)=>setAuthor(e_0.target.value),
                                required: true
                            }, void 0, false, {
                                fileName: "[project]/components/molecules/ReviewForm.tsx",
                                lineNumber: 79,
                                columnNumber: 277
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/molecules/ReviewForm.tsx",
                        lineNumber: 79,
                        columnNumber: 209
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                children: t("product_review_form_rating")
                            }, void 0, false, {
                                fileName: "[project]/components/molecules/ReviewForm.tsx",
                                lineNumber: 79,
                                columnNumber: 386
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                onMouseLeave: ()=>setHoverRating(0),
                                children: [
                                    1,
                                    2,
                                    3,
                                    4,
                                    5
                                ].map((star)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                        name: "star",
                                        className: `w-6 h-6 cursor-pointer transition-colors ${(hoverRating || rating) >= star ? "text-secondary" : "text-muted"}`,
                                        onClick: ()=>setRating(star),
                                        onMouseEnter: ()=>setHoverRating(star)
                                    }, star, false, {
                                        fileName: "[project]/components/molecules/ReviewForm.tsx",
                                        lineNumber: 79,
                                        columnNumber: 543
                                    }, ("TURBOPACK compile-time value", void 0)))
                            }, void 0, false, {
                                fileName: "[project]/components/molecules/ReviewForm.tsx",
                                lineNumber: 79,
                                columnNumber: 434
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/molecules/ReviewForm.tsx",
                        lineNumber: 79,
                        columnNumber: 381
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "comment",
                                children: t("product_review_form_comment")
                            }, void 0, false, {
                                fileName: "[project]/components/molecules/ReviewForm.tsx",
                                lineNumber: 79,
                                columnNumber: 791
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Textarea"], {
                                id: "comment",
                                value: comment,
                                onChange: (e_1)=>setComment(e_1.target.value),
                                rows: 4,
                                required: true
                            }, void 0, false, {
                                fileName: "[project]/components/molecules/ReviewForm.tsx",
                                lineNumber: 79,
                                columnNumber: 858
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/molecules/ReviewForm.tsx",
                        lineNumber: 79,
                        columnNumber: 786
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        type: "submit",
                        className: "w-full",
                        children: t("product_review_form_submit")
                    }, void 0, false, {
                        fileName: "[project]/components/molecules/ReviewForm.tsx",
                        lineNumber: 79,
                        columnNumber: 977
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/molecules/ReviewForm.tsx",
                lineNumber: 79,
                columnNumber: 157
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/molecules/ReviewForm.tsx",
            lineNumber: 79,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[10] = author;
        $[11] = comment;
        $[12] = handleSubmit;
        $[13] = hoverRating;
        $[14] = rating;
        $[15] = submitted;
        $[16] = t;
        $[17] = t4;
    } else {
        t4 = $[17];
    }
    let t5;
    if ($[18] !== t3 || $[19] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
            className: "sticky top-28",
            children: [
                t3,
                t4
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/ReviewForm.tsx",
            lineNumber: 93,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[18] = t3;
        $[19] = t4;
        $[20] = t5;
    } else {
        t5 = $[20];
    }
    return t5;
};
_s(ReviewForm, "pu6M0k79WWmnaQnzjaYhbFA70eo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c = ReviewForm;
var _c;
__turbopack_context__.k.register(_c, "ReviewForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/molecules/Pagination.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Pagination",
    ()=>Pagination
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Icon.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const Pagination = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(43);
    if ($[0] !== "940368abb8d462af59a2bf01d949d5c5c3608c2a3e84689814220e5104643f3e") {
        for(let $i = 0; $i < 43; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "940368abb8d462af59a2bf01d949d5c5c3608c2a3e84689814220e5104643f3e";
    }
    const { currentPage, totalPages, onPageChange } = t0;
    const { t, language } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const isRtl = language === "ar";
    let t1;
    if ($[1] !== t) {
        t1 = t("pagination_previous");
        $[1] = t;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const prevText = t1;
    let t2;
    if ($[3] !== t) {
        t2 = t("pagination_next");
        $[3] = t;
        $[4] = t2;
    } else {
        t2 = $[4];
    }
    const nextText = t2;
    let t3;
    if ($[5] !== currentPage || $[6] !== onPageChange) {
        t3 = ()=>{
            if (currentPage > 1) {
                onPageChange(currentPage - 1);
            }
        };
        $[5] = currentPage;
        $[6] = onPageChange;
        $[7] = t3;
    } else {
        t3 = $[7];
    }
    const handlePrev = t3;
    let t4;
    if ($[8] !== currentPage || $[9] !== onPageChange || $[10] !== totalPages) {
        t4 = ()=>{
            if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
            }
        };
        $[8] = currentPage;
        $[9] = onPageChange;
        $[10] = totalPages;
        $[11] = t4;
    } else {
        t4 = $[11];
    }
    const handleNext = t4;
    let t5;
    if ($[12] !== currentPage || $[13] !== totalPages) {
        t5 = ()=>{
            const pages = new Set();
            pages.add(1);
            pages.add(totalPages);
            if (currentPage > 2) {
                pages.add(currentPage - 1);
            }
            pages.add(currentPage);
            if (currentPage < totalPages - 1) {
                pages.add(currentPage + 1);
            }
            const pageArray = Array.from(pages).sort(_temp);
            const result = [];
            let lastPage = 0;
            for (const page of pageArray){
                if (lastPage > 0 && page - lastPage > 1) {
                    result.push("...");
                }
                result.push(page);
                lastPage = page;
            }
            return result;
        };
        $[12] = currentPage;
        $[13] = totalPages;
        $[14] = t5;
    } else {
        t5 = $[14];
    }
    const getPageNumbers = t5;
    if (totalPages <= 1) {
        return null;
    }
    const t6 = currentPage === 1;
    const t7 = `h-4 w-4 ${!isRtl ? "rotate-180" : ""}`;
    let t8;
    if ($[15] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
            name: "chevronRight",
            className: t7
        }, void 0, false, {
            fileName: "[project]/components/molecules/Pagination.tsx",
            lineNumber: 117,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[15] = t7;
        $[16] = t8;
    } else {
        t8 = $[16];
    }
    let t9;
    if ($[17] !== prevText) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: prevText
        }, void 0, false, {
            fileName: "[project]/components/molecules/Pagination.tsx",
            lineNumber: 125,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[17] = prevText;
        $[18] = t9;
    } else {
        t9 = $[18];
    }
    let t10;
    if ($[19] !== handlePrev || $[20] !== t6 || $[21] !== t8 || $[22] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "outline",
            size: "sm",
            onClick: handlePrev,
            disabled: t6,
            className: "gap-1",
            children: [
                t8,
                t9
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/Pagination.tsx",
            lineNumber: 133,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[19] = handlePrev;
        $[20] = t6;
        $[21] = t8;
        $[22] = t9;
        $[23] = t10;
    } else {
        t10 = $[23];
    }
    let t11;
    if ($[24] !== getPageNumbers) {
        t11 = getPageNumbers();
        $[24] = getPageNumbers;
        $[25] = t11;
    } else {
        t11 = $[25];
    }
    let t12;
    if ($[26] !== currentPage || $[27] !== onPageChange || $[28] !== t11) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "hidden sm:flex items-center gap-1",
            children: t11.map((page_0, index)=>typeof page_0 === "number" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    variant: currentPage === page_0 ? "default" : "ghost",
                    size: "icon",
                    onClick: ()=>onPageChange(page_0),
                    className: "h-9 w-9",
                    children: page_0
                }, `${page_0}-${index}`, false, {
                    fileName: "[project]/components/molecules/Pagination.tsx",
                    lineNumber: 152,
                    columnNumber: 119
                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "px-2 text-muted-foreground",
                    children: "..."
                }, `dots-${index}`, false, {
                    fileName: "[project]/components/molecules/Pagination.tsx",
                    lineNumber: 152,
                    columnNumber: 298
                }, ("TURBOPACK compile-time value", void 0)))
        }, void 0, false, {
            fileName: "[project]/components/molecules/Pagination.tsx",
            lineNumber: 152,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[26] = currentPage;
        $[27] = onPageChange;
        $[28] = t11;
        $[29] = t12;
    } else {
        t12 = $[29];
    }
    const t13 = currentPage === totalPages;
    let t14;
    if ($[30] !== nextText) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: nextText
        }, void 0, false, {
            fileName: "[project]/components/molecules/Pagination.tsx",
            lineNumber: 163,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[30] = nextText;
        $[31] = t14;
    } else {
        t14 = $[31];
    }
    const t15 = `h-4 w-4 ${isRtl ? "rotate-180" : ""}`;
    let t16;
    if ($[32] !== t15) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Icon$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
            name: "chevronRight",
            className: t15
        }, void 0, false, {
            fileName: "[project]/components/molecules/Pagination.tsx",
            lineNumber: 172,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[32] = t15;
        $[33] = t16;
    } else {
        t16 = $[33];
    }
    let t17;
    if ($[34] !== handleNext || $[35] !== t13 || $[36] !== t14 || $[37] !== t16) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "outline",
            size: "sm",
            onClick: handleNext,
            disabled: t13,
            className: "gap-1",
            children: [
                t14,
                t16
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/Pagination.tsx",
            lineNumber: 180,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[34] = handleNext;
        $[35] = t13;
        $[36] = t14;
        $[37] = t16;
        $[38] = t17;
    } else {
        t17 = $[38];
    }
    let t18;
    if ($[39] !== t10 || $[40] !== t12 || $[41] !== t17) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-8 flex justify-center items-center gap-2",
            children: [
                t10,
                t12,
                t17
            ]
        }, void 0, true, {
            fileName: "[project]/components/molecules/Pagination.tsx",
            lineNumber: 191,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[39] = t10;
        $[40] = t12;
        $[41] = t17;
        $[42] = t18;
    } else {
        t18 = $[42];
    }
    return t18;
};
_s(Pagination, "NPfdzIKo61gr5PjJkZ4P9yDpKLQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c = Pagination;
function _temp(a, b) {
    return a - b;
}
var _c;
__turbopack_context__.k.register(_c, "Pagination");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/views/ProductDetailPage.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/hooks/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTranslation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useCart.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$usePagination$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/usePagination.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Container$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/Container.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$ImageGallery$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/molecules/ImageGallery.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$VariantSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/molecules/VariantSelector.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$QuantityInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/QuantityInput.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Grid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/Grid.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$ProductCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/molecules/ProductCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$AdBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/molecules/AdBanner.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Price$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Price.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$DiscountBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/DiscountBadge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Rating$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/atoms/Rating.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$ReviewItem$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/molecules/ReviewItem.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$ReviewForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/molecules/ReviewForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$Pagination$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/molecules/Pagination.tsx [app-client] (ecmascript)");
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
;
;
;
;
;
const ProductDetailPage = (t0)=>{
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(99);
    if ($[0] !== "71e16aa10a375deddd66a99f8ae6c5c8b85aa195afc1f26e880a97b7bd2eb74f") {
        for(let $i = 0; $i < 99; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "71e16aa10a375deddd66a99f8ae6c5c8b85aa195afc1f26e880a97b7bd2eb74f";
    }
    const { productId } = t0;
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const { addToCart } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    let t1;
    if ($[1] !== productId) {
        t1 = (p)=>p.id === productId;
        $[1] = productId;
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const product = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["products"].find(t1);
    const [quantity, setQuantity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    let t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = {};
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    const [selectedVariants, setSelectedVariants] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t2);
    const [isNavSticky, setIsNavSticky] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    let t3;
    if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = [];
        $[4] = t3;
    } else {
        t3 = $[4];
    }
    const [productReviews, setProductReviews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t3);
    const contentRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { currentPage, totalPages, currentPageData: currentReviews, setCurrentPage } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$usePagination$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePagination"])(productReviews, 2);
    const navItems = [
        {
            key: "product_nav_description",
            href: "#description"
        },
        {
            key: "product_nav_reviews",
            href: "#reviews"
        },
        {
            key: "product_nav_recommended",
            href: "#recommended"
        }
    ];
    let t4;
    let t5;
    if ($[5] !== productId) {
        t4 = ()=>{
            if (productId) {
                const reviewsForProduct = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["reviews"].filter((r)=>r.productId === productId).sort(_temp);
                setProductReviews(reviewsForProduct);
            }
        };
        t5 = [
            productId
        ];
        $[5] = productId;
        $[6] = t4;
        $[7] = t5;
    } else {
        t4 = $[6];
        t5 = $[7];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t4, t5);
    let t6;
    bb0: {
        if (productReviews.length === 0) {
            let t7;
            if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
                t7 = {
                    average: 0,
                    count: 0
                };
                $[8] = t7;
            } else {
                t7 = $[8];
            }
            t6 = t7;
            break bb0;
        }
        const totalRating = productReviews.reduce(_temp2, 0);
        const t7 = totalRating / productReviews.length;
        let t8;
        if ($[9] !== productReviews.length || $[10] !== t7) {
            t8 = {
                average: t7,
                count: productReviews.length
            };
            $[9] = productReviews.length;
            $[10] = t7;
            $[11] = t8;
        } else {
            t8 = $[11];
        }
        t6 = t8;
    }
    const reviewSummary = t6;
    let t7;
    let t8;
    if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = ()=>{
            const handleScroll = ()=>{
                if (contentRef.current) {
                    setIsNavSticky(window.scrollY > contentRef.current.offsetTop);
                }
            };
            window.addEventListener("scroll", handleScroll);
            return ()=>window.removeEventListener("scroll", handleScroll);
        };
        t8 = [];
        $[12] = t7;
        $[13] = t8;
    } else {
        t7 = $[12];
        t8 = $[13];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t7, t8);
    if (!product) {
        let t9;
        if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
            t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-2xl",
                children: "Product not found."
            }, void 0, false, {
                fileName: "[project]/views/ProductDetailPage.tsx",
                lineNumber: 162,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0));
            $[14] = t9;
        } else {
            t9 = $[14];
        }
        let t10;
        if ($[15] !== router) {
            t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Container$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Container"], {
                className: "py-20 text-center",
                children: [
                    t9,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        onClick: ()=>router.push("/shop"),
                        className: "mt-4",
                        children: "Back to Shop"
                    }, void 0, false, {
                        fileName: "[project]/views/ProductDetailPage.tsx",
                        lineNumber: 169,
                        columnNumber: 58
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/views/ProductDetailPage.tsx",
                lineNumber: 169,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0));
            $[15] = router;
            $[16] = t10;
        } else {
            t10 = $[16];
        }
        return t10;
    }
    const handleAddReview = (newReview)=>{
        const review_0 = {
            id: Date.now(),
            productId: product.id,
            date: new Date().toISOString(),
            ...newReview
        };
        setProductReviews((prev)=>[
                review_0,
                ...prev
            ]);
    };
    const handleAddToCart = ()=>{
        addToCart(product, quantity, selectedVariants);
    };
    const recommendedProducts = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["products"].filter((p_0)=>p_0.category === product.category && p_0.id !== product.id).slice(0, 4);
    const t9 = `category_${product.category.toLowerCase().replace(" ", "_")}_title`;
    let t10;
    if ($[17] !== t || $[18] !== t9) {
        t10 = t(t9);
        $[17] = t;
        $[18] = t9;
        $[19] = t10;
    } else {
        t10 = $[19];
    }
    let t11;
    if ($[20] !== t10) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-primary font-semibold",
            children: t10
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 202,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[20] = t10;
        $[21] = t11;
    } else {
        t11 = $[21];
    }
    let t12;
    let t13;
    if ($[22] !== product) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
            className: "text-3xl lg:text-4xl font-bold text-foreground",
            children: product.name
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 211,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        t13 = product.strikePrice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$DiscountBadge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DiscountBadge"], {
            price: product.price,
            strikePrice: product.strikePrice
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 212,
            columnNumber: 34
        }, ("TURBOPACK compile-time value", void 0));
        $[22] = product;
        $[23] = t12;
        $[24] = t13;
    } else {
        t12 = $[23];
        t13 = $[24];
    }
    let t14;
    if ($[25] !== t12 || $[26] !== t13) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-4 mt-2",
            children: [
                t12,
                t13
            ]
        }, void 0, true, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 222,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[25] = t12;
        $[26] = t13;
        $[27] = t14;
    } else {
        t14 = $[27];
    }
    let t15;
    if ($[28] !== reviewSummary.average || $[29] !== reviewSummary.count || $[30] !== t) {
        t15 = reviewSummary.count > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2 mt-2 mb-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Rating$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rating"], {
                    rating: reviewSummary.average
                }, void 0, false, {
                    fileName: "[project]/views/ProductDetailPage.tsx",
                    lineNumber: 231,
                    columnNumber: 89
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-muted-foreground text-sm",
                    children: t("product_based_on_reviews", {
                        count: reviewSummary.count
                    })
                }, void 0, false, {
                    fileName: "[project]/views/ProductDetailPage.tsx",
                    lineNumber: 231,
                    columnNumber: 130
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 231,
            columnNumber: 38
        }, ("TURBOPACK compile-time value", void 0));
        $[28] = reviewSummary.average;
        $[29] = reviewSummary.count;
        $[30] = t;
        $[31] = t15;
    } else {
        t15 = $[31];
    }
    let t16;
    let t17;
    if ($[32] !== product) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$Price$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Price"], {
            price: product.price,
            strikePrice: product.strikePrice,
            className: "mb-6"
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 244,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-muted-foreground leading-relaxed mb-8",
            children: product.description
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 245,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[32] = product;
        $[33] = t16;
        $[34] = t17;
    } else {
        t16 = $[33];
        t17 = $[34];
    }
    let t18;
    if ($[35] !== product || $[36] !== selectedVariants) {
        t18 = product.variants && Object.keys(product.variants).map((variantName)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$VariantSelector$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VariantSelector"], {
                variant: product.variants[variantName],
                selectedValue: selectedVariants[variantName],
                onValueChange: (value)=>setSelectedVariants((prev_0)=>({
                            ...prev_0,
                            [variantName]: value
                        }))
            }, variantName, false, {
                fileName: "[project]/views/ProductDetailPage.tsx",
                lineNumber: 255,
                columnNumber: 80
            }, ("TURBOPACK compile-time value", void 0)));
        $[35] = product;
        $[36] = selectedVariants;
        $[37] = t18;
    } else {
        t18 = $[37];
    }
    let t19;
    if ($[38] !== quantity) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$atoms$2f$QuantityInput$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QuantityInput"], {
            quantity: quantity,
            setQuantity: setQuantity
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 267,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[38] = quantity;
        $[39] = t19;
    } else {
        t19 = $[39];
    }
    let t20;
    if ($[40] !== t) {
        t20 = t("product_add_to_cart");
        $[40] = t;
        $[41] = t20;
    } else {
        t20 = $[41];
    }
    let t21;
    if ($[42] !== handleAddToCart || $[43] !== t20) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            size: "lg",
            className: "w-full",
            onClick: handleAddToCart,
            children: t20
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 283,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[42] = handleAddToCart;
        $[43] = t20;
        $[44] = t21;
    } else {
        t21 = $[44];
    }
    let t22;
    if ($[45] !== t19 || $[46] !== t21) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-4 mt-8",
            children: [
                t19,
                t21
            ]
        }, void 0, true, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 292,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[45] = t19;
        $[46] = t21;
        $[47] = t22;
    } else {
        t22 = $[47];
    }
    let t23;
    if ($[48] !== t11 || $[49] !== t14 || $[50] !== t15 || $[51] !== t16 || $[52] !== t17 || $[53] !== t18 || $[54] !== t22) {
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                t11,
                t14,
                t15,
                t16,
                t17,
                t18,
                t22
            ]
        }, void 0, true, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 301,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[48] = t11;
        $[49] = t14;
        $[50] = t15;
        $[51] = t16;
        $[52] = t17;
        $[53] = t18;
        $[54] = t22;
        $[55] = t23;
    } else {
        t23 = $[55];
    }
    const t24 = `sticky top-[73px] bg-card/80 backdrop-blur-lg z-30 shadow-sm transition-all duration-300 ${isNavSticky ? "opacity-100" : "opacity-0 -translate-y-4"}`;
    const t25 = navItems.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
            href: item.href,
            className: "px-6 py-4 font-medium text-muted-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-all duration-200",
            children: t(item.key)
        }, item.key, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 314,
            columnNumber: 36
        }, ("TURBOPACK compile-time value", void 0)));
    let t26;
    if ($[56] !== t25) {
        t26 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Container$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Container"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center border-b border-border",
                children: t25
            }, void 0, false, {
                fileName: "[project]/views/ProductDetailPage.tsx",
                lineNumber: 317,
                columnNumber: 22
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 317,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[56] = t25;
        $[57] = t26;
    } else {
        t26 = $[57];
    }
    let t27;
    if ($[58] !== t24 || $[59] !== t26) {
        t27 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t24,
            children: t26
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 325,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[58] = t24;
        $[59] = t26;
        $[60] = t27;
    } else {
        t27 = $[60];
    }
    const T0 = __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Container$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Container"];
    const t28 = "py-16";
    let t29;
    if ($[61] !== t) {
        t29 = t("product_description");
        $[61] = t;
        $[62] = t29;
    } else {
        t29 = $[62];
    }
    let t30;
    if ($[63] !== t29) {
        t30 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            className: "text-2xl font-bold border-b border-border pb-4 mb-6",
            children: t29
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 344,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[63] = t29;
        $[64] = t30;
    } else {
        t30 = $[64];
    }
    let t31;
    if ($[65] !== product) {
        t31 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-muted-foreground leading-relaxed",
            children: product.longDescription
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 352,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[65] = product;
        $[66] = t31;
    } else {
        t31 = $[66];
    }
    let t32;
    if ($[67] !== t30 || $[68] !== t31) {
        t32 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            id: "description",
            className: "scroll-mt-32",
            children: [
                t30,
                t31
            ]
        }, void 0, true, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 360,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[67] = t30;
        $[68] = t31;
        $[69] = t32;
    } else {
        t32 = $[69];
    }
    let t33;
    if ($[70] === Symbol.for("react.memo_cache_sentinel")) {
        t33 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$AdBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdBanner"], {
            className: "my-16"
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 369,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[70] = t33;
    } else {
        t33 = $[70];
    }
    let t34;
    if ($[71] !== t) {
        t34 = t("product_reviews");
        $[71] = t;
        $[72] = t34;
    } else {
        t34 = $[72];
    }
    let t35;
    if ($[73] !== t34) {
        t35 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
            className: "text-2xl font-bold border-b border-border pb-4 mb-6",
            children: t34
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 384,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[73] = t34;
        $[74] = t35;
    } else {
        t35 = $[74];
    }
    let t36;
    if ($[75] !== currentReviews || $[76] !== t) {
        t36 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-grow min-h-[20rem]",
            children: currentReviews.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-6",
                children: currentReviews.map(_temp3)
            }, void 0, false, {
                fileName: "[project]/views/ProductDetailPage.tsx",
                lineNumber: 392,
                columnNumber: 81
            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center h-full",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-muted-foreground",
                    children: t("product_no_reviews")
                }, void 0, false, {
                    fileName: "[project]/views/ProductDetailPage.tsx",
                    lineNumber: 392,
                    columnNumber: 202
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/views/ProductDetailPage.tsx",
                lineNumber: 392,
                columnNumber: 145
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 392,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[75] = currentReviews;
        $[76] = t;
        $[77] = t36;
    } else {
        t36 = $[77];
    }
    let t37;
    if ($[78] !== currentPage || $[79] !== setCurrentPage || $[80] !== totalPages) {
        t37 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$Pagination$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Pagination"], {
            currentPage: currentPage,
            totalPages: totalPages,
            onPageChange: setCurrentPage
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 401,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[78] = currentPage;
        $[79] = setCurrentPage;
        $[80] = totalPages;
        $[81] = t37;
    } else {
        t37 = $[81];
    }
    let t38;
    if ($[82] !== t36 || $[83] !== t37) {
        t38 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "lg:col-span-2 flex flex-col",
            children: [
                t36,
                t37
            ]
        }, void 0, true, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 411,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[82] = t36;
        $[83] = t37;
        $[84] = t38;
    } else {
        t38 = $[84];
    }
    let t39;
    if ($[85] !== handleAddReview) {
        t39 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$ReviewForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReviewForm"], {
                onSubmit: handleAddReview
            }, void 0, false, {
                fileName: "[project]/views/ProductDetailPage.tsx",
                lineNumber: 420,
                columnNumber: 16
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 420,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[85] = handleAddReview;
        $[86] = t39;
    } else {
        t39 = $[86];
    }
    let t40;
    if ($[87] !== t38 || $[88] !== t39) {
        t40 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-1 lg:grid-cols-3 gap-8",
            children: [
                t38,
                t39
            ]
        }, void 0, true, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 428,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[87] = t38;
        $[88] = t39;
        $[89] = t40;
    } else {
        t40 = $[89];
    }
    let t41;
    if ($[90] !== t35 || $[91] !== t40) {
        t41 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            id: "reviews",
            className: "scroll-mt-32 mt-16",
            children: [
                t35,
                t40
            ]
        }, void 0, true, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 437,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[90] = t35;
        $[91] = t40;
        $[92] = t41;
    } else {
        t41 = $[92];
    }
    const t42 = recommendedProducts.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: "recommended",
        className: "scroll-mt-32 mt-16",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-2xl font-bold pb-4 mb-6",
                children: t("product_recommended_items")
            }, void 0, false, {
                fileName: "[project]/views/ProductDetailPage.tsx",
                lineNumber: 444,
                columnNumber: 106
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Grid$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Grid"], {
                children: recommendedProducts.map(_temp4)
            }, void 0, false, {
                fileName: "[project]/views/ProductDetailPage.tsx",
                lineNumber: 444,
                columnNumber: 188
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/views/ProductDetailPage.tsx",
        lineNumber: 444,
        columnNumber: 49
    }, ("TURBOPACK compile-time value", void 0));
    let t43;
    if ($[93] !== T0 || $[94] !== t32 || $[95] !== t33 || $[96] !== t41 || $[97] !== t42) {
        t43 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(T0, {
            className: t28,
            children: [
                t32,
                t33,
                t41,
                t42
            ]
        }, void 0, true, {
            fileName: "[project]/views/ProductDetailPage.tsx",
            lineNumber: 447,
            columnNumber: 11
        }, ("TURBOPACK compile-time value", void 0));
        $[93] = T0;
        $[94] = t32;
        $[95] = t33;
        $[96] = t41;
        $[97] = t42;
        $[98] = t43;
    } else {
        t43 = $[98];
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Container$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Container"], {
                className: "py-12 lg:py-16",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: contentRef,
                    className: "grid grid-cols-1 lg:grid-cols-2 gap-12",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$ImageGallery$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ImageGallery"], {
                            images: product.images
                        }, void 0, false, {
                            fileName: "[project]/views/ProductDetailPage.tsx",
                            lineNumber: 457,
                            columnNumber: 123
                        }, ("TURBOPACK compile-time value", void 0)),
                        t23
                    ]
                }, void 0, true, {
                    fileName: "[project]/views/ProductDetailPage.tsx",
                    lineNumber: 457,
                    columnNumber: 50
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/views/ProductDetailPage.tsx",
                lineNumber: 457,
                columnNumber: 12
            }, ("TURBOPACK compile-time value", void 0)),
            t27,
            t43
        ]
    }, void 0, true);
};
_s(ProductDetailPage, "OAxD7GlMu4CAPtDcfGoatiAyHGU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTranslation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useCart$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$usePagination$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePagination"]
    ];
});
_c = ProductDetailPage;
const __TURBOPACK__default__export__ = ProductDetailPage;
function _temp(a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
}
function _temp2(sum, review) {
    return sum + review.rating;
}
function _temp3(review_1) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$ReviewItem$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReviewItem"], {
        review: review_1
    }, review_1.id, false, {
        fileName: "[project]/views/ProductDetailPage.tsx",
        lineNumber: 467,
        columnNumber: 10
    }, this);
}
function _temp4(p_1) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$molecules$2f$ProductCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProductCard"], {
        product: p_1
    }, p_1.id, false, {
        fileName: "[project]/views/ProductDetailPage.tsx",
        lineNumber: 470,
        columnNumber: 10
    }, this);
}
var _c;
__turbopack_context__.k.register(_c, "ProductDetailPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_eb1faa3e._.js.map