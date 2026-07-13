# Worked example 01 — Support order delay

A minimal agent session you can run in under a minute after [OSS quickstart](../../README.md#quickstart-oss).

## Story

A **support-bot** receives *"Why was my order delayed?"*, calls the LLM, then invokes `lookup_order` for **ORD-8842**. Each step is logged with `parent_id` so you can walk backward with `why()`.

## Run it

From the repo root (stack must be running):

```bash
bash scripts/quickstart.sh
```

Or step by step:

```bash
bash scripts/setup-local.sh
pip install zizkadb-sdk
zizkadb demo
# or: python worked/01-support-order-delay/demo.py
```

## Expected output

```
tool_call: {'tool': 'lookup_order', 'order_id': 'ORD-8842'}
  └── llm_response: {'model': 'gpt-4o', 'tokens': 412}
        └── user_message: {'text': 'Why was my order delayed?'}
```

## Dashboard

1. Open http://localhost:3001/login  
2. Click **Open my dashboard →**  
3. Open agent **support-bot** → Events / sessions

## Next

- [CONNECT.md](../../CONNECT.md) — wire your own agent (Python, TypeScript, LangChain, CrewAI, MCP, REST)  
- `zizkadb init my-agent --template basic` — scaffold a project  
- [examples/](../../examples/) — fuller agent samples
