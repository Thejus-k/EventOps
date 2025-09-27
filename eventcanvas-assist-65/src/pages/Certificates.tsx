import React, { useState } from 'react';
import { Award, Upload, Download, Eye, MessageSquare, FileSpreadsheet, Users, Mic, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function Certificates() {
  const [templateUploaded, setTemplateUploaded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    volunteers: null as File | null,
    participants: null as File | null,
    speakers: null as File | null
  });

  const handleTemplateUpload = () => {
    setTemplateUploaded(true);
  };

  const handleExcelUpload = (type: 'volunteers' | 'participants' | 'speakers', file: File) => {
    setUploadedFiles(prev => ({ ...prev, [type]: file }));
  };

  const generateCertificates = (type: 'volunteers' | 'participants' | 'speakers') => {
    console.log(`Generating certificates for ${type}`);
    // Implementation would process the Excel file and generate certificates
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Certificates & Communications
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate certificates and manage communications
          </p>
        </div>
      </div>

      <Tabs defaultValue="certificates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="space-y-6">
          {/* Certificate Templates */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Certificate Templates
              </CardTitle>
              <CardDescription>
                Upload and manage certificate templates with placeholders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Certificate Template</h3>
                <p className="text-muted-foreground mb-4">
                  Upload a certificate template with placeholders for names, dates, and event details
                </p>
                <Button variant="gradient" onClick={handleTemplateUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
              
              {/* Example template */}
              <div className="bg-gradient-secondary rounded-lg p-6 border">
                <h4 className="font-medium mb-2">Sample Certificate Preview</h4>
                <div className="bg-white rounded border p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Certificate of Participation</h2>
                  <p className="mb-2">This is to certify that</p>
                  <div className="text-xl font-bold border-b-2 border-primary inline-block px-4 py-1 mb-4">
                    [PARTICIPANT_NAME]
                  </div>
                  <p className="mb-4">has successfully participated in</p>
                  <h3 className="text-lg font-semibold mb-4">[EVENT_NAME]</h3>
                  <p className="text-sm text-muted-foreground">Date: [EVENT_DATE]</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Sample
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Excel Upload Section - Only show after template is uploaded */}
          {templateUploaded && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  Upload Excel Files for Certificate Generation
                </CardTitle>
                <CardDescription>
                  Upload Excel files containing lists of volunteers, participants, and speakers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Volunteers Upload */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <UserCheck className="w-5 h-5 text-success" />
                    <h4 className="font-medium">Volunteers</h4>
                    {uploadedFiles.volunteers && (
                      <Badge variant="secondary" className="bg-success/20 text-success">
                        {uploadedFiles.volunteers.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload Excel file with volunteer names and details
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.xlsx,.xls';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleExcelUpload('volunteers', file);
                        };
                        input.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Excel
                    </Button>
                    {uploadedFiles.volunteers && (
                      <Button 
                        variant="gradient" 
                        onClick={() => generateCertificates('volunteers')}
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Generate Certificates
                      </Button>
                    )}
                  </div>
                </div>

                {/* Participants Upload */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-5 h-5 text-primary" />
                    <h4 className="font-medium">Participants</h4>
                    {uploadedFiles.participants && (
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        {uploadedFiles.participants.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload Excel file with participant names and details
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.xlsx,.xls';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleExcelUpload('participants', file);
                        };
                        input.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Excel
                    </Button>
                    {uploadedFiles.participants && (
                      <Button 
                        variant="gradient" 
                        onClick={() => generateCertificates('participants')}
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Generate Certificates
                      </Button>
                    )}
                  </div>
                </div>

                {/* Speakers Upload */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Mic className="w-5 h-5 text-warning" />
                    <h4 className="font-medium">Speakers</h4>
                    {uploadedFiles.speakers && (
                      <Badge variant="secondary" className="bg-warning/20 text-warning">
                        {uploadedFiles.speakers.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload Excel file with speaker names and details
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.xlsx,.xls';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleExcelUpload('speakers', file);
                        };
                        input.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Excel
                    </Button>
                    {uploadedFiles.speakers && (
                      <Button 
                        variant="gradient" 
                        onClick={() => generateCertificates('speakers')}
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Generate Certificates
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generation Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">84</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Downloaded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">67</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          {/* Thank You Messages */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Automated Communications
              </CardTitle>
              <CardDescription>
                Set up automated thank you messages and follow-ups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium mb-2">Thank You Email Template</h4>
                <div className="bg-card rounded p-4 border">
                  <div className="space-y-3 text-sm">
                    <p><strong>Subject:</strong> Thank you for attending [EVENT_NAME]!</p>
                    <div className="border-l-4 border-primary pl-4 space-y-2">
                      <p>Dear [PARTICIPANT_NAME],</p>
                      <p>Thank you for participating in [EVENT_NAME]. We hope you found the sessions valuable and engaging.</p>
                      <p>Your certificate of participation is attached to this email.</p>
                      <p>Best regards,<br/>The Event Team</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm">Edit Template</Button>
                  <Button variant="outline" size="sm">Send Test</Button>
                  <Button variant="gradient" size="sm">Send to All</Button>
                </div>
              </div>

              {/* Communication Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Emails Sent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">156</div>
                    <p className="text-xs text-muted-foreground">94% delivery rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Open Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">78%</div>
                    <p className="text-xs text-muted-foreground">Above industry average</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}