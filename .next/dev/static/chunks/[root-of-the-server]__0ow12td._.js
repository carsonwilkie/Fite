(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime/runtime-types.d.ts" />
/// <reference path="../../../shared/runtime/dev-globals.d.ts" />
/// <reference path="../../../shared/runtime/dev-protocol.d.ts" />
/// <reference path="../../../shared/runtime/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_object_spread.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_sliced_to_array.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_to_consumable_array.js [client] (ecmascript)");
;
;
;
function connect(param) {
    var addMessageListener = param.addMessageListener, sendMessage = param.sendMessage, _param_onUpdateError = param.onUpdateError, onUpdateError = _param_onUpdateError === void 0 ? console.error : _param_onUpdateError;
    addMessageListener(function(msg) {
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(var i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    var queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: function push(param) {
            var _param = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(param, 2), chunkPath = _param[0], callback = _param[1];
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            for(var _iterator = queued[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                var _step_value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(_step.value, 2), chunkPath = _step_value[0], callback = _step_value[1];
                subscribeToChunkUpdate(chunkPath, sendMessage, callback);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
}
var updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])({
        type: 'turbopack-subscribe'
    }, resource));
    return function() {
        sendJSON(sendMessage, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])({
            type: 'turbopack-unsubscribe'
        }, resource));
    };
}
function handleSocketConnected(sendMessage) {
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = updateCallbackSets.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var key = _step.value;
            subscribeToUpdates(sendMessage, JSON.parse(key));
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
}
// we aggregate all pending updates until the issues are resolved
var chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    var key = resourceKey(msg.resource);
    var aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = chunkListsWithPendingUpdates.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var msg = _step.value;
            triggerUpdate(msg);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    var chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    var merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            var update = updateA.merged[0];
            for(var i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(var i1 = 0; i1 < updateB.merged.length; i1++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i1]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks: chunks,
        merged: merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    var chunks = {};
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = Object.entries(chunksA)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var _step_value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(_step.value, 2), chunkPath = _step_value[0], chunkUpdateA = _step_value[1];
            var chunkUpdateB = chunksB[chunkPath];
            if (chunkUpdateB != null) {
                var mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
                if (mergedUpdate != null) {
                    chunks[chunkPath] = mergedUpdate;
                }
            } else {
                chunks[chunkPath] = chunkUpdateA;
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
    try {
        for(var _iterator1 = Object.entries(chunksB)[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
            var _step_value1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(_step1.value, 2), chunkPath1 = _step_value1[0], chunkUpdateB1 = _step_value1[1];
            if (chunks[chunkPath1] == null) {
                chunks[chunkPath1] = chunkUpdateB1;
            }
        }
    } catch (err) {
        _didIteratorError1 = true;
        _iteratorError1 = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                _iterator1.return();
            }
        } finally{
            if (_didIteratorError1) {
                throw _iteratorError1;
            }
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateB.type === 'total') {
        // A total update replaces the entire chunk, so it supersedes any prior update.
        return updateB;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    var entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    var chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries: entries,
        chunks: chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])({}, entriesA, entriesB);
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    var chunks = {};
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = Object.entries(chunksA)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var _step_value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(_step.value, 2), chunkPath = _step_value[0], chunkUpdateA = _step_value[1];
            var chunkUpdateB = chunksB[chunkPath];
            if (chunkUpdateB != null) {
                var mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
                if (mergedUpdate != null) {
                    chunks[chunkPath] = mergedUpdate;
                }
            } else {
                chunks[chunkPath] = chunkUpdateA;
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
    try {
        for(var _iterator1 = Object.entries(chunksB)[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
            var _step_value1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(_step1.value, 2), chunkPath1 = _step_value1[0], chunkUpdateB1 = _step_value1[1];
            if (chunks[chunkPath1] == null) {
                chunks[chunkPath1] = chunkUpdateB1;
            }
        }
    } catch (err) {
        _didIteratorError1 = true;
        _iteratorError1 = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                _iterator1.return();
            }
        } finally{
            if (_didIteratorError1) {
                throw _iteratorError1;
            }
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        var _updateA_modules, _updateB_modules;
        var added = [];
        var deleted = [];
        var deletedModules = new Set((_updateA_modules = updateA.modules) !== null && _updateA_modules !== void 0 ? _updateA_modules : []);
        var addedModules = new Set((_updateB_modules = updateB.modules) !== null && _updateB_modules !== void 0 ? _updateB_modules : []);
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            for(var _iterator = addedModules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                var moduleId = _step.value;
                if (!deletedModules.has(moduleId)) {
                    added.push(moduleId);
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
        var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
        try {
            for(var _iterator1 = deletedModules[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
                var moduleId1 = _step1.value;
                if (!addedModules.has(moduleId1)) {
                    deleted.push(moduleId1);
                }
            }
        } catch (err) {
            _didIteratorError1 = true;
            _iteratorError1 = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                    _iterator1.return();
                }
            } finally{
                if (_didIteratorError1) {
                    throw _iteratorError1;
                }
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added: added,
            deleted: deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        var _updateA_added, _updateB_added, _updateA_deleted, _updateB_deleted;
        var added1 = new Set((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((_updateA_added = updateA.added) !== null && _updateA_added !== void 0 ? _updateA_added : []).concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((_updateB_added = updateB.added) !== null && _updateB_added !== void 0 ? _updateB_added : [])));
        var deleted1 = new Set((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((_updateA_deleted = updateA.deleted) !== null && _updateA_deleted !== void 0 ? _updateA_deleted : []).concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((_updateB_deleted = updateB.deleted) !== null && _updateB_deleted !== void 0 ? _updateB_deleted : [])));
        if (updateB.added != null) {
            var _iteratorNormalCompletion2 = true, _didIteratorError2 = false, _iteratorError2 = undefined;
            try {
                for(var _iterator2 = updateB.added[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true){
                    var moduleId2 = _step2.value;
                    deleted1.delete(moduleId2);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally{
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                        _iterator2.return();
                    }
                } finally{
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
        if (updateB.deleted != null) {
            var _iteratorNormalCompletion3 = true, _didIteratorError3 = false, _iteratorError3 = undefined;
            try {
                for(var _iterator3 = updateB.deleted[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true){
                    var moduleId3 = _step3.value;
                    added1.delete(moduleId3);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally{
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                        _iterator3.return();
                    }
                } finally{
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }
        return {
            type: 'partial',
            added: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(added1),
            deleted: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(deleted1)
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        var _updateA_modules1, _updateB_added1, _updateB_deleted1;
        var modules = new Set((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((_updateA_modules1 = updateA.modules) !== null && _updateA_modules1 !== void 0 ? _updateA_modules1 : []).concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((_updateB_added1 = updateB.added) !== null && _updateB_added1 !== void 0 ? _updateB_added1 : [])));
        var _iteratorNormalCompletion4 = true, _didIteratorError4 = false, _iteratorError4 = undefined;
        try {
            for(var _iterator4 = ((_updateB_deleted1 = updateB.deleted) !== null && _updateB_deleted1 !== void 0 ? _updateB_deleted1 : [])[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true){
                var moduleId4 = _step4.value;
                modules.delete(moduleId4);
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                    _iterator4.return();
                }
            } finally{
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
        }
        return {
            type: 'added',
            modules: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(modules)
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        var _updateB_modules1;
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        var modules1 = new Set((_updateB_modules1 = updateB.modules) !== null && _updateB_modules1 !== void 0 ? _updateB_modules1 : []);
        if (updateA.added != null) {
            var _iteratorNormalCompletion5 = true, _didIteratorError5 = false, _iteratorError5 = undefined;
            try {
                for(var _iterator5 = updateA.added[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true){
                    var moduleId5 = _step5.value;
                    modules1.delete(moduleId5);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally{
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
                        _iterator5.return();
                    }
                } finally{
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }
        }
        return {
            type: 'deleted',
            modules: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(modules1)
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error("Invariant: ".concat(message));
}
var CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    var aI = list.indexOf(a) + 1 || list.length;
    var bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
var chunksWithIssues = new Map();
function emitIssues() {
    var issues = [];
    var deduplicationSet = new Set();
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = chunksWithIssues[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var _step_value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(_step.value, 2), _ = _step_value[0], chunkIssues = _step_value[1];
            var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
            try {
                for(var _iterator1 = chunkIssues[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
                    var chunkIssue = _step1.value;
                    if (deduplicationSet.has(chunkIssue.formatted)) continue;
                    issues.push(chunkIssue);
                    deduplicationSet.add(chunkIssue.formatted);
                }
            } catch (err) {
                _didIteratorError1 = true;
                _iteratorError1 = err;
            } finally{
                try {
                    if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                        _iterator1.return();
                    }
                } finally{
                    if (_didIteratorError1) {
                        throw _iteratorError1;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    var key = resourceKey(msg.resource);
    var hasCriticalIssues = false;
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = msg.issues[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var issue = _step.value;
            if (CRITICAL.includes(issue.severity)) {
                hasCriticalIssues = true;
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
var SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
var CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort(function(a, b) {
        var first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
var hooks = {
    beforeRefresh: function beforeRefresh() {},
    refresh: function refresh() {},
    buildOk: function buildOk() {},
    issues: function issues(_issues) {}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            var runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    var key = resourceKey(resource);
    var callbackSet;
    var existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return function() {
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    var key = resourceKey(msg.resource);
    var callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = callbackSet.callbacks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var callback = _step.value;
            callback(msg);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally{
        try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
            }
        } finally{
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/src/PaidStatusContext.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PaidStatusProvider",
    ()=>PaidStatusProvider,
    "usePaidStatusContext",
    ()=>usePaidStatusContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_sliced_to_array.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_type_of.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/clerk-react/dist/index.mjs [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/shared/dist/runtime/react/index.mjs [client] (ecmascript)");
;
;
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
var PaidStatusContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createContext"])({
    isPaid: false,
    loading: true
});
function PaidStatusProvider(param) {
    var children = param.children;
    _s();
    var _useUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useUser"])(), user = _useUser.user, isLoaded = _useUser.isLoaded;
    var _useState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), isPaid = _useState[0], setIsPaid = _useState[1];
    var _useState1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true), 2), loading = _useState1[0], setLoading = _useState1[1];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PaidStatusProvider.useEffect": function() {
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
            }).then({
                "PaidStatusProvider.useEffect": function(res) {
                    return res.json();
                }
            }["PaidStatusProvider.useEffect"]).then({
                "PaidStatusProvider.useEffect": function(data) {
                    setIsPaid(data.isPaid);
                    localStorage.setItem("isPaid", data.isPaid);
                    setLoading(false);
                }
            }["PaidStatusProvider.useEffect"]).catch({
                "PaidStatusProvider.useEffect": function() {
                    return setLoading(false);
                }
            }["PaidStatusProvider.useEffect"]);
        }
    }["PaidStatusProvider.useEffect"], [
        user,
        isLoaded
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PaidStatusContext.Provider, {
        value: {
            isPaid: isPaid,
            loading: loading
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/PaidStatusContext.js",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_s(PaidStatusProvider, "1i9i76GpuXHm8NFYOQOAmU4ZBgc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useUser"]
    ];
});
_c = PaidStatusProvider;
function usePaidStatusContext() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(PaidStatusContext);
}
_s1(usePaidStatusContext, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "PaidStatusProvider");
if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(globalThis.$RefreshHelpers$) === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/usePaidStatus.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>usePaidStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_type_of.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PaidStatusContext$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/PaidStatusContext.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
function usePaidStatus() {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PaidStatusContext$2e$js__$5b$client$5d$__$28$ecmascript$29$__["usePaidStatusContext"])();
}
_s(usePaidStatus, "fQ+T4MBDEpocMnCotpt+AawGsmU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PaidStatusContext$2e$js__$5b$client$5d$__$28$ecmascript$29$__["usePaidStatusContext"]
    ];
});
if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(globalThis.$RefreshHelpers$) === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/usePrice.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>usePrice
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_sliced_to_array.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_type_of.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature();
;
function usePrice() {
    _s();
    var _useState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null), 2), price = _useState[0], setPrice = _useState[1];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePrice.useEffect": function() {
            fetch("/api/price").then({
                "usePrice.useEffect": function(res) {
                    return res.json();
                }
            }["usePrice.useEffect"]).then({
                "usePrice.useEffect": function(data) {
                    return setPrice("$".concat(data.amount, "/").concat(data.interval));
                }
            }["usePrice.useEffect"]);
        }
    }["usePrice.useEffect"], []);
    return price;
}
_s(usePrice, "62Jo7Iy5s88co3OObn+ySe3cK0U=");
if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(globalThis.$RefreshHelpers$) === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/useUpgrade.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>useUpgrade
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_async_to_generator.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_type_of.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__ = __turbopack_context__.i("[project]/node_modules/tslib/tslib.es6.mjs [client] (ecmascript) <export __generator as _>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/clerk-react/dist/index.mjs [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/shared/dist/runtime/react/index.mjs [client] (ecmascript)");
;
;
;
var _s = __turbopack_context__.k.signature();
;
function useUpgrade() {
    _s();
    var user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useUser"])().user;
    var openSignIn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useClerk"])().openSignIn;
    return function handleUpgrade() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(function() {
            var _user_primaryEmailAddress, res, data;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                switch(_state.label){
                    case 0:
                        if (!(user === null || user === void 0 ? void 0 : user.id)) {
                            openSignIn();
                            return [
                                2
                            ];
                        }
                        return [
                            4,
                            fetch("/api/checkout", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    userId: user.id,
                                    email: (_user_primaryEmailAddress = user.primaryEmailAddress) === null || _user_primaryEmailAddress === void 0 ? void 0 : _user_primaryEmailAddress.emailAddress
                                })
                            })
                        ];
                    case 1:
                        res = _state.sent();
                        return [
                            4,
                            res.json()
                        ];
                    case 2:
                        data = _state.sent();
                        if (data.url) window.location.href = data.url;
                        return [
                            2
                        ];
                }
            });
        })();
    };
}
_s(useUpgrade, "zGRSQSsFeLMQ4oxT4GP/yeMuIoc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useUser"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useClerk"]
    ];
});
if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(globalThis.$RefreshHelpers$) === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/ElectricBorder.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_type_of.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
;
function ElectricBorder(param) {
    var children = param.children, active = param.active;
    if (!active) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "eb-wrapper",
        children: children
    }, void 0, false, {
        fileName: "[project]/src/ElectricBorder.js",
        lineNumber: 2,
        columnNumber: 23
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "eb-wrapper",
        style: {
            position: "relative"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "eb-bg-glow"
            }, void 0, false, {
                fileName: "[project]/src/ElectricBorder.js",
                lineNumber: 5,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "eb-active",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "eb-spin-container",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "eb-solid-border"
            }, void 0, false, {
                fileName: "[project]/src/ElectricBorder.js",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "eb-glow-1"
            }, void 0, false, {
                fileName: "[project]/src/ElectricBorder.js",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "eb-glow-2"
            }, void 0, false, {
                fileName: "[project]/src/ElectricBorder.js",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "eb-overlay-1"
            }, void 0, false, {
                fileName: "[project]/src/ElectricBorder.js",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
_c = ElectricBorder;
const __TURBOPACK__default__export__ = ElectricBorder;
var _c;
__turbopack_context__.k.register(_c, "ElectricBorder");
if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(globalThis.$RefreshHelpers$) === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/PremiumBadge.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_type_of.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
;
function PremiumBadge(param) {
    var small = param.small;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "premium-badge-wrapper",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "premium-badge-glow-layer",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "premium-badge-body",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "premium-badge-eclipse"
                    }, void 0, false, {
                        fileName: "[project]/src/PremiumBadge.js",
                        lineNumber: 8,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "premium-badge-content".concat(small ? " premium-badge-small" : ""),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
_c = PremiumBadge;
const __TURBOPACK__default__export__ = PremiumBadge;
var _c;
__turbopack_context__.k.register(_c, "PremiumBadge");
if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(globalThis.$RefreshHelpers$) === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/LightsaberLoader.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_type_of.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
;
function LightsaberLoader(param) {
    var percent = param.percent;
    var pct = Math.min(percent, 1);
    var isComplete = pct >= 1;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "ls-container",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ls-hilt",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ls-tip"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 9,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ls-grip ls-grip1"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 10,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ls-grip ls-grip2"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 11,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ls-grip ls-grip3"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 12,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ls-center"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 13,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ls-center-bottom"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 14,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ls-hole ls-hole1"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 15,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ls-hole ls-hole2"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 16,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ls-cable ls-cable1"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 17,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ls-cable ls-cable2"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 18,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ls-guard-tip"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 19,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ls-guard-rect",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ls-guard-tri"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ls-guard-tri-shadow"
                    }, void 0, false, {
                        fileName: "[project]/src/LightsaberLoader.js",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ls-blade-track",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "ls-blade-fill".concat(isComplete ? " ls-blade-complete" : ""),
                    style: {
                        width: "".concat(pct * 100, "%")
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ls-blade-glow".concat(isComplete ? " ls-blade-glow-active" : "")
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
_c = LightsaberLoader;
const __TURBOPACK__default__export__ = LightsaberLoader;
var _c;
__turbopack_context__.k.register(_c, "LightsaberLoader");
if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(globalThis.$RefreshHelpers$) === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/Questions.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_async_to_generator.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_object_spread.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_object_spread_props.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_sliced_to_array.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_to_consumable_array.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_type_of.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__ = __turbopack_context__.i("[project]/node_modules/tslib/tslib.es6.mjs [client] (ecmascript) <export __generator as _>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/react-markdown/lib/index.js [client] (ecmascript) <export Markdown as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$clerk$2d$react$2f$dist$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/clerk-react/dist/index.mjs [client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@clerk/shared/dist/runtime/react/index.mjs [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePaidStatus$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/usePaidStatus.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePrice$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/usePrice.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$useUpgrade$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/useUpgrade.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ElectricBorder$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ElectricBorder.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PremiumBadge$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/PremiumBadge.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$LightsaberLoader$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/LightsaberLoader.js [client] (ecmascript)");
;
;
;
;
;
;
;
;
var _s = __turbopack_context__.k.signature();
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
var TIMER_TIME = 120;
var INTERVIEW_QUESTIONS = 4;
function Questions() {
    var _this = this;
    _s();
    var router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    var _router_query = router.query, category = _router_query.category, difficulty = _router_query.difficulty, math = _router_query.math, customPrompt = _router_query.customPrompt;
    var user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useUser"])().user;
    var isPaid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePaidStatus$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"])().isPaid;
    var price = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePrice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"])();
    var handleUpgrade = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$useUpgrade$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"])();
    // Normal question state
    var _useState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(""), 2), question = _useState[0], setQuestion = _useState[1];
    var _useState1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(""), 2), answer = _useState1[0], setAnswer = _useState1[1];
    var _useState2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), loadingQuestion = _useState2[0], setLoadingQuestion = _useState2[1];
    var _useState3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0), 2), streamProgress = _useState3[0], setStreamProgress = _useState3[1];
    var _useState4 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0), 2), interviewProgress = _useState4[0], setInterviewProgress = _useState4[1];
    var _useState5 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), loadingAnswer = _useState5[0], setLoadingAnswer = _useState5[1];
    var _useState6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), answerRevealed = _useState6[0], setAnswerRevealed = _useState6[1];
    var _useState7 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(""), 2), userAnswer = _useState7[0], setUserAnswer = _useState7[1];
    var _useState8 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(""), 2), feedback = _useState8[0], setFeedback = _useState8[1];
    var _useState9 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null), 2), score = _useState9[0], setScore = _useState9[1];
    var _useState10 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), loadingFeedback = _useState10[0], setLoadingFeedback = _useState10[1];
    var _useState11 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), graded = _useState11[0], setGraded = _useState11[1];
    var answerRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].useRef(answer);
    var _useState12 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null), 2), questionsUsed = _useState12[0], setQuestionsUsed = _useState12[1];
    // Timer (formerly "Interview Mode")
    var _useState13 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), timerOn = _useState13[0], setTimerOn = _useState13[1];
    var _useState14 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null), 2), timeLeft = _useState14[0], setTimeLeft = _useState14[1];
    var _useState15 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), timerStarted = _useState15[0], setTimerStarted = _useState15[1];
    var _useState16 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), isPaused = _useState16[0], setIsPaused = _useState16[1];
    var _useState17 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(TIMER_TIME), 2), customTimeSec = _useState17[0], setCustomTimeSec = _useState17[1];
    var _useState18 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), showTimerTooltip = _useState18[0], setShowTimerTooltip = _useState18[1];
    var timerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Interview Mode state
    var _useState19 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), interviewModeOn = _useState19[0], setInterviewModeOn = _useState19[1];
    var _useState20 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), interviewTurningOff = _useState20[0], setInterviewTurningOff = _useState20[1];
    var interviewTurningOffRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    var _useState21 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), interviewNoShine = _useState21[0], setInterviewNoShine = _useState21[1];
    var _useState22 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), showGenerateTooltip = _useState22[0], setShowGenerateTooltip = _useState22[1];
    var _useState23 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null), 2), interviewSession = _useState23[0], setInterviewSession = _useState23[1]; // { scenario, questions: [{question, idealAnswer}] }
    var _useState24 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0), 2), interviewStep = _useState24[0], setInterviewStep = _useState24[1];
    var _useState25 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]), 2), interviewUserAnswers = _useState25[0], setInterviewUserAnswers = _useState25[1]; // string per step
    var _useState26 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]), 2), interviewTimesLeft = _useState26[0], setInterviewTimesLeft = _useState26[1]; // time remaining at submission per step (null if timer off)
    var _useState27 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]), 2), interviewResponses = _useState27[0], setInterviewResponses = _useState27[1]; // { score, onTrack, response } per step
    var _useState28 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(""), 2), interviewCurrentAnswer = _useState28[0], setInterviewCurrentAnswer = _useState28[1];
    var _useState29 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), loadingInterviewGenerate = _useState29[0], setLoadingInterviewGenerate = _useState29[1];
    var _useState30 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), loadingInterviewRespond = _useState30[0], setLoadingInterviewRespond = _useState30[1];
    var _useState31 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), interviewComplete = _useState31[0], setInterviewComplete = _useState31[1];
    var _useState32 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null), 2), interviewDebrief = _useState32[0], setInterviewDebrief = _useState32[1];
    var _useState33 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), loadingDebrief = _useState33[0], setLoadingDebrief = _useState33[1];
    var _useState34 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), interviewAnswersRevealed = _useState34[0], setInterviewAnswersRevealed = _useState34[1];
    // Per-question timer in interview mode
    var _useState35 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), interviewTimerStarted = _useState35[0], setInterviewTimerStarted = _useState35[1];
    var _useState36 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null), 2), interviewTimeLeft = _useState36[0], setInterviewTimeLeft = _useState36[1];
    var _useState37 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false), 2), interviewTimerPaused = _useState37[0], setInterviewTimerPaused = _useState37[1];
    var _useState38 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_sliced_to_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(TIMER_TIME), 2), interviewCustomTime = _useState38[0], setInterviewCustomTime = _useState38[1];
    var interviewTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Questions.useEffect": function() {
            answerRef.current = answer;
        }
    }["Questions.useEffect"], [
        answer
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Questions.useEffect": function() {
            return ({
                "Questions.useEffect": function() {
                    if (timerRef.current) clearInterval(timerRef.current);
                }
            })["Questions.useEffect"];
        }
    }["Questions.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Questions.useEffect": function() {
            return ({
                "Questions.useEffect": function() {
                    if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);
                }
            })["Questions.useEffect"];
        }
    }["Questions.useEffect"], []);
    // Auto-grade when normal timer hits 0
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Questions.useEffect": function() {
            if (timerOn && timeLeft === 0 && !graded) handleGrade();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["Questions.useEffect"], [
        timeLeft
    ]);
    // Auto-submit when interview question timer hits 0
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Questions.useEffect": function() {
            if (interviewModeOn && interviewTimerStarted && interviewTimeLeft === 0 && !loadingInterviewRespond) {
                handleInterviewSubmit();
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["Questions.useEffect"], [
        interviewTimeLeft
    ]);
    // --- Normal timer helpers ---
    var runInterval = function runInterval() {
        timerRef.current = setInterval(function() {
            setTimeLeft(function(prev) {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    var startTimer = function startTimer() {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(customTimeSec);
        runInterval();
    };
    var stopTimer = function stopTimer() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setTimeLeft(null);
        setIsPaused(false);
    };
    var pauseTimer = function pauseTimer() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsPaused(true);
    };
    var resumeTimer = function resumeTimer() {
        setIsPaused(false);
        runInterval();
    };
    var freezeTimer = function freezeTimer() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };
    // --- Interview question timer helpers ---
    var runInterviewInterval = function runInterviewInterval() {
        interviewTimerRef.current = setInterval(function() {
            setInterviewTimeLeft(function(prev) {
                if (prev <= 1) {
                    clearInterval(interviewTimerRef.current);
                    interviewTimerRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    var startInterviewTimer = function startInterviewTimer() {
        if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);
        setInterviewTimeLeft(interviewCustomTime);
        setInterviewTimerStarted(true);
        setInterviewTimerPaused(false);
        runInterviewInterval();
    };
    var stopInterviewTimer = function stopInterviewTimer() {
        if (interviewTimerRef.current) {
            clearInterval(interviewTimerRef.current);
            interviewTimerRef.current = null;
        }
        setInterviewTimeLeft(null);
        setInterviewTimerStarted(false);
        setInterviewTimerPaused(false);
    };
    var pauseInterviewTimer = function pauseInterviewTimer() {
        if (interviewTimerRef.current) {
            clearInterval(interviewTimerRef.current);
            interviewTimerRef.current = null;
        }
        setInterviewTimerPaused(true);
    };
    var resumeInterviewTimer = function resumeInterviewTimer() {
        setInterviewTimerPaused(false);
        runInterviewInterval();
    };
    var freezeInterviewTimer = function freezeInterviewTimer() {
        if (interviewTimerRef.current) {
            clearInterval(interviewTimerRef.current);
            interviewTimerRef.current = null;
        }
    };
    var formatTime = function formatTime(s) {
        return "".concat(Math.floor(s / 60), ":").concat((s % 60).toString().padStart(2, "0"));
    };
    var saveQuestion = function saveQuestion(q) {
        var history = JSON.parse(localStorage.getItem("questionHistory") || "[]");
        history.push({
            question: q,
            timestamp: Date.now()
        });
        localStorage.setItem("questionHistory", JSON.stringify(history));
    };
    var wasRecentlyAsked = function wasRecentlyAsked(q) {
        var history = JSON.parse(localStorage.getItem("questionHistory") || "[]");
        var oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return history.some(function(item) {
            return item.question === q && item.timestamp > oneDayAgo;
        });
    };
    // --- Normal question grade ---
    var handleGrade = function handleGrade() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(function() {
            var _data_score, res, data, _data_score1, error;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                switch(_state.label){
                    case 0:
                        if (timerOn && timeLeft !== null && timeLeft > 0) freezeTimer();
                        setLoadingFeedback(true);
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            6,
                            ,
                            7
                        ]);
                        return [
                            4,
                            fetch("/api/grade", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    question: question,
                                    userAnswer: userAnswer,
                                    userId: user === null || user === void 0 ? void 0 : user.id
                                })
                            })
                        ];
                    case 2:
                        res = _state.sent();
                        return [
                            4,
                            res.json()
                        ];
                    case 3:
                        data = _state.sent();
                        setFeedback(data.feedback);
                        setScore((_data_score = data.score) !== null && _data_score !== void 0 ? _data_score : null);
                        setGraded(true);
                        if (!(user === null || user === void 0 ? void 0 : user.id)) return [
                            3,
                            5
                        ];
                        return [
                            4,
                            fetch("/api/history", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    userId: user.id,
                                    entry: {
                                        question: question,
                                        answer: answerRef.current,
                                        userAnswer: userAnswer.trim() || "No answer was submitted.",
                                        feedback: data.feedback,
                                        score: (_data_score1 = data.score) !== null && _data_score1 !== void 0 ? _data_score1 : null,
                                        category: decodeURIComponent(category),
                                        difficulty: decodeURIComponent(difficulty),
                                        math: decodeURIComponent(math),
                                        customPrompt: customPrompt && decodeURIComponent(customPrompt) !== "undefined" ? decodeURIComponent(customPrompt) : null,
                                        timestamp: Date.now()
                                    }
                                })
                            })
                        ];
                    case 4:
                        _state.sent();
                        _state.label = 5;
                    case 5:
                        return [
                            3,
                            7
                        ];
                    case 6:
                        error = _state.sent();
                        console.log("Error:", error);
                        return [
                            3,
                            7
                        ];
                    case 7:
                        setLoadingFeedback(false);
                        return [
                            2
                        ];
                }
            });
        })();
    };
    // --- Normal question fetch ---
    var getQuestion = function getQuestion() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(function() {
            var res, data, reader, decoder, baseLength, ESTIMATED_LENGTH, streamedText, streamedQuestionsUsed, buffer, _ref, done, value, lines, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, line, data1, newQuestion, attempts, retryRes, retryData, error;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                switch(_state.label){
                    case 0:
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
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            13,
                            ,
                            14
                        ]);
                        return [
                            4,
                            fetch("/api/question", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    type: "question",
                                    category: category,
                                    difficulty: difficulty,
                                    math: math,
                                    customPrompt: customPrompt,
                                    userId: user === null || user === void 0 ? void 0 : user.id,
                                    stream: true
                                })
                            })
                        ];
                    case 2:
                        res = _state.sent();
                        if (!(res.status === 403)) return [
                            3,
                            4
                        ];
                        return [
                            4,
                            res.json()
                        ];
                    case 3:
                        data = _state.sent();
                        if (data.limitReached) {
                            setQuestion("You've reached your 5 free questions for today. Come back tomorrow, or upgrade to premium for unlimited questions!");
                            setLoadingQuestion(false);
                            return [
                                2
                            ];
                        }
                        _state.label = 4;
                    case 4:
                        reader = res.body.getReader();
                        decoder = new TextDecoder();
                        baseLength = difficulty === "Easy" ? 150 : difficulty === "Hard" ? 350 : 250;
                        ESTIMATED_LENGTH = baseLength + (math === "With Math" ? 80 : 0) + (customPrompt && decodeURIComponent(customPrompt) !== "undefined" && decodeURIComponent(customPrompt) !== "" ? 50 : 0);
                        streamedText = "";
                        streamedQuestionsUsed = null;
                        buffer = "";
                        _state.label = 5;
                    case 5:
                        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                        ;
                        return [
                            4,
                            reader.read()
                        ];
                    case 6:
                        _ref = _state.sent(), done = _ref.done, value = _ref.value;
                        if (done) return [
                            3,
                            7
                        ];
                        buffer += decoder.decode(value, {
                            stream: true
                        });
                        lines = buffer.split("\n");
                        buffer = lines.pop();
                        _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                        try {
                            for(_iterator = lines[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                                line = _step.value;
                                if (!line.startsWith("data: ")) continue;
                                try {
                                    data1 = JSON.parse(line.slice(6));
                                    if (data1.done) {
                                        streamedText = data1.text;
                                        if (data1.questionsUsed !== undefined) streamedQuestionsUsed = data1.questionsUsed;
                                        setStreamProgress(1);
                                    } else if (data1.text) {
                                        streamedText = data1.text;
                                        setStreamProgress(Math.min(streamedText.length / ESTIMATED_LENGTH, 0.95));
                                    }
                                } catch (unused) {}
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally{
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return != null) {
                                    _iterator.return();
                                }
                            } finally{
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }
                        return [
                            3,
                            5
                        ];
                    case 7:
                        if (streamedQuestionsUsed !== null) setQuestionsUsed(streamedQuestionsUsed);
                        // Check for repeat; retry non-streaming if needed
                        newQuestion = wasRecentlyAsked(streamedText) ? null : streamedText;
                        attempts = 1;
                        _state.label = 8;
                    case 8:
                        if (!(!newQuestion && attempts < 5)) return [
                            3,
                            11
                        ];
                        return [
                            4,
                            fetch("/api/question", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    type: "question",
                                    category: category,
                                    difficulty: difficulty,
                                    math: math,
                                    customPrompt: customPrompt,
                                    userId: user === null || user === void 0 ? void 0 : user.id
                                })
                            })
                        ];
                    case 9:
                        retryRes = _state.sent();
                        return [
                            4,
                            retryRes.json()
                        ];
                    case 10:
                        retryData = _state.sent();
                        if (retryData.limitReached) {
                            setQuestion("You've reached your 5 free questions for today. Come back tomorrow, or upgrade to premium for unlimited questions!");
                            setLoadingQuestion(false);
                            return [
                                2
                            ];
                        }
                        if (retryData.questionsUsed !== undefined) setQuestionsUsed(retryData.questionsUsed);
                        if (!wasRecentlyAsked(retryData.result)) newQuestion = retryData.result;
                        attempts++;
                        return [
                            3,
                            8
                        ];
                    case 11:
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
                                    category: category,
                                    difficulty: difficulty,
                                    math: math,
                                    customPrompt: customPrompt,
                                    userId: user === null || user === void 0 ? void 0 : user.id
                                })
                            }).then(function(r) {
                                return r.json();
                            }).then(function(data) {
                                setAnswer(data.result);
                            });
                        }
                        return [
                            4,
                            new Promise(function(r) {
                                return setTimeout(r, 600);
                            })
                        ];
                    case 12:
                        _state.sent();
                        // Update page only after glow delay
                        if (newQuestion) {
                            setQuestion(newQuestion);
                            setTimerStarted(false);
                        } else {
                            setQuestion("You've seen all recent questions in this category! Try a different category or check back tomorrow.");
                        }
                        return [
                            3,
                            14
                        ];
                    case 13:
                        error = _state.sent();
                        console.log("Error:", error);
                        return [
                            3,
                            14
                        ];
                    case 14:
                        setLoadingQuestion(false);
                        return [
                            2
                        ];
                }
            });
        })();
    };
    var getAnswer = function getAnswer() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(function() {
            var res, data, error;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                switch(_state.label){
                    case 0:
                        setAnswerRevealed(true);
                        if (answer) return [
                            2
                        ];
                        setLoadingAnswer(true);
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            4,
                            ,
                            5
                        ]);
                        return [
                            4,
                            fetch("/api/question", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    type: "answer",
                                    question: question,
                                    category: category,
                                    difficulty: difficulty,
                                    math: math,
                                    customPrompt: customPrompt,
                                    userId: user === null || user === void 0 ? void 0 : user.id
                                })
                            })
                        ];
                    case 2:
                        res = _state.sent();
                        return [
                            4,
                            res.json()
                        ];
                    case 3:
                        data = _state.sent();
                        setAnswer(function(current) {
                            return current || data.result;
                        });
                        return [
                            3,
                            5
                        ];
                    case 4:
                        error = _state.sent();
                        console.log("Error:", error);
                        return [
                            3,
                            5
                        ];
                    case 5:
                        setLoadingAnswer(false);
                        return [
                            2
                        ];
                }
            });
        })();
    };
    // --- Interview Mode: generate ---
    var generateInterview = function generateInterview() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(function() {
            var startTime, ESTIMATED_MS, progressInterval, res, data, error;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                switch(_state.label){
                    case 0:
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
                        startTime = Date.now();
                        ESTIMATED_MS = 8000;
                        progressInterval = setInterval(function() {
                            var elapsed = Date.now() - startTime;
                            setInterviewProgress(Math.min(elapsed / ESTIMATED_MS, 0.9));
                        }, 50);
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            5,
                            ,
                            6
                        ]);
                        return [
                            4,
                            fetch("/api/interview-generate", {
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
                            })
                        ];
                    case 2:
                        res = _state.sent();
                        return [
                            4,
                            res.json()
                        ];
                    case 3:
                        data = _state.sent();
                        clearInterval(progressInterval);
                        setInterviewProgress(1);
                        return [
                            4,
                            new Promise(function(r) {
                                return setTimeout(r, 600);
                            })
                        ];
                    case 4:
                        _state.sent();
                        setInterviewSession(data);
                        return [
                            3,
                            6
                        ];
                    case 5:
                        error = _state.sent();
                        console.log("Error:", error);
                        clearInterval(progressInterval);
                        return [
                            3,
                            6
                        ];
                    case 6:
                        setLoadingInterviewGenerate(false);
                        return [
                            2
                        ];
                }
            });
        })();
    };
    // --- Interview Mode: submit answer for current step ---
    var handleInterviewSubmit = function handleInterviewSubmit() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(function() {
            var stepIndex, q, isLast, submittedAnswer, res, data, newAnswers, newResponses, newTimesLeft, questionsForHistory, scores, overallScore, error;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                switch(_state.label){
                    case 0:
                        if (!interviewSession) return [
                            2
                        ];
                        if (interviewTimeLeft !== null && interviewTimeLeft > 0) freezeInterviewTimer();
                        setLoadingInterviewRespond(true);
                        stepIndex = interviewStep;
                        q = interviewSession.questions[stepIndex];
                        isLast = stepIndex === INTERVIEW_QUESTIONS - 1;
                        submittedAnswer = interviewCurrentAnswer;
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            8,
                            ,
                            9
                        ]);
                        return [
                            4,
                            fetch("/api/interview-respond", {
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
                                    isLast: isLast
                                })
                            })
                        ];
                    case 2:
                        res = _state.sent();
                        return [
                            4,
                            res.json()
                        ];
                    case 3:
                        data = _state.sent();
                        newAnswers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(interviewUserAnswers).concat([
                            submittedAnswer.trim() || "No answer was submitted."
                        ]);
                        newResponses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(interviewResponses).concat([
                            data
                        ]);
                        newTimesLeft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_to_consumable_array$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(interviewTimesLeft).concat([
                            timerOn ? interviewTimeLeft : null
                        ]);
                        setInterviewUserAnswers(newAnswers);
                        setInterviewResponses(newResponses);
                        setInterviewTimesLeft(newTimesLeft);
                        setInterviewCurrentAnswer("");
                        stopInterviewTimer();
                        if (!isLast) return [
                            3,
                            6
                        ];
                        setInterviewComplete(true);
                        if (!(user === null || user === void 0 ? void 0 : user.id)) return [
                            3,
                            5
                        ];
                        questionsForHistory = interviewSession.questions.map(function(q, i) {
                            var _ref;
                            var _newResponses_i, _newResponses_i1;
                            return {
                                question: q.question,
                                idealAnswer: q.idealAnswer,
                                userAnswer: newAnswers[i] || "No answer was submitted.",
                                score: (_ref = (_newResponses_i = newResponses[i]) === null || _newResponses_i === void 0 ? void 0 : _newResponses_i.score) !== null && _ref !== void 0 ? _ref : null,
                                feedback: ((_newResponses_i1 = newResponses[i]) === null || _newResponses_i1 === void 0 ? void 0 : _newResponses_i1.response) || ""
                            };
                        });
                        scores = questionsForHistory.map(function(q) {
                            return q.score;
                        }).filter(function(s) {
                            return s !== null;
                        });
                        overallScore = scores.length > 0 ? Math.round(scores.reduce(function(a, b) {
                            return a + b;
                        }, 0) / scores.length * 10) / 10 : null;
                        return [
                            4,
                            fetch("/api/history", {
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
                            })
                        ];
                    case 4:
                        _state.sent();
                        _state.label = 5;
                    case 5:
                        return [
                            3,
                            7
                        ];
                    case 6:
                        setInterviewStep(stepIndex + 1);
                        _state.label = 7;
                    case 7:
                        return [
                            3,
                            9
                        ];
                    case 8:
                        error = _state.sent();
                        console.log("Error:", error);
                        return [
                            3,
                            9
                        ];
                    case 9:
                        setLoadingInterviewRespond(false);
                        return [
                            2
                        ];
                }
            });
        })();
    };
    // --- Interview Mode: fetch debrief ---
    var handleInterviewDebrief = function handleInterviewDebrief() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_async_to_generator$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(function() {
            var questionsForDebrief, res, data, error;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tslib$2f$tslib$2e$es6$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__$3c$export__$5f$_generator__as__$5f3e$__["_"])(this, function(_state) {
                switch(_state.label){
                    case 0:
                        if (!interviewSession) return [
                            2
                        ];
                        setLoadingDebrief(true);
                        questionsForDebrief = interviewSession.questions.map(function(q, i) {
                            var _ref;
                            var _interviewResponses_i;
                            return {
                                question: q.question,
                                idealAnswer: q.idealAnswer,
                                userAnswer: interviewUserAnswers[i] || "No answer was submitted.",
                                score: (_ref = (_interviewResponses_i = interviewResponses[i]) === null || _interviewResponses_i === void 0 ? void 0 : _interviewResponses_i.score) !== null && _ref !== void 0 ? _ref : null
                            };
                        });
                        _state.label = 1;
                    case 1:
                        _state.trys.push([
                            1,
                            4,
                            ,
                            5
                        ]);
                        return [
                            4,
                            fetch("/api/interview-debrief", {
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
                            })
                        ];
                    case 2:
                        res = _state.sent();
                        return [
                            4,
                            res.json()
                        ];
                    case 3:
                        data = _state.sent();
                        setInterviewDebrief(data.feedback);
                        return [
                            3,
                            5
                        ];
                    case 4:
                        error = _state.sent();
                        console.log("Error:", error);
                        return [
                            3,
                            5
                        ];
                    case 5:
                        setLoadingDebrief(false);
                        return [
                            2
                        ];
                }
            });
        })();
    };
    var interviewOverallScore = interviewResponses.length > 0 ? Math.round(interviewResponses.reduce(function(a, r) {
        var _r_score;
        return a + ((_r_score = r.score) !== null && _r_score !== void 0 ? _r_score : 0);
    }, 0) / interviewResponses.length * 10) / 10 : null;
    var getScoreColor = function getScoreColor(s) {
        return s >= 8 ? "#16a34a" : s >= 5 ? "#d97706" : "#dc2626";
    };
    var getScoreBg = function getScoreBg(s) {
        return s >= 8 ? "#dcfce7" : s >= 5 ? "#fff7ed" : "#fee2e2";
    };
    var isPolling = loadingQuestion || loadingInterviewGenerate;
    var canToggleInterviewMode = !interviewSession && !isPolling;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: styles.page,
        className: "page-bg page-wrapper",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ElectricBorder$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                active: isPaid,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: styles.container,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "16px",
                                    marginBottom: "32px"
                                },
                                className: "header-mobile",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: isPaid ? "/Fite_Logo_Premium.png" : "/favicon.png",
                                        alt: "logo",
                                        style: {
                                            height: "64px",
                                            width: "64px",
                                            cursor: "pointer"
                                        },
                                        className: "logo-img-mobile",
                                        onClick: function onClick() {
                                            return router.push("/");
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/Questions.js",
                                        lineNumber: 480,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                        style: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])({}, styles.logo), {
                                                            cursor: "pointer"
                                                        }),
                                                        className: "logo-mobile",
                                                        onClick: function onClick() {
                                                            return router.push("/");
                                                        },
                                                        children: "Fite Finance"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 489,
                                                        columnNumber: 17
                                                    }, this),
                                                    isPaid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PremiumBadge$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: styles.card,
                                className: "card-mobile",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.categoryHeader,
                                        className: "category-header-mobile",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: function onClick() {
                                                    return router.push("/");
                                                },
                                                className: "back-btn",
                                                children: "← Back"
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 498,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: styles.categoryLabel,
                                                children: decodeURIComponent(category)
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 499,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])({}, styles.mathBadge), {
                                                    backgroundColor: "#e8edf5",
                                                    color: "#4a6fa5"
                                                }),
                                                children: decodeURIComponent(difficulty)
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 500,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])({}, styles.mathBadge), {
                                                    backgroundColor: decodeURIComponent(math) === "With Math" ? "#0a2463" : "#e8edf5",
                                                    color: decodeURIComponent(math) === "With Math" ? "#ffffff" : "#4a6fa5"
                                                }),
                                                children: decodeURIComponent(math)
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 501,
                                                columnNumber: 15
                                            }, this),
                                            customPrompt && decodeURIComponent(customPrompt) !== "" && decodeURIComponent(customPrompt) !== "undefined" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])({}, styles.mathBadge), {
                                                    backgroundColor: "#c9a84c",
                                                    color: "#ffffff"
                                                }),
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            alignItems: "center",
                                            gap: "20px",
                                            marginBottom: "16px"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: "relative"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: function onClick() {
                                                            if (!isPaid) {
                                                                setShowTimerTooltip(true);
                                                                setTimeout(function() {
                                                                    return setShowTimerTooltip(false);
                                                                }, 2500);
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
                                                        className: "timer-mode-btn".concat(!isPaid ? " timer-mode-btn-free" : timerOn ? " timer-mode-btn-on" : ""),
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
                                                    showTimerTooltip && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "interview-mode-wrapper",
                                                style: {
                                                    position: "relative"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: function onClick() {
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
                                                                interviewTurningOffRef.current = setTimeout(function() {
                                                                    return setInterviewTurningOff(false);
                                                                }, 800);
                                                            } else {
                                                                if (interviewTurningOffRef.current) {
                                                                    clearTimeout(interviewTurningOffRef.current);
                                                                    interviewTurningOffRef.current = null;
                                                                    setInterviewTurningOff(false);
                                                                }
                                                                setInterviewModeOn(true);
                                                            }
                                                        },
                                                        onMouseLeave: function onMouseLeave() {
                                                            return setInterviewNoShine(false);
                                                        },
                                                        className: "interview-mode-btn".concat(interviewModeOn ? " interview-mode-btn-on" : "").concat(interviewTurningOff ? " interview-mode-btn-turning-off" : "").concat(interviewNoShine ? " interview-mode-btn-no-shine" : ""),
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
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "interview-mode-neon-ring".concat(interviewModeOn ? " ring-on" : "")
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
                                    !interviewModeOn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            loadingQuestion ? /* set to true to always see loading bar (for testing) - change back to loadingQuestion*/ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$LightsaberLoader$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                percent: streamProgress
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 577,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: getQuestion,
                                                disabled: loadingAnswer,
                                                className: "primary-btn",
                                                children: question && !question.includes("Come back tomorrow") ? "Get New Question" : "Get Question"
                                            }, void 0, false, {
                                                fileName: "[project]/src/Questions.js",
                                                lineNumber: 579,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: "relative"
                                                },
                                                children: loadingInterviewGenerate ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$LightsaberLoader$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                    percent: interviewProgress
                                                }, void 0, false, {
                                                    fileName: "[project]/src/Questions.js",
                                                    lineNumber: 593,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: function onClick() {
                                                                if (!isPaid) {
                                                                    setShowGenerateTooltip(true);
                                                                    setTimeout(function() {
                                                                        return setShowGenerateTooltip(false);
                                                                    }, 2500);
                                                                    return;
                                                                }
                                                                generateInterview();
                                                            },
                                                            className: "generate-interview-btn".concat(!isPaid ? " generate-interview-btn-free" : ""),
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "generate-interview-btn-glare"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 603,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                        showGenerateTooltip && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                    !isPaid && questionsUsed !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                    !interviewModeOn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            timerOn && question && !question.includes("Come back tomorrow") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                                    border: "1px solid ".concat(!timerStarted ? "#a8d4e0" : graded && timeLeft > 0 ? "#86efac" : timeLeft === 0 ? "#fca5a5" : timeLeft < 30 ? "#fed7aa" : "#a8d4e0")
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                    !timerStarted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "10px"
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "6px"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: function onClick() {
                                                                            return setCustomTimeSec(function(prev) {
                                                                                return Math.max(30, prev - 30);
                                                                            });
                                                                        },
                                                                        className: "timer-step-btn",
                                                                        children: "−"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 648,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: function onClick() {
                                                                            return setCustomTimeSec(function(prev) {
                                                                                return Math.min(600, prev + 30);
                                                                            });
                                                                        },
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
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: function onClick() {
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
                                                    }, this) : timeLeft === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                    }, this) : graded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "8px"
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: isPaused ? resumeTimer : pauseTimer,
                                                                disabled: loadingAnswer || loadingFeedback,
                                                                className: isPaused ? "timer-resume-btn" : "timer-pause-btn",
                                                                children: isPaused ? "Resume" : "Pause"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 660,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                            question && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: styles.section,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: styles.label,
                                                        children: "QUESTION"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 669,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: styles.text,
                                                        children: question
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 670,
                                                        columnNumber: 21
                                                    }, this),
                                                    !question.includes("Come back tomorrow") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginTop: "20px"
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                style: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])({}, styles.label), {
                                                                    marginBottom: "8px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "8px"
                                                                }),
                                                                children: [
                                                                    "YOUR ANSWER",
                                                                    isPaid ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$PremiumBadge$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                                        small: true
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 676,
                                                                        columnNumber: 37
                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                placeholder: isPaid ? "Type your answer here to get AI feedback..." : "Upgrade to Premium to get AI feedback on your answers",
                                                                value: userAnswer,
                                                                onChange: function onChange(e) {
                                                                    return isPaid && !(timerOn && (!timerStarted || timeLeft === 0 || graded)) && setUserAnswer(e.target.value);
                                                                },
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
                                                            isPaid && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                                    feedback && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginTop: "20px",
                                                            padding: "16px",
                                                            backgroundColor: "#f0f4f8",
                                                            borderRadius: "8px",
                                                            borderLeft: "4px solid ".concat(score !== null ? getScoreColor(score) : "#0a2463")
                                                        },
                                                        children: [
                                                            score !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "12px",
                                                                    marginBottom: "14px"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            width: "48px",
                                                                            height: "48px",
                                                                            borderRadius: "50%",
                                                                            backgroundColor: getScoreBg(score),
                                                                            border: "2px solid ".concat(getScoreColor(score)),
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            flexShrink: 0
                                                                        },
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                style: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])({}, styles.label), {
                                                                    marginBottom: "8px"
                                                                }),
                                                                children: "FEEDBACK"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/Questions.js",
                                                                lineNumber: 711,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                    question.includes("Come back tomorrow") ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                            !question.includes("Come back tomorrow") && answerRevealed && answer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: styles.section,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: styles.label,
                                                        children: "ANSWER"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/Questions.js",
                                                        lineNumber: 728,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__["default"], {
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
                                    interviewModeOn && interviewSession && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: styles.section,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    backgroundColor: "#0a2463",
                                                    borderRadius: "10px",
                                                    padding: "16px 20px",
                                                    marginBottom: "24px"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    marginBottom: "20px"
                                                },
                                                children: [
                                                    interviewSession.questions.map(function(_, i) {
                                                        var done = i < interviewStep || interviewComplete;
                                                        var current = i === interviewStep && !interviewComplete;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                                        }, _this);
                                                    }),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: "11px",
                                                            color: "#4a6fa5",
                                                            fontWeight: "700",
                                                            flexShrink: 0,
                                                            marginLeft: "4px"
                                                        },
                                                        children: interviewComplete ? "Complete" : "Q".concat(interviewStep + 1, " of ").concat(INTERVIEW_QUESTIONS)
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
                                            interviewUserAnswers.map(function(ans, i) {
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        marginBottom: "20px",
                                                        borderTop: i > 0 ? "2.5px solid #e8edf5" : "none",
                                                        paddingTop: i > 0 ? "20px" : "0"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                borderLeft: "3px solid #0a2463",
                                                                paddingLeft: "14px",
                                                                marginBottom: "10px"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                                }, _this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                                }, _this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 761,
                                                            columnNumber: 21
                                                        }, _this),
                                                        interviewTimesLeft[i] !== null && interviewTimesLeft[i] !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                padding: "8px 14px",
                                                                borderRadius: "8px",
                                                                marginBottom: "8px",
                                                                backgroundColor: interviewTimesLeft[i] === 0 ? "#fee2e2" : interviewTimesLeft[i] < 30 ? "#fff7ed" : "#e8f4f8",
                                                                border: "1px solid ".concat(interviewTimesLeft[i] === 0 ? "#fca5a5" : interviewTimesLeft[i] < 30 ? "#fed7aa" : "#a8d4e0")
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                                }, _this),
                                                                interviewTimesLeft[i] === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                                }, _this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                                }, _this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 766,
                                                            columnNumber: 23
                                                        }, _this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                backgroundColor: "#f7f9fc",
                                                                borderRadius: "8px",
                                                                padding: "12px 14px",
                                                                marginBottom: "8px",
                                                                border: "1px solid #e8edf5"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                                }, _this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                                }, _this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 774,
                                                            columnNumber: 21
                                                        }, _this),
                                                        interviewResponses[i] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                backgroundColor: interviewResponses[i].onTrack ? "#f0fdf4" : "#fff7ed",
                                                                borderRadius: "8px",
                                                                padding: "12px 14px",
                                                                borderLeft: "3px solid ".concat(interviewResponses[i].onTrack ? "#16a34a" : "#d97706"),
                                                                display: "flex",
                                                                gap: "10px",
                                                                alignItems: "flex-start"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        flexShrink: 0,
                                                                        width: "32px",
                                                                        height: "32px",
                                                                        borderRadius: "50%",
                                                                        backgroundColor: getScoreBg(interviewResponses[i].score),
                                                                        border: "2px solid ".concat(getScoreColor(interviewResponses[i].score)),
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center"
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                                    }, _this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 780,
                                                                    columnNumber: 25
                                                                }, _this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                                }, _this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 779,
                                                            columnNumber: 23
                                                        }, _this),
                                                        interviewAnswersRevealed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                marginTop: "8px",
                                                                backgroundColor: "#e8edf5",
                                                                borderRadius: "8px",
                                                                padding: "12px 14px",
                                                                border: "1px solid #c8d4e8"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                                }, _this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                                }, _this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/Questions.js",
                                                            lineNumber: 788,
                                                            columnNumber: 23
                                                        }, _this)
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/src/Questions.js",
                                                    lineNumber: 760,
                                                    columnNumber: 19
                                                }, _this);
                                            }),
                                            !interviewComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    borderTop: interviewUserAnswers.length > 0 ? "2.5px solid #e8edf5" : "none",
                                                    paddingTop: interviewUserAnswers.length > 0 ? "20px" : "0"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            borderLeft: "3px solid #4a6fa5",
                                                            paddingLeft: "14px",
                                                            marginBottom: "14px"
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                    timerOn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                                            border: "1px solid ".concat(!interviewTimerStarted ? "#a8d4e0" : interviewTimeLeft === 0 ? "#fca5a5" : interviewTimeLeft < 30 ? "#fed7aa" : "#a8d4e0")
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                            !interviewTimerStarted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "10px"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: "6px"
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                onClick: function onClick() {
                                                                                    return setInterviewCustomTime(function(prev) {
                                                                                        return Math.max(30, prev - 30);
                                                                                    });
                                                                                },
                                                                                className: "timer-step-btn",
                                                                                children: "−"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/Questions.js",
                                                                                lineNumber: 820,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                onClick: function onClick() {
                                                                                    return setInterviewCustomTime(function(prev) {
                                                                                        return Math.min(600, prev + 30);
                                                                                    });
                                                                                },
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
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                                            }, this) : interviewTimeLeft === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "8px"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: interviewTimerPaused ? resumeInterviewTimer : pauseInterviewTimer,
                                                                        disabled: loadingInterviewRespond,
                                                                        className: interviewTimerPaused ? "timer-resume-btn" : "timer-pause-btn",
                                                                        children: interviewTimerPaused ? "Resume" : "Pause"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/Questions.js",
                                                                        lineNumber: 830,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        placeholder: "Type your response...",
                                                        value: interviewCurrentAnswer,
                                                        onChange: function onChange(e) {
                                                            return !loadingInterviewRespond && setInterviewCurrentAnswer(e.target.value);
                                                        },
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
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                            interviewComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: "8px"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        borderTop: "2px solid #e8edf5",
                                                        paddingTop: "20px",
                                                        marginTop: "8px"
                                                    },
                                                    children: [
                                                        interviewOverallScore !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        width: "56px",
                                                                        height: "56px",
                                                                        borderRadius: "50%",
                                                                        backgroundColor: getScoreBg(interviewOverallScore),
                                                                        border: "2px solid ".concat(getScoreColor(interviewOverallScore)),
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        flexShrink: 0
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                        !interviewDebrief && !loadingDebrief && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                                        loadingDebrief && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                        interviewDebrief && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                backgroundColor: "#f0f4f8",
                                                                borderRadius: "8px",
                                                                padding: "16px",
                                                                borderLeft: "4px solid #0a2463",
                                                                marginBottom: "16px"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    style: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread_props$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_object_spread$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])({}, styles.label), {
                                                                        marginBottom: "8px"
                                                                    }),
                                                                    children: "DEBRIEF"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/Questions.js",
                                                                    lineNumber: 886,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: function onClick() {
                                                                return setInterviewAnswersRevealed(!interviewAnswersRevealed);
                                                            },
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    textAlign: "center",
                    fontSize: "11px",
                    color: "#4a6fa5",
                    marginTop: "12px",
                    marginBottom: "12px"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
_s(Questions, "ikgDv9ZVUwHNcpF1ZmD1p56ZM5I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$runtime$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useUser"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePaidStatus$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$usePrice$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$useUpgrade$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"]
    ];
});
_c = Questions;
var styles = {
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
var _c;
__turbopack_context__.k.register(_c, "Questions");
if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(globalThis.$RefreshHelpers$) === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/pages/questions/[category]/[difficulty]/[math]/index.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__N_SSP",
    ()=>__N_SSP,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_type_of.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Questions$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/Questions.js [client] (ecmascript)");
;
;
;
;
;
var __N_SSP = true;
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$Questions$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"];
if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_type_of$2e$js__$5b$client$5d$__$28$ecmascript$29$__["_"])(globalThis.$RefreshHelpers$) === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/questions/[category]/[difficulty]/[math]/index.js [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

var PAGE_PATH = "/questions/[category]/[difficulty]/[math]";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    function() {
        return __turbopack_context__.r("[project]/pages/questions/[category]/[difficulty]/[math]/index.js [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if ("TURBOPACK compile-time truthy", 1) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/pages/questions/[category]/[difficulty]/[math]/index.js\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/questions/[category]/[difficulty]/[math]/index.js [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__0ow12td._.js.map