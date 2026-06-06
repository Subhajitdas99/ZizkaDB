# LangChain + ZizkaDB starter

```bash
cp .env.example .env
pip install -r requirements.txt
python agent.py
```

Monorepo dev: `pip install -e sdk/python -e integrations/langchain` instead of git URL in requirements.

Uses `ZizkaDBCallbackHandler` — pass it in `config={"callbacks": [handler]}` on any LangChain runnable.
