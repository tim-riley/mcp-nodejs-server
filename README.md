# Gentoro MCP Server

MCP Server for the Gentoro services, enabling Claude to interact with Gentoro bridges, and interact with all underlining capabilities.

## Tools

Gentoro allows users to create and integrate tools into a common Bridge, defining all available capabilities.

As this server is fully integrated with Gentoro, the tools and their underlining computation is fully controlled at Gentoro's, allowing it to enable and disable tools at will.

## Setup

1. Create Gentoro account
Visit the [Gentoro](https://gentoro.com) website to request an account and start using the Gentoro services.

2. Create a Gentoro Api Key
Once you have an account, create an API key to authenticate with the Gentoro services.

3. Defining bridge
Using Gentoro Studio, define your bridge with all tools and data sources required.

### Integrate Gentoro with Claude

Add the following to your `claude_desktop_config.json`:

```json
{
    "mcpServers": {
        "gentoro": {
            "command": "npx",
            "args": [
                "-y",
                "@gentoro/mcp-nodejs-server"
            ],
            "env": {
                "GENTORO_API_KEY": "<your api key>",
                "GENTORO_BRIDGE_UID": "<your bridge uid>",
                "GENTORO_BASE_URL": "<url where gentoro is hosted>"
            }
        }
    }
}
```

