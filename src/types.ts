import {JSONRPCRequest, JSONRPCResponse} from "@modelcontextprotocol/sdk/types.js";

export interface Transport {
    send(jsonRpcCommand: JSONRPCRequest): Promise<JSONRPCResponse>;
}

export interface SdkConfig {
    baseUrl: string | null;
    bridgeUid: string | null;
    apiKey: string | null;
}
