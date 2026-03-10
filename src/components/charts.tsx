"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ── Design tokens (match Resolvly brand) ──
const VERMILLION = "#DC4A2E";
const DARK = "#3C3530";
const TAUPE = "#E8E0D8";
const GREEN = "#16a34a";
const AMBER = "#d97706";
const BLUE = "#2563eb";

const CHANNEL_COLORS: Record<string, string> = {
  chat: VERMILLION,
  email: BLUE,
  sms: GREEN,
  voice: AMBER,
};

// ── Shared tooltip style ──
const tooltipStyle = {
  backgroundColor: "#fff",
  border: `1px solid ${TAUPE}`,
  borderRadius: "8px",
  fontSize: "12px",
  color: DARK,
};

// ── Volume Chart (area) ──
export function VolumeChart({
  data,
}: {
  data: { date: string; conversationsCount: number; resolvedCount: number; escalatedCount: number }[];
}) {
  const formatted = data.map((d) => ({
    ...d,
    label: formatDate(d.date),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradVolume" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VERMILLION} stopOpacity={0.2} />
            <stop offset="100%" stopColor={VERMILLION} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GREEN} stopOpacity={0.15} />
            <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={TAUPE} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8C8279" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#8C8279" }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="conversationsCount"
          name="Conversations"
          stroke={VERMILLION}
          strokeWidth={2}
          fill="url(#gradVolume)"
        />
        <Area
          type="monotone"
          dataKey="resolvedCount"
          name="Resolved"
          stroke={GREEN}
          strokeWidth={2}
          fill="url(#gradResolved)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Resolution Rate Chart ──
export function ResolutionChart({
  data,
}: {
  data: { date: string; conversationsCount: number; resolvedCount: number }[];
}) {
  const formatted = data.map((d) => ({
    label: formatDate(d.date),
    rate: d.conversationsCount > 0 ? Math.round((d.resolvedCount / d.conversationsCount) * 100) : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradRate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GREEN} stopOpacity={0.2} />
            <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={TAUPE} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8C8279" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#8C8279" }} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Rate"]} />
        <Area type="monotone" dataKey="rate" name="Resolution Rate" stroke={GREEN} strokeWidth={2} fill="url(#gradRate)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Confidence Trend Chart ──
export function ConfidenceChart({
  data,
}: {
  data: { date: string; avgConfidence: number }[];
}) {
  const formatted = data.map((d) => ({
    label: formatDate(d.date),
    confidence: Math.round(d.avgConfidence * 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradConf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VERMILLION} stopOpacity={0.15} />
            <stop offset="100%" stopColor={VERMILLION} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={TAUPE} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8C8279" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#8C8279" }} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Confidence"]} />
        <Area type="monotone" dataKey="confidence" name="Avg Confidence" stroke={VERMILLION} strokeWidth={2} fill="url(#gradConf)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Peak Hours Chart (bar) ──
export function PeakHoursChart({
  data,
}: {
  data: { hour: number; count: number }[];
}) {
  const formatted = data.map((d) => ({
    ...d,
    label: formatHour(d.hour),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={TAUPE} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "#8C8279" }}
          tickLine={false}
          axisLine={false}
          interval={2}
        />
        <YAxis tick={{ fontSize: 11, fill: "#8C8279" }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" name="Conversations" fill={VERMILLION} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Channel Breakdown (pie) ──
export function ChannelChart({
  data,
}: {
  data: { channel: string; count: number }[];
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const formatted = data.map((d) => ({
    name: d.channel.charAt(0).toUpperCase() + d.channel.slice(1),
    value: d.count,
    pct: total > 0 ? Math.round((d.count / total) * 100) : 0,
    fill: CHANNEL_COLORS[d.channel] ?? DARK,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={formatted}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
          strokeWidth={0}
        >
          {formatted.map((entry, idx) => (
            <Cell key={idx} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value, name) => {
            const item = formatted.find((f) => f.name === name);
            return [`${value} (${item?.pct ?? 0}%)`, name];
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span style={{ color: DARK, fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Escalation Pattern Chart ──
export function EscalationChart({
  data,
}: {
  data: { date: string; conversationsCount: number; escalatedCount: number }[];
}) {
  const formatted = data.map((d) => ({
    label: formatDate(d.date),
    rate: d.conversationsCount > 0 ? Math.round((d.escalatedCount / d.conversationsCount) * 100) : 0,
    count: d.escalatedCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={TAUPE} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8C8279" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#8C8279" }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" name="Escalated" fill={AMBER} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Helpers ──
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatHour(h: number): string {
  if (h === 0) return "12a";
  if (h === 12) return "12p";
  return h < 12 ? `${h}a` : `${h - 12}p`;
}
