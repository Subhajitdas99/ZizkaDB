# CrewAI + ZizkaDB starter

```bash
cp .env.example .env
pip install -r requirements.txt
python agent.py
```

Monorepo dev: `pip install -e sdk/python -e integrations/crewai` instead of git URL in requirements.

`ZizkaDBCrewLogger` logs kickoff and final output with `parent_id` linkage.
