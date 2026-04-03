"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  TrendingUp,
  AlertCircle,
  Percent,
  BarChart3,
  Languages,
  Download,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Link from "next/link";
import {
  SearchAnalyticsMetrics,
  TopSearchQuery,
  ZeroResultSearch,
  LowCTRSearch,
  LanguageBreakdown,
} from "@/features/catalog/application/interfaces/IAdminSearchAnalyticsRepository";

interface Props {
  initialData: {
    metrics: SearchAnalyticsMetrics;
    topSearches: TopSearchQuery[];
    zeroResults: ZeroResultSearch[];
    lowCTR: LowCTRSearch[];
    languageBreakdown: LanguageBreakdown[];
    days: number;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

/**
 *
 */
export function SearchAnalyticsView({ initialData }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [days, setDays] = useState(initialData.days.toString());

  /**
   *
   */
  const handleDaysChange = (value: string) => {
    setDays(value);
    router.push(`${pathname}?days=${value}`);
  };

  /**
   *
   */
  const exportCSV = () => {
    const headers = ["Query", "Count", "Last Searched", "Locale"];
    const rows = initialData.zeroResults.map((r) => [
      r.query,
      r.count,
      new Date(r.lastSearchedAt).toLocaleString(),
      r.locale,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `zero_result_searches_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search Analytics</h1>
          <p className="text-muted-foreground italic">
            Analyze search behavior and find catalog opportunities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={days} onValueChange={handleDaysChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="0">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {initialData.metrics.totalSearches.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zero Results</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {initialData.metrics.zeroResultsCount.toLocaleString()}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({initialData.metrics.zeroResultsRate.toFixed(1)}%)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Potential catalog gaps</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Results</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {initialData.metrics.avgResultsPerSearch.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Items per query</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {initialData.metrics.clickThroughRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Search to click conversion</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="top-searches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="top-searches">Top Searches</TabsTrigger>
          <TabsTrigger value="zero-results">Zero Results</TabsTrigger>
          <TabsTrigger value="low-ctr">Low Click Rate</TabsTrigger>
          <TabsTrigger value="languages">Language Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="top-searches">
          <Card>
            <CardHeader>
              <CardTitle>Frequent Queries</CardTitle>
              <CardDescription>Most searched terms and their direct performance.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Rank</TableHead>
                    <TableHead>Query</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Avg Results</TableHead>
                    <TableHead className="text-right">Click Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialData.topSearches.map((s) => (
                    <TableRow key={s.query}>
                      <TableCell className="font-medium text-muted-foreground">#{s.rank}</TableCell>
                      <TableCell className="font-semibold">{s.query}</TableCell>
                      <TableCell className="text-right">{s.count.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{s.avgResults.toFixed(1)}</TableCell>
                      <TableCell className="text-right">{s.clickRate.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                  {initialData.topSearches.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center">
                        No data found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zero-results">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Catalog Gaps</CardTitle>
                <CardDescription>Terms users search for but find nothing.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead className="text-right">Total Count</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Last Searched</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialData.zeroResults.map((s) => (
                    <TableRow key={`${s.query}-${s.locale}`}>
                      <TableCell className="font-semibold">{s.query}</TableCell>
                      <TableCell className="text-right">{s.count.toLocaleString()}</TableCell>
                      <TableCell className="uppercase">{s.locale}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(s.lastSearchedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/products/new?name=${encodeURIComponent(s.query)}`}>
                            <Plus className="mr-2 h-3.5 w-3.5" />
                            Create Product
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {initialData.zeroResults.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center">
                        Congrats! Users found everything.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-ctr">
          <Card>
            <CardHeader>
              <CardTitle>Poor Performance Queries</CardTitle>
              <CardDescription>
                Queries with {">"}10 impressions but {"<"}10% click rate. Indicates irrelevant
                results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialData.lowCTR.map((s) => (
                    <TableRow key={s.query}>
                      <TableCell className="font-semibold">{s.query}</TableCell>
                      <TableCell className="text-right">{s.impressions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{s.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium text-red-500">
                        {s.ctr.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/search?q=${encodeURIComponent(s.query)}`} target="_blank">
                            Review Results
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {initialData.lowCTR.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center">
                        Search results appear highly relevant!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages">
          <Card>
            <CardHeader>
              <CardTitle>Language Distribution</CardTitle>
              <CardDescription>Search volume split by locale.</CardDescription>
            </CardHeader>
            <CardContent className="flex h-[400px] flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={initialData.languageBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ locale, percentage }: any) =>
                      `${locale.toUpperCase()}: ${percentage.toFixed(1)}%`
                    }
                  >
                    {initialData.languageBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-8 text-center sm:grid-cols-3 md:grid-cols-4">
                {initialData.languageBreakdown.map((entry, index) => (
                  <div key={entry.locale} className="space-y-1">
                    <div className="text-sm font-medium uppercase">{entry.locale}</div>
                    <div className="text-2xl font-bold">{entry.count.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {entry.percentage.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
