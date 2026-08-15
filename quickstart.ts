import {
  T3nClient,
  setEnvironment,
  loadWasmComponent,
  eth_get_address,
  metamask_sign,
  createEthAuthInput,
} from "@terminal3/t3n-sdk";

import crypto from "node:crypto";
const throwawayPrivateKey = "0x" + crypto.randomBytes(32).toString("hex");


setEnvironment("testnet"); // the SDK defaults to production — set this explicitly while building

const T3N_API_KEY = process.env.T3N_API_KEY!;
const wasmComponent = await loadWasmComponent(); // all crypto runs inside this component
const address = eth_get_address(throwawayPrivateKey);

const t3n = new T3nClient({
  wasmComponent,
  handlers: {
    EthSign: metamask_sign(address, undefined, throwawayPrivateKey),
  },
  trustAnchor: { unsafe_trust_server: true },
});

await t3n.handshake();
const did = await t3n.authenticate(createEthAuthInput(address));
const tenantDid = did.value; // did:t3n:... — you'll reuse this exact variable in every later step

console.log("Connected as:", tenantDid);

import { TenantClient, getNodeUrl } from "@terminal3/t3n-sdk";

const tenant = new TenantClient({
  t3n,                    // the T3nClient you already authenticated
  baseUrl: getNodeUrl(),  // the active node from setEnvironment()
  tenantDid,               // did.value from earlier — never hardcode
});

// await tenant.tenant.me(); // SDK bug — RPC rejected, missing script_name. See bug report.
// console.log("TenantClient ready.");

import { readFile } from "fs/promises";

const WASM_PATH = "../z-tenant-flight/target/wasm32-wasip2/release/z_tenant_flight.wasm";
const CONTRACT_TAIL = "travel-contracts";
const CONTRACT_VERSION = "0.1.0";

const wasmBytes = await readFile(WASM_PATH);

const result = await tenant.contracts.register({
  tail: CONTRACT_TAIL,
  version: CONTRACT_VERSION,
  wasm: wasmBytes,
});

const contractId = result.contract_id;
const tenantId = tenantDid.slice("did:t3n:".length);
const scriptName = `z:${tenantId}:${CONTRACT_TAIL}`;

console.log(`registered ${scriptName} as contract id ${contractId}`);