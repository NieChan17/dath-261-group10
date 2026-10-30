import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatGradeScore, scoreQuiz } from "@/lib/instructor-grading";
import type { QuizSubmission } from "@/types/submission";

const RESULT_LABELS = {
  correct: "Correct",
  incorrect: "Incorrect",
  unanswered: "Unanswered",
  "review-required": "Review required",
};

export function QuizSubmissionReview({ submission }: { submission: QuizSubmission }) {
  const result = scoreQuiz(submission.quizSnapshot);

  return (
    <section
      data-component="QuizSubmissionReview"
      aria-labelledby="quiz-review-title"
      className="quiz-review__container_01 min-w-0 space-y-5"
    >
      <div className="quiz-review__heading_01 space-y-2">
        <h2 id="quiz-review-title" className="quiz-review__title_01 font-display text-xl font-bold">
          Submitted quiz answers
        </h2>
        <p className="quiz-review__description_01 text-sm text-muted-foreground">
          Questions, choices, and answer keys are preserved from this attempt.
        </p>
      </div>

      <Card className="quiz-review__summary_01 rounded-[15px] p-5">
        <p className="quiz-review__score-label_01 text-sm font-semibold">Calculated quiz score</p>
        {result.status === "review-required" ? (
          <div className="quiz-review__review-notice_01 mt-2 space-y-2">
            <Badge variant="outline" className="quiz-review__review-badge_01">Review required</Badge>
            <p className="quiz-review__review-reason_01 text-sm">{result.reviewReason}</p>
            <p className="quiz-review__no-final-score_01 text-sm text-muted-foreground">A final calculated score is unavailable until these issues are reviewed.</p>
          </div>
        ) : (
          <p className="quiz-review__score_01 mt-1 font-display text-2xl font-bold">{formatGradeScore(result.score)} / {formatGradeScore(result.maxScore)}</p>
        )}
        <p className="quiz-review__score-note_01 mt-2 text-sm text-muted-foreground">
          This calculation is separate from the recorded grade. Reviewing this page does not change the submission.
        </p>
      </Card>

      <ol className="quiz-review__questions_01 space-y-4">
        {submission.quizSnapshot.questions.map((question, questionIndex) => {
          const questionScore = result.questions[questionIndex];
          const selectedIndex = question.selectedOptionIndex;
          const hasSelection = selectedIndex !== null && Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex < question.options.length;
          const hasValidKey = questionScore.status !== "review-required";
          return (
            <li key={question.id} className="quiz-review__question-item_01">
              <Card className="quiz-review__question_01 min-w-0 rounded-[15px] p-5 sm:p-6">
                <div className="quiz-review__question-header_01 flex flex-wrap items-start justify-between gap-3">
                  <h3 className="quiz-review__question-title_01 min-w-0 flex-1 whitespace-pre-wrap break-words font-semibold">
                    {questionIndex + 1}. {question.prompt}
                  </h3>
                  <Badge variant={questionScore.status === "correct" ? "secondary" : "outline"} className={`quiz-review__result_01 shrink-0 ${questionScore.status === "correct" ? "text-teal-800 dark:bg-teal-950 dark:text-teal-200" : ""}`}>
                    {RESULT_LABELS[questionScore.status]}
                  </Badge>
                </div>
                <p className="quiz-review__question-score_01 mt-2 text-sm text-muted-foreground">
                  {questionScore.status === "review-required" ? "Score unavailable" : `${formatGradeScore(questionScore.score)} points earned`}
                  {questionScore.maxScore !== null && ` · ${formatGradeScore(questionScore.maxScore)} maximum points`}
                </p>
                <ol aria-label={`Answer choices for question ${questionIndex + 1}`} className="quiz-review__options_01 mt-4 space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <li key={optionIndex} className="quiz-review__option_01 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border p-3 text-sm">
                      <span className="quiz-review__option-text_01 w-full min-w-0 whitespace-pre-wrap break-words sm:w-auto sm:flex-1">
                        {String.fromCharCode(65 + optionIndex)}. {option || "Empty option"}
                      </span>
                      {selectedIndex === optionIndex && <Badge variant="outline" className="quiz-review__selected_01 shrink-0">Submitted choice</Badge>}
                      {hasValidKey && question.correctOptionIndex === optionIndex && <Badge variant="secondary" className="quiz-review__correct_01 shrink-0 text-teal-800 dark:bg-teal-950 dark:text-teal-200">Correct answer</Badge>}
                    </li>
                  ))}
                </ol>
                {!hasSelection && (
                  <p className="quiz-review__missing-selection_01 mt-3 text-sm">
                    {selectedIndex === null ? "No answer submitted." : "The submitted choice does not identify an available option."}
                  </p>
                )}
                {questionScore.status === "review-required" && (
                  <p className="quiz-review__key-warning_01 mt-3 text-sm font-medium">
                    Correct answer unavailable. {questionScore.reviewReason}
                  </p>
                )}
                {question.explanation && <p className="quiz-review__explanation_01 mt-3 whitespace-pre-wrap break-words text-sm text-muted-foreground">Explanation: {question.explanation}</p>}
              </Card>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
