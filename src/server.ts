import {
    LATEST_PROTOCOL_VERSION,
    SdkConfig, Transport
} from "./types.js";
import axios from "axios";
import {
    CallToolRequest,
    CallToolRequestSchema, CallToolResult, CallToolResultSchema,
    ErrorCode,
    InitializeRequest, InitializeRequestSchema, InitializeResult,
    InitializeResultSchema, JSONRPCRequest,
    JSONRPCRequestSchema, ListToolsRequest, ListToolsRequestSchema, ListToolsResult, ListToolsResultSchema,
    McpError
} from "@modelcontextprotocol/sdk/types.js";
import {RequestHandlerExtra} from "@modelcontextprotocol/sdk/shared/protocol.js";
import {HttpTransport} from "./transport.js";
import {Server} from "@modelcontextprotocol/sdk/server/index.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";

export class GentoroServer {
    private _config: SdkConfig;
    private _transport: Transport;
    private _server: Server | null = null;
    constructor() {
        this._config = {
            apiKey: process.env.GENTORO_API_KEY || null,
            bridgeUid: process.env.GENTORO_BRIDGE_UID || null,
            baseUrl: process.env.GENTORO_BASE_URL || null
        }
        this._transport = new HttpTransport(this._config);
    }

    async start():Promise<void> {
        const initializeResult: InitializeResult = await this.initialize();
        console.log('Initializing with capabilities:', initializeResult.capabilities);
        this._server = new Server({
            name: "gentoro-mcp-nodejs-server",
            version: "0.0.1",
        }, {
            capabilities: initializeResult.capabilities,
        });

        this._server.setRequestHandler( InitializeRequestSchema, this.InitializeRequestHandler.bind(this));
        this._server.setRequestHandler( ListToolsRequestSchema, this.ListToolsRequestHandler.bind(this));
        this._server.setRequestHandler( CallToolRequestSchema, this.CallToolRequestHandler.bind(this));

        this._server.onerror = this.onErrorHandler.bind(this)
        process.on('SIGINT', this.SignalHandler.bind(this));

        const transport = new StdioServerTransport();
        return this._server.connect(transport);
    }

    onErrorHandler (error: Error ): void {
        console.error("[MCP Error]", error);
    }

    async SignalHandler (): Promise<never> {
        return new Promise(() => {
            if( this._server != null ) {
                this._server.close()
                    .then(() => {
                        console.log('Processed ended successfully');
                        process.exit(0);
                    })
            }
        })
    }

    async initialize (): Promise<InitializeResult> {
        const initializeRequest: InitializeRequest = InitializeRequestSchema.parse({
            method: 'initialize',
            params: {
                capabilities: {},
                protocolVersion: LATEST_PROTOCOL_VERSION,
                clientInfo: {
                    name: 'gentoro-mcp-nodejs-sdk',
                    version: '0.0.1'
                }
            }
        });
        return this.InitializeRequestHandler(initializeRequest, null);
    }

    async ListToolsRequestHandler (): Promise<ListToolsResult> {
        const request: ListToolsRequest = ListToolsRequestSchema.parse({
            method: 'tools/list',
            params: {}
        }) as ListToolsRequest;

        const cmd : JSONRPCRequest = JSONRPCRequestSchema.parse({
            jsonrpc: '2.0',
            id: Date.now(),
            ... request
        })

        const result:ListToolsResult = await this._transport.send(cmd)
            .then(response => ListToolsResultSchema.parse(response.result) as ListToolsResult).catch(error => {
                if (axios.isAxiosError(error)) {
                    throw new McpError(
                        ErrorCode.InternalError,
                        `Gentoro API error: ${error.response?.data.message ?? error.message}`
                    );
                }
                throw error;
            });

        return result;
    }

    async CallToolRequestHandler ( data: CallToolRequest ): Promise<CallToolResult> {
        const cmd : JSONRPCRequest = JSONRPCRequestSchema.parse({
            jsonrpc: '2.0',
            id: Date.now(),
            ... data
        })

        const result:CallToolResult = await this._transport.send(cmd)
            .then(response => CallToolResultSchema.parse(response.result) as CallToolResult).catch(error => {
                if (axios.isAxiosError(error)) {
                    throw new McpError(
                        ErrorCode.InternalError,
                        `Gentoro API error: ${error.response?.data.message ?? error.message}`
                    );
                }
                throw error;
            });
        console.log('CallToolResult:', result);
        return result;
    }

    async InitializeRequestHandler ( data: InitializeRequest , extra: RequestHandlerExtra | null ): Promise<InitializeResult> {
        const cmd : JSONRPCRequest = JSONRPCRequestSchema.parse({
            jsonrpc: '2.0',
            id: Date.now(),
            ... data
        })

        const result:InitializeResult = await this._transport.send(cmd)
            .then(response => InitializeResultSchema.parse(response.result) as InitializeResult).catch(error => {
                if (axios.isAxiosError(error)) {
                    throw new McpError(
                        ErrorCode.InternalError,
                        `Gentoro API error: ${error.response?.data.message ?? error.message}`
                    );
                }
                throw error;
            });

        return result;
    }
}
