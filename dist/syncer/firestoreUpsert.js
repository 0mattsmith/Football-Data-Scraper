"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertToFirestore = upsertToFirestore;
const admin = __importStar(require("firebase-admin"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * Batch upserts footballer profiles into Firebase Firestore ('footballers' collection).
 * Supports both live credentials and dry-run mode if credentials are not yet configured.
 */
async function upsertToFirestore(profiles) {
    let isLive = false;
    try {
        if (!admin.apps.length) {
            // Check for service account key file
            const keyPath = path_1.default.resolve(__dirname, '../../serviceAccountKey.json');
            if (fs_1.default.existsSync(keyPath)) {
                const serviceAccount = JSON.parse(fs_1.default.readFileSync(keyPath, 'utf8'));
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                isLive = true;
            }
            else {
                console.log(`[Firestore] No serviceAccountKey.json found. Running in DRY-RUN mode.`);
            }
        }
        else {
            isLive = true;
        }
    }
    catch (err) {
        console.warn(`[Firestore] Initialization fallback to dry-run mode: ${err.message}`);
        isLive = false;
    }
    if (!isLive) {
        console.log(`[Firestore Dry-Run] Would upsert ${profiles.length} profiles to the 'footballers' collection.`);
        return { count: profiles.length, mode: 'dry-run' };
    }
    const db = admin.firestore();
    const collectionRef = db.collection('footballers');
    let count = 0;
    // Batch writes in chunks of 500 (Firestore limit per batch)
    const chunkSize = 500;
    for (let i = 0; i < profiles.length; i += chunkSize) {
        const chunk = profiles.slice(i, i + chunkSize);
        const batch = db.batch();
        for (const p of chunk) {
            const docId = p.id || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const docRef = collectionRef.doc(docId);
            batch.set(docRef, {
                ...p,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
        await batch.commit();
        count += chunk.length;
        console.log(`[Firestore] Upserted batch of ${chunk.length} players (${count}/${profiles.length})`);
    }
    return { count, mode: 'live' };
}
