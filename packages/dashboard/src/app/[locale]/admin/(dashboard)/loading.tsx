import * as React from "react";
import { Card, CardContent, CardHeader } from "@findeg/ui";
import { Skeleton } from "@findeg/ui";

export default function AdminDashboardLoading() {
  return (
    <div className="flex-1 space-y-6 pt-6">
      {/* Greeting skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>

      {/* KPI skeletons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-[120px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Catalog Completion Board */}
      <Card className="h-[400px]">
        <CardHeader className="border-b pb-4">
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[150px] mt-2" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center gap-4 w-full">
                  <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-4 w-[80px]" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two columns */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 h-[350px]">
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[50px]" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="col-span-3 h-[350px]">
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent className="grid gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="h-[400px]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-[150px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
