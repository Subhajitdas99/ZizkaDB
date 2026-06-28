import Link from 'next/link'
import type { ReactNode } from 'react'
import { M, container, h2, lead, sectionTitle } from './marketing-theme'

const GITHUB_URL = 'https://github.com/Zizka-ai/ZizkaDB'

const MCP_CONFIG = `{
  "mcpServers": {
    "zizkadb": {
      "command": "uvx",
      "args": ["zizkadb-mcp"],
      "env": { "ZIZKADB_API_KEY": "zizkadb_live_xxxx" }
    }
  }
}`

function CodeBlock({ children, lang }: { children: string; lang?: string }) {
  return (
    <pre style={{
      margin: '12px 0 0',
      padding: '14px 16px',
      borderRadius: 10,
      background: '#000',
      border: '2px solid #000',
      fontSize: 11.5,
      lineHeight: 1.65,
      overflowX: 'auto',
      color: '#fff',
      fontFamily: 'JetBrains Mono, Menlo, monospace',
    }}>
      {lang && (
        <span style={{
          display: 'block', fontSize: 10, color: M.blueLight, marginBottom: 8,
          textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif', fontWeight: 800,
        }}>
          {lang}
        </span>
      )}
      {children}
    </pre>
  )
}

function ConnectStep({ n, title, children, accent }: { n: number; title: string; children: ReactNode; accent: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        background: '#fff', border: `2px solid ${accent}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800, color: accent,
      }}>{n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#000', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: '#000', lineHeight: 1.6, fontWeight: 500 }}>{children}</div>
      </div>
    </div>
  )
}

export function ThreeWaysConnectSection() {
  return (
    <section id="how" className="zdb-section" style={{ padding: '88px 40px', background: M.wash }}>
      <div style={container(1060)}>
        <p style={sectionTitle}>How it works</p>
        <h2 style={h2}>Three ways to connect</h2>
        <p style={lead}>
          Managed cloud, MCP in Claude / Cursor / OpenAI, or self-hosted on your infrastructure — same SDKs and API.
        </p>

        <div className="zdb-connect-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {/* 1 — Managed cloud */}
          <div style={{
            background: '#fff', border: `2px solid ${M.violet}`,
            borderRadius: 18, padding: '24px 22px', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: M.violet, marginBottom: 8,
            }}>
              1 · Managed cloud
            </div>
            <p style={{ fontSize: 13, color: '#000', margin: '0 0 4px', lineHeight: 1.55, fontWeight: 500 }}>
              We run Postgres, vectors, and the dashboard at{' '}
              <strong style={{ color: '#000' }}>db.zizka.ai</strong>. Sign up, create an agent, copy your API key.
            </p>
            <ConnectStep n={1} title="Create account" accent={M.violet}>
              <Link href="/signup" style={{ color: M.violet, fontWeight: 700 }}>db.zizka.ai/signup</Link>
              {' '}— email OTP, no card required.
            </ConnectStep>
            <ConnectStep n={2} title="Create agent & API key" accent={M.violet}>
              Open{' '}
              <Link href="/dashboard" style={{ color: M.violet, fontWeight: 700 }}>Dashboard → Create agent</Link>
              {' '}and copy your key (<code style={{ fontFamily: 'monospace', fontSize: 11, color: '#000' }}>zizkadb_live_…</code>).
            </ConnectStep>
            <ConnectStep n={3} title="Log from your code" accent={M.violet}>
              Same agent name in every log call. Python SDK example below.
            </ConnectStep>
            <CodeBlock lang="python">{`pip install zizkadb-sdk

from zizkadb import ZizkaDB
db = ZizkaDB("zizkadb_live_xxxx")
await db.log(agent="my-bot", event="started", data={})`}</CodeBlock>
          </div>

          {/* 2 — MCP */}
          <div style={{
            background: '#fff', border: `2px solid ${M.blue}`,
            borderRadius: 18, padding: '24px 22px', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: M.blue, marginBottom: 8,
            }}>
              2 · MCP
            </div>
            <p style={{ fontSize: 13, color: '#000', margin: '0 0 4px', lineHeight: 1.55, fontWeight: 500 }}>
              Plug ZizkaDB into <strong style={{ color: '#000' }}>Claude Desktop</strong>,{' '}
              <strong style={{ color: '#000' }}>Cursor</strong>, or <strong style={{ color: '#000' }}>OpenAI</strong> MCP clients. No app refactor.
            </p>
            <ConnectStep n={1} title="Install the MCP server" accent={M.blue}>
              Requires <code style={{ fontFamily: 'monospace', fontSize: 11, color: '#000' }}>uvx</code>{' '}
              (<a href="https://docs.astral.sh/uv/" target="_blank" rel="noreferrer" style={{ color: M.blue, fontWeight: 700 }}>uv</a>) or{' '}
              <code style={{ fontFamily: 'monospace', fontSize: 11, color: '#000' }}>pip install zizkadb-mcp</code>.
            </ConnectStep>
            <ConnectStep n={2} title="Add config & reload" accent={M.blue}>
              Paste into <code style={{ fontFamily: 'monospace', fontSize: 11, color: '#000' }}>~/.cursor/mcp.json</code> (Cursor), Claude Desktop config, or your OpenAI MCP settings. Reload MCP servers.
            </ConnectStep>
            <CodeBlock lang="json">{MCP_CONFIG}</CodeBlock>
            <p style={{ fontSize: 11, color: '#000', margin: '12px 0 0', lineHeight: 1.5, fontWeight: 600 }}>
              Claude: <code style={{ fontFamily: 'monospace', fontSize: 10 }}>~/Library/Application Support/Claude/claude_desktop_config.json</code>
            </p>
          </div>

          {/* 3 — Self-hosted */}
          <div style={{
            background: '#fff', border: `2px solid ${M.teal}`,
            borderRadius: 18, padding: '24px 22px', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: M.teal, marginBottom: 8,
            }}>
              3 · Self-hosted
            </div>
            <p style={{ fontSize: 13, color: '#000', margin: '0 0 4px', lineHeight: 1.55, fontWeight: 500 }}>
              Run the full stack on your laptop or VPS — AGPL, free forever. Same SDKs and MCP; point at your own API URL.
            </p>
            <ConnectStep n={1} title="Clone & start" accent={M.teal}>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" style={{ color: M.teal, fontWeight: 700 }}>github.com/Zizka-ai/ZizkaDB</a>
              {' '}→ <code style={{ fontFamily: 'monospace', fontSize: 11, color: '#000' }}>bash scripts/setup-local.sh</code>
            </ConnectStep>
            <ConnectStep n={2} title="Install SDK" accent={M.teal}>
              Python or TypeScript — same API as managed cloud, different host.
            </ConnectStep>
            <CodeBlock lang="python">{`pip install zizkadb-sdk

from zizkadb import ZizkaDB
db = ZizkaDB(host="http://localhost:8000")
await db.log(agent="my-bot", event="started", data={})`}</CodeBlock>
            <CodeBlock lang="typescript">{`npm install zizkadb-sdk

import { ZizkaDB } from 'zizkadb-sdk'
const db = new ZizkaDB({ host: 'http://localhost:8000' })
await db.log({ agent: 'my-bot', event: 'started', data: {} })`}</CodeBlock>
            <p style={{ fontSize: 12, margin: '14px 0 0', fontWeight: 600 }}>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" style={{ color: M.teal, fontWeight: 700 }}>
                View on GitHub →
              </a>
              {' · '}
              <Link href="/docs" style={{ color: '#000', fontWeight: 700 }}>
                Full docs
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
