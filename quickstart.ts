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


setEnvironment("testnet"); 

const T3N_API_KEY = process.env.T3N_API_KEY!;
const wasmComponent = await loadWasmComponent(); 
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
const tenantDid = did.value;

console.log("Connected as:", tenantDid);

import { TenantClient, getNodeUrl } from "@terminal3/t3n-sdk";

const tenant = new TenantClient({
  t3n,                    
  baseUrl: getNodeUrl(), 
  tenantDid,              
});

await tenant.tenant.me();
console.log("TenantClient ready.");