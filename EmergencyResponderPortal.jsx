import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ClipboardList,
  FileDown,
  Home,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STORAGE_KEYS = {
  users: "hajj_users",
  incidents: "hajj_incidents",
  departments: "enjad_departments",
  cities: "enjad_cities",
  sites: "enjad_sites",
  auditLogs: "enjad_audit_logs",
  incidentSequence: "hajj_incident_sequence",
  currentUserId: "enjad_current_user_id",
};

const DEMO_PIN = "1234";

const PAGE_META = {
  dashboard: {
    label: "الرئيسية",
    subtitle: "متابعة موسم الحج والعمرة",
    icon: Home,
  },
  new: {
    label: "مباشرة بلاغ جديد",
    subtitle: "تسجيل حالة إسعافية جديدة",
    icon: Plus,
  },
  incidents: {
    label: "سجل المباشرات",
    subtitle: "عرض ومتابعة جميع المباشرات حسب الصلاحية",
    icon: ClipboardList,
  },
  reports: {
    label: "إحصائيات الموسم",
    subtitle: "مؤشرات مختصرة وتصدير CSV",
    icon: BarChart3,
  },
  users: {
    label: "المستخدمون والصلاحيات",
    subtitle: "إدارة الحسابات والأدوار التشغيلية",
    icon: Users,
  },
  security: {
    label: "الأمان والصلاحيات",
    subtitle: "إدارة المدن والمواقع وسجل التتبع",
    icon: ShieldCheck,
  },
};

const ROLE_ACCESS = {
  "مسعف ميداني": ["dashboard", "new", "incidents"],
  "قائد فريق": ["dashboard", "new", "incidents", "reports"],
  "مشرف عمليات": ["dashboard", "new", "incidents", "reports", "users"],
  "مسؤول إحصائيات": ["dashboard", "reports"],
  "مدير النظام": ["dashboard", "new", "incidents", "reports", "users", "security"],
};

const DEFAULT_USERS = [
  {
    id: 1,
    name: "فيصل العسيري",
    mobile: "0500000001",
    role: "مسعف ميداني",
    city: "مكة المكرمة",
    team: "فريق الحرم 1",
    status: "نشط",
  },
  {
    id: 2,
    name: "علي المطيري",
    mobile: "0500000002",
    role: "مشرف عمليات",
    city: "الكل",
    team: "العمليات",
    status: "نشط",
  },
  {
    id: 3,
    name: "مدير النظام",
    mobile: "0500000003",
    role: "مدير النظام",
    city: "الكل",
    team: "الإدارة",
    status: "نشط",
  },
];

const DEFAULT_DEPARTMENTS = [
  "العمليات",
  "الإسعاف الميداني",
  "الإحصائيات",
  "إدارة المتطوعين",
  "الدعم اللوجستي",
];

const DEFAULT_CITIES = ["مكة المكرمة", "المدينة المنورة"];

const DEFAULT_SITES = [
  { city: "مكة المكرمة", name: "المسجد الحرام" },
  { city: "مكة المكرمة", name: "منى" },
  { city: "مكة المكرمة", name: "عرفات" },
  { city: "مكة المكرمة", name: "مزدلفة" },
  { city: "المدينة المنورة", name: "المسجد النبوي" },
  { city: "المدينة المنورة", name: "محطة نقل" },
  { city: "المدينة المنورة", name: "سكن الحجاج" },
];

const DEFAULT_INCIDENTS = [
  {
    id: "HAJJ-1447-001",
    source: "بلاغ محال من الهلال الأحمر",
    rc: "997-12345",
    city: "مكة المكرمة",
    location: "المسجد الحرام - ساحة الحرم",
    type: "إجهاد حراري",
    severity: "متوسط",
    patientCount: 1,
    category: "حاج",
    intervention: "تبريد/كمادات",
    handover: "تسليم للهلال الأحمر",
    status: "قيد المراجعة",
    createdBy: "فيصل العسيري",
    team: "فريق الحرم 1",
    time: "10:42",
    notes: "تم التبريد وتسليم الحالة للهلال الأحمر",
  },
  {
    id: "HAJJ-1447-002",
    source: "مباشرة ذاتية من الفريق",
    rc: "",
    city: "المدينة المنورة",
    location: "المسجد النبوي - باب السلام",
    type: "إغماء",
    severity: "بسيط",
    patientCount: 1,
    category: "زائر",
    intervention: "تقييم أولي",
    handover: "علاج بالموقع",
    status: "مغلق",
    createdBy: "علي المطيري",
    team: "فريق النبوي 1",
    time: "09:15",
    notes: "علاج بالموقع",
  },
];

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function syncIncidentSequence(incidents) {
  const maxExisting = incidents
    .map((incident) => {
      const match = String(incident.id || "").match(/HAJJ-1447-(\d+)/);
      return match ? Number(match[1]) : 0;
    })
    .reduce((max, current) => Math.max(max, current), 0);

  const saved = Number(localStorage.getItem(STORAGE_KEYS.incidentSequence) || "0");
  if (maxExisting > saved) {
    localStorage.setItem(STORAGE_KEYS.incidentSequence, String(maxExisting));
  }
}

function getNextIncidentNumber() {
  const current = Number(localStorage.getItem(STORAGE_KEYS.incidentSequence) || "0") + 1;
  localStorage.setItem(STORAGE_KEYS.incidentSequence, String(current));
  return `HAJJ-1447-${String(current).padStart(4, "0")}`;
}

function createAuditEntry(currentUser, action, details) {
  return {
    time: new Date().toLocaleString("ar-SA"),
    user: currentUser ? `${currentUser.name} - ${currentUser.role}` : "النظام",
    action,
    details,
  };
}

function allowedPages(role) {
  return ROLE_ACCESS[role] || [];
}

function canAccess(role, page) {
  return allowedPages(role).includes(page);
}

function visibleIncidents(currentUser, incidents) {
  if (!currentUser) return [];
  if (["مشرف عمليات", "مدير النظام", "مسؤول إحصائيات"].includes(currentUser.role)) {
    return incidents;
  }
  if (currentUser.role === "قائد فريق") {
    return incidents.filter(
      (incident) => incident.team === currentUser.team || incident.city === currentUser.city,
    );
  }
  return incidents.filter((incident) => incident.createdBy === currentUser.name);
}

function statusBadgeClass(status) {
  if (status === "مغلق") return "bg-emerald-100 text-emerald-700";
  if (status === "قيد المراجعة") return "bg-amber-100 text-amber-700";
  if (status === "مسودة") return "bg-slate-100 text-slate-700";
  return "bg-sky-100 text-sky-700";
}

function severityBadgeClass(severity) {
  if (severity === "حرج" || severity === "وفاة") return "bg-red-100 text-red-700";
  if (severity === "متوسط") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

function exportIncidentsCsv(incidents) {
  const headers = [
    "id",
    "source",
    "rc",
    "city",
    "location",
    "type",
    "severity",
    "patientCount",
    "category",
    "intervention",
    "handover",
    "status",
    "createdBy",
    "team",
    "time",
    "notes",
  ];

  const rows = [
    headers,
    ...incidents.map((incident) =>
      headers.map((key) => String(incident[key] ?? "").replaceAll(",", " ")),
    ),
  ];

  const csv = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "hajj_incidents.csv";
  link.click();
}

function HeroLogo() {
  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/95 text-3xl shadow-lg">
      🚑
    </div>
  );
}

function LoginScreen({
  users,
  selectedUserId,
  onSelectUser,
  pin,
  onPinChange,
  onLogin,
}) {
  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="hidden bg-[linear-gradient(135deg,#991b1b,#450a0a,#020617)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="space-y-6">
          <HeroLogo />
          <div className="space-y-3">
            <h1 className="text-4xl font-black leading-snug">
              جمعية إنجاد للبحث والإنقاذ
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-200">
              بوابة مباشرة الحالات الإسعافية للحجاج والمعتمرين في مكة المكرمة والمدينة
              المنورة، مع إدارة صلاحيات وسجل متابعة محلي جاهز للعرض والرفع.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-sm leading-7 text-slate-100 backdrop-blur">
          <p>نسخة تشغيلية أولية لتجربة الواجهة والصلاحيات قبل الربط بأي قاعدة بيانات.</p>
          <p className="mt-2">رمز الدخول التجريبي لجميع الحسابات: 1234</p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 lg:p-10">
        <Card className="w-full max-w-xl rounded-[28px] border-slate-200 shadow-xl shadow-slate-200/70">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-2 text-right">
              <p className="text-sm font-semibold text-sky-600">بوابة مباشرة الحالات</p>
              <h2 className="text-3xl font-black text-slate-900">تسجيل الدخول</h2>
              <p className="text-sm leading-7 text-slate-500">
                اختر حسابًا تجريبيًا للدخول حسب الدور التشغيلي. هذه النسخة تعمل محليًا
                بدون ربط خارجي.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">
                المستخدم التجريبي
                <select
                  value={selectedUserId}
                  onChange={(event) => onSelectUser(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-300"
                >
                  {users
                    .filter((user) => user.status === "نشط")
                    .map((user) => (
                      <option key={user.id} value={String(user.id)}>
                        {user.name} — {user.role} — {user.city}
                      </option>
                    ))}
                </select>
              </label>

              <label className="block text-sm font-bold text-slate-700">
                رمز الدخول التجريبي
                <input
                  type="password"
                  value={pin}
                  onChange={(event) => onPinChange(event.target.value)}
                  placeholder="1234"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-300"
                />
              </label>
            </div>

            <Button className="w-full bg-red-600 hover:bg-red-500" onClick={onLogin}>
              دخول
            </Button>

            <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-amber-800">
              إذا ظهرت لك بيانات قديمة غير مرغوبة، ادخل بحساب مدير النظام ثم استخدم خيار
              “مسح البيانات التجريبية” من صفحة الأمان والصلاحيات.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Sidebar({ currentUser, activePage, onNavigate, onLogout, mobileOpen, onCloseMobile }) {
  const items = allowedPages(currentUser.role);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/35 transition lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseMobile}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-80 border-l border-slate-200 bg-white p-5 transition lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="mb-6 flex items-start justify-between lg:hidden">
          <div className="text-right">
            <p className="text-sm font-semibold text-red-600">جمعية إنجاد</p>
            <p className="text-xs text-slate-500">بوابة مباشرة الحالات</p>
          </div>
          <button
            className="rounded-xl border border-slate-200 p-2 text-slate-500"
            onClick={onCloseMobile}
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-[28px] bg-slate-950 p-5 text-white">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl">
              🚑
            </div>
            <div className="text-right">
              <h2 className="font-black">جمعية إنجاد</h2>
              <p className="text-xs text-slate-300">بوابة مباشرة الحالات الإسعافية</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 text-right">
            <p className="font-bold">{currentUser.name}</p>
            <p className="mt-1 text-sm text-slate-300">{currentUser.role}</p>
            <p className="mt-1 text-xs text-slate-400">
              {currentUser.city} — {currentUser.team}
            </p>
          </div>

          <Button
            variant="outline"
            className="mt-4 w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
            onClick={onLogout}
          >
            <LogOut size={16} />
            تسجيل خروج
          </Button>
        </div>

        <nav className="mt-6 space-y-2">
          {items.map((key) => {
            const meta = PAGE_META[key];
            const Icon = meta.icon;
            const isActive = activePage === key;
            return (
              <button
                key={key}
                onClick={() => {
                  onNavigate(key);
                  onCloseMobile();
                }}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-right transition ${
                  isActive
                    ? "bg-red-50 text-red-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="font-semibold">{meta.label}</span>
                <Icon size={18} />
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

function Header({ currentUser, activePage, onQuickNew, onOpenMenu }) {
  const meta = PAGE_META[activePage];
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 lg:hidden">
          <button className="rounded-xl border border-slate-200 p-2" onClick={onOpenMenu}>
            <Menu size={18} />
          </button>
        </div>

        <div className="flex-1 text-right">
          <h1 className="text-2xl font-black text-slate-900">{meta.label}</h1>
          <p className="text-sm text-slate-500">{meta.subtitle}</p>
        </div>

        {canAccess(currentUser.role, "new") ? (
          <Button className="bg-red-600 hover:bg-red-500" onClick={onQuickNew}>
            <Plus size={16} />
            مباشرة بلاغ جديد
          </Button>
        ) : null}
      </div>
    </header>
  );
}

function SectionCard({ title, subtitle, children, action }) {
  return (
    <Card className="rounded-[26px] shadow-sm">
      <CardContent className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          {action || <span />}
          <div className="text-right">
            <h3 className="text-lg font-black text-slate-900">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function DashboardPage({ incidents }) {
  const totalPatients = incidents.reduce(
    (sum, incident) => sum + Number(incident.patientCount || 0),
    0,
  );
  const closed = incidents.filter((incident) => incident.status === "مغلق").length;
  const redCrescent = incidents.filter((incident) =>
    incident.source.includes("الهلال الأحمر"),
  ).length;
  const critical = incidents.filter((incident) => incident.severity === "حرج").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="مباشرات اليوم" value={incidents.length} note="حسب صلاحية المستخدم" />
        <StatCard title="عدد الحالات" value={totalPatients} note={`${critical} حالات حرجة`} />
        <StatCard title="بلاغات الهلال الأحمر" value={redCrescent} note="محالة رسميًا" />
        <StatCard title="مباشرات مغلقة" value={closed} note={`${incidents.length - closed} قيد المتابعة`} />
      </div>

      <SectionCard title="آخر المباشرات" subtitle="يعرض آخر الحالات المسجلة ضمن نطاق صلاحيتك">
        <div className="overflow-x-auto">
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="rounded-r-2xl px-4 py-3">رقم المباشرة</th>
                <th className="px-4 py-3">المصدر</th>
                <th className="px-4 py-3">المدينة</th>
                <th className="px-4 py-3">الموقع</th>
                <th className="rounded-l-2xl px-4 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {incidents
                .slice()
                .reverse()
                .map((incident) => (
                  <tr key={incident.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-4 font-bold text-slate-800">{incident.id}</td>
                    <td className="px-4 py-4 text-slate-600">{incident.source}</td>
                    <td className="px-4 py-4 text-slate-600">{incident.city}</td>
                    <td className="px-4 py-4 text-slate-600">{incident.location}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass(
                          incident.status,
                        )}`}
                      >
                        {incident.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function StatCard({ title, value, note }) {
  return (
    <Card className="rounded-[26px] border-slate-200">
      <CardContent className="p-6 text-right">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <p className="mt-3 text-4xl font-black text-slate-900">{value}</p>
        <p className="mt-2 text-xs text-slate-500">{note}</p>
      </CardContent>
    </Card>
  );
}

function NewIncidentPage({ cities, sites, currentUser, onSave, onCancel }) {
  const defaultCity =
    currentUser.city && currentUser.city !== "الكل" && cities.includes(currentUser.city)
      ? currentUser.city
      : cities[0] || "";

  const [form, setForm] = useState({
    source: "مباشرة ذاتية من الفريق",
    rc: "",
    city: defaultCity,
    seasonLocation: "",
    location: "",
    time: "",
    type: "إجهاد حراري",
    severity: "بسيط",
    patientCount: 1,
    category: "حاج",
    intervention: "تقييم أولي",
    handover: "علاج بالموقع",
    notes: "",
  });

  const citySites = useMemo(
    () => sites.filter((site) => site.city === form.city),
    [sites, form.city],
  );

  useEffect(() => {
    setForm((current) => ({
      ...current,
      seasonLocation: citySites[0]?.name || "",
    }));
  }, [form.city, citySites]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <SectionCard
      title="تسجيل مباشرة حالة إسعافية"
      subtitle="للحجاج والمعتمرين في مكة المكرمة والمدينة المنورة بدون إدخال بيانات شخصية غير لازمة"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="مصدر البلاغ">
          <select
            value={form.source}
            onChange={(event) => updateField("source", event.target.value)}
            className={inputClass}
          >
            <option>مباشرة ذاتية من الفريق</option>
            <option>بلاغ محال من الهلال الأحمر</option>
            <option>نقطة فرز/مركز تطوعي</option>
            <option>جهة تنظيمية</option>
          </select>
        </Field>

        {form.source.includes("الهلال") ? (
          <Field label="رقم بلاغ الهلال الأحمر">
            <input
              value={form.rc}
              onChange={(event) => updateField("rc", event.target.value)}
              placeholder="997-12345"
              className={inputClass}
            />
          </Field>
        ) : null}

        <Field label="المدينة">
          <select
            value={form.city}
            onChange={(event) => updateField("city", event.target.value)}
            className={inputClass}
          >
            {cities.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </Field>

        <Field label="الموقع الموسمي">
          <select
            value={form.seasonLocation}
            onChange={(event) => updateField("seasonLocation", event.target.value)}
            className={inputClass}
          >
            {citySites.map((site) => (
              <option key={`${site.city}-${site.name}`}>{site.name}</option>
            ))}
          </select>
        </Field>

        <Field label="وصف الموقع أو الإحداثيات">
          <input
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="مثال: الساحة الشرقية / باب الملك عبدالعزيز"
            className={inputClass}
          />
        </Field>

        <Field label="وقت المباشرة">
          <input
            type="time"
            value={form.time}
            onChange={(event) => updateField("time", event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="نوع الحالة">
          <select
            value={form.type}
            onChange={(event) => updateField("type", event.target.value)}
            className={inputClass}
          >
            {[
              "إجهاد حراري",
              "ضربة حرارية",
              "إغماء",
              "ضيق تنفس",
              "ألم صدر",
              "هبوط سكر",
              "ارتفاع ضغط",
              "إصابة قدم/إجهاد مشي",
              "سقوط",
              "نزيف",
              "أخرى",
            ].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>

        <Field label="درجة الحالة">
          <select
            value={form.severity}
            onChange={(event) => updateField("severity", event.target.value)}
            className={inputClass}
          >
            {["بسيط", "متوسط", "حرج", "وفاة"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>

        <Field label="عدد الحجاج/المعتمرين">
          <input
            type="number"
            min="1"
            value={form.patientCount}
            onChange={(event) => updateField("patientCount", Number(event.target.value || 1))}
            className={inputClass}
          />
        </Field>

        <Field label="الفئة">
          <select
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            className={inputClass}
          >
            {["حاج", "معتمر", "زائر", "عامل/منظم", "غير معروف"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>

        <Field label="الإجراء الإسعافي">
          <select
            value={form.intervention}
            onChange={(event) => updateField("intervention", event.target.value)}
            className={inputClass}
          >
            {[
              "تقييم أولي",
              "تبريد/كمادات",
              "سوائل فموية",
              "أكسجين",
              "إيقاف نزيف",
              "تضميد",
              "CPR",
              "قياس سكر",
              "أخرى",
            ].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>

        <Field label="النقل أو التسليم">
          <select
            value={form.handover}
            onChange={(event) => updateField("handover", event.target.value)}
            className={inputClass}
          >
            {[
              "علاج بالموقع",
              "تسليم للهلال الأحمر",
              "نقل بواسطة الهلال الأحمر",
              "نقل لمركز صحي/طبي",
              "رفض النقل",
              "تسليم لجهة تنظيمية",
            ].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="ملاحظات مختصرة" className="mt-4">
        <textarea
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="اكتب وصفًا مختصرًا بدون بيانات شخصية غير لازمة"
          className={`${inputClass} min-h-28 resize-y`}
        />
      </Field>

      <div className="mt-6 flex flex-wrap justify-start gap-3">
        <Button variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button variant="outline" onClick={() => onSave(form, "مسودة")}>
          حفظ كمسودة
        </Button>
        <Button className="bg-red-600 hover:bg-red-500" onClick={() => onSave(form, "قيد المراجعة")}>
          إرسال للمراجعة
        </Button>
        {["قائد فريق", "مشرف عمليات", "مدير النظام"].includes(currentUser.role) ? (
          <Button
            className="bg-emerald-600 hover:bg-emerald-500"
            onClick={() => onSave(form, "مغلق")}
          >
            حفظ وإغلاق
          </Button>
        ) : null}
      </div>
    </SectionCard>
  );
}

function IncidentsPage({ incidents, currentUser, onApprove, onDelete }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim();
    if (!normalized) return incidents;
    return incidents.filter((incident) =>
      Object.values(incident).join(" ").toLowerCase().includes(normalized.toLowerCase()),
    );
  }, [incidents, query]);

  return (
    <SectionCard
      title="سجل المباشرات"
      subtitle="المعروض هنا يعتمد على دورك وصلاحيتك"
      action={
        <div className="relative min-w-[280px]">
          <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="بحث برقم المباشرة أو المدينة أو نوع الحالة"
            className={`${inputClass} pr-9`}
          />
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-right text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              {[
                "رقم المباشرة",
                "المصدر",
                "المدينة",
                "نوع الحالة",
                "الموقع",
                "الفريق",
                "الحالة",
                "الإجراء",
              ].map((header, index) => (
                <th
                  key={header}
                  className={`px-4 py-3 ${index === 0 ? "rounded-r-2xl" : ""} ${
                    index === 7 ? "rounded-l-2xl" : ""
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered
              .slice()
              .reverse()
              .map((incident) => (
                <tr key={incident.id} className="border-b border-slate-100 align-top last:border-b-0">
                  <td className="px-4 py-4 font-bold text-slate-800">
                    {incident.id}
                    <p className="mt-1 text-xs font-medium text-slate-500">{incident.time}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {incident.source}
                    <p className="mt-1 text-xs text-slate-400">
                      {incident.rc || "لا يوجد رقم هلال"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{incident.city}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {incident.type}
                    <div className="mt-2 flex justify-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${severityBadgeClass(
                          incident.severity,
                        )}`}
                      >
                        {incident.severity}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {incident.patientCount} حالة
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{incident.location}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {incident.team}
                    <p className="mt-1 text-xs text-slate-400">{incident.createdBy}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass(
                        incident.status,
                      )}`}
                    >
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      {["قائد فريق", "مشرف عمليات", "مدير النظام"].includes(
                        currentUser.role,
                      ) && incident.status !== "مغلق" ? (
                        <Button
                          className="bg-emerald-600 px-3 py-2 text-xs hover:bg-emerald-500"
                          onClick={() => onApprove(incident.id)}
                        >
                          اعتماد
                        </Button>
                      ) : null}

                      {["مشرف عمليات", "مدير النظام"].includes(currentUser.role) ? (
                        <Button
                          className="bg-red-600 px-3 py-2 text-xs hover:bg-red-500"
                          onClick={() => onDelete(incident.id)}
                        >
                          حذف
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function ReportsPage({ incidents, currentUser }) {
  const heat = incidents.filter((incident) => incident.type.includes("حراري")).length;
  const byCity = DEFAULT_CITIES.map((city) => ({
    city,
    count: incidents.filter((incident) => incident.city === city).length,
  }));
  const redCrescent = incidents.filter((incident) => incident.source === "بلاغ محال من الهلال الأحمر").length;
  const selfResponses = incidents.filter((incident) => incident.source === "مباشرة ذاتية من الفريق").length;
  const totalPatients = incidents.reduce((sum, incident) => sum + Number(incident.patientCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="إجهاد/ضربات حرارية" value={heat} note="مؤشر مهم للموسم" />
        <StatCard title="بلاغات الهلال الأحمر" value={redCrescent} note="محالة رسميًا" />
        <StatCard title="مباشرات ذاتية" value={selfResponses} note="من الفرق الميدانية" />
        <StatCard title="إجمالي الحالات" value={totalPatients} note="بدون بيانات تعريفية" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <SectionCard title="توزيع حسب المدينة" subtitle="ملخص سريع للحالات حسب المدينة">
          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="rounded-r-2xl px-4 py-3">المدينة</th>
                  <th className="rounded-l-2xl px-4 py-3">العدد</th>
                </tr>
              </thead>
              <tbody>
                {byCity.map((row) => (
                  <tr key={row.city} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-4 text-slate-700">{row.city}</td>
                    <td className="px-4 py-4 font-bold text-slate-900">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="تصدير"
          subtitle="التصدير هنا تجريبي بصيغة CSV"
          action={
            currentUser.role === "مسعف ميداني" ? null : (
              <Button onClick={() => exportIncidentsCsv(incidents)}>
                <FileDown size={16} />
                تصدير CSV
              </Button>
            )
          }
        >
          <div className="space-y-3 text-sm leading-7 text-slate-600">
            <p>يمكن للمشرفين ومدير النظام ومسؤول الإحصائيات تصدير السجل الحالي حسب الصلاحية.</p>
            <p>الملف الناتج مناسب للفرز والتحليل الأولي ومشاركته داخليًا.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function UsersPage({ users, cities, departments, onAddUser }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    role: "مسعف ميداني",
    city: cities[0] || "",
    team: departments[0] || "",
  });

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <SectionCard title="المستخدمون" subtitle="المستخدمون الافتراضيون المحفوظون محليًا">
        <div className="overflow-x-auto">
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                {["الاسم", "الجوال", "الدور", "المدينة", "الفريق", "الحالة"].map((header, index) => (
                  <th
                    key={header}
                    className={`px-4 py-3 ${index === 0 ? "rounded-r-2xl" : ""} ${
                      index === 5 ? "rounded-l-2xl" : ""
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-4 font-semibold text-slate-800">{user.name}</td>
                  <td className="px-4 py-4 text-slate-600">{user.mobile}</td>
                  <td className="px-4 py-4 text-slate-600">{user.role}</td>
                  <td className="px-4 py-4 text-slate-600">{user.city}</td>
                  <td className="px-4 py-4 text-slate-600">{user.team}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="إضافة مستخدم" subtitle="إضافة حساب محلي جديد للتجربة">
        <div className="space-y-4">
          <Field label="الاسم">
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="اسم المستخدم"
              className={inputClass}
            />
          </Field>
          <Field label="الجوال">
            <input
              value={form.mobile}
              onChange={(event) => updateField("mobile", event.target.value)}
              placeholder="05xxxxxxxx"
              className={inputClass}
            />
          </Field>
          <Field label="الدور">
            <select
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
              className={inputClass}
            >
              {Object.keys(ROLE_ACCESS).map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </Field>
          <Field label="المدينة">
            <select
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
              className={inputClass}
            >
              {[...cities, "الكل"].map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
          </Field>
          <Field label="القسم">
            <select
              value={form.team}
              onChange={(event) => updateField("team", event.target.value)}
              className={inputClass}
            >
              {departments.map((department) => (
                <option key={department}>{department}</option>
              ))}
            </select>
          </Field>

          <Button
            className="w-full bg-red-600 hover:bg-red-500"
            onClick={() => {
              onAddUser(form);
              setForm({
                name: "",
                mobile: "",
                role: "مسعف ميداني",
                city: cities[0] || "",
                team: departments[0] || "",
              });
            }}
          >
            حفظ المستخدم
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function SecurityPage({
  departments,
  cities,
  sites,
  auditLogs,
  incidentSequence,
  onAddDepartment,
  onDeleteDepartment,
  onAddCity,
  onDeleteCity,
  onAddSite,
  onDeleteSite,
  onResetData,
}) {
  const [departmentName, setDepartmentName] = useState("");
  const [cityName, setCityName] = useState("");
  const [siteCity, setSiteCity] = useState(cities[0] || "");
  const [siteName, setSiteName] = useState("");

  useEffect(() => {
    if (!cities.includes(siteCity)) {
      setSiteCity(cities[0] || "");
    }
  }, [cities, siteCity]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="سياسات الأمان" subtitle="ملخص سريع للصلاحيات الحالية">
          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="rounded-r-2xl px-4 py-3">السياسة</th>
                  <th className="rounded-l-2xl px-4 py-3">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["رمز دخول PIN", "مفعل تجريبيًا"],
                  ["تقييد الصفحات حسب الدور", "مفعل"],
                  ["تقييد عرض المباشرات حسب المستخدم/الفريق", "مفعل"],
                  ["إدارة الأقسام", "مدير النظام فقط"],
                  ["إدارة المدن والمواقع", "مدير النظام فقط"],
                  ["سجل تتبع الحسابات", "مفعل"],
                  ["الحذف", "للمشرف ومدير النظام فقط"],
                ].map(([policy, status]) => (
                  <tr key={policy} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-4 text-slate-700">{policy}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="إدارة البيانات التجريبية" subtitle="يمسح البيانات المحفوظة محليًا في المتصفح فقط">
          <div className="space-y-4 text-right">
            <p className="text-sm text-slate-600">
              آخر رقم تسلسلي محفوظ: <span className="font-black text-slate-900">{incidentSequence}</span>
            </p>
            <Button className="bg-red-600 hover:bg-red-500" onClick={onResetData}>
              مسح البيانات التجريبية
            </Button>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="إدارة الأقسام" subtitle="إضافة أو حذف الأقسام المرتبطة بالمستخدمين">
          <div className="mb-4 flex flex-wrap gap-3">
            <input
              value={departmentName}
              onChange={(event) => setDepartmentName(event.target.value)}
              placeholder="اسم القسم الجديد"
              className={`${inputClass} min-w-[240px] flex-1`}
            />
            <Button
              onClick={() => {
                onAddDepartment(departmentName);
                setDepartmentName("");
              }}
            >
              إضافة قسم
            </Button>
          </div>
          <SimpleList
            rows={departments.map((department) => ({
              primary: department,
              action: (
                <Button
                  className="bg-red-600 px-3 py-2 text-xs hover:bg-red-500"
                  onClick={() => onDeleteDepartment(department)}
                >
                  حذف
                </Button>
              ),
            }))}
          />
        </SectionCard>

        <SectionCard title="إدارة المدن" subtitle="إضافة أو حذف المدن المفعلة في البوابة">
          <div className="mb-4 flex flex-wrap gap-3">
            <input
              value={cityName}
              onChange={(event) => setCityName(event.target.value)}
              placeholder="اسم المدينة"
              className={`${inputClass} min-w-[240px] flex-1`}
            />
            <Button
              onClick={() => {
                onAddCity(cityName);
                setCityName("");
              }}
            >
              إضافة مدينة
            </Button>
          </div>
          <SimpleList
            rows={cities.map((city) => ({
              primary: city,
              action: (
                <Button
                  className="bg-red-600 px-3 py-2 text-xs hover:bg-red-500"
                  onClick={() => onDeleteCity(city)}
                >
                  حذف
                </Button>
              ),
            }))}
          />
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <SectionCard title="إدارة المواقع" subtitle="إضافة أو حذف المواقع داخل كل مدينة">
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <Field label="المدينة">
              <select
                value={siteCity}
                onChange={(event) => setSiteCity(event.target.value)}
                className={inputClass}
              >
                {cities.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </Field>
            <Field label="اسم الموقع">
              <input
                value={siteName}
                onChange={(event) => setSiteName(event.target.value)}
                placeholder="مثال: باب الملك عبدالعزيز"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mb-4">
            <Button
              onClick={() => {
                onAddSite(siteCity, siteName);
                setSiteName("");
              }}
            >
              إضافة موقع
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="rounded-r-2xl px-4 py-3">المدينة</th>
                  <th className="px-4 py-3">الموقع</th>
                  <th className="rounded-l-2xl px-4 py-3">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site, index) => (
                  <tr key={`${site.city}-${site.name}-${index}`} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-4 text-slate-700">{site.city}</td>
                    <td className="px-4 py-4 text-slate-700">{site.name}</td>
                    <td className="px-4 py-4">
                      <Button
                        className="bg-red-600 px-3 py-2 text-xs hover:bg-red-500"
                        onClick={() => onDeleteSite(index)}
                      >
                        حذف
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="سجل تتبع الحسابات" subtitle="آخر 40 عملية محلية">
          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="rounded-r-2xl px-4 py-3">الوقت</th>
                  <th className="px-4 py-3">المستخدم</th>
                  <th className="px-4 py-3">العملية</th>
                  <th className="rounded-l-2xl px-4 py-3">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length ? (
                  auditLogs.slice(0, 40).map((log, index) => (
                    <tr key={`${log.time}-${index}`} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-4 text-slate-600">{log.time}</td>
                      <td className="px-4 py-4 text-slate-600">{log.user}</td>
                      <td className="px-4 py-4 font-semibold text-slate-800">{log.action}</td>
                      <td className="px-4 py-4 text-slate-600">{log.details}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                      لا يوجد سجل حتى الآن
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function SimpleList({ rows }) {
  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div
          key={`${row.primary}-${index}`}
          className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
        >
          {row.action || <span />}
          <div className="text-right">
            <p className="font-semibold text-slate-800">{row.primary}</p>
            {row.secondary ? <p className="text-xs text-slate-500">{row.secondary}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block text-right text-sm font-bold text-slate-700 ${className}`}>
      <span>{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-300";

export default function EmergencyResponderPortal() {
  const [users, setUsers] = useState(() => readStorage(STORAGE_KEYS.users, DEFAULT_USERS));
  const [incidents, setIncidents] = useState(() =>
    readStorage(STORAGE_KEYS.incidents, DEFAULT_INCIDENTS),
  );
  const [departments, setDepartments] = useState(() =>
    readStorage(STORAGE_KEYS.departments, DEFAULT_DEPARTMENTS),
  );
  const [cities, setCities] = useState(() => readStorage(STORAGE_KEYS.cities, DEFAULT_CITIES));
  const [sites, setSites] = useState(() => readStorage(STORAGE_KEYS.sites, DEFAULT_SITES));
  const [auditLogs, setAuditLogs] = useState(() =>
    readStorage(STORAGE_KEYS.auditLogs, []),
  );

  const [selectedUserId, setSelectedUserId] = useState(() =>
    String(readStorage(STORAGE_KEYS.currentUserId, DEFAULT_USERS[0]?.id ?? "")),
  );
  const [pin, setPin] = useState(DEMO_PIN);
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.users, users);
  }, [users]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.incidents, incidents);
    syncIncidentSequence(incidents);
  }, [incidents]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.departments, departments);
  }, [departments]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.cities, cities);
  }, [cities]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.sites, sites);
  }, [sites]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.auditLogs, auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.currentUserId, String(currentUser.id));
    }
  }, [currentUser]);

  const scopedIncidents = useMemo(
    () => visibleIncidents(currentUser, incidents),
    [currentUser, incidents],
  );

  const incidentSequence = localStorage.getItem(STORAGE_KEYS.incidentSequence) || "0";

  function pushAudit(action, details, actor = currentUser) {
    setAuditLogs((current) => [createAuditEntry(actor, action, details), ...current].slice(0, 200));
  }

  function handleLogin() {
    if (pin.trim() !== DEMO_PIN) {
      alert("رمز الدخول غير صحيح");
      return;
    }
    const user = users.find((entry) => String(entry.id) === String(selectedUserId));
    if (!user) {
      alert("لم يتم العثور على المستخدم");
      return;
    }
    setCurrentUser(user);
    setActivePage("dashboard");
    pushAudit("تسجيل دخول", "دخول المستخدم إلى البوابة", user);
  }

  function handleLogout() {
    pushAudit("تسجيل خروج", "خروج المستخدم من البوابة");
    setCurrentUser(null);
    setPin(DEMO_PIN);
    setMobileOpen(false);
  }

  function navigate(page) {
    if (!currentUser || !canAccess(currentUser.role, page)) {
      alert("لا تملك صلاحية الوصول لهذه الصفحة");
      return;
    }
    setActivePage(page);
  }

  function handleSaveIncident(form, status) {
    const id = getNextIncidentNumber();
    const incident = {
      id,
      source: form.source,
      rc: form.rc.trim(),
      city: form.city,
      location: form.seasonLocation + (form.location.trim() ? ` - ${form.location.trim()}` : ""),
      type: form.type,
      severity: form.severity,
      patientCount: Number(form.patientCount || 1),
      category: form.category,
      intervention: form.intervention,
      handover: form.handover,
      status,
      createdBy: currentUser.name,
      team: currentUser.team,
      time:
        form.time ||
        new Date().toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      notes: form.notes.trim(),
    };

    setIncidents((current) => [...current, incident]);
    pushAudit("حفظ مباشرة", `تم حفظ المباشرة رقم ${id} بحالة: ${status}`);
    alert(`تم حفظ المباشرة: ${id}`);
    setActivePage("incidents");
  }

  function handleApproveIncident(id) {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === id ? { ...incident, status: "مغلق" } : incident,
      ),
    );
    pushAudit("اعتماد مباشرة", `تم اعتماد وإغلاق المباشرة رقم ${id}`);
  }

  function handleDeleteIncident(id) {
    if (!window.confirm("حذف المباشرة؟")) return;
    setIncidents((current) => current.filter((incident) => incident.id !== id));
    pushAudit("حذف مباشرة", `تم حذف المباشرة رقم ${id}`);
  }

  function handleAddUser(form) {
    const name = form.name.trim() || "مستخدم جديد";
    const nextUser = {
      id: Date.now(),
      name,
      mobile: form.mobile.trim() || "غير محدد",
      role: form.role,
      city: form.city,
      team: form.team || "غير محدد",
      status: "نشط",
    };
    setUsers((current) => [...current, nextUser]);
    pushAudit("إضافة مستخدم", `تم إضافة المستخدم: ${name}`);
    alert("تم إضافة المستخدم");
  }

  function handleAddDepartment(name) {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("اكتب اسم القسم");
      return;
    }
    if (departments.includes(trimmed)) {
      alert("القسم موجود مسبقًا");
      return;
    }
    setDepartments((current) => [...current, trimmed]);
    pushAudit("إضافة قسم", `تم إضافة القسم: ${trimmed}`);
  }

  function handleDeleteDepartment(name) {
    if (!window.confirm(`حذف القسم: ${name}؟`)) return;
    setDepartments((current) => current.filter((department) => department !== name));
    pushAudit("حذف قسم", `تم حذف القسم: ${name}`);
  }

  function handleAddCity(name) {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("اكتب اسم المدينة");
      return;
    }
    if (cities.includes(trimmed)) {
      alert("المدينة موجودة مسبقًا");
      return;
    }
    setCities((current) => [...current, trimmed]);
    pushAudit("إضافة مدينة", `تم إضافة المدينة: ${trimmed}`);
  }

  function handleDeleteCity(name) {
    if (!window.confirm(`حذف المدينة ومواقعها: ${name}؟`)) return;
    setCities((current) => current.filter((city) => city !== name));
    setSites((current) => current.filter((site) => site.city !== name));
    pushAudit("حذف مدينة", `تم حذف المدينة ومواقعها: ${name}`);
  }

  function handleAddSite(city, name) {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("اكتب اسم الموقع");
      return;
    }
    if (sites.some((site) => site.city === city && site.name === trimmed)) {
      alert("الموقع موجود مسبقًا");
      return;
    }
    setSites((current) => [...current, { city, name: trimmed }]);
    pushAudit("إضافة موقع", `تم إضافة موقع: ${trimmed} في ${city}`);
  }

  function handleDeleteSite(index) {
    const site = sites[index];
    if (!site) return;
    if (!window.confirm(`حذف الموقع: ${site.name}؟`)) return;
    setSites((current) => current.filter((_, currentIndex) => currentIndex !== index));
    pushAudit("حذف موقع", `تم حذف موقع: ${site.name}`);
  }

  function handleResetData() {
    if (!window.confirm("مسح كل البيانات التجريبية؟")) return;
    localStorage.removeItem(STORAGE_KEYS.users);
    localStorage.removeItem(STORAGE_KEYS.incidents);
    localStorage.removeItem(STORAGE_KEYS.departments);
    localStorage.removeItem(STORAGE_KEYS.cities);
    localStorage.removeItem(STORAGE_KEYS.sites);
    localStorage.removeItem(STORAGE_KEYS.auditLogs);
    localStorage.removeItem(STORAGE_KEYS.incidentSequence);
    localStorage.removeItem(STORAGE_KEYS.currentUserId);
    window.location.reload();
  }

  if (!currentUser) {
    return (
      <LoginScreen
        users={users}
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId}
        pin={pin}
        onPinChange={setPin}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="lg:grid lg:grid-cols-[320px_1fr]">
        <Sidebar
          currentUser={currentUser}
          activePage={activePage}
          onNavigate={navigate}
          onLogout={handleLogout}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <main className="min-w-0">
          <Header
            currentUser={currentUser}
            activePage={activePage}
            onQuickNew={() => setActivePage("new")}
            onOpenMenu={() => setMobileOpen(true)}
          />

          <div className="space-y-6 p-5 lg:p-8">
            {activePage === "dashboard" ? <DashboardPage incidents={scopedIncidents} /> : null}
            {activePage === "new" ? (
              <NewIncidentPage
                cities={cities}
                sites={sites}
                currentUser={currentUser}
                onSave={handleSaveIncident}
                onCancel={() => setActivePage("dashboard")}
              />
            ) : null}
            {activePage === "incidents" ? (
              <IncidentsPage
                incidents={scopedIncidents}
                currentUser={currentUser}
                onApprove={handleApproveIncident}
                onDelete={handleDeleteIncident}
              />
            ) : null}
            {activePage === "reports" ? (
              <ReportsPage incidents={scopedIncidents} currentUser={currentUser} />
            ) : null}
            {activePage === "users" ? (
              <UsersPage
                users={users}
                cities={cities}
                departments={departments}
                onAddUser={handleAddUser}
              />
            ) : null}
            {activePage === "security" ? (
              <SecurityPage
                departments={departments}
                cities={cities}
                sites={sites}
                auditLogs={auditLogs}
                incidentSequence={incidentSequence}
                onAddDepartment={handleAddDepartment}
                onDeleteDepartment={handleDeleteDepartment}
                onAddCity={handleAddCity}
                onDeleteCity={handleDeleteCity}
                onAddSite={handleAddSite}
                onDeleteSite={handleDeleteSite}
                onResetData={handleResetData}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
