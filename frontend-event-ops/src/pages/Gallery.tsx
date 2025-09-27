import React, { useState } from 'react';
import { Camera, Upload, Grid, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock photo data
  const categories = [
    { id: 'all', name: 'All Photos', count: 48 },
    { id: 'keynote', name: 'Keynote Sessions', count: 12 },
    { id: 'workshops', name: 'Workshops', count: 18 },
    { id: 'networking', name: 'Networking', count: 10 },
    { id: 'awards', name: 'Awards Ceremony', count: 8 }
  ];

  const mockPhotos = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    category: ['keynote', 'workshops', 'networking', 'awards'][i % 4],
    title: `Event Photo ${i + 1}`,
    timestamp: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
    size: '2.4 MB'
  }));

  const filteredPhotos = selectedCategory === 'all' 
    ? mockPhotos 
    : mockPhotos.filter(photo => photo.category === selectedCategory);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Photo Gallery
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your event photos and media
          </p>
        </div>
        <Button variant="gradient">
          <Upload className="w-4 h-4 mr-2" />
          Upload Photos
        </Button>
      </div>

      {/* Upload Area */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Camera className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Event Photos</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop photos here or click to browse
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="gradient">
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
              <Button variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="h-8"
            >
              {category.name}
              <Badge variant="secondary" className="ml-2 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredPhotos.map(photo => (
          <Card key={photo.id} className="group shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden">
            <div className="aspect-square bg-gradient-secondary relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button variant="secondary" size="sm" className="h-6 w-6 p-0">
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <h4 className="text-sm font-medium truncate">{photo.title}</h4>
              <div className="flex items-center justify-between mt-1">
                <Badge variant="outline" className="text-xs">
                  {photo.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{photo.size}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(photo.timestamp).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center py-12">
          <Camera className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No photos found</h3>
          <p className="text-muted-foreground mb-4">
            Upload your first event photos to get started
          </p>
          <Button variant="gradient">
            <Upload className="w-4 h-4 mr-2" />
            Upload Photos
          </Button>
        </div>
      )}

      {/* Storage Info */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-sm">Storage Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span>124.5 MB used of 1 GB</span>
            <span className="text-muted-foreground">87% available</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '13%' }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}