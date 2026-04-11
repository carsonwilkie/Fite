module.exports = [
"[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react/jsx-dev-runtime", () => require("react/jsx-dev-runtime"));

module.exports = mod;
}),
"[project]/src/PaidStatusContext.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "PaidStatusProvider",
    ()=>PaidStatusProvider,
    "usePaidStatusContext",
    ()=>usePaidStatusContext
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__ = __turbopack_context__.i("[externals]/@clerk/clerk-react [external] (@clerk/clerk-react, esm_import, [project]/node_modules/@clerk/clerk-react)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const PaidStatusContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["createContext"])({
    isPaid: false,
    loading: true
});
function PaidStatusProvider({ children }) {
    const { user, isLoaded } = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__["useUser"])();
    const [isPaid, setIsPaid] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (!isLoaded) return;
        if (!user) {
            setIsPaid(false);
            localStorage.setItem("isPaid", "false");
            setLoading(false);
            return;
        }
        fetch("/api/checkPaid", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user.id
            })
        }).then((res)=>res.json()).then((data)=>{
            setIsPaid(data.isPaid);
            localStorage.setItem("isPaid", data.isPaid);
            setLoading(false);
        }).catch(()=>setLoading(false));
    }, [
        user,
        isLoaded
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(PaidStatusContext.Provider, {
        value: {
            isPaid,
            loading
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/PaidStatusContext.js",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
function usePaidStatusContext() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useContext"])(PaidStatusContext);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/usePaidStatus.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>usePaidStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PaidStatusContext$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/PaidStatusContext.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PaidStatusContext$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PaidStatusContext$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function usePaidStatus() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PaidStatusContext$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["usePaidStatusContext"])();
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/useUpgrade.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>useUpgrade
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__ = __turbopack_context__.i("[externals]/@clerk/clerk-react [external] (@clerk/clerk-react, esm_import, [project]/node_modules/@clerk/clerk-react)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function useUpgrade() {
    const { user } = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__["useUser"])();
    const { openSignIn } = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__["useClerk"])();
    return async function handleUpgrade() {
        if (!user?.id) {
            openSignIn();
            return;
        }
        const res = await fetch("/api/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user.id,
                email: user.primaryEmailAddress?.emailAddress
            })
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/react-dom [external] (react-dom, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react-dom", () => require("react-dom"));

module.exports = mod;
}),
"[project]/src/Navbar.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__ = __turbopack_context__.i("[externals]/@clerk/clerk-react [external] (@clerk/clerk-react, esm_import, [project]/node_modules/@clerk/clerk-react)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePaidStatus$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/usePaidStatus.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$useUpgrade$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/useUpgrade.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePaidStatus$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$useUpgrade$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePaidStatus$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$useUpgrade$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
function Navbar() {
    const { user } = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__["useUser"])();
    const { isPaid } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePaidStatus$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const handleUpgrade = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$useUpgrade$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"])();
    const [showHistoryTooltip, setShowHistoryTooltip] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const showTooltip = ()=>{
        setShowHistoryTooltip(true);
        setTimeout(()=>setShowHistoryTooltip(false), 2500);
    };
    const handleManageSubscription = async ()=>{
        const res = await fetch("/api/portal", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user?.id
            })
        });
        const data = await res.json();
        if (data.url) {
            window.location.href = data.url;
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: styles.navbar,
        className: "navbar-fixed navbar-transparent",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "byline-fixed",
                style: {
                    ...styles.byline,
                    pointerEvents: "auto"
                },
                children: "by Colgate's finest"
            }, void 0, false, {
                fileName: "[project]/src/Navbar.js",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    pointerEvents: "auto"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__["SignedOut"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: "12px"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: handleUpgrade,
                                    className: "upgrade-btn manage-sub-btn",
                                    style: {
                                        width: "auto",
                                        padding: "10px 20px"
                                    },
                                    children: "⭐ Upgrade to Premium"
                                }, void 0, false, {
                                    fileName: "[project]/src/Navbar.js",
                                    lineNumber: 36,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: "relative"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: showTooltip,
                                            className: "primary-btn manage-sub-btn",
                                            style: {
                                                width: "auto",
                                                padding: "10px 20px",
                                                opacity: 0.5,
                                                cursor: "not-allowed"
                                            },
                                            children: "History"
                                        }, void 0, false, {
                                            fileName: "[project]/src/Navbar.js",
                                            lineNumber: 40,
                                            columnNumber: 15
                                        }, this),
                                        showHistoryTooltip && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
                                                    fileName: "[project]/src/Navbar.js",
                                                    lineNumber: 46,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/Navbar.js",
                                            lineNumber: 44,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/Navbar.js",
                                    lineNumber: 39,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__["SignInButton"], {
                                    mode: "modal",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        className: "primary-btn manage-sub-btn",
                                        style: {
                                            width: "auto",
                                            padding: "10px 20px"
                                        },
                                        children: "Sign In"
                                    }, void 0, false, {
                                        fileName: "[project]/src/Navbar.js",
                                        lineNumber: 51,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/Navbar.js",
                                    lineNumber: 50,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/Navbar.js",
                            lineNumber: 35,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/Navbar.js",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__["SignedIn"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                gap: "12px"
                            },
                            children: [
                                isPaid ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: ()=>router.push("/history"),
                                            className: "primary-btn manage-sub-btn",
                                            style: {
                                                width: "auto",
                                                padding: "10px 20px"
                                            },
                                            children: "History"
                                        }, void 0, false, {
                                            fileName: "[project]/src/Navbar.js",
                                            lineNumber: 61,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: handleManageSubscription,
                                            className: "primary-btn manage-sub-btn",
                                            style: {
                                                width: "auto",
                                                padding: "10px 20px"
                                            },
                                            children: "Manage Subscription"
                                        }, void 0, false, {
                                            fileName: "[project]/src/Navbar.js",
                                            lineNumber: 64,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: handleUpgrade,
                                            className: "upgrade-btn manage-sub-btn",
                                            style: {
                                                width: "auto",
                                                padding: "10px 20px"
                                            },
                                            children: "⭐ Upgrade to Premium"
                                        }, void 0, false, {
                                            fileName: "[project]/src/Navbar.js",
                                            lineNumber: 70,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: {
                                                position: "relative"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                    onClick: showTooltip,
                                                    className: "primary-btn manage-sub-btn",
                                                    style: {
                                                        width: "auto",
                                                        padding: "10px 20px",
                                                        opacity: 0.5,
                                                        cursor: "not-allowed"
                                                    },
                                                    children: "History"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/Navbar.js",
                                                    lineNumber: 74,
                                                    columnNumber: 19
                                                }, this),
                                                showHistoryTooltip && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
                                                            fileName: "[project]/src/Navbar.js",
                                                            lineNumber: 80,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/Navbar.js",
                                                    lineNumber: 78,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/Navbar.js",
                                            lineNumber: 73,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__["UserButton"], {}, void 0, false, {
                                    fileName: "[project]/src/Navbar.js",
                                    lineNumber: 86,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/Navbar.js",
                            lineNumber: 58,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/Navbar.js",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/Navbar.js",
                lineNumber: 33,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/Navbar.js",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
const styles = {
    navbar: {
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: "60px",
        backgroundColor: "transparent",
        zIndex: 100
    },
    byline: {
        fontSize: "15px",
        fontWeight: "bold",
        color: "#5a060d",
        fontFamily: "'Snell Roundhand', cursive",
        wordSpacing: "2px",
        cursor: "default"
    }
};
const __TURBOPACK__default__export__ = Navbar;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/ScrollToTop.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
;
;
function ScrollToTop() {
    const { pathname } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        window.scrollTo(0, 0);
        document.documentElement.scrollTo(0, 0);
        document.body.scrollTo(0, 0);
    }, [
        pathname
    ]);
    return null;
}
const __TURBOPACK__default__export__ = ScrollToTop;
}),
"[project]/pages/_app.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>App
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__ = __turbopack_context__.i("[externals]/@clerk/clerk-react [external] (@clerk/clerk-react, esm_import, [project]/node_modules/@clerk/clerk-react)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$analytics$2f$react__$5b$external$5d$__$2840$vercel$2f$analytics$2f$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$vercel$2f$analytics$29$__ = __turbopack_context__.i("[externals]/@vercel/analytics/react [external] (@vercel/analytics/react, esm_import, [project]/node_modules/@vercel/analytics)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$speed$2d$insights$2f$react__$5b$external$5d$__$2840$vercel$2f$speed$2d$insights$2f$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$vercel$2f$speed$2d$insights$29$__ = __turbopack_context__.i("[externals]/@vercel/speed-insights/react [external] (@vercel/speed-insights/react, esm_import, [project]/node_modules/@vercel/speed-insights)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PaidStatusContext$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/PaidStatusContext.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Navbar$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Navbar.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ScrollToTop$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ScrollToTop.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$analytics$2f$react__$5b$external$5d$__$2840$vercel$2f$analytics$2f$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$vercel$2f$analytics$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$speed$2d$insights$2f$react__$5b$external$5d$__$2840$vercel$2f$speed$2d$insights$2f$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$vercel$2f$speed$2d$insights$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PaidStatusContext$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Navbar$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$analytics$2f$react__$5b$external$5d$__$2840$vercel$2f$analytics$2f$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$vercel$2f$analytics$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$speed$2d$insights$2f$react__$5b$external$5d$__$2840$vercel$2f$speed$2d$insights$2f$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$vercel$2f$speed$2d$insights$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PaidStatusContext$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Navbar$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
const PUBLISHABLE_KEY = ("TURBOPACK compile-time value", "pk_live_Y2xlcmsuZml0ZWZpbmFuY2UuY29tJA");
function App({ Component, pageProps }) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$clerk$2f$clerk$2d$react__$5b$external$5d$__$2840$clerk$2f$clerk$2d$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$29$__["ClerkProvider"], {
        publishableKey: PUBLISHABLE_KEY,
        ...pageProps,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PaidStatusContext$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["PaidStatusProvider"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$analytics$2f$react__$5b$external$5d$__$2840$vercel$2f$analytics$2f$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$vercel$2f$analytics$29$__["Analytics"], {}, void 0, false, {
                    fileName: "[project]/pages/_app.js",
                    lineNumber: 20,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$speed$2d$insights$2f$react__$5b$external$5d$__$2840$vercel$2f$speed$2d$insights$2f$react$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$vercel$2f$speed$2d$insights$29$__["SpeedInsights"], {}, void 0, false, {
                    fileName: "[project]/pages/_app.js",
                    lineNumber: 21,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ScrollToTop$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/_app.js",
                    lineNumber: 22,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Navbar$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/pages/_app.js",
                    lineNumber: 23,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Component, {
                    ...pageProps
                }, void 0, false, {
                    fileName: "[project]/pages/_app.js",
                    lineNumber: 24,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/pages/_app.js",
            lineNumber: 19,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/pages/_app.js",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__00l9a0a._.js.map