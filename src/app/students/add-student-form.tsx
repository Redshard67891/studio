"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, Check } from "lucide-react";
import { createStudentAction, createStudentWithCorrection } from "./actions";

const studentSchema = z.object({
  studentId: z.string().min(1, "Registration Number is required"),
  name: z.string().min(1, "Name is required"),
});

type StudentFormValues = z.infer<typeof studentSchema>;

type AiValidationState = {
  errors?: string[];
  correctedData?: StudentFormValues;
};

export function AddStudentForm({ onFinished }: { onFinished: () => void }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [aiState, setAiState] = useState<AiValidationState | null>(null);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      studentId: "",
      name: "",
    },
  });

  const onSubmit = (data: StudentFormValues) => {
    startTransition(async () => {
      const result = await createStudentAction(data);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        form.reset();
        onFinished();
      } else {
        if (result.correctedData) {
          setAiState({
            errors: result.errors,
            correctedData: result.correctedData as StudentFormValues,
          });
        }
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    });
  };

  const handleAcceptCorrection = () => {
    if (!aiState?.correctedData) return;
    startTransition(async () => {
      const result = await createStudentWithCorrection(aiState.correctedData!);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        form.reset();
        setAiState(null);
        onFinished();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {aiState?.correctedData && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>AI Validation Suggestion</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                {aiState.errors?.join(" ")} We've suggested some corrections.
              </p>
              <div className="space-y-1 text-xs font-mono rounded bg-muted p-2">
                {Object.entries(aiState.correctedData).map(([key, value]) => (
                  <p key={key}>
                    <span className="font-bold">{key}:</span> {value}
                  </p>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setAiState(null)}
                >
                  Ignore
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAcceptCorrection}
                  className="bg-accent hover:bg-accent/90"
                >
                  <Check className="mr-2 h-4 w-4" /> Accept Correction
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 2021000001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Alice Johnson" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Adding Student..." : "Add Student"}
        </Button>
      </form>
    </Form>
  );
}
