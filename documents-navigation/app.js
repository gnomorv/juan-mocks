// Documents navigation app, framed by index.html.
// ?mode=asis renders today's app (Current); ?mode=tobe renders the proposal (Proposed).
// The app keeps its own history stack, so the two framed copies never share browser history.
(() => {
  'use strict';

  const params = new URLSearchParams(location.search);
  const MODE = params.get('mode') === 'tobe' ? 'tobe' : 'asis';
  const toBe = () => MODE === 'tobe';
  document.body.classList.add(toBe() ? 'pro' : 'cur');
  document.documentElement.classList.toggle('dark', params.get('theme') === 'dark');
  if (params.get('pins') === 'off') document.body.classList.add('hide-pins');

  // =====================================================================
  // Synthetic data
  // =====================================================================
  const WS = { slug: 'acme-corp', name: 'Acme Corp', initial: 'A', desc: 'Client workspace for Acme Corp: the website rebuild, the brand refresh, the spring campaign and the support retainer.' };
  const W = 'w';
  const pk = (id) => 'p:' + id;

  const PROJECTS = {
    'website-rebuild': { name: 'Website Rebuild', state: 'active', desc: 'A new marketing site on a headless CMS, live before the spring campaign.', lastBy: 'Ana Ruiz', updated: '2h ago' },
    'brand-refresh': { name: 'Brand Refresh', state: 'active', desc: 'New logo, colours and type, rolled out across web, email and print.', lastBy: 'Sam Patel', updated: '5h ago' },
    'spring-campaign': { name: 'Spring Campaign', state: 'open', desc: 'Launch campaign for the new site: landing pages, email and paid social.', lastBy: 'Ben Carter', updated: '1d ago' },
    'support-retainer': { name: 'Support Retainer', state: 'hold', desc: 'Monthly support hours for the current site until the new one is live.', lastBy: 'Ana Ruiz', updated: '1w ago' },
  };
  const STATE = { open: ['Open', 'green', '#22c55e'], active: ['Active', 'blue', '#3b82f6'], hold: ['On hold', 'amber', '#f59e0b'] };

  // Type -> [abbreviation, rgb, tile text colour] (today's explorer tile palette; unlisted types are slate).
  const SLATE = ['100,116,139', '#94a3b8'];
  const TYPES = {
    'Project Brief': ['BRIEF', ...SLATE], 'Question Ledger': ['LEDGER', ...SLATE], 'Solution Design': ['DESIGN', '59,130,246', '#60a5fa'],
    Specification: ['SPEC', '99,102,241', '#818cf8'], Estimate: ['EST', '16,185,129', '#34d399'], 'Status Report': ['REPORT', ...SLATE],
    Plan: ['PLAN', ...SLATE], Decision: ['ADR', '167,139,250', '#a78bfa'], Reference: ['REF', ...SLATE], Diagram: ['DGM', '245,158,11', '#fbbf24'],
    Runbook: ['RUN', ...SLATE], 'Release Notes': ['REL', '168,85,247', '#c084fc'], SOW: ['SOW', '20,184,166', '#2dd4bf'], MSA: ['MSA', '14,165,233', '#38bdf8'],
  };
  const typeOf = (t) => TYPES[t] || ['DOC', ...SLATE];
  const tvars = (t) => { const x = typeOf(t); return `--c:${x[1]};--t4:${x[2]}`; };

  const WR = pk('website-rebuild'), BR = pk('brand-refresh');
  const FOLDERS = {
    'w-context': { name: 'Account context', owner: W, parent: null, mod: '2d ago · 3:32 PM', created: '9/30/2026' },
    'w-decisions': { name: 'Decisions', owner: W, parent: null, mod: '6d ago · 11:02 AM', created: '8/12/2026' },
    'w-guides': { name: 'Guides', owner: W, parent: null, mod: '2w ago · 4:18 PM', created: '8/12/2026' },
    'w-onboarding': { name: 'Onboarding', owner: W, parent: 'w-guides', mod: '3w ago · 9:40 AM', created: '9/1/2026' },
    's-intake': { name: '1. Intake', owner: WR, parent: null, mod: '3w ago · 10:05 AM', created: '10/2/2026' },
    's-design': { name: '2. Design', owner: WR, parent: null, mod: 'Yesterday · 5:47 PM', created: '10/2/2026' },
    's-drafts': { name: 'Drafts', owner: WR, parent: 's-design', mod: '3w ago · 2:12 PM', created: '10/10/2026' },
    's-delivery': { name: '3. Delivery', owner: WR, parent: null, mod: 'Today · 8:55 AM', created: '10/2/2026' },
    'b-channels': { name: 'Assets by channel', owner: BR, parent: null, mod: '8d ago · 1:20 PM', created: '10/20/2026' },
  };

  const doc = (title, type, owner, folder, status, mod, created, size, lead, by, next) => ({ title, type, owner, folder, status, mod, created, size, lead, by, next });
  const DOCS = {
    'account-charter': doc('Acme Corp Account Charter', 'Project Brief', W, null, 'approved', 'Yesterday · 4:10 PM', '8/2/2026', '6.1 KB', 'Who works on the Acme account, what lives in this workspace, and how the team decides what ships.', 'Ana Ruiz', 'Review at the Q1 planning session'),
    'delivery-approach': doc('Delivery Approach', 'Solution Design', W, null, 'approved', '6d ago · 9:12 AM', '7/19/2026', '18.4 KB', 'How the team plans, builds and hands over work for Acme, from intake to handover.', 'Ben Carter', 'Add the handover checklist'),
    'release-notes-oct': doc('Release Notes · October 2026', 'Release Notes', W, null, 'approved', '4d ago · 2:30 PM', '10/31/2026', '4.7 KB', 'The new navigation, the product pages and the faster search went live on the current site.', 'Sam Patel', 'Send to Acme marketing'),
    'account-overview': doc('Account Overview', 'Reference', W, 'w-context', 'draft', '2d ago · 3:32 PM', '9/30/2026', '3.2 KB', 'Contacts, environments and the commercial frame for the Acme account.', 'Sam Patel', 'Confirm the escalation contacts'),
    'msa-summary': doc('Master Services Agreement Summary', 'MSA', W, 'w-context', 'approved', '3w ago · 10:15 AM', '9/30/2026', '5.0 KB', 'The terms in force with Acme, summarised for the delivery team.', 'Ana Ruiz', 'None'),
    'decision-cms': doc('Decision 01: Headless CMS for the Marketing Site', 'Decision', W, 'w-decisions', 'approved', '6d ago · 11:02 AM', '8/12/2026', '12.9 KB', 'The new site uses a headless CMS so marketing can publish without a developer.', 'Ben Carter', 'None, accepted'),
    'decision-tokens': doc('Decision 02: One Design System for Web and Email', 'Decision', W, 'w-decisions', 'draft', '2w ago · 3:44 PM', '10/13/2026', '15.6 KB', 'Web pages and emails share one set of colour and type tokens.', 'Ana Ruiz', 'Design review on Nov 12'),
    'document-guide': doc('Document Guide', 'Reference', W, 'w-guides', 'approved', '2w ago · 4:18 PM', '10/19/2026', '9.8 KB', 'Which document type to use, where to file it, and when it needs approval.', 'Sam Patel', 'Add the Question Ledger section'),
    'filing-flowchart': doc('Filing Flowchart', 'Diagram', W, 'w-guides', 'approved', '2w ago · 4:20 PM', '10/20/2026', '22.0 KB', 'A one-page decision path for filing any new document.', 'Sam Patel', 'None'),
    'first-week': doc('Your First Week on the Acme Account', 'Runbook', W, 'w-onboarding', 'draft', '3w ago · 9:40 AM', '9/1/2026', '4.4 KB', 'Accounts, environments and the first ticket to pick up.', 'Ana Ruiz', 'Add the CMS sandbox steps'),

    'question-ledger': doc('Question Ledger', 'Question Ledger', WR, null, 'draft', '2h ago · 9:14 AM', '10/2/2026', '7.3 KB', 'Open questions for the website rebuild, each with an owner and a date.', 'Ana Ruiz', 'Answer Q-04 before the design freeze'),
    'rollout-plan': doc('Rollout Plan', 'Plan', WR, null, 'draft', 'Yesterday · 11:30 AM', '10/14/2026', '5.5 KB', 'Three waves: product pages first, then the blog, then the help centre.', 'Ben Carter', 'Pick the wave-1 pages'),
    'project-brief': doc('Project Brief', 'Project Brief', WR, 's-intake', 'approved', '3w ago · 10:05 AM', '10/2/2026', '4.1 KB', 'Why Acme is rebuilding the site, what is in scope, and what is not.', 'Ana Ruiz', 'None'),
    'intake-notes': doc('Intake Call Notes', 'Reference', WR, 's-intake', 'draft', '3w ago · 10:40 AM', '10/2/2026', '2.6 KB', 'Notes from the kickoff with Acme marketing.', 'Sam Patel', 'None'),
    'solution-design': doc('Solution Design · Website Rebuild', 'Solution Design', WR, 's-design', 'draft', 'Yesterday · 5:47 PM', '10/8/2026', '24.8 KB', 'How the site is built: the CMS, the page templates and the content migration.', 'Ben Carter', 'Engineering review on Nov 10'),
    'content-model': doc('Content Model Specification', 'Specification', WR, 's-design', 'draft', '2d ago · 1:05 PM', '10/9/2026', '11.2 KB', 'The content types, fields and relations the CMS stores.', 'Ana Ruiz', 'Freeze the field names'),
    'page-templates': doc('Page Templates', 'Specification', WR, 's-design', 'draft', '4d ago · 3:20 PM', '10/12/2026', '8.6 KB', 'The five page templates for wave 1 and the blocks each one allows.', 'Ben Carter', 'Add the article template'),
    'sitemap-v0': doc('Sitemap v0', 'Diagram', WR, 's-drafts', 'draft', '3w ago · 2:12 PM', '10/10/2026', '3.9 KB', 'First cut of the new page structure.', 'Ben Carter', 'Superseded by v1'),
    'estimate-phase1': doc('Estimate · Phase 1', 'Estimate', WR, 's-delivery', 'approved', 'Today · 8:55 AM', '10/16/2026', '6.0 KB', 'Effort for the templates, the CMS setup and the migration in phase 1.', 'Ana Ruiz', 'Start sprint 1 on Nov 10'),
    'status-week44': doc('Status Report · Week 44', 'Status Report', WR, 's-delivery', 'draft', 'Today · 8:20 AM', '11/2/2026', '3.1 KB', 'Templates in review, content model waiting on field names.', 'Sam Patel', 'Send to Acme on Friday'),

    'brand-plan': doc('Brand Refresh Plan', 'Plan', BR, null, 'draft', '8d ago · 4:02 PM', '10/20/2026', '14.3 KB', 'Channels, owners and dates for rolling out the new brand.', 'Sam Patel', 'Approve the channel order'),
    'web-style': doc('Web Style Sheet', 'Reference', BR, 'b-channels', 'draft', '8d ago · 1:20 PM', '10/20/2026', '6.8 KB', 'Colours, type and spacing for the new site, as design tokens.', 'Sam Patel', 'Approval by the brand owner'),
    'email-templates': doc('Email Templates', 'Reference', BR, 'b-channels', 'draft', '8d ago · 1:24 PM', '10/20/2026', '5.9 KB', 'Header, footer and three body layouts in the new brand.', 'Sam Patel', 'Approval by the brand owner'),
  };
  Object.entries(PROJECTS).forEach(([id, p]) => {
    if (!Object.values(DOCS).some((d) => d.owner === pk(id))) {
      DOCS[id + '-brief'] = doc('Project Brief', 'Project Brief', pk(id), null, 'draft', p.updated, '10/1/2026', '3.4 KB', p.desc, p.lastBy, 'Kickoff');
    }
  });

  const ISSUES = {
    'web-101': { key: 'WEB-101', title: 'Build the product page template', owner: WR, status: 'In Progress', priority: 'High', assignee: 'Ana Ruiz', updated: '2h ago' },
    'web-102': { key: 'WEB-102', title: 'Migrate the blog posts to the CMS', owner: WR, status: 'Todo', priority: 'Medium', assignee: 'Ben Carter', updated: 'Yesterday' },
    'web-103': { key: 'WEB-103', title: 'Validate content against the content model', owner: WR, status: 'In Review', priority: 'Medium', assignee: 'Ana Ruiz', updated: 'Yesterday' },
    'web-104': { key: 'WEB-104', title: 'Write the publishing guide for Acme marketing', owner: WR, status: 'Backlog', priority: 'Low', assignee: 'Sam Patel', updated: '3d ago' },
    'web-105': { key: 'WEB-105', title: 'Redirect the old URLs to the new pages', owner: WR, status: 'Done', priority: 'High', assignee: 'Ben Carter', updated: '4d ago' },
    'br-21': { key: 'BR-21', title: 'Export the new logo in every size', owner: BR, status: 'In Progress', priority: 'High', assignee: 'Sam Patel', updated: '5h ago' },
    'br-22': { key: 'BR-22', title: 'Update the email header and footer', owner: BR, status: 'Todo', priority: 'Medium', assignee: 'Sam Patel', updated: '2d ago' },
  };
  const ISSUE_STATUS = { Backlog: 'gray', Todo: 'gray', 'In Progress': 'blue', 'In Review': 'violet', Done: 'green' };

  const CONVOS = {
    'conv-templates': { title: 'Scoping the page templates', owner: WR, lastBy: 'Ana Ruiz', updated: '3h ago', msgs: [
      ['Ana Ruiz', 'How many page templates do we need for wave 1?'],
      ['Clara', 'The Solution Design lists five: home, product, category, article and contact. The Page Templates specification covers the first three; WEB-101 tracks the product page.'],
      ['Ana Ruiz', 'Good. Add the article template to the Question Ledger as Q-07 so the team can confirm it.'],
    ] },
    'conv-redirects': { title: 'Planning the URL redirects', owner: WR, lastBy: 'Ben Carter', updated: 'Yesterday', msgs: [
      ['Ben Carter', 'Do we keep the old blog URLs?'],
      ['Clara', 'The Rollout Plan keeps them for a year with permanent redirects, so search rankings carry over. WEB-105 added the redirect map.'],
    ] },
    'conv-assets': { title: 'Which assets go first', owner: BR, lastBy: 'Sam Patel', updated: '5h ago', msgs: [
      ['Sam Patel', 'Which brand assets should we update first?'],
      ['Clara', 'The web style sheet and the email templates, because the new site launches with both. The Brand Refresh Plan lists the rest by channel.'],
    ] },
    'conv-q4': { title: 'Q4 planning for the account', owner: W, lastBy: 'Ana Ruiz', updated: '1d ago', msgs: [
      ['Ana Ruiz', 'Summarise what is still open for Q4 across the projects.'],
      ['Clara', 'Two projects are active and carry 18 open issues. Website Rebuild and Brand Refresh have the nearest dates; Support Retainer is on hold.'],
    ] },
    'conv-naming': { title: 'Naming the new site sections', owner: W, lastBy: 'Ben Carter', updated: '4d ago', msgs: [
      ['Ben Carter', 'Should the site say Resources or Learn?'],
      ['Clara', "The Content Model Specification uses Resources, and so do Acme's current menus. Changing it would also change 40 URLs."],
    ] },
  };

  const AGREEMENTS = {
    'acme-msa-2026': { code: 'ACME-MSA-2026', name: 'Master Services Agreement', account: 'Acme Corp', kind: 'Master', status: 'Active', from: 'Jan 1, 2026', owner: W },
    'acme-sow-014': { code: 'ACME-SOW-014', name: 'Website Rebuild · Statement of Work', account: 'Acme Corp', kind: 'Contract', status: 'Pending signature', from: 'Nov 10, 2026', owner: W },
    'acme-add-003': { code: 'ACME-ADD-003', name: 'Hosting addendum', account: 'Acme Corp', kind: 'Addendum', status: 'Draft', from: '—', owner: W },
  };
  const AGREEMENT_STATUS = { Active: 'green', 'Pending signature': 'amber', Draft: 'gray' };

  const CONNECTORS = {
    'gh-website': { name: 'acme-website repository', provider: 'GitHub', cap: 'Code', source: 'From Asset', owner: W, envs: '1 environment · default: prod' },
    'azure-sql': { name: 'Analytics database', provider: 'Azure SQL', cap: 'Database', source: 'From Organization', owner: W, envs: '2 environments · default: prod' },
    'slack-team': { name: 'Team Slack', provider: 'Slack', cap: 'Messaging', source: 'From Organization', owner: W, envs: '1 environment · default: prod' },
    'jira-legacy': { name: 'Legacy Jira board', provider: 'Jira', cap: 'Issues', source: 'Disabled', owner: W, envs: '1 environment · default: prod' },
    'gh-cms': { name: 'acme-cms repository', provider: 'GitHub', cap: 'Code', source: null, owner: WR, envs: '1 environment · default: main' },
    'mcp-cms': { name: 'CMS content server', provider: 'Custom MCP', cap: 'Tools', source: null, owner: WR, envs: '1 environment · default: dev' },
    'mcp-assets': { name: 'Asset library server', provider: 'Custom MCP', cap: 'Tools', source: null, owner: BR, envs: '1 environment · default: prod' },
  };

  const ASSETS = {
    'asset-site': { name: 'Acme website repository', sub: 'GitHub · acme-example/website', owner: W, kind: 'Repository' },
    'asset-tokens': { name: 'Design tokens', sub: 'GitHub · acme-example/design-tokens', owner: W, kind: 'Repository' },
    'asset-db': { name: 'Analytics warehouse', sub: 'Azure SQL · read only', owner: W, kind: 'Database' },
  };

  const ACTIVITY = {
    [W]: [
      ['doc', 'Sam Patel approved <b>Release Notes · October 2026</b>', 'Document', '4d ago', 'd', 'release-notes-oct'],
      ['doc', 'Sam Patel created <b>Account Overview</b>', 'Document · Account context', '2d ago', 'd', 'account-overview'],
      ['agree', 'Ana Ruiz sent <b>ACME-SOW-014</b> for signature', 'Agreement', '3d ago', 'a', 'acme-sow-014'],
      ['chat', 'Ben Carter started <b>Naming the new site sections</b>', 'Conversation', '4d ago', 'c', 'conv-naming'],
      ['link', 'Sam Patel added the connector <b>Analytics database</b>', 'Connector', '1w ago', 'k', 'azure-sql'],
    ],
    [WR]: [
      ['doc', 'Ana Ruiz updated <b>Question Ledger</b>', 'Document · 3 questions added', '2h ago', 'd', 'question-ledger'],
      ['issue', 'Ana Ruiz moved <b>WEB-103</b> to In Review', 'Issue · Validate content against the content model', 'Yesterday', 'i', 'web-103'],
      ['doc', 'Ben Carter edited <b>Solution Design · Website Rebuild</b>', 'Document · 2. Design', 'Yesterday', 'd', 'solution-design'],
      ['chat', 'Ben Carter started <b>Planning the URL redirects</b>', 'Conversation', 'Yesterday', 'c', 'conv-redirects'],
      ['issue', 'Ben Carter closed <b>WEB-105</b>', 'Issue · Redirect the old URLs to the new pages', '4d ago', 'i', 'web-105'],
    ],
    [BR]: [
      ['issue', 'Sam Patel moved <b>BR-21</b> to In Progress', 'Issue', '5h ago', 'i', 'br-21'],
      ['doc', 'Sam Patel created <b>Web Style Sheet</b>', 'Document · Assets by channel', '8d ago', 'd', 'web-style'],
    ],
  };

  const AI_ACTIVITY = [
    ['add_comment', 'comment.create', 'Agent · on behalf of Ana Ruiz · "claude-code/2.4"', 'Touched: comment 6f1c…a92e (create)', '12m ago', '258ms'],
    ['update_document', 'document.update', 'Agent · on behalf of Ben Carter · "claude-code/2.4"', 'Touched: document Delivery Approach (update)', '1h ago', '412ms'],
    ['search', 'search.lexical', 'Agent · on behalf of Sam Patel · "cursor/1.9"', 'Read: 14 hits across documents and issues', '3h ago', '96ms'],
    ['fetch', 'document.read', 'Agent · on behalf of Ana Ruiz · "claude-code/2.4"', 'Read: document Account Overview (section 3)', '5h ago', '131ms'],
  ];

  // =====================================================================
  // Helpers
  // =====================================================================
  const P = {
    home: 'M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
    folder: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    doc: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    issue: 'M12 21a9 9 0 100-18 9 9 0 000 18z',
    link: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    agree: 'M9 12h6m-6 4h6M9 8h6M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    bot: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    box: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    left: 'M15 19l-7-7 7-7', right: 'M9 5l7 7-7 7', arrowLeft: 'M10 19l-7-7m0 0l7-7m-7 7h18', arrowRight: 'M14 5l7 7m0 0l-7 7m7-7H3',
    plus: 'M12 4v16m8-8H4', down: 'M19 9l-7 7-7-7',
    gridV: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z', listV: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01', treeV: 'M5 4v14M5 9h6M5 18h6M11 6h9v5h-9zM11 15h9v5h-9z',
  };
  const icon = (n, s = 16) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]}"/></svg>`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const AV = { 'Ana Ruiz': '#0d9488', 'Ben Carter': '#ea580c', 'Sam Patel': '#7c3aed', Clara: '#43b6e7' };
  const initials = (n) => n.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase();
  const avatar = (n) => `<span class="av" style="background:${AV[n] || '#64748b'}">${n === 'Clara' ? 'C' : initials(n)}</span>`;
  const pin = (n) => (toBe() ? `<span class="pin">${n}</span>` : '');

  // Type roles: today's measured c-* styles, or the proposed t-* roles.
  const T = toBe()
    ? { h1: 't-page-title', ctx: 't-page-context', tab: 't-tab', sec: 't-section', th: 't-th', strong: 't-value', muted: 't-meta', body: 't-body', body2: 't-body-2', link: 't-link', card: 't-card-title', over: 't-overline', stat: 't-stat', statl: 't-stat-label', term: 't-term' }
    : { h1: 'c-h1', ctx: 'c-sub16', tab: 'c-tab', sec: 'c-h2-18', th: 'c-th', strong: 'c-body fw5', muted: 'c-help500', body: 'c-body', body2: 'c-body-600', link: 'c-link500', card: 'c-h-15', over: 'c-uc12', stat: 'c-stat', statl: 'c-statlbl', term: 'c-term' };
  const badge = (label, tone) => (toBe() ? `<span class="chip t-badge ${tone}">${esc(label)}</span>` : `<span class="c-badge ${tone}">${esc(label)}</span>`);

  // =====================================================================
  // Routes and in-app history
  // /w/<slug>?tab=&folder=&hl=   /p/<id>?tab=&folder=&hl=   items /d /i /c /a /k /s ?from=<owner>~<tab>~<folder>
  // =====================================================================
  function qs(o) { const s = Object.entries(o).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join('&'); return s ? '?' + s : ''; }
  const ownerUrl = (owner, tab, o = {}) => (owner === W ? `/w/${WS.slug}` : `/p/${owner.slice(2)}`) + qs({ tab: tab && tab !== 'overview' ? tab : '', folder: toBe() ? o.folder : '', hl: o.hl });
  // Today the item link carries no origin; the proposal adds ?from=.
  const itemUrl = (kind, id, from) => `/${kind}/${id}` + (toBe() ? qs({ from }) : '');
  const fromStr = (owner, tab, folder) => [owner, tab, folder || ''].join('~');
  const ownerName = (owner) => (owner === W ? WS.name : PROJECTS[owner.slice(2)].name);
  const folderPath = (fid) => { const out = []; for (let f = fid; f; f = FOLDERS[f].parent) out.unshift(f); return out; };
  const href = (route) => `#${route}`;

  const WS_TABS = [['overview', 'Overview'], ['agreements', 'Agreements'], ['documents', 'Documents'], ['conversations', 'Conversations'], ['activity', 'Activity'], ['ai-activity', 'AI Activity'], ['connectors', 'Connectors'], ['assets', 'Assets'], ['settings', 'Settings']];
  const PROJECT_TABS = [['overview', 'Overview'], ['issues', 'Issues'], ['documents', 'Documents'], ['conversations', 'Conversations'], ['activity', 'Activity'], ['connectors', 'Connectors'], ['settings', 'Settings']];
  const tabsFor = (owner) => (owner === W ? WS_TABS : PROJECT_TABS);
  const tabLabel = (owner, tab) => (tabsFor(owner).find((t) => t[0] === tab) || [tab, tab])[1];

  const START = { w: `/w/${WS.slug}?tab=documents`, p: '/p/website-rebuild?tab=documents' };
  let flow = params.get('flow') === 'w' ? 'w' : 'p';
  const H = { stack: [START[flow]], i: 0 };
  let clicks = 0;
  // Today the open folder lives only in the explorer's component state: it survives folder
  // clicks but resets whenever the list leaves the screen.
  let ex = { stack: [null], i: 0 };

  const route = () => H.stack[H.i];
  function parse(r) {
    const [path, query] = r.split('?');
    const parts = path.split('/').filter(Boolean);
    return { kind: parts[0], id: parts[1], q: new URLSearchParams(query || '') };
  }
  function go(r) { H.stack = H.stack.slice(0, H.i + 1); H.stack.push(r); H.i++; render(); }
  function replaceRoute(r) { H.stack[H.i] = r; }
  function start(f) { flow = f || flow; H.stack = [START[flow]]; H.i = 0; clicks = 0; render(); }

  // =====================================================================
  // Shell
  // =====================================================================
  function renderAddr() {
    const r = route();
    let shown = esc(r);
    const m = r.match(/([?&])(folder=[^&]*)/);
    if (toBe() && m) shown = esc(r.slice(0, m.index)) + esc(m[1]) + `<span class="hl">${esc(m[2])}</span>` + esc(r.slice(m.index + m[0].length));
    document.getElementById('addr').innerHTML = `
      <button class="nav" data-act="hback" aria-label="Browser back" title="Browser back" ${H.i === 0 ? 'disabled' : ''}>${icon('arrowLeft', 14)}</button>
      <button class="nav" data-act="hfwd" aria-label="Browser forward" title="Browser forward" ${H.i >= H.stack.length - 1 ? 'disabled' : ''}>${icon('arrowRight', 14)}</button>
      <div class="url" title="${esc(r)}"><span class="path">${shown}</span></div>${pin(3)}
      <span class="clicks">Clicks <b>${clicks}</b></span><button class="reset" data-act="restart">Start over</button>`;
  }

  function renderSidebar(activeKey) {
    const projects = Object.entries(PROJECTS).map(([id, p]) => `<a class="side-item ${activeKey === pk(id) ? 'active' : ''}" href="${href(ownerUrl(pk(id)))}"><i></i><span class="nm">${esc(p.name)}</span></a>`).join('');
    document.getElementById('side').innerHTML = `
      <div class="side-head"><span class="side-logo"></span>Clara Studio</div>
      <div class="side-ws"><span class="av" style="border-radius:5px;width:22px;height:22px;background:#0369a1">${WS.initial}</span><div><b>${WS.name}</b><small>Workspace · ${Object.keys(PROJECTS).length} projects</small></div></div>
      <div class="side-item"><i></i>Dashboard</div>
      <a class="side-item ${activeKey === W ? 'active' : ''}" href="${href(ownerUrl(W))}"><i></i>Overview</a>
      <div class="side-item"><i></i>Issue Board</div>
      <div class="side-item"><i></i>Project Board</div>
      <hr><div class="side-group">Projects (${Object.keys(PROJECTS).length})</div>${projects}
      <hr><div class="side-group">Starred</div><div class="side-group">${activeKey.startsWith('p:') ? 'Project documents' : 'Documents'}</div><div class="side-group">Conversations</div>`;
  }

  // crumbs: [{label, type, href}] ; last one is the current page.
  function renderCrumbs(crumbs, pinNo) {
    const parts = crumbs.map((c, i) => {
      const last = i === crumbs.length - 1;
      const type = !toBe() && c.type ? ` <span class="c-meta11" style="font-size:10px">(${c.type})</span>` : '';
      const el = last ? `<span class="here" aria-current="page">${esc(c.label)}</span>` : `<a href="${href(c.href)}" title="${esc(c.label)}">${esc(c.label)}</a>${type}`;
      return `<span class="cg">${i ? '<span class="sep">›</span>' : ''}${el}</span>`;
    });
    document.getElementById('top').innerHTML = `<nav class="crumbs" aria-label="Breadcrumb">${parts.join('')}</nav>${pinNo ? pin(pinNo) : ''}`;
  }

  const tabBar = (owner, active) => `<div class="tabs" role="tablist">${tabsFor(owner).map(([k, l]) => `<a role="tab" aria-selected="${k === active}" class="${T.tab} ${k === active ? 'on' : ''}" href="${href(ownerUrl(owner, k))}">${l}</a>`).join('')}${active !== 'documents' && active !== 'overview' ? pin(5) : ''}</div>`;
  const emptyState = (title, text) => `<div class="empty"><div class="${T.card}">${esc(title)}</div><div class="${T.body2}" style="margin-top:4px">${esc(text)}</div></div>`;
  const hlCls = (hl, id) => (hl === id ? ' flash' : '');
  const hlPin = (hl, id) => (hl === id ? pin(6) : '');

  // =====================================================================
  // Tabs
  // =====================================================================
  function documentsTab(owner, hl) {
    const folderId = ex.stack[ex.i];
    const from = fromStr(owner, 'documents', folderId);
    const folders = Object.entries(FOLDERS).filter(([, f]) => f.owner === owner && f.parent === folderId);
    const docs = Object.entries(DOCS).filter(([, d]) => d.owner === owner && d.folder === folderId);
    const total = Object.values(DOCS).filter((d) => d.owner === owner).length;
    const path = folderPath(folderId);
    const itemCount = (id) => Object.values(DOCS).filter((d) => d.folder === id).length;
    const m = (s) => `<span class="wide">${s}</span>`;
    const rows = folders.map(([id, f]) => `<button type="button" class="lrow" data-act="folder" data-folder="${id}"><span class="emoji">📁</span><span class="nm">${esc(f.name)}</span><span class="ftype">Folder</span>${m(f.mod)}${m(f.created)}${m(plural(itemCount(id), 'item'))}</button>`)
      .concat(docs.map(([id, d]) => `<a class="lrow${hlCls(hl, id)}" href="${href(itemUrl('d', id, from))}"><span class="tile" style="${tvars(d.type)}"><span>${typeOf(d.type)[0]}</span></span><span class="nm">${esc(d.title)}${hlPin(hl, id)}</span><span><span class="pill" style="${tvars(d.type)}">${esc(d.type)}</span></span>${m(d.mod)}${m(d.created)}${m(d.size)}</a>`));
    const trail = [`<button class="fc ${folderId ? '' : 'on'}" data-act="folder" data-folder="">All</button>`]
      .concat(path.map((f, i) => `<button class="fc ${i === path.length - 1 ? 'on' : ''}" data-act="folder" data-folder="${f}">${esc(FOLDERS[f].name)}</button>`)).join('');
    const title = toBe()
      ? `<h2 class="t-section rlt-title">${icon('doc', 18)}Documents<span class="t-count">(${total})</span></h2>`
      : `<div class="rlt-title">${icon('doc', 20)}Documents <span class="cnt">(${total})</span></div>`;
    const sm = toBe() ? '' : ' sm';
    return `<div class="exp">
      <div class="rlt">${title}<div class="btnrow"><span class="btn primary${sm}">${icon('plus', 14)}New Document</span><span class="btn${sm}">${icon('folder', 14)}New Folder</span><span class="btn${sm}">${icon('plus', 14)}New DrawIO</span></div></div>
      <div class="box">
        <div class="tb"><button class="ib" data-act="exback" aria-label="Back" title="Back" ${ex.i ? '' : 'disabled'}>${icon('left')}</button><button class="ib" data-act="exfwd" aria-label="Forward" title="Forward" ${ex.i < ex.stack.length - 1 ? '' : 'disabled'}>${icon('right')}</button>
          <nav class="fcs" aria-label="Folder path">${trail}</nav>
          <div class="vt"><span title="Grid view">${icon('gridV')}</span><span class="on" title="List view">${icon('listV')}</span>${owner === W ? '' : `<span title="Tree view">${icon('treeV')}</span>`}</div></div>
        <div style="min-height:180px"><div class="lrow lhead"><span></span><span class="${toBe() ? 't-th' : ''}">Name</span><span class="${toBe() ? 't-th' : ''}">Type</span><span class="wide ${toBe() ? 't-th' : ''}">Modified</span><span class="wide ${toBe() ? 't-th' : ''}">Created</span><span class="wide ${toBe() ? 't-th' : ''}">Size</span></div>
          ${rows.length ? rows.join('') : emptyState('This folder is empty', 'Create a document or move one here.')}</div>
        <div class="status">${folders.length ? `<span>${plural(folders.length, 'folder')}</span>` : ''}<span>${plural(docs.length, 'file')}</span></div>
      </div></div>`;
  }

  function issuesTab(owner, hl) {
    const from = fromStr(owner, 'issues');
    const list = Object.entries(ISSUES).filter(([, i]) => i.owner === owner);
    if (!list.length) return emptyState('No issues yet', 'Issues for this project will appear here.');
    const cols = 'style="grid-template-columns:90px minmax(0,1fr) 110px 80px 130px 90px"';
    return `<div class="tbl"><div class="tr th" ${cols}><span class="${T.th} hs">ID</span><span class="${T.th}">Title</span><span class="${T.th} hs">Status</span><span class="${T.th} hs">Priority</span><span class="${T.th} hs">Assignee</span><span class="${T.th}">Updated</span></div>
      ${list.map(([id, i]) => `<a class="tr${hlCls(hl, id)}" ${cols} href="${href(itemUrl('i', id, from))}"><span class="mono12 hs">${i.key}</span><span class="${T.strong} trunc">${esc(i.title)}${hlPin(hl, id)}</span><span class="hs">${badge(i.status, ISSUE_STATUS[i.status])}</span><span class="${T.muted} hs">${i.priority}</span><span class="${T.muted} hs who">${avatar(i.assignee)}${i.assignee}</span><span class="${T.muted}">${i.updated}</span></a>`).join('')}</div>`;
  }

  function conversationsTab(owner, hl) {
    const from = fromStr(owner, 'conversations');
    const list = Object.entries(CONVOS).filter(([, c]) => c.owner === owner);
    if (!list.length) return emptyState('No conversations yet', `Start a conversation with Clara about this ${owner === W ? 'workspace' : 'project'}.`);
    const cols = 'style="grid-template-columns:minmax(0,1fr) 170px 100px"';
    return `<div class="tbl"><div class="tr th" ${cols}><span class="${T.th}">Title</span><span class="${T.th} hs">Last active by</span><span class="${T.th}">Updated</span></div>
      ${list.map(([id, c]) => `<a class="tr${hlCls(hl, id)}" ${cols} href="${href(itemUrl('c', id, from))}"><span class="${T.strong} trunc">${esc(c.title)}${hlPin(hl, id)}</span><span class="${T.muted} hs who">${avatar(c.lastBy)}${c.lastBy}</span><span class="${T.muted}">${c.updated}</span></a>`).join('')}</div>`;
  }

  function activityTab(owner, hl) {
    const from = fromStr(owner, 'activity');
    const list = ACTIVITY[owner] || [];
    const cap = `<p class="${T.body2}" style="margin:0 0 12px">Recent activity across this ${owner === W ? 'workspace' : 'project'}, not a full audit log.</p>`;
    if (!list.length) return cap + emptyState('No recent activity yet', 'Changes to issues, documents and conversations show up here.');
    return cap + `<div class="acts">${list.map(([ic, title, detail, time, kind, id]) => `<a class="act${hlCls(hl, id)}" href="${href(itemUrl(kind, id, from))}"><span class="ico">${icon(ic, 18)}</span><span class="grow"><span class="${T.body}" style="display:block">${title}${hlPin(hl, id)}</span><span class="${T.muted}">${esc(detail)}</span></span><span class="${T.muted}">${time}</span></a>`).join('')}</div>`;
  }

  function aiActivityTab() {
    return `<p class="${T.body2}" style="margin:0 0 12px">What AI agents did in this workspace through the Clara MCP.</p><div class="acts">${AI_ACTIVITY.map(([tool, op, who, touched, ago, ms]) => `
      <div class="act"><span class="ico">${icon('bot', 18)}</span><span class="grow"><span class="${T.body}" style="display:block"><b>${tool}</b> <span class="${T.muted}">${op} · via MCP</span></span><span class="${T.muted}" style="display:block">${esc(who)}</span><span class="${T.muted}">${esc(touched)}</span></span><span class="${T.muted}" style="text-align:right">${ago}<br>success<br>${ms}</span></div>`).join('')}</div>`;
  }

  function agreementsTab(owner, hl) {
    const from = fromStr(owner, 'agreements');
    const list = Object.entries(AGREEMENTS).filter(([, a]) => a.owner === owner);
    const cols = 'style="grid-template-columns:130px minmax(0,1fr) 100px 90px 140px 110px"';
    return `<div class="tbl"><div class="tr th" ${cols}><span class="${T.th} hs">Code</span><span class="${T.th}">Name</span><span class="${T.th} hs">Account</span><span class="${T.th} hs">Kind</span><span class="${T.th} hs">Status</span><span class="${T.th}">In force from</span></div>
      ${list.map(([id, a]) => `<a class="tr${hlCls(hl, id)}" ${cols} href="${href(itemUrl('a', id, from))}"><span class="mono12 hs">${a.code}</span><span class="${T.strong} trunc">${esc(a.name)}${hlPin(hl, id)}</span><span class="${T.muted} hs">${a.account}</span><span class="${T.muted} hs">${a.kind}</span><span class="hs">${badge(a.status, AGREEMENT_STATUS[a.status])}</span><span class="${T.muted}">${a.from}</span></a>`).join('')}</div>`;
  }

  function connectorRow(id, c, from, hl, inherited) {
    const tags = `${badge(c.provider, 'blue')} ${badge(c.cap, 'amber')} ${inherited ? badge('From Workspace', 'gray') : c.source ? badge(c.source, 'gray') : ''}`;
    return `<div class="conn${hlCls(hl, id)}"><span class="grow"><span class="${T.strong}">${esc(c.name)}</span> ${tags}<span class="${T.muted}" style="display:block">${c.envs}</span></span><a class="btn sm" href="${href(itemUrl('k', id, from))}" style="text-decoration:none;cursor:pointer">Configure</a>${hlPin(hl, id)}</div>`;
  }
  function connectorsTab(owner, hl) {
    const from = fromStr(owner, 'connectors');
    const own = Object.entries(CONNECTORS).filter(([, c]) => c.owner === owner);
    const inherited = owner === W ? [] : Object.entries(CONNECTORS).filter(([, c]) => c.owner === W && c.source !== 'Disabled');
    return `<div class="panel"><div class="sec-h"><h3 class="${T.sec}">Connectors</h3><span class="btn sm primary">${icon('plus', 14)}Add connector</span></div>
      <p class="${T.body2}" style="margin:0 0 8px">Connectors give Clara read access to code, data and conversations for this ${owner === W ? 'workspace' : 'project'}.</p>
      ${own.length ? own.map(([id, c]) => connectorRow(id, c, from, hl, false)).join('') : `<div class="conn"><span class="${T.muted}">No connectors on this project yet.</span></div>`}
      ${inherited.length ? `<p class="${T.over}" style="margin:16px 0 0">Also in scope here</p>${inherited.map(([id, c]) => connectorRow(id, c, from, hl, true)).join('')}` : ''}</div>`;
  }

  function assetsTab(owner, hl) {
    const from = fromStr(owner, 'assets');
    const list = Object.entries(ASSETS).filter(([, a]) => a.owner === owner);
    return `<div class="notice">Assets are being restructured as Connectors. New integrations should be added from the Connectors tab.</div>
      <div class="sec-h"><h2 class="${T.sec}">Assets</h2><span class="btn sm">${icon('plus', 14)}New Asset</span></div>
      <div class="tbl"><div class="tr th" style="grid-template-columns:1fr"><span class="${T.th}">Name</span></div>
      ${list.map(([id, a]) => `<a class="tr${hlCls(hl, id)}" style="grid-template-columns:1fr" href="${href(itemUrl('s', id, from))}"><span><span class="${T.strong}" style="display:block">${esc(a.name)}${hlPin(hl, id)}</span><span class="${T.muted}">${esc(a.sub)}</span></span></a>`).join('')}</div>`;
  }

  function settingsTab(owner) {
    const what = owner === W ? 'workspace' : 'project';
    const p = (t, b, body) => `<div class="panel"><div class="sec-h"><h2 class="${T.sec}">${t}</h2><span class="btn sm">${b}</span></div><p class="${T.body2}" style="margin:0">${body}</p></div>`;
    return p('Context', 'Edit', `Background Clara reads before answering anything in this ${what}: the client, the team and the vocabulary.`)
      + p('Rules', 'Add rule', '2 rules · "Write issue ids as WEB-N" · "Link every estimate to its SOW"')
      + p('Skills', 'Add skill', '3 skills available here, including the inherited organization skills.');
  }

  function workspaceOverview() {
    const from = fromStr(W, 'overview');
    const cols = 'style="grid-template-columns:minmax(0,1fr) 90px 120px 70px"';
    const projRows = Object.entries(PROJECTS).map(([id, p]) => `<a class="tr" ${cols} href="${href(ownerUrl(pk(id)))}"><span class="${T.strong} trunc">${esc(p.name)}</span><span class="hs">${badge(STATE[p.state][0], STATE[p.state][1])}</span><span class="${T.muted} hs">${p.lastBy}</span><span class="${T.muted}">${p.updated}</span></a>`).join('');
    const recent = Object.entries(DOCS).filter(([, d]) => d.owner === W).slice(0, 5).map(([id, d]) => `<a class="tr" style="grid-template-columns:40px minmax(0,1fr) 130px" href="${href(itemUrl('d', id, from))}"><span class="tile" style="${tvars(d.type)}"><span>${typeOf(d.type)[0]}</span></span><span class="${T.strong} trunc">${esc(d.title)}</span><span class="${T.muted}">${d.mod}</span></a>`).join('');
    const convs = Object.entries(CONVOS).filter(([, c]) => c.owner === W).map(([id, c]) => `<a href="${href(itemUrl('c', id, from))}" style="display:block;text-decoration:none;padding:6px 0"><span class="${T.strong}" style="display:block">${esc(c.title)}</span><span class="${T.muted}">${c.lastBy} · ${c.updated}</span></a>`).join('');
    return `<div class="grid2"><div class="stack">
        <div class="roll"><div class="panel"><div class="${T.card}">Projects</div><div class="stats"><span><span class="${T.stat}" style="display:block">1</span><span class="${T.statl}">open</span></span><span><span class="${T.stat}" style="display:block">2</span><span class="${T.statl}">active</span></span><span><span class="${T.stat}" style="display:block">1</span><span class="${T.statl}">on hold</span></span></div></div>
        <div class="panel g"><div class="${T.card}">Issues</div><div class="stats"><span><span class="${T.stat}" style="display:block">18</span><span class="${T.statl}">open</span></span><span><span class="${T.stat}" style="display:block">5</span><span class="${T.statl}">in progress</span></span><span><span class="${T.stat}" style="display:block">9</span><span class="${T.statl}">done this week</span></span></div></div></div>
        <div><div class="sec-h"><h2 class="${T.sec}">Projects</h2></div><div class="tbl"><div class="tr th" ${cols}><span class="${T.th}">Name</span><span class="${T.th} hs">State</span><span class="${T.th} hs">Last active by</span><span class="${T.th}">Updated</span></div>${projRows}</div></div>
        <div><div class="sec-h"><h2 class="${T.sec}">Recent documents</h2><a class="${T.link}" href="${href(ownerUrl(W, 'documents'))}">View all</a></div><div class="tbl">${recent}</div></div>
      </div><div class="stack">
        <div class="panel muted-box"><div class="${T.over}" style="margin-bottom:6px">Harvest</div><span class="${T.body2}">Linked to <b>Acme Corp · Retainer</b>. 126 h logged this month.</span></div>
        <div class="panel muted-box"><div class="${T.over}" style="margin-bottom:6px">Recent conversations</div>${convs}</div>
      </div></div>`;
  }

  function projectOverview(id) {
    const owner = pk(id);
    const p = PROJECTS[id];
    const issues = Object.values(ISSUES).filter((i) => i.owner === owner);
    const open = issues.filter((i) => i.status !== 'Done').length;
    const prog = issues.filter((i) => i.status === 'In Progress' || i.status === 'In Review').length;
    const st = (n, l) => `<span><span class="${T.stat}" style="display:block">${n}</span><span class="${T.statl}">${l}</span></span>`;
    return `<div class="grid2"><div class="stack">
        <div class="roll"><div class="panel g"><div class="${T.card}">Issues</div><div class="stats">${st(open, 'open')}${st(prog, 'in progress')}${st(issues.length - open, 'done')}</div></div></div>
        <div><div class="sec-h"><h2 class="${T.sec}">Description</h2></div><div class="panel"><p class="${T.body}" style="margin:0">${esc(p.desc)}</p></div></div>
        <div><div class="sec-h"><h2 class="${T.sec}">Updates</h2></div><div class="panel"><p class="${T.body}" style="margin:0">Week 44: templates in review; field names waiting on a decision (Q-04 in the Question Ledger).</p></div></div>
      </div><div class="stack">
        <div class="panel muted-box"><div class="${T.over}" style="margin-bottom:6px">Waiting on</div><span class="${T.strong}" style="display:block">Product decision on Q-04</span><span class="${T.muted}">Ana Ruiz · since Nov 2</span></div>
        <div class="panel muted-box"><div class="${T.over}" style="margin-bottom:6px">Assignee</div><span class="who">${avatar(p.lastBy)}<span class="${T.strong}">${p.lastBy}</span></span></div>
      </div></div>`;
  }

  function ownerBody(owner, tab, q) {
    const hl = q.get('hl');
    switch (tab) {
      case 'overview': return owner === W ? workspaceOverview() : projectOverview(owner.slice(2));
      case 'documents': return documentsTab(owner, hl);
      case 'issues': return issuesTab(owner, hl);
      case 'conversations': return conversationsTab(owner, hl);
      case 'activity': return activityTab(owner, hl);
      case 'ai-activity': return aiActivityTab();
      case 'agreements': return agreementsTab(owner, hl);
      case 'connectors': return connectorsTab(owner, hl);
      case 'assets': return assetsTab(owner, hl);
      case 'settings': return settingsTab(owner);
      default: return emptyState('Not found', 'This tab does not exist.');
    }
  }

  // =====================================================================
  // Owner pages
  // =====================================================================
  function workspacePage(q) {
    const tab = q.get('tab') || 'overview';
    renderSidebar(W);
    renderCrumbs([{ label: WS.name }]);
    return `<div class="ph"><div><h1 class="${T.h1}">${WS.name}</h1><p class="${T.ctx}">${esc(WS.desc)}</p></div>
        <div class="btnrow"><span class="btn primary">${icon('chat', 14)}Start Conversation</span><span class="btn">Archive</span></div></div>
      ${tabBar(W, tab)}${ownerBody(W, tab, q)}`;
  }

  function projectPage(id, q) {
    const p = PROJECTS[id];
    if (!p) return notFound();
    const owner = pk(id);
    const tab = q.get('tab') || 'overview';
    renderSidebar(owner);
    renderCrumbs([{ label: WS.name, type: 'workspace', href: ownerUrl(W) }, { label: p.name }]);
    return `<div class="ph"><div><div class="ph-title"><h1 class="${T.h1}">${esc(p.name)}</h1>${badge(STATE[p.state][0], STATE[p.state][1])}</div><p class="${T.ctx}">Workspace: ${WS.name}</p></div>
        <div class="btnrow"><span class="btn primary">${icon('chat', 14)}Start Conversation</span><span class="btn">${icon('plus', 14)}New credit request</span><span class="btn">${STATE[p.state][0]} ${icon('down', 12)}</span><span class="btn">High ${icon('down', 12)}</span><span class="btn">Archive</span></div></div>
      ${tabBar(owner, tab)}${ownerBody(owner, tab, q)}`;
  }

  // =====================================================================
  // Item pages: the part this mock-up is about.
  // Today: no way back; the owner crumbs open the owner's Overview.
  // Proposed: "Back to <tab or folder>", crumbs for the tab and folders, all returning
  // to where the item was opened, with the item highlighted.
  // =====================================================================
  const KIND_TAB = { d: 'documents', i: 'issues', c: 'conversations', a: 'agreements', k: 'connectors', s: 'assets' };

  function origin(kind, entity, q) {
    const raw = q.get('from');
    if (raw) {
      const [owner, tab, folder] = raw.split('~');
      if ((owner === W || PROJECTS[(owner || '').slice(2)]) && tabsFor(owner).some((t) => t[0] === tab)) return { owner, tab, folder: folder || null };
    }
    return { owner: entity.owner, tab: KIND_TAB[kind], folder: kind === 'd' ? entity.folder : null };
  }

  function itemFrame(kind, id, entity, q, title, body) {
    renderSidebar(entity.owner);
    const o = origin(kind, entity, q);
    const inProject = entity.owner !== W;
    const crumbs = [];
    if (!toBe()) {
      crumbs.push({ label: WS.name, type: 'workspace', href: ownerUrl(W) });
      if (inProject) crumbs.push({ label: ownerName(entity.owner), type: 'project', href: ownerUrl(entity.owner) });
    } else {
      const same = o.owner === entity.owner;
      const backTo = (folder) => ownerUrl(o.owner, o.tab, { folder, hl: id });
      if (inProject) {
        crumbs.push({ label: WS.name, href: ownerUrl(W) });
        crumbs.push({ label: ownerName(entity.owner), href: same ? backTo(null) : ownerUrl(entity.owner, KIND_TAB[kind]) });
      } else {
        crumbs.push({ label: WS.name, href: same ? backTo(null) : ownerUrl(W, KIND_TAB[kind]) });
      }
      if (same) {
        crumbs.push({ label: tabLabel(o.owner, o.tab), href: backTo(null) });
        if (o.tab === 'documents') folderPath(o.folder).forEach((f) => crumbs.push({ label: FOLDERS[f].name, href: backTo(f) }));
      }
    }
    crumbs.push({ label: title });
    renderCrumbs(crumbs, toBe() ? 2 : 0);
    const backLabel = o.tab === 'documents' && o.folder ? FOLDERS[o.folder].name : tabLabel(o.owner, o.tab);
    const back = toBe() ? `<a class="back t-link" href="${href(ownerUrl(o.owner, o.tab, { folder: o.folder, hl: id }))}">${icon('arrowLeft', 14)}Back to ${esc(backLabel)}</a>${pin(1)}<br>` : '';
    return back + body;
  }

  const ownerLine = (owner) => (owner === W ? `Workspace: ${WS.name}` : `Project: ${ownerName(owner)}`);

  function pager(id, d, q) {
    if (!toBe()) return '';
    const o = origin('d', d, q);
    if (o.tab !== 'documents') return '';
    const sibs = Object.entries(DOCS).filter(([, x]) => x.owner === d.owner && x.folder === d.folder);
    if (sibs.length < 2) return '';
    const i = sibs.findIndex(([k]) => k === id);
    const name = d.folder ? FOLDERS[d.folder].name : 'Documents';
    const from = fromStr(d.owner, 'documents', d.folder);
    const cell = (s, label, cls) => (s
      ? `<a class="${cls}" href="${href(itemUrl('d', s[0], from))}"><span class="t-meta">${label}</span><span class="t-value">${esc(s[1].title)}</span></a>`
      : `<span class="off ${cls}"><span class="t-meta">${label}</span><span class="t-value">None</span></span>`);
    return `<div class="pager">${cell(sibs[i - 1], `← Previous in ${esc(name)}`, '')}${cell(sibs[i + 1], `Next in ${esc(name)} →`, 'nx')}</div><p class="t-meta" style="margin:6px 0 0">${i + 1} of ${sibs.length} in ${esc(name)}${pin(4)}</p>`;
  }

  function documentPage(id, q) {
    const d = DOCS[id];
    if (!d) return notFound();
    const approved = d.status === 'approved';
    const ctxLine = toBe()
      ? `<p class="t-page-context">${esc(d.type)} · ${esc(ownerName(d.owner))} · created ${d.created} · edited ${d.mod}</p>`
      : `<p class="c-body-600" style="margin:4px 0 0">${ownerLine(d.owner)}<br>Created: ${d.created} · Modified: ${d.mod}</p>`;
    const body = `<div class="ph"><div><div class="ph-title"><h1 class="${T.h1}">${esc(d.title)}</h1>${badge(d.type, 'blue')}</div>${ctxLine}</div>
        <div class="btnrow">${badge(approved ? 'Approved' : 'Draft', approved ? 'green' : 'amber')}${approved ? '<span class="btn">De-Approve</span>' : '<span class="btn primary">Approve</span>'}<span class="btn">History</span><span class="btn">Move</span><span class="btn">Download ${icon('down', 12)}</span><span class="btn">Share</span><span class="btn" style="color:var(--danger-ink)">Delete</span></div></div>
      <div class="subtabs"><span class="${T.tab} on">Preview</span><span class="${T.tab}">Edit</span></div>
      <div class="frame-doc"><div class="viewtabs"><span class="${T.tab}" style="padding:4px 10px">Markdown</span><span class="${T.tab} on" style="padding:4px 10px">Document</span></div>${paper(d)}</div>
      ${pager(id, d, q)}`;
    return itemFrame('d', id, d, q, d.title, body);
  }

  function paper(d) {
    const ctx = ownerName(d.owner);
    const sections = docSections(d);
    return `<article class="paper">
      <p class="kicker">${esc(d.type)} · ${esc(ctx)}</p>
      <h1>${esc(d.title)}</h1>
      <p class="lead">${esc(d.lead)}</p>
      <dl class="meta"><div><dt>Status</dt><dd>${d.status === 'approved' ? 'Approved' : 'Draft · in review'}</dd></div><div><dt>Owner</dt><dd>${esc(d.by)}</dd></div><div><dt>Next step</dt><dd>${esc(d.next)}</dd></div></dl>
      ${sections.map((s, i) => `<h2><span class="n">${i + 1}</span>${esc(s[0])}</h2>${s[1]}`).join('')}
    </article>`;
  }

  function docSections(d) {
    if (d.type === 'Question Ledger') {
      const row = (n, qq, who, st, ans) => `<tr><td><code>${n}</code></td><td>${qq}</td><td>${who}</td><td>${st}</td><td>${ans}</td></tr>`;
      const head = '<thead><tr><th>Id</th><th>Question</th><th>Owner</th><th>Status</th><th>Answer</th></tr></thead>';
      return [
        ['Open questions', `<table>${head}<tbody>${row('Q-04', 'Does the product page show prices, or only "Contact sales"?', 'Ana Ruiz', 'Open', 'Due Nov 8')}${row('Q-06', 'Can marketing publish without a review step?', 'Ben Carter', 'Open', 'Due Nov 12')}${row('Q-07', 'Is one article template enough for blog and news?', 'Ana Ruiz', 'Open', 'Proposed: yes')}</tbody></table>`],
        ['Answered', `<table>${head}<tbody>${row('Q-01', 'Does the blog move to the CMS or stay on the old site?', 'Ben Carter', 'Answered', 'Moves to the CMS')}${row('Q-02', 'Who may publish a page?', 'Ana Ruiz', 'Answered', 'Marketing editors, after review')}${row('Q-03', 'Are page versions kept?', 'Sam Patel', 'Answered', 'Yes, through the CMS history')}</tbody></table>`],
        ['How to add a question', '<p>Add a row at the top of <b>Open questions</b> with the next free id, a named owner and a due date. Link the issue it came from, for example <code>WEB-101</code>.</p>'],
      ];
    }
    if (d.type === 'Estimate') {
      return [
        ['Scope summary', '<p>Phase 1 covers the page templates, the CMS setup and the blog migration.</p>'],
        ['Estimate', '<table><thead><tr><th>Work item</th><th>Effort</th><th>Notes</th></tr></thead><tbody><tr><td>Product page template</td><td>5 days</td><td>WEB-101</td></tr><tr><td>Blog migration</td><td>4 days</td><td>WEB-102</td></tr><tr><td>Content validation</td><td>3 days</td><td>WEB-103</td></tr><tr><td>Publishing guide</td><td>2 days</td><td>WEB-104</td></tr><tr class="total"><td>Total</td><td>14 days</td><td>Two sprints</td></tr></tbody></table>'],
        ['Assumptions', '<ul><li>The field names are frozen before sprint 2 starts.</li><li>No change to hosting.</li></ul><div class="alert"><b>Warning</b>If Q-04 is not answered by Nov 8, product pricing moves to phase 2.</div>'],
      ];
    }
    if (d.type === 'Decision') {
      return [
        ['Context', `<p>${esc(d.lead)} Before this decision, each channel solved the problem in its own way and drifted apart.</p>`],
        ['Decision', '<p>Adopt one shared approach and route every channel through it. Existing pages move over in the same release.</p><div class="alert"><b>Note</b>This decision is binding. Changing it needs a new decision record.</div>'],
        ['Consequences', '<ul><li>One place to change and to test.</li><li>The old per-channel setups are removed, not kept alongside.</li></ul>'],
      ];
    }
    return [
      ['Overview', `<p>${esc(d.lead)}</p><p>This document is the reference for the team working in ${esc(ownerName(d.owner))}. It is kept short on purpose; details live in the linked issues.</p>`],
      ['Approach', '<ul><li>Start from what the site does today, then describe the change.</li><li>Record every open point in the Question Ledger with an owner.</li><li>Link each work item by its issue id.</li></ul>'],
      ['Open points', `<div class="alert"><b>Next step</b>${esc(d.next)}.</div>`],
    ];
  }

  function issuePage(id, q) {
    const i = ISSUES[id];
    if (!i) return notFound();
    const body = `<div class="ph"><div><div class="ph-title"><h1 class="${T.h1}"><span class="mono12" style="font-size:16px">${i.key}</span> ${esc(i.title)}</h1>${badge(i.status, ISSUE_STATUS[i.status])}</div><p class="${T.ctx}">${ownerLine(i.owner)}</p></div></div>
      <div class="grid2b" style="margin-top:20px"><div class="stack"><div class="panel"><p class="${T.body}" style="margin:0 0 8px"><b>Problem.</b> ${esc(i.title)} is needed before wave 1 can ship.</p><p class="${T.body}" style="margin:0"><b>Acceptance.</b> The behaviour is covered by tests and described in the Solution Design.</p></div>
        <div><div class="sec-h"><h2 class="${T.sec}">Comments</h2></div><div class="chat"><div class="msg">${avatar('Ben Carter')}<div class="bubble"><div class="${T.card}">Ben Carter <span class="${T.muted}">Yesterday</span></div><span class="${T.body}">Linked to Q-07 in the Question Ledger.</span></div></div></div></div></div>
        <div class="panel muted-box"><dl class="kv"><dt class="${T.term}">Status</dt><dd class="${T.strong}">${i.status}</dd><dt class="${T.term}">Priority</dt><dd class="${T.strong}">${i.priority}</dd><dt class="${T.term}">Assignee</dt><dd class="${T.strong}">${i.assignee}</dd><dt class="${T.term}">Updated</dt><dd class="${T.strong}">${i.updated}</dd></dl></div></div>`;
    return itemFrame('i', id, i, q, i.key, body);
  }

  function conversationPage(id, q) {
    const c = CONVOS[id];
    if (!c) return notFound();
    const body = `<div class="ph"><div><h1 class="${T.h1}">${esc(c.title)}</h1><p class="${T.ctx}">${ownerLine(c.owner)} · Last active by ${c.lastBy} · ${c.updated}</p></div></div>
      <div class="chat" style="margin-top:20px">${c.msgs.map(([who, text]) => `<div class="msg ${who === 'Clara' ? 'clara' : ''}">${avatar(who)}<div class="bubble"><div class="${T.card}">${who}</div><span class="${T.body}">${esc(text)}</span></div></div>`).join('')}</div>`;
    return itemFrame('c', id, c, q, c.title, body);
  }

  function agreementPage(id, q) {
    const a = AGREEMENTS[id];
    if (!a) return notFound();
    const body = `<div class="ph"><div><div class="ph-title"><h1 class="${T.h1}">${esc(a.name)}</h1>${badge(a.status, AGREEMENT_STATUS[a.status])}</div><p class="${T.ctx}">${a.code} · ${a.kind} · ${ownerLine(a.owner)}</p></div></div>
      <div class="grid2b" style="margin-top:20px"><div class="panel"><div class="sec-h"><h2 class="${T.sec}">Terms</h2></div><dl class="kv"><dt class="${T.term}">Unit</dt><dd class="${T.strong}">Hours</dd><dt class="${T.term}">Allowance</dt><dd class="${T.strong}">160 h per month</dd><dt class="${T.term}">Rollover</dt><dd class="${T.strong}">None</dd></dl></div>
        <div class="panel muted-box"><dl class="kv"><dt class="${T.term}">Code</dt><dd class="${T.strong}">${a.code}</dd><dt class="${T.term}">Account</dt><dd class="${T.strong}">${a.account}</dd><dt class="${T.term}">In force</dt><dd class="${T.strong}">${a.from}</dd></dl></div></div>`;
    return itemFrame('a', id, a, q, a.code, body);
  }

  function connectorPage(id, q) {
    const c = CONNECTORS[id];
    if (!c) return notFound();
    const body = `<div class="ph"><div><div class="ph-title"><h1 class="${T.h1}">Configure ${esc(c.name)}</h1>${badge(c.provider, 'blue')}${badge(c.cap, 'amber')}</div><p class="${T.ctx}">${ownerLine(c.owner)} · ${c.envs}</p></div></div>
      <div class="grid2b" style="margin-top:20px"><div class="panel"><p class="${T.body}" style="margin:0">Agents can read through this connector. Writes are off: the capability class is <b>Read</b>.</p></div>
        <div class="panel muted-box"><dl class="kv"><dt class="${T.term}">Provider</dt><dd class="${T.strong}">${c.provider}</dd><dt class="${T.term}">Capability</dt><dd class="${T.strong}">${c.cap}</dd><dt class="${T.term}">Owner</dt><dd class="${T.strong}">${esc(ownerName(c.owner))}</dd></dl></div></div>`;
    return itemFrame('k', id, c, q, c.name, body);
  }

  function assetPage(id, q) {
    const a = ASSETS[id];
    if (!a) return notFound();
    const body = `<div class="ph"><div><div class="ph-title"><h1 class="${T.h1}">${esc(a.name)}</h1>${badge(a.kind, 'gray')}</div><p class="${T.ctx}">${esc(a.sub)} · ${ownerLine(a.owner)}</p></div></div>
      <div class="notice" style="margin-top:20px">This asset will become a connector. Its settings stay readable here until then.</div>`;
    return itemFrame('s', id, a, q, a.name, body);
  }

  function notFound() {
    renderSidebar('');
    renderCrumbs([{ label: 'Not found' }]);
    return emptyState('Page not found', 'Use the sidebar to go back to the workspace.');
  }

  // =====================================================================
  // Render and events
  // =====================================================================
  const ITEM_PAGES = { d: documentPage, i: issuePage, c: conversationPage, a: agreementPage, k: connectorPage, s: assetPage };

  function syncExplorer() {
    const r = parse(route());
    ex = { stack: [toBe() && r.q.get('folder') && FOLDERS[r.q.get('folder')] ? r.q.get('folder') : null], i: 0 };
  }

  function render(keepExplorer) {
    if (!keepExplorer) syncExplorer();
    const r = parse(route());
    let html;
    if (r.kind === 'w') html = workspacePage(r.q);
    else if (r.kind === 'p') html = projectPage(r.id, r.q);
    else if (ITEM_PAGES[r.kind]) html = ITEM_PAGES[r.kind](r.id, r.q);
    else html = notFound();
    document.getElementById('content').innerHTML = html;
    renderAddr();
    const flash = document.querySelector('.flash');
    if (flash) {
      flash.scrollIntoView({ block: 'center' });
      const [path, query] = route().split('?');
      const rest = (query || '').split('&').filter((kv) => kv && !kv.startsWith('hl=')).join('&');
      replaceRoute(path + (rest ? '?' + rest : ''));
    }
    else if (!keepExplorer) window.scrollTo(0, 0);
  }

  function setFolder(f, push) {
    if (push) { ex.stack = ex.stack.slice(0, ex.i + 1); ex.stack.push(f); ex.i++; }
    const cur = ex.stack[ex.i];
    if (toBe()) {
      const r = parse(route());
      const owner = r.kind === 'w' ? W : pk(r.id);
      replaceRoute(ownerUrl(owner, 'documents', { folder: cur }));
    }
    render(true);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#/"]');
    if (a) { e.preventDefault(); clicks++; go(a.getAttribute('href').slice(1)); return; }
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    const act = b.dataset.act;
    if (act === 'restart') { start(); return; }
    clicks++;
    if (act === 'hback' && H.i > 0) { H.i--; render(); }
    else if (act === 'hfwd' && H.i < H.stack.length - 1) { H.i++; render(); }
    else if (act === 'folder') { const f = b.dataset.folder || null; if (f !== ex.stack[ex.i]) setFolder(f, true); else clicks--; }
    else if (act === 'exback' && ex.i > 0) { ex.i--; setFolder(null, false); }
    else if (act === 'exfwd' && ex.i < ex.stack.length - 1) { ex.i++; setFolder(null, false); }
  });

  // Review chrome: the framing page sends theme, pins and view; keys go back up to it.
  window.addEventListener('message', (e) => {
    const m = e.data;
    if (!m || m.jm == null) return;
    if (m.jm === 'state') {
      document.documentElement.classList.toggle('dark', m.theme === 'dark');
      document.body.classList.toggle('hide-pins', !m.pins);
      document.body.dataset.show = m.show || 'proposed';
    } else if (m.jm === 'start') start(m.flow);
  });
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (['c', 'p', 's', 'd'].includes(e.key) && window.parent !== window) window.parent.postMessage({ jm: 'key', key: e.key }, '*');
  });

  render();
  if (window.parent !== window) window.parent.postMessage({ jm: 'ready' }, '*');
})();
