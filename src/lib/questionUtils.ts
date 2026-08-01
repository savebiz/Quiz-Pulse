import { Question, QuestionType, OptionItem } from "../types";

/**
 * Intelligently converts a single question from one type to another,
 * preserving prompt text, marks, explanation, hint, difficulty, category, and tags,
 * while transforming the options / answer structure appropriately.
 */
export function convertQuestionType(question: Question, targetType: QuestionType): Question {
  if (question.type === targetType) return question;

  const base: Question = {
    ...question,
    type: targetType,
    updatedAt: new Date().toISOString(),
  };

  // Extract correct answer text from existing options if converting to text-based types
  const existingCorrectOption = question.options?.find((o) => o.isCorrect);
  const correctText =
    question.correctAnswerText ||
    existingCorrectOption?.text ||
    "Correct Answer";

  switch (targetType) {
    case "MULTIPLE_CHOICE": {
      // Build options from existing text or default options
      let options: OptionItem[];
      if (question.options && question.options.length >= 2) {
        options = question.options.map((opt, idx) => ({
          ...opt,
          isCorrect: idx === 0, // ensure at least one is selected if none
        }));
        if (!options.some((o) => o.isCorrect)) {
          options[0].isCorrect = true;
        }
      } else {
        options = [
          { id: `opt-${Date.now()}-1`, text: correctText, isCorrect: true },
          { id: `opt-${Date.now()}-2`, text: "Incorrect Choice A", isCorrect: false },
          { id: `opt-${Date.now()}-3`, text: "Incorrect Choice B", isCorrect: false },
        ];
      }
      return {
        ...base,
        options,
        correctAnswerText: undefined,
        matchingPairs: undefined,
        orderingItems: undefined,
      };
    }

    case "MULTIPLE_RESPONSE": {
      let options: OptionItem[];
      if (question.options && question.options.length >= 2) {
        options = question.options.map((opt) => ({
          ...opt,
          isCorrect: Boolean(opt.isCorrect),
        }));
      } else {
        options = [
          { id: `opt-${Date.now()}-1`, text: correctText, isCorrect: true },
          { id: `opt-${Date.now()}-2`, text: "Secondary Correct Detail", isCorrect: true },
          { id: `opt-${Date.now()}-3`, text: "Distractor Option", isCorrect: false },
        ];
      }
      return {
        ...base,
        options,
        correctAnswerText: undefined,
        matchingPairs: undefined,
        orderingItems: undefined,
      };
    }

    case "TRUE_FALSE": {
      const isFalse =
        existingCorrectOption?.text.toLowerCase().includes("false") || false;
      return {
        ...base,
        options: [
          { id: `tf-${Date.now()}-1`, text: "True", isCorrect: !isFalse },
          { id: `tf-${Date.now()}-2`, text: "False", isCorrect: isFalse },
        ],
        correctAnswerText: undefined,
        matchingPairs: undefined,
        orderingItems: undefined,
      };
    }

    case "SHORT_TEXT":
    case "FILL_IN_BLANK": {
      return {
        ...base,
        options: undefined,
        correctAnswerText: correctText,
        matchingPairs: undefined,
        orderingItems: undefined,
      };
    }

    case "PARAGRAPH": {
      // Essay / Free Text does not strictly require predefined option matches
      return {
        ...base,
        options: undefined,
        correctAnswerText: question.explanation || correctText,
        matchingPairs: undefined,
        orderingItems: undefined,
      };
    }

    case "MATCHING": {
      return {
        ...base,
        options: undefined,
        correctAnswerText: undefined,
        matchingPairs: question.matchingPairs || [
          { left: "Term 1", right: "Matching Answer 1" },
          { left: "Term 2", right: "Matching Answer 2" },
        ],
        orderingItems: undefined,
      };
    }

    case "ORDERING": {
      return {
        ...base,
        options: undefined,
        correctAnswerText: undefined,
        matchingPairs: undefined,
        orderingItems: question.orderingItems || [
          "Step 1: Initiation",
          "Step 2: Execution",
          "Step 3: Verification",
        ],
      };
    }

    default:
      return base;
  }
}

/**
 * Converts ALL questions in an array to a single target QuestionType.
 */
export function convertAllQuestionsType(
  questions: Question[],
  targetType: QuestionType
): Question[] {
  return questions.map((q) => convertQuestionType(q, targetType));
}

/**
 * Formats a question's correct answer into a human-readable snippet for outline display.
 */
export function getCorrectAnswerSnippet(q: Question): string {
  if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") {
    const correctOpt = q.options?.find((o) => o.isCorrect);
    return correctOpt ? `Key: ${correctOpt.text}` : "No key marked";
  }
  if (q.type === "MULTIPLE_RESPONSE") {
    const correctOpts = q.options?.filter((o) => o.isCorrect).map((o) => o.text);
    return correctOpts && correctOpts.length > 0 ? `Key: ${correctOpts.join(", ")}` : "No key marked";
  }
  if (q.type === "SHORT_TEXT" || q.type === "FILL_IN_BLANK") {
    return q.correctAnswerText ? `Key: "${q.correctAnswerText}"` : "No key text set";
  }
  if (q.type === "PARAGRAPH") {
    return "Essay / Manual Review";
  }
  if (q.type === "MATCHING") {
    return `${q.matchingPairs?.length || 0} Pairs`;
  }
  if (q.type === "ORDERING") {
    return `${q.orderingItems?.length || 0} Steps`;
  }
  return "";
}
