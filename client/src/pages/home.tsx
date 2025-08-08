import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import MobileAppContainer from "@/components/mobile-app-container";
import BottomNavigation from "@/components/bottom-navigation";
import CalendarHeatmap from "@/components/calendar-heatmap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Calendar, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect to login if not authenticated
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

  const { data: quiz, isLoading: quizLoading } = useQuery<any>({
    queryKey: ["/api/quiz/today"],
    retry: false,
  });

  const { data: lesson, isLoading: lessonLoading } = useQuery<any>({
    queryKey: ["/api/lesson/today"],
    retry: false,
  });

  const { data: leaderboard } = useQuery<any[]>({
    queryKey: ["/api/leaderboard/weekly"],
    retry: false,
  });

  if (authLoading) {
    return (
      <MobileAppContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </MobileAppContainer>
    );
  }

  const handleStartQuiz = () => {
    if (quiz?.completed) {
      toast({
        title: "Quiz Already Completed",
        description: "You've already completed today's quiz!",
      });
      return;
    }
    setLocation("/quiz");
  };

  const handleOpenLesson = () => {
    setLocation("/lesson");
  };

  return (
    <MobileAppContainer>
      <div className="pb-20 px-4 pt-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome back{(user as any)?.firstName ? `, ${(user as any).firstName}` : ""}!
          </h2>
          
          {/* Daily Quiz Card */}
          <Card className="bg-primary rounded-2xl p-6 text-white mb-6 shadow-lg border-0">
            <CardContent className="p-0">
              <div className="text-sm font-medium mb-2">DAILY QUIZ</div>
              <div className="text-2xl font-bold mb-4">
                {quiz?.completed ? 
                  `${quiz.score} / ${quiz.totalQuestions} Questions Correct` :
                  `${quiz?.totalQuestions || 6} Questions Waiting`
                }
              </div>
              <Button 
                className="bg-white text-primary w-full py-3 rounded-xl font-semibold text-lg shadow-md hover:bg-gray-50 transition-colors h-auto"
                onClick={handleStartQuiz}
                disabled={quizLoading}
              >
                {quiz?.completed ? "COMPLETED" : "START"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Daily Lesson Section */}
        <div className="mb-8">
          <div className="text-sm font-medium text-gray-600 mb-2">DAILY LESSON</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {lesson?.title || "Loading lesson..."}
          </h3>
          <p className="text-gray-600 mb-4">Learn more</p>
          <Button
            variant="ghost"
            className="flex items-center space-x-3 text-primary font-medium p-0 h-auto"
            onClick={handleOpenLesson}
            disabled={lessonLoading}
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
            <span className="text-lg">Learn more</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Streak Card */}
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">STREAK</div>
            <div className="text-3xl font-bold text-gray-900">
              {(user as any)?.streak || 0} days
            </div>
          </div>

          {/* Calendar Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">CALENDAR</div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary p-0 h-auto"
                onClick={() => setLocation("/profile")}
              >
                <Calendar className="w-5 h-5" />
              </Button>
            </div>
            <div className="text-xl font-bold text-gray-900 mb-3">
              {new Date().toLocaleString('default', { month: 'long' })}
            </div>
            
            <CalendarHeatmap compact={true} />
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="mb-8">
          <div className="text-sm font-medium text-gray-600 mb-3">LEADERBOARD</div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-gray-600">#1</span>
                <span className="text-gray-900 font-medium">1,550 pts</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-gray-600">#2</span>
                <span className="text-gray-900 font-medium">1,320 pts</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-gray-600">#3</span>
                <span className="text-gray-900 font-medium">1,210 pts</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              className="w-full text-primary font-medium text-sm mt-4"
              onClick={() => setLocation("/leaderboard")}
            >
              View Full Leaderboard
            </Button>
          </div>
        </div>
      </div>

      <BottomNavigation currentPage="home" />
    </MobileAppContainer>
  );
}
