"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dbGet } from "@/lib/db/client";
import {
  LineChart,
  Line,
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

interface AnalyticsData {
  kpis: {
    mau: number;
    mauChange: number;
    dailyAvg: number;
    dailyAvgChange: number;
    completionRate: number;
    completionRateChange: number;
    monthlyRevenue: number;
    monthlyRevenueChange: number;
  };
  userGrowth: { month: string; users: number }[];
  dau: { date: string; dau: number }[];
  subjectPopularity: { subject: string; value: number }[];
  completionByGrade: { grade: string; rate: number }[];
  revenue: { month: string; revenue: number }[];
  summary: {
    avgStudyMinutes: number;
    bestStreak: number;
    avgCorrectRate: number;
  };
}

const SUBJECT_COLORS = [
  "#FF6B35",
  "#4ECDC4",
  "#4169E1",
  "#A18CD1",
  "#8B4513",
  "#00BCD4",
  "#9CA3AF",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await dbGet<AnalyticsData>("/admin/analytics");
        if (alive) setData(res);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "불러오기 실패");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">분석 대시보드</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="border shadow-sm animate-pulse">
              <CardContent className="pt-5 pb-5 h-28" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">분석 대시보드</h1>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-8 text-center text-sm text-red-600">
            분석 데이터를 불러오지 못했습니다.
            {error ? <div className="mt-1 text-xs">{error}</div> : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "월간 활성 사용자",
      value: data.kpis.mau.toLocaleString(),
      change: data.kpis.mauChange,
      suffix: "%",
      icon: Users,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "일평균 학습 완료",
      value: data.kpis.dailyAvg.toLocaleString(),
      change: data.kpis.dailyAvgChange,
      suffix: "%",
      icon: BookOpen,
      color: "text-green-600 bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "평균 완료율",
      value: `${data.kpis.completionRate}%`,
      change: data.kpis.completionRateChange,
      suffix: "%p",
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "월간 매출",
      value: formatMoney(data.kpis.monthlyRevenue),
      change: data.kpis.monthlyRevenueChange,
      suffix: "%",
      icon: DollarSign,
      color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  const subjectData = data.subjectPopularity.map((s, i) => ({
    ...s,
    color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
  }));

  const hasGrowth = data.userGrowth.some((d) => d.users > 0);
  const hasDau = data.dau.some((d) => d.dau > 0);
  const hasSubjects = subjectData.length > 0;
  const hasGrades = data.completionByGrade.length > 0;
  const hasRevenue = data.revenue.some((d) => d.revenue > 0);

  const firstUsers = data.userGrowth[0]?.users || 0;
  const lastUsers = data.userGrowth[data.userGrowth.length - 1]?.users || 0;
  const growthPct =
    firstUsers > 0
      ? Math.round(((lastUsers - firstUsers) / firstUsers) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">분석 대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">
          아라하루 서비스의 주요 지표를 실제 DB 기준으로 확인하세요.
        </p>
      </div>

      {/* KPI cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {kpiCards.map((card) => {
          const up = card.change >= 0;
          return (
            <motion.div key={card.title} variants={itemVariants}>
              <Card className="border shadow-sm">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold mt-1">{card.value}</p>
                    </div>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}
                    >
                      <card.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3">
                    {up ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        up ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {up ? "+" : ""}
                      {card.change}
                      {card.suffix}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      전월 대비
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">사용자 성장 추이</CardTitle>
                {hasGrowth && (
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {growthPct >= 0 ? "+" : ""}
                    {growthPct}%
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {hasGrowth ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.userGrowth}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [
                          `${Number(value).toLocaleString()}명`,
                          "누적 사용자",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#2ECC71"
                        strokeWidth={3}
                        dot={{ fill: "#2ECC71", strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  일일 활성 사용자 (DAU)
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  최근 7일
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {hasDau ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.dau}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [
                          `${Number(value).toLocaleString()}명`,
                          "DAU",
                        ]}
                      />
                      <Bar dataKey="dau" fill="#4ECDC4" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">과목별 인기도</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {hasSubjects ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subjectData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="subject"
                      >
                        {subjectData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [`${value}%`, "비율"]}
                      />
                      <Legend
                        formatter={(value) => (
                          <span style={{ fontSize: "12px" }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">학년별 완료율</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {hasGrades ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.completionByGrade} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        dataKey="grade"
                        type="category"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                        width={50}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [`${value}%`, "완료율"]}
                      />
                      <Bar
                        dataKey="rate"
                        fill="#A18CD1"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">매출 추이</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  만원
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {hasRevenue ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.revenue}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [
                          `${Number(value).toLocaleString()}만원`,
                          "매출",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#F9CA24"
                        strokeWidth={3}
                        dot={{ fill: "#F9CA24", strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border shadow-sm bg-primary/5">
          <CardContent className="pt-5 pb-5">
            <h3 className="text-sm font-semibold mb-2">평균 학습 시간</h3>
            <p className="text-3xl font-black text-primary">
              {data.summary.avgStudyMinutes}분
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              세트당 평균 소요 시간 (최근 30일)
            </p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm bg-blue-500/5">
          <CardContent className="pt-5 pb-5">
            <h3 className="text-sm font-semibold mb-2">최고 연속 학습</h3>
            <p className="text-3xl font-black text-blue-500">
              {data.summary.bestStreak}일
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              전체 학생 중 최고 기록
            </p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm bg-purple-500/5">
          <CardContent className="pt-5 pb-5">
            <h3 className="text-sm font-semibold mb-2">평균 정답률</h3>
            <p className="text-3xl font-black text-purple-500">
              {data.summary.avgCorrectRate}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              최근 30일 전체 평균
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

function EmptyChart() {
  return (
    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
      데이터 없음
    </div>
  );
}

function formatMoney(won: number): string {
  if (won <= 0) return "0원";
  if (won >= 10000) {
    const man = Math.round(won / 10000);
    return `${man.toLocaleString()}만원`;
  }
  return `${won.toLocaleString()}원`;
}
