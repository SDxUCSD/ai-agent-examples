import os
from openai import OpenAI
from dotenv import load_dotenv

def main():
    load_dotenv()
    client = OpenAI(
        api_key=os.environ.get("PARALLEL_API_KEY"),
        base_url="https://api.parallel.ai"
    )
    
    messages = []
    
    print("Chat with Parallel AI (type 'exit' or 'quit' to end)")
    
    while True:
        prompt = input("\nYou: ")
        if prompt.lower() in ["exit", "quit"]:
            break
        
        messages.append({"role": "user", "content": prompt})
        
        print("Assistant: ", end="", flush=True)
        
        stream = client.chat.completions.create(
            model="speed",
            messages=messages,
            stream=True
        )
        
        assistant_response = ""
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                content = chunk.choices[0].delta.content
                print(content, end="", flush=True)
                assistant_response += content
        
        print()
        messages.append({"role": "assistant", "content": assistant_response})

if __name__ == "__main__":
    main()
