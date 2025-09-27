import React, { useState, useRef } from 'react';
import { Building, Plus, Mail, Phone, CheckCircle, Clock, AlertCircle, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { AddVendorModal } from '@/components/modals/AddVendorModal';
import { exportVendorsToExcel, readExcelFile, validateVendorData } from '@/lib/excel-utils';
import { toast } from 'sonner';

export default function Vendors() {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredVendors = state.vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success';
      case 'pending':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-destructive/20 text-destructive';
    }
  };

  const handleExport = () => {
    exportVendorsToExcel(state.vendors);
    toast.success('Vendors exported to Excel successfully');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await readExcelFile(file);
      const validatedVendors = validateVendorData(data);
      
      validatedVendors.forEach(vendor => {
        dispatch({ type: 'ADD_VENDOR', payload: vendor });
      });
      
      toast.success(`${validatedVendors.length} vendors imported successfully`);
    } catch (error) {
      toast.error('Failed to import vendors from Excel file');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContactVendor = (vendor: any, type: 'email' | 'phone') => {
    if (type === 'email') {
      window.open(`mailto:${vendor.contact}`, '_blank');
    } else {
      const phoneNumber = vendor.contact.replace(/\D/g, '');
      window.open(`tel:${phoneNumber}`, '_blank');
    }
    toast.success(`Opening ${type} for ${vendor.name}`);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}  
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Vendor Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your event service providers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
          <AddVendorModal>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </AddVendorModal>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>{state.vendors.filter(v => v.status === 'active').length} Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning" />
            <span>{state.vendors.filter(v => v.status === 'pending').length} Pending</span>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map(vendor => (
          <Card key={vendor.id} className="shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{vendor.name}</CardTitle>
                    <CardDescription className="text-xs">{vendor.serviceType}</CardDescription>
                  </div>
                </div>
                {getStatusIcon(vendor.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="truncate">{vendor.contact}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className={getStatusColor(vendor.status)}>
                  {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                </Badge>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleContactVendor(vendor, 'phone')}
                    title="Call vendor"
                  >
                    <Phone className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleContactVendor(vendor, 'email')}
                    title="Email vendor"
                  >
                    <Mail className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No vendors found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first vendor to get started'}
          </p>
          <AddVendorModal>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </AddVendorModal>
        </div>
      )}
    </div>
  );
}