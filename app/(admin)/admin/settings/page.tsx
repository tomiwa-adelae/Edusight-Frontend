import React from "react"
import { Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage system configuration and preferences</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="dark:bg-slate-800">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="model">Model</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-4 space-y-4">
          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base dark:text-white">Institution Details</CardTitle>
              <CardDescription className="dark:text-slate-400">Basic information about the institution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Institution Name</Label>
                  <Input defaultValue="Ajayi Crowther University" className="dark:border-slate-700 dark:bg-slate-800" />
                </div>
                <div className="space-y-1.5">
                  <Label>System Name</Label>
                  <Input defaultValue="EduSight" className="dark:border-slate-700 dark:bg-slate-800" />
                </div>
                <div className="space-y-1.5">
                  <Label>Academic Session</Label>
                  <Select defaultValue="24252">
                    <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24252">2024/2025 — Second Semester</SelectItem>
                      <SelectItem value="24251">2024/2025 — First Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Admin Contact Email</Label>
                  <Input defaultValue="admin@acu.edu.ng" type="email" className="dark:border-slate-700 dark:bg-slate-800" />
                </div>
              </div>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Save size={14} />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model */}
        <TabsContent value="model" className="mt-4 space-y-4">
          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base dark:text-white">ML Model Configuration</CardTitle>
              <CardDescription className="dark:text-slate-400">Control which model is active and set risk thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Active Algorithm</Label>
                  <Select defaultValue="rf">
                    <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rf">Random Forest (Recommended)</SelectItem>
                      <SelectItem value="xgb">XGBoost</SelectItem>
                      <SelectItem value="lr">Logistic Regression</SelectItem>
                      <SelectItem value="dt">Decision Tree</SelectItem>
                      <SelectItem value="svm">SVM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Prediction Schedule</Label>
                  <Select defaultValue="manual">
                    <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual only</SelectItem>
                      <SelectItem value="weekly">Weekly (Every Monday)</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="semesterly">Start of semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="dark:border-slate-800" />

              <div>
                <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Risk Thresholds</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-red-600">High Risk (&gt; probability)</Label>
                    <Input defaultValue="0.75" type="number" step="0.01" max="1" min="0" className="dark:border-slate-700 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-amber-600">Medium Risk (&gt; probability)</Label>
                    <Input defaultValue="0.45" type="number" step="0.01" max="1" min="0" className="dark:border-slate-700 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-emerald-600">Min Attendance Threshold (%)</Label>
                    <Input defaultValue="70" type="number" className="dark:border-slate-700 dark:bg-slate-800" />
                  </div>
                </div>
              </div>

              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Save size={14} />
                Save Model Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base dark:text-white">Notification Preferences</CardTitle>
              <CardDescription className="dark:text-slate-400">Configure when and how alerts are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Email alerts for new High Risk students", defaultChecked: true },
                { label: "Weekly summary digest to all advisers", defaultChecked: true },
                { label: "Notify HODs when dept at-risk count exceeds threshold", defaultChecked: false },
                { label: "Alert when model prediction run completes", defaultChecked: true },
                { label: "Notify student when their risk status changes", defaultChecked: false },
              ].map(({ label, defaultChecked }) => (
                <label key={label} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                  <input type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4 accent-blue-600" />
                </label>
              ))}
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Save size={14} />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-4 space-y-4">
          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base dark:text-white">Security & Access</CardTitle>
              <CardDescription className="dark:text-slate-400">Password and account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Current Password</Label>
                <Input type="password" placeholder="••••••••" className="dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input type="password" placeholder="••••••••" className="dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm New Password</Label>
                <Input type="password" placeholder="••••••••" className="dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <Separator className="dark:border-slate-800" />
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Session Timeout</Label>
                <Select defaultValue="60">
                  <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Save size={14} />
                Update Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
