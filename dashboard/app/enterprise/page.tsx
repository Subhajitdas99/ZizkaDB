'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { SiteNav } from '@/components/SiteNav'
import { ENTERPRISE_CONTACT } from '@/lib/enterprise'

const btnPrimary: CSSProperties = {
  display: 'inline-block',
  padding: '12px 22px',
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 14,
  textDecoration: 'none',
  background: '#4f46e5',
  color: '#fff',
}

const btnOutline: CSSProperties = {
  display: 'inline-block',
  padding: '12px 22px',
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 14,
  textDecoration: 'none',
  border: '1px solid #ddd',
  color: '#111',
  background: '#fff',
}

export default function EnterprisePage() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#111', background: '#fff', minHeight: '100vh' }}>
      <SiteNav active="enterprise" suffix="Enterprise" />

      <header style={{
        padding: '72px 24px 64px',
        textAlign: 'center',
        background: 'linear-gradient(165deg, #0f172a, #1e293b, #0f172a)',
        color: '#fff',
      }}>
        <div style={{
          display: 'inline-block',
          marginBottom: 20,
          padding: '6px 14px',
          borderRadius: 100,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.5,
          background: 'rgba(99,102,241,.15)',
          border: '1px solid rgba(129,140,248,.35)',
          color: '#a5b4fc',
        }}>
          ZIZKA ENTERPRISE
        </div>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 44px)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: -1,
          marginBottom: 20,
        }}>
          Production agentic systems,<br />
          <span style={{ color: '#a5b4fc' }}>governed and frictionless.</span>
        </h1>
        <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 640, margin: '0 auto 32px' }}>
          Run multi-agent fleets in your VPC with causal memory, drift detection, and compliance —
          plus integration sprints so you ship agentic AI without reinventing operations.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={ENTERPRISE_CONTACT} style={btnPrimary}>Talk to us →</a>
          <Link href="/signup" style={{
            ...btnOutline,
            color: '#e2e8f0',
            borderColor: 'rgba(255,255,255,.2)',
            background: 'rgba(255,255,255,.06)',
          }}>
            ZizkaDB Cloud →
          </Link>
        </div>
      </header>

      <section style={{ padding: '64px 24px', background: '#fafafa' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>Open core + Enterprise edition</h2>
        <p style={{ textAlign: 'center', color: '#555', maxWidth: 620, margin: '0 auto 40px', fontSize: 15 }}>
          <Link href="/" style={{ color: '#4f46e5' }}>ZizkaDB</Link> stays open source. Enterprise adds deployment, license, governance, and services.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          maxWidth: 1000,
          margin: '0 auto',
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e5e5e5' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#f97316', marginBottom: 8 }}>COMMUNITY &amp; CLOUD</div>
            <h3 style={{ fontSize: 20, marginBottom: 12 }}>db.zizka.ai</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0' }}>
              {['AGPL open source', 'Managed cloud free trial', 'MCP + Python + TypeScript SDK', 'Self-host Docker'].map((item) => (
                <li key={item} style={{ fontSize: 14, color: '#444' }}>
                  <span style={{ color: '#4f46e5', fontWeight: 700 }}>✓ </span>{item}
                </li>
              ))}
            </ul>
            <Link href="/signup" style={btnOutline}>Start free →</Link>
          </div>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '2px solid #6366f1' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', marginBottom: 8 }}>ENTERPRISE</div>
            <h3 style={{ fontSize: 20, marginBottom: 12 }}>Your VPC / dedicated</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0' }}>
              {['Commercial license', 'SSO + RBAC + audit', 'Multi-agent fleet governance', 'Integration sprint + SLA'].map((item) => (
                <li key={item} style={{ fontSize: 14, color: '#444' }}>
                  <span style={{ color: '#4f46e5', fontWeight: 700 }}>✓ </span>{item}
                </li>
              ))}
            </ul>
            <a href={ENTERPRISE_CONTACT} style={btnPrimary}>Contact sales →</a>
          </div>
        </div>
      </section>

      <section style={{ padding: '64px 24px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>Enterprise Platform</h2>
        <p style={{ textAlign: 'center', color: '#555', maxWidth: 620, margin: '0 auto 40px', fontSize: 15 }}>
          Same ZizkaDB engine — causal lineage, semantic memory, fleet drift — with commercial packaging.
        </p>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            'Commercial license — no AGPL obligations on your proprietary stack',
            'Dedicated cloud or VPC / on-prem deployment',
            'SSO (SAML/OIDC) + SCIM + RBAC',
            'Multi-agent fleet at scale — tenant-wide keys, org namespaces',
            'Audit export, retention policies, GDPR erasure',
            'Drift alerting to Slack / PagerDuty + SLA support',
          ].map((feature) => (
            <div key={feature} style={{ padding: '14px 18px', background: '#fafafa', border: '1px solid #eee', borderRadius: 10, fontSize: 15 }}>
              {feature}
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '64px 24px', background: '#fafafa' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>Enterprise Launch</h2>
        <p style={{ textAlign: 'center', color: '#555', maxWidth: 620, margin: '0 auto 40px', fontSize: 15 }}>
          Done-with-you — from pilot to governed production in four weeks.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          maxWidth: 1000,
          margin: '0 auto',
        }}>
          {[
            { title: 'Integration sprint', desc: 'Instrument 2 agentic workflows with parent_id lineage and why() runbooks.' },
            { title: 'Multi-agent design', desc: 'Key strategy for conv-{userId} patterns and fleet namespaces.' },
            { title: 'Compliance handoff', desc: 'Audit export, retention, and incident playbooks for ops teams.' },
            { title: 'VPC pilot', desc: 'Deploy in your cloud with commercial license and SSO templates.' },
          ].map((item) => (
            <div key={item.title} style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e5e5e5' }}>
              <strong>{item.title}</strong>
              <p style={{ marginTop: 8, fontSize: 14, color: '#555' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        textAlign: 'center',
        background: 'linear-gradient(165deg, #312e81, #1e1b4b)',
        color: '#fff',
        padding: '72px 24px',
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: '#fff' }}>Ready for production agentic AI?</h2>
        <p style={{ color: '#a5b4fc', marginBottom: 28 }}>
          Book a discovery call — we&apos;ll map your agentic flows and whether Enterprise Launch fits.
        </p>
        <a href={ENTERPRISE_CONTACT} style={{ ...btnOutline, background: '#fff', color: '#312e81', border: 'none' }}>
          founder@zizka.ai →
        </a>
      </section>

      <footer style={{
        padding: 24,
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        fontSize: 13,
        color: '#999',
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        <span>Zizka Enterprise · built on <Link href="/" style={{ color: '#666' }}>ZizkaDB</Link> open core</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link href="/signup" style={{ color: '#666', textDecoration: 'none' }}>Cloud</Link>
          <a href={ENTERPRISE_CONTACT} style={{ color: '#666', textDecoration: 'none' }}>Contact</a>
          <Link href="/docs" style={{ color: '#666', textDecoration: 'none' }}>Docs</Link>
        </div>
      </footer>
    </div>
  )
}
