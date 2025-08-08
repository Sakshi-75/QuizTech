import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import MobileAppContainer from "@/components/mobile-app-container";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  BookOpen, 
  HelpCircle, 
  Trophy,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Upload,
  Download,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  insertTopicSchema,
  insertContentItemSchema,
  insertBadgeSchema,
  type Topic,
  type ContentItem,
  type Badge as BadgeType
} from "@shared/schema";

const questionFormSchema = insertContentItemSchema.extend({
  options: z.array(z.string()).min(2, "At least 2 options required").max(4, "Maximum 4 options allowed"),
});

const lessonFormSchema = insertContentItemSchema.omit({ options: true, correctAnswer: true });

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

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

  // Fetch data
  const { data: topics } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
    retry: false,
  });

  const { data: questions } = useQuery<ContentItem[]>({
    queryKey: ["/api/content"],
    retry: false,
  });

  const { data: badges } = useQuery<BadgeType[]>({
    queryKey: ["/api/badges"],
    retry: false,
  });

  const { data: analytics } = useQuery<any>({
    queryKey: ["/api/admin/analytics"],
    retry: false,
  });

  // Forms
  const topicForm = useForm({
    resolver: zodResolver(insertTopicSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const questionForm = useForm({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      type: "question",
      title: "",
      body: "",
      codeSnippet: "",
      explanation: "",
      options: ["", "", "", ""],
      correctAnswer: "A",
      difficulty: "medium",
      topicId: "",
      tags: [],
    },
  });

  const lessonForm = useForm({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      type: "lesson",
      title: "",
      body: "",
      codeSnippet: "",
      explanation: "",
      difficulty: "medium",
      topicId: "",
      tags: [],
    },
  });

  const badgeForm = useForm({
    resolver: zodResolver(insertBadgeSchema),
    defaultValues: {
      name: "",
      description: "",
      criteria: "",
      icon: "🏆",
    },
  });

  // Mutations
  const createTopicMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/topics", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      toast({ title: "Success", description: "Topic created successfully!" });
      setActiveDialog(null);
      topicForm.reset();
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
        description: "Failed to create topic. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createContentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/content", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({ title: "Success", description: "Content created successfully!" });
      setActiveDialog(null);
      questionForm.reset();
      lessonForm.reset();
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
        description: "Failed to create content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createBadgeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/badges", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/badges"] });
      toast({ title: "Success", description: "Badge created successfully!" });
      setActiveDialog(null);
      badgeForm.reset();
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
        description: "Failed to create badge. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/content/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({ title: "Success", description: "Content deleted successfully!" });
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
        description: "Failed to delete content. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <MobileAppContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </MobileAppContainer>
    );
  }

  const handleExit = () => {
    setLocation("/");
  };

  const onCreateTopic = (data: any) => {
    createTopicMutation.mutate(data);
  };

  const onCreateQuestion = (data: any) => {
    const processedData = {
      ...data,
      options: data.options.filter((option: string) => option.trim() !== ""),
      tags: data.tags || [],
    };
    createContentMutation.mutate(processedData);
  };

  const onCreateLesson = (data: any) => {
    const processedData = {
      ...data,
      tags: data.tags || [],
    };
    createContentMutation.mutate(processedData);
  };

  const onCreateBadge = (data: any) => {
    createBadgeMutation.mutate(data);
  };

  const handleDeleteContent = (id: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      deleteContentMutation.mutate(id);
    }
  };

  const questionsData = questions?.filter((item) => item.type === "question") || [];
  const lessonsData = questions?.filter((item) => item.type === "lesson") || [];

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
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
            <TabsTrigger value="topics" className="text-xs">Topics</TabsTrigger>
            <TabsTrigger value="badges" className="text-xs">Badges</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Platform Overview</h2>
              <p className="text-gray-600">Monitor platform performance and user engagement</p>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{analytics?.totalUsers || 0}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{analytics?.dailyActiveUsers || 0}</div>
                  <div className="text-sm text-gray-600">Daily Active</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{analytics?.quizCompletionRate || 0}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{analytics?.averageScore || 0}</div>
                  <div className="text-sm text-gray-600">Avg Score</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Content Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Questions</span>
                  <UIBadge variant="secondary">{questionsData.length}</UIBadge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Lessons</span>
                  <UIBadge variant="secondary">{lessonsData.length}</UIBadge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Topics</span>
                  <UIBadge variant="secondary">{topics?.length || 0}</UIBadge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Badges</span>
                  <UIBadge variant="secondary">{badges?.length || 0}</UIBadge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Content Management</h3>
              <div className="flex space-x-2">
                <Dialog open={activeDialog === "question"} onOpenChange={(open) => setActiveDialog(open ? "question" : null)}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="text-xs">
                      <Plus className="w-4 h-4 mr-1" />
                      Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Question</DialogTitle>
                    </DialogHeader>
                    <Form {...questionForm}>
                      <form onSubmit={questionForm.handleSubmit(onCreateQuestion)} className="space-y-4">
                        <FormField
                          control={questionForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Question Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter question title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={questionForm.control}
                          name="body"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Question Body</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Enter question description" rows={3} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={questionForm.control}
                          name="topicId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Topic</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a topic" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {topics?.map((topic: Topic) => (
                                    <SelectItem key={topic.id} value={topic.id}>
                                      {topic.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={questionForm.control}
                          name="difficulty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Difficulty</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="beginner">Beginner</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Options */}
                        <div className="space-y-2">
                          <FormLabel>Answer Options</FormLabel>
                          {[0, 1, 2, 3].map((index) => (
                            <FormField
                              key={index}
                              control={questionForm.control}
                              name={`options.${index}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>

                        <FormField
                          control={questionForm.control}
                          name="correctAnswer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correct Answer</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="A">Option A</SelectItem>
                                  <SelectItem value="B">Option B</SelectItem>
                                  <SelectItem value="C">Option C</SelectItem>
                                  <SelectItem value="D">Option D</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={questionForm.control}
                          name="explanation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Explanation</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Explain the correct answer" rows={2} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full" disabled={createContentMutation.isPending}>
                          {createContentMutation.isPending ? "Creating..." : "Create Question"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Dialog open={activeDialog === "lesson"} onOpenChange={(open) => setActiveDialog(open ? "lesson" : null)}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Plus className="w-4 h-4 mr-1" />
                      Lesson
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Lesson</DialogTitle>
                    </DialogHeader>
                    <Form {...lessonForm}>
                      <form onSubmit={lessonForm.handleSubmit(onCreateLesson)} className="space-y-4">
                        <FormField
                          control={lessonForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lesson Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter lesson title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={lessonForm.control}
                          name="body"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lesson Content</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Enter lesson content" rows={4} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={lessonForm.control}
                          name="topicId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Topic</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a topic" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {topics?.map((topic: Topic) => (
                                    <SelectItem key={topic.id} value={topic.id}>
                                      {topic.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={lessonForm.control}
                          name="codeSnippet"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Code Example (Optional)</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Enter code example" rows={3} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full" disabled={createContentMutation.isPending}>
                          {createContentMutation.isPending ? "Creating..." : "Create Lesson"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <HelpCircle className="w-4 h-4 mr-2" />
                Questions ({questionsData.length})
              </h4>
              {questionsData.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No questions created yet</p>
                    <p className="text-sm text-gray-500">Create your first question to get started</p>
                  </CardContent>
                </Card>
              ) : (
                questionsData.map((question: ContentItem) => (
                  <Card key={question.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900 text-sm">{question.title}</h5>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => toast({ title: "Edit", description: "Edit functionality coming soon!" })}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteContent(question.id)}
                            disabled={deleteContentMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <Badge variant="outline" className="text-xs">
                          {question.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {topics?.find((t: Topic) => t.id === question.topicId)?.name || "Unknown"}
                        </Badge>
                        {question.reviewed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <Separator />

            {/* Lessons List */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Lessons ({lessonsData.length})
              </h4>
              {lessonsData.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No lessons created yet</p>
                    <p className="text-sm text-gray-500">Create your first lesson to get started</p>
                  </CardContent>
                </Card>
              ) : (
                lessonsData.map((lesson: ContentItem) => (
                  <Card key={lesson.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900 text-sm">{lesson.title}</h5>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => toast({ title: "Edit", description: "Edit functionality coming soon!" })}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteContent(lesson.id)}
                            disabled={deleteContentMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <Badge variant="outline" className="text-xs">
                          {lesson.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {topics?.find((t: Topic) => t.id === lesson.topicId)?.name || "Unknown"}
                        </Badge>
                        {lesson.reviewed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Topics Tab */}
          <TabsContent value="topics" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Topics Management</h3>
              <Dialog open={activeDialog === "topic"} onOpenChange={(open) => setActiveDialog(open ? "topic" : null)}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Topic
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Topic</DialogTitle>
                  </DialogHeader>
                  <Form {...topicForm}>
                    <form onSubmit={topicForm.handleSubmit(onCreateTopic)} className="space-y-4">
                      <FormField
                        control={topicForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Topic Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter topic name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={topicForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Enter topic description" rows={3} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={createTopicMutation.isPending}>
                        {createTopicMutation.isPending ? "Creating..." : "Create Topic"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {topics?.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No topics created yet</p>
                    <p className="text-sm text-gray-500">Create your first topic to organize content</p>
                  </CardContent>
                </Card>
              ) : (
                topics?.map((topic: Topic) => (
                  <Card key={topic.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{topic.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {questionsData.filter((q: ContentItem) => q.topicId === topic.id).length} questions
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {lessonsData.filter((l: ContentItem) => l.topicId === topic.id).length} lessons
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Badges Management</h3>
              <Dialog open={activeDialog === "badge"} onOpenChange={(open) => setActiveDialog(open ? "badge" : null)}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Badge
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Badge</DialogTitle>
                  </DialogHeader>
                  <Form {...badgeForm}>
                    <form onSubmit={badgeForm.handleSubmit(onCreateBadge)} className="space-y-4">
                      <FormField
                        control={badgeForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Badge Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter badge name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={badgeForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Enter badge description" rows={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={badgeForm.control}
                        name="criteria"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Criteria</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="How to earn this badge" rows={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={badgeForm.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon (Emoji)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="🏆" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={createBadgeMutation.isPending}>
                        {createBadgeMutation.isPending ? "Creating..." : "Create Badge"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {badges?.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No badges created yet</p>
                    <p className="text-sm text-gray-500">Create badges to reward user achievements</p>
                  </CardContent>
                </Card>
              ) : (
                badges?.map((badge: Badge) => (
                  <Card key={badge.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-xl">{badge.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{badge.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{badge.criteria}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation currentPage="admin" />
    </MobileAppContainer>
  );
}
