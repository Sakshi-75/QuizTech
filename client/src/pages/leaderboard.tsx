import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import MobileAppContainer from "@/components/mobile-app-container";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";

export default function Leaderboard() {
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

  const { data: weeklyLeaderboard } = useQuery<any[]>({
    queryKey: ["/api/leaderboard/weekly"],
    retry: false,
  });

  const { data: monthlyLeaderboard } = useQuery<any[]>({
    queryKey: ["/api/leaderboard/monthly"],
    retry: false,
  });

  if (authLoading) {
    return (
      <MobileAppContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </MobileAppContainer>
    );
  }

  const handleExit = () => {
    setLocation("/");
  };

  // Mock leaderboard data since API might be empty
  const mockWeeklyData = [
    { user: { firstName: "Sarah", lastName: "Kim" }, points: 2150, rank: 1 },
    { user: { firstName: "Alex", lastName: "Chen" }, points: 1847, rank: 2 },
    { user: { firstName: "Jordan", lastName: "Smith" }, points: 1550, rank: 3 },
    { user: { firstName: "Emma", lastName: "Davis" }, points: 1320, rank: 4 },
    { user: { firstName: "Michael", lastName: "Johnson" }, points: 1210, rank: 5 },
    { user: { firstName: "Lisa", lastName: "Wang" }, points: 1085, rank: 6 },
    { user: { firstName: "David", lastName: "Brown" }, points: 945, rank: 7 },
    { user: { firstName: "Anna", lastName: "Wilson" }, points: 820, rank: 8 },
  ];

  const mockMonthlyData = [
    { user: { firstName: "Alex", lastName: "Chen" }, points: 7420, rank: 1 },
    { user: { firstName: "Sarah", lastName: "Kim" }, points: 7150, rank: 2 },
    { user: { firstName: "Emma", lastName: "Davis" }, points: 6890, rank: 3 },
    { user: { firstName: "Jordan", lastName: "Smith" }, points: 6234, rank: 4 },
    { user: { firstName: "Michael", lastName: "Johnson" }, points: 5987, rank: 5 },
    { user: { firstName: "Lisa", lastName: "Wang" }, points: 5445, rank: 6 },
    { user: { firstName: "David", lastName: "Brown" }, points: 4832, rank: 7 },
    { user: { firstName: "Anna", lastName: "Wilson" }, points: 4156, rank: 8 },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const LeaderboardList = ({ data }: { data: any[] }) => (
    <div className="space-y-3">
      {data.map((entry, index) => {
        const isCurrentUser = user && entry.user.firstName === (user as any).firstName;
        
        return (
          <Card 
            key={index} 
            className={`border-0 ${isCurrentUser ? 'bg-primary/5 border-primary/20 border' : 'bg-gray-50'}`}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {entry.user.firstName?.[0]}{entry.user.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <div className={`font-medium ${isCurrentUser ? 'text-primary' : 'text-gray-900'}`}>
                      {entry.user?.firstName} {entry.user?.lastName}
                    </div>
                    {isCurrentUser && (
                      <div className="text-xs text-primary">You</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{entry.points.toLocaleString()}</div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <MobileAppContainer showStatusBar={false}>
      {/* Header */}
      <div className="bg-primary text-white px-4 py-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 p-2 h-auto"
          onClick={handleExit}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-lg font-semibold">Leaderboard</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="p-6 pb-24">
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">This Week's Champions</h2>
              <p className="text-gray-600">Compete with peers and climb the ranks!</p>
            </div>
            <LeaderboardList data={weeklyLeaderboard || mockWeeklyData} />
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Monthly Leaderboard</h2>
              <p className="text-gray-600">See who's been consistent this month!</p>
            </div>
            <LeaderboardList data={monthlyLeaderboard || mockMonthlyData} />
          </TabsContent>
        </Tabs>

        {/* Your Rank Card */}
        <Card className="mt-6 bg-gradient-to-r from-primary/5 to-primary-light/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Your Current Rank</h3>
            <div className="flex items-center justify-center space-x-4">
              <div>
                <div className="text-2xl font-bold text-primary">#2</div>
                <div className="text-xs text-gray-600">This Week</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div>
                <div className="text-2xl font-bold text-primary">#1</div>
                <div className="text-xs text-gray-600">This Month</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Keep up the great work! 🎉
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation currentPage="leaderboard" />
    </MobileAppContainer>
  );
}
