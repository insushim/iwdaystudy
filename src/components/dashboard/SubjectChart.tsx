"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface SubjectData {
  subject: string;
  name: string;
  accuracy: number;
  color: string;
}

interface SubjectChartProps {
  data: SubjectData[];
  className?: string;
  title?: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  math: "#FF6B35",
  korean: "#4ECDC4",
  spelling: "#A18CD1",
  vocabulary: "#FF8BA7",
  hanja: "#8B4513",
  english: "#4169E1",
  writing: "#2ECC71",
  general_knowledge: "#F9CA24",
  safety: "#E74C3C",
  creative: "#FF69B4",
};

export function SubjectChart({
  data,
  className,
  title = "과목별 정답률",
}: SubjectChartProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar">
          <TabsList className="mb-4">
            <TabsTrigger value="bar">막대</TabsTrigger>
            <TabsTrigger value="radar">레이더</TabsTrigger>
          </TabsList>
          <TabsContent value="bar">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value}%`, "정답률"]}
                />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SUBJECT_COLORS[entry.subject] || entry.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="radar">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  className="fill-muted-foreground"
                />
                <Radar
                  name="정답률"
                  dataKey="accuracy"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
