import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileUpload } from "@/components/ui/file-upload";
import { DiamondNotesDisplay } from "@/components/diamond-notes-display";
import { Gem, Lightbulb, BookOpen, History, Loader2 } from "lucide-react";
import { getSubjectsForClass } from "@/lib/subjects";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DiamondNotes, NotesRequest } from "@shared/schema";

const generateNotesFormSchema = z.object({
  className: z.string().min(1, "Please select a class"),
  subject: z.string().min(1, "Please select a subject"),
  chapterName: z.string().optional(),
  language: z.enum(["english", "hindi"]),
});

type GenerateNotesFormData = z.infer<typeof generateNotesFormSchema>;

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedNotes, setGeneratedNotes] = useState<DiamondNotes | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<GenerateNotesFormData>({
    resolver: zodResolver(generateNotesFormSchema),
    defaultValues: {
      className: "",
      subject: "",
      chapterName: "",
      language: "english",
    },
  });

  const selectedClass = form.watch("className");
  const chapterName = form.watch("chapterName");

  // Update subjects when class changes
  useEffect(() => {
    if (selectedClass) {
      const classNumber = parseInt(selectedClass);
      const availableSubjects = getSubjectsForClass(classNumber);
      setSubjects(availableSubjects);
      form.setValue("subject", "");
    }
  }, [selectedClass, form]);

  // Fetch recent notes
  const { data: recentNotes } = useQuery<NotesRequest[]>({
    queryKey: ["/api/recent-notes"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generate notes mutation
  const generateNotesMutation = useMutation({
    mutationFn: async (data: GenerateNotesFormData & { file?: File }) => {
      const formData = new FormData();
      formData.append('className', data.className);
      formData.append('subject', data.subject);
      formData.append('language', data.language);
      
      if (data.chapterName) {
        formData.append('chapterName', data.chapterName);
      }
      
      if (data.file) {
        formData.append('pdf', data.file);
      }

      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate notes');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedNotes(data.notes);
      toast({
        title: "Success!",
        description: "Diamond Notes generated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GenerateNotesFormData) => {
    if (!data.chapterName && !selectedFile) {
      toast({
        title: "Input Required",
        description: "Please either enter a chapter name or upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    generateNotesMutation.mutate({
      ...data,
      file: selectedFile || undefined,
    });
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      form.setValue("chapterName", "");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Gem className="text-primary-foreground text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Diamond Notes</h1>
                <p className="text-sm text-muted-foreground">NCERT Study Assistant</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Classes 1-12</span>
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span className="text-sm text-muted-foreground">All Subjects</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Generate Diamond Notes
                  </h2>
                  <p className="text-muted-foreground">
                    Select your class, subject, and chapter to create structured study notes
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Class Selection */}
                    <FormField
                      control={form.control}
                      name="className"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Select Class <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} data-testid="class-select">
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose your class..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  Class {num}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Subject Selection */}
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Select Subject <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={!selectedClass}
                            data-testid="subject-select"
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose your subject..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Input Method Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-medium text-foreground">Choose Input Method</h3>
                        <div className="flex-1 h-px bg-border"></div>
                      </div>
                      
                      {/* Chapter Name Input */}
                      <div className="bg-accent rounded-lg p-4 border-2 border-dashed border-border">
                        <FormField
                          control={form.control}
                          name="chapterName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                  <span className="text-primary-foreground text-xs">1</span>
                                </div>
                                <span>Option 1: Enter Chapter Name</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="e.g., Challenges of Building Democracy"
                                  disabled={!!selectedFile}
                                  data-testid="chapter-input"
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">
                                Enter the exact chapter name from your NCERT textbook
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <div className="w-12 h-px bg-border"></div>
                          <span className="text-sm">OR</span>
                          <div className="w-12 h-px bg-border"></div>
                        </div>
                      </div>

                      {/* PDF Upload */}
                      <div className="bg-accent rounded-lg p-4 border-2 border-dashed border-border">
                        <Label className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">2</span>
                          </div>
                          <span>Option 2: Upload NCERT PDF</span>
                        </Label>
                        <FileUpload
                          onFileSelect={handleFileSelect}
                          disabled={!!chapterName?.trim()}
                          data-testid="pdf-upload"
                        />
                      </div>
                    </div>

                    {/* Language Selection */}
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Output Language <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-2 gap-3"
                              data-testid="language-select"
                            >
                              <div className="flex items-center space-x-3 p-3 border border-border rounded-md hover:bg-accent cursor-pointer transition-colors">
                                <RadioGroupItem value="english" id="english" />
                                <Label htmlFor="english" className="flex items-center space-x-2 cursor-pointer">
                                  <span className="text-lg">🇬🇧</span>
                                  <span className="font-medium">English</span>
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 border border-border rounded-md hover:bg-accent cursor-pointer transition-colors">
                                <RadioGroupItem value="hindi" id="hindi" />
                                <Label htmlFor="hindi" className="flex items-center space-x-2 cursor-pointer">
                                  <span className="text-lg">🇮🇳</span>
                                  <span className="font-medium">हिंदी</span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Generate Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={generateNotesMutation.isPending}
                      data-testid="generate-notes-button"
                    >
                      {generateNotesMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating your notes...
                        </>
                      ) : (
                        <>
                          <Gem className="mr-2 h-4 w-4" />
                          Generate Diamond Notes
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Generated Notes Display */}
            {generatedNotes && (
              <div className="mt-8">
                <DiamondNotesDisplay
                  notes={generatedNotes}
                  className={form.getValues("className")}
                  subject={form.getValues("subject")}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                  <Lightbulb className="text-secondary h-5 w-5" />
                  <span>Quick Tips</span>
                </h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    For best results, enter the exact chapter name as it appears in your NCERT textbook
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    Upload clear, high-quality PDF files for accurate note generation
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    Diamond Notes follow the official NCERT structure and sequence
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Popular Subjects */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                  <BookOpen className="text-primary h-5 w-5" />
                  <span>Popular Subjects</span>
                </h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: 'Mathematics', classes: 'Classes 1-12' },
                  { name: 'Science', classes: 'Classes 1-10' },
                  { name: 'Social Science', classes: 'Classes 6-10' },
                  { name: 'History', classes: 'Classes 9-12' },
                ].map((subject, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                  >
                    <span className="text-sm text-foreground">{subject.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {subject.classes}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Notes */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                  <History className="text-accent-foreground h-5 w-5" />
                  <span>Recent Notes</span>
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentNotes && recentNotes.length > 0 ? (
                  recentNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-accent rounded-md">
                      <p className="text-sm font-medium text-foreground">
                        {note.chapterName || 'PDF Upload'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Class {note.className} - {note.subject} • {
                          note.createdAt 
                            ? new Date(note.createdAt).toLocaleDateString()
                            : 'Recently'
                        }
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent notes yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
