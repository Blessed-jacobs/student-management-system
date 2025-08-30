import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, School, Users, Mail, Shield, Palette } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      schoolName: "Greenwood High School",
      academicYear: "2024-2025",
      timezone: "America/New_York",
      gradeScale: "letter",
      passingGrade: "60",
      attendanceRequired: "80",
      enableNotifications: true,
      enableParentAccess: true,
      allowGradeExport: true,
    }
  });

  const onSubmit = (data: any) => {
    console.log("Settings saved:", data);
    toast({
      title: "Settings Saved",
      description: "Your changes have been saved successfully.",
    });
  };

  if (user?.role !== 'ADMIN') {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Access denied. Only administrators can view system settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">System Settings</h2>
        <p className="text-muted-foreground">Configure system preferences and administrative options</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" data-testid="tab-general">
            <School className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="grading" data-testid="tab-grading">
            <Badge className="w-4 h-4 mr-2" />
            Grading
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Mail className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <School className="w-5 h-5 mr-2" />
                  School Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      {...register("schoolName")}
                      data-testid="input-school-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      {...register("academicYear")}
                      data-testid="input-academic-year"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="America/New_York">
                    <SelectTrigger data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <Switch data-testid="switch-dark-mode" />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Layout</Label>
                    <p className="text-sm text-muted-foreground">
                      Use a more compact interface layout
                    </p>
                  </div>
                  <Switch data-testid="switch-compact-layout" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grading Scale Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gradeScale">Grade Scale Type</Label>
                    <Select defaultValue="letter">
                      <SelectTrigger data-testid="select-grade-scale">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="letter">Letter Grades (A-F)</SelectItem>
                        <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                        <SelectItem value="points">Point System</SelectItem>
                        <SelectItem value="custom">Custom Scale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passingGrade">Minimum Passing Grade</Label>
                    <Input
                      id="passingGrade"
                      type="number"
                      min="0"
                      max="100"
                      {...register("passingGrade")}
                      data-testid="input-passing-grade"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Grade Boundaries</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label>A (90-100)</Label>
                      <Input type="number" defaultValue="90" data-testid="input-grade-a" />
                    </div>
                    <div className="space-y-2">
                      <Label>B (80-89)</Label>
                      <Input type="number" defaultValue="80" data-testid="input-grade-b" />
                    </div>
                    <div className="space-y-2">
                      <Label>C (70-79)</Label>
                      <Input type="number" defaultValue="70" data-testid="input-grade-c" />
                    </div>
                    <div className="space-y-2">
                      <Label>D (60-69)</Label>
                      <Input type="number" defaultValue="60" data-testid="input-grade-d" />
                    </div>
                    <div className="space-y-2">
                      <Label>F (0-59)</Label>
                      <Input type="number" defaultValue="0" data-testid="input-grade-f" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attendanceRequired">Minimum Attendance Percentage</Label>
                  <Input
                    id="attendanceRequired"
                    type="number"
                    min="0"
                    max="100"
                    {...register("attendanceRequired")}
                    data-testid="input-attendance-required"
                  />
                  <p className="text-sm text-muted-foreground">
                    Students must maintain this attendance percentage to remain in good standing
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">25</div>
                      <div className="text-sm text-muted-foreground">Total Admins</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">48</div>
                      <div className="text-sm text-muted-foreground">Total Teachers</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">284</div>
                      <div className="text-sm text-muted-foreground">Total Students</div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Permission Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Parent Account Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Parents can create accounts to view their child's progress
                      </p>
                    </div>
                    <Switch 
                      defaultChecked={true}
                      data-testid="switch-parent-access"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Grade Export</Label>
                      <p className="text-sm text-muted-foreground">
                        Teachers can export grade data to CSV files
                      </p>
                    </div>
                    <Switch 
                      defaultChecked={true}
                      data-testid="switch-grade-export"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Student Self-Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow students to register their own accounts
                      </p>
                    </div>
                    <Switch data-testid="switch-self-registration" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send automated emails for important events
                    </p>
                  </div>
                  <Switch 
                    defaultChecked={true}
                    data-testid="switch-email-notifications"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Notification Types</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Grade Posted Notifications</Label>
                      <Switch defaultChecked={true} data-testid="switch-grade-notifications" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Attendance Alerts</Label>
                      <Switch defaultChecked={true} data-testid="switch-attendance-notifications" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Assignment Due Reminders</Label>
                      <Switch defaultChecked={false} data-testid="switch-assignment-notifications" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>System Maintenance Alerts</Label>
                      <Switch defaultChecked={true} data-testid="switch-maintenance-notifications" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMTP Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      placeholder="smtp.gmail.com"
                      data-testid="input-smtp-host"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      placeholder="587"
                      data-testid="input-smtp-port"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">Username</Label>
                    <Input
                      id="smtpUsername"
                      placeholder="your-email@domain.com"
                      data-testid="input-smtp-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      placeholder="••••••••"
                      data-testid="input-smtp-password"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" data-testid="button-reset">
              Reset to Defaults
            </Button>
            <Button type="submit" data-testid="button-save-settings">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
