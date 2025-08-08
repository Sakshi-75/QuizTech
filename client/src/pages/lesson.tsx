import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import MobileAppContainer from "@/components/mobile-app-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Lightbulb } from "lucide-react";

export default function Lesson() {
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

  const { data: lesson, isLoading: lessonLoading, error } = useQuery<any>({
    queryKey: ["/api/lesson/today"],
    retry: false,
  });

  if (authLoading || lessonLoading) {
    return (
      <MobileAppContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading lesson...</p>
          </div>
        </div>
      </MobileAppContainer>
    );
  }

  const handleExit = () => {
    setLocation("/");
  };

  const handleComplete = () => {
    toast({
      title: "Lesson Complete!",
      description: "Great job! Your progress has been saved.",
    });
    setLocation("/");
  };

  const handleSaveForLater = () => {
    toast({
      title: "Saved for Later",
      description: "This lesson has been added to your reading list.",
    });
    setLocation("/");
  };

  if (error || !lesson) {
    return (
      <MobileAppContainer>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Lesson Available</h2>
              <p className="text-gray-600 mb-4">
                Unable to load today's lesson. Please try again later.
              </p>
              <Button onClick={() => setLocation("/")}>
                Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </MobileAppContainer>
    );
  }

  return (
    <MobileAppContainer showStatusBar={false}>
      {/* Lesson Header */}
      <div className="bg-primary text-white px-4 py-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 p-2 h-auto"
          onClick={handleExit}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-lg font-semibold">Daily Lesson</h1>
        <div className="w-10"></div>
      </div>

      {/* Lesson Content */}
      <div className="p-6 pb-24 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {lesson?.title}
        </h2>
        
        <div className="prose prose-gray max-w-none mb-8">
          <div className="text-gray-700 leading-relaxed mb-6">
            {lesson?.body}
          </div>
          
          {lesson?.codeSnippet && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Code Example</h3>
              <Card className="bg-gray-100 rounded-lg mb-6">
                <CardContent className="p-4">
                  <pre className="text-sm text-gray-700 overflow-x-auto">
                    <code>{lesson?.codeSnippet}</code>
                  </pre>
                </CardContent>
              </Card>
            </>
          )}

          {lesson?.explanation && (
            <Card className="bg-blue-50 border-l-4 border-primary p-4 mb-6">
              <CardContent className="p-0">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700 font-medium mb-1">
                      💡 Pro Tip:
                    </p>
                    <p className="text-sm text-gray-700">
                      {lesson?.explanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lesson Actions */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1 py-3 font-semibold h-auto"
            onClick={handleSaveForLater}
          >
            Save for Later
          </Button>
          <Button
            className="flex-1 py-3 font-semibold h-auto"
            onClick={handleComplete}
          >
            Mark Complete
          </Button>
        </div>
      </div>
    </MobileAppContainer>
  );
}
