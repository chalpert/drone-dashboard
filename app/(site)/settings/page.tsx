"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Configure your drone tracker preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  First Name
                </label>
                <Input placeholder="John" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Last Name
                </label>
                <Input placeholder="Doe" />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Email Address
              </label>
              <Input type="email" placeholder="john.doe@example.com" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Organization
              </label>
              <Input placeholder="Drone Operations Inc." />
            </div>

            <div className="pt-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Plan</span>
              <Badge>Professional</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Drones Limit</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">25</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Active Drones</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">5</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Storage Used</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">2.4 GB</span>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Low Battery Alerts", description: "Get notified when drone batteries drop below 20%" },
                { title: "Mission Completed", description: "Receive alerts when missions are completed" },
                { title: "System Maintenance", description: "Notifications about scheduled maintenance" },
                { title: "GPS Signal Loss", description: "Immediate alerts for GPS connectivity issues" },
                { title: "Flight Time Limits", description: "Warnings when approaching maximum flight time" },
              ].map((setting, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {setting.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {setting.description}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={index < 3}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              App Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Default View
              </label>
              <select className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>Dashboard</option>
                <option>Fleet</option>
                <option>Missions</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Time Zone
              </label>
              <select className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>UTC-8 (Pacific)</option>
                <option>UTC-5 (Eastern)</option>
                <option>UTC+0 (GMT)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Units
              </label>
              <select className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>Metric</option>
                <option>Imperial</option>
              </select>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full">
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Export Data
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Download all your drone data and logs
                  </p>
                  <Button variant="outline" size="sm">
                    Export CSV
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Clear Cache
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Clear temporary data to free up space
                  </p>
                  <Button variant="outline" size="sm">
                    Clear Cache
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                    Delete Account
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Permanently delete your account and all data
                  </p>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
