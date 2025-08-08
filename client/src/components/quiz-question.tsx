import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ContentItem } from "@shared/schema";

interface QuizQuestionProps {
  question: ContentItem;
  onSubmit: (selectedOption: string) => void;
  disabled?: boolean;
}

export default function QuizQuestion({ question, onSubmit, disabled = false }: QuizQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");

  const handleSubmit = () => {
    if (selectedOption) {
      onSubmit(selectedOption);
    }
  };

  const options = question.options as string[] || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {question.title}
        </h2>
        
        {question.codeSnippet && (
          <Card className="bg-gray-100 rounded-lg mb-6">
            <CardContent className="p-4">
              <pre className="text-sm text-gray-700 overflow-x-auto">
                <code>{question.codeSnippet}</code>
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      <RadioGroup 
        value={selectedOption} 
        onValueChange={setSelectedOption}
        disabled={disabled}
        className="space-y-3"
      >
        {options.map((option, index) => {
          const optionId = String.fromCharCode(65 + index); // A, B, C, D
          
          return (
            <div key={optionId} className="quiz-option">
              <Label
                htmlFor={optionId}
                className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-primary transition-colors"
              >
                <RadioGroupItem value={optionId} id={optionId} />
                <span className="text-gray-900 flex-1">{option}</span>
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      <Button
        className="w-full py-4 text-lg font-semibold h-auto"
        onClick={handleSubmit}
        disabled={!selectedOption || disabled}
      >
        Submit Answer
      </Button>
    </div>
  );
}
