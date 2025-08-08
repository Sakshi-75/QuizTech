import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import MobileAppContainer from "@/components/mobile-app-container";
import BottomNavigation from "@/components/bottom-navigation";
import CalendarHeatmap from "@/components/calendar-heatmap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Edit, Award } from "lucide-react";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [user, authLoading, toast]);

  const { data: userBadges } = useQuery<any[]>({
    queryKey: ["/api/user/badges"],
    retry: false,
  });

  const { data: quizHistory } = useQuery<any[]>({
    queryKey: ["/api/quiz/history"],
    retry: false,
  });

  if (authLoading) {
    return (
      <MobileAppContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </MobileAppContainer>
    );
  }

  const handleExit = () => {
    setLocation("/");
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const badges = [
    { id: "streak", name: "7-Day Streak", icon: "🔥", earned: ((user as any)?.streak || 0) >= 7 },
    { id: "perfect", name: "Perfect Score", icon: "🎯", earned: false },
    { id: "lessons", name: "100 Lessons", icon: "📚", earned: false },
    { id: "top10", name: "Top 10", icon: "🏆", earned: false },
  ];

  const topicProgress = [
    { name: "Algorithms", progress: 85 },
    { name: "Data Structures", progress: 72 },
    { name: "System Design", progress: 45 },
  ];

  const completedQuizzes = quizHistory?.filter((quiz: any) => quiz.completed).length || 0;
  const totalQuestions = quizHistory?.reduce((sum: number, quiz: any) => sum + (quiz.totalQuestions || 0), 0) || 0;
  const correctAnswers = quizHistory?.reduce((sum: number, quiz: any) => sum + (quiz.score || 0), 0) || 0;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <MobileAppContainer showStatusBar={false}>
      {/* Profile Header */}
      <div className="bg-primary text-white px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2 h-auto"
            onClick={handleExit}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-semibold">Profile</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2 h-auto"
            onClick={() => toast({ title: "Edit Profile", description: "Feature coming soon!" })}
          >
            <Edit className="w-6 h-6" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Profile photo */}
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white">
            {(user as any)?.profileImageUrl ? (
              <img 
                src={(user as any).profileImageUrl} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold">
                {(user as any)?.firstName?.[0] || (user as any)?.email?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {(user as any)?.firstName ? `${(user as any).firstName} ${(user as any).lastName || ''}`.trim() : 'User'}
            </h2>
            <p className="text-blue-100">{(user as any)?.skillLevel || 'Beginner'}</p>
            <p className="text-blue-100 text-sm">{(user as any)?.points || 0} points</p>
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="p-6 pb-24">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center bg-gray-50 border-0">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-gray-900">{(user as any)?.streak || 0}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </CardContent>
          </Card>
          <Card className="p-4 text-center bg-gray-50 border-0">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-gray-900">{completedQuizzes}</div>
              <div className="text-sm text-gray-600">Quizzes</div>
            </CardContent>
          </Card>
          <Card className="p-4 text-center bg-gray-50 border-0">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-gray-900">{accuracy}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </CardContent>
          </Card>
        </div>

        {/* Badges Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Badges
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div key={badge.id} className={`text-center ${!badge.earned ? 'opacity-40' : ''}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 mx-auto ${
                  badge.earned ? 'bg-yellow-400' : 'bg-gray-300'
                }`}>
                  <span className="text-lg">{badge.icon}</span>
                </div>
                <div className="text-xs text-gray-600">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Calendar</h3>
          <CalendarHeatmap />
        </div>

        {/* Topic Progress */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Topic Progress</h3>
          <div className="space-y-4">
            {topicProgress.map((topic) => (
              <Card key={topic.name} className="bg-gray-50 border-0">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium text-gray-900">{topic.name}</div>
                    <div className="text-sm text-gray-600">{topic.progress}% complete</div>
                  </div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-primary rounded-full progress-bar" 
                      style={{ width: `${topic.progress}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full py-3 font-semibold h-auto"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>

      <BottomNavigation currentPage="profile" />
    </MobileAppContainer>
  );
}
