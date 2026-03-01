import { useState, useRef, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ─── CONSTANTS ────────────────────────────────────────────────
const INDUSTRIES = {
  construction: {
    label: "Construction", icon: "🏗", typeName: "Project Type", leadNoun: "project",
    searchTerms: "construction project opportunities, RFPs, building permits, development projects",
    types: [
      { id: "commercial", label: "Commercial", icon: "🏢" },
      { id: "residential", label: "Residential", icon: "🏠" },
      { id: "industrial", label: "Industrial", icon: "🏭" },
      { id: "renovation", label: "Renovation", icon: "🔨" },
      { id: "infrastructure", label: "Infrastructure", icon: "🌉" },
      { id: "mixed_use", label: "Mixed Use", icon: "🏗" },
      { id: "government", label: "Government", icon: "🏛" },
    ],
    defaultTypes: ["commercial", "residential", "industrial", "renovation", "infrastructure"],
    defaultBudget: [50000, 10000000],
  },
  gov_contracting: {
    label: "Government Contracting", icon: "🏛", typeName: "Contract Type", leadNoun: "contract",
    searchTerms: "government RFPs, procurement solicitations, contract opportunities, bid announcements, SAM.gov opportunities",
    types: [
      { id: "federal", label: "Federal", icon: "🇺🇸" },
      { id: "state", label: "State", icon: "🏛" },
      { id: "local", label: "Local / Municipal", icon: "🏘" },
      { id: "defense", label: "Defense", icon: "🛡" },
      { id: "healthcare", label: "Healthcare", icon: "🏥" },
      { id: "education", label: "Education", icon: "🎓" },
      { id: "technology", label: "Technology / IT", icon: "💻" },
      { id: "facilities", label: "Facilities / Maintenance", icon: "🔧" },
    ],
    defaultTypes: ["federal", "state", "local", "technology"],
    defaultBudget: [25000, 50000000],
  },
  marketing: {
    label: "Marketing / Creative", icon: "📣", typeName: "Service Type", leadNoun: "engagement",
    searchTerms: "marketing RFPs, agency of record searches, creative services solicitations, branding projects, digital marketing opportunities",
    types: [
      { id: "branding", label: "Branding", icon: "🎨" },
      { id: "digital", label: "Digital Marketing", icon: "📱" },
      { id: "content", label: "Content / SEO", icon: "✍" },
      { id: "social", label: "Social Media", icon: "📢" },
      { id: "pr", label: "PR / Comms", icon: "📰" },
      { id: "web_design", label: "Web Design", icon: "🌐" },
      { id: "video", label: "Video / Production", icon: "🎬" },
      { id: "strategy", label: "Strategy / Consulting", icon: "📊" },
    ],
    defaultTypes: ["branding", "digital", "content", "web_design"],
    defaultBudget: [5000, 500000],
  },
  it_consulting: {
    label: "IT / Software Consulting", icon: "💻", typeName: "Project Type", leadNoun: "project",
    searchTerms: "IT consulting RFPs, software development solicitations, technology services opportunities, digital transformation projects, cybersecurity contracts",
    types: [
      { id: "dev", label: "Software Dev", icon: "⌨" },
      { id: "cloud", label: "Cloud / Infra", icon: "☁" },
      { id: "cyber", label: "Cybersecurity", icon: "🔒" },
      { id: "data", label: "Data / Analytics", icon: "📊" },
      { id: "consulting", label: "IT Consulting", icon: "💡" },
      { id: "managed", label: "Managed Services", icon: "🖥" },
      { id: "ai_ml", label: "AI / ML", icon: "🤖" },
      { id: "integration", label: "Integration", icon: "🔗" },
    ],
    defaultTypes: ["dev", "cloud", "cyber", "data", "consulting"],
    defaultBudget: [25000, 5000000],
  },
  real_estate: {
    label: "Real Estate / Development", icon: "🏠", typeName: "Opportunity Type", leadNoun: "opportunity",
    searchTerms: "real estate development opportunities, commercial property listings, land sales, zoning changes, development proposals, investment properties",
    types: [
      { id: "commercial_re", label: "Commercial", icon: "🏢" },
      { id: "residential_re", label: "Residential", icon: "🏘" },
      { id: "land", label: "Land / Lots", icon: "🌄" },
      { id: "mixed_use_re", label: "Mixed Use", icon: "🏙" },
      { id: "multifamily", label: "Multifamily", icon: "🏬" },
      { id: "retail", label: "Retail", icon: "🛍" },
      { id: "industrial_re", label: "Industrial", icon: "🏭" },
    ],
    defaultTypes: ["commercial_re", "residential_re", "multifamily", "land"],
    defaultBudget: [100000, 50000000],
  },
  landscaping: {
    label: "Landscaping / Trades", icon: "🌿", typeName: "Job Type", leadNoun: "job",
    searchTerms: "landscaping bids, grounds maintenance contracts, commercial landscaping RFPs, municipal landscaping solicitations, HOA landscaping opportunities",
    types: [
      { id: "commercial_ls", label: "Commercial", icon: "🏢" },
      { id: "residential_ls", label: "Residential", icon: "🏡" },
      { id: "municipal", label: "Municipal", icon: "🏛" },
      { id: "hoa", label: "HOA / Community", icon: "🏘" },
      { id: "maintenance", label: "Maintenance", icon: "🔄" },
      { id: "design_build", label: "Design / Build", icon: "📐" },
      { id: "irrigation", label: "Irrigation", icon: "💧" },
    ],
    defaultTypes: ["commercial_ls", "municipal", "hoa", "design_build"],
    defaultBudget: [5000, 500000],
  },
  cleaning: {
    label: "Cleaning / Facilities", icon: "🧹", typeName: "Service Type", leadNoun: "contract",
    searchTerms: "commercial cleaning contracts, janitorial services RFPs, facilities maintenance bids, cleaning service solicitations",
    types: [
      { id: "office", label: "Office / Corporate", icon: "🏢" },
      { id: "medical", label: "Medical / Healthcare", icon: "🏥" },
      { id: "industrial_cl", label: "Industrial", icon: "🏭" },
      { id: "retail_cl", label: "Retail", icon: "🛍" },
      { id: "education_cl", label: "Schools / Education", icon: "🎓" },
      { id: "government_cl", label: "Government", icon: "🏛" },
      { id: "residential_cl", label: "Residential / Property Mgmt", icon: "🏘" },
    ],
    defaultTypes: ["office", "medical", "education_cl", "government_cl"],
    defaultBudget: [10000, 1000000],
  },
  events: {
    label: "Events / Catering", icon: "🎪", typeName: "Event Type", leadNoun: "event",
    searchTerms: "event planning RFPs, catering bid opportunities, venue management contracts, corporate event solicitations, conference planning opportunities",
    types: [
      { id: "corporate", label: "Corporate", icon: "💼" },
      { id: "wedding", label: "Weddings", icon: "💒" },
      { id: "conference", label: "Conferences", icon: "🎤" },
      { id: "nonprofit", label: "Nonprofit / Gala", icon: "🎗" },
      { id: "government_ev", label: "Government", icon: "🏛" },
      { id: "festival", label: "Festivals", icon: "🎪" },
      { id: "catering_only", label: "Catering Only", icon: "🍽" },
    ],
    defaultTypes: ["corporate", "conference", "nonprofit", "catering_only"],
    defaultBudget: [5000, 500000],
  },
};

const INDUSTRY_LIST = Object.entries(INDUSTRIES).map(([id, ind]) => ({ id, ...ind }));

const TIMELINE_OPTIONS = [
  { value: "0-3", label: "0–3 mo", months: 3 },
  { value: "3-6", label: "3–6 mo", months: 6 },
  { value: "6-12", label: "6–12 mo", months: 12 },
  { value: "12-24", label: "12–24 mo", months: 24 },
  { value: "24+", label: "24+ mo", months: 36 },
];

const FOLLOWUP_STATUSES = [
  { id: "new", label: "New", color: "#a8a29e" },
  { id: "contacted", label: "Contacted", color: "#60a5fa" },
  { id: "meeting", label: "Meeting Set", color: "#a78bfa" },
  { id: "won", label: "Won", color: "#34d399" },
  { id: "lost", label: "Lost", color: "#f87171" },
];

const EMPTY_LEAD = {
  name: "", company: "", email: "", phone: "",
  projectType: "", budget: "", location: "", zipCode: "",
  timeline: "", description: "", source: "", followUp: "new",
};

function getDefaultCriteria(industryId) {
  const ind = INDUSTRIES[industryId] || INDUSTRIES.construction;
  return {
    minBudget: ind.defaultBudget[0],
    maxBudget: ind.defaultBudget[1],
    serviceAreaZips: "",
    maxTimelineMonths: 24,
    minTimelineMonths: 0,
    requiredFields: ["name", "budget"],
  };
}

// ─── QUALIFICATION ENGINE ─────────────────────────────────────
function qualifyLead(lead, criteria, typeName = "Category") {
  const results = { criteria: [], score: 0, total: 0, qualified: false };
  const budget = parseFloat(lead.budget);
  if (!isNaN(budget)) {
    const pass = budget >= criteria.minBudget && budget <= criteria.maxBudget;
    results.criteria.push({ name: "Budget Range", pass, detail: pass ? `$${budget.toLocaleString()} within range` : `$${budget.toLocaleString()} outside $${criteria.minBudget.toLocaleString()}–$${criteria.maxBudget.toLocaleString()}` });
    results.total++; if (pass) results.score++;
  } else if (lead.budget) {
    results.criteria.push({ name: "Budget Range", pass: false, detail: "Invalid budget value" }); results.total++;
  }
  if (criteria.serviceAreaZips && criteria.serviceAreaZips.trim()) {
    const allowed = criteria.serviceAreaZips.split(",").map(z => z.trim());
    const zip = (lead.zipCode || "").trim();
    if (zip) {
      const pass = allowed.some(z => zip.startsWith(z));
      results.criteria.push({ name: "Service Area", pass, detail: pass ? `ZIP ${zip} in service area` : `ZIP ${zip} outside service area` });
      results.total++; if (pass) results.score++;
    }
  }
  if (lead.timeline) {
    const m = { "0-3": 3, "3-6": 6, "6-12": 12, "12-24": 24, "24+": 36 }[lead.timeline] || 0;
    const pass = m >= criteria.minTimelineMonths && m <= criteria.maxTimelineMonths;
    results.criteria.push({ name: "Timeline", pass, detail: pass ? "Timeline within range" : "Timeline outside range" });
    results.total++; if (pass) results.score++;
  }
  const missing = criteria.requiredFields.filter(f => !lead[f] || lead[f].toString().trim() === "");
  if (criteria.requiredFields.length > 0) {
    const pass = missing.length === 0;
    results.criteria.push({ name: "Required Fields", pass, detail: pass ? "All required fields present" : `Missing: ${missing.join(", ")}` });
    results.total++; if (pass) results.score++;
  }
  results.qualified = results.total > 0 && results.score === results.total;
  return results;
}

function parseCSV(text) {
  const lines = text.split("\n").filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[\s_]+/g, ""));
  const map = { name: "name", contactname: "name", leadname: "name", fullname: "name", company: "company", companyname: "company", email: "email", emailaddress: "email", phone: "phone", phonenumber: "phone", projecttype: "projectType", type: "projectType", budget: "budget", projectvalue: "budget", value: "budget", location: "location", city: "location", zipcode: "zipCode", zip: "zipCode", postalcode: "zipCode", timeline: "timeline", timeframe: "timeline", description: "description", notes: "description", source: "source", leadsource: "source" };
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^["']|["']$/g, ""));
    const lead = { ...EMPTY_LEAD };
    headers.forEach((h, i) => { const m2 = map[h]; if (m2 && vals[i]) lead[m2] = vals[i]; });
    return lead;
  });
}

// ─── PROSPECT CLASSIFICATION ──────────────────────────────────
function classifyProspect(prospect) {
  const hasOwner = !!(prospect.ownerName && prospect.ownerName.trim());
  const hasDirectContact = !!(prospect.email && prospect.email.trim()) || !!(prospect.phone && prospect.phone.trim());
  const signalCount = (prospect.buyingSignals || []).length;

  if (hasOwner && hasDirectContact && signalCount >= 2) {
    return { tier: "WARM", emoji: "🟢", color: "#34d399" };
  } else if (hasDirectContact && signalCount >= 1) {
    return { tier: "COOL", emoji: "🟡", color: "#f59e0b" };
  } else {
    return { tier: "COLD", emoji: "🔴", color: "#f87171" };
  }
}

// ─── THEME DEFINITIONS ────────────────────────────────────────
const themes = {
  dark: {
    bg: "#0c0a09", bgAlt: "#151311", bgHover: "#1c1917",
    border: "#1c1917", borderLight: "#292524", borderInput: "#3a3631",
    text: "#fafaf9", textMuted: "#a8a29e", textDim: "#78716c", textFaint: "#57534e",
    accent: "#f59e0b", accentHover: "#d97706", accentBg: "#0c0a09",
    green: "#34d399", greenBg: "#0a2e1a", greenBorder: "#166534",
    red: "#f87171", redBg: "#2e0a0a", redBorder: "#7f1d1d",
    cardBg: "#151311",
  },
  light: {
    bg: "#faf9f7", bgAlt: "#ffffff", bgHover: "#f5f3f0",
    border: "#e7e5e4", borderLight: "#d6d3d1", borderInput: "#c4c0bc",
    text: "#1c1917", textMuted: "#57534e", textDim: "#78716c", textFaint: "#a8a29e",
    accent: "#d97706", accentHover: "#b45309", accentBg: "#fffbeb",
    green: "#16a34a", greenBg: "#f0fdf4", greenBorder: "#86efac",
    red: "#dc2626", redBg: "#fef2f2", redBorder: "#fca5a5",
    cardBg: "#ffffff",
  },
};

// ─── STORAGE HELPERS ──────────────────────────────────────────
const SK = { leads: "lq-leads-v2", criteria: "lq-criteria-v2", settings: "lq-settings-v2", outreachProspects: "lq-outreach-prospects-v1", outreachDrafts: "lq-outreach-drafts-v1", emailConfig: "lq-email-config-v1" };

async function loadData(key) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}
async function saveData(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.error("Storage save error:", e); }
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function LeadQualifier() {
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("construction");
  const [setupComplete, setSetupComplete] = useState(false);
  const [setupStep, setSetupStep] = useState(0);

  const [tab, setTab] = useState("dashboard");
  const [criteria, setCriteria] = useState(getDefaultCriteria("construction"));
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_LEAD });
  const [expandedLead, setExpandedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [toast, setToast] = useState(null);
  const [settingsEdited, setSettingsEdited] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const [inlineEdit, setInlineEdit] = useState(null); // { id, field, value }

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFollowUp, setFilterFollowUp] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Prospect search state (replaces finder)
  const [prospectCity, setProspectCity] = useState("");
  const [prospectNiche, setProspectNiche] = useState("");
  const [prospectCount, setProspectCount] = useState(10);
  const [prospectFilters, setProspectFilters] = useState({
    hiringOnIndeed: true,
    badWebsite: true,
    lowReviews: true,
    noSocial: true,
    runningAds: true,
    recentlyStarted: true,
  });
  const [prospects, setProspects] = useState([]);
  const [prospectLoading, setProspectLoading] = useState(false);
  const [prospectError, setProspectError] = useState(null);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [expandedProspect, setExpandedProspect] = useState(null);
  const [draftingEmail, setDraftingEmail] = useState(null);
  const [emailDrafts, setEmailDrafts] = useState({});

  // Sales Playbook state
  const [playbookData, setPlaybookData] = useState({});
  const [generatingPlaybook, setGeneratingPlaybook] = useState(null);
  const [openPlaybook, setOpenPlaybook] = useState(null);

  // Joe's Queue state
  const [queueActions, setQueueActions] = useState({});

  // Outreach state
  const [outreachProspects, setOutreachProspects] = useState([]);
  const [outreachDrafts, setOutreachDrafts] = useState({});   // { id: { to, subject, body } }
  const [outreachStatuses, setOutreachStatuses] = useState({}); // { id: 'draft'|'sending'|'sent'|'replied' }
  const [sendingEmail, setSendingEmail] = useState(null);
  const [emailConfig, setEmailConfig] = useState({ host: "", port: 587, user: "", pass: "", fromName: "", senderTitle: "", senderPhone: "" });
  const [addedToLeads, setAddedToLeads] = useState(new Set());

  const fileRef = useRef();
  const t = themes[theme];
  const ind = INDUSTRIES[industry] || INDUSTRIES.construction;
  const PROJECT_TYPES = ind.types;

  // ─── LOAD PERSISTED DATA ──────────────────────────────────
  useEffect(() => {
    (async () => {
      const [savedLeads, savedCriteria, savedSettings, savedOutreachProspects, savedOutreachDrafts, savedEmailConfig] = await Promise.all([
        loadData(SK.leads), loadData(SK.criteria), loadData(SK.settings),
        loadData(SK.outreachProspects), loadData(SK.outreachDrafts), loadData(SK.emailConfig),
      ]);
      if (savedLeads) setLeads(savedLeads);
      if (savedCriteria) setCriteria(savedCriteria);
      if (savedSettings) {
        if (savedSettings.companyName) setCompanyName(savedSettings.companyName);
        if (savedSettings.theme) setTheme(savedSettings.theme);
        if (savedSettings.industry) {
          setIndustry(savedSettings.industry);
        }
        if (savedSettings.setupComplete) { setSetupComplete(true); setTab("dashboard"); }
      }
      if (savedOutreachProspects) setOutreachProspects(savedOutreachProspects);
      if (savedOutreachDrafts) setOutreachDrafts(savedOutreachDrafts);
      if (savedEmailConfig) setEmailConfig(savedEmailConfig);
      setLoading(false);
    })();
  }, []);

  // ─── PERSIST ON CHANGE ────────────────────────────────────
  useEffect(() => { if (!loading) saveData(SK.leads, leads); }, [leads, loading]);
  useEffect(() => { if (!loading) saveData(SK.criteria, criteria); }, [criteria, loading]);
  useEffect(() => { if (!loading) saveData(SK.settings, { companyName, theme, industry, setupComplete }); }, [companyName, theme, industry, setupComplete, loading]);
  useEffect(() => { if (!loading) saveData(SK.outreachProspects, outreachProspects); }, [outreachProspects, loading]);
  useEffect(() => { if (!loading) saveData(SK.outreachDrafts, outreachDrafts); }, [outreachDrafts, loading]);
  useEffect(() => { if (!loading) saveData(SK.emailConfig, emailConfig); }, [emailConfig, loading]);

  // ─── KEYBOARD SHORTCUTS ───────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (inlineEdit) { setInlineEdit(null); return; }
        if (confirmAction) { setConfirmAction(null); return; }
        if (editingLead) { setEditingLead(null); setEditForm(null); return; }
        if (expandedLead) { setExpandedLead(null); return; }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [confirmAction, editingLead, expandedLead, inlineEdit]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── LEAD OPERATIONS ─────────────────────────────────────
  const handleAddLead = () => {
    if (!form.name.trim()) { showToast("Lead name is required", "error"); return; }
    const result = qualifyLead(form, criteria, ind.typeName);
    const newLead = { ...form, id: Date.now() + Math.random(), createdAt: Date.now(), result };
    setLeads(prev => [newLead, ...prev]);
    setForm({ ...EMPTY_LEAD });
    showToast(`Lead "${form.name}" added & qualified`);
  };

  const handleDeleteLead = (id) => {
    setConfirmAction({
      title: "Delete Lead",
      message: "Are you sure? This can't be undone.",
      onConfirm: () => {
        setLeads(prev => prev.filter(l => l.id !== id));
        if (expandedLead === id) setExpandedLead(null);
        if (editingLead === id) { setEditingLead(null); setEditForm(null); }
        showToast("Lead deleted");
        setConfirmAction(null);
      },
    });
  };

  const handleSaveEdit = (id) => {
    if (!editForm) return;
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...editForm, result: qualifyLead(editForm, criteria, ind.typeName) } : l));
    setEditingLead(null); setEditForm(null);
    showToast("Lead updated");
  };

  const handleFollowUpChange = (id, status) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, followUp: status } : l));
  };

  const handleInlineSave = () => {
    if (!inlineEdit) return;
    const { id, field, value } = inlineEdit;
    setLeads(prev => prev.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      return { ...updated, result: qualifyLead(updated, criteria, ind.typeName) };
    }));
    setInlineEdit(null);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      if (parsed.length === 0) { showToast("No valid leads found in CSV", "error"); return; }
      const qualified = parsed.map(l => ({ ...l, id: Date.now() + Math.random(), createdAt: Date.now(), result: qualifyLead(l, criteria, ind.typeName) }));
      setLeads(prev => [...qualified, ...prev]);
      showToast(`${parsed.length} leads imported & qualified`);
      setShowUpload(false);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const requalifyAll = () => {
    setLeads(prev => prev.map(l => ({ ...l, result: qualifyLead(l, criteria, ind.typeName) })));
    showToast("All leads re-qualified with new criteria");
    setSettingsEdited(false);
  };

  // ─── PROSPECT SEARCH (Batched to avoid 60s Vercel timeout) ──
  const handleProspectSearch = async () => {
    if (!prospectCity.trim()) { showToast("Enter a city or region", "error"); return; }
    setProspectLoading(true);
    setProspectError(null);
    setProspects([]);

    const filterList = [];
    if (prospectFilters.hiringOnIndeed) filterList.push("Hiring on Indeed (growth signal)");
    if (prospectFilters.badWebsite) filterList.push("No website or bad website");
    if (prospectFilters.lowReviews) filterList.push("Low/few Google reviews (<20 reviews or <4.0 stars)");
    if (prospectFilters.noSocial) filterList.push("No social media presence");
    if (prospectFilters.runningAds) filterList.push("Running ads (Google/Facebook)");
    if (prospectFilters.recentlyStarted) filterList.push("Recently started business");

    const hardRequirements = [];
    if (prospectFilters.hiringOnIndeed) hardRequirements.push("MUST be actively hiring on Indeed right now — search Indeed.com for their open jobs and only include businesses with at least one active listing. Populate indeedHiring with the real job title, summary, and apply URL.");
    if (prospectFilters.badWebsite) hardRequirements.push("MUST have a poor quality website (outdated, broken, no booking/lead form) OR no website at all. Set websiteStatus to 'bad' or 'none'.");
    if (prospectFilters.lowReviews) hardRequirements.push("MUST have low Google reviews — fewer than 20 reviews OR a rating below 4.0 stars.");
    if (prospectFilters.noSocial) hardRequirements.push("MUST have little or no social media presence — no active Facebook, Instagram, or TikTok accounts.");
    if (prospectFilters.runningAds) hardRequirements.push("MUST be currently running paid ads on Google or Facebook.");
    if (prospectFilters.recentlyStarted) hardRequirements.push("MUST be a recently started business — established within the last 3 years.");

    const searchQuery = prospectNiche.trim() ? `${prospectNiche} companies in ${prospectCity.trim()}` : `small businesses in ${prospectCity.trim()}`;
    const nicheInstruction = prospectNiche.trim()
      ? `Focus specifically on ${prospectNiche} businesses.`
      : `Find a variety of local service businesses (e.g. HVAC, plumbing, roofing, cleaning, landscaping, auto repair, dental, gyms, restaurants — any small business that could benefit from better marketing, web presence, or automation).`;

    // Pipeline exclusions (fixed — doesn't grow)
    const pipelineExcluded = [
      ...leads.map(l => l.company || l.name),
      ...outreachProspects.map(p => p.businessName),
    ].filter(Boolean);

    const BATCH_SIZE = 5;
    const numBatches = Math.ceil(prospectCount / BATCH_SIZE);
    setBatchProgress({ current: 0, total: numBatches });

    const buildPrompt = (batchCount, excludedNames) => {
      const exclusionClause = excludedNames.length > 0
        ? `\n\nIMPORTANT — Do NOT include any of these businesses (already in pipeline or found in earlier batches):\n${excludedNames.map(n => `- ${n}`).join("\n")}\n`
        : "";
      return `You are helping a digital agency find businesses in ${prospectCity.trim()} that need their services.${exclusionClause}

${nicheInstruction}

TASK: Search for "${searchQuery}" and find ${batchCount} real local businesses. Then for each, gather additional info.
${hardRequirements.length > 0 ? `\nHARD REQUIREMENTS — every business returned MUST satisfy ALL of the following:\n${hardRequirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}\n\nDo NOT include any business that does not meet these requirements. If you cannot find enough qualifying businesses, return fewer results rather than including ones that don't qualify.\n` : ""}
Search steps:
1. Find ${batchCount} real businesses with names, addresses, phone numbers, websites
2. For each business check: Indeed job postings, Google reviews, Facebook/Instagram/LinkedIn presence, website quality, any ad activity
3. Identify buying signals${filterList.length > 0 ? `: ${filterList.join(", ")}` : ""}

CRITICAL: Your entire response must be ONLY a valid JSON array starting with [ and ending with ]. No text before or after. No markdown. No explanation. Just the raw JSON array.

Each object in the array must follow this exact structure:
[
  {
    "businessName": "Summit HVAC Services",
    "ownerName": "Mike Rivera",
    "phone": "(512) 555-0188",
    "email": "mike@summithvac.com",
    "website": "summithvac.com",
    "websiteQuality": "outdated, no online booking",
    "address": "1234 Main St, Austin TX 78701",
    "googleReviews": { "rating": 4.2, "count": 47 },
    "socialMedia": { "facebook": "active", "instagram": "none", "linkedin": "active", "tiktok": "none", "youtube": "none" },
    "indeedHiring": [
      { "title": "HVAC Technician", "summary": "Full-time, $25-35/hr, 2+ years experience required", "applyUrl": "https://www.indeed.com/viewjob?jk=abc123" }
    ],
    "linkedinJobs": [
      { "title": "Office Manager", "summary": "Part-time, admin experience preferred", "applyUrl": "https://www.linkedin.com/jobs/view/..." }
    ],
    "websiteStatus": "bad",
    "estimatedRevenue": "$500K-1M",
    "yearEstablished": "2019",
    "niche": "${prospectNiche.trim() || "local business"}",
    "buyingSignals": ["Hiring 2 positions on Indeed — scaling fast", "Website has no online booking"],
    "opportunities": ["Needs lead capture automation", "Website rebuild opportunity"],
    "sourceUrls": []
  }
]

IMPORTANT FIELD RULES:
- "websiteStatus": use "none" if no website exists, "bad" if website is outdated/broken/poor quality, "ok" if decent
- "website": include the full URL if one exists, empty string if none
- "indeedHiring": array of job objects with title, 1-sentence summary, and direct apply URL from indeed.com. Empty array if not hiring on Indeed.
- "linkedinJobs": array of job objects from LinkedIn. Empty array if none found.
- "socialMedia": check all 5 platforms. Use "active" if they post regularly, "inactive" if account exists but rarely posts, "none" if no presence found.

Return exactly ${batchCount} businesses. Use real data. If a field is unknown use empty string or empty array. DO NOT wrap in markdown code blocks.`;
    };

    const parseResponse = (fullText) => {
      let parsed = null;
      let parseError = "";
      // Strategy 1: JSON in code fences
      const fenceMatch = fullText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (fenceMatch) {
        try { parsed = JSON.parse(fenceMatch[1]); } catch (e) { parseError = `Fence parse failed: ${e.message}`; }
      }
      // Strategy 2: Greedy array match
      if (!parsed) {
        const greedyMatch = fullText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (greedyMatch) {
          try { parsed = JSON.parse(greedyMatch[0]); } catch {
            try { parsed = JSON.parse(greedyMatch[0].replace(/,\s*(?=[}\]])/g, '')); } catch (e) { parseError = `Greedy parse failed: ${e.message}`; }
          }
        }
      }
      // Strategy 3: Last [ ... ] block
      if (!parsed) {
        const lastBracket = fullText.lastIndexOf("[");
        if (lastBracket !== -1) {
          const slice = fullText.slice(lastBracket);
          try { const candidate = JSON.parse(slice); if (Array.isArray(candidate) && candidate.length > 0) parsed = candidate; } catch (e) { parseError = `Last-bracket parse failed: ${e.message}`; }
        }
      }
      return { parsed, parseError };
    };

    const normalizeResults = (parsed, offset) => parsed.map((r, i) => {
      const p = {
        id: Date.now() + offset + i + Math.random(),
        businessName: r.businessName || "Unknown Business",
        ownerName: r.ownerName || "",
        phone: r.phone || "",
        email: r.email || "",
        website: r.website || "",
        websiteStatus: r.websiteStatus || (r.website ? "ok" : "none"),
        websiteQuality: r.websiteQuality || "",
        address: r.address || "",
        googleReviews: r.googleReviews || { rating: 0, count: 0 },
        socialMedia: r.socialMedia || { facebook: "none", instagram: "none", linkedin: "none", tiktok: "none", youtube: "none" },
        indeedHiring: (r.indeedHiring || []).map(j => typeof j === "string" ? { title: j, summary: "", applyUrl: "" } : j),
        linkedinJobs: (r.linkedinJobs || []).map(j => typeof j === "string" ? { title: j, summary: "", applyUrl: "" } : j),
        estimatedRevenue: r.estimatedRevenue || "",
        yearEstablished: r.yearEstablished || "",
        niche: r.niche || prospectNiche,
        buyingSignals: r.buyingSignals || [],
        opportunities: r.opportunities || [],
        sourceUrls: r.sourceUrls || [],
        classification: null,
      };
      p.classification = classifyProspect(p);
      return p;
    });

    let allResults = [];

    for (let batch = 0; batch < numBatches; batch++) {
      setBatchProgress({ current: batch + 1, total: numBatches });
      const batchCount = Math.min(BATCH_SIZE, prospectCount - batch * BATCH_SIZE);
      const excludedNames = [...pipelineExcluded, ...allResults.map(r => r.businessName)].filter(Boolean);

      try {
        const response = await fetchWithRetry("/api/anthropic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-5",
            max_tokens: 8000,
            system: "You are a business research assistant for a digital agency. Search the web thoroughly for real businesses. Your response must be ONLY a valid JSON array — starting with [ and ending with ]. No markdown, no code fences, no explanation text before or after. If you include anything other than the JSON array, the response will fail to parse. Output the raw JSON array directly.",
            messages: [{ role: "user", content: buildPrompt(batchCount, excludedNames) }],
            tools: [{ type: "web_search_20250305", name: "web_search" }],
          }),
        });
        const data = await response.json();

        if (data.error) {
          const msg = data.error.message || "API error";
          console.error(`[ProspectSearch] Batch ${batch + 1} API error:`, data.error);
          if (allResults.length > 0) {
            showToast(`Batch ${batch + 1} failed — showing ${allResults.length} results`, "error");
          } else {
            setProspectError(`API error: ${msg}. Check that your Anthropic API key is set correctly in Vercel.`);
            setProspectLoading(false);
            setBatchProgress({ current: 0, total: 0 });
            return;
          }
          break;
        }

        const textParts = [];
        (data.content || []).forEach(block => { if (block.type === "text" && block.text) textParts.push(block.text); });
        const fullText = textParts.join("\n");
        console.log(`[ProspectSearch] Batch ${batch + 1} response length:`, fullText.length);

        const { parsed, parseError } = parseResponse(fullText);

        if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
          console.error(`[ProspectSearch] Batch ${batch + 1} parse failed:`, parseError, fullText.slice(0, 300));
          if (allResults.length > 0) {
            showToast(`Batch ${batch + 1} returned no results — showing ${allResults.length} found so far`, "error");
          } else {
            const suggestion = prospectNiche.trim()
              ? `Try reducing results to 5, or broaden the niche (e.g. "contractors" instead of a specific trade).`
              : `Try adding a specific niche (e.g. "HVAC" or "roofing") to get more targeted results.`;
            setProspectError(`No results parsed from AI response. ${suggestion}\n\nDebug: ${parseError || "Empty or non-array response"}`);
            setProspectLoading(false);
            setBatchProgress({ current: 0, total: 0 });
            return;
          }
          break;
        }

        const batchResults = normalizeResults(parsed, allResults.length);
        allResults = [...allResults, ...batchResults];
        setProspects([...allResults]); // Show results progressively
        console.log(`[ProspectSearch] Batch ${batch + 1} complete — total: ${allResults.length}`);

      } catch (err) {
        console.error(`[ProspectSearch] Batch ${batch + 1} error:`, err);
        const isTimeout = err.message?.includes("timeout") || err.message?.includes("504") || err.message?.includes("524");
        if (allResults.length > 0) {
          showToast(`Batch ${batch + 1} ${isTimeout ? "timed out" : "failed"} — showing ${allResults.length} results`, "error");
        } else {
          const isNetwork = err.message?.includes("fetch") || err.message?.includes("network");
          setProspectError(`Search failed: ${err.message || "Unknown error"}. ${isTimeout ? "The search timed out — try reducing the result count to 5." : isNetwork ? "Check your internet connection and try again." : "Try reducing the result count or adding a specific niche."}`);
          setProspectLoading(false);
          setBatchProgress({ current: 0, total: 0 });
          return;
        }
        break;
      }
    }

    if (allResults.length > 0) showToast(`Found ${allResults.length} prospects`);
    setProspectLoading(false);
    setBatchProgress({ current: 0, total: 0 });
  };

  // ─── EMAIL DRAFT GENERATION ──────────────────────────────
  const handleDraftEmail = async (prospect) => {
    setDraftingEmail(prospect.id);
    try {
      const signals = prospect.buyingSignals.slice(0, 2).join(", ");
      const opportunity = prospect.opportunities[0] || "improve their digital presence";

      const myCompany = companyName || "my agency";
      const myName = emailConfig.fromName || "";
      const myTitle = emailConfig.senderTitle || "";
      const myPhone = emailConfig.senderPhone || "";
      const myEmail = emailConfig.user || "";
      const signature = [myName, myTitle, myCompany, myPhone, myEmail].filter(Boolean).join("\n");

      const prompt = `Write a short, personalized cold email to ${prospect.businessName}${prospect.ownerName ? ` (owner: ${prospect.ownerName})` : ""}, a ${prospect.niche} business in ${prospect.address ? prospect.address.split(",").slice(-2).join(",").trim() : "their area"}.

Context:
- Buying signals: ${signals || "growing business"}
- Opportunity: ${opportunity}
- You are ${myName || "the sender"} from ${myCompany}, a digital agency offering AI automation, web development, and advertising services.

Framework:
- Hook: Reference something specific about their business
- Pain point: Connect it to a problem they likely have
- Offer: One simple thing you can help with (not a full pitch)
- CTA: Low-friction ask (quick call or reply)

Sign off with:
${signature || myCompany}

Keep it 4-5 sentences max. No fluff. Sound like a real person, not a salesperson.`;

      const response = await fetchWithRetry("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 500,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      if (data.error) {
        showToast("Failed to generate email", "error");
        setDraftingEmail(null);
        return;
      }

      const emailText = (data.content || []).find(b => b.type === "text")?.text || "";
      setEmailDrafts(prev => ({ ...prev, [prospect.id]: emailText }));
      showToast("Email draft generated");
    } catch (err) {
      console.error("Email draft error:", err);
      showToast("Failed to generate email", "error");
    }
    setDraftingEmail(null);
  };

  // ─── SHARED FETCH WITH RETRY ─────────────────────────────
  const fetchWithRetry = async (url, options, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, options);
        return res;
      } catch (err) {
        if (attempt === retries) throw err;
        await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
      }
    }
  };

  // ─── SALES PLAYBOOK GENERATION ───────────────────────────
  const handleGeneratePlaybook = async (prospect) => {
    // Toggle off if already open and cached
    if (playbookData[prospect.id]) {
      setOpenPlaybook(prev => prev === prospect.id ? null : prospect.id);
      return;
    }
    setGeneratingPlaybook(prospect.id);
    setOpenPlaybook(prospect.id);
    try {
      const prompt = `Analyze this business profile and create a detailed sales playbook for Ascend Solutions:

BUSINESS PROFILE:
- Business Name: ${prospect.businessName}
- Owner: ${prospect.ownerName || "Unknown"}
- Niche: ${prospect.niche}
- Location: ${prospect.address}
- Revenue: ${prospect.estimatedRevenue || "Unknown"}
- Year Established: ${prospect.yearEstablished || "Unknown"}
- Website: ${prospect.website || "None"} (Quality: ${prospect.websiteQuality || "Unknown"})
- Google Reviews: ${prospect.googleReviews?.rating || 0} stars, ${prospect.googleReviews?.count || 0} reviews
- Social Media: Facebook: ${prospect.socialMedia?.facebook || "none"}, Instagram: ${prospect.socialMedia?.instagram || "none"}, LinkedIn: ${prospect.socialMedia?.linkedin || "none"}
- Indeed Hiring: ${(prospect.indeedHiring || []).join(", ") || "None"}
- Buying Signals: ${(prospect.buyingSignals || []).join("; ") || "None identified"}
- Opportunities: ${(prospect.opportunities || []).join("; ") || "None identified"}

Respond with ONLY this JSON structure, no markdown:
{
  "diagnosis": [
    { "priority": "URGENT", "problem": "Problem title", "costingThem": "Why it costs them money RIGHT NOW", "signal": "Cite specific data from their profile" },
    { "priority": "HIGH", "problem": "Second problem", "costingThem": "Cost explanation", "signal": "Specific signal" },
    { "priority": "MEDIUM", "problem": "Third problem", "costingThem": "Cost explanation", "signal": "Specific signal" }
  ],
  "play": {
    "step1": { "title": "THE STARTER", "offer": "What to offer first", "whySolvesIt": "Why this solves their most immediate problem", "price": "$X,XXX", "whyYes": "Why they'd say yes" },
    "step2": { "title": "THE UPSELL", "offer": "What to offer next", "howStarterCreatesNeed": "How the starter creates the need for this", "price": "$XXX/month", "pitchAngle": "Reference their specific data" },
    "step3": { "title": "THE SCALE", "offer": "Full service package", "monthlyRetainer": "$X,XXX/month", "roiStory": "What ROI looks like for them" }
  },
  "revenue": { "monthlyValue": "$X,XXX", "annualValue": "$XX,XXX", "yourCutAnnual": "$X,XXX" }
}`;

      const response = await fetchWithRetry("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 2000,
          system: `You are a sales strategist for a digital agency called Ascend Solutions that helps service businesses grow. Ascend offers: website builds and rebuilds ($1,000-3,000), brand kits and social media templates ($500-1,000), Google and Facebook ad management ($800-1,500/month + ad spend), AI automation and lead capture systems ($500-1,500 setup + $200-400/month), social media management ($300-500/month), CRM and follow-up automation ($500-700 setup + $200-300/month), review management and reputation building ($200-300/month). Your job is to analyze a business profile and create a sales playbook that starts small (solve one problem to earn trust), then expands services as you prove value. Always lead with the most urgent pain point — the thing that's actively costing them money. Base your pricing estimates on the business's size, estimated revenue, and industry. Be specific — reference actual data from their profile. Respond with ONLY valid JSON. No markdown, no explanation.`,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      if (data.error) { showToast("Failed to generate playbook", "error"); setGeneratingPlaybook(null); return; }

      const textContent = (data.content || []).find(b => b.type === "text")?.text || "";
      let playbook = null;
      try {
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) playbook = JSON.parse(jsonMatch[0]);
      } catch (e) { console.error("Playbook parse error:", e); }

      if (playbook) {
        setPlaybookData(prev => ({ ...prev, [prospect.id]: playbook }));
      } else {
        showToast("Failed to parse playbook response", "error");
        setOpenPlaybook(null);
      }
    } catch (err) {
      console.error("Playbook error:", err);
      showToast("Failed to generate playbook", "error");
      setOpenPlaybook(null);
    }
    setGeneratingPlaybook(null);
  };

  const handleClearAll = () => {
    setConfirmAction({
      title: "Clear All Leads",
      message: `Delete all ${leads.length} leads? This can't be undone.`,
      onConfirm: () => { setLeads([]); setExpandedLead(null); setEditingLead(null); setConfirmAction(null); showToast("All leads cleared"); },
    });
  };

  const handleResetApp = () => {
    setConfirmAction({
      title: "Reset Everything",
      message: "This will delete all leads, criteria, and settings. Start fresh?",
      onConfirm: async () => {
        setLeads([]); setCriteria(getDefaultCriteria("construction")); setCompanyName(""); setIndustry("construction"); setProspects([]); setEmailDrafts({}); setQueueActions({}); setOutreachProspects([]); setOutreachDrafts({}); setOutreachStatuses({}); setEmailConfig({ host: "", port: 587, user: "", pass: "", fromName: "" }); setSetupComplete(false); setSetupStep(0); setTab("dashboard");
        try { localStorage.removeItem(SK.leads); localStorage.removeItem(SK.criteria); localStorage.removeItem(SK.settings); localStorage.removeItem(SK.outreachProspects); localStorage.removeItem(SK.outreachDrafts); localStorage.removeItem(SK.emailConfig); } catch {}
        setConfirmAction(null); showToast("App reset complete");
      },
    });
  };

  // ─── SMTP AUTO-DETECT ─────────────────────────────────────
  const detectSmtpHost = (email) => {
    const domain = (email || "").split("@")[1]?.toLowerCase() || "";
    if (domain === "gmail.com") return { host: "smtp.gmail.com", port: 587 };
    if (["outlook.com", "hotmail.com", "live.com"].includes(domain)) return { host: "smtp-mail.outlook.com", port: 587 };
    if (domain === "yahoo.com") return { host: "smtp.mail.yahoo.com", port: 465 };
    if (domain === "icloud.com") return { host: "smtp.mail.me.com", port: 587 };
    return { host: "", port: 587 };
  };

  // ─── OUTREACH OPERATIONS ──────────────────────────────────
  const handleAddToOutreach = (prospect) => {
    if (outreachProspects.find(p => p.id === prospect.id)) {
      showToast(`${prospect.businessName} already in Outreach`, "error"); return;
    }
    setOutreachProspects(prev => [prospect, ...prev]);
    // Pre-fill draft: use existing email draft if available, else playbook step1 body, else blank
    const existingDraft = emailDrafts[prospect.id];
    const playbook = playbookData[prospect.id];
    let body = existingDraft || "";
    let subject = `Quick question for ${prospect.businessName}`;
    if (!body && playbook?.play?.step1) {
      const s = playbook.play.step1;
      body = `Hi${prospect.ownerName ? " " + prospect.ownerName.split(" ")[0] : ""},\n\nI noticed ${prospect.businessName} ${playbook.diagnosis?.[0]?.signal || "and wanted to reach out"}.\n\nWe help ${prospect.niche} businesses like yours with ${s.offer}. ${s.whySolvesIt}\n\nWould a quick 15-minute call this week make sense?\n\nBest,\n${companyName || "Ascend Solutions"}`;
      subject = `${s.offer?.split(" ").slice(0, 5).join(" ")} for ${prospect.businessName}`;
    }
    setOutreachDrafts(prev => ({
      ...prev,
      [prospect.id]: { to: prospect.email || "", subject, body },
    }));
    setOutreachStatuses(prev => ({ ...prev, [prospect.id]: "draft" }));
    showToast(`${prospect.businessName} added to Outreach`);
  };

  const handleAddProspectToLeads = (prospect) => {
    if (addedToLeads.has(prospect.id)) { showToast(`${prospect.businessName} already added to Leads`, "error"); return; }
    const newLead = {
      id: Date.now() + Math.random(),
      createdAt: Date.now(),
      name: prospect.ownerName || prospect.businessName,
      company: prospect.businessName,
      email: prospect.email || "",
      phone: prospect.phone || "",
      projectType: "",
      budget: "",
      location: prospect.address || "",
      zipCode: "",
      timeline: "",
      description: prospect.buyingSignals ? prospect.buyingSignals.join("; ") : "",
      source: "My Queue",
      followUp: "new",
      // Preserve all rich prospect data
      businessName: prospect.businessName,
      ownerName: prospect.ownerName || "",
      website: prospect.website || "",
      websiteQuality: prospect.websiteQuality || "",
      niche: prospect.niche || "",
      googleReviews: prospect.googleReviews || { rating: 0, count: 0 },
      socialMedia: prospect.socialMedia || {},
      indeedHiring: prospect.indeedHiring || [],
      estimatedRevenue: prospect.estimatedRevenue || "",
      yearEstablished: prospect.yearEstablished || "",
      buyingSignals: prospect.buyingSignals || [],
      opportunities: prospect.opportunities || [],
      classification: prospect.classification || null,
      result: qualifyLead({ name: prospect.ownerName || prospect.businessName, company: prospect.businessName, email: prospect.email || "", phone: prospect.phone || "", projectType: "", budget: "", location: prospect.address || "", zipCode: "", timeline: "", description: "", source: "My Queue", followUp: "new" }, criteria, ind.typeName),
    };
    setLeads(prev => [newLead, ...prev]);
    setAddedToLeads(prev => new Set([...prev, prospect.id]));
    showToast(`${prospect.businessName} added to Leads`);
  };

  const handleSendEmail = async (prospect) => {
    if (!emailConfig.user || !emailConfig.pass) {
      showToast("Configure your email in Settings → Email first", "error"); return;
    }
    const draft = outreachDrafts[prospect.id];
    if (!draft?.to) { showToast("Add a recipient email address", "error"); return; }
    if (!draft?.subject) { showToast("Add a subject line", "error"); return; }
    if (!draft?.body) { showToast("Email body is empty", "error"); return; }
    setSendingEmail(prospect.id);
    try {
      const response = await fetchWithRetry("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpConfig: { host: emailConfig.host, port: emailConfig.port, user: emailConfig.user, pass: emailConfig.pass, fromName: emailConfig.fromName || companyName },
          to: draft.to,
          subject: draft.subject,
          body: draft.body,
        }),
      });
      const data = await response.json();
      if (!response.ok) { showToast(data.error || "Send failed", "error"); setSendingEmail(null); return; }
      setOutreachStatuses(prev => ({ ...prev, [prospect.id]: "sent" }));
      showToast(`Email sent to ${prospect.businessName} ✓`);
    } catch (err) {
      console.error("Send email error:", err);
      showToast("Failed to send — check your email settings", "error");
    }
    setSendingEmail(null);
  };

  // ─── FILTERED & SORTED LEADS ─────────────────────────────
  const filteredLeads = useMemo(() => {
    let result = [...leads];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        (l.name || "").toLowerCase().includes(q) || (l.company || "").toLowerCase().includes(q) ||
        (l.email || "").toLowerCase().includes(q) || (l.projectType || "").toLowerCase().includes(q) ||
        (l.location || "").toLowerCase().includes(q) || (l.zipCode || "").includes(q)
      );
    }
    if (filterStatus === "qualified") result = result.filter(l => l.result.qualified);
    if (filterStatus === "unqualified") result = result.filter(l => !l.result.qualified);
    if (filterFollowUp !== "all") result = result.filter(l => l.followUp === filterFollowUp);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") cmp = (a.createdAt || 0) - (b.createdAt || 0);
      else if (sortBy === "name") cmp = (a.name || "").localeCompare(b.name || "");
      else if (sortBy === "budget") cmp = (parseFloat(a.budget) || 0) - (parseFloat(b.budget) || 0);
      else if (sortBy === "score") cmp = (a.result.score / (a.result.total || 1)) - (b.result.score / (b.result.total || 1));
      return sortDir === "desc" ? -cmp : cmp;
    });
    return result;
  }, [leads, searchQuery, filterStatus, filterFollowUp, sortBy, sortDir]);

  // ─── ANALYTICS DATA ──────────────────────────────────────
  const analytics = useMemo(() => {
    if (leads.length === 0) return null;
    const qualified = leads.filter(l => l.result.qualified).length;
    const unqualified = leads.length - qualified;
    const qualRate = Math.round((qualified / leads.length) * 100);
    const byType = {}; leads.forEach(l => { const tp = l.projectType || "unknown"; byType[tp] = (byType[tp] || 0) + 1; });
    const typeData = Object.entries(byType).map(([name, value]) => ({ name: name.replace(/_/g, " "), value })).sort((a, b) => b.value - a.value);
    const bySource = {}; leads.forEach(l => { const s = l.source || "Unknown"; bySource[s] = (bySource[s] || 0) + 1; });
    const sourceData = Object.entries(bySource).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const budgets = leads.map(l => parseFloat(l.budget)).filter(b => !isNaN(b));
    const totalPipeline = budgets.reduce((a, b) => a + b, 0);
    const qualifiedPipeline = leads.filter(l => l.result.qualified).map(l => parseFloat(l.budget)).filter(b => !isNaN(b)).reduce((a, b) => a + b, 0);
    const avgDeal = budgets.length > 0 ? totalPipeline / budgets.length : 0;
    const budgetBrackets = [
      { label: "<$50K", min: 0, max: 50000 },
      { label: "$50K–250K", min: 50000, max: 250000 },
      { label: "$250K–1M", min: 250000, max: 1000000 },
      { label: "$1M–5M", min: 1000000, max: 5000000 },
      { label: "$5M+", min: 5000000, max: Infinity },
    ];
    const budgetDistribution = budgetBrackets.map(b => ({
      name: b.label,
      count: budgets.filter(v => v >= b.min && v < b.max).length,
    })).filter(b => b.count > 0);
    const disqualReasons = {};
    leads.forEach(l => { l.result.criteria.filter(c => !c.pass).forEach(c => { disqualReasons[c.name] = (disqualReasons[c.name] || 0) + 1; }); });
    const topDisqualReasons = Object.entries(disqualReasons).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    const byFollowUp = {}; leads.forEach(l => { const f = l.followUp || "new"; byFollowUp[f] = (byFollowUp[f] || 0) + 1; });
    return { qualified, unqualified, qualRate, typeData, sourceData, totalPipeline, qualifiedPipeline, avgDeal, budgetDistribution, topDisqualReasons, byFollowUp };
  }, [leads]);

  // ─── STYLES ───────────────────────────────────────────────
  const inputStyle = { width: "100%", padding: "10px 14px", background: t.bgAlt, border: `1px solid ${t.borderInput}`, borderRadius: 6, color: t.text, fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textDim, marginBottom: 6 };
  const cardStyle = { background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 16 };
  const btnPrimary = { padding: "10px 24px", background: t.accent, border: "none", borderRadius: 8, color: "#0c0a09", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" };
  const btnSecondary = { padding: "8px 16px", background: t.bgHover, border: `1px solid ${t.borderLight}`, borderRadius: 6, color: t.text, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" };
  const CHART_COLORS = ["#f59e0b", "#60a5fa", "#34d399", "#a78bfa", "#f87171", "#fb923c", "#2dd4bf"];

  const InlineCell = ({ lead, field, children, type = "text", options, style: cellStyle = {} }) => {
    const isEditing = inlineEdit?.id === lead.id && inlineEdit?.field === field;
    if (isEditing) {
      if (options) {
        return (
          <select className="inline-input" value={inlineEdit.value || ""} autoFocus
            onChange={e => setInlineEdit(p => ({ ...p, value: e.target.value }))}
            onBlur={handleInlineSave}
            onKeyDown={e => { if (e.key === "Enter") handleInlineSave(); if (e.key === "Escape") { e.stopPropagation(); setInlineEdit(null); } }}
            onClick={e => e.stopPropagation()}
          >
            <option value="">Select…</option>
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      }
      return (
        <input className="inline-input" type={type} value={inlineEdit.value || ""} autoFocus
          onChange={e => setInlineEdit(p => ({ ...p, value: e.target.value }))}
          onBlur={handleInlineSave}
          onKeyDown={e => { if (e.key === "Enter") handleInlineSave(); if (e.key === "Escape") { e.stopPropagation(); setInlineEdit(null); } }}
          onClick={e => e.stopPropagation()}
          style={cellStyle}
        />
      );
    }
    return (
      <span className="editable-cell" onClick={e => { e.stopPropagation(); setInlineEdit({ id: lead.id, field, value: lead[field] || "" }); }} title="Click to edit" style={cellStyle}>
        {children}
      </span>
    );
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0c0a09", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#f59e0b", fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, animation: "pulse 1.2s infinite" }}>Loading…</div>
    </div>
  );

  // ─── SETUP WIZARD ─────────────────────────────────────────
  if (!setupComplete) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Outfit:wght@400;600;700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
          input:focus, select:focus { border-color: #f59e0b !important; box-shadow: 0 0 0 3px rgba(245,158,11,0.15); }
        `}</style>
        <div style={{ minHeight: "100vh", background: "#0c0a09", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 20 }}>
          <div style={{ maxWidth: 620, width: "100%", animation: "fadeIn 0.5s ease" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 40, justifyContent: "center" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 60, height: 4, borderRadius: 2, background: i <= setupStep ? "#f59e0b" : "#292524", transition: "background 0.3s" }} />
              ))}
            </div>

            {setupStep === 0 && (
              <div style={{ textAlign: "center", animation: "fadeIn 0.4s ease" }}>
                <div style={{ width: 64, height: 64, background: "#f59e0b", borderRadius: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#0c0a09", fontFamily: "'Outfit', sans-serif", marginBottom: 24 }}>LQ</div>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fafaf9", fontFamily: "'Outfit', sans-serif", marginBottom: 12 }}>Lead Qualifier</h1>
                <p style={{ color: "#a8a29e", fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>Automatically find, score, and qualify leads in seconds. Let's set up your profile.</p>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ ...labelStyle, color: "#78716c", textAlign: "left" }}>Your Company Name</label>
                  <input style={{ ...inputStyle, background: "#1c1917", borderColor: "#3a3631", textAlign: "center", fontSize: 18, padding: "14px 20px" }} value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your company name" autoFocus />
                </div>
                <div style={{ marginBottom: 28 }}>
                  <label style={{ ...labelStyle, color: "#78716c", textAlign: "left" }}>Your Industry</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginTop: 4 }}>
                    {INDUSTRY_LIST.map(i => (
                      <button key={i.id} onClick={() => { setIndustry(i.id); setCriteria(getDefaultCriteria(i.id)); }}
                        style={{ padding: "14px 12px", background: industry === i.id ? "#f59e0b" : "#1c1917", border: `2px solid ${industry === i.id ? "#f59e0b" : "#292524"}`, borderRadius: 12, color: industry === i.id ? "#0c0a09" : "#a8a29e", cursor: "pointer", fontSize: 13, fontWeight: industry === i.id ? 700 : 500, fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", textAlign: "center", lineHeight: 1.3 }}>
                        <span style={{ fontSize: 22, display: "block", marginBottom: 6 }}>{i.icon}</span>
                        {i.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setSetupStep(1)} style={{ ...btnPrimary, padding: "14px 40px", fontSize: 16, width: "100%" }}>Continue →</button>
              </div>
            )}

            {setupStep === 1 && (
              <div style={{ animation: "fadeIn 0.4s ease" }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fafaf9", fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>Set Your Criteria</h2>
                <p style={{ color: "#a8a29e", fontSize: 14, marginBottom: 28 }}>Leads that match all criteria will be marked as qualified. You can always change these later.</p>
                <div style={cardStyle}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#fafaf9" }}>💰 Budget Range</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div><label style={labelStyle}>Minimum ($)</label><input style={inputStyle} type="number" value={criteria.minBudget} onChange={e => setCriteria(p => ({ ...p, minBudget: parseInt(e.target.value) || 0 }))} /></div>
                    <div><label style={labelStyle}>Maximum ($)</label><input style={inputStyle} type="number" value={criteria.maxBudget} onChange={e => setCriteria(p => ({ ...p, maxBudget: parseInt(e.target.value) || 0 }))} /></div>
                  </div>
                </div>
                <div style={cardStyle}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: "#fafaf9" }}>📍 Service Area (Optional)</h3>
                  <p style={{ fontSize: 12, color: "#57534e", marginBottom: 12 }}>ZIP code prefixes, comma-separated. Leave empty to skip.</p>
                  <input style={inputStyle} value={criteria.serviceAreaZips} onChange={e => setCriteria(p => ({ ...p, serviceAreaZips: e.target.value }))} placeholder="e.g. 941, 940, 950" />
                </div>
                <div style={cardStyle}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#fafaf9" }}>⏱ Timeline Range</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div><label style={labelStyle}>Min Months</label><input style={inputStyle} type="number" value={criteria.minTimelineMonths} onChange={e => setCriteria(p => ({ ...p, minTimelineMonths: parseInt(e.target.value) || 0 }))} /></div>
                    <div><label style={labelStyle}>Max Months</label><input style={inputStyle} type="number" value={criteria.maxTimelineMonths} onChange={e => setCriteria(p => ({ ...p, maxTimelineMonths: parseInt(e.target.value) || 0 }))} /></div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setSetupStep(0)} style={{ ...btnSecondary, flex: 1, background: "#1c1917" }}>← Back</button>
                  <button onClick={() => setSetupStep(2)} style={{ ...btnPrimary, flex: 2 }}>Continue →</button>
                </div>
              </div>
            )}

            {setupStep === 2 && (
              <div style={{ textAlign: "center", animation: "fadeIn 0.4s ease" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fafaf9", fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>You're All Set!</h2>
                <p style={{ color: "#a8a29e", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>{companyName ? `${companyName} is` : "Your qualifier is"} ready to go. Want to load some sample leads to see how it works?</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <button onClick={() => { setSetupComplete(true); setTab("prospects"); }} style={{ ...btnPrimary, width: "100%", padding: "14px 40px", fontSize: 15 }}>⚡ Find Prospects →</button>
                  <button onClick={() => { setSetupComplete(true); setTab("add"); }} style={{ ...btnSecondary, width: "100%", padding: "12px 40px", background: "#1c1917" }}>Start Empty — I'll Add My Own</button>
                  <button onClick={() => setSetupStep(1)} style={{ background: "transparent", border: "none", color: "#78716c", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", padding: 8 }}>← Back to Criteria</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ─── MAIN APP ─────────────────────────────────────────────
  const qualifiedCount = leads.filter(l => l.result.qualified).length;
  const unqualifiedCount = leads.length - qualifiedCount;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus, textarea:focus { border-color: ${t.accent} !important; box-shadow: 0 0 0 2px ${t.accent}22; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${t.bg}; }
        ::-webkit-scrollbar-thumb { background: ${t.borderLight}; border-radius: 3px; }
        @keyframes slideUp { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        .lead-row:hover { background: ${t.bgHover} !important; }
        .sort-btn { background: transparent; border: none; color: ${t.textDim}; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; transition: all 0.15s; }
        .sort-btn:hover, .sort-btn.active { color: ${t.accent}; background: ${t.accent}11; }
        .inline-input { width: 100%; padding: 4px 8px; background: ${t.bg}; border: 1.5px solid ${t.accent}; border-radius: 4px; color: ${t.text}; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; box-sizing: border-box; }
        .editable-cell { cursor: text; padding: 2px 4px; border-radius: 4px; transition: background 0.15s; min-height: 20px; }
        .editable-cell:hover { background: ${t.accent}11; }
        @media (max-width: 900px) {
          .lead-grid-header { display: none !important; }
          .lead-row { grid-template-columns: 1fr !important; gap: 6px !important; padding: 14px 16px !important; position: relative; }
          .lead-row > div:nth-child(2)::before,
          .lead-row > div:nth-child(3)::before,
          .lead-row > div:nth-child(4)::before,
          .lead-row > div:nth-child(5)::before {
            font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${t.textFaint}; margin-right: 8px; display: inline;
          }
          .lead-row > div:nth-child(2)::before { content: 'Type: '; }
          .lead-row > div:nth-child(3)::before { content: 'Budget: '; }
          .lead-row > div:nth-child(4)::before { content: 'Timeline: '; }
          .lead-row > div:nth-child(5)::before { content: 'ZIP: '; }
          .lead-row > div:nth-child(6) { margin-top: 4px; }
          .lead-row > span:last-child { justify-self: start; margin-top: 4px; }
          .mobile-hide { display: none !important; }
          .stat-row { flex-direction: column !important; gap: 16px !important; }
          .stat-row > div:not(:first-child) > div:first-child { display: none !important; }
          .chart-grid { grid-template-columns: 1fr !important; }
          .toolbar-row { flex-direction: column !important; align-items: stretch !important; }
          .toolbar-row > * { width: 100% !important; }
          .toolbar-row > div { display: flex !important; flex-wrap: wrap !important; }
          .header-stats { display: none !important; }
        }
        @media (max-width: 600px) {
          .app-header { padding: 16px !important; }
          .app-content { padding: 16px !important; }
          .tab-bar { padding: 0 12px !important; }
          .tab-bar button { padding: 10px 14px !important; font-size: 12px !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif" }}>
        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, padding: "12px 20px", borderRadius: 8, background: toast.type === "error" ? t.redBg : t.greenBg, color: t.text, fontSize: 14, fontWeight: 600, animation: "slideUp 0.3s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", border: `1px solid ${toast.type === "error" ? t.redBorder : t.greenBorder}` }}>
            {toast.msg}
          </div>
        )}

        {/* Confirm Dialog */}
        {confirmAction && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 998, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, animation: "fadeIn 0.2s ease" }} onClick={() => setConfirmAction(null)}>
            <div onClick={e => e.stopPropagation()} style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 16, padding: 28, maxWidth: 400, width: "100%", animation: "slideUp 0.3s ease" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{confirmAction.title}</h3>
              <p style={{ color: t.textMuted, fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>{confirmAction.message}</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button onClick={() => setConfirmAction(null)} style={btnSecondary}>Cancel</button>
                <button onClick={confirmAction.onConfirm} style={{ ...btnPrimary, background: t.red, padding: "10px 20px" }}>Confirm</button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ borderBottom: `1px solid ${t.border}`, background: theme === "dark" ? "linear-gradient(180deg, #151311 0%, #0c0a09 100%)" : "linear-gradient(180deg, #fff 0%, #faf9f7 100%)" }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 32px" }} className="app-header">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, background: t.accent, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 17, color: "#0c0a09" }}>LQ</div>
                <div>
                  <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, fontFamily: "'Outfit', sans-serif" }}>{companyName || "Lead Qualifier"}</h1>
                  <p style={{ fontSize: 11, color: t.textDim, letterSpacing: "0.06em", textTransform: "uppercase" }}>{ind.label} · {leads.length} leads · {qualifiedCount} qualified</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {leads.length > 0 && (
                  <div style={{ display: "flex", gap: 16, marginRight: 8 }} className="header-stats">
                    {[
                      { val: qualifiedCount, label: "Pass", color: t.green },
                      { val: unqualifiedCount, label: "Fail", color: t.red },
                      { val: `${leads.length > 0 ? Math.round((qualifiedCount / leads.length) * 100) : 0}%`, label: "Rate", color: t.text },
                    ].map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: i < 2 ? 0 : 0 }}>
                        {i > 0 && <div style={{ width: 1, height: 36, background: t.borderLight, marginRight: 16 }} />}
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                          <div style={{ color: t.textFaint, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Toggle theme"
                  style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${t.borderLight}`, background: t.bgHover, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", color: t.text, transition: "all 0.2s" }}>
                  {theme === "dark" ? "☀" : "🌙"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: `1px solid ${t.border}` }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", display: "flex", gap: 2, overflowX: "auto" }} className="tab-bar">
            {[{ id: "dashboard", label: "Dashboard" }, { id: "prospects", label: "Prospects" }, { id: "queue", label: "My Queue" }, { id: "outreach", label: "Cold Outreach", count: outreachProspects.length || undefined }, { id: "leads", label: "Leads", count: leads.length }, { id: "add", label: "+ Add" }, { id: "settings", label: "Criteria" }].map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)} style={{ padding: "12px 20px", background: tab === tb.id ? t.accent : "transparent", color: tab === tb.id ? "#0c0a09" : t.textMuted, border: "none", borderBottom: tab === tb.id ? `3px solid ${t.accent}` : "3px solid transparent", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: tab === tb.id ? 700 : 500, letterSpacing: "0.02em", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                {tb.label}
                {tb.count !== undefined && <span style={{ background: tab === tb.id ? "#00000033" : t.bgHover, color: tab === tb.id ? "#0c0a09" : t.textDim, padding: "1px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{tb.count}</span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 32px" }} className="app-content">

          {/* ════════════ DASHBOARD ════════════ */}
          {tab === "dashboard" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              {!analytics ? (
                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                  <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📊</div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: t.textMuted, marginBottom: 8 }}>No data yet</h3>
                  <p style={{ color: t.textFaint, fontSize: 14, marginBottom: 24 }}>Add some leads to see your qualification analytics</p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => setTab("prospects")} style={btnPrimary}>⚡ Find Prospects</button>
                    <button onClick={() => setTab("add")} style={btnSecondary}>+ Add Manually</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }} className="chart-grid">
                  {/* Stats row */}
                  <div style={{ ...cardStyle, display: "flex", justifyContent: "space-around", alignItems: "center", gridColumn: "1 / -1" }} className="stat-row">
                    {[
                      { val: leads.length, label: "Total Leads", color: t.accent },
                      { val: `${analytics.qualRate}%`, label: "Qual Rate", color: t.green },
                      { val: `$${(analytics.qualifiedPipeline / 1000000).toFixed(1)}M`, label: "Qualified Pipeline", color: t.accent },
                      { val: `$${analytics.avgDeal >= 1000000 ? (analytics.avgDeal / 1000000).toFixed(1) + "M" : Math.round(analytics.avgDeal / 1000).toLocaleString() + "K"}`, label: "Avg Deal", color: t.text },
                    ].map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center" }}>
                        {i > 0 && <div style={{ width: 1, height: 48, background: t.border, marginRight: 32, marginLeft: 8 }} />}
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: s.color }}>{s.val}</div>
                          <div style={{ color: t.textDim, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pie chart */}
                  <div style={cardStyle}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Qualification Split</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart><Pie data={[{ name: "Qualified", value: analytics.qualified }, { name: "Unqualified", value: analytics.unqualified }]} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value"><Cell fill={t.green} /><Cell fill={t.red} /></Pie><Tooltip contentStyle={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 13 }} /></PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", justifyContent: "center", gap: 20, fontSize: 12, marginTop: 4 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: t.green, display: "inline-block" }} /> Qualified ({analytics.qualified})</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: t.red, display: "inline-block" }} /> Unqualified ({analytics.unqualified})</span>
                    </div>
                  </div>

                  {/* By project type */}
                  <div style={cardStyle}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>By {ind.typeName}</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.typeData} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <XAxis type="number" hide /><YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: t.textMuted }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 13 }} cursor={{ fill: t.bgHover }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>{analytics.typeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* By source */}
                  <div style={cardStyle}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>By Lead Source</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.sourceData} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <XAxis type="number" hide /><YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: t.textMuted }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 13 }} cursor={{ fill: t.bgHover }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#60a5fa" barSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Budget distribution */}
                  {analytics.budgetDistribution.length > 0 && (
                    <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Budget Distribution</h3>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={analytics.budgetDistribution} margin={{ left: 0, right: 20, bottom: 0 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: t.textMuted }} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip contentStyle={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 8, fontSize: 13 }} cursor={{ fill: t.bgHover }} />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={48}>
                            {analytics.budgetDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Disqualification reasons */}
                  {analytics.topDisqualReasons.length > 0 && (
                    <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Top Disqualification Reasons</h3>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {analytics.topDisqualReasons.map((r, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: t.bgHover, borderRadius: 8, borderLeft: `3px solid ${t.red}` }}>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: t.red }}>{r.count}</span>
                            <span style={{ fontSize: 13, color: t.textMuted }}>{r.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up pipeline */}
                  <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Follow-Up Pipeline</h3>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {FOLLOWUP_STATUSES.map(s => (
                        <div key={s.id} style={{ flex: "1 1 100px", padding: "16px 12px", background: t.bgHover, borderRadius: 8, textAlign: "center", borderTop: `3px solid ${s.color}`, minWidth: 100 }}>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: s.color }}>{analytics.byFollowUp[s.id] || 0}</div>
                          <div style={{ fontSize: 11, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════ ADD LEAD ════════════ */}
          {tab === "add" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>New Lead Entry</h2>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setShowUpload(!showUpload)} style={btnSecondary}>{showUpload ? "✕ Close Upload" : "↑ CSV Upload"}</button>
                </div>
              </div>

              {showUpload && (
                <div style={{ marginBottom: 24, padding: 24, border: `2px dashed ${t.borderInput}`, borderRadius: 12, background: t.bgHover, textAlign: "center", animation: "slideUp 0.3s ease" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                  <p style={{ fontSize: 14, color: t.textMuted, marginBottom: 4 }}>Upload a CSV file with your leads</p>
                  <p style={{ fontSize: 11, color: t.textFaint, marginBottom: 16 }}>Columns: name, company, email, phone, projectType, budget, location, zipCode, timeline, description, source</p>
                  <input ref={fileRef} type="file" accept=".csv" onChange={handleCSVUpload} style={{ display: "none" }} />
                  <button onClick={() => fileRef.current?.click()} style={btnPrimary}>Choose File</button>
                  <button onClick={() => {
                    const t1 = PROJECT_TYPES[0]?.id || "type1"; const t2 = PROJECT_TYPES[1]?.id || "type2";
                    const sample = `name,company,email,phone,projectType,budget,location,zipCode,timeline,description,source\nJohn Smith,Example Corp,john@example.com,555-0101,${t1},250000,Downtown,90210,6-12,Sample ${ind.leadNoun} description,Website\nJane Doe,Another Co,jane@example.com,555-0102,${t2},45000,Suburbs,10001,0-3,Another sample ${ind.leadNoun},Referral`;
                    const blob = new Blob([sample], { type: "text/csv" }); const url = URL.createObjectURL(blob);
                    const a = document.createElement("a"); a.href = url; a.download = "sample_leads.csv"; a.click();
                  }} style={{ marginLeft: 12, ...btnSecondary, background: "transparent" }}>↓ Sample CSV</button>
                </div>
              )}

              <div style={cardStyle} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && e.target.tagName !== "TEXTAREA") handleAddLead(); }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
                  <div><label style={labelStyle}>Contact Name *</label><input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Smith" autoFocus /></div>
                  <div><label style={labelStyle}>Company</label><input style={inputStyle} value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Company name" /></div>
                  <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com" /></div>
                  <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="(555) 123-4567" /></div>
                  <div><label style={labelStyle}>{ind.typeName} *</label><select style={{ ...inputStyle, cursor: "pointer" }} value={form.projectType} onChange={e => setForm(p => ({ ...p, projectType: e.target.value }))}><option value="">Select…</option>{PROJECT_TYPES.map(pt => <option key={pt.id} value={pt.id}>{pt.label}</option>)}</select></div>
                  <div><label style={labelStyle}>Budget ($) *</label><input style={inputStyle} type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} placeholder="250000" /></div>
                  <div><label style={labelStyle}>Location</label><input style={inputStyle} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="City / Area" /></div>
                  <div><label style={labelStyle}>ZIP Code</label><input style={inputStyle} value={form.zipCode} onChange={e => setForm(p => ({ ...p, zipCode: e.target.value }))} placeholder="90210" /></div>
                  <div><label style={labelStyle}>Timeline</label><select style={{ ...inputStyle, cursor: "pointer" }} value={form.timeline} onChange={e => setForm(p => ({ ...p, timeline: e.target.value }))}><option value="">Select…</option>{TIMELINE_OPTIONS.map(tl => <option key={tl.value} value={tl.value}>{tl.label}</option>)}</select></div>
                  <div><label style={labelStyle}>Lead Source</label><input style={inputStyle} value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} placeholder="Website, Referral…" /></div>
                </div>
                <div style={{ marginTop: 18 }}><label style={labelStyle}>Project Description</label><textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the project scope…" /></div>
                <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                  <button onClick={handleAddLead} style={{ ...btnPrimary, padding: "12px 32px" }}>Qualify & Add Lead →</button>
                  <button onClick={() => setForm({ ...EMPTY_LEAD })} style={{ ...btnSecondary, background: "transparent" }}>Clear</button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════ LEADS ════════════ */}
          {tab === "leads" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              {leads.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                  <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🏗</div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: t.textMuted, marginBottom: 8 }}>No leads yet</h3>
                  <p style={{ color: t.textFaint, fontSize: 14, marginBottom: 24 }}>Find real opportunities or add leads manually</p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => setTab("prospects")} style={btnPrimary}>⚡ Find Prospects</button>
                    <button onClick={() => setTab("add")} style={btnSecondary}>+ Add Manually</button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Toolbar */}
                  <div className="toolbar-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <input style={{ ...inputStyle, width: 200, padding: "8px 14px", fontSize: 13 }} placeholder="Search leads…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                      {["all", "qualified", "unqualified"].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${filterStatus === s ? t.accent : t.borderLight}`, background: filterStatus === s ? t.accent : "transparent", color: filterStatus === s ? "#0c0a09" : t.textMuted, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", textTransform: "capitalize", transition: "all 0.15s" }}>
                          {s === "all" ? `All (${leads.length})` : s === "qualified" ? `Qualified (${qualifiedCount})` : `Unqualified (${unqualifiedCount})`}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => {
                        const csv = ["Name,Company,Email,Phone,Project Type,Budget,Location,ZIP,Timeline,Source,Status,Follow Up,Score", ...leads.map(l => `"${l.name}","${l.company}","${l.email}","${l.phone}","${l.projectType}","${l.budget}","${l.location}","${l.zipCode}","${l.timeline}","${l.source}","${l.result.qualified ? "Qualified" : "Unqualified"}","${l.followUp}","${l.result.score}/${l.result.total}"`)].join("\n");
                        const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob);
                        const a = document.createElement("a"); a.href = url; a.download = "qualified_leads.csv"; a.click();
                      }} style={btnSecondary}>↓ Export</button>
                      <button onClick={handleClearAll} style={{ ...btnSecondary, color: t.red, borderColor: t.redBorder }}>Clear All</button>
                    </div>
                  </div>

                  {/* Follow-up filter */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>Follow-up:</span>
                    <button onClick={() => setFilterFollowUp("all")} style={{ padding: "4px 12px", borderRadius: 12, border: `1px solid ${filterFollowUp === "all" ? t.accent : t.borderLight}`, background: filterFollowUp === "all" ? t.accent + "22" : "transparent", color: filterFollowUp === "all" ? t.accent : t.textDim, cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>All</button>
                    {FOLLOWUP_STATUSES.map(s => (
                      <button key={s.id} onClick={() => setFilterFollowUp(s.id)} style={{ padding: "4px 12px", borderRadius: 12, border: `1px solid ${filterFollowUp === s.id ? s.color : t.borderLight}`, background: filterFollowUp === s.id ? s.color + "22" : "transparent", color: filterFollowUp === s.id ? s.color : t.textDim, cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>{s.label}</button>
                    ))}
                  </div>

                  {/* Sort */}
                  <div style={{ display: "flex", gap: 4, marginBottom: 8, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: t.textFaint, marginRight: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Sort:</span>
                      {[{ id: "date", label: "Date" }, { id: "name", label: "Name" }, { id: "budget", label: "Budget" }, { id: "score", label: "Score" }].map(s => (
                        <button key={s.id} className={`sort-btn ${sortBy === s.id ? "active" : ""}`} onClick={() => { if (sortBy === s.id) setSortDir(d => d === "desc" ? "asc" : "desc"); else { setSortBy(s.id); setSortDir("desc"); } }}>
                          {s.label} {sortBy === s.id ? (sortDir === "desc" ? "↓" : "↑") : ""}
                        </button>
                      ))}
                    </div>
                    <span style={{ fontSize: 10, color: t.textFaint, fontStyle: "italic" }}>Click any cell to edit inline · Esc to cancel</span>
                  </div>

                  {/* Table header */}
                  <div className="lead-grid-header" style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 0.8fr 0.8fr 1fr 120px 36px", gap: 8, padding: "10px 16px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: t.textFaint, borderBottom: `1px solid ${t.border}` }}>
                    <span>Name</span><span>{ind.typeName}</span><span>Budget</span><span>Timeline</span><span>ZIP</span><span>Follow-up</span><span>Status</span><span></span>
                  </div>

                  {filteredLeads.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: t.textFaint, fontSize: 14 }}>No leads match your filters</div>
                  ) : filteredLeads.map((lead, idx) => (
                    <div key={lead.id}>
                      <div className="lead-row" style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 0.8fr 0.8fr 1fr 120px 36px", gap: 8, padding: "12px 16px", fontSize: 14, cursor: "pointer", borderBottom: `1px solid ${t.border}`, transition: "background 0.15s", animation: `slideUp 0.25s ease ${Math.min(idx * 0.02, 0.3)}s both`, alignItems: "center" }}
                        onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}>
                        <div>
                          <InlineCell lead={lead} field="name" style={{ fontWeight: 600, fontSize: 14, display: "block" }}>
                            {lead.name || "—"}
                          </InlineCell>
                          {lead.company && <InlineCell lead={lead} field="company" style={{ fontSize: 12, color: t.textDim, display: "block", marginTop: 2 }}>{lead.company}</InlineCell>}
                        </div>
                        <div>
                          <InlineCell lead={lead} field="projectType" options={PROJECT_TYPES.map(pt => ({ value: pt.id, label: pt.label }))} style={{ color: t.textMuted, textTransform: "capitalize", fontSize: 13 }}>
                            {(lead.projectType || "—").replace(/_/g, " ")}
                          </InlineCell>
                        </div>
                        <div>
                          <InlineCell lead={lead} field="budget" type="number" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                            {lead.budget ? `$${parseInt(lead.budget).toLocaleString()}` : "—"}
                          </InlineCell>
                        </div>
                        <div>
                          <InlineCell lead={lead} field="timeline" options={TIMELINE_OPTIONS.map(tl => ({ value: tl.value, label: tl.label }))} style={{ color: t.textMuted, fontSize: 12 }}>
                            {lead.timeline ? (TIMELINE_OPTIONS.find(tl => tl.value === lead.timeline)?.label || lead.timeline) : "—"}
                          </InlineCell>
                        </div>
                        <div>
                          <InlineCell lead={lead} field="zipCode" style={{ color: t.textMuted, fontSize: 12 }}>
                            {lead.zipCode || "—"}
                          </InlineCell>
                        </div>
                        <div onClick={e => e.stopPropagation()}>
                          <select value={lead.followUp || "new"} onChange={e => handleFollowUpChange(lead.id, e.target.value)}
                            style={{ padding: "4px 8px", borderRadius: 12, border: `1px solid ${(FOLLOWUP_STATUSES.find(s => s.id === lead.followUp) || FOLLOWUP_STATUSES[0]).color}44`, background: (FOLLOWUP_STATUSES.find(s => s.id === lead.followUp) || FOLLOWUP_STATUSES[0]).color + "18", color: (FOLLOWUP_STATUSES.find(s => s.id === lead.followUp) || FOLLOWUP_STATUSES[0]).color, fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: "pointer", outline: "none" }}>
                            {FOLLOWUP_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: lead.result.qualified ? t.greenBg : t.redBg, color: lead.result.qualified ? t.green : t.red, border: `1px solid ${lead.result.qualified ? t.greenBorder : t.redBorder}` }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: lead.result.qualified ? t.green : t.red }} />
                          {lead.result.score}/{lead.result.total}
                        </span>
                        <div onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleDeleteLead(lead.id)} style={{ background: "transparent", border: "none", color: t.textFaint, cursor: "pointer", fontSize: 14, padding: "2px 4px", borderRadius: 4, lineHeight: 1 }} title="Delete lead">✕</button>
                        </div>
                      </div>

                      {expandedLead === lead.id && (
                        <div style={{ padding: "20px 16px 20px 32px", background: t.bgAlt, borderBottom: `1px solid ${t.border}`, animation: "slideUp 0.2s ease" }}>
                          {editingLead === lead.id ? (
                            <div>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                                {[{ key: "name", label: "Name" }, { key: "company", label: "Company" }, { key: "email", label: "Email" }, { key: "phone", label: "Phone" }, { key: "budget", label: "Budget", type: "number" }, { key: "location", label: "Location" }, { key: "zipCode", label: "ZIP" }, { key: "source", label: "Source" }].map(f => (
                                  <div key={f.key}><label style={labelStyle}>{f.label}</label><input style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }} type={f.type || "text"} value={editForm[f.key] || ""} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))} /></div>
                                ))}
                                <div><label style={labelStyle}>{ind.typeName}</label><select style={{ ...inputStyle, padding: "8px 12px", fontSize: 13, cursor: "pointer" }} value={editForm.projectType} onChange={e => setEditForm(p => ({ ...p, projectType: e.target.value }))}><option value="">Select…</option>{PROJECT_TYPES.map(pt => <option key={pt.id} value={pt.id}>{pt.label}</option>)}</select></div>
                                <div><label style={labelStyle}>Timeline</label><select style={{ ...inputStyle, padding: "8px 12px", fontSize: 13, cursor: "pointer" }} value={editForm.timeline} onChange={e => setEditForm(p => ({ ...p, timeline: e.target.value }))}><option value="">Select…</option>{TIMELINE_OPTIONS.map(tl => <option key={tl.value} value={tl.value}>{tl.label}</option>)}</select></div>
                              </div>
                              <div style={{ marginTop: 12 }}><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical", fontSize: 13 }} value={editForm.description || ""} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} /></div>
                              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                                <button onClick={() => handleSaveEdit(lead.id)} style={{ ...btnPrimary, padding: "8px 20px", fontSize: 13 }}>Save & Re-Qualify</button>
                                <button onClick={() => { setEditingLead(null); setEditForm(null); }} style={{ ...btnSecondary, background: "transparent" }}>Cancel</button>
                              </div>
                            </div>
                          ) : (() => {
                            const lp = { id: lead.id, businessName: lead.businessName || lead.company || lead.name, ownerName: lead.ownerName || lead.name, phone: lead.phone, email: lead.email, website: lead.website, address: lead.location, niche: lead.niche || lead.projectType || "", buyingSignals: lead.buyingSignals || [], opportunities: lead.opportunities || [], socialMedia: lead.socialMedia, indeedHiring: lead.indeedHiring, googleReviews: lead.googleReviews, estimatedRevenue: lead.estimatedRevenue, yearEstablished: lead.yearEstablished, websiteQuality: lead.websiteQuality, classification: lead.classification };
                            return (
                            <div>
                              {/* Contact + Qualification row */}
                              <div style={{ display: "flex", gap: 40, flexWrap: "wrap", marginBottom: 20 }}>
                                <div style={{ flex: "1 1 260px" }}>
                                  <h4 style={{ fontSize: 12, fontWeight: 700, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Contact Details</h4>
                                  <div style={{ display: "grid", gap: 6, fontSize: 13, color: t.textMuted }}>
                                    {lead.email && <div>✉ {lead.email}</div>}
                                    {lead.phone && <div>☎ {lead.phone}</div>}
                                    {lead.website && <div>🌐 {lead.website}</div>}
                                    {lead.location && <div>📍 {lead.location} {lead.zipCode && `(${lead.zipCode})`}</div>}
                                    {lead.source && <div>🔗 Source: {lead.source}</div>}
                                    {lead.estimatedRevenue && <div>💰 {lead.estimatedRevenue}</div>}
                                    {lead.yearEstablished && <div>📅 Est. {lead.yearEstablished}</div>}
                                    {lead.description && <div style={{ marginTop: 8, padding: 12, background: t.bgHover, borderRadius: 6, lineHeight: 1.5 }}>{lead.description}</div>}
                                  </div>
                                  <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                                    <button onClick={() => { setEditingLead(lead.id); setEditForm({ ...lead }); }} style={{ ...btnSecondary, fontSize: 12, padding: "6px 14px" }}>✏ Edit</button>
                                    <button onClick={() => handleDeleteLead(lead.id)} style={{ ...btnSecondary, fontSize: 12, padding: "6px 14px", color: t.red, borderColor: t.redBorder, background: "transparent" }}>🗑 Delete</button>
                                  </div>
                                </div>
                                <div style={{ flex: "1 1 300px" }}>
                                  <h4 style={{ fontSize: 12, fontWeight: 700, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Qualification Breakdown</h4>
                                  {lead.result?.criteria?.length > 0 ? (
                                    <>
                                      <div style={{ display: "grid", gap: 8 }}>
                                        {lead.result.criteria.map((c, i) => (
                                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: t.bgHover, borderRadius: 6, borderLeft: `3px solid ${c.pass ? t.green : t.red}` }}>
                                            <span style={{ fontSize: 14, color: c.pass ? t.green : t.red }}>{c.pass ? "✓" : "✕"}</span>
                                            <div><div style={{ fontSize: 13, fontWeight: 600, color: c.pass ? t.green : t.red }}>{c.name}</div><div style={{ fontSize: 11, color: t.textDim }}>{c.detail}</div></div>
                                          </div>
                                        ))}
                                      </div>
                                      <div style={{ marginTop: 12, padding: "10px 14px", background: lead.result.qualified ? t.greenBg : t.redBg, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontSize: 13, fontWeight: 600 }}>Final Score</span>
                                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: lead.result.qualified ? t.green : t.red }}>{lead.result.score}/{lead.result.total}</span>
                                      </div>
                                    </>
                                  ) : (
                                    <div style={{ padding: "12px 16px", background: t.bgHover, borderRadius: 8, fontSize: 13, color: t.textMuted }}>
                                      No qualification criteria set — configure criteria in Settings to score this lead.
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Buying Signals */}
                              {lead.buyingSignals?.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                  <div style={{ fontSize: 11, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>🔥 Buying Signals</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    {lead.buyingSignals.map((sig, i) => (
                                      <div key={i} style={{ padding: "6px 10px", background: t.accent + "11", borderLeft: `3px solid ${t.accent}`, borderRadius: 4, fontSize: 12 }}>{sig}</div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Opportunities */}
                              {lead.opportunities?.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                  <div style={{ fontSize: 11, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>💡 Opportunities</div>
                                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: t.textMuted }}>
                                    {lead.opportunities.map((opp, i) => <li key={i} style={{ marginBottom: 2 }}>{opp}</li>)}
                                  </ul>
                                </div>
                              )}

                              {/* Social + Hiring row */}
                              {(lead.socialMedia || lead.indeedHiring?.length > 0 || lead.googleReviews?.count > 0) && (
                                <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 16 }}>
                                  {lead.googleReviews?.count > 0 && <div style={{ fontSize: 13 }}>⭐ {lead.googleReviews.rating} ({lead.googleReviews.count} reviews)</div>}
                                  {lead.socialMedia && <div style={{ fontSize: 12, color: t.textMuted }}>FB: {lead.socialMedia.facebook === "active" ? "✓" : "✗"} · IG: {lead.socialMedia.instagram === "active" ? "✓" : "✗"} · LI: {lead.socialMedia.linkedin === "active" ? "✓" : "✗"}</div>}
                                  {lead.indeedHiring?.length > 0 && <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{lead.indeedHiring.map((job, i) => <span key={i} style={{ padding: "3px 10px", background: t.greenBg, color: t.green, borderRadius: 12, fontSize: 11 }}>{job}</span>)}</div>}
                                </div>
                              )}

                              {/* Action buttons */}
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 12, borderTop: `1px solid ${t.border}`, marginBottom: 12 }}>
                                <button onClick={() => handleGeneratePlaybook(lp)} disabled={generatingPlaybook === lead.id}
                                  style={{ ...btnSecondary, fontSize: 12, borderColor: openPlaybook === lead.id ? t.accent : t.borderLight, color: openPlaybook === lead.id ? t.accent : t.textMuted, background: openPlaybook === lead.id ? t.accent + "11" : t.bgHover, opacity: generatingPlaybook === lead.id ? 0.6 : 1 }}>
                                  {generatingPlaybook === lead.id ? "⏳ Building..." : openPlaybook === lead.id && playbookData[lead.id] ? "📋 Hide Playbook" : "📋 Sales Playbook"}
                                </button>
                                <button onClick={() => handleDraftEmail(lp)} disabled={draftingEmail === lead.id}
                                  style={{ ...btnSecondary, fontSize: 12 }}>
                                  {draftingEmail === lead.id ? "Drafting..." : emailDrafts[lead.id] ? "Re-draft Email" : "Draft Email"}
                                </button>
                                {emailDrafts[lead.id] && (
                                  <button onClick={() => handleSendEmail(lp)} disabled={sendingEmail === lead.id}
                                    style={{ ...btnPrimary, fontSize: 12, padding: "8px 18px", opacity: sendingEmail === lead.id ? 0.6 : 1 }}>
                                    {sendingEmail === lead.id ? "Sending..." : "📤 Send Email"}
                                  </button>
                                )}
                              </div>

                              {/* Email draft */}
                              {emailDrafts[lead.id] && (
                                <div style={{ marginBottom: 16, padding: 16, background: t.bgAlt, borderRadius: 8, border: `1px solid ${t.borderLight}` }}>
                                  <div style={{ fontSize: 11, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>📧 Email Draft</div>
                                  <textarea style={{ ...inputStyle, minHeight: 120, fontSize: 12, lineHeight: 1.6, resize: "vertical" }}
                                    value={emailDrafts[lead.id]} onChange={e => setEmailDrafts(prev => ({ ...prev, [lead.id]: e.target.value }))} />
                                  <button onClick={() => { navigator.clipboard.writeText(emailDrafts[lead.id]); showToast("Copied to clipboard"); }} style={{ ...btnSecondary, fontSize: 12, marginTop: 8 }}>Copy</button>
                                </div>
                              )}

                              {/* Playbook */}
                              {openPlaybook === lead.id && (
                                <div style={{ marginTop: 4, animation: "slideUp 0.3s ease" }}>
                                  {generatingPlaybook === lead.id ? (
                                    <div style={{ padding: "32px 24px", textAlign: "center", background: t.bgAlt, borderRadius: 10, border: `1px solid ${t.borderLight}` }}>
                                      <div style={{ fontSize: 32, marginBottom: 12, animation: "pulse 1.2s infinite" }}>📋</div>
                                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Building Sales Playbook…</div>
                                      <div style={{ fontSize: 12, color: t.textMuted }}>Diagnosing pain points · Sequencing the play · Projecting revenue</div>
                                    </div>
                                  ) : playbookData[lead.id] ? (
                                    <div style={{ background: t.bgAlt, border: `1px solid ${t.borderLight}`, borderRadius: 10, overflow: "hidden" }}>
                                      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10, background: t.bgHover }}>
                                        <span style={{ fontSize: 18 }}>📋</span>
                                        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Sales Playbook</span>
                                        <span style={{ fontSize: 11, color: t.textMuted, marginLeft: "auto" }}>Ascend Solutions × {lp.businessName}</span>
                                      </div>
                                      <div style={{ padding: "20px" }}>
                                        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: t.textDim, textTransform: "uppercase", marginBottom: 12 }}>🔍 Diagnosis</div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                          {(playbookData[lead.id].diagnosis || []).map((item, i) => {
                                            const pc = { URGENT: "#ef4444", HIGH: "#f97316", MEDIUM: "#f59e0b", LOW: "#6b7280" };
                                            const col = pc[item.priority] || pc.LOW;
                                            return <div key={i} style={{ borderLeft: `4px solid ${col}`, padding: "10px 14px", background: col + "0e", borderRadius: "0 8px 8px 0" }}>
                                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", background: col + "25", color: col, borderRadius: 4 }}>{item.priority}</span><span style={{ fontSize: 13, fontWeight: 700 }}>{item.problem}</span></div>
                                              <div style={{ fontSize: 12, color: t.textMuted }}>💸 {item.costingThem}</div>
                                            </div>;
                                          })}
                                        </div>
                                      </div>
                                      <div style={{ padding: "0 20px 20px" }}>
                                        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: t.textDim, textTransform: "uppercase", marginBottom: 12 }}>🎯 Recommended Play</div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                          {[{ key: "step1", icon: "🚀", color: "#34d399" }, { key: "step2", icon: "📈", color: "#f59e0b" }, { key: "step3", icon: "⚡", color: "#a78bfa" }].map(({ key, icon, color }) => {
                                            const step = playbookData[lead.id]?.play?.[key]; if (!step) return null;
                                            return <div key={key} style={{ borderRadius: 8, border: `1px solid ${color}33`, overflow: "hidden" }}>
                                              <div style={{ padding: "10px 16px", borderLeft: `4px solid ${color}`, background: color + "15", display: "flex", alignItems: "center", gap: 10 }}>
                                                <span style={{ fontSize: 14, fontWeight: 700, color }}>{icon} {step.title}</span>
                                                {(step.price || step.monthlyRetainer) && <span style={{ marginLeft: "auto", padding: "3px 10px", background: color + "25", color, borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{step.price || step.monthlyRetainer}</span>}
                                              </div>
                                              <div style={{ padding: "10px 16px", background: t.bgHover, fontSize: 12, color: t.textMuted }}>
                                                {step.offer && <div style={{ fontWeight: 600, color: t.text, marginBottom: 4 }}>{step.offer}</div>}
                                                {step.whySolvesIt && <div>✓ {step.whySolvesIt}</div>}
                                              </div>
                                            </div>;
                                          })}
                                        </div>
                                      </div>
                                      {playbookData[lead.id].revenue && (
                                        <div style={{ margin: "0 20px 20px", padding: "16px 20px", background: `linear-gradient(135deg, ${t.accent}15, ${t.accent}06)`, border: `1px solid ${t.accent}44`, borderRadius: 8 }}>
                                          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: t.accent, textTransform: "uppercase", marginBottom: 12 }}>📊 Revenue Projection</div>
                                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                                            {[{ label: "Monthly", val: playbookData[lead.id].revenue.monthlyValue }, { label: "Annual", val: playbookData[lead.id].revenue.annualValue }, { label: "Your Cut/yr", val: playbookData[lead.id].revenue.yourCutAnnual }].map(({ label, val }) => (
                                              <div key={label} style={{ textAlign: "center" }}>
                                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: t.accent }}>{val || "—"}</div>
                                                <div style={{ fontSize: 10, color: t.textDim, textTransform: "uppercase", marginTop: 4 }}>{label}</div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* ════════════ PROSPECTS ════════════ */}
          {tab === "prospects" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>🎯 Prospect Search</h2>
                <p style={{ color: t.textDim, fontSize: 14, lineHeight: 1.5 }}>Multi-pass deep search to find service businesses that need AI, web, and ad services from Ascend Solutions.</p>
              </div>

              <div style={cardStyle}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>City or Region *</label>
                    <input style={{ ...inputStyle }} value={prospectCity} onChange={e => setProspectCity(e.target.value)} placeholder="Austin TX" />
                  </div>
                  <div>
                    <label style={labelStyle}>Business Niche (optional)</label>
                    <input style={{ ...inputStyle }} value={prospectNiche} onChange={e => setProspectNiche(e.target.value)} placeholder="HVAC, roofing, plumbing..." />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Number of Results</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[5, 10, 15].map(n => (
                      <button key={n} onClick={() => setProspectCount(n)}
                        style={{ padding: "8px 20px", background: prospectCount === n ? t.accent : t.bgHover, border: `1px solid ${prospectCount === n ? t.accent : t.borderLight}`, borderRadius: 8, color: prospectCount === n ? "#0c0a09" : t.textMuted, cursor: "pointer", fontSize: 13, fontWeight: prospectCount === n ? 700 : 500, transition: "all 0.15s" }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Filter by Buying Signals (optional)</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, marginTop: 8 }}>
                    {[
                      { key: "hiringOnIndeed", label: "☑ Hiring on Indeed" },
                      { key: "badWebsite", label: "☑ No/bad website" },
                      { key: "lowReviews", label: "☑ Low Google reviews" },
                      { key: "noSocial", label: "☑ No social media" },
                      { key: "runningAds", label: "☑ Running ads" },
                      { key: "recentlyStarted", label: "☑ Recently started" },
                    ].map(f => (
                      <label key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: t.bgHover, borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
                        <input type="checkbox" checked={prospectFilters[f.key]} onChange={e => setProspectFilters(p => ({ ...p, [f.key]: e.target.checked }))} style={{ cursor: "pointer" }} />
                        <span>{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button onClick={handleProspectSearch} disabled={prospectLoading} style={{ ...btnPrimary, padding: "12px 32px", fontSize: 15, opacity: prospectLoading ? 0.6 : 1, cursor: prospectLoading ? "wait" : "pointer" }}>
                  {prospectLoading ? "Searching..." : "🔍 Search Prospects"}
                </button>
              </div>

              {prospectLoading && (
                <div style={{ ...cardStyle, textAlign: "center", padding: "32px 24px" }}>
                  <div style={{ fontSize: 36, marginBottom: 12, animation: "pulse 1.2s infinite" }}>🔍</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                    {batchProgress.total > 1
                      ? `Searching batch ${batchProgress.current} of ${batchProgress.total}…`
                      : "Deep search in progress…"}
                  </div>
                  {batchProgress.total > 1 && prospects.length > 0 && (
                    <div style={{ fontSize: 13, color: t.green, fontWeight: 600, marginBottom: 6 }}>
                      ✓ {prospects.length} results found so far
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: t.textDim, maxWidth: 500, margin: "0 auto", lineHeight: 1.5 }}>
                    {batchProgress.total > 1 ? (
                      <>Searching for {prospectNiche.trim() || "local"} businesses in {prospectCity} · {batchProgress.total} batches of 5</>
                    ) : (
                      <>Step 1: Finding {prospectNiche.trim() || "local"} businesses in {prospectCity}<br />
                      Step 2: Checking Indeed, Google, social media<br />
                      Step 3: Identifying buying signals</>
                    )}
                  </div>
                  {batchProgress.total > 1 && (
                    <div style={{ marginTop: 12, height: 4, background: t.bgHover, borderRadius: 2, maxWidth: 300, margin: "12px auto 0" }}>
                      <div style={{ height: "100%", background: t.accent, borderRadius: 2, width: `${(batchProgress.current / batchProgress.total) * 100}%`, transition: "width 0.4s ease" }} />
                    </div>
                  )}
                </div>
              )}

              {prospectError && (
                <div style={{ ...cardStyle, background: t.redBg, border: `1px solid ${t.redBorder}` }}>
                  <span style={{ fontSize: 20 }}>⚠</span> {prospectError}
                </div>
              )}

              {prospects.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>
                    {prospectLoading ? `Found ${prospects.length} so far…` : `Found ${prospects.length} prospects`}
                  </div>
                  <div style={{ display: "grid", gap: 16 }}>
                    {prospects.map(p => (
                      <div key={p.id} style={{ ...cardStyle, borderLeft: `4px solid ${p.classification.color}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{p.businessName}</h3>
                              <span style={{ padding: "4px 10px", background: p.classification.color + "22", color: p.classification.color, borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                                {p.classification.emoji} {p.classification.tier}
                              </span>
                              <span style={{ padding: "4px 10px", background: t.bgHover, borderRadius: 12, fontSize: 11, color: t.textMuted }}>{p.niche}</span>
                            </div>
                            {p.ownerName && <div style={{ fontSize: 14, color: t.textMuted }}>Owner: {p.ownerName}</div>}
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 11, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Contact Info</div>
                            {p.phone && <div style={{ fontSize: 13, marginBottom: 4 }}>☎ {p.phone}</div>}
                            {p.email && <div style={{ fontSize: 13, marginBottom: 4 }}>✉ {p.email}</div>}
                            {p.address && <div style={{ fontSize: 13, color: t.textMuted }}>📍 {p.address}</div>}
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Business Info</div>
                            {p.googleReviews.count > 0 && <div style={{ fontSize: 13, marginBottom: 4 }}>⭐ {p.googleReviews.rating} ({p.googleReviews.count} reviews)</div>}
                            {p.estimatedRevenue && <div style={{ fontSize: 13, marginBottom: 4 }}>💰 {p.estimatedRevenue}</div>}
                            {p.yearEstablished && <div style={{ fontSize: 13, marginBottom: 4 }}>📅 Est. {p.yearEstablished}</div>}
                          </div>
                        </div>

                        {/* Social Media — always show all platforms */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Social Media</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {[
                              { key: "facebook", label: "Facebook", icon: "f" },
                              { key: "instagram", label: "Instagram", icon: "ig" },
                              { key: "linkedin", label: "LinkedIn", icon: "in" },
                              { key: "tiktok", label: "TikTok", icon: "tt" },
                              { key: "youtube", label: "YouTube", icon: "yt" },
                            ].map(({ key, label }) => {
                              const status = p.socialMedia?.[key] || "none";
                              const active = status === "active";
                              const inactive = status === "inactive";
                              return (
                                <span key={key} style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, border: `1px solid ${active ? t.greenBorder : inactive ? t.borderInput : t.borderLight}`, background: active ? t.greenBg : inactive ? t.bgHover : "transparent", color: active ? t.green : inactive ? t.textMuted : t.textFaint }}>
                                  {active ? "✓" : inactive ? "~" : "✗"} {label}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Website status */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Website</div>
                          {p.websiteStatus === "none" || !p.website ? (
                            <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 12, background: t.redBg, color: t.red, border: `1px solid ${t.redBorder}`, fontWeight: 600 }}>✗ No website</span>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <a href={p.website.startsWith("http") ? p.website : `https://${p.website}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: t.accent, textDecoration: "none" }} onClick={e => e.stopPropagation()}>🌐 {p.website}</a>
                              {p.websiteStatus === "bad" && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 8, background: "#f9731622", color: "#f97316", border: "1px solid #f9731644", fontWeight: 600 }}>⚠ Poor quality</span>}
                              {p.websiteQuality && <span style={{ fontSize: 11, color: t.textMuted }}>— {p.websiteQuality}</span>}
                            </div>
                          )}
                        </div>

                        {/* Indeed Hiring */}
                        {p.indeedHiring && p.indeedHiring.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>📋 Hiring on Indeed</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {p.indeedHiring.map((job, i) => (
                                <div key={i} style={{ padding: "10px 12px", background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 8 }}>
                                  <div style={{ fontWeight: 700, fontSize: 13, color: t.green, marginBottom: 3 }}>{job.title || job}</div>
                                  {job.summary && <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 6 }}>{job.summary}</div>}
                                  {job.applyUrl && <a href={job.applyUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: t.accent, textDecoration: "none", fontWeight: 600 }} onClick={e => e.stopPropagation()}>→ View & Apply on Indeed</a>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* LinkedIn Jobs */}
                        {p.linkedinJobs && p.linkedinJobs.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>💼 Hiring on LinkedIn</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {p.linkedinJobs.map((job, i) => (
                                <div key={i} style={{ padding: "10px 12px", background: "#0077b622", border: "1px solid #0077b644", borderRadius: 8 }}>
                                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0ea5e9", marginBottom: 3 }}>{job.title || job}</div>
                                  {job.summary && <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 6 }}>{job.summary}</div>}
                                  {job.applyUrl && <a href={job.applyUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: t.accent, textDecoration: "none", fontWeight: 600 }} onClick={e => e.stopPropagation()}>→ View on LinkedIn</a>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {p.buyingSignals && p.buyingSignals.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>🔥 Buying Signals</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {p.buyingSignals.map((sig, i) => (
                                <div key={i} style={{ padding: "6px 10px", background: t.accent + "11", borderLeft: `3px solid ${t.accent}`, borderRadius: 4, fontSize: 12 }}>{sig}</div>
                              ))}
                            </div>
                          </div>
                        )}

                        {p.opportunities && p.opportunities.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>💡 Opportunities</div>
                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: t.textMuted }}>
                              {p.opportunities.map((opp, i) => <li key={i} style={{ marginBottom: 2 }}>{opp}</li>)}
                            </ul>
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.border}`, flexWrap: "wrap" }}>
                          <button onClick={() => expandedProspect === p.id ? setExpandedProspect(null) : setExpandedProspect(p.id)} style={{ ...btnSecondary, fontSize: 12 }}>
                            {expandedProspect === p.id ? "Hide Details" : "Show Details"}
                          </button>
                          <button
                            onClick={() => handleGeneratePlaybook(p)}
                            disabled={generatingPlaybook === p.id}
                            style={{ ...btnSecondary, fontSize: 12, borderColor: openPlaybook === p.id ? t.accent : t.borderLight, color: openPlaybook === p.id ? t.accent : t.textMuted, background: openPlaybook === p.id ? t.accent + "11" : t.bgHover, opacity: generatingPlaybook === p.id ? 0.6 : 1 }}>
                            {generatingPlaybook === p.id ? "⏳ Building Playbook..." : openPlaybook === p.id && playbookData[p.id] ? "📋 Hide Playbook" : "📋 Sales Playbook"}
                          </button>
                          <button
                            onClick={() => handleAddToOutreach(p)}
                            style={{ ...btnSecondary, fontSize: 12, borderColor: outreachProspects.find(op => op.id === p.id) ? t.green : t.borderLight, color: outreachProspects.find(op => op.id === p.id) ? t.green : t.textMuted, background: outreachProspects.find(op => op.id === p.id) ? t.green + "11" : t.bgHover }}>
                            {outreachProspects.find(op => op.id === p.id) ? "✓ In Outreach" : "📤 Add to Outreach"}
                          </button>
                          <button
                            onClick={() => handleAddProspectToLeads(p)}
                            style={{ ...btnSecondary, fontSize: 12, borderColor: addedToLeads.has(p.id) ? t.accent : t.borderLight, color: addedToLeads.has(p.id) ? t.accent : t.textMuted, background: addedToLeads.has(p.id) ? t.accent + "11" : t.bgHover }}>
                            {addedToLeads.has(p.id) ? "✓ In Leads" : "➕ Add to Leads"}
                          </button>
                        </div>

                        {expandedProspect === p.id && p.sourceUrls && p.sourceUrls.length > 0 && (
                          <div style={{ marginTop: 12, padding: 12, background: t.bgHover, borderRadius: 6 }}>
                            <div style={{ fontSize: 11, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Sources</div>
                            {p.sourceUrls.map((url, i) => (
                              <div key={i} style={{ fontSize: 11, color: t.accent, marginBottom: 2 }}>{url}</div>
                            ))}
                          </div>
                        )}

                        {/* ── SALES PLAYBOOK ── */}
                        {openPlaybook === p.id && (
                          <div style={{ marginTop: 16, animation: "slideUp 0.3s ease" }}>
                            {generatingPlaybook === p.id ? (
                              <div style={{ padding: "32px 24px", textAlign: "center", background: t.bgAlt, borderRadius: 10, border: `1px solid ${t.borderLight}` }}>
                                <div style={{ fontSize: 32, marginBottom: 12, animation: "pulse 1.2s infinite" }}>📋</div>
                                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Building Sales Playbook…</div>
                                <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.6 }}>Diagnosing pain points · Sequencing the play · Projecting revenue</div>
                              </div>
                            ) : playbookData[p.id] ? (
                              <div style={{ background: t.bgAlt, border: `1px solid ${t.borderLight}`, borderRadius: 10, overflow: "hidden" }}>
                                {/* Playbook Header */}
                                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10, background: t.bgHover }}>
                                  <span style={{ fontSize: 18 }}>📋</span>
                                  <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>Sales Playbook</span>
                                  <span style={{ fontSize: 11, color: t.textMuted, marginLeft: "auto" }}>Ascend Solutions × {p.businessName}</span>
                                </div>

                                {/* DIAGNOSIS */}
                                <div style={{ padding: "20px" }}>
                                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: t.textDim, textTransform: "uppercase", marginBottom: 12 }}>🔍 Diagnosis — Prioritized Pain Points</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {(playbookData[p.id].diagnosis || []).map((item, i) => {
                                      const priorityColors = { URGENT: "#ef4444", HIGH: "#f97316", MEDIUM: "#f59e0b", LOW: "#6b7280" };
                                      const color = priorityColors[item.priority] || priorityColors.LOW;
                                      return (
                                        <div key={i} style={{ borderLeft: `4px solid ${color}`, padding: "12px 16px", background: color + "0e", borderRadius: "0 8px 8px 0" }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", background: color + "25", color, borderRadius: 4, letterSpacing: "0.08em", flexShrink: 0 }}>{item.priority}</span>
                                            <span style={{ fontSize: 14, fontWeight: 700 }}>{item.problem}</span>
                                          </div>
                                          <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>💸 {item.costingThem}</div>
                                          <div style={{ fontSize: 11, color: t.textDim, fontStyle: "italic" }}>📌 {item.signal}</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* RECOMMENDED PLAY */}
                                <div style={{ padding: "0 20px 20px" }}>
                                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: t.textDim, textTransform: "uppercase", marginBottom: 12 }}>🎯 Recommended Play</div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {[
                                      { key: "step1", icon: "🚀", color: "#34d399" },
                                      { key: "step2", icon: "📈", color: "#f59e0b" },
                                      { key: "step3", icon: "⚡", color: "#a78bfa" },
                                    ].map(({ key, icon, color }) => {
                                      const step = playbookData[p.id]?.play?.[key];
                                      if (!step) return null;
                                      return (
                                        <div key={key} style={{ borderRadius: 8, border: `1px solid ${color}33`, overflow: "hidden" }}>
                                          <div style={{ padding: "10px 16px", borderLeft: `4px solid ${color}`, background: color + "15", display: "flex", alignItems: "center", gap: 10 }}>
                                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color }}>{icon}</span>
                                            <span style={{ fontSize: 12, fontWeight: 800, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{step.title}</span>
                                            {(step.price || step.monthlyRetainer) && (
                                              <span style={{ marginLeft: "auto", padding: "3px 10px", background: color + "25", color, borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                                                {step.price || step.monthlyRetainer}
                                              </span>
                                            )}
                                          </div>
                                          <div style={{ padding: "12px 16px", display: "grid", gap: 8, background: t.bgHover }}>
                                            {step.offer && <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{step.offer}</div>}
                                            {step.whySolvesIt && <div style={{ fontSize: 12, color: t.textMuted }}>✓ {step.whySolvesIt}</div>}
                                            {step.howStarterCreatesNeed && <div style={{ fontSize: 12, color: t.textMuted }}>🔗 {step.howStarterCreatesNeed}</div>}
                                            {step.roiStory && <div style={{ fontSize: 12, color: t.textMuted }}>📈 {step.roiStory}</div>}
                                            {step.pitchAngle && <div style={{ fontSize: 12, color: t.textDim, fontStyle: "italic" }}>💬 "{step.pitchAngle}"</div>}
                                            {step.whyYes && <div style={{ fontSize: 12, color: t.textMuted }}>👍 {step.whyYes}</div>}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* REVENUE PROJECTION */}
                                {playbookData[p.id].revenue && (
                                  <div style={{ margin: "0 20px 20px", padding: "18px 20px", background: `linear-gradient(135deg, ${t.accent}15 0%, ${t.accent}06 100%)`, border: `1px solid ${t.accent}44`, borderRadius: 8 }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: t.accent, textTransform: "uppercase", marginBottom: 14 }}>📊 Revenue Projection</div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                                      {[
                                        { label: "Monthly Value", val: playbookData[p.id].revenue.monthlyValue, color: t.text },
                                        { label: "Annual Value", val: playbookData[p.id].revenue.annualValue, color: t.accent },
                                        { label: "Your Cut / Year", val: playbookData[p.id].revenue.yourCutAnnual, color: "#34d399" },
                                      ].map(({ label, val, color }) => (
                                        <div key={label} style={{ textAlign: "center" }}>
                                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color }}>{val || "—"}</div>
                                          <div style={{ fontSize: 10, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{label}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════ MY QUEUE ════════════ */}
          {tab === "queue" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>🔥 My Queue</h2>
                <p style={{ color: t.textDim, fontSize: 14 }}>Warm prospects with direct contact — ready to reach out now. Add to Leads once they're engaged.</p>
              </div>

              {(() => {
                const warmProspects = prospects.filter(p => p.classification.tier === "WARM").sort((a, b) => b.buyingSignals.length - a.buyingSignals.length);
                const totalContacted = Object.values(queueActions).filter(a => a === "contacted").length;
                const totalReplied = Object.values(queueActions).filter(a => a === "replied").length;

                if (warmProspects.length === 0) {
                  return (
                    <div style={{ textAlign: "center", padding: "80px 20px" }}>
                      <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📞</div>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: t.textMuted, marginBottom: 8 }}>No warm prospects yet</h3>
                      <p style={{ color: t.textFaint, fontSize: 14, marginBottom: 24 }}>Run a prospect search to find warm leads</p>
                      <button onClick={() => setTab("prospects")} style={btnPrimary}>🎯 Search Prospects</button>
                    </div>
                  );
                }

                return (
                  <>
                    <div style={{ ...cardStyle, display: "flex", gap: 40, marginBottom: 20 }}>
                      <div><span style={{ fontSize: 28, fontWeight: 700, color: t.green }}>{warmProspects.length}</span><div style={{ fontSize: 11, color: t.textDim }}>WARM LEADS</div></div>
                      <div><span style={{ fontSize: 28, fontWeight: 700, color: t.accent }}>{totalContacted}</span><div style={{ fontSize: 11, color: t.textDim }}>CONTACTED</div></div>
                      <div><span style={{ fontSize: 28, fontWeight: 700, color: t.green }}>{totalReplied}</span><div style={{ fontSize: 11, color: t.textDim }}>REPLIED</div></div>
                    </div>

                    <div style={{ marginBottom: 12, textAlign: "right" }}>
                      <button onClick={() => {
                        const csv = ["Business Name,Owner,Phone,Email,Website,Address,Niche,Buying Signals,Opportunities", ...warmProspects.map(p =>
                          `"${p.businessName}","${p.ownerName}","${p.phone}","${p.email}","${p.website}","${p.address}","${p.niche}","${(p.buyingSignals || []).join("; ")}","${(p.opportunities || []).join("; ")}"`
                        )].join("\n");
                        const blob = new Blob([csv], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "my_queue.csv";
                        a.click();
                      }} style={{ ...btnSecondary, fontSize: 12 }}>
                        ↓ Export CSV
                      </button>
                    </div>

                    <div style={{ display: "grid", gap: 16 }}>
                      {warmProspects.map(p => (
                        <div key={p.id} style={{ ...cardStyle, borderLeft: `4px solid ${t.green}`, opacity: queueActions[p.id] === "dismissed" ? 0.4 : 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                            <div>
                              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{p.businessName}</h3>
                              <div style={{ fontSize: 14, color: t.textMuted }}>{p.ownerName} • {p.phone} • {p.email}</div>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              {p.buyingSignals.slice(0, 2).map((sig, i) => (
                                <span key={i} style={{ padding: "4px 8px", background: t.accent + "22", color: t.accent, borderRadius: 8, fontSize: 10, fontWeight: 700 }}>🔥 {i + 1}</span>
                              ))}
                            </div>
                          </div>

                          <div style={{ marginBottom: 12, fontSize: 13 }}>
                            <strong>Top Signals:</strong>
                            <div style={{ marginTop: 4 }}>
                              {p.buyingSignals.slice(0, 2).map((sig, i) => (
                                <div key={i} style={{ padding: "6px 10px", background: t.accent + "11", borderLeft: `3px solid ${t.accent}`, borderRadius: 4, fontSize: 12, marginBottom: 4 }}>{sig}</div>
                              ))}
                            </div>
                          </div>

                          {emailDrafts[p.id] && (
                            <div style={{ marginBottom: 12, padding: 12, background: t.bgAlt, borderRadius: 6, border: `1px solid ${t.borderLight}` }}>
                              <div style={{ fontSize: 11, color: t.textDim, marginBottom: 6 }}>📧 DRAFT EMAIL</div>
                              <div style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{emailDrafts[p.id]}</div>
                            </div>
                          )}

                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {!emailDrafts[p.id] && (
                              <button onClick={() => handleDraftEmail(p)} disabled={draftingEmail === p.id} style={{ ...btnPrimary, fontSize: 12, padding: "8px 16px" }}>
                                {draftingEmail === p.id ? "Drafting..." : "Draft Email"}
                              </button>
                            )}
                            {emailDrafts[p.id] && (
                              <button onClick={() => { navigator.clipboard.writeText(emailDrafts[p.id]); showToast("Copied to clipboard"); }} style={{ ...btnPrimary, fontSize: 12, padding: "8px 16px" }}>
                                Copy Email
                              </button>
                            )}
                            <button onClick={() => setQueueActions(prev => ({ ...prev, [p.id]: "contacted" }))} disabled={queueActions[p.id] === "contacted"} style={{ ...btnSecondary, fontSize: 12, padding: "8px 16px", background: queueActions[p.id] === "contacted" ? t.accent + "22" : t.bgHover }}>
                              {queueActions[p.id] === "contacted" ? "✓ Contacted" : "Mark Contacted"}
                            </button>
                            <button onClick={() => setQueueActions(prev => ({ ...prev, [p.id]: "replied" }))} disabled={queueActions[p.id] === "replied"} style={{ ...btnSecondary, fontSize: 12, padding: "8px 16px", background: queueActions[p.id] === "replied" ? t.green + "22" : t.bgHover }}>
                              {queueActions[p.id] === "replied" ? "✓ Replied" : "Mark Replied"}
                            </button>
                            <button onClick={() => setQueueActions(prev => ({ ...prev, [p.id]: "dismissed" }))} style={{ ...btnSecondary, fontSize: 12, padding: "8px 16px", color: t.textDim }}>
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* ════════════ SETTINGS ════════════ */}
          {tab === "settings" && (
            <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 700 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Qualification Criteria</h2>
                  <p style={{ fontSize: 13, color: t.textDim, marginTop: 4 }}>Define rules to score incoming leads</p>
                </div>
                {settingsEdited && leads.length > 0 && (
                  <button onClick={requalifyAll} style={{ ...btnPrimary, animation: "pulse 1.5s infinite" }}>↻ Re-Qualify All ({leads.length})</button>
                )}
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: t.text }}><span style={{ color: t.accent }}>$</span> Budget Range</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div><label style={labelStyle}>Minimum</label><input style={inputStyle} type="number" value={criteria.minBudget} onChange={e => { setCriteria(p => ({ ...p, minBudget: parseInt(e.target.value) || 0 })); setSettingsEdited(true); }} /></div>
                  <div><label style={labelStyle}>Maximum</label><input style={inputStyle} type="number" value={criteria.maxBudget} onChange={e => { setCriteria(p => ({ ...p, maxBudget: parseInt(e.target.value) || 0 })); setSettingsEdited(true); }} /></div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: t.text }}><span style={{ color: t.accent }}>◎</span> Service Area</h3>
                <p style={{ fontSize: 12, color: t.textFaint, marginBottom: 12 }}>ZIP code prefixes, comma-separated. Leave empty to skip.</p>
                <input style={inputStyle} value={criteria.serviceAreaZips} onChange={e => { setCriteria(p => ({ ...p, serviceAreaZips: e.target.value })); setSettingsEdited(true); }} placeholder="e.g. 902, 900, 100" />
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: t.text }}><span style={{ color: t.accent }}>⏱</span> Timeline Range (months)</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div><label style={labelStyle}>Min Months</label><input style={inputStyle} type="number" value={criteria.minTimelineMonths} onChange={e => { setCriteria(p => ({ ...p, minTimelineMonths: parseInt(e.target.value) || 0 })); setSettingsEdited(true); }} /></div>
                  <div><label style={labelStyle}>Max Months</label><input style={inputStyle} type="number" value={criteria.maxTimelineMonths} onChange={e => { setCriteria(p => ({ ...p, maxTimelineMonths: parseInt(e.target.value) || 0 })); setSettingsEdited(true); }} /></div>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: t.text }}><span style={{ color: t.accent }}>⚙</span> App Settings</h3>
                <div style={{ marginBottom: 16 }}><label style={labelStyle}>Company Name</label><input style={inputStyle} value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your company name" /></div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Industry</label>
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={industry} onChange={e => {
                    const newInd = e.target.value;
                    setIndustry(newInd);
                    const newCriteria = getDefaultCriteria(newInd);
                    setCriteria(prev => ({ ...prev, minBudget: newCriteria.minBudget, maxBudget: newCriteria.maxBudget }));
                    setProspects([]);
                    setSettingsEdited(true);
                  }}>
                    {INDUSTRY_LIST.map(i => <option key={i.id} value={i.id}>{i.icon} {i.label}</option>)}
                  </select>
                  <p style={{ fontSize: 11, color: t.textFaint, marginTop: 6 }}>Changing industry updates the {ind.typeName.toLowerCase()} options and finder search terms. Existing leads are preserved.</p>
                </div>
                <button onClick={handleResetApp} style={{ ...btnSecondary, color: t.red, borderColor: t.redBorder, background: "transparent", fontSize: 12 }}>↺ Reset Everything</button>
              </div>

              {/* Email Config */}
              <div style={{ ...cardStyle, marginTop: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: t.text }}>📧 Email & Sender Info</h3>
                <p style={{ fontSize: 12, color: t.textDim, marginBottom: 16, lineHeight: 1.5 }}>
                  These details are used in email drafts and outreach. For Gmail, use an <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: t.accent }}>App Password</a>.
                </p>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Sender Variables (used in email drafts)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${t.border}` }}>
                  <div>
                    <label style={labelStyle}>Your Name</label>
                    <input style={inputStyle} value={emailConfig.fromName} onChange={e => setEmailConfig(p => ({ ...p, fromName: e.target.value }))} placeholder="John Smith" />
                  </div>
                  <div>
                    <label style={labelStyle}>Your Title / Role</label>
                    <input style={inputStyle} value={emailConfig.senderTitle} onChange={e => setEmailConfig(p => ({ ...p, senderTitle: e.target.value }))} placeholder="Founder, Sales Director..." />
                  </div>
                  <div>
                    <label style={labelStyle}>Your Phone</label>
                    <input style={inputStyle} value={emailConfig.senderPhone} onChange={e => setEmailConfig(p => ({ ...p, senderPhone: e.target.value }))} placeholder="(555) 000-0000" />
                  </div>
                  <div>
                    <label style={labelStyle}>Company Name</label>
                    <input style={inputStyle} value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Sankotech Solutions" />
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>SMTP Settings (for sending)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Email Address</label>
                    <input style={inputStyle} type="email" value={emailConfig.user} onChange={e => {
                      const detected = detectSmtpHost(e.target.value);
                      setEmailConfig(p => ({ ...p, user: e.target.value, host: detected.host || p.host, port: detected.port }));
                    }} placeholder="you@gmail.com" />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Password / App Password</label>
                    <input style={inputStyle} type="password" value={emailConfig.pass} onChange={e => setEmailConfig(p => ({ ...p, pass: e.target.value }))} placeholder="App password (Gmail) or email password" />
                  </div>
                  <div>
                    <label style={labelStyle}>SMTP Host (auto-detected)</label>
                    <input style={inputStyle} value={emailConfig.host} onChange={e => setEmailConfig(p => ({ ...p, host: e.target.value }))} placeholder="smtp.gmail.com" />
                  </div>
                  <div>
                    <label style={labelStyle}>Port</label>
                    <input style={inputStyle} type="number" value={emailConfig.port} onChange={e => setEmailConfig(p => ({ ...p, port: parseInt(e.target.value) || 587 }))} />
                  </div>
                </div>
                {emailConfig.user && emailConfig.pass && emailConfig.host && (
                  <div style={{ marginTop: 12, padding: "8px 12px", background: t.greenBg, border: `1px solid ${t.greenBorder}`, borderRadius: 6, fontSize: 12, color: t.green }}>
                    ✓ Email configured — ready to send from {emailConfig.user}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════ OUTREACH ════════════ */}
          {tab === "outreach" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>📤 Outreach</h2>
                <p style={{ color: t.textDim, fontSize: 14 }}>Draft and send personalized emails to your prospects. Add prospects from the Prospects tab.</p>
              </div>

              {/* Email not configured banner */}
              {(!emailConfig.user || !emailConfig.pass || !emailConfig.host) && (
                <div style={{ ...cardStyle, background: t.accent + "12", border: `1px solid ${t.accent}44`, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>⚠ Email not configured</div>
                    <div style={{ fontSize: 12, color: t.textMuted }}>Add your email credentials in Settings → Email to enable sending.</div>
                  </div>
                  <button onClick={() => setTab("settings")} style={{ ...btnPrimary, fontSize: 12, padding: "8px 20px" }}>Go to Settings →</button>
                </div>
              )}

              {outreachProspects.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                  <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📤</div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: t.textMuted, marginBottom: 8 }}>No prospects in outreach yet</h3>
                  <p style={{ color: t.textFaint, fontSize: 14, marginBottom: 24 }}>Find prospects and click "Add to Outreach" on any card</p>
                  <button onClick={() => setTab("prospects")} style={btnPrimary}>🎯 Find Prospects</button>
                </div>
              ) : (
                <div>
                  {/* Summary bar */}
                  <div style={{ ...cardStyle, display: "flex", gap: 32, marginBottom: 20, flexWrap: "wrap" }}>
                    {[
                      { label: "Total", val: outreachProspects.length, color: t.text },
                      { label: "Draft", val: Object.values(outreachStatuses).filter(s => s === "draft").length, color: t.textMuted },
                      { label: "Sent", val: Object.values(outreachStatuses).filter(s => s === "sent").length, color: t.accent },
                      { label: "Replied", val: Object.values(outreachStatuses).filter(s => s === "replied").length, color: t.green },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: 10, color: t.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gap: 20 }}>
                    {outreachProspects.map(p => {
                      const status = outreachStatuses[p.id] || "draft";
                      const draft = outreachDrafts[p.id] || { to: "", subject: "", body: "" };
                      const statusColors = { draft: t.textDim, sending: t.accent, sent: t.accent, replied: t.green };
                      const statusLabels = { draft: "Draft", sending: "Sending…", sent: "Sent ✓", replied: "Replied ✓" };
                      return (
                        <div key={p.id} style={{ ...cardStyle, borderLeft: `4px solid ${statusColors[status]}` }}>
                          {/* Prospect header */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{p.businessName}</h3>
                                <span style={{ padding: "3px 10px", background: statusColors[status] + "22", color: statusColors[status], borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{statusLabels[status]}</span>
                                <span style={{ padding: "3px 10px", background: t.bgHover, borderRadius: 20, fontSize: 11, color: t.textDim }}>{p.niche}</span>
                              </div>
                              {p.ownerName && <div style={{ fontSize: 13, color: t.textMuted }}>Owner: {p.ownerName}</div>}
                              {p.address && <div style={{ fontSize: 12, color: t.textDim }}>📍 {p.address}</div>}
                            </div>
                            <button onClick={() => setOutreachProspects(prev => prev.filter(op => op.id !== p.id))}
                              style={{ background: "transparent", border: "none", color: t.textFaint, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "2px 6px" }} title="Remove from outreach">×</button>
                          </div>

                          {/* Playbook reference (collapsed summary) */}
                          {playbookData[p.id]?.play?.step1 && (
                            <div style={{ marginBottom: 14, padding: "10px 14px", background: t.accent + "0e", border: `1px solid ${t.accent}33`, borderRadius: 6, fontSize: 12 }}>
                              <span style={{ color: t.accent, fontWeight: 700 }}>📋 Playbook: </span>
                              <span style={{ color: t.textMuted }}>{playbookData[p.id].play.step1.offer} — {playbookData[p.id].play.step1.price}</span>
                            </div>
                          )}

                          {/* Email form */}
                          <div style={{ display: "grid", gap: 12 }}>
                            <div>
                              <label style={labelStyle}>To</label>
                              <input style={{ ...inputStyle, fontSize: 13 }} type="email" value={draft.to}
                                onChange={e => setOutreachDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], to: e.target.value } }))}
                                placeholder="owner@business.com" />
                            </div>
                            <div>
                              <label style={labelStyle}>Subject</label>
                              <input style={{ ...inputStyle, fontSize: 13 }} value={draft.subject}
                                onChange={e => setOutreachDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], subject: e.target.value } }))}
                                placeholder="Subject line…" />
                            </div>
                            <div>
                              <label style={labelStyle}>Email Body</label>
                              <textarea style={{ ...inputStyle, minHeight: 160, resize: "vertical", fontSize: 13, lineHeight: 1.6 }}
                                value={draft.body}
                                onChange={e => setOutreachDrafts(prev => ({ ...prev, [p.id]: { ...prev[p.id], body: e.target.value } }))}
                                placeholder="Write your email here…" />
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
                            <button
                              onClick={() => handleSendEmail(p)}
                              disabled={sendingEmail === p.id || status === "sent"}
                              style={{ ...btnPrimary, padding: "10px 24px", fontSize: 13, opacity: (sendingEmail === p.id || status === "sent") ? 0.6 : 1, cursor: sendingEmail === p.id ? "wait" : "pointer" }}>
                              {sendingEmail === p.id ? "Sending…" : status === "sent" ? "✓ Sent" : "Send Email"}
                            </button>
                            <button onClick={() => { navigator.clipboard.writeText(draft.body || ""); showToast("Email body copied"); }} style={{ ...btnSecondary, fontSize: 12 }}>
                              Copy Body
                            </button>
                            {status === "sent" && (
                              <button onClick={() => setOutreachStatuses(prev => ({ ...prev, [p.id]: "replied" }))}
                                style={{ ...btnSecondary, fontSize: 12, color: t.green, borderColor: t.greenBorder }}>
                                Mark Replied
                              </button>
                            )}
                            {status === "replied" && (
                              <span style={{ fontSize: 12, color: t.green, fontWeight: 600 }}>🎉 They replied!</span>
                            )}
                            {!playbookData[p.id] && (
                              <button onClick={() => { handleGeneratePlaybook(p); }}
                                style={{ ...btnSecondary, fontSize: 12, marginLeft: "auto" }}>
                                📋 Generate Playbook
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
