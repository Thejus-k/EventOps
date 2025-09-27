import React from 'react';
import { MessageCircle, BarChart3, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function Feedback() {
  // Mock feedback data
  const mockFeedback = {
    overall: { rating: 4.2, responses: 128 },
    sessions: [
      { name: 'Opening Keynote', rating: 4.8, responses: 95 },
      { name: 'Tech Workshop', rating: 4.1, responses: 67 },
      { name: 'Panel Discussion', rating: 3.9, responses: 82 }
    ],
    comments: [
      { text: "Great event organization!", rating: 5, session: 'Overall' },
      { text: "Could use better audio equipment", rating: 3, session: 'Tech Workshop' },
      { text: "Excellent speakers and content", rating: 5, session: 'Opening Keynote' }
    ]
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-success';
    if (rating >= 3.5) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Feedback & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Collect and analyze event feedback
          </p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-3xl font-bold ${getRatingColor(mockFeedback.overall.rating)}`}>
                {mockFeedback.overall.rating}
              </div>
              <Star className={`w-6 h-6 ${getRatingColor(mockFeedback.overall.rating)}`} fill="currentColor" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Based on {mockFeedback.overall.responses} responses
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">64%</div>
            <Progress value={64} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Promoter Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">+42</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm text-success">+8 from last event</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Feedback */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Session Ratings
          </CardTitle>
          <CardDescription>Detailed feedback for each session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockFeedback.sessions.map((session, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{session.name}</span>
                <div className="flex items-center gap-1">
                  <span className={`font-bold ${getRatingColor(session.rating)}`}>
                    {session.rating}
                  </span>
                  <Star className={`w-4 h-4 ${getRatingColor(session.rating)}`} fill="currentColor" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={session.rating * 20} className="flex-1" />
                <span className="text-sm text-muted-foreground">
                  {session.responses} responses
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Recent Comments
          </CardTitle>
          <CardDescription>Latest feedback from attendees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockFeedback.comments.map((comment, index) => (
            <div key={index} className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < comment.rating ? 'text-warning fill-current' : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{comment.session}</span>
              </div>
              <p className="text-sm">{comment.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}