"""Jinja2 email template rendering."""

from __future__ import annotations

from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

_TEMPLATES_DIR = Path(__file__).resolve().parents[2] / "templates" / "email"

_env = Environment(
    loader=FileSystemLoader(str(_TEMPLATES_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)


def render_template(template_name: str, context: dict) -> tuple[str, str]:
    """Return (html_body, text_body). Text template is optional (.txt)."""
    html_tpl = _env.get_template(f"{template_name}.html")
    html_body = html_tpl.render(**context)
    text_name = f"{template_name}.txt"
    try:
        text_tpl = _env.get_template(text_name)
        text_body = text_tpl.render(**context)
    except Exception:
        text_body = _strip_html_fallback(html_body)
    return html_body, text_body


def render_subject(template: str, context: dict) -> str:
    return template.format(**context)


def _strip_html_fallback(html: str) -> str:
    import re

    text = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\s+", " ", text).strip()
