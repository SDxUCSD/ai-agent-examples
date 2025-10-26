import asyncio
import requests
import json
import os
from dotenv import load_dotenv
from claude_agent_sdk import tool, create_sdk_mcp_server, ClaudeSDKClient, ClaudeAgentOptions, AssistantMessage, TextBlock

load_dotenv()
PARALLEL_API_KEY = os.environ.get("PARALLEL_API_KEY")
SEARCH_API_URL = "https://api.parallel.ai/v1beta/search"

# --- Web search ---
@tool("parallel_search", "Web search. Max 5 search queries.", {"objective": str, "search_queries": list, "max_results": int, "processor": str})
async def parallel_search(args):
    print(f"\ncalling parallel_search with args: {args}")
    queries = args.get("search_queries", [])
    
    if isinstance(queries, str):
        queries = [q.strip() for q in queries.split(",")][:5]
        
    response = requests.post(
        SEARCH_API_URL,
        headers={"Content-Type": "application/json", "x-api-key": PARALLEL_API_KEY},
        json={"objective": args["objective"], "processor": "base", "max_results": args.get("max_results", 10), 
              "max_chars_per_result": 6000, "search_queries": queries}
    )
    
    response.raise_for_status()
    
    return {"content": [{"type": "text", "text": json.dumps(response.json(), indent=2)}]}
    
# --- Write to markdown file ---
@tool("write_markdown", "Write content to markdown file.", {"filename": str, "content": str})
async def write_markdown(args):
    print(f"calling write_markdown with args: {args}")
    filename = args["filename"] if args["filename"].endswith(".md") else args["filename"] + ".md"
    
    with open(filename, "w") as f:
        f.write(args["content"])
        
    return {"content": [{"type": "text", "text": f"Wrote to {filename}"}]}

async def main():
    server = create_sdk_mcp_server("parallel", "1.0.0", [parallel_search, write_markdown])
    tools = ["mcp__parallel__parallel_search", "mcp__parallel__write_markdown"]
    system_prompt = "You are a deep research assistant. You are given a task and you need to research the task and provide a detailed report."

    options = ClaudeAgentOptions(mcp_servers={"parallel": server}, allowed_tools=tools, system_prompt=system_prompt)

    async with ClaudeSDKClient(options=options) as client:
        while True:
            prompt = input("\nYou: ")
            if prompt.lower() in ["exit", "quit"]:
                break
            await client.query(prompt)
            async for msg in client.receive_response():
                if isinstance(msg, AssistantMessage):
                    for block in msg.content:
                        if isinstance(block, TextBlock):
                            print(f"\nAgent: {block.text}")

if __name__ == "__main__":
    asyncio.run(main())