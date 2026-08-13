import { useEffect, useMemo, useState, type JSX } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { IpcBridge } from "../ipc/bridge.js";
import type { MailboxDashboardSnapshot } from "../ipc/commands.js";
import { JjEmptyState, JjPage, JjSurface } from "./layout/index.js";

export type DashboardViewProps = {
  readonly bridge: IpcBridge;
};

const EMPTY_DASHBOARD: MailboxDashboardSnapshot = {
  summary: {
    totalApplications: 0,
    activeApplications: 0,
    interviews: 0,
    assessments: 0,
    offers: 0,
    rejected: 0,
    awaitingResponse: 0,
    actionsRequired: 0,
  },
  funnel: { applied: 0, responses: 0, interviews: 0, offers: 0 },
  actions: [],
  duplicates: [],
  analytics: {
    windowDays: 30,
    applications: 0,
    responses: 0,
    responseRate: 0,
    interviews: 0,
    interviewRate: 0,
    offers: 0,
    offerRate: 0,
  },
  integrations: [],
};

/**
 * Calm local overview — funnel, pipeline mix, and recent rates.
 * On-device data only. Does not call AI or send.
 */
export function DashboardView({ bridge }: DashboardViewProps): JSX.Element {
  const theme = useTheme();
  const [dashboard, setDashboard] = useState<MailboxDashboardSnapshot>(EMPTY_DASHBOARD);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void bridge.getMailboxDashboard().then((result) => {
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setStatus(result.error.message ?? result.error.title);
        return;
      }
      setDashboard(result.value.dashboard);
      setStatus(null);
    });
    return () => {
      cancelled = true;
    };
  }, [bridge]);

  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary?.main ?? "#F5A524";
  const muted = theme.palette.text.secondary;
  const paper = theme.palette.background.paper;
  const grid = theme.palette.divider;

  const funnelData = useMemo(
    () => [
      { name: "Applied", value: dashboard.funnel.applied },
      { name: "Responses", value: dashboard.funnel.responses },
      { name: "Interviews", value: dashboard.funnel.interviews },
      { name: "Offers", value: dashboard.funnel.offers },
    ],
    [dashboard.funnel],
  );

  const mixData = useMemo(
    () =>
      [
        { name: "Active", value: dashboard.summary.activeApplications, color: primary },
        { name: "Awaiting", value: dashboard.summary.awaitingResponse, color: muted },
        { name: "Assessments", value: dashboard.summary.assessments, color: secondary },
        { name: "Interviews", value: dashboard.summary.interviews, color: primary },
        { name: "Offers", value: dashboard.summary.offers, color: secondary },
        { name: "Rejected", value: dashboard.summary.rejected, color: theme.palette.error.main },
      ].filter((row) => row.value > 0),
    [dashboard.summary, muted, primary, secondary, theme.palette.error.main],
  );

  const ratesData = useMemo(
    () => [
      { name: "Heard back", value: dashboard.analytics.responseRate },
      { name: "Interviews", value: dashboard.analytics.interviewRate },
      { name: "Offers", value: dashboard.analytics.offerRate },
    ],
    [dashboard.analytics],
  );

  const hasApplications = dashboard.summary.totalApplications > 0;
  const tooltipStyle = {
    backgroundColor: paper,
    border: `1px solid ${grid}`,
    borderRadius: 8,
    color: theme.palette.text.primary,
  };

  return (
    <JjPage
      testId="jj-dashboard-view"
      title="Overview"
      subtitle="Quiet charts from applications on this device. Nothing leaves from here."
      maxWidth="56rem"
    >
      {!hasApplications ? (
        <JjEmptyState
          testId="jj-dashboard-empty"
          title="No applications to chart yet"
          body="Add a draft in Applications, or import job mail after you connect. Charts stay on this device."
        />
      ) : (
        <Stack spacing={2.5}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontVariantNumeric: "tabular-nums" }}
          >
            {dashboard.summary.totalApplications} applications ·{" "}
            {dashboard.summary.activeApplications} active · {dashboard.summary.actionsRequired} need
            attention
          </Typography>

          <JjSurface testId="jj-dashboard-funnel" spacing={1.5}>
            <Typography variant="subtitle2">Funnel</Typography>
            <Typography variant="body2" color="text.secondary">
              How applications move from applied toward offers.
            </Typography>
            <Box sx={{ width: "100%", height: 220 }} data-testid="jj-dashboard-funnel-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid stroke={grid} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} stroke={muted} fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={88}
                    stroke={muted}
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "transparent" }} />
                  <Bar dataKey="value" fill={primary} radius={[0, 4, 4, 0]} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </JjSurface>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            }}
          >
            <JjSurface testId="jj-dashboard-mix" spacing={1.5}>
              <Typography variant="subtitle2">Pipeline mix</Typography>
              <Typography variant="body2" color="text.secondary">
                Where live applications sit right now.
              </Typography>
              <Box sx={{ width: "100%", height: 240 }} data-testid="jj-dashboard-mix-chart">
                {mixData.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nothing to plot in the mix yet.
                  </Typography>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mixData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={52}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {mixData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} stroke={paper} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12, color: muted }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </JjSurface>

            <JjSurface testId="jj-dashboard-rates" spacing={1.5}>
              <Typography variant="subtitle2">
                Recent rates · last {dashboard.analytics.windowDays} days
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Share of applications that reached each stage. Not a score.
              </Typography>
              <Box sx={{ width: "100%", height: 240 }} data-testid="jj-dashboard-rates-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratesData} margin={{ left: 0, right: 8, top: 8 }}>
                    <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke={muted} fontSize={12} tickLine={false} />
                    <YAxis
                      domain={[0, 100]}
                      unit="%"
                      stroke={muted}
                      fontSize={12}
                      width={40}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [`${String(value)}%`, "Rate"]}
                    />
                    <Bar dataKey="value" fill={secondary} radius={[4, 4, 0, 0]} name="Rate" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </JjSurface>
          </Box>
        </Stack>
      )}

      {status ? (
        <Typography role="status" color="text.secondary" variant="body2">
          {status}
        </Typography>
      ) : null}
    </JjPage>
  );
}
