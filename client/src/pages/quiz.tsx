import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import MobileAppContainer from "@/components/mobile-app-container";
import QuizQuestion from "@/components/quiz-question";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, CheckCircle, XCircle } from "lucide-react";

export default function Quiz() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

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

  const { data: quiz, isLoading: quizLoading, error } = useQuery<any>({
    queryKey: ["/api/quiz/today"],
    retry: false,
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, selectedOption }: { questionId: string, selectedOption: string }) => {
      const response = await apiRequest("POST", `/api/quiz/${quiz?.id}/submit`, {
        questionId,
        selectedOption,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setLastResult(data);
      setShowResult(true);
      
      // Invalidate user data to update points/streak
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      if (data.completed) {
        toast({
          title: "Quiz Complete!",
          description: `You scored ${data.score}/6 questions correctly!`,
        });
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (authLoading || quizLoading) {
    return (
      <MobileAppContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </MobileAppContainer>
    );
  }

  if (error || !quiz) {
    return (
      <MobileAppContainer>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Quiz Not Available</h2>
              <p className="text-gray-600 mb-4">
                Unable to load today's quiz. Please try again later.
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

  if (quiz.completed) {
    return (
      <MobileAppContainer>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
              <p className="text-gray-600 mb-4">
                You scored {quiz.score}/{quiz.totalQuestions} questions correctly.
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

  const questions = quiz.questionData || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleSubmitAnswer = (selectedOption: string) => {
    if (!currentQuestion) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedOption
    }));

    submitAnswerMutation.mutate({
      questionId: currentQuestion.id,
      selectedOption,
    });
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setLastResult(null);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz completed, return to home
      setLocation("/");
    }
  };

  const handleExit = () => {
    setLocation("/");
  };

  if (showResult && lastResult) {
    return (
      <MobileAppContainer>
        <div className="p-6 pb-24">
          <div className="text-center mb-8">
            {lastResult.correct ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {lastResult.correct ? "Correct!" : "Incorrect"}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {lastResult.explanation}
            </p>
            
            {lastResult.completed && (
              <Card className="bg-primary/5 border-primary/20 p-4 mb-6">
                <CardContent className="p-0">
                  <h3 className="font-bold text-primary mb-2">Quiz Complete!</h3>
                  <p className="text-sm text-gray-600">
                    Final Score: {lastResult.score}/{quiz.totalQuestions}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <Button
            className="w-full py-4 text-lg font-semibold h-auto"
            onClick={handleNextQuestion}
          >
            {lastResult.completed ? "Return Home" : "Next Question"}
          </Button>
        </div>
      </MobileAppContainer>
    );
  }

  if (!currentQuestion) {
    return (
      <MobileAppContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">No questions available</p>
            <Button className="mt-4" onClick={() => setLocation("/")}>
              Return Home
            </Button>
          </div>
        </div>
      </MobileAppContainer>
    );
  }

  return (
    <MobileAppContainer showStatusBar={false}>
      {/* Quiz Header */}
      <div className="bg-primary text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2 h-auto"
            onClick={handleExit}
          >
            <X className="w-6 h-6" />
          </Button>
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="w-10"></div>
        </div>
        <Progress value={progress} className="h-2 bg-primary-dark" />
      </div>

      {/* Quiz Content */}
      <div className="p-6 pb-24">
        <QuizQuestion
          question={currentQuestion}
          onSubmit={handleSubmitAnswer}
          disabled={submitAnswerMutation.isPending}
        />
      </div>
    </MobileAppContainer>
  );
}
