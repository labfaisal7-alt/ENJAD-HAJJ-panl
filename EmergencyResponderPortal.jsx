import React, {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Ambulance,
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Filter,
  HeartPulse,
  Home,
  LoaderCircle,
  Lock,
  MapPin,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const navItems = [
  { key: "dashboard", label: "Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©", icon: Home, permission: "dashboard:view" },
  { key: "new", label: "Ù…Ø¨Ø§Ø´Ø±Ø© Ø¬Ø¯ÙŠØ¯Ø©", icon: Plus, permission: "incidents:create" },
  { key: "incidents", label: "Ø³Ø¬Ù„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø§Øª", icon: ClipboardList, permission: "incidents:view" },
  { key: "reports", label: "Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ù…ÙˆØ³Ù…", icon: BarChart3, permission: "reports:view" },
  { key: "users", label: "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ† ÙˆØ§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª", icon: Users, permission: "users:view" },
  { key: "settings", label: "Ø§Ù„Ø£Ù…Ø§Ù† ÙˆØ§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª", icon: ShieldCheck, permission: "security:view" },
];

const permissionSections = [
  {
    title: "Ø§Ù„ØªØ´ØºÙŠÙ„ Ø§Ù„Ù…ÙŠØ¯Ø§Ù†ÙŠ",
    items: [
      { key: "dashboard:view", label: "Ø¹Ø±Ø¶ Ù„ÙˆØ­Ø© Ø§Ù„Ù…Ø¤Ø´Ø±Ø§Øª" },
      { key: "incidents:create", label: "Ø¥Ù†Ø´Ø§Ø¡ Ù…Ø¨Ø§Ø´Ø±Ø© Ø¬Ø¯ÙŠØ¯Ø©" },
      { key: "incidents:view", label: "Ø¹Ø±Ø¶ Ø³Ø¬Ù„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø§Øª" },
      { key: "incidents:approve", label: "Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆØ¥ØºÙ„Ø§Ù‚ Ø§Ù„Ø­Ø§Ù„Ø§Øª" },
    ],
  },
  {
    title: "Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØ§Ù„ØªÙ‚Ø§Ø±ÙŠØ±",
    items: [
      { key: "reports:view", label: "Ø¹Ø±Ø¶ Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±" },
      { key: "reports:export", label: "ØªØµØ¯ÙŠØ± Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±" },
      { key: "patients:limited_identity", label: "Ø¹Ø±Ø¶ Ø¨ÙŠØ§Ù†Ø§Øª ØªØ¹Ø±ÙŠÙ Ù…Ø­Ø¯ÙˆØ¯Ø©" },
    ],
  },
  {
    title: "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ† ÙˆØ§Ù„Ø£Ù…Ù†",
    items: [
      { key: "users:view", label: "Ø¹Ø±Ø¶ Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª" },
      { key: "users:manage", label: "Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª ÙˆØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø£Ø¯ÙˆØ§Ø±" },
      { key: "security:view", label: "Ø¹Ø±Ø¶ Ø³ÙŠØ§Ø³Ø§Øª Ø§Ù„Ø£Ù…Ù†" },
      { key: "security:manage", label: "ØªØ¹Ø¯ÙŠÙ„ Ø³ÙŠØ§Ø³Ø§Øª Ø§Ù„Ø£Ù…Ù† ÙˆØ§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª" },
    ],
  },
];

const roleTemplates = [
  {
    key: "field_responder",
    label: "Ù…Ø³Ø¹Ù Ù…ÙŠØ¯Ø§Ù†ÙŠ",
    description: "ÙŠÙÙ†Ø´Ø¦ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø§Øª ÙˆÙŠØ·Ø§Ù„Ø¹ Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ù…ÙƒÙ„Ù Ø¨Ù‡Ø§ Ø¯Ø§Ø®Ù„ Ù†Ø·Ø§Ù‚Ù‡.",
    permissions: ["dashboard:view", "incidents:create", "incidents:view"],
  },
  {
    key: "team_lead",
    label: "Ù‚Ø§Ø¦Ø¯ ÙØ±ÙŠÙ‚",
    description: "ÙŠØªØ§Ø¨Ø¹ Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ù…ÙŠØ¯Ø§Ù†ÙŠØ© ÙˆÙŠØ¹ØªÙ…Ø¯ Ù…Ø§ ÙŠØ±Ø¯ Ù…Ù† Ø£ÙØ±Ø§Ø¯ Ø§Ù„ÙØ±ÙŠÙ‚.",
    permissions: [
      "dashboard:view",
      "incidents:create",
      "incidents:view",
      "incidents:approve",
      "reports:view",
    ],
  },
  {
    key: "operations_supervisor",
    label: "Ù…Ø´Ø±Ù Ø¹Ù…Ù„ÙŠØ§Øª",
    description: "ÙŠØ¯ÙŠØ± Ø§Ù„ØªØºØ·ÙŠØ© Ø§Ù„ØªØ´ØºÙŠÙ„ÙŠØ© ÙˆÙŠØªØ§Ø¨Ø¹ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø¯ÙˆÙ† ØµÙ„Ø§Ø­ÙŠØ§Øª Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù….",
    permissions: [
      "dashboard:view",
      "incidents:create",
      "incidents:view",
      "incidents:approve",
      "reports:view",
      "reports:export",
      "patients:limited_identity",
      "users:view",
      "users:manage",
    ],
  },
  {
    key: "statistics_officer",
    label: "Ù…Ø³Ø¤ÙˆÙ„ Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª",
    description: "ÙŠØ³ØªØ¹Ø±Ø¶ Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ± Ø§Ù„Ù…ÙˆØ³Ù…ÙŠØ© ÙˆÙŠØµØ¯Ø± Ø§Ù„Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø©.",
    permissions: [
      "dashboard:view",
      "incidents:view",
      "reports:view",
      "reports:export",
    ],
  },
  {
    key: "system_admin",
    label: "Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…",
    description: "ÙŠÙ…Ù„Ùƒ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„ÙƒØ§Ù…Ù„Ø© Ø¹Ù„Ù‰ Ø§Ù„ØªØ´ØºÙŠÙ„ ÙˆØ§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† ÙˆØ³ÙŠØ§Ø³Ø§Øª Ø§Ù„Ø£Ù…Ø§Ù†.",
    permissions: [
      "dashboard:view",
      "incidents:create",
      "incidents:view",
      "incidents:approve",
      "reports:view",
      "reports:export",
      "patients:limited_identity",
      "users:view",
      "users:manage",
      "security:view",
      "security:manage",
    ],
  },
];

const initialUsers = [
  {
    id: 1,
    name: "ÙÙŠØµÙ„ Ø§Ù„Ø¹Ø³ÙŠØ±ÙŠ",
    phone: "0500000001",
    roleKey: "field_responder",
    status: "Ù†Ø´Ø·",
    scope: "Ù…ÙƒØ© Ø§Ù„Ù…ÙƒØ±Ù…Ø©",
    team: "ÙØ±ÙŠÙ‚ Ø§Ù„Ø­Ø±Ù… 1",
  },
  {
    id: 2,
    name: "Ø¹Ù„ÙŠ Ø§Ù„Ù…Ø·ÙŠØ±ÙŠ",
    phone: "0500000002",
    roleKey: "operations_supervisor",
    status: "Ù†Ø´Ø·",
    scope: "Ø§Ù„ÙƒÙ„",
    team: "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª",
  },
  {
    id: 3,
    name: "Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…",
    phone: "0500000003",
    roleKey: "system_admin",
    status: "Ù†Ø´Ø·",
    scope: "Ø§Ù„ÙƒÙ„",
    team: "Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©",
  },
];

const initialAuditLog = [];

const defaultSecuritySettings = {
  requireOtpForSupervisors: true,
  restrictExports: true,
  retentionPolicy: "90 ÙŠÙˆÙ…Ù‹Ø§",
};

const initialDepartments = [
  "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª",
  "Ø§Ù„Ø¥Ø³Ø¹Ø§Ù Ø§Ù„Ù…ÙŠØ¯Ø§Ù†ÙŠ",
  "Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª",
  "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…ØªØ·ÙˆØ¹ÙŠÙ†",
  "Ø§Ù„Ø¯Ø¹Ù… Ø§Ù„Ù„ÙˆØ¬Ø³ØªÙŠ",
];

const initialCities = ["Ù…ÙƒØ© Ø§Ù„Ù…ÙƒØ±Ù…Ø©", "Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ø§Ù„Ù…Ù†ÙˆØ±Ø©"];

const initialSites = [
  { city: "Ù…ÙƒØ© Ø§Ù„Ù…ÙƒØ±Ù…Ø©", name: "Ø§Ù„Ù…Ø³Ø¬Ø¯ Ø§Ù„Ø­Ø±Ø§Ù…" },
  { city: "Ù…ÙƒØ© Ø§Ù„Ù…ÙƒØ±Ù…Ø©", name: "Ù…Ù†Ù‰" },
  { city: "Ù…ÙƒØ© Ø§Ù„Ù…ÙƒØ±Ù…Ø©", name: "Ø¹Ø±ÙØ§Øª" },
  { city: "Ù…ÙƒØ© Ø§Ù„Ù…ÙƒØ±Ù…Ø©", name: "Ù…Ø²Ø¯Ù„ÙØ©" },
  { city: "Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ø§Ù„Ù…Ù†ÙˆØ±Ø©", name: "Ø§Ù„Ù…Ø³Ø¬Ø¯ Ø§Ù„Ù†Ø¨ÙˆÙŠ" },
  { city: "Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ø§Ù„Ù…Ù†ÙˆØ±Ø©", name: "Ù…Ø­Ø·Ø© Ù†Ù‚Ù„" },
  { city: "Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ø§Ù„Ù…Ù†ÙˆØ±Ø©", name: "Ø³ÙƒÙ† Ø§Ù„Ø­Ø¬Ø§Ø¬" },
];

const STORAGE_KEYS = {
  users: "hajj_portal_users",
  incidents: "hajj_portal_incidents",
  auditLog: "hajj_portal_audit_log",
  security: "hajj_portal_security",
  departments: "hajj_portal_departments",
  cities: "hajj_portal_cities",
  sites: "hajj_portal_sites",
  currentUserId: "hajj_portal_current_user_id",
  incidentSequence: "hajj_portal_incident_sequence",
  notifications: "hajj_portal_notifications",
};

const DEMO_PIN = "1234";
const SEASON_CODE = "1447";

const initialIncidents = [
  {
    id: "HAJJ-1447-001",
    type: "Ø¥Ø¬Ù‡Ø§Ø¯ Ø­Ø±Ø§Ø±ÙŠ",
    city: "Ù…ÙƒØ© Ø§Ù„Ù…ÙƒØ±Ù…Ø©",
    location: "Ø§Ù„Ù…Ø³Ø¬Ø¯ Ø§Ù„Ø­Ø±Ø§Ù… - Ø³Ø§Ø­Ø© Ø§Ù„Ø­Ø±Ù…",
    status: "Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©",
    patients: 1,
    severity: "Ù…ØªÙˆØ³Ø·",
    time: "10:42",
    source: "Ø¨Ù„Ø§Øº Ù…Ø­Ø§Ù„ Ù…Ù† Ø§Ù„Ù‡Ù„Ø§Ù„ Ø§Ù„Ø£Ø­Ù…Ø±",
    rcNumber: "997-12345",
    category: "Ø­Ø§Ø¬",
    intervention: "",
    handover: "",
    team: "ÙØ±ÙŠÙ‚ Ø§Ù„Ø­Ø±Ù… 1",
    createdById: 1,
    createdBy: "ÙÙŠØµÙ„ Ø§Ù„Ø¹Ø³ÙŠØ±ÙŠ",
    notes: "ØªÙ… Ø§Ù„ØªØ¨Ø±ÙŠØ¯ ÙˆØªØ³Ù„ÙŠÙ… Ø§Ù„Ø­Ø§Ù„Ø© Ù„Ù„Ù‡Ù„Ø§Ù„ Ø§Ù„Ø£Ø­Ù…Ø±",
  },
  {
    id: "HAJJ-1447-002",
    type: "Ø¥ØºÙ…Ø§Ø¡",
    city: "Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ø§Ù„Ù…Ù†ÙˆØ±Ø©",
    location: "Ø§Ù„Ù…Ø³Ø¬Ø¯ Ø§Ù„Ù†Ø¨ÙˆÙŠ - Ø¨Ø§Ø¨ Ø§Ù„Ø³Ù„Ø§Ù…",
    status: "Ù…ØºÙ„Ù‚",
    patients: 1,
    severity: "Ø¨Ø³ÙŠØ·",
    time: "09:15",
    source: "Ù…Ø¨Ø§Ø´Ø±Ø© Ø°Ø§ØªÙŠØ© Ù…Ù† Ø§Ù„ÙØ±ÙŠÙ‚",
    rcNumber: "",
    category: "Ù…Ø¹ØªÙ…Ø±",
    intervention: "",
    handover: "",
    team: "ÙØ±ÙŠÙ‚ Ø§Ù„Ù†Ø¨ÙˆÙŠ 1",
    createdById: 2,
    createdBy: "Ø¹Ù„ÙŠ Ø§Ù„Ù…Ø·ÙŠØ±ÙŠ",
    notes: "Ø¹Ù„Ø§Ø¬ Ø¨Ø§Ù„Ù…ÙˆÙ‚Ø¹",
  },
];

const initialNotifications = [
  {
    id: 1,
    title: "Ø¨Ù„Ø§Øº Ø­Ø±Ø¬ Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯",
    body: "Ø­Ø§Ù„Ø© Ø¶ÙŠÙ‚ ØªÙ†ÙØ³ Ù„Ø­Ø§Ø¬ ÙÙŠ Ù…Ø´Ø¹Ø± Ù…Ù†Ù‰ Ù…Ø§ Ø²Ø§Ù„Øª Ø¨Ø­Ø§Ø¬Ø© Ø¥Ù„Ù‰ Ø§Ø³ØªÙƒÙ…Ø§Ù„ Ø§Ù„Ø¹Ù„Ø§Ù…Ø§Øª Ø§Ù„Ø­ÙŠÙˆÙŠØ©.",
    time: "Ù…Ù†Ø° 4 Ø¯Ù‚Ø§Ø¦Ù‚",
    tone: "danger",
  },
  {
    id: 2,
    title: "ÙˆØµÙˆÙ„ Ø­Ø§Ù„Ø© Ø¬Ø¯ÙŠØ¯Ø© Ù…Ù† Ø§Ù„Ù‡Ù„Ø§Ù„ Ø§Ù„Ø£Ø­Ù…Ø± Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠ",
    body: "ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ø¨Ù„Ø§Øº Ø¥Ø¬Ù‡Ø§Ø¯ Ø­Ø±Ø§Ø±ÙŠ ÙÙŠ Ù…Ø­ÙŠØ· Ø§Ù„Ø­Ø±Ù… ÙˆØ±Ø¨Ø·Ù‡ Ø¨Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„Ù…ÙŠØ¯Ø§Ù†ÙŠ Ø§Ù„Ø«Ø§Ù†ÙŠ.",
    time: "Ù…Ù†Ø° 11 Ø¯Ù‚ÙŠÙ‚Ø©",
    tone: "default",
  },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const baseInputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50";

const statusStyles = {
  "Ù…ØºÙ„Ù‚": "bg-emerald-50 text-emerald-700",
  "Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©": "bg-amber-50 text-amber-700",
  "Ù‚ÙŠØ¯ Ø§Ù„Ø§Ø³ØªÙƒÙ…Ø§Ù„": "bg-blue-50 text-blue-700",
};

const roleStyles = {
  "Ù…Ø³Ø¹Ù Ù…ÙŠØ¯Ø§Ù†ÙŠ": "bg-sky-50 text-sky-700",
  "Ù‚Ø§Ø¦Ø¯ ÙØ±ÙŠÙ‚": "bg-amber-50 text-amber-700",
  "Ù…Ø´Ø±Ù Ø¹Ù…Ù„ÙŠØ§Øª": "bg-red-50 text-red-700",
  "Ù…Ø³Ø¤ÙˆÙ„ Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª": "bg-emerald-50 text-emerald-700",
};

function getRoleByKey(roleKey) {
  return roleTemplates.find((role) => role.key === roleKey);
}

function hasPermission(user, permission) {
  if (!user) {
    return false;
  }

  const role = getRoleByKey(user.roleKey);
  return role?.permissions.includes(permission) || false;
}

function canAccessPage(user, pageKey) {
  const navItem = navItems.find((item) => item.key === pageKey);

  if (!navItem?.permission) {
    return true;
  }

  return hasPermission(user, navItem.permission);
}

function getScopeCities(scope = "") {
  if (scope.includes("Ù…ÙƒØ©") && scope.includes("Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©")) {
    return ["Ù…ÙƒØ© Ø§Ù„Ù…ÙƒØ±Ù…Ø©", "Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ø§Ù„Ù…Ù†ÙˆØ±Ø©"];
  }
  if (scope.includes("Ù…ÙƒØ©") || scope.includes("Ù…Ù†Ù‰") || scope.includes("Ø¹Ø±ÙØ§Øª")) {
    return ["Ù…ÙƒØ© Ø§Ù„Ù…ÙƒØ±Ù…Ø©"];
  }
  if (scope.includes("Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©")) {
    return ["Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ø§Ù„Ù…Ù†ÙˆØ±Ø©"];
  }

  return [];
}

function getSitesForCity(sites, city) {
  return sites
    .filter((site) => site.city === city)
    .map((site) => site.name);
}

function getVisibleIncidents(incidents, user) {
  if (!user) {
    return [];
  }

  if (
    user.roleKey === "operations_supervisor" ||
    user.roleKey === "statistics_officer" ||
    user.roleKey === "system_admin"
  ) {
    return incidents;
  }

  if (user.roleKey === "team_lead") {
    const scopeCities = getScopeCities(user.scope);
    return incidents.filter(
      (incident) => incident.team === user.team || scopeCities.includes(incident.city),
    );
  }

  return incidents.filter(
    (incident) => incident.createdById === user.id || incident.createdBy === user.name,
  );
}

function readStorage(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch (error) {
    console.error(`Unable to parse localStorage key: ${key}`, error);
    return fallback;
  }
}

function deriveIncidentSequence(incidents) {
  return incidents
    .map((incident) => {
      const match = String(incident.id || "").match(/HAJJ-\d+-(\d+)/);
      return match ? Number(match[1]) : 0;
    })
    .reduce((max, value) => Math.max(max, value), 0);
}

function getNextIncidentNumber(sequence) {
  return `HAJJ-${SEASON_CODE}-${String(sequence).padStart(4, "0")}`;
}

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  min,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type={type}
        min={min}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={baseInputClassName}
      />
    </label>
  );
}

function SelectField({ label, options, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <select
        value={value}
        onChange={onChange}
        className={baseInputClassName}
      >
        {options.map((option) => {
          const normalizedOption =
            typeof option === "string"
              ? { value: option, label: option }
              : option;

          return (
            <option
              key={normalizedOption.value}
              value={normalizedOption.value}
            >
              {normalizedOption.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function StatCard({ title, value, icon: Icon, hint }) {
  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            <p className="mt-2 text-xs text-slate-400">{hint}</p>
          </div>
          <div className="rounded-2xl bg-red-50 p-3 text-red-600">
            <Icon size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        statusStyles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function Drawer({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden"
            aria-label="Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©"
          />
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed inset-y-0 right-0 z-50 w-[88vw] max-w-sm bg-white p-5 shadow-2xl lg:hidden"
          >
            {children}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function NotificationPanel({ open, notifications, onClose }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="absolute left-0 top-16 z-30 w-[92vw] max-w-sm rounded-3xl border border-slate-100 bg-white p-4 shadow-2xl shadow-slate-200/80"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª</h3>
              <p className="text-xs text-slate-500">
                Ø¢Ø®Ø± Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„Ù…Ø±ØªØ¨Ø·Ø© Ø¨Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 ${
                  item.tone === "danger"
                    ? "border-red-100 bg-red-50/80"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.body}
                    </p>
                  </div>
                  <Bell
                    size={16}
                    className={
                      item.tone === "danger" ? "text-red-500" : "text-slate-400"
                    }
                  />
                </div>
                <p className="mt-3 text-xs text-slate-400">{item.time}</p>
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function FloatingToasts({ items }) {
  return (
    <div className="pointer-events-none fixed bottom-24 left-4 right-4 z-50 flex flex-col gap-3 lg:left-auto lg:right-6 lg:top-6 lg:bottom-auto lg:w-96">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className={`rounded-3xl border px-4 py-3 shadow-xl ${
              item.tone === "success"
                ? "border-emerald-100 bg-white"
                : item.tone === "danger"
                  ? "border-red-100 bg-white"
                  : "border-slate-100 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 rounded-2xl p-2 ${
                  item.tone === "success"
                    ? "bg-emerald-50 text-emerald-600"
                    : item.tone === "danger"
                      ? "bg-red-50 text-red-600"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                <Bell size={16} />
              </div>
              <div>
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-500">{item.body}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function LoginScreen({
  onLogin,
  isSubmitting,
  users,
  selectedUserId,
  onSelectUser,
  pin,
  onPinChange,
}) {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-900 to-slate-950" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white 0, transparent 28%), radial-gradient(circle at 80% 70%, white 0, transparent 22%)",
            }}
          />
          <div className="relative flex h-full flex-col justify-between p-12">
            <div className="flex items-center gap-3">
              <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
                <Ambulance size={34} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Ø¬Ù…Ø¹ÙŠØ© Ø¥Ù†Ø¬Ø§Ø¯ Ù„Ù„Ø¨Ø­Ø« ÙˆØ§Ù„Ø¥Ù†Ù‚Ø§Ø°
                </h1>
                <p className="text-sm text-white/70">
                  Ø¨ÙˆØ§Ø¨Ø© Ù…Ø¨Ø§Ø´Ø±Ø© Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø¥Ø³Ø¹Ø§ÙÙŠØ© Ø§Ù„Ù…ÙˆØ³Ù…ÙŠØ©
                </p>
              </div>
            </div>
            <div className="max-w-md">
              <h2 className="text-4xl font-black leading-tight">
                Ù…Ù†ØµØ© ØªØ´ØºÙŠÙ„ÙŠØ© Ø³Ø±ÙŠØ¹Ø© Ù„Ù…Ø¨Ø§Ø´Ø±Ø© Ø§Ù„Ø­Ø§Ù„Ø§Øª ÙˆØªØ­ÙˆÙŠÙ„Ù‡Ø§ Ø¥Ù„Ù‰ Ù…Ø¤Ø´Ø±Ø§Øª Ø¯Ù‚ÙŠÙ‚Ø©.
              </h2>
              <p className="mt-5 text-white/70">
                Ù…ØµÙ…Ù…Ø© Ù„Ù…ÙˆØ³Ù… Ø§Ù„Ø­Ø¬ ÙˆØ§Ù„Ø¹Ù…Ø±Ø©: Ø³Ø±Ø¹Ø© Ù…Ø¨Ø§Ø´Ø±Ø©ØŒ ØªÙˆØ«ÙŠÙ‚ Ù…Ø®ØªØµØ±ØŒ ÙˆØµÙ„Ø§Ø­ÙŠØ§Øª
                ÙˆØ§Ø¶Ø­Ø© Ù„ÙƒÙ„ ÙØ±ÙŠÙ‚.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <ShieldCheck size={18} />
              <span>Ø­Ù…Ø§ÙŠØ© Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ÙŠÙ† ÙˆØªÙ‚Ù„ÙŠÙ„ Ø§Ù„ÙˆØµÙˆÙ„ Ø­Ø³Ø¨ Ø§Ù„Ø¯ÙˆØ±</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-slate-50 p-6 text-slate-900">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-600 text-white">
                <Ambulance size={32} />
              </div>
              <h1 className="text-2xl font-bold">Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø© Ø§Ù„Ù…ÙˆØ³Ù…ÙŠØ©</h1>
              
            </div>
            <Card className="rounded-3xl border-0 shadow-xl shadow-slate-200/70">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold">ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Ø§Ø®ØªØ± Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ù†Ø´Ø· ÙˆØ£Ø¯Ø®Ù„ Ø±Ù…Ø² Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠ Ù„Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ø§Ù„Ø¨ÙˆØ§Ø¨Ø©.
                </p>
                <div className="mt-6 space-y-4">
                  <SelectField
                    label="Ø§Ù„Ø­Ø³Ø§Ø¨"
                    value={selectedUserId}
                    onChange={onSelectUser}
                    options={users
                      .filter((user) => user.status === "Ù†Ø´Ø·")
                      .map((user) => ({
                        value: String(user.id),
                        label: `${user.name} - ${getRoleByKey(user.roleKey)?.label || user.roleKey} - ${user.scope}`,
                      }))}
                  />
                  <Field
                    label="Ø±Ù…Ø² Ø§Ù„Ø¯Ø®ÙˆÙ„"
                    placeholder="1234"
                    type="password"
                    value={pin}
                    onChange={onPinChange}
                  />
                  <Button
                    onClick={onLogin}
                    disabled={isSubmitting}
                    className="mt-2 w-full rounded-2xl bg-red-600 py-6 text-base hover:bg-red-700 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="mr-2 animate-spin" size={18} />
                        Ø¬Ø§Ø± Ø§Ù„ØªØ­Ù‚Ù‚
                      </>
                    ) : (
                      <>
                        Ø¯Ø®ÙˆÙ„ Ø¢Ù…Ù†
                        <Lock className="mr-2" size={18} />
                      </>
                    )}
                  </Button>
                </div>
                <div className="mt-5 rounded-2xl bg-slate-100 px-4 py-3 text-xs leading-6 text-slate-600">
                  Ø§Ù„Ù†Ø³Ø®Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ© ØªØ¬Ø±ÙŠØ¨ÙŠØ© Ù„Ù„ØªØ´ØºÙŠÙ„ Ø§Ù„Ù…Ø­Ù„ÙŠ ÙˆØªØ³ØªØ®Ø¯Ù… Ø±Ù…Ø² Ø§Ù„Ø¯Ø®ÙˆÙ„
                  <b> 1234 </b>
                  Ù…Ø¹ Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø© Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…ØªØµÙØ­.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ active, setActive, currentUser, onNavigate }) {
  const visibleItems = navItems.filter((item) => canAccessPage(currentUser, item.key));

  return (
    <aside className="hidden w-72 shrink-0 border-l border-slate-100 bg-white p-5 lg:block">
      <div className="flex items-center gap-3 rounded-3xl bg-slate-950 p-4 text-white">
        <div className="rounded-2xl bg-red-600 p-3">
          <HeartPulse size={24} />
        </div>
        <div>
          <p className="font-bold">Ù…Ø¨Ø§Ø´Ø±Ø© Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ù…ÙˆØ³Ù…ÙŠØ©</p>
          <p className="text-xs text-white/60">Ø¬Ù…Ø¹ÙŠØ© Ø¥Ù†Ø¬Ø§Ø¯ Ù„Ù„Ø¨Ø­Ø« ÙˆØ§Ù„Ø¥Ù†Ù‚Ø§Ø°</p>
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setActive(item.key);
                onNavigate?.();
              }}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-red-50 text-red-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={19} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function Header({
  active,
  setActive,
  currentUser,
  onOpenMobileNav,
  onLogout,
  unreadCount,
  notificationOpen,
  setNotificationOpen,
  notifications,
  isPageLoading,
}) {
  const title =
    navItems.find((item) => item.key === active)?.label || "Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-slate-50/90 px-4 py-4 backdrop-blur lg:px-8">
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-2xl lg:hidden"
            onClick={onOpenMobileNav}
          >
            <Menu size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-900 lg:text-xl">
                {title}
              </h1>
              {isPageLoading ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  <LoaderCircle size={14} className="animate-spin" />
                  Ø¬Ø§Ø± Ø§Ù„ØªØ­Ø¯ÙŠØ«
                </span>
              ) : null}
            </div>
            <p className="text-xs text-slate-500">
              Ù…Ø±Ø­Ø¨Ù‹Ø§ØŒ {currentUser?.name} â€” {getRoleByKey(currentUser?.roleKey)?.label}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canAccessPage(currentUser, "new") ? (
            <Button
              onClick={() => setActive("new")}
              className="hidden rounded-2xl bg-red-600 hover:bg-red-700 sm:inline-flex"
            >
              Ù…Ø¨Ø§Ø´Ø±Ø© Ø¬Ø¯ÙŠØ¯Ø©
              <Plus className="mr-2" size={17} />
            </Button>
          ) : null}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative rounded-2xl bg-white p-3 text-slate-500 shadow-sm transition hover:text-slate-700"
            >
              <Bell size={18} />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            <NotificationPanel
              open={notificationOpen}
              notifications={notifications}
              onClose={() => setNotificationOpen(false)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl bg-white text-slate-600"
            onClick={onLogout}
          >
            ØªØ³Ø¬ÙŠÙ„ Ø®Ø±ÙˆØ¬
            <UserRound className="mr-2" size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
}

function Dashboard({ setActive, incidents, currentUser }) {
  const visibleIncidents = useMemo(
    () => getVisibleIncidents(incidents, currentUser),
    [currentUser, incidents],
  );
  const closedCount = visibleIncidents.filter((incident) => incident.status === "Ù…ØºÙ„Ù‚").length;
  const criticalCount = visibleIncidents.filter((incident) => incident.severity === "Ø­Ø±Ø¬").length;
  const totalPatients = visibleIncidents.reduce(
    (sum, incident) => sum + Number(incident.patients || 0),
    0,
  );
  const redCrescentCount = visibleIncidents.filter((incident) =>
    String(incident.source).includes("Ø§Ù„Ù‡Ù„Ø§Ù„"),
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Ù…Ø¨Ø§Ø´Ø±Ø§Øª Ø§Ù„ÙŠÙˆÙ…"
          value={String(visibleIncidents.length)}
          icon={ClipboardList}
          hint="Ø¨Ø­Ø³Ø¨ Ù†Ø·Ø§Ù‚ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ø­Ø§Ù„ÙŠ"
        />
        <StatCard
          title="Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ÙŠÙ†"
          value={String(totalPatients)}
          icon={Activity}
          hint={`Ø¨ÙŠÙ†Ù‡Ù… ${criticalCount} Ø­Ø§Ù„Ø§Øª Ø­Ø±Ø¬Ø©`}
        />
        <StatCard
          title="Ø¨Ù„Ø§ØºØ§Øª Ø§Ù„Ù‡Ù„Ø§Ù„ Ø§Ù„Ø£Ø­Ù…Ø±"
          value={String(redCrescentCount)}
          icon={Clock}
          hint="Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ù…Ø­Ø§Ù„Ø© Ø±Ø³Ù…ÙŠÙ‹Ø§"
        />
        <StatCard
          title="Ø­Ø§Ù„Ø§Øª Ù…ØºÙ„Ù‚Ø©"
          value={String(closedCount)}
          icon={CheckCircle2}
          hint={`${visibleIncidents.length - closedCount} Ù‚ÙŠØ¯ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-3xl border-0 shadow-sm xl:col-span-2">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Ø¢Ø®Ø± Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø§Øª
                </h2>
                <p className="text-sm text-slate-500">
                  Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ù…Ø³Ø¬Ù„Ø© Ù„Ù„Ø­Ø¬Ø§Ø¬ ÙˆØ§Ù„Ù…Ø¹ØªÙ…Ø±ÙŠÙ† Ù…Ù† Ø§Ù„ÙØ±Ù‚ Ø§Ù„Ù…ÙŠØ¯Ø§Ù†ÙŠØ©
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setActive("incidents")}
                className="rounded-2xl"
              >
                Ø¹Ø±Ø¶ Ø§Ù„ÙƒÙ„
              </Button>
            </div>
            <div className="grid gap-4 lg:hidden">
              {visibleIncidents.slice().reverse().slice(0, 3).map((incident) => (
                <div
                  key={incident.id}
                  className="rounded-3xl border border-slate-100 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{incident.id}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {incident.type} - {incident.city}
                      </p>
                    </div>
                    <StatusBadge status={incident.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {incident.patients} Ù…Ø³ØªÙÙŠØ¯
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {incident.time}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {incident.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-100 lg:block">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4">Ø±Ù‚Ù… Ø§Ù„Ø¨Ù„Ø§Øº</th>
                    <th className="p-4">Ø§Ù„Ù†ÙˆØ¹</th>
                    <th className="p-4">Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©</th>
                    <th className="p-4">Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ÙŠÙ†</th>
                    <th className="p-4">Ø§Ù„Ø­Ø§Ù„Ø©</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleIncidents.slice().reverse().map((incident) => (
                    <tr key={incident.id} className="bg-white">
                      <td className="p-4 font-medium text-slate-900">
                        {incident.id}
                      </td>
                      <td className="p-4 text-slate-600">{incident.type}</td>
                      <td className="p-4 text-slate-600">{incident.city}</td>
                      <td className="p-4 text-slate-600">
                        {incident.patients}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={incident.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 bg-slate-950 text-white shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold">ØªÙ†Ø¨ÙŠÙ‡Ø§Øª ØªØ´ØºÙŠÙ„ÙŠØ©</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-medium">Ø­Ø§Ù„Ø© Ù‚ÙŠØ¯ Ø§Ù„Ø§Ø³ØªÙƒÙ…Ø§Ù„</p>
                <p className="mt-1 text-sm text-white/60">
                  Ø­Ø§Ù„Ø© Ø¶ÙŠÙ‚ ØªÙ†ÙØ³ Ù„Ù…Ø¹ØªÙ…Ø± ØªØ­ØªØ§Ø¬ Ø¥ÙƒÙ…Ø§Ù„ Ø§Ù„Ø¹Ù„Ø§Ù…Ø§Øª Ø§Ù„Ø­ÙŠÙˆÙŠØ©.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-medium">Ù…Ø±Ø§Ø¬Ø¹Ø© Ù…Ø´Ø±Ù Ø§Ù„Ù…Ù†Ø·Ù‚Ø©</p>
                <p className="mt-1 text-sm text-white/60">
                  4 Ø­Ø§Ù„Ø§Øª Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙÙŠ Ù…ÙƒØ© ÙˆØ§Ù„Ù…Ø¯ÙŠÙ†Ø©.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-medium">Ø¬Ø§Ù‡Ø²ÙŠØ© Ø§Ù„ÙØ±Ù‚ Ø§Ù„Ù…ÙˆØ³Ù…ÙŠØ©</p>
                <p className="mt-1 text-sm text-white/60">
                  Ø§Ù„ÙˆØ§Ø¬Ù‡Ø© Ù…Ù‡ÙŠØ£Ø© Ù„Ù„Ù…Ø¨Ø§Ø´Ø±Ø© Ø§Ù„Ø³Ø±ÙŠØ¹Ø© ÙÙŠ Ø§Ù„Ø­Ø±Ù… ÙˆØ§Ù„Ù…Ø´Ø§Ø¹Ø± ÙˆØ§Ù„Ù…Ù†Ø§Ø·Ù‚ Ø§Ù„Ù…Ø±ÙƒØ²ÙŠØ©.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function NewIncident({
  currentUser,
  incidents,
  cities,
  sites,
  onSaveIncident,
  onToast,
  onNotify,
}) {
  const availableCities = cities.length > 0 ? cities : initialCities;
  const initialCity = availableCities[0] || "Ù…ÙƒØ© Ø§Ù„Ù…ÙƒØ±Ù…Ø©";
  const initialSite = getSitesForCity(sites, initialCity)[0] || "Ù…ÙˆÙ‚Ø¹ Ù…ÙˆØ³Ù…ÙŠ";
  const [patientCount, setPatientCount] = useState(1);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    source: "Ù…Ø¨Ø§Ø´Ø±Ø© Ù…ÙŠØ¯Ø§Ù†ÙŠØ©",
    rcNumber: "",
    reportedAt: "",
    incidentType: "Ø¥Ø¬Ù‡Ø§Ø¯ Ø­Ø±Ø§Ø±ÙŠ",
    city: initialCity,
    seasonalLocation: initialSite,
    locationDetail: "",
    gps: "",
    severity: "Ù…ØªÙˆØ³Ø·",
    declaredPatients: "1",
    category: "Ø­Ø§Ø¬",
    intervention: "ØªÙ‚ÙŠÙŠÙ… Ø£ÙˆÙ„ÙŠ",
    handover: "Ø¹ÙˆÙ„Ø¬ Ø¨Ø§Ù„Ù…ÙˆÙ‚Ø¹",
    notes: "",
  });

  const patients = useMemo(
    () => Array.from({ length: patientCount }, (_, i) => i + 1),
    [patientCount],
  );

  const updateField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  useEffect(() => {
    setForm((current) => ({
      ...current,
      declaredPatients: String(patientCount),
    }));
  }, [patientCount]);

  useEffect(() => {
    const citySites = getSitesForCity(sites, form.city);
    if (citySites.length === 0) {
      return;
    }

    if (!citySites.includes(form.seasonalLocation)) {
      setForm((current) => ({
        ...current,
        seasonalLocation: citySites[0],
      }));
    }
  }, [form.city, form.seasonalLocation, sites]);

  const persistIncident = async (status) => {
    const draftIncident = {
      source: form.source,
      rcNumber: form.rcNumber.trim(),
      city: form.city,
      location: `${form.seasonalLocation}${
        form.locationDetail.trim() ? ` - ${form.locationDetail.trim()}` : ""
      }`,
      type: form.incidentType,
      severity: form.severity,
      patients: Number(form.declaredPatients || 1),
      category: form.category,
      intervention: form.intervention,
      handover: form.handover,
      status,
      createdById: currentUser.id,
      createdBy: currentUser.name,
      team: currentUser.team,
      time:
        form.reportedAt ||
        new Date().toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      notes: form.notes.trim(),
      gps: form.gps.trim(),
    };

    const savedIncident = await onSaveIncident(draftIncident);
    return savedIncident;
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    await wait(700);
    const incident = await persistIncident("Ù…Ø³ÙˆØ¯Ø©");
    setIsSavingDraft(false);
    onToast("success", "ØªÙ… Ø­ÙØ¸ Ø§Ù„Ù…Ø³ÙˆØ¯Ø©", `ØªÙ… Ø­ÙØ¸ ${incident.id} ÙƒÙ…Ø³ÙˆØ¯Ø© Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„Ø§Ø³ØªÙƒÙ…Ø§Ù„.`);
  };

  const handleSubmit = async (status = "Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©") => {
    setIsSubmitting(true);
    await wait(900);
    const incident = await persistIncident(status);
    setIsSubmitting(false);
    onToast(
      "success",
      status === "Ù…ØºÙ„Ù‚" ? "ØªÙ… Ø­ÙØ¸ ÙˆØ¥ØºÙ„Ø§Ù‚ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø©" : "ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø© Ù„Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©",
      `ØªÙ… Ø­ÙØ¸ ${incident.id} Ø¶Ù…Ù† Ø³Ø¬Ù„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø§Øª Ø§Ù„Ù…ÙˆØ³Ù…ÙŠØ©.`,
    );
    onNotify({
      title: status === "Ù…ØºÙ„Ù‚" ? "Ø¥ØºÙ„Ø§Ù‚ Ù…Ø¨Ø§Ø´Ø±Ø© Ù…ÙŠØ¯Ø§Ù†ÙŠØ©" : "Ù…Ø¨Ø§Ø´Ø±Ø© Ø¬Ø¯ÙŠØ¯Ø© Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯",
      body: `ØªÙ… Ø±ÙØ¹ Ø­Ø§Ù„Ø© ${form.incidentType} ÙÙŠ ${form.city} Ø¨Ø¹Ø¯Ø¯ ${patientCount} Ù…Ø³ØªÙÙŠØ¯.`,
      time: "Ø§Ù„Ø¢Ù†",
      tone: "default",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                ØªØ³Ø¬ÙŠÙ„ Ù…Ø¨Ø§Ø´Ø±Ø© Ø­Ø§Ù„Ø© Ù…ÙˆØ³Ù…ÙŠØ©
              </h2>
              <p className="text-sm text-slate-500">
                Ø£ÙŽØ¯Ø®ÙÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ© Ù„Ù…Ø¨Ø§Ø´Ø±Ø© Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø­Ø¬Ø§Ø¬ ÙˆØ§Ù„Ù…Ø¹ØªÙ…Ø±ÙŠÙ† Ø³ÙˆØ§Ø¡ ÙˆØ±Ø¯Øª Ù…Ù† Ø§Ù„Ù‡Ù„Ø§Ù„ Ø§Ù„Ø£Ø­Ù…Ø± Ø£Ùˆ ØªÙ…Øª Ù…Ø¨Ø§Ø´Ø±ØªÙ‡Ø§ Ù…ÙŠØ¯Ø§Ù†ÙŠÙ‹Ø§.
              </p>
            </div>
            <StatusBadge status="Ù‚ÙŠØ¯ Ø§Ù„Ø§Ø³ØªÙƒÙ…Ø§Ù„" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field
              label="Ø±Ù‚Ù… Ø¨Ù„Ø§Øº Ø§Ù„Ù‡Ù„Ø§Ù„ Ø¥Ù† ÙˆØ¬Ø¯"
              placeholder="Ù…Ø«Ø§Ù„: 997-12345"
              value={form.rcNumber}
              onChange={updateField("rcNumber")}
            />
            <SelectField
              label="Ù…ØµØ¯Ø± Ø§Ù„Ø¨Ù„Ø§Øº"
              value={form.source}
              onChange={updateField("source")}
              options={[
                "Ù…Ø¨Ø§Ø´Ø±Ø© Ù…ÙŠØ¯Ø§Ù†ÙŠØ©",
                "Ø§Ù„Ù‡Ù„Ø§Ù„ Ø§Ù„Ø£Ø­Ù…Ø± Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠ",
                "Ù†Ù‚Ø·Ø© ÙØ±Ø² Ø£Ùˆ Ù…Ø±ÙƒØ² ØªØ·ÙˆØ¹ÙŠ",
                "Ø¬Ù‡Ø© ØªÙ†Ø¸ÙŠÙ…ÙŠØ©",
              ]}
            />
            <Field
              label="ÙˆÙ‚Øª Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø©"
              type="time"
              value={form.reportedAt}
              onChange={updateField("reportedAt")}
            />
            <SelectField
              label="Ù†ÙˆØ¹ Ø§Ù„Ø­Ø§Ù„Ø©"
              value={form.incidentType}
              onChange={updateField("incidentType")}
              options={[
                "Ø¥Ø¬Ù‡Ø§Ø¯ Ø­Ø±Ø§Ø±ÙŠ",
                "Ø¶Ø±Ø¨Ø© Ø­Ø±Ø§Ø±ÙŠØ©",
                "Ø¥ØºÙ…Ø§Ø¡",
                "Ø¶ÙŠÙ‚ ØªÙ†ÙØ³",
                "Ø£Ù„Ù… ØµØ¯Ø±",
                "Ù‡Ø¨ÙˆØ· Ø³ÙƒØ±",
                "Ø§Ø±ØªÙØ§Ø¹ Ø¶ØºØ·",
                "Ø¥Ø¬Ù‡Ø§Ø¯ Ø¹Ø§Ù…",
                "Ø¥ØµØ§Ø¨Ø© Ù‚Ø¯Ù… Ø£Ùˆ Ø¥Ø¬Ù‡Ø§Ø¯ Ù…Ø´ÙŠ",
                "Ø³Ù‚ÙˆØ·",
                "Ù†Ø²ÙŠÙ",
                "Ø£Ø®Ø±Ù‰",
              ]}
            />
            <SelectField
              label="Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©"
              value={form.city}
              onChange={updateField("city")}
              options={availableCities}
            />
            <SelectField
              label="Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù…ÙˆØ³Ù…ÙŠ"
              value={form.seasonalLocation}
              onChange={updateField("seasonalLocation")}
              options={
                getSitesForCity(sites, form.city).length > 0
                  ? getSitesForCity(sites, form.city)
                  : [form.seasonalLocation]
              }
            />
            <Field
              label="ÙˆØµÙ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø£Ùˆ Ø§Ù„Ø¥Ø­Ø¯Ø§Ø«ÙŠØ§Øª"
              placeholder="Ù…Ø«Ø§Ù„: Ø§Ù„Ø³Ø§Ø­Ø© Ø§Ù„Ø´Ø±Ù‚ÙŠØ© / Ø¨Ø§Ø¨ Ø§Ù„Ù…Ù„Ùƒ Ø¹Ø¨Ø¯Ø§Ù„Ø¹Ø²ÙŠØ²"
              value={form.locationDetail}
              onChange={updateField("locationDetail")}
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <SelectField
              label="Ø¯Ø±Ø¬Ø© Ø§Ù„Ø­Ø§Ù„Ø©"
              value={form.severity}
              onChange={updateField("severity")}
              options={["Ø¨Ø³ÙŠØ·", "Ù…ØªÙˆØ³Ø·", "Ø­Ø±Ø¬", "ÙˆÙØ§Ø©"]}
            />
            <Field
              label="Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ÙŠÙ†"
              type="number"
              min="1"
              placeholder="1"
              value={form.declaredPatients}
              onChange={(event) => {
                const next = Math.max(1, Number(event.target.value || 1));
                setPatientCount(next);
              }}
            />
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Ø¥Ø¶Ø§ÙØ© Ù†Ù…Ø§Ø°Ø¬ Ù…Ø³ØªÙÙŠØ¯ÙŠÙ†
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() =>
                    setPatientCount((current) => Math.max(1, current - 1))
                  }
                >
                  -
                </Button>
                <div className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm">
                {patientCount}
              </div>
              <Button
                  variant="outline"
                  className="rounded-2xl"
                onClick={() => setPatientCount((current) => current + 1)}
              >
                +
              </Button>
            </div>
          </label>
          <SelectField
            label="Ø§Ù„ÙØ¦Ø©"
            value={form.category}
            onChange={updateField("category")}
            options={["Ø­Ø§Ø¬", "Ù…Ø¹ØªÙ…Ø±", "Ø²Ø§Ø¦Ø±", "Ø¹Ø§Ù…Ù„ Ø£Ùˆ Ù…Ù†Ø¸Ù…", "ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ"]}
          />
          <SelectField
            label="Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ø¥Ø³Ø¹Ø§ÙÙŠ"
            value={form.intervention}
            onChange={updateField("intervention")}
            options={[
              "ØªÙ‚ÙŠÙŠÙ… Ø£ÙˆÙ„ÙŠ",
              "ØªØ¨Ø±ÙŠØ¯ ÙˆØ¥Ø±ÙˆØ§Ø¡",
              "Ø³ÙˆØ§Ø¦Ù„ ÙÙ…ÙˆÙŠØ©",
              "Ø£ÙƒØ³Ø¬ÙŠÙ†",
              "Ø¥ÙŠÙ‚Ø§Ù Ù†Ø²ÙŠÙ",
              "ØªØ¶Ù…ÙŠØ¯",
              "CPR",
              "Ù‚ÙŠØ§Ø³ Ø³ÙƒØ±",
              "Ø£Ø®Ø±Ù‰",
            ]}
          />
          <SelectField
            label="Ø§Ù„Ù†Ù‚Ù„ Ø£Ùˆ Ø§Ù„ØªØ³Ù„ÙŠÙ…"
            value={form.handover}
            onChange={updateField("handover")}
            options={[
              "Ø¹ÙˆÙ„Ø¬ Ø¨Ø§Ù„Ù…ÙˆÙ‚Ø¹",
              "ØªØ³Ù„ÙŠÙ… Ù„Ù„Ù‡Ù„Ø§Ù„ Ø§Ù„Ø£Ø­Ù…Ø± Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠ",
              "Ù†Ù‚Ù„ Ø¨ÙˆØ§Ø³Ø·Ø© Ø§Ù„Ù‡Ù„Ø§Ù„ Ø§Ù„Ø£Ø­Ù…Ø± Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠ",
              "Ù†Ù‚Ù„ Ù„Ù…Ø±ÙƒØ² ØµØ­ÙŠ Ø£Ùˆ Ø·Ø¨ÙŠ",
              "Ø±ÙØ¶ Ø§Ù„Ù†Ù‚Ù„",
              "ØªØ³Ù„ÙŠÙ… Ù„Ø¬Ù‡Ø© ØªÙ†Ø¸ÙŠÙ…ÙŠØ©",
            ]}
          />
          </div>
          <div className="mt-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ù…Ø®ØªØµØ±Ø©
              </span>
              <textarea
                value={form.notes}
                onChange={updateField("notes")}
                placeholder="Ø§ÙƒØªØ¨ ÙˆØµÙÙ‹Ø§ Ù…Ø®ØªØµØ±Ù‹Ø§ Ø¨Ø¯ÙˆÙ† Ø¨ÙŠØ§Ù†Ø§Øª Ø´Ø®ØµÙŠØ© ØºÙŠØ± Ù„Ø§Ø²Ù…Ø©"
                className={`${baseInputClassName} min-h-24 resize-y`}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {patients.map((patient) => (
        <Card key={patient} className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 font-bold text-red-700">
                {patient}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ Ø±Ù‚Ù… {patient}
                </h3>
                <p className="text-xs text-slate-500">
                  Ù„Ø§ ÙŠØªÙ… Ø¥Ø¯Ø®Ø§Ù„ Ø§Ù„Ø§Ø³Ù… Ø£Ùˆ Ø±Ù‚Ù… Ø§Ù„Ø¬ÙˆØ§Ø² Ø£Ùˆ Ø§Ù„Ù‡ÙˆÙŠØ© Ø¥Ù„Ø§ Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø§Ø¬Ø© Ø§Ù„Ù†Ø¸Ø§Ù…ÙŠØ©.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SelectField
                label="ØµÙØ© Ø§Ù„Ù…Ø³ØªÙÙŠØ¯"
                options={["Ø­Ø§Ø¬", "Ù…Ø¹ØªÙ…Ø±", "Ø²Ø§Ø¦Ø±", "Ø¹Ø§Ù…Ù„"]}
              />
              <SelectField label="Ø§Ù„Ø¬Ù†Ø³" options={["ØºÙŠØ± Ù…Ø­Ø¯Ø¯", "Ø°ÙƒØ±", "Ø£Ù†Ø«Ù‰"]} />
              <Field label="Ø§Ù„Ø¬Ù†Ø³ÙŠØ©" placeholder="Ù…Ø«Ø§Ù„: Ø¥Ù†Ø¯ÙˆÙ†ÙŠØ³ÙŠ" />
              <Field label="Ø§Ù„Ø¹Ù…Ø± Ø§Ù„ØªÙ‚Ø±ÙŠØ¨ÙŠ" placeholder="Ù…Ø«Ø§Ù„: 35" />
              <Field label="Ø§Ù„Ù„ØºØ©" placeholder="Ù…Ø«Ø§Ù„: Ø¹Ø±Ø¨ÙŠ / Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ / Ø£Ø±Ø¯Ùˆ" />
              <SelectField
                label="Ù…Ø³ØªÙˆÙ‰ Ø§Ù„ÙˆØ¹ÙŠ"
                options={[
                  "ÙˆØ§Ø¹ÙŠ",
                  "ÙŠØ³ØªØ¬ÙŠØ¨ Ù„Ù„ØµÙˆØª",
                  "ÙŠØ³ØªØ¬ÙŠØ¨ Ù„Ù„Ø£Ù„Ù…",
                  "ÙØ§Ù‚Ø¯ Ø§Ù„ÙˆØ¹ÙŠ",
                ]}
              />
              <SelectField
                label="ØªØµÙ†ÙŠÙ Ø§Ù„Ø­Ø§Ù„Ø©"
                options={["Ø¨Ø³ÙŠØ·", "Ù…ØªÙˆØ³Ø·", "Ø­Ø±Ø¬", "ÙˆÙØ§Ø©"]}
              />
              <Field label="Ø§Ù„Ù†Ø¨Ø¶" placeholder="Ù†Ø¨Ø¶Ø©/Ø¯Ù‚ÙŠÙ‚Ø©" />
              <Field label="Ø§Ù„Ø¶ØºØ·" placeholder="120/80" />
              <Field label="Ù†Ø³Ø¨Ø© Ø§Ù„Ø£ÙƒØ³Ø¬ÙŠÙ†" placeholder="SpO2 %" />
              <Field label="Ø§Ù„Ø³ÙƒØ±" placeholder="mg/dL" />
            </div>

          </CardContent>
        </Card>
      ))}

      <div className="sticky bottom-20 z-10 rounded-3xl border border-slate-100 bg-white/90 p-4 shadow-lg backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="rounded-2xl px-6"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isSubmitting}
          >
            {isSavingDraft ? (
              <>
                <LoaderCircle className="mr-2 animate-spin" size={16} />
                Ø¬Ø§Ø± Ø§Ù„Ø­ÙØ¸
              </>
            ) : (
              "Ø­ÙØ¸ ÙƒÙ…Ø³ÙˆØ¯Ø©"
            )}
          </Button>
          <Button
            className="rounded-2xl bg-red-600 px-6 hover:bg-red-700"
            onClick={handleSubmit}
            disabled={isSubmitting || isSavingDraft}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="mr-2 animate-spin" size={16} />
                Ø¬Ø§Ø± Ø§Ù„Ø¥Ø±Ø³Ø§Ù„
              </>
            ) : (
              "Ø¥Ø±Ø³Ø§Ù„ Ù„Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©"
            )}
          </Button>
          {hasPermission(currentUser, "incidents:approve") ? (
            <Button
              className="rounded-2xl bg-emerald-600 px-6 hover:bg-emerald-700"
              onClick={() => handleSubmit("Ù…ØºÙ„Ù‚")}
              disabled={isSubmitting || isSavingDraft}
            >
              Ø­ÙØ¸ ÙˆØ¥ØºÙ„Ø§Ù‚
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Incidents({ incidents, currentUser, onApproveIncident, onDeleteIncident }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Ø§Ù„ÙƒÙ„");
  const deferredQuery = useDeferredValue(query);

  const filteredIncidents = useMemo(() => {
    const visibleIncidents = getVisibleIncidents(incidents, currentUser);
    const normalizedQuery = deferredQuery.trim();

    return visibleIncidents.filter((incident) => {
      const matchesQuery =
        normalizedQuery === "" ||
        incident.id.includes(normalizedQuery) ||
        incident.type.includes(normalizedQuery) ||
        incident.city.includes(normalizedQuery) ||
        String(incident.location || "").includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "Ø§Ù„ÙƒÙ„" || incident.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [deferredQuery, statusFilter]);

  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Ø³Ø¬Ù„ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø§Øª</h2>
            <p className="text-sm text-slate-500">
              Ø¨Ø­Ø« ÙˆÙ…Ø±Ø§Ø¬Ø¹Ø© ÙˆØ§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø§Øª Ø§Ù„Ù…Ø³Ø¬Ù„Ø© Ù„Ù„Ø­Ø¬Ø§Ø¬ ÙˆØ§Ù„Ù…Ø¹ØªÙ…Ø±ÙŠÙ†.
            </p>
          </div>
          <div className="grid w-full gap-3 md:grid-cols-[minmax(0,1fr)_220px] xl:max-w-2xl">
            <div className="relative">
              <Search className="absolute right-4 top-3.5 text-slate-400" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-11 pl-4 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                placeholder="Ø¨Ø­Ø« Ø¨Ø±Ù‚Ù… Ø§Ù„Ø­Ø§Ù„Ø© Ø£Ùˆ Ø§Ù„Ù†ÙˆØ¹ Ø£Ùˆ Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©"
              />
            </div>
            <div className="relative">
              <Filter className="absolute right-4 top-3.5 text-slate-400" size={18} />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pr-11 pl-4 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
              >
                <option>Ø§Ù„ÙƒÙ„</option>
                <option>Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©</option>
                <option>Ù‚ÙŠØ¯ Ø§Ù„Ø§Ø³ØªÙƒÙ…Ø§Ù„</option>
                <option>Ù…ØºÙ„Ù‚</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <span>{filteredIncidents.length} Ù†ØªÙŠØ¬Ø© Ù…Ø·Ø§Ø¨Ù‚Ø©</span>
          <span>Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ« Ù‚Ø¨Ù„ Ù„Ø­Ø¸Ø§Øª</span>
        </div>
        <div className="grid gap-4">
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-5 md:flex-row md:items-center"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                  <FileText size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{incident.id}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {incident.type} - {incident.city} - {incident.time}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      Ø§Ù„Ù…ØµØ¯Ø±: {incident.source}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {incident.patients} Ù…Ø³ØªÙÙŠØ¯
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {incident.severity}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {incident.location}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={incident.status} />
                {hasPermission(currentUser, "incidents:approve") &&
                incident.status !== "Ù…ØºÙ„Ù‚" ? (
                  <Button
                    className="rounded-2xl bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => onApproveIncident(incident.id)}
                  >
                    Ø§Ø¹ØªÙ…Ø§Ø¯
                  </Button>
                ) : null}
                {currentUser?.roleKey === "operations_supervisor" ? (
                  <Button
                    variant="outline"
                    className="rounded-2xl text-red-700"
                    onClick={() => onDeleteIncident(incident.id)}
                  >
                    Ø­Ø°Ù
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
          {filteredIncidents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="font-medium text-slate-700">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†ØªØ§Ø¦Ø¬ Ù…Ø·Ø§Ø¨Ù‚Ø©</p>
              <p className="mt-2 text-sm text-slate-500">
                Ø¬Ø±Ù‘Ø¨ ØªØºÙŠÙŠØ± Ù†Øµ Ø§Ù„Ø¨Ø­Ø« Ø£Ùˆ Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† Ø­Ø§Ù„Ø© Ø§Ù„ÙÙ„ØªØ±Ø©.
              </p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function Reports({ incidents, currentUser, onToast }) {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    city: "Ø§Ù„ÙƒÙ„",
    type: "Ø§Ù„ÙƒÙ„",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const visibleIncidents = useMemo(
    () => getVisibleIncidents(incidents, currentUser),
    [currentUser, incidents],
  );
  const filteredIncidents = useMemo(
    () =>
      visibleIncidents.filter((incident) => {
        const cityMatch = filters.city === "Ø§Ù„ÙƒÙ„" || incident.city === filters.city;
        const typeMatch = filters.type === "Ø§Ù„ÙƒÙ„" || incident.type === filters.type;
        return cityMatch && typeMatch;
      }),
    [filters.city, filters.type, visibleIncidents],
  );

  const updateFilter = (key) => (event) =>
    setFilters((current) => ({ ...current, [key]: event.target.value }));

  const handleGenerate = async () => {
    setIsGenerating(true);
    await wait(1100);
    setIsGenerating(false);
      onToast(
      "success",
      "ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…ÙˆØ³Ù…ÙŠ",
      "Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø¢Ù† ØªØ¹ÙƒØ³ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø§Øª Ø§Ù„Ù…Ø®ØªØ§Ø±Ø© Ù„Ù„Ø­Ø¬Ø§Ø¬ ÙˆØ§Ù„Ù…Ø¹ØªÙ…Ø±ÙŠÙ† Ø¨Ø¯ÙˆÙ† Ø¨ÙŠØ§Ù†Ø§Øª ØªØ¹Ø±ÙŠÙÙŠØ©.",
    );
  };

  const exportCsv = () => {
    if (!hasPermission(currentUser, "reports:export")) {
      onToast("danger", "Ø§Ù„ØªØµØ¯ÙŠØ± ØºÙŠØ± Ù…ØªØ§Ø­", "Ø§Ù„Ø¯ÙˆØ± Ø§Ù„Ø­Ø§Ù„ÙŠ Ù„Ø§ ÙŠÙ…Ù„Ùƒ ØµÙ„Ø§Ø­ÙŠØ© Ø§Ù„ØªØµØ¯ÙŠØ±.");
      return;
    }

    const headers = [
      "id",
      "source",
      "rcNumber",
      "city",
      "location",
      "type",
      "severity",
      "patients",
      "status",
      "createdBy",
      "team",
      "time",
      "notes",
    ];
    const rows = [
      headers.join(","),
      ...filteredIncidents.map((incident) =>
        headers
          .map((key) => String(incident[key] ?? "").replaceAll(",", " "))
          .join(","),
      ),
    ];

    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "hajj-umrah-incidents.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const heatCases = filteredIncidents.filter((incident) =>
    incident.type.includes("Ø­Ø±Ø§Ø±ÙŠ"),
  ).length;
  const redCrescentCases = filteredIncidents.filter((incident) =>
    incident.source.includes("Ø§Ù„Ù‡Ù„Ø§Ù„"),
  ).length;
  const selfDispatchedCases = filteredIncidents.filter((incident) =>
    incident.source.includes("Ù…Ø¨Ø§Ø´Ø±Ø©"),
  ).length;
  const totalPatients = filteredIncidents.reduce(
    (sum, incident) => sum + Number(incident.patients || 0),
    0,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="rounded-3xl border-0 shadow-sm xl:col-span-2">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-slate-900">ØªÙ‚Ø§Ø±ÙŠØ± ÙˆØ¥Ø­ØµØ§Ø¦ÙŠØ§Øª</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ø¬Ù…Ø¹Ø© Ù„Ù…Ø¨Ø§Ø´Ø±Ø§Øª Ø§Ù„Ø­Ø¬ ÙˆØ§Ù„Ø¹Ù…Ø±Ø© Ø¨Ø¯ÙˆÙ† Ø£Ø³Ù…Ø§Ø¡ Ø£Ùˆ Ù‡ÙˆÙŠØ§Øª.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <StatCard
              title="Ø£ÙƒØ«Ø± Ù†ÙˆØ¹ Ù…Ø¨Ø§Ø´Ø±Ø©"
              value="Ø¥Ø¬Ù‡Ø§Ø¯ Ø­Ø±Ø§Ø±ÙŠ"
              icon={Ambulance}
              hint={`${heatCases} Ø­Ø§Ù„Ø§Øª Ø­Ø±Ø§Ø±ÙŠØ© Ø¶Ù…Ù† Ø§Ù„Ù†ØªØ§Ø¦Ø¬ Ø§Ù„Ø­Ø§Ù„ÙŠØ©`}
            />
            <StatCard
              title="Ø¨Ù„Ø§ØºØ§Øª Ø§Ù„Ù‡Ù„Ø§Ù„ Ø§Ù„Ø£Ø­Ù…Ø±"
              value={String(redCrescentCases)}
              icon={HeartPulse}
              hint="Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ù…Ø­Ø§Ù„Ø© Ø±Ø³Ù…ÙŠÙ‹Ø§"
            />
            <StatCard
              title="Ù…Ø¨Ø§Ø´Ø±Ø§Øª Ù…ÙŠØ¯Ø§Ù†ÙŠØ©"
              value={String(selfDispatchedCases)}
              icon={Users}
              hint="Ù…Ù† Ø§Ù„ÙØ±Ù‚ Ø§Ù„Ø±Ø§Ø¬Ù„Ø© ÙˆØ§Ù„Ø«Ø§Ø¨ØªØ©"
            />
            <StatCard
              title="Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ÙŠÙ†"
              value={String(totalPatients)}
              icon={FileText}
              hint="Ø¨Ø¯ÙˆÙ† Ø¨ÙŠØ§Ù†Ø§Øª ØªØ¹Ø±ÙŠÙÙŠØ©"
            />
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-slate-900">Ø§Ù„ÙÙ„Ø§ØªØ±</h2>
          <div className="mt-5 space-y-4">
            <Field
              label="Ù…Ù† ØªØ§Ø±ÙŠØ®"
              type="date"
              value={filters.fromDate}
              onChange={updateFilter("fromDate")}
            />
            <Field
              label="Ø¥Ù„Ù‰ ØªØ§Ø±ÙŠØ®"
              type="date"
              value={filters.toDate}
              onChange={updateFilter("toDate")}
            />
            <SelectField
              label="Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©"
              value={filters.city}
              onChange={updateFilter("city")}
              options={["Ø§Ù„ÙƒÙ„", "Ù…ÙƒØ© Ø§Ù„Ù…ÙƒØ±Ù…Ø©", "Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ø§Ù„Ù…Ù†ÙˆØ±Ø©"]}
            />
            <SelectField
              label="Ù†ÙˆØ¹ Ø§Ù„Ø¨Ù„Ø§Øº"
              value={filters.type}
              onChange={updateFilter("type")}
              options={[
                "Ø§Ù„ÙƒÙ„",
                "Ø¥Ø¬Ù‡Ø§Ø¯ Ø­Ø±Ø§Ø±ÙŠ",
                "Ø¥ØºÙ…Ø§Ø¡",
                "Ø¶ÙŠÙ‚ ØªÙ†ÙØ³",
                "Ø£Ù„Ù… ØµØ¯Ø±",
                "Ø¥Ø¬Ù‡Ø§Ø¯ Ø¹Ø§Ù…",
              ]}
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <LoaderCircle className="mr-2 animate-spin" size={16} />
                  Ø¬Ø§Ø± ØªÙˆÙ„ÙŠØ¯ Ø§Ù„ØªÙ‚Ø±ÙŠØ±
                </>
              ) : (
                "ØªÙˆÙ„ÙŠØ¯ Ø§Ù„ØªÙ‚Ø±ÙŠØ±"
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-2xl"
              onClick={exportCsv}
            >
              ØªØµØ¯ÙŠØ± CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RoleBadge({ roleLabel }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        roleStyles[roleLabel] || "bg-slate-100 text-slate-700"
      }`}
    >
      {roleLabel}
    </span>
  );
}

function AccessDenied({ title, description }) {
  return (
    <Card className="rounded-3xl border-0 shadow-sm">
      <CardContent className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-5 rounded-3xl bg-red-50 p-5 text-red-600">
          <Lock size={42} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function UsersManagement({
  users,
  currentUser,
  departments,
  cities,
  onAddUser,
  onToggleUserStatus,
  onUpdateUserRole,
}) {
  const availableCities = cities.length > 0 ? cities : initialCities;
  const availableDepartments =
    departments.length > 0 ? departments : initialDepartments;
  const [form, setForm] = useState({
    memberId: "",
    name: "",
    phone: "",
    password: "",
    roleKey: "field_responder",
    scope: availableCities[0] || "Ù…ÙƒØ© Ø§Ù„Ù…ÙƒØ±Ù…Ø©",
    team: availableDepartments[0] || "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª",
  });
  const canManageUsers = hasPermission(currentUser, "users:manage");

  const updateField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = () => {
    if (
      !canManageUsers ||
      !form.memberId.trim() ||
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.password.trim()
    ) {
      return;
    }

    onAddUser({
      ...form,
      memberId: form.memberId.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      password: form.password.trim(),
      team: form.team.trim() || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯",
    });

    setForm({
      memberId: "",
      name: "",
      phone: "",
      password: "",
      roleKey: "field_responder",
      scope: availableCities[0] || "Ù…ÙƒØ© Ø§Ù„Ù…ÙƒØ±Ù…Ø©",
      team: availableDepartments[0] || "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª",
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù†Ø´Ø·Ø©</h2>
              <p className="text-sm text-slate-500">
                Ø¥Ø¯Ø§Ø±Ø© Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø© Ø§Ù„Ù…ÙˆØ³Ù…ÙŠØ© ÙˆØªÙˆØ²ÙŠØ¹Ù‡Ø§ Ø­Ø³Ø¨ Ø§Ù„Ø¯ÙˆØ± ÙˆØ§Ù„Ù†Ø·Ø§Ù‚.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {users.length} Ø­Ø³Ø§Ø¨Ø§Øª
            </span>
          </div>

          <div className="grid gap-4">
            {users.map((user) => {
              const role = getRoleByKey(user.roleKey);
              const isCurrent = user.id === currentUser?.id;

              return (
                <div
                  key={user.id}
                  className="rounded-3xl border border-slate-100 bg-white p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-900">{user.name}</p>
                        {isCurrent ? (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                            Ø§Ù„Ø¬Ù„Ø³Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ©
                          </span>
                        ) : null}
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            user.status === "Ù†Ø´Ø·"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {user.phone} Â· Ø±Ù‚Ù… Ø§Ù„Ø¹Ø¶ÙˆÙŠØ©: {user.memberId || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <RoleBadge roleLabel={role?.label || user.roleKey} />
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          {user.scope}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          {user.team}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        value={user.roleKey}
                        onChange={(event) =>
                          onUpdateUserRole(user.id, event.target.value)
                        }
                        disabled={!canManageUsers}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-red-400"
                      >
                        {roleTemplates.map((roleOption) => (
                          <option key={roleOption.key} value={roleOption.key}>
                            {roleOption.label}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => onToggleUserStatus(user.id)}
                        disabled={!canManageUsers}
                      >
                        {user.status === "Ù†Ø´Ø·" ? "ØªØ¹Ù„ÙŠÙ‚ Ø§Ù„Ø­Ø³Ø§Ø¨" : "ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-slate-900">Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø¬Ø¯ÙŠØ¯</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ø£Ø¶Ù Ø¹Ø¶ÙˆÙ‹Ø§ Ø¬Ø¯ÙŠØ¯Ù‹Ø§ ÙˆØ­Ø¯Ø¯ Ø¯ÙˆØ±Ù‡ ÙˆÙ†Ø·Ø§Ù‚ Ù…Ø¨Ø§Ø´Ø±ØªÙ‡ Ù„Ù„Ù…ÙˆØ³Ù….
          </p>
          <div className="mt-5 space-y-4">
            <Field
              label="Ø±Ù‚Ù… Ø§Ù„Ø¹Ø¶ÙˆÙŠØ©"
              placeholder="Ù…Ø«Ø§Ù„: 1004"
              value={form.memberId}
              onChange={updateField("memberId")}
            />
            <Field
              label="Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…"
              placeholder="Ù…Ø«Ø§Ù„: Ù…Ø­Ù…Ø¯ Ø§Ù„Ø¹Ù…Ø±ÙŠ"
              value={form.name}
              onChange={updateField("name")}
            />
            <Field
              label="Ø±Ù‚Ù… Ø§Ù„Ø¬ÙˆØ§Ù„"
              placeholder="05xxxxxxxx"
              value={form.phone}
              onChange={updateField("phone")}
            />
            <Field
              label="ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø£ÙˆÙ„ÙŠØ©"
              placeholder="Ø«Ù…Ø§Ù†ÙŠØ© Ø£Ø­Ø±Ù Ø£Ùˆ Ø£ÙƒØ«Ø±"
              type="password"
              value={form.password}
              onChange={updateField("password")}
            />
            <SelectField
              label="Ø§Ù„Ø¯ÙˆØ±"
              value={form.roleKey}
              onChange={updateField("roleKey")}
              options={roleTemplates.map((role) => ({
                value: role.key,
                label: role.label,
              }))}
            />
            <SelectField
              label="Ø§Ù„Ù†Ø·Ø§Ù‚"
              value={form.scope}
              onChange={updateField("scope")}
              options={[
                ...availableCities,
                "Ù…ÙƒØ© Ø§Ù„Ù…ÙƒØ±Ù…Ø© ÙˆØ§Ù„Ù…Ø¯ÙŠÙ†Ø© Ø§Ù„Ù…Ù†ÙˆØ±Ø©",
                "Ø§Ù„Ù…Ø´Ø§Ø¹Ø± Ø§Ù„Ù…Ù‚Ø¯Ø³Ø©",
              ]}
            />
            <SelectField
              label="Ø§Ù„Ù‚Ø³Ù… / Ø§Ù„ÙØ±ÙŠÙ‚"
              value={form.team}
              onChange={updateField("team")}
              options={availableDepartments}
            />
            <Button
              className="w-full rounded-2xl bg-red-600 hover:bg-red-700"
              disabled={!canManageUsers}
              onClick={handleSubmit}
            >
              Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ø­Ø³Ø§Ø¨
            </Button>
            {!canManageUsers ? (
              <p className="text-xs leading-6 text-slate-400">
                Ø§Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ø­Ø§Ù„ÙŠ ÙŠØ³ØªØ·ÙŠØ¹ Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† ÙÙ‚Ø·. ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª ÙŠØªØ·Ù„Ø¨ ØµÙ„Ø§Ø­ÙŠØ©
                Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecurityPermissions({
  currentUser,
  securitySettings,
  onToggleSetting,
  departments,
  cities,
  sites,
  onAddDepartment,
  onDeleteDepartment,
  onAddCity,
  onDeleteCity,
  onAddSite,
  onDeleteSite,
  incidentSequence,
  auditLog,
}) {
  const canManageSecurity = hasPermission(currentUser, "security:manage");
  const currentRole = getRoleByKey(currentUser?.roleKey);
  const [departmentName, setDepartmentName] = useState("");
  const [cityName, setCityName] = useState("");
  const [siteForm, setSiteForm] = useState({
    city: cities[0] || initialCities[0],
    name: "",
  });

  useEffect(() => {
    if (!siteForm.city && cities.length > 0) {
      setSiteForm((current) => ({ ...current, city: cities[0] }));
    }
  }, [cities, siteForm.city]);

  const submitDepartment = () => {
    if (!canManageSecurity || !departmentName.trim()) {
      return;
    }

    onAddDepartment(departmentName.trim());
    setDepartmentName("");
  };

  const submitCity = () => {
    if (!canManageSecurity || !cityName.trim()) {
      return;
    }

    onAddCity(cityName.trim());
    setCityName("");
  };

  const submitSite = () => {
    if (!canManageSecurity || !siteForm.name.trim() || !siteForm.city) {
      return;
    }

    onAddSite({
      city: siteForm.city,
      name: siteForm.name.trim(),
    });
    setSiteForm((current) => ({ ...current, name: "" }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-3">
        <StatCard
          title="Ø§Ù„Ø¯ÙˆØ± Ø§Ù„Ø­Ø§Ù„ÙŠ"
          value={currentRole?.label || "-"}
          icon={ShieldCheck}
          hint="ÙŠØ­Ø¯Ø¯ Ø§Ù„ØµÙØ­Ø§Øª ÙˆØ§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø© ÙÙŠ Ø§Ù„Ø¬Ù„Ø³Ø©"
        />
        <StatCard
          title="Ø¹Ø¯Ø¯ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª"
          value={String(currentRole?.permissions.length || 0)}
          icon={CheckCircle2}
          hint="Ù…Ø±Ø¨ÙˆØ·Ø© Ù…Ø¨Ø§Ø´Ø±Ø© Ø¨Ø§Ù„Ø¯ÙˆØ± Ø§Ù„Ø­Ø§Ù„ÙŠ"
        />
        <StatCard
          title="Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø§Ø­ØªÙØ§Ø¸"
          value={securitySettings.retentionPolicy}
          icon={FileText}
          hint="Ø¹Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆØ³Ù… ÙˆØ³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">Ù…ØµÙÙˆÙØ© Ø§Ù„Ø£Ø¯ÙˆØ§Ø±</h2>
              <p className="text-sm text-slate-500">
                Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„Ù…ÙØ¹Ù„Ø© Ù„ÙƒÙ„ Ø¯ÙˆØ± ØªØ´ØºÙŠÙ„ÙŠ ÙÙŠ Ù…Ù†ØµØ© Ø§Ù„Ø­Ø¬ ÙˆØ§Ù„Ø¹Ù…Ø±Ø©.
              </p>
            </div>
            <div className="grid gap-4">
              {roleTemplates.map((role) => (
                <div
                  key={role.key}
                  className="rounded-3xl border border-slate-100 bg-white p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{role.label}</p>
                        <RoleBadge roleLabel={role.label} />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {role.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {role.permissions.length} ØµÙ„Ø§Ø­ÙŠØ§Øª
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {permissionSections.map((section) => (
                      <div key={section.title} className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm font-medium text-slate-900">
                          {section.title}
                        </p>
                        <div className="mt-3 space-y-2">
                          {section.items.map((permission) => {
                            const enabled = role.permissions.includes(permission.key);

                            return (
                              <div
                                key={permission.key}
                                className={`rounded-2xl px-3 py-2 text-xs ${
                                  enabled
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-white text-slate-400"
                                }`}
                              >
                                {permission.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900">Ø§Ù„Ø³ÙŠØ§Ø³Ø§Øª Ø§Ù„Ù†Ø´Ø·Ø©</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        Ø§Ù„ØªØ­Ù‚Ù‚ Ø§Ù„Ø«Ù†Ø§Ø¦ÙŠ Ù„Ù„Ø¥Ø´Ø±Ø§Ù
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Ù…Ø·Ù„ÙˆØ¨ Ù„Ø­Ø³Ø§Ø¨Ø§Øª Ø§Ù„Ù‚ÙŠØ§Ø¯Ø© ÙˆØ§Ù„Ø¥Ø´Ø±Ø§Ù.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      disabled={!canManageSecurity}
                      onClick={() => onToggleSetting("requireOtpForSupervisors")}
                    >
                      {securitySettings.requireOtpForSupervisors ? "Ù…ÙØ¹Ù„" : "ØºÙŠØ± Ù…ÙØ¹Ù„"}
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">ØªÙ‚ÙŠÙŠØ¯ Ø§Ù„ØªØµØ¯ÙŠØ±</p>
                      <p className="mt-1 text-sm text-slate-500">
                        ÙŠØ³Ù…Ø­ ÙÙ‚Ø· Ù„Ù„Ø£Ø¯ÙˆØ§Ø± Ø§Ù„Ù…Ø®ÙˆÙ„Ø© Ø¨ØªØµØ¯ÙŠØ± Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      disabled={!canManageSecurity}
                      onClick={() => onToggleSetting("restrictExports")}
                    >
                      {securitySettings.restrictExports ? "Ù…Ù‚ÙŠØ¯" : "Ù…ÙØªÙˆØ­"}
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="font-medium text-slate-900">Ù…Ù„Ø®Øµ Ø§Ù„Ø¬Ù„Ø³Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ©</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ø­Ø§Ù„ÙŠ: {currentUser?.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Ø§Ù„Ø¯ÙˆØ±: {currentRole?.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900">Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚</h2>
              <div className="mt-5 space-y-3">
                {auditLog.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-medium text-slate-900">{item.action}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.actor}</p>
                    <p className="mt-2 text-xs text-slate-400">{item.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø£Ù‚Ø³Ø§Ù…</h2>
                <p className="text-sm text-slate-500">
                  Ø§Ù„Ø£Ù‚Ø³Ø§Ù… ÙˆØ§Ù„ÙØ±Ù‚ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…Ø© ÙÙŠ ØªÙˆØ²ÙŠØ¹ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† ÙˆØ§Ù„Ù…Ø¨Ø§Ø´Ø±Ø§Øª.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {departments.length} Ø£Ù‚Ø³Ø§Ù…
              </span>
            </div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={departmentName}
                onChange={(event) => setDepartmentName(event.target.value)}
                placeholder="Ø§Ø³Ù… Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ø¬Ø¯ÙŠØ¯"
                className={baseInputClassName}
                disabled={!canManageSecurity}
              />
              <Button
                className="rounded-2xl bg-red-600 hover:bg-red-700"
                disabled={!canManageSecurity}
                onClick={submitDepartment}
              >
                Ø¥Ø¶Ø§ÙØ© Ù‚Ø³Ù…
              </Button>
            </div>
            <div className="space-y-3">
              {departments.map((department) => (
                <div
                  key={department}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4"
                >
                  <span className="font-medium text-slate-800">{department}</span>
                  <Button
                    variant="outline"
                    className="rounded-2xl text-red-700"
                    disabled={!canManageSecurity}
                    onClick={() => onDeleteDepartment(department)}
                  >
                    Ø­Ø°Ù
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø¯Ù†</h2>
                <p className="text-sm text-slate-500">
                  Ø§Ù„Ù…Ø¯Ù† Ø§Ù„Ù…ÙØ¹Ù„Ø© ÙÙŠ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ ÙˆÙ†Ø·Ø§Ù‚Ø§Øª Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„Ù…ÙŠØ¯Ø§Ù†ÙŠ.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {cities.length} Ù…Ø¯Ù†
              </span>
            </div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={cityName}
                onChange={(event) => setCityName(event.target.value)}
                placeholder="Ø§Ø³Ù… Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©"
                className={baseInputClassName}
                disabled={!canManageSecurity}
              />
              <Button
                className="rounded-2xl bg-red-600 hover:bg-red-700"
                disabled={!canManageSecurity}
                onClick={submitCity}
              >
                Ø¥Ø¶Ø§ÙØ© Ù…Ø¯ÙŠÙ†Ø©
              </Button>
            </div>
            <div className="space-y-3">
              {cities.map((city) => (
                <div
                  key={city}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4"
                >
                  <span className="font-medium text-slate-800">{city}</span>
                  <Button
                    variant="outline"
                    className="rounded-2xl text-red-700"
                    disabled={!canManageSecurity}
                    onClick={() => onDeleteCity(city)}
                  >
                    Ø­Ø°Ù
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…ÙˆØ§Ù‚Ø¹ Ø§Ù„Ù…ÙˆØ³Ù…ÙŠØ©</h2>
                <p className="text-sm text-slate-500">
                  ØªØ±ØªØ¨Ø· ØµÙØ­Ø© Ù…Ø¨Ø§Ø´Ø±Ø© Ø¬Ø¯ÙŠØ¯Ø© Ø¨Ù‡Ø°Ù‡ Ø§Ù„Ù…ÙˆØ§Ù‚Ø¹ Ø­Ø³Ø¨ Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ø§Ù„Ù…Ø®ØªØ§Ø±Ø©.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {sites.length} Ù…ÙˆØ§Ù‚Ø¹
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)_140px]">
              <select
                value={siteForm.city}
                onChange={(event) =>
                  setSiteForm((current) => ({ ...current, city: event.target.value }))
                }
                className={baseInputClassName}
                disabled={!canManageSecurity}
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <input
                value={siteForm.name}
                onChange={(event) =>
                  setSiteForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Ø§Ø³Ù… Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø§Ù„Ù…ÙˆØ³Ù…ÙŠ"
                className={baseInputClassName}
                disabled={!canManageSecurity}
              />
              <Button
                className="rounded-2xl bg-red-600 hover:bg-red-700"
                disabled={!canManageSecurity}
                onClick={submitSite}
              >
                Ø¥Ø¶Ø§ÙØ© Ù…ÙˆÙ‚Ø¹
              </Button>
            </div>
            <div className="mt-5 space-y-3">
              {sites.map((site, index) => (
                <div
                  key={`${site.city}-${site.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">{site.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{site.city}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-2xl text-red-700"
                    disabled={!canManageSecurity}
                    onClick={() => onDeleteSite(index)}
                  >
                    Ø­Ø°Ù
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-slate-900">Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠØ©</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">Ø¢Ø®Ø± ØªØ³Ù„Ø³Ù„ Ù„Ù„Ù…Ø¨Ø§Ø´Ø±Ø§Øª</p>
                <p className="mt-1 text-sm text-slate-500">
                  {incidentSequence}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">Ø¢Ù„ÙŠØ© Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„Ø­Ø§Ù„ÙŠØ©</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© Ù„Ù„Ù…Ø¨Ø§Ø´Ø±Ø§Øª ØªØ³ØªØ®Ø¯Ù… Ù†ÙØ³ Ù…Ø´Ø±ÙˆØ¹Ù†Ø§ Ø§Ù„Ø­Ø§Ù„ÙŠØŒ ÙˆØªØ±Ø¨Ø· Ø§Ù„Ù…Ø¯Ù†
                  ÙˆØ§Ù„Ù…ÙˆØ§Ù‚Ø¹ Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø© Ù‡Ù†Ø§ Ù…Ø¨Ø§Ø´Ø±Ø© Ø¨Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ´ØºÙŠÙ„ÙŠ.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BottomNav({ active, setActive, currentUser }) {
  const mobileItems = navItems
    .slice(0, 4)
    .filter((item) => canAccessPage(currentUser, item.key));

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-4 gap-2">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActive(item.key)}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition ${
                isActive
                  ? "bg-red-50 text-red-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function EmergencyResponderPortal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [active, setActiveState] = useState("dashboard");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState(() =>
    readStorage(STORAGE_KEYS.notifications, initialNotifications),
  );
  const [toasts, setToasts] = useState([]);
  const [users, setUsers] = useState(() => readStorage(STORAGE_KEYS.users, initialUsers));
  const [incidents, setIncidents] = useState(() =>
    readStorage(STORAGE_KEYS.incidents, initialIncidents),
  );
  const [currentUserId, setCurrentUserId] = useState(() =>
    readStorage(STORAGE_KEYS.currentUserId, initialUsers[0]?.id ?? null),
  );
  const [loginUserId, setLoginUserId] = useState(() => {
    const storedCurrentUserId = readStorage(
      STORAGE_KEYS.currentUserId,
      initialUsers[0]?.id ?? null,
    );
    return storedCurrentUserId ? String(storedCurrentUserId) : String(initialUsers[0]?.id ?? "");
  });
  const [loginPin, setLoginPin] = useState("");
  const [auditLog, setAuditLog] = useState(() =>
    readStorage(STORAGE_KEYS.auditLog, initialAuditLog),
  );
  const [securitySettings, setSecuritySettings] = useState(() =>
    readStorage(STORAGE_KEYS.security, defaultSecuritySettings),
  );
  const [departments, setDepartments] = useState(() =>
    readStorage(STORAGE_KEYS.departments, initialDepartments),
  );
  const [cities, setCities] = useState(() => readStorage(STORAGE_KEYS.cities, initialCities));
  const [sites, setSites] = useState(() => readStorage(STORAGE_KEYS.sites, initialSites));
  const [incidentSequence, setIncidentSequence] = useState(() => {
    const storedIncidents = readStorage(STORAGE_KEYS.incidents, initialIncidents);
    return String(
      readStorage(
        STORAGE_KEYS.incidentSequence,
        deriveIncidentSequence(storedIncidents),
      ),
    );
  });

  const pushToast = (tone, title, body) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, tone, title, body }]);
  };

  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId) || null,
    [currentUserId, users],
  );
  const currentRole = getRoleByKey(currentUser?.roleKey);
  const unreadCount = notifications.length;

  useEffect(() => {
    if (toasts.length === 0) {
      return undefined;
    }

    const latestToast = toasts[toasts.length - 1];
    const timeout = window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== latestToast.id));
    }, 2800);

    return () => window.clearTimeout(timeout);
  }, [toasts]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.incidents, JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.auditLog, JSON.stringify(auditLog));
  }, [auditLog]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.security, JSON.stringify(securitySettings));
  }, [securitySettings]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.departments, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.cities, JSON.stringify(cities));
  }, [cities]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.sites, JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEYS.currentUserId,
      JSON.stringify(currentUserId),
    );
  }, [currentUserId]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEYS.incidentSequence,
      JSON.stringify(incidentSequence),
    );
  }, [incidentSequence]);

  useEffect(() => {
    if (!loggedIn) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setIsPageLoading(false);
    }, 320);

    return () => window.clearTimeout(timeout);
  }, [active, loggedIn]);

  useEffect(() => {
    if (loggedIn && !canAccessPage(currentUser, active)) {
      setActiveState("dashboard");
    }
  }, [active, currentUser, loggedIn]);

  useEffect(() => {
    if (!currentUserId && users.length > 0) {
      setCurrentUserId(users[0].id);
      setLoginUserId(String(users[0].id));
    }
  }, [currentUserId, users]);

  const addAuditEntry = (
    action,
    actor = currentUser?.name || "النظام",
    details = "",
  ) => {
    const entry = {
      id: Date.now() + Math.random(),
      action,
      actor,
      details,
      time: new Date().toLocaleString("ar-SA"),
    };

    setAuditLog((current) => [entry, ...current].slice(0, 200));
  };

  const handleLogin = async () => {
    if (loginPin.trim() !== DEMO_PIN) {
      pushToast("danger", "رمز الدخول غير صحيح", "استخدم رمز الدخول التجريبي الصحيح للوصول إلى البوابة.");
      return;
    }

    const selectedUser = users.find((user) => String(user.id) === String(loginUserId));
    if (!selectedUser) {
      pushToast("danger", "تعذر تسجيل الدخول", "اختر حسابًا صالحًا من القائمة.");
      return;
    }

    if (selectedUser.status !== "نشط") {
      pushToast("danger", "الحساب غير نشط", "لا يمكن الدخول بحساب معلق.");
      return;
    }

    setIsLoginLoading(true);
    window.setTimeout(() => {
      setCurrentUserId(selectedUser.id);
      setLoggedIn(true);
      setActiveState("dashboard");
      setLoginPin("");
      setNotificationOpen(false);
      setMobileNavOpen(false);
      addAuditEntry("تسجيل دخول", `${selectedUser.name} - ${getRoleByKey(selectedUser.roleKey)?.label || selectedUser.roleKey}`, "دخول المستخدم إلى البوابة");
      pushToast("success", "تم تسجيل الدخول", `مرحبًا ${selectedUser.name}`);
      setIsLoginLoading(false);
    }, 250);
  };

  const handleLogout = () => {
    if (currentUser) {
      addAuditEntry("تسجيل خروج", currentUser.name, "خروج المستخدم من البوابة");
    }
    setLoggedIn(false);
    setActiveState("dashboard");
    setNotificationOpen(false);
    setMobileNavOpen(false);
    setLoginPin("");
    pushToast("success", "تم تسجيل الخروج", "انتهت الجلسة الحالية بنجاح.");
  };

  const setActive = (next) => {
    if (next === active) {
      setMobileNavOpen(false);
      return;
    }

    if (!canAccessPage(currentUser, next)) {
      setMobileNavOpen(false);
      setNotificationOpen(false);
      pushToast(
        "danger",
        "الوصول غير متاح",
        "الدور الحالي لا يملك الصلاحية المطلوبة لفتح هذه الصفحة.",
      );
      return;
    }

    setIsPageLoading(true);
    setNotificationOpen(false);
    setMobileNavOpen(false);
    startTransition(() => {
      setActiveState(next);
    });
  };

  const addNotification = ({ title, body, time, tone }) => {
    setNotifications((current) => [
      { id: Date.now() + Math.random(), title, body, time, tone },
      ...current,
    ]);
  };

  const handleAddUser = (userInput) => {
    const role = getRoleByKey(userInput.roleKey);
    const newUser = {
      id: Date.now(),
      ...userInput,
      status: "نشط",
    };

    setUsers((current) => [newUser, ...current]);
    addAuditEntry(
      `إنشاء حساب جديد باسم ${newUser.name} بدور ${role?.label || "-"}`,
      currentUser?.name || "النظام",
    );
    pushToast("success", "تم إنشاء الحساب", `أضيف ${newUser.name} إلى قائمة المستخدمين.`);
  };

  const handleToggleUserStatus = (userId) => {
    const targetUser = users.find((user) => user.id === userId);

    if (!targetUser) {
      return;
    }

    const nextStatus = targetUser.status === "نشط" ? "معلق" : "نشط";

    setUsers((current) =>
      current.map((user) =>
        user.id === userId ? { ...user, status: nextStatus } : user,
      ),
    );
    addAuditEntry(
      `${nextStatus === "نشط" ? "تفعيل" : "تعليق"} حساب ${targetUser.name}`,
      currentUser?.name || "النظام",
    );
    pushToast(
      "success",
      "تم تحديث حالة الحساب",
      `الحساب ${targetUser.name} أصبح ${nextStatus}.`,
    );
  };

  const handleUpdateUserRole = (userId, roleKey) => {
    const targetUser = users.find((user) => user.id === userId);
    const role = getRoleByKey(roleKey);

    if (!targetUser || targetUser.roleKey === roleKey) {
      return;
    }

    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, roleKey } : user)),
    );
    addAuditEntry(
      `تعديل دور ${targetUser.name} إلى ${role?.label || roleKey}`,
      currentUser?.name || "النظام",
    );
    pushToast(
      "success",
      "تم تحديث الدور",
      `تم تعيين ${role?.label || roleKey} للمستخدم ${targetUser.name}.`,
    );
  };

  const handleToggleSecuritySetting = (settingKey) => {
    setSecuritySettings((current) => {
      const next = {
        ...current,
        [settingKey]: !current[settingKey],
      };

      const label =
        settingKey === "requireOtpForSupervisors"
          ? "سياسة التحقق الثنائي"
          : "سياسة تقييد التصدير";
      addAuditEntry(
        `${next[settingKey] ? "تفعيل" : "تعطيل"} ${label}`,
        currentUser?.name || "النظام",
      );
      pushToast(
        "success",
        "تم تحديث السياسة",
        `${label} ${next[settingKey] ? "مفعلة" : "معطلة"} الآن.`,
      );

      return next;
    });
  };

  const handleAddDepartment = (name) => {
    if (departments.includes(name)) {
      pushToast("danger", "القسم موجود مسبقًا", `القسم ${name} مسجل بالفعل.`);
      return;
    }

    setDepartments((current) => [...current, name]);
    addAuditEntry(`إضافة قسم جديد باسم ${name}`, currentUser?.name || "النظام");
    pushToast("success", "تمت إضافة القسم", `أضيف القسم ${name} إلى القائمة.`);
  };

  const handleDeleteDepartment = (name) => {
    setDepartments((current) => current.filter((department) => department !== name));
    addAuditEntry(`حذف القسم ${name}`, currentUser?.name || "النظام");
    pushToast("success", "تم حذف القسم", `أزيل القسم ${name} من القائمة.`);
  };

  const handleAddCity = (name) => {
    if (cities.includes(name)) {
      pushToast("danger", "المدينة موجودة مسبقًا", `المدينة ${name} مسجلة بالفعل.`);
      return;
    }

    setCities((current) => [...current, name]);
    addAuditEntry(`إضافة مدينة جديدة باسم ${name}`, currentUser?.name || "النظام");
    pushToast("success", "تمت إضافة المدينة", `أضيفت المدينة ${name} إلى القائمة.`);
  };

  const handleDeleteCity = (name) => {
    setCities((current) => current.filter((city) => city !== name));
    setSites((current) => current.filter((site) => site.city !== name));
    addAuditEntry(`حذف المدينة ${name} ومواقعها المرتبطة`, currentUser?.name || "النظام");
    pushToast("success", "تم حذف المدينة", `أزيلت المدينة ${name} مع مواقعها المرتبطة.`);
  };

  const handleAddSite = ({ city, name }) => {
    const exists = sites.some((site) => site.city === city && site.name === name);
    if (exists) {
      pushToast("danger", "الموقع موجود مسبقًا", `الموقع ${name} مسجل بالفعل في ${city}.`);
      return;
    }

    setSites((current) => [...current, { city, name }]);
    addAuditEntry(`إضافة موقع موسمي ${name} في ${city}`, currentUser?.name || "النظام");
    pushToast("success", "تمت إضافة الموقع", `أضيف الموقع ${name} ضمن ${city}.`);
  };

  const handleDeleteSite = (index) => {
    const site = sites[index];
    if (!site) {
      return;
    }

    setSites((current) => current.filter((_, currentIndex) => currentIndex !== index));
    addAuditEntry(`حذف الموقع الموسمي ${site.name} من ${site.city}`, currentUser?.name || "النظام");
    pushToast("success", "تم حذف الموقع", `أزيل الموقع ${site.name} من ${site.city}.`);
  };

  if (!loggedIn) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        isSubmitting={isLoginLoading}
        users={users}
        selectedUserId={loginUserId}
        onSelectUser={(event) => setLoginUserId(event.target.value)}
        pin={loginPin}
        onPinChange={(event) => setLoginPin(event.target.value)}
      />
    );
  }

  const pages = {
    dashboard: <Dashboard setActive={setActive} incidents={incidents} currentUser={currentUser} />,
    new: (
      <NewIncident
        currentUser={currentUser}
        incidents={incidents}
        cities={cities}
        sites={sites}
        onSaveIncident={(incident) => {
          const nextSequence = Math.max(Number(incidentSequence || 0), deriveIncidentSequence(incidents)) + 1;
          const createdIncident = {
            ...incident,
            id: getNextIncidentNumber(nextSequence),
          };
          setIncidentSequence(String(nextSequence));
          setIncidents((current) => [...current, createdIncident]);
          addAuditEntry(`إنشاء مباشرة ${createdIncident.id} بواسطة ${currentUser.name}`, currentUser.name);
          return createdIncident;
        }}
        onToast={pushToast}
        onNotify={addNotification}
      />
    ),
    incidents: (
      <Incidents
        incidents={incidents}
        currentUser={currentUser}
        onApproveIncident={(incidentId) => {
          setIncidents((current) =>
            current.map((incident) =>
              incident.id === incidentId ? { ...incident, status: "مغلق" } : incident,
            ),
          );
          addAuditEntry(`اعتماد وإغلاق المباشرة ${incidentId}`, currentUser.name);
          pushToast("success", "تم اعتماد الحالة", `أغلقت المباشرة ${incidentId} بنجاح.`);
        }}
        onDeleteIncident={(incidentId) => {
          setIncidents((current) => current.filter((incident) => incident.id !== incidentId));
          addAuditEntry(`حذف المباشرة ${incidentId}`, currentUser.name);
          pushToast("success", "تم حذف المباشرة", `حذفت المباشرة ${incidentId} من السجل.`);
        }}
      />
    ),
    reports: <Reports incidents={incidents} currentUser={currentUser} onToast={pushToast} />,
    users: (
      <UsersManagement
        users={users}
        currentUser={currentUser}
        departments={departments}
        cities={cities}
        onAddUser={handleAddUser}
        onToggleUserStatus={handleToggleUserStatus}
        onUpdateUserRole={handleUpdateUserRole}
      />
    ),
    settings: (
      <SecurityPermissions
        currentUser={currentUser}
        securitySettings={securitySettings}
        onToggleSetting={handleToggleSecuritySetting}
        departments={departments}
        cities={cities}
        sites={sites}
        onAddDepartment={handleAddDepartment}
        onDeleteDepartment={handleDeleteDepartment}
        onAddCity={handleAddCity}
        onDeleteCity={handleDeleteCity}
        onAddSite={handleAddSite}
        onDeleteSite={handleDeleteSite}
        incidentSequence={incidentSequence}
        auditLog={auditLog}
      />
    ),
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <FloatingToasts items={toasts} />
      <div className="flex min-h-screen">
        <Sidebar active={active} setActive={setActive} currentUser={currentUser} />
        <Drawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-red-600 p-3 text-white">
                <HeartPulse size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-900">بوابة المباشرة الموسمية</p>
                <p className="text-xs text-slate-500">تنقل سريع لفرق الحج والعمرة</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="rounded-2xl p-2 text-slate-400"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 rounded-3xl bg-slate-50 p-4">
            <p className="font-medium text-slate-900">{currentUser?.name}</p>
            <p className="mt-1 text-sm text-slate-500">{currentRole?.label}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                <MapPin size={13} className="ml-1 inline" />
                {currentUser?.scope}
              </span>
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                {unreadCount} تنبيهات
              </span>
            </div>
          </div>

          <div className="mt-6">
            <nav className="space-y-2 lg:hidden">
              {navItems
                .filter((item) => canAccessPage(currentUser, item.key))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActive(item.key)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-red-50 text-red-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={19} />
                      {item.label}
                    </button>
                  );
                })}
            </nav>
          </div>
        </Drawer>

        <main className="min-w-0 flex-1 pb-24 lg:pb-0">
          <Header
            active={active}
            setActive={setActive}
            currentUser={currentUser}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            onLogout={handleLogout}
            unreadCount={unreadCount}
            notificationOpen={notificationOpen}
            setNotificationOpen={setNotificationOpen}
            notifications={notifications}
            isPageLoading={isPageLoading}
          />
          <div className="p-4 lg:p-8">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {pages[active]}
            </motion.div>
          </div>
        </main>
      </div>
      <BottomNav active={active} setActive={setActive} currentUser={currentUser} />
    </div>
  );
}
