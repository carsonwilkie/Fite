module.exports = [
"[project]/src/usePrice.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>usePrice
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
;
function usePrice() {
    const [price, setPrice] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        fetch("/api/price").then((res)=>res.json()).then((data)=>setPrice(`$${data.amount}/${data.interval}`));
    }, []);
    return price;
}
}),
"[project]/src/ElectricBorder.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
;
function ElectricBorder({ children, active }) {
    if (!active) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "eb-wrapper",
        children: children
    }, void 0, false, {
        fileName: "[project]/src/ElectricBorder.js",
        lineNumber: 2,
        columnNumber: 23
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "eb-wrapper",
        style: {
            position: "relative"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "eb-bg-glow"
            }, void 0, false, {
                fileName: "[project]/src/ElectricBorder.js",
                lineNumber: 5,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "eb-active",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "eb-spin-container",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "eb-spin"
                        }, void 0, false, {
                            fileName: "[project]/src/ElectricBorder.js",
                            lineNumber: 8,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/ElectricBorder.js",
                        lineNumber: 7,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "eb-content",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/src/ElectricBorder.js",
                        lineNumber: 10,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/ElectricBorder.js",
                lineNumber: 6,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "eb-solid-border"
            }, void 0, false, {
                fileName: "[project]/src/ElectricBorder.js",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "eb-glow-1"
            }, void 0, false, {
                fileName: "[project]/src/ElectricBorder.js",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "eb-glow-2"
            }, void 0, false, {
                fileName: "[project]/src/ElectricBorder.js",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "eb-overlay-1"
            }, void 0, false, {
                fileName: "[project]/src/ElectricBorder.js",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "eb-overlay-2"
            }, void 0, false, {
                fileName: "[project]/src/ElectricBorder.js",
                lineNumber: 18,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/ElectricBorder.js",
        lineNumber: 4,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = ElectricBorder;
}),
"[project]/src/PremiumBadge.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
;
function PremiumBadge({ small }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "premium-badge-wrapper",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "premium-badge-glow-layer",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "premium-badge-eclipse-glow"
                }, void 0, false, {
                    fileName: "[project]/src/PremiumBadge.js",
                    lineNumber: 5,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/PremiumBadge.js",
                lineNumber: 4,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "premium-badge-body",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "premium-badge-eclipse"
                    }, void 0, false, {
                        fileName: "[project]/src/PremiumBadge.js",
                        lineNumber: 8,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: `premium-badge-content${small ? " premium-badge-small" : ""}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "premium-badge-shine"
                            }, void 0, false, {
                                fileName: "[project]/src/PremiumBadge.js",
                                lineNumber: 10,
                                columnNumber: 11
                            }, this),
                            "PREMIUM"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/PremiumBadge.js",
                        lineNumber: 9,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/PremiumBadge.js",
                lineNumber: 7,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/PremiumBadge.js",
        lineNumber: 3,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = PremiumBadge;
}),
"[project]/src/LightsaberLoader.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
;
function LightsaberLoader({ percent }) {
    const pct = Math.min(percent, 1);
    const isComplete = pct >= 1;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "ls-container",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "ls-hilt",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "ls-tip"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 9,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "ls-grip ls-grip1"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 10,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "ls-grip ls-grip2"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 11,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "ls-grip ls-grip3"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 12,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "ls-center"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 13,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "ls-center-bottom"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 14,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "ls-hole ls-hole1"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 15,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "ls-hole ls-hole2"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 16,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "ls-cable ls-cable1"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 17,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "ls-cable ls-cable2"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 18,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "ls-guard-tip"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 19,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "ls-guard-rect",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "ls-guard-shadow"
                        }, void 0, false, {
                            fileName: "[project]/src/LightsaberLoader.js",
                            lineNumber: 21,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "ls-guard-tri"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "ls-guard-tri-shadow"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "ls-hilt-shadow"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/LightsaberLoader.js",
                lineNumber: 8,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "ls-blade-track",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: `ls-blade-fill${isComplete ? " ls-blade-complete" : ""}`,
                    style: {
                        width: `${pct * 100}%`
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: `ls-blade-glow${isComplete ? " ls-blade-glow-active" : ""}`
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 34,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/LightsaberLoader.js",
                    lineNumber: 30,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/LightsaberLoader.js",
                lineNumber: 29,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/LightsaberLoader.js",
        lineNumber: 6,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = LightsaberLoader;
}),
"[project]/src/Questions.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2d$markdown__$5b$external$5d$__$28$react$2d$markdown$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$react$2d$markdown$29$__ = __turbopack_context__.i("[externals]/react-markdown [external] (react-markdown, esm_import, [project]/node_modules/react-markdown)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__ = __turbopack_context__.i("[externals]/@clerk/clerk-react [external] (@clerk/clerk-react, esm_import, [project]/node_modules/@clerk/clerk-react)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePaidStatus$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/usePaidStatus.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePrice$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/usePrice.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$useUpgrade$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/useUpgrade.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ElectricBorder$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ElectricBorder.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PremiumBadge$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/PremiumBadge.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$LightsaberLoader$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/LightsaberLoader.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$react$2d$markdown__$5b$external$5d$__$28$react$2d$markdown$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$react$2d$markdown$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePaidStatus$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$useUpgrade$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$react$2d$markdown__$5b$external$5d$__$28$react$2d$markdown$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$react$2d$markdown$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePaidStatus$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$useUpgrade$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const TIMER_TIME = 120;
const INTERVIEW_QUESTIONS = 4;
function Questions() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { category, difficulty, math, customPrompt } = router.query;
    const { user } = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__["useUser"])();
    const { isPaid } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePaidStatus$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"])();
    const price = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePrice$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"])();
    const handleUpgrade = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$useUpgrade$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"])();
    // Normal question state
    const [question, setQuestion] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [answer, setAnswer] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [loadingQuestion, setLoadingQuestion] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [streamProgress, setStreamProgress] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const [interviewProgress, setInterviewProgress] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const [loadingAnswer, setLoadingAnswer] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [answerRevealed, setAnswerRevealed] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [userAnswer, setUserAnswer] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [feedback, setFeedback] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [score, setScore] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [loadingFeedback, setLoadingFeedback] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [graded, setGraded] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const answerRef = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useRef(answer);
    const [questionsUsed, setQuestionsUsed] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    // Timer (formerly "Interview Mode")
    const [timerOn, setTimerOn] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [timerStarted, setTimerStarted] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [isPaused, setIsPaused] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [customTimeSec, setCustomTimeSec] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(TIMER_TIME);
    const [showTimerTooltip, setShowTimerTooltip] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const timerRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    // Interview Mode state
    const [interviewModeOn, setInterviewModeOn] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [interviewTurningOff, setInterviewTurningOff] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const interviewTurningOffRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const [interviewNoShine, setInterviewNoShine] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [showGenerateTooltip, setShowGenerateTooltip] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [interviewSession, setInterviewSession] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null); // { scenario, questions: [{question, idealAnswer}] }
    const [interviewStep, setInterviewStep] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const [interviewUserAnswers, setInterviewUserAnswers] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]); // string per step
    const [interviewTimesLeft, setInterviewTimesLeft] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]); // time remaining at submission per step (null if timer off)
    const [interviewResponses, setInterviewResponses] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]); // { score, onTrack, response } per step
    const [interviewCurrentAnswer, setInterviewCurrentAnswer] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [loadingInterviewGenerate, setLoadingInterviewGenerate] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [loadingInterviewRespond, setLoadingInterviewRespond] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [interviewComplete, setInterviewComplete] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [interviewDebrief, setInterviewDebrief] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [loadingDebrief, setLoadingDebrief] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [interviewAnswersRevealed, setInterviewAnswersRevealed] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    // Per-question timer in interview mode
    const [interviewTimerStarted, setInterviewTimerStarted] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [interviewTimeLeft, setInterviewTimeLeft] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [interviewTimerPaused, setInterviewTimerPaused] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [interviewCustomTime, setInterviewCustomTime] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(TIMER_TIME);
    const interviewTimerRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        answerRef.current = answer;
    }, [
        answer
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        return ()=>{
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        return ()=>{
            if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);
        };
    }, []);
    // Auto-grade when normal timer hits 0
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (timerOn && timeLeft === 0 && !graded) handleGrade();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        timeLeft
    ]);
    // Auto-submit when interview question timer hits 0
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (interviewModeOn && interviewTimerStarted && interviewTimeLeft === 0 && !loadingInterviewRespond) {
            handleInterviewSubmit();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        interviewTimeLeft
    ]);
    // --- Normal timer helpers ---
    const runInterval = ()=>{
        timerRef.current = setInterval(()=>{
            setTimeLeft((prev)=>{
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    const startTimer = ()=>{
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(customTimeSec);
        runInterval();
    };
    const stopTimer = ()=>{
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setTimeLeft(null);
        setIsPaused(false);
    };
    const pauseTimer = ()=>{
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsPaused(true);
    };
    const resumeTimer = ()=>{
        setIsPaused(false);
        runInterval();
    };
    const freezeTimer = ()=>{
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };
    // --- Interview question timer helpers ---
    const runInterviewInterval = ()=>{
        interviewTimerRef.current = setInterval(()=>{
            setInterviewTimeLeft((prev)=>{
                if (prev <= 1) {
                    clearInterval(interviewTimerRef.current);
                    interviewTimerRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    const startInterviewTimer = ()=>{
        if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);
        setInterviewTimeLeft(interviewCustomTime);
        setInterviewTimerStarted(true);
        setInterviewTimerPaused(false);
        runInterviewInterval();
    };
    const stopInterviewTimer = ()=>{
        if (interviewTimerRef.current) {
            clearInterval(interviewTimerRef.current);
            interviewTimerRef.current = null;
        }
        setInterviewTimeLeft(null);
        setInterviewTimerStarted(false);
        setInterviewTimerPaused(false);
    };
    const pauseInterviewTimer = ()=>{
        if (interviewTimerRef.current) {
            clearInterval(interviewTimerRef.current);
            interviewTimerRef.current = null;
        }
        setInterviewTimerPaused(true);
    };
    const resumeInterviewTimer = ()=>{
        setInterviewTimerPaused(false);
        runInterviewInterval();
    };
    const freezeInterviewTimer = ()=>{
        if (interviewTimerRef.current) {
            clearInterval(interviewTimerRef.current);
            interviewTimerRef.current = null;
        }
    };
    const formatTime = (s)=>`${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
    const saveQuestion = (q)=>{
        const history = JSON.parse(localStorage.getItem("questionHistory") || "[]");
        history.push({
            question: q,
            timestamp: Date.now()
        });
        localStorage.setItem("questionHistory", JSON.stringify(history));
    };
    const wasRecentlyAsked = (q)=>{
        const history = JSON.parse(localStorage.getItem("questionHistory") || "[]");
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return history.some((item)=>item.question === q && item.timestamp > oneDayAgo);
    };
    // --- Normal question grade ---
    const handleGrade = async ()=>{
        if (timerOn && timeLeft !== null && timeLeft > 0) freezeTimer();
        setLoadingFeedback(true);
        try {
            const res = await fetch("/api/grade", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question,
                    userAnswer,
                    userId: user?.id
                })
            });
            const data = await res.json();
            setFeedback(data.feedback);
            setScore(data.score ?? null);
            setGraded(true);
            if (user?.id) {
                await fetch("/api/history", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        entry: {
                            question,
                            answer: answerRef.current,
                            userAnswer: userAnswer.trim() || "No answer was submitted.",
                            feedback: data.feedback,
                            score: data.score ?? null,
                            category: decodeURIComponent(category),
                            difficulty: decodeURIComponent(difficulty),
                            math: decodeURIComponent(math),
                            customPrompt: customPrompt && decodeURIComponent(customPrompt) !== "undefined" ? decodeURIComponent(customPrompt) : null,
                            timestamp: Date.now()
                        }
                    })
                });
            }
        } catch (error) {
            console.log("Error:", error);
        }
        setLoadingFeedback(false);
    };
    // --- Normal question fetch ---
    const getQuestion = async ()=>{
        setLoadingQuestion(true);
        setStreamProgress(0);
        setAnswer("");
        setAnswerRevealed(false);
        setQuestion("");
        setUserAnswer("");
        setFeedback("");
        setScore(null);
        setGraded(false);
        stopTimer();
        setTimerStarted(false);
        setIsPaused(false);
        try {
            // First attempt via streaming
            const res = await fetch("/api/question", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    type: "question",
                    category,
                    difficulty,
                    math,
                    customPrompt,
                    userId: user?.id,
                    stream: true
                })
            });
            if (res.status === 403) {
                const data = await res.json();
                if (data.limitReached) {
                    setQuestion("You've reached your 5 free questions for today. Come back tomorrow, or upgrade to premium for unlimited questions!");
                    setLoadingQuestion(false);
                    return;
                }
            }
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            const baseLength = difficulty === "Easy" ? 150 : difficulty === "Hard" ? 350 : 250;
            const ESTIMATED_LENGTH = baseLength + (math === "With Math" ? 80 : 0) + (customPrompt && decodeURIComponent(customPrompt) !== "undefined" && decodeURIComponent(customPrompt) !== "" ? 50 : 0);
            let streamedText = "";
            let streamedQuestionsUsed = null;
            let buffer = "";
            while(true){
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, {
                    stream: true
                });
                const lines = buffer.split("\n");
                buffer = lines.pop();
                for (const line of lines){
                    if (!line.startsWith("data: ")) continue;
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.done) {
                            streamedText = data.text;
                            if (data.questionsUsed !== undefined) streamedQuestionsUsed = data.questionsUsed;
                            setStreamProgress(1);
                        } else if (data.text) {
                            streamedText = data.text;
                            setStreamProgress(Math.min(streamedText.length / ESTIMATED_LENGTH, 0.95));
                        }
                    } catch  {}
                }
            }
            if (streamedQuestionsUsed !== null) setQuestionsUsed(streamedQuestionsUsed);
            // Check for repeat; retry non-streaming if needed
            let newQuestion = wasRecentlyAsked(streamedText) ? null : streamedText;
            let attempts = 1;
            while(!newQuestion && attempts < 5){
                const retryRes = await fetch("/api/question", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        type: "question",
                        category,
                        difficulty,
                        math,
                        customPrompt,
                        userId: user?.id
                    })
                });
                const retryData = await retryRes.json();
                if (retryData.limitReached) {
                    setQuestion("You've reached your 5 free questions for today. Come back tomorrow, or upgrade to premium for unlimited questions!");
                    setLoadingQuestion(false);
                    return;
                }
                if (retryData.questionsUsed !== undefined) setQuestionsUsed(retryData.questionsUsed);
                if (!wasRecentlyAsked(retryData.result)) newQuestion = retryData.result;
                attempts++;
            }
            if (newQuestion) {
                saveQuestion(newQuestion);
                // Fire answer fetch early so it runs during the glow delay
                fetch("/api/question", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        type: "answer",
                        question: newQuestion,
                        category,
                        difficulty,
                        math,
                        customPrompt,
                        userId: user?.id
                    })
                }).then((r)=>r.json()).then((data)=>{
                    setAnswer(data.result);
                });
            }
            await new Promise((r)=>setTimeout(r, 600));
            // Update page only after glow delay
            if (newQuestion) {
                setQuestion(newQuestion);
                setTimerStarted(false);
            } else {
                setQuestion("You've seen all recent questions in this category! Try a different category or check back tomorrow.");
            }
        } catch (error) {
            console.log("Error:", error);
        }
        setLoadingQuestion(false);
    };
    const getAnswer = async ()=>{
        setAnswerRevealed(true);
        if (answer) return;
        setLoadingAnswer(true);
        try {
            const res = await fetch("/api/question", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    type: "answer",
                    question,
                    category,
                    difficulty,
                    math,
                    customPrompt,
                    userId: user?.id
                })
            });
            const data = await res.json();
            setAnswer((current)=>current || data.result);
        } catch (error) {
            console.log("Error:", error);
        }
        setLoadingAnswer(false);
    };
    // --- Interview Mode: generate ---
    const generateInterview = async ()=>{
        setLoadingInterviewGenerate(true);
        setInterviewProgress(0);
        setInterviewSession(null);
        setInterviewStep(0);
        setInterviewUserAnswers([]);
        setInterviewResponses([]);
        setInterviewTimesLeft([]);
        setInterviewCurrentAnswer("");
        setInterviewComplete(false);
        setInterviewDebrief(null);
        setInterviewAnswersRevealed(false);
        stopInterviewTimer();
        const startTime = Date.now();
        const ESTIMATED_MS = 8000;
        const progressInterval = setInterval(()=>{
            const elapsed = Date.now() - startTime;
            setInterviewProgress(Math.min(elapsed / ESTIMATED_MS, 0.9));
        }, 50);
        try {
            const res = await fetch("/api/interview-generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    category: decodeURIComponent(category),
                    difficulty: decodeURIComponent(difficulty),
                    math: decodeURIComponent(math),
                    customPrompt: customPrompt && decodeURIComponent(customPrompt) !== "undefined" ? decodeURIComponent(customPrompt) : null
                })
            });
            const data = await res.json();
            clearInterval(progressInterval);
            setInterviewProgress(1);
            await new Promise((r)=>setTimeout(r, 600));
            setInterviewSession(data);
        } catch (error) {
            console.log("Error:", error);
            clearInterval(progressInterval);
        }
        setLoadingInterviewGenerate(false);
    };
    // --- Interview Mode: submit answer for current step ---
    const handleInterviewSubmit = async ()=>{
        if (!interviewSession) return;
        if (interviewTimeLeft !== null && interviewTimeLeft > 0) freezeInterviewTimer();
        setLoadingInterviewRespond(true);
        const stepIndex = interviewStep;
        const q = interviewSession.questions[stepIndex];
        const isLast = stepIndex === INTERVIEW_QUESTIONS - 1;
        const submittedAnswer = interviewCurrentAnswer;
        try {
            const res = await fetch("/api/interview-respond", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    scenario: interviewSession.scenario,
                    questionIndex: stepIndex,
                    question: q.question,
                    idealAnswer: q.idealAnswer,
                    userAnswer: submittedAnswer,
                    isLast
                })
            });
            const data = await res.json();
            const newAnswers = [
                ...interviewUserAnswers,
                submittedAnswer.trim() || "No answer was submitted."
            ];
            const newResponses = [
                ...interviewResponses,
                data
            ];
            const newTimesLeft = [
                ...interviewTimesLeft,
                timerOn ? interviewTimeLeft : null
            ];
            setInterviewUserAnswers(newAnswers);
            setInterviewResponses(newResponses);
            setInterviewTimesLeft(newTimesLeft);
            setInterviewCurrentAnswer("");
            stopInterviewTimer();
            if (isLast) {
                setInterviewComplete(true);
                // Save to history
                if (user?.id) {
                    const questionsForHistory = interviewSession.questions.map((q, i)=>({
                            question: q.question,
                            idealAnswer: q.idealAnswer,
                            userAnswer: newAnswers[i] || "No answer was submitted.",
                            score: newResponses[i]?.score ?? null,
                            feedback: newResponses[i]?.response || ""
                        }));
                    const scores = questionsForHistory.map((q)=>q.score).filter((s)=>s !== null);
                    const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b)=>a + b, 0) / scores.length * 10) / 10 : null;
                    await fetch("/api/history", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            userId: user.id,
                            entry: {
                                type: "interview",
                                scenario: interviewSession.scenario,
                                questions: questionsForHistory,
                                score: overallScore,
                                category: interviewSession.resolvedCategory || decodeURIComponent(category),
                                difficulty: decodeURIComponent(difficulty),
                                math: decodeURIComponent(math),
                                customPrompt: customPrompt && decodeURIComponent(customPrompt) !== "undefined" ? decodeURIComponent(customPrompt) : null,
                                timestamp: Date.now()
                            }
                        })
                    });
                }
            } else {
                setInterviewStep(stepIndex + 1);
            }
        } catch (error) {
            console.log("Error:", error);
        }
        setLoadingInterviewRespond(false);
    };
    // --- Interview Mode: fetch debrief ---
    const handleInterviewDebrief = async ()=>{
        if (!interviewSession) return;
        setLoadingDebrief(true);
        const questionsForDebrief = interviewSession.questions.map((q, i)=>({
                question: q.question,
                idealAnswer: q.idealAnswer,
                userAnswer: interviewUserAnswers[i] || "No answer was submitted.",
                score: interviewResponses[i]?.score ?? null
            }));
        try {
            const res = await fetch("/api/interview-debrief", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    scenario: interviewSession.scenario,
                    questions: questionsForDebrief,
                    category: decodeURIComponent(category),
                    difficulty: decodeURIComponent(difficulty)
                })
            });
            const data = await res.json();
            setInterviewDebrief(data.feedback);
        } catch (error) {
            console.log("Error:", error);
        }
        setLoadingDebrief(false);
    };
    const interviewOverallScore = interviewResponses.length > 0 ? Math.round(interviewResponses.reduce((a, r)=>a + (r.score ?? 0), 0) / interviewResponses.length * 10) / 10 : null;
    const getScoreColor = (s)=>s >= 8 ? "#16a34a" : s >= 5 ? "#d97706" : "#dc2626";
    const getScoreBg = (s)=>s >= 8 ? "#dcfce7" : s >= 5 ? "#fff7ed" : "#fee2e2";
    const isPolling = loadingQuestion || loadingInterviewGenerate;
    const canToggleInterviewMode = !interviewSession && !isPolling;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: styles.page,
        className: "page-bg page-wrapper",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ElectricBorder$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                active: isPaid,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: {
                        backgroundColor: "#f0f4f8",
                        borderRadius: "16px",
                        padding: "24px",
                        width: "100%",
                        maxWidth: "728px",
                        boxSizing: "border-box",
                        boxShadow: "0 0 40px 10px rgba(0, 0, 0, 0.4)"
                    },
                    className: "wrapper-mobile",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.container,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "16px",
                                    marginBottom: "32px"
                                },
                                className: "header-mobile",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("img", {
                                        src: isPaid ? "/Fite_Logo_Premium.png" : "/favicon.png",
                                        alt: "logo",
                                        style: {
                                            height: "64px",
                                            width: "64px",
                                            cursor: "pointer"
                                        },
                                        className: "logo-img-mobile",
                                        onClick: ()=>router.push("/")
                                    }, void 0, false, {
                                        fileName: "[project]/src/Questions.js",
                                        lineNumber: 480,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                                                        style: {
                                                            ...styles.logo,
                                                            cursor: "pointer"
                                                        },
                                                        className: "logo-mobile",
                                                        onClick: ()=>router.push("/"),
                                                        children: "Fite Finance"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 489,
                                                        columnNumber: 17
                                                    }, this),
                                                    isPaid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PremiumBadge$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 490,
                                                        columnNumber: 28
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 488,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                style: styles.tagline,
                                                className: "tagline-mobile",
                                                children: "The finance site sharpening your interview skills"
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 492,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/Questions.js",
                                        lineNumber: 487,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/Questions.js",
                                lineNumber: 479,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.card,
                                className: "card-mobile",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.categoryHeader,
                                        className: "category-header-mobile",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: ()=>router.push("/"),
                                                className: "back-btn",
                                                children: "← Back"
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 498,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                style: styles.categoryLabel,
                                                children: decodeURIComponent(category)
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 499,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                style: {
                                                    ...styles.mathBadge,
                                                    backgroundColor: "#e8edf5",
                                                    color: "#4a6fa5"
                                                },
                                                children: decodeURIComponent(difficulty)
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 500,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                style: {
                                                    ...styles.mathBadge,
                                                    backgroundColor: decodeURIComponent(math) === "With Math" ? "#0a2463" : "#e8edf5",
                                                    color: decodeURIComponent(math) === "With Math" ? "#ffffff" : "#4a6fa5"
                                                },
                                                children: decodeURIComponent(math)
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 501,
                                                columnNumber: 15
                                            }, this),
                                            customPrompt && decodeURIComponent(customPrompt) !== "" && decodeURIComponent(customPrompt) !== "undefined" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                style: {
                                                    ...styles.mathBadge,
                                                    backgroundColor: "#c9a84c",
                                                    color: "#ffffff"
                                                },
                                                children: [
                                                    '"',
                                                    decodeURIComponent(customPrompt),
                                                    '"'
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 505,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/Questions.js",
                                        lineNumber: 497,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            alignItems: "center",
                                            gap: "20px",
                                            marginBottom: "16px"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: "relative"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            if (!isPaid) {
                                                                setShowTimerTooltip(true);
                                                                setTimeout(()=>setShowTimerTooltip(false), 2500);
                                                                return;
                                                            }
                                                            if (isPolling || timerStarted || interviewSession && interviewTimerStarted) return;
                                                            if (timerOn) {
                                                                setTimerOn(false);
                                                                stopTimer();
                                                                setTimerStarted(false);
                                                            } else {
                                                                setTimerOn(true);
                                                            }
                                                        },
                                                        className: `timer-mode-btn${!isPaid ? " timer-mode-btn-free" : timerOn ? " timer-mode-btn-on" : ""}`,
                                                        style: {
                                                            cursor: isPolling || timerStarted || interviewSession && interviewTimerStarted ? "not-allowed" : undefined,
                                                            opacity: isPolling || timerStarted || interviewSession && interviewTimerStarted ? 0.5 : 1
                                                        },
                                                        children: [
                                                            "Timer ",
                                                            timerOn ? "ON" : "OFF"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 513,
                                                        columnNumber: 17
                                                    }, this),
                                                    showTimerTooltip && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            position: "absolute",
                                                            top: "calc(100% + 8px)",
                                                            left: "50%",
                                                            transform: "translateX(-50%)",
                                                            backgroundColor: "#1a1a2e",
                                                            color: "#ffffff",
                                                            fontSize: "12px",
                                                            fontWeight: "600",
                                                            padding: "6px 12px",
                                                            borderRadius: "8px",
                                                            whiteSpace: "nowrap",
                                                            zIndex: 10,
                                                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                                                        },
                                                        children: [
                                                            "Premium feature — upgrade to unlock",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    position: "absolute",
                                                                    top: "-5px",
                                                                    left: "50%",
                                                                    transform: "translateX(-50%) rotate(45deg)",
                                                                    width: "10px",
                                                                    height: "10px",
                                                                    backgroundColor: "#1a1a2e"
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 528,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 526,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 512,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "interview-mode-wrapper",
                                                style: {
                                                    position: "relative"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            if (isPolling) return;
                                                            if (!canToggleInterviewMode && !interviewModeOn) return;
                                                            if (interviewModeOn) {
                                                                setInterviewNoShine(true);
                                                                setInterviewTurningOff(true);
                                                                setInterviewModeOn(false);
                                                                setInterviewSession(null);
                                                                setInterviewStep(0);
                                                                setInterviewUserAnswers([]);
                                                                setInterviewResponses([]);
                                                                setInterviewCurrentAnswer("");
                                                                setInterviewComplete(false);
                                                                setInterviewDebrief(null);
                                                                setInterviewAnswersRevealed(false);
                                                                stopInterviewTimer();
                                                                if (interviewTurningOffRef.current) clearTimeout(interviewTurningOffRef.current);
                                                                interviewTurningOffRef.current = setTimeout(()=>setInterviewTurningOff(false), 800);
                                                            } else {
                                                                if (interviewTurningOffRef.current) {
                                                                    clearTimeout(interviewTurningOffRef.current);
                                                                    interviewTurningOffRef.current = null;
                                                                    setInterviewTurningOff(false);
                                                                }
                                                                setInterviewModeOn(true);
                                                            }
                                                        },
                                                        onMouseLeave: ()=>setInterviewNoShine(false),
                                                        className: `interview-mode-btn${interviewModeOn ? " interview-mode-btn-on" : ""}${interviewTurningOff ? " interview-mode-btn-turning-off" : ""}${interviewNoShine ? " interview-mode-btn-no-shine" : ""}`,
                                                        style: {
                                                            cursor: isPolling || !canToggleInterviewMode && !interviewModeOn ? "not-allowed" : undefined,
                                                            opacity: isPolling || !canToggleInterviewMode && !interviewModeOn ? 0.5 : 1
                                                        },
                                                        children: [
                                                            "Interview Mode ",
                                                            interviewModeOn ? "ON" : "OFF"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 535,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: `interview-mode-neon-ring${interviewModeOn ? " ring-on" : ""}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 569,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 534,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/Questions.js",
                                        lineNumber: 510,
                                        columnNumber: 13
                                    }, this),
                                    !interviewModeOn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                        children: [
                                            loadingQuestion ? /* set to true to always see loading bar (for testing) - change back to loadingQuestion*/ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$LightsaberLoader$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                percent: streamProgress
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 577,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: getQuestion,
                                                disabled: loadingAnswer,
                                                className: "primary-btn",
                                                children: question && !question.includes("Come back tomorrow") ? "Get New Question" : "Get Question"
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 579,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontSize: "13px",
                                                    color: "#4a6fa5",
                                                    margin: "10px 0 0 0",
                                                    textAlign: "center",
                                                    fontStyle: "italic"
                                                },
                                                children: loadingQuestion ? "Crafting a question just for you..." : "Formulates a realistic technical question based on your selected topic and difficulty."
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 583,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: "relative"
                                                },
                                                children: loadingInterviewGenerate ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$LightsaberLoader$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    percent: interviewProgress
                                                }, void 0, false, {
                                                    fileName: "[project]/src/Questions.js",
                                                    lineNumber: 593,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>{
                                                                if (!isPaid) {
                                                                    setShowGenerateTooltip(true);
                                                                    setTimeout(()=>setShowGenerateTooltip(false), 2500);
                                                                    return;
                                                                }
                                                                generateInterview();
                                                            },
                                                            className: `generate-interview-btn${!isPaid ? " generate-interview-btn-free" : ""}`,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                    className: "generate-interview-btn-glare"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 603,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                    className: "generate-interview-btn-text",
                                                                    style: {
                                                                        position: "relative",
                                                                        zIndex: 1
                                                                    },
                                                                    children: interviewSession ? "Generate New Interview" : "Generate Interview"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 604,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 596,
                                                            columnNumber: 23
                                                        }, this),
                                                        showGenerateTooltip && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                position: "absolute",
                                                                top: "calc(100% + 8px)",
                                                                left: "50%",
                                                                transform: "translateX(-50%)",
                                                                backgroundColor: "#1a1a2e",
                                                                color: "#ffffff",
                                                                fontSize: "12px",
                                                                fontWeight: "600",
                                                                padding: "6px 12px",
                                                                borderRadius: "8px",
                                                                whiteSpace: "nowrap",
                                                                zIndex: 10,
                                                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                                                            },
                                                            children: [
                                                                "Premium feature — upgrade to unlock",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        position: "absolute",
                                                                        top: "-5px",
                                                                        left: "50%",
                                                                        transform: "translateX(-50%) rotate(45deg)",
                                                                        width: "10px",
                                                                        height: "10px",
                                                                        backgroundColor: "#1a1a2e"
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 611,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 609,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true)
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 591,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontSize: "13px",
                                                    color: "#4a6fa5",
                                                    margin: "10px 0 0 0",
                                                    textAlign: "center",
                                                    fontStyle: "italic"
                                                },
                                                children: loadingInterviewGenerate ? "Building your scenario and preparing questions..." : "A 4-question mock interview with a live scenario, per-answer feedback, and a final performance debrief."
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 617,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true),
                                    !isPaid && questionsUsed !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontSize: "12px",
                                            color: questionsUsed >= 4 ? "#d97706" : "#4a6fa5",
                                            margin: "8px 0 0 0",
                                            textAlign: "center",
                                            fontStyle: "italic"
                                        },
                                        children: [
                                            questionsUsed,
                                            " of 5 free questions used today"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/Questions.js",
                                        lineNumber: 626,
                                        columnNumber: 15
                                    }, this),
                                    !interviewModeOn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                        children: [
                                            timerOn && question && !question.includes("Come back tomorrow") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: timerStarted && !isPaused && !graded && timeLeft > 0 ? timeLeft < 30 ? "timer-bar-urgent" : "timer-bar-pulsing" : "",
                                                style: {
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    flexWrap: "wrap",
                                                    gap: "8px",
                                                    padding: "10px 16px",
                                                    borderRadius: "8px",
                                                    marginTop: "16px",
                                                    backgroundColor: !timerStarted ? "#e8f4f8" : graded && timeLeft > 0 ? "#f0fdf4" : timeLeft === 0 ? "#fee2e2" : timeLeft < 30 ? "#fff7ed" : "#e8f4f8",
                                                    border: `1px solid ${!timerStarted ? "#a8d4e0" : graded && timeLeft > 0 ? "#86efac" : timeLeft === 0 ? "#fca5a5" : timeLeft < 30 ? "#fed7aa" : "#a8d4e0"}`
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: "11px",
                                                            fontWeight: "700",
                                                            color: "#0e7490",
                                                            letterSpacing: "1px"
                                                        },
                                                        children: "TIMER"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 644,
                                                        columnNumber: 21
                                                    }, this),
                                                    !timerStarted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "10px"
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "6px"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>setCustomTimeSec((prev)=>Math.max(30, prev - 30)),
                                                                        className: "timer-step-btn",
                                                                        children: "−"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 648,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontSize: "15px",
                                                                            fontWeight: "700",
                                                                            fontFamily: "monospace",
                                                                            color: "#0e7490",
                                                                            minWidth: "38px",
                                                                            textAlign: "center"
                                                                        },
                                                                        children: formatTime(customTimeSec)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 649,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>setCustomTimeSec((prev)=>Math.min(600, prev + 30)),
                                                                        className: "timer-step-btn",
                                                                        children: "+"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 650,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 647,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>{
                                                                    setTimerStarted(true);
                                                                    startTimer();
                                                                },
                                                                className: "start-answering-btn",
                                                                children: "Start Answering"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 652,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 646,
                                                        columnNumber: 23
                                                    }, this) : timeLeft === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: "16px",
                                                            fontWeight: "700",
                                                            fontFamily: "monospace",
                                                            color: "#dc2626"
                                                        },
                                                        children: "Time's up!"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 655,
                                                        columnNumber: 23
                                                    }, this) : graded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: "16px",
                                                            fontWeight: "700",
                                                            fontFamily: "monospace",
                                                            color: "#0e7490"
                                                        },
                                                        children: [
                                                            formatTime(timeLeft),
                                                            " remaining"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 657,
                                                        columnNumber: 23
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "8px"
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                onClick: isPaused ? resumeTimer : pauseTimer,
                                                                disabled: loadingAnswer || loadingFeedback,
                                                                className: isPaused ? "timer-resume-btn" : "timer-pause-btn",
                                                                children: isPaused ? "Resume" : "Pause"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 660,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: "16px",
                                                                    fontWeight: "700",
                                                                    fontFamily: "monospace",
                                                                    color: timeLeft < 30 ? "#d97706" : "#0e7490",
                                                                    opacity: isPaused ? 0.5 : 1
                                                                },
                                                                children: formatTime(timeLeft)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 661,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 659,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 636,
                                                columnNumber: 19
                                            }, this),
                                            question && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.section,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: styles.label,
                                                        children: "QUESTION"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 669,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: styles.text,
                                                        children: question
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 670,
                                                        columnNumber: 21
                                                    }, this),
                                                    !question.includes("Come back tomorrow") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginTop: "20px"
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                style: {
                                                                    ...styles.label,
                                                                    marginBottom: "8px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "8px"
                                                                },
                                                                children: [
                                                                    "YOUR ANSWER",
                                                                    isPaid ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PremiumBadge$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                        small: true
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 676,
                                                                        columnNumber: 37
                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontSize: "11px",
                                                                            fontWeight: "700",
                                                                            letterSpacing: "0.8px",
                                                                            padding: "3px 8px",
                                                                            borderRadius: "20px",
                                                                            backgroundColor: "#e8edf5",
                                                                            color: "#4a6fa5"
                                                                        },
                                                                        children: "PREMIUM"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 676,
                                                                        columnNumber: 62
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 674,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("textarea", {
                                                                placeholder: isPaid ? "Type your answer here to get AI feedback..." : "Upgrade to Premium to get AI feedback on your answers",
                                                                value: userAnswer,
                                                                onChange: (e)=>isPaid && !(timerOn && (!timerStarted || timeLeft === 0 || graded)) && setUserAnswer(e.target.value),
                                                                disabled: !isPaid || timerOn && (!timerStarted || timeLeft === 0 || graded),
                                                                style: {
                                                                    width: "100%",
                                                                    minHeight: "120px",
                                                                    padding: "12px 16px",
                                                                    borderRadius: "8px",
                                                                    border: "2px solid #e8edf5",
                                                                    fontSize: "14px",
                                                                    color: isPaid ? "#1a1a2e" : "#a0aec0",
                                                                    fontFamily: "'Segoe UI', sans-serif",
                                                                    boxSizing: "border-box",
                                                                    outline: "none",
                                                                    backgroundColor: isPaid ? "#ffffff" : "#f7f9fc",
                                                                    cursor: isPaid ? "text" : "not-allowed",
                                                                    resize: "vertical"
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 678,
                                                                columnNumber: 25
                                                            }, this),
                                                            isPaid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                onClick: handleGrade,
                                                                disabled: loadingFeedback || !userAnswer.trim() || graded || timerOn && !timerStarted,
                                                                className: "secondary-btn",
                                                                style: {
                                                                    marginTop: "12px"
                                                                },
                                                                children: loadingFeedback ? "Grading..." : graded ? "Graded ✓" : "Grade My Answer"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 691,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 673,
                                                        columnNumber: 23
                                                    }, this),
                                                    feedback && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginTop: "20px",
                                                            padding: "16px",
                                                            backgroundColor: "#f0f4f8",
                                                            borderRadius: "8px",
                                                            borderLeft: `4px solid ${score !== null ? getScoreColor(score) : "#0a2463"}`
                                                        },
                                                        children: [
                                                            score !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "12px",
                                                                    marginBottom: "14px"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            width: "48px",
                                                                            height: "48px",
                                                                            borderRadius: "50%",
                                                                            backgroundColor: getScoreBg(score),
                                                                            border: `2px solid ${getScoreColor(score)}`,
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            flexShrink: 0
                                                                        },
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                fontSize: "18px",
                                                                                fontWeight: "700",
                                                                                color: getScoreColor(score)
                                                                            },
                                                                            children: score
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/Questions.js",
                                                                            lineNumber: 703,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 702,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                                style: {
                                                                                    fontSize: "11px",
                                                                                    fontWeight: "700",
                                                                                    color: "#4a6fa5",
                                                                                    letterSpacing: "1px",
                                                                                    margin: "0 0 2px 0"
                                                                                },
                                                                                children: "SCORE"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/Questions.js",
                                                                                lineNumber: 706,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                                style: {
                                                                                    fontSize: "13px",
                                                                                    fontWeight: "600",
                                                                                    color: "#1a1a2e",
                                                                                    margin: 0
                                                                                },
                                                                                children: [
                                                                                    score,
                                                                                    " / 10"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/Questions.js",
                                                                                lineNumber: 707,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 705,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 701,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                style: {
                                                                    ...styles.label,
                                                                    marginBottom: "8px"
                                                                },
                                                                children: "FEEDBACK"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 711,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                style: {
                                                                    fontSize: "14px",
                                                                    color: "#1a1a2e",
                                                                    lineHeight: "1.6",
                                                                    margin: 0
                                                                },
                                                                children: feedback
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 712,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 699,
                                                        columnNumber: 23
                                                    }, this),
                                                    question.includes("Come back tomorrow") ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        className: "upgrade-btn upgrade-btn-offset",
                                                        onClick: handleUpgrade,
                                                        style: {
                                                            width: "100%",
                                                            display: "block",
                                                            marginTop: "16px"
                                                        },
                                                        children: [
                                                            "⭐ Upgrade for ",
                                                            price || "$3/month"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 717,
                                                        columnNumber: 23
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: getAnswer,
                                                        disabled: loadingQuestion || loadingAnswer || answerRevealed || timerOn && !graded,
                                                        className: "secondary-btn",
                                                        children: loadingAnswer ? "Loading..." : "Show Answer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 719,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 668,
                                                columnNumber: 19
                                            }, this),
                                            !question.includes("Come back tomorrow") && answerRevealed && answer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.section,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: styles.label,
                                                        children: "ANSWER"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 728,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2d$markdown__$5b$external$5d$__$28$react$2d$markdown$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$react$2d$markdown$29$__["default"], {
                                                        className: "markdown",
                                                        children: answer
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 729,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 727,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true),
                                    interviewModeOn && interviewSession && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.section,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    backgroundColor: "#0a2463",
                                                    borderRadius: "10px",
                                                    padding: "16px 20px",
                                                    marginBottom: "24px"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            fontSize: "11px",
                                                            fontWeight: "700",
                                                            color: "#a8c4e8",
                                                            letterSpacing: "1.2px",
                                                            margin: "0 0 8px 0"
                                                        },
                                                        children: "SCENARIO"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 740,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            fontSize: "14px",
                                                            color: "#ffffff",
                                                            lineHeight: "1.7",
                                                            margin: 0
                                                        },
                                                        children: interviewSession.scenario
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 741,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 739,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    marginBottom: "20px"
                                                },
                                                children: [
                                                    interviewSession.questions.map((_, i)=>{
                                                        const done = i < interviewStep || interviewComplete;
                                                        const current = i === interviewStep && !interviewComplete;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                flex: 1,
                                                                height: "4px",
                                                                borderRadius: "2px",
                                                                backgroundColor: done ? "#0a2463" : current ? "#4a6fa5" : "#e8edf5",
                                                                transition: "background-color 0.3s"
                                                            }
                                                        }, i, false, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 750,
                                                            columnNumber: 23
                                                        }, this);
                                                    }),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: "11px",
                                                            color: "#4a6fa5",
                                                            fontWeight: "700",
                                                            flexShrink: 0,
                                                            marginLeft: "4px"
                                                        },
                                                        children: interviewComplete ? "Complete" : `Q${interviewStep + 1} of ${INTERVIEW_QUESTIONS}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 753,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 745,
                                                columnNumber: 17
                                            }, this),
                                            interviewUserAnswers.map((ans, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        marginBottom: "20px",
                                                        borderTop: i > 0 ? "2.5px solid #e8edf5" : "none",
                                                        paddingTop: i > 0 ? "20px" : "0"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                borderLeft: "3px solid #0a2463",
                                                                paddingLeft: "14px",
                                                                marginBottom: "10px"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                    style: {
                                                                        fontSize: "11px",
                                                                        fontWeight: "700",
                                                                        color: "#4a6fa5",
                                                                        letterSpacing: "1px",
                                                                        margin: "0 0 6px 0"
                                                                    },
                                                                    children: [
                                                                        "QUESTION ",
                                                                        i + 1
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 762,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                    style: {
                                                                        fontSize: "14px",
                                                                        color: "#1a1a2e",
                                                                        lineHeight: "1.6",
                                                                        margin: 0,
                                                                        fontWeight: "500"
                                                                    },
                                                                    children: interviewSession.questions[i].question
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 763,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 761,
                                                            columnNumber: 21
                                                        }, this),
                                                        interviewTimesLeft[i] !== null && interviewTimesLeft[i] !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                padding: "8px 14px",
                                                                borderRadius: "8px",
                                                                marginBottom: "8px",
                                                                backgroundColor: interviewTimesLeft[i] === 0 ? "#fee2e2" : interviewTimesLeft[i] < 30 ? "#fff7ed" : "#e8f4f8",
                                                                border: `1px solid ${interviewTimesLeft[i] === 0 ? "#fca5a5" : interviewTimesLeft[i] < 30 ? "#fed7aa" : "#a8d4e0"}`
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: "11px",
                                                                        fontWeight: "700",
                                                                        color: "#0e7490",
                                                                        letterSpacing: "1px"
                                                                    },
                                                                    children: [
                                                                        "TIMER — Q",
                                                                        i + 1
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 767,
                                                                    columnNumber: 25
                                                                }, this),
                                                                interviewTimesLeft[i] === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: "13px",
                                                                        fontWeight: "700",
                                                                        fontFamily: "monospace",
                                                                        color: "#dc2626"
                                                                    },
                                                                    children: "Time's up!"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 769,
                                                                    columnNumber: 29
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: "13px",
                                                                        fontWeight: "700",
                                                                        fontFamily: "monospace",
                                                                        color: interviewTimesLeft[i] < 30 ? "#d97706" : "#0e7490"
                                                                    },
                                                                    children: [
                                                                        formatTime(interviewTimesLeft[i]),
                                                                        " left"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 770,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 766,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                backgroundColor: "#f7f9fc",
                                                                borderRadius: "8px",
                                                                padding: "12px 14px",
                                                                marginBottom: "8px",
                                                                border: "1px solid #e8edf5"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                    style: {
                                                                        fontSize: "11px",
                                                                        fontWeight: "700",
                                                                        color: "#4a6fa5",
                                                                        letterSpacing: "1px",
                                                                        margin: "0 0 4px 0"
                                                                    },
                                                                    children: "YOUR ANSWER"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 775,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                    style: {
                                                                        fontSize: "13px",
                                                                        color: "#1a1a2e",
                                                                        lineHeight: "1.5",
                                                                        margin: 0
                                                                    },
                                                                    children: ans
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 776,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 774,
                                                            columnNumber: 21
                                                        }, this),
                                                        interviewResponses[i] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                backgroundColor: interviewResponses[i].onTrack ? "#f0fdf4" : "#fff7ed",
                                                                borderRadius: "8px",
                                                                padding: "12px 14px",
                                                                borderLeft: `3px solid ${interviewResponses[i].onTrack ? "#16a34a" : "#d97706"}`,
                                                                display: "flex",
                                                                gap: "10px",
                                                                alignItems: "flex-start"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        flexShrink: 0,
                                                                        width: "32px",
                                                                        height: "32px",
                                                                        borderRadius: "50%",
                                                                        backgroundColor: getScoreBg(interviewResponses[i].score),
                                                                        border: `2px solid ${getScoreColor(interviewResponses[i].score)}`,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center"
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontSize: "12px",
                                                                            fontWeight: "700",
                                                                            color: getScoreColor(interviewResponses[i].score)
                                                                        },
                                                                        children: interviewResponses[i].score
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 781,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 780,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                    style: {
                                                                        fontSize: "13px",
                                                                        color: "#1a1a2e",
                                                                        lineHeight: "1.6",
                                                                        margin: 0
                                                                    },
                                                                    children: interviewResponses[i].response
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 783,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 779,
                                                            columnNumber: 23
                                                        }, this),
                                                        interviewAnswersRevealed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                marginTop: "8px",
                                                                backgroundColor: "#e8edf5",
                                                                borderRadius: "8px",
                                                                padding: "12px 14px",
                                                                border: "1px solid #c8d4e8"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                    style: {
                                                                        fontSize: "11px",
                                                                        fontWeight: "700",
                                                                        color: "#0a2463",
                                                                        letterSpacing: "1px",
                                                                        margin: "0 0 4px 0"
                                                                    },
                                                                    children: "IDEAL ANSWER"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 789,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                    style: {
                                                                        fontSize: "13px",
                                                                        color: "#1a1a2e",
                                                                        lineHeight: "1.6",
                                                                        margin: 0
                                                                    },
                                                                    children: interviewSession.questions[i].idealAnswer
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 790,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 788,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/src/Questions.js",
                                                    lineNumber: 760,
                                                    columnNumber: 19
                                                }, this)),
                                            !interviewComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    borderTop: interviewUserAnswers.length > 0 ? "2.5px solid #e8edf5" : "none",
                                                    paddingTop: interviewUserAnswers.length > 0 ? "20px" : "0"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            borderLeft: "3px solid #4a6fa5",
                                                            paddingLeft: "14px",
                                                            marginBottom: "14px"
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                style: {
                                                                    fontSize: "11px",
                                                                    fontWeight: "700",
                                                                    color: "#4a6fa5",
                                                                    letterSpacing: "1px",
                                                                    margin: "0 0 6px 0"
                                                                },
                                                                children: [
                                                                    "QUESTION ",
                                                                    interviewStep + 1
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 800,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                style: {
                                                                    fontSize: "15px",
                                                                    color: "#1a1a2e",
                                                                    lineHeight: "1.6",
                                                                    margin: 0,
                                                                    fontWeight: "500"
                                                                },
                                                                children: interviewSession.questions[interviewStep].question
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 801,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 799,
                                                        columnNumber: 21
                                                    }, this),
                                                    timerOn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: interviewTimerStarted && !interviewTimerPaused && interviewTimeLeft > 0 ? interviewTimeLeft < 30 ? "timer-bar-urgent" : "timer-bar-pulsing" : "",
                                                        style: {
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            flexWrap: "wrap",
                                                            gap: "8px",
                                                            padding: "10px 16px",
                                                            borderRadius: "8px",
                                                            marginBottom: "12px",
                                                            backgroundColor: !interviewTimerStarted ? "#e8f4f8" : interviewTimeLeft === 0 ? "#fee2e2" : interviewTimeLeft < 30 ? "#fff7ed" : "#e8f4f8",
                                                            border: `1px solid ${!interviewTimerStarted ? "#a8d4e0" : interviewTimeLeft === 0 ? "#fca5a5" : interviewTimeLeft < 30 ? "#fed7aa" : "#a8d4e0"}`
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: "11px",
                                                                    fontWeight: "700",
                                                                    color: "#0e7490",
                                                                    letterSpacing: "1px"
                                                                },
                                                                children: [
                                                                    "TIMER — Q",
                                                                    interviewStep + 1,
                                                                    " of ",
                                                                    INTERVIEW_QUESTIONS
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 814,
                                                                columnNumber: 23
                                                            }, this),
                                                            !interviewTimerStarted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "10px"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: "6px"
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                                onClick: ()=>setInterviewCustomTime((prev)=>Math.max(30, prev - 30)),
                                                                                className: "timer-step-btn",
                                                                                children: "−"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/Questions.js",
                                                                                lineNumber: 820,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                style: {
                                                                                    fontSize: "15px",
                                                                                    fontWeight: "700",
                                                                                    fontFamily: "monospace",
                                                                                    color: "#0e7490",
                                                                                    minWidth: "38px",
                                                                                    textAlign: "center"
                                                                                },
                                                                                children: formatTime(interviewCustomTime)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/Questions.js",
                                                                                lineNumber: 821,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                                onClick: ()=>setInterviewCustomTime((prev)=>Math.min(600, prev + 30)),
                                                                                className: "timer-step-btn",
                                                                                children: "+"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/Questions.js",
                                                                                lineNumber: 822,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 819,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                        onClick: startInterviewTimer,
                                                                        className: "start-answering-btn",
                                                                        children: "Start Answering"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 824,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 818,
                                                                columnNumber: 25
                                                            }, this) : interviewTimeLeft === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: "16px",
                                                                    fontWeight: "700",
                                                                    fontFamily: "monospace",
                                                                    color: "#dc2626"
                                                                },
                                                                children: "Time's up!"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 827,
                                                                columnNumber: 25
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "8px"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                        onClick: interviewTimerPaused ? resumeInterviewTimer : pauseInterviewTimer,
                                                                        disabled: loadingInterviewRespond,
                                                                        className: interviewTimerPaused ? "timer-resume-btn" : "timer-pause-btn",
                                                                        children: interviewTimerPaused ? "Resume" : "Pause"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 830,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontSize: "16px",
                                                                            fontWeight: "700",
                                                                            fontFamily: "monospace",
                                                                            color: interviewTimeLeft < 30 ? "#d97706" : "#0e7490",
                                                                            opacity: interviewTimerPaused ? 0.5 : 1
                                                                        },
                                                                        children: formatTime(interviewTimeLeft)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 831,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 829,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 806,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("textarea", {
                                                        placeholder: "Type your response...",
                                                        value: interviewCurrentAnswer,
                                                        onChange: (e)=>!loadingInterviewRespond && setInterviewCurrentAnswer(e.target.value),
                                                        disabled: loadingInterviewRespond || interviewTimeLeft === 0 || timerOn && !interviewTimerStarted,
                                                        style: {
                                                            width: "100%",
                                                            minHeight: "120px",
                                                            padding: "12px 16px",
                                                            borderRadius: "8px",
                                                            border: "2px solid #e8edf5",
                                                            fontSize: "14px",
                                                            color: "#1a1a2e",
                                                            fontFamily: "'Segoe UI', sans-serif",
                                                            boxSizing: "border-box",
                                                            outline: "none",
                                                            backgroundColor: "#ffffff",
                                                            resize: "vertical"
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 837,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: handleInterviewSubmit,
                                                        disabled: loadingInterviewRespond,
                                                        className: "primary-btn",
                                                        style: {
                                                            marginTop: "12px"
                                                        },
                                                        children: loadingInterviewRespond ? "Analyzing..." : interviewStep === INTERVIEW_QUESTIONS - 1 ? "Submit Final Answer" : "Submit Answer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 849,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 798,
                                                columnNumber: 19
                                            }, this),
                                            interviewComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: "8px"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        borderTop: "2px solid #e8edf5",
                                                        paddingTop: "20px",
                                                        marginTop: "8px"
                                                    },
                                                    children: [
                                                        interviewOverallScore !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "16px",
                                                                marginBottom: "20px",
                                                                backgroundColor: "#f0f4f8",
                                                                borderRadius: "10px",
                                                                padding: "16px"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        width: "56px",
                                                                        height: "56px",
                                                                        borderRadius: "50%",
                                                                        backgroundColor: getScoreBg(interviewOverallScore),
                                                                        border: `2px solid ${getScoreColor(interviewOverallScore)}`,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        flexShrink: 0
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontSize: "20px",
                                                                            fontWeight: "700",
                                                                            color: getScoreColor(interviewOverallScore)
                                                                        },
                                                                        children: interviewOverallScore
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 868,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 867,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                            style: {
                                                                                fontSize: "15px",
                                                                                fontWeight: "700",
                                                                                color: "#4a6fa5",
                                                                                letterSpacing: "1px",
                                                                                margin: "0 0 2px 0"
                                                                            },
                                                                            children: "OVERALL SCORE"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/Questions.js",
                                                                            lineNumber: 871,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                            style: {
                                                                                fontSize: "11px",
                                                                                fontWeight: "600",
                                                                                color: "#1a1a2e",
                                                                                margin: 0
                                                                            },
                                                                            children: [
                                                                                interviewOverallScore,
                                                                                " / 10 — average across ",
                                                                                INTERVIEW_QUESTIONS,
                                                                                " questions"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/Questions.js",
                                                                            lineNumber: 872,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 870,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 866,
                                                            columnNumber: 25
                                                        }, this),
                                                        !interviewDebrief && !loadingDebrief && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                            onClick: handleInterviewDebrief,
                                                            className: "secondary-btn",
                                                            style: {
                                                                marginBottom: "12px"
                                                            },
                                                            children: "Get Full Debrief"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 879,
                                                            columnNumber: 25
                                                        }, this),
                                                        loadingDebrief && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                            style: {
                                                                fontSize: "14px",
                                                                color: "#4a6fa5",
                                                                margin: "0 0 12px 0"
                                                            },
                                                            children: "Generating debrief..."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 883,
                                                            columnNumber: 42
                                                        }, this),
                                                        interviewDebrief && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                backgroundColor: "#f0f4f8",
                                                                borderRadius: "8px",
                                                                padding: "16px",
                                                                borderLeft: "4px solid #0a2463",
                                                                marginBottom: "16px"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                    style: {
                                                                        ...styles.label,
                                                                        marginBottom: "8px"
                                                                    },
                                                                    children: "DEBRIEF"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 886,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                                    style: {
                                                                        fontSize: "14px",
                                                                        color: "#1a1a2e",
                                                                        lineHeight: "1.6",
                                                                        margin: 0
                                                                    },
                                                                    children: interviewDebrief
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 887,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 885,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setInterviewAnswersRevealed(!interviewAnswersRevealed),
                                                            className: "secondary-btn",
                                                            children: interviewAnswersRevealed ? "Hide Ideal Answers" : "Show Ideal Answers"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 892,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/Questions.js",
                                                    lineNumber: 863,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 862,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/Questions.js",
                                        lineNumber: 737,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/Questions.js",
                                lineNumber: 496,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/Questions.js",
                        lineNumber: 478,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/Questions.js",
                    lineNumber: 473,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/Questions.js",
                lineNumber: 472,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                style: {
                    textAlign: "center",
                    fontSize: "12px",
                    color: "#4a6fa5",
                    marginTop: "40px",
                    marginBottom: "12px",
                    fontStyle: "italic"
                },
                children: [
                    "For help, contact ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                        href: "mailto:support@fitefinance.com",
                        style: {
                            color: "#4a6fa5"
                        },
                        children: "support@fitefinance.com"
                    }, void 0, false, {
                        fileName: "[project]/src/Questions.js",
                        lineNumber: 909,
                        columnNumber: 27
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/Questions.js",
                lineNumber: 908,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                style: {
                    textAlign: "center",
                    fontSize: "11px",
                    color: "#4a6fa5",
                    marginTop: "12px",
                    marginBottom: "12px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/privacy",
                        style: {
                            color: "#4a6fa5"
                        },
                        children: "Privacy Policy"
                    }, void 0, false, {
                        fileName: "[project]/src/Questions.js",
                        lineNumber: 912,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: "25px",
                            verticalAlign: "middle"
                        },
                        children: " · "
                    }, void 0, false, {
                        fileName: "[project]/src/Questions.js",
                        lineNumber: 913,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/terms",
                        style: {
                            color: "#4a6fa5"
                        },
                        children: "Terms of Service"
                    }, void 0, false, {
                        fileName: "[project]/src/Questions.js",
                        lineNumber: 914,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: "25px",
                            verticalAlign: "middle"
                        },
                        children: " · "
                    }, void 0, false, {
                        fileName: "[project]/src/Questions.js",
                        lineNumber: 915,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/refunds",
                        style: {
                            color: "#4a6fa5"
                        },
                        children: "Refund Policy"
                    }, void 0, false, {
                        fileName: "[project]/src/Questions.js",
                        lineNumber: 916,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/Questions.js",
                lineNumber: 911,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                className: "byline-bottom",
                style: {
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#5a060d",
                    fontFamily: "'Snell Roundhand', cursive",
                    wordSpacing: "2px",
                    marginTop: "4px",
                    marginBottom: "12px",
                    display: "none"
                },
                children: "by Colgate's finest"
            }, void 0, false, {
                fileName: "[project]/src/Questions.js",
                lineNumber: 918,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/Questions.js",
        lineNumber: 471,
        columnNumber: 5
    }, this);
}
const styles = {
    page: {
        minHeight: "100vh",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "80px 20px 40px 20px",
        fontFamily: "'Segoe UI', sans-serif"
    },
    container: {
        width: "100%"
    },
    logo: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#0a2463",
        margin: "0 0 6px 0",
        cursor: "default"
    },
    tagline: {
        fontSize: "15px",
        color: "#4a6fa5",
        margin: 0,
        cursor: "default"
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "36px",
        boxShadow: "0 2px 16px rgba(10, 36, 99, 0.08)"
    },
    categoryHeader: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        marginBottom: "24px"
    },
    categoryLabel: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#0a2463",
        margin: 0
    },
    section: {
        marginTop: "28px",
        borderTop: "1px solid #e8edf5",
        paddingTop: "24px"
    },
    label: {
        fontSize: "11px",
        fontWeight: "700",
        color: "#4a6fa5",
        letterSpacing: "1.2px",
        margin: "0 0 10px 0"
    },
    text: {
        fontSize: "16px",
        color: "#1a1a2e",
        lineHeight: "1.7",
        margin: 0
    },
    mathBadge: {
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "0.8px",
        padding: "4px 10px",
        borderRadius: "20px"
    }
};
const __TURBOPACK__default__export__ = Questions;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/pages/questions/[category]/[difficulty]/[math]/index.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "getServerSideProps",
    ()=>getServerSideProps
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Questions$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Questions.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Questions$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Questions$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Questions$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"];
const getServerSideProps = async (ctx)=>({
        props: {
            ...ctx.params
        }
    });
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__11bfutw._.js.map