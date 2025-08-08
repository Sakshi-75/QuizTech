import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Trophy, Calendar } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary-light/10">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            QUIZ<span className="text-primary">TECH</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Gamified microlearning for software engineers. Master algorithms, data structures, 
            and system design with daily quizzes and interactive lessons.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-4 h-auto bg-primary hover:bg-primary-dark"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Daily Quizzes</h3>
              <p className="text-sm text-gray-600">
                6 questions daily on algorithms, data structures, and system design
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Streak Tracking</h3>
              <p className="text-sm text-gray-600">
                Build momentum with daily streaks and earn bonus points
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Leaderboards</h3>
              <p className="text-sm text-gray-600">
                Compete with peers on weekly and monthly rankings
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-sm text-gray-600">
                Visual calendar showing your learning journey and achievements
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Level Up Your Skills?</h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of engineers improving their interview skills and technical knowledge 
            with our gamified learning platform.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-4 h-auto bg-white text-primary hover:bg-gray-50"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Learning Today
          </Button>
        </div>
      </div>
    </div>
  );
}
