import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteNav } from '@/components/SiteNav'
import { BRAND, BRAND_DARK, BRAND_LIGHT, brandCtaStyle, brandLogoStyle } from '@/components/brand'

export const metadata: Metadata = {
  title: 'Enterprise',
  description:
    'ZizkaDB Enterprise — governed operational platform for production agentic and multi-agent systems. VPC deploy, SSO, RBAC, SLA.',
}

const ENTERPRISE_GITHUB = 'https://github.com/Zizka-ai/Zizka-Enterprise'
const CONTACT = 'mailto:founder@zizka.ai?subject=ZizkaDB%20Enterprise'

const PLATFORM_FEATURES = [
  'Commercial license — no AGPL obligations on your proprietary stack',
  'Dedicated cloud or VPC / on-prem deployment',
  'SSO (SAML/OIDC) + SCIM + RBAC (admin, operator, viewer, auditor)',
  'Multi-agent fleet at scale — tenant-wide keys, org namespaces, environments',
  'Causal lineage (`why()`), drift baselines, semantic memory — same open core',
  'Audit export, retention policies, GDPR erasure controls',
  'Drift alerting to Slack / PagerDuty',
  'SLA + named priority support',
]

const LAUNCH_INCLUDES = [
  '4-week integration sprint — 2 agentic workflows instrumented',
  'Multi-agent key strategy workshop',
  'Incident runbooks: complaint → why() → containment → audit pack',
  'Handoff training for ops and compliance teams',
]

export default function EnterprisePage() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111', background: '#fff', minHeight: '100vh' }}>
      <SiteNav active="enterprise" suffix="Enterprise" />

      {/* Hero */}
      <section style={{
        padding: '72px 40px 64px',
        background: 'linear-gradient(165deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', marginBottom: 20,
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(129,140,248,0.35)',
            color: '#a5b4fc', fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 100,
            letterSpacing: 0.5,
          }}>
            ZIZKA ENTERPRISE
          </div>
          <h1 style={{
            fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1.1,
            letterSpacing: -1.2, margin: '0 0 20px',
          }}>
            Production agentic systems,<br />
            <span style={{ color: '#a5b4fc' }}>governed and frictionless.</span>
          </h1>
          <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.65, maxWidth: 640, margin: '0 auto 32px' }}>
            Run multi-agent fleets in your VPC with causal memory, drift detection, and compliance —
            plus integration sprints so you ship agentic AI without reinventing operations.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={CONTACT} style={{
              ...brandCtaStyle,
              padding: '14px 28px', fontSize: 16, fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
            }}>
              Talk to us →
            </a>
            <a
              href={ENTERPRISE_GITHUB}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '14px 28px', fontSize: 16, fontWeight: 600,
                color: '#e2e8f0', textDecoration: 'none', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)',
              }}
            >
              Enterprise repo ↗
            </a>
            <Link href="/" style={{
              padding: '14px 20px', fontSize: 15, fontWeight: 500, color: '#94a3b8', textDecoration: 'none',
            }}>
              ← ZizkaDB Cloud
            </Link>
          </div>
        </div>
      </section>

      {/* vs Cloud */}
      <section style={{ padding: '64px 40px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
            Open core + Enterprise edition
          </h2>
          <p style={{ textAlign: 'center', color: '#555', fontSize: 15, marginBottom: 40, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
            <Link href="/" style={{ color: BRAND_DARK, fontWeight: 600 }}>ZizkaDB</Link> stays open source on GitHub.
            Enterprise adds deployment, license, governance, and services for regulated production.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: `2px solid ${BRAND}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: BRAND, marginBottom: 8 }}>COMMUNITY & CLOUD</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>db.zizka.ai</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['AGPL open source', 'Managed cloud free trial', 'MCP + Python + TypeScript SDK', 'Self-host Docker'].map(f => (
                  <li key={f} style={{ fontSize: 14, color: '#444' }}>✓ {f}</li>
                ))}
              </ul>
              <Link href="/signup" style={{ display: 'inline-block', marginTop: 20, ...brandCtaStyle, fontSize: 14 }}>
                Start free →
              </Link>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '2px solid #6366f1' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', marginBottom: 8 }}>ENTERPRISE</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Your VPC / dedicated</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Commercial license', 'SSO + RBAC + audit', 'Multi-agent fleet governance', 'Integration sprint + SLA'].map(f => (
                  <li key={f} style={{ fontSize: 14, color: '#444' }}>✓ {f}</li>
                ))}
              </ul>
              <a href={CONTACT} style={{
                display: 'inline-block', marginTop: 20, padding: '10px 20px',
                background: '#4f46e5', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14,
              }}>
                Contact sales →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Platform features */}
      <section style={{ padding: '64px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32, textAlign: 'center' }}>
            Enterprise Platform
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PLATFORM_FEATURES.map(f => (
              <li key={f} style={{
                display: 'flex', gap: 12, fontSize: 15, color: '#333', lineHeight: 1.5,
                padding: '14px 18px', background: '#fafafa', borderRadius: 10, border: '1px solid #eee',
              }}>
                <span style={{ color: '#4f46e5', fontWeight: 700 }}>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Launch package */}
      <section style={{ padding: '64px 40px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
            Enterprise Launch
          </h2>
          <p style={{ textAlign: 'center', color: '#555', marginBottom: 32 }}>
            Done-with-you — from pilot to governed production in four weeks.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {LAUNCH_INCLUDES.map((item, i) => (
              <div key={item} style={{
                background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', marginBottom: 8 }}>WEEK {i + 1}–4</div>
                <p style={{ fontSize: 14, color: '#334155', margin: 0, lineHeight: 1.55 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-agent */}
      <section style={{ padding: '64px 40px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Built for multi-agent fleets</h2>
          <p style={{ fontSize: 16, color: '#555', lineHeight: 1.65, marginBottom: 24 }}>
            One app, thousands of logical agents (<code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4 }}>conv-&#123;userId&#125;</code>),
            per-team namespaces, drift across the fleet — tenant-wide keys and org RBAC included.
          </p>
          <Link href="/docs" style={{ color: BRAND_DARK, fontWeight: 600 }}>Multi-agent docs →</Link>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '72px 40px',
        background: 'linear-gradient(165deg, #312e81 0%, #1e1b4b 100%)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
          Ready for production agentic AI?
        </h2>
        <p style={{ fontSize: 16, color: '#a5b4fc', marginBottom: 28, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
          Book a discovery call — we&apos;ll map your agentic flows and whether Enterprise Launch fits.
        </p>
        <a href={CONTACT} style={{
          display: 'inline-block', padding: '16px 32px',
          background: '#fff', color: '#312e81', borderRadius: 12,
          textDecoration: 'none', fontWeight: 700, fontSize: 16,
        }}>
          founder@zizka.ai →
        </a>
      </section>

      <footer style={{ borderTop: '1px solid #f0f0f0', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontSize: 13, color: '#999' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ ...brandLogoStyle, width: 22, height: 22, borderRadius: 5 }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>Z</span>
          </div>
          <span>ZizkaDB Enterprise</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="/" style={{ color: '#666', textDecoration: 'none' }}>Cloud</Link>
          <Link href="/docs" style={{ color: '#666', textDecoration: 'none' }}>Docs</Link>
          <a href={ENTERPRISE_GITHUB} target="_blank" rel="noreferrer" style={{ color: '#666', textDecoration: 'none' }}>GitHub ↗</a>
        </div>
      </footer>
    </div>
  )
}
