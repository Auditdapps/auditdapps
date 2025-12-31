// src/pages/SelfAudit.tsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AgreementStep from "../components/SelfAudit/AgreementStep";
import SelectUserType from "../components/SelfAudit/SelectUserType";
import StepIndicator from "../components/SelfAudit/StepIndicator";
import { developerQuestions } from "../data/developerQuestions";
import { organizationQuestions } from "../data/organizationQuestions";
import { supabase } from "../lib/supabaseClient";
import { savePendingAnswers } from "@/lib/pendingAudit";

type RawUserType = "developer" | "organization";
type TitleCaseUser = "Developer" | "Organization";

type Question = {
  question: string;
  options: string[];
  type: "single" | "multi";
};

export default function SelfAudit() {
  const navigate = useNavigate();

  const [agreed, setAgreed] = useState(false);
  const [userType, setUserType] = useState<RawUserType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [answersByQuestion, setAnswersByQuestion] = useState<Record<string, string[]>>({});
  const [othersByQuestion, setOthersByQuestion] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isLoggedInUser, setIsLoggedInUser] = useState<boolean | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(10);

  // Pick questions based on user type
  const questions: Question[] = useMemo(() => {
    if (userType === "developer") return developerQuestions as Question[];
    if (userType === "organization") return organizationQuestions as Question[];
    return [];
  }, [userType]);

  const totalQuestions = questions.length;
  const currentQuestion = totalQuestions ? questions[currentQuestionIndex] : null;

  // Step indicator: 0 = Agreement, 1 = Type, 2 = Checklist, 3 = Submit
  const currentStepForIndicator = useMemo(() => {
    if (!agreed) return 0;
    if (!userType) return 1;
    if (finished) return 3;
    return 2;
  }, [agreed, userType, finished]);

  const handleAgree = (value: boolean) => {
    if (value) setAgreed(true);
  };

  const handleSelectUserType = (value: "developer" | "organization") => {
    setUserType(value);
    setCurrentQuestionIndex(0);
  };

  const updateAnswer = (questionText: string, option: string, type: "single" | "multi") => {
    setAnswersByQuestion((prev) => {
      const existing = prev[questionText] || [];
      if (type === "single") {
        return { ...prev, [questionText]: [option] };
      }

      const exists = existing.includes(option);
      const next = exists ? existing.filter((o) => o !== option) : [...existing, option];
      return { ...prev, [questionText]: next };
    });
  };

  const updateOtherText = (questionText: string, value: string) => {
    setOthersByQuestion((prev) => ({ ...prev, [questionText]: value }));
  };

  const goNextQuestion = async () => {
    if (!currentQuestion || !userType) return;

    const isLast = currentQuestionIndex === totalQuestions - 1;
    if (isLast) {
      await handleFinish();
    } else {
      setCurrentQuestionIndex((idx) => idx + 1);
    }
  };

  const goPrevQuestion = () => {
    setCurrentQuestionIndex((idx) => Math.max(0, idx - 1));
  };

  const handleFinish = async () => {
    if (!userType || !questions.length) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const titleCase: TitleCaseUser = userType === "developer" ? "Developer" : "Organization";

      // Build payload using question text as the key – this matches ContinueAudit expectations
      const responses: Record<string, string[]> = {};
      const othersInput: Record<string, string> = {};
      const questionsInOrder = questions.map((q) => ({ question: q.question }));

      for (const q of questions) {
        const key = q.question;
        const selected = answersByQuestion[key] || [];
        if (selected.length) {
          responses[key] = selected;
        }
        const other = (othersByQuestion[key] || "").trim();
        if (other) {
          othersInput[key] = other;
        }
      }

      // Persist answers locally so /continue-audit can pick them up
      savePendingAnswers({
        user_type: titleCase,
        answers: {
          responses,
          othersInput,
          questionsInOrder,
        },
      });

      // Check if user is already logged in
      const { data } = await supabase.auth.getUser();
      const loggedIn = !!data?.user;
      setIsLoggedInUser(loggedIn);

      // Show completion UI + reset countdown
      setRedirectCountdown(10);
      setFinished(true);
      setIsSubmitting(false);
    } catch (e: any) {
      console.error("[SelfAudit] handleFinish error:", e);
      setError(e?.message || "Something went wrong while preparing your audit.");
      setIsSubmitting(false);
      setFinished(false);
    }
  };

  // Countdown + redirect logic
  useEffect(() => {
    if (!finished) return;
    if (isLoggedInUser === null) return; // wait until we know auth status

    if (redirectCountdown <= 0) {
      const nextAfterGeneration = "/audits";
      const continueUrl = `/continue-audit?next=${encodeURIComponent(nextAfterGeneration)}`;

      if (isLoggedInUser) {
        navigate(continueUrl);
      } else {
        navigate(`/login?next=${encodeURIComponent(continueUrl)}`);
      }
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown((s) => s - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [finished, redirectCountdown, isLoggedInUser, navigate]);

  const hasStartedChecklist = agreed && !!userType;

  // Disable Next until question is answered (and “Other” text filled if needed)
  const canProceedQuestion = (() => {
    if (!currentQuestion) return false;
    const key = currentQuestion.question;
    const selected = answersByQuestion[key] || [];
    if (!selected.length) return false;

    const hasOtherOption = selected.some((opt) => opt.toLowerCase().includes("other"));
    if (!hasOtherOption) return true;

    const otherText = (othersByQuestion[key] || "").trim();
    return !!otherText;
  })();

  return (
    <div className="min-h-screen bg-slate-950/90 py-10">
      <div className="mx-auto max-w-4xl px-4">
        <StepIndicator currentStep={currentStepForIndicator} />

        <AnimatePresence mode="wait">
          {!agreed && (
            <motion.div
              key="agreement"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="mt-10"
            >
              <AgreementStep onAgree={handleAgree} />
            </motion.div>
          )}

          {agreed && !userType && (
            <motion.div
              key="select-type"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="mt-10"
            >
              <SelectUserType onSelect={handleSelectUserType} />
            </motion.div>
          )}

          {hasStartedChecklist && !finished && currentQuestion && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="mt-10"
            >
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-6 shadow-xl">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-sky-400">
                    Checklist
                  </div>
                  {totalQuestions > 0 && (
                    <div className="text-xs text-slate-400">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {totalQuestions > 0 && (
                  <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-indigo-500"
                      style={{
                        width: `${Math.round(
                          ((currentQuestionIndex + 1) / totalQuestions) * 100
                        )}%`,
                      }}
                    />
                  </div>
                )}

                <div className="mb-4 text-base font-medium text-slate-50">
                  {currentQuestion.question}
                </div>

                <div className="space-y-2">
                  {currentQuestion.options.map((opt) => {
                    const key = currentQuestion.question;
                    const selected = answersByQuestion[key] || [];
                    const isChecked = selected.includes(opt);
                    const inputType = currentQuestion.type === "single" ? "radio" : "checkbox";

                    return (
                      <label
                        key={opt}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                          isChecked
                            ? "border-sky-500/80 bg-sky-500/10 text-slate-50"
                            : "border-slate-700/80 bg-slate-900/60 text-slate-200 hover:border-slate-500"
                        }`}
                      >
                        <input
                          type={inputType}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                          name={key}
                          checked={isChecked}
                          onChange={() => updateAnswer(key, opt, currentQuestion.type)}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>

                {/* "Other" text input if selected */}
                {currentQuestion.options.some((o) => o.toLowerCase().includes("other")) && (() => {
                  const key = currentQuestion.question;
                  const selected = answersByQuestion[key] || [];
                  const hasOtherSelected = selected.some((o) =>
                    o.toLowerCase().includes("other")
                  );
                  if (!hasOtherSelected) return null;
                  return (
                    <div className="mt-3">
                      <label className="mb-1 block text-xs font-medium text-slate-300">
                        Please specify
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        value={othersByQuestion[currentQuestion.question] || ""}
                        onChange={(e) => updateOtherText(currentQuestion.question, e.target.value)}
                        placeholder="Add a bit more detail here..."
                      />
                    </div>
                  );
                })()}

                <div className="mt-6 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={goPrevQuestion}
                    disabled={currentQuestionIndex === 0 || isSubmitting}
                    className="rounded-md border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={goNextQuestion}
                    disabled={!canProceedQuestion || isSubmitting}
                    className="rounded-md bg-sky-500 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {currentQuestionIndex === totalQuestions - 1
                      ? isSubmitting
                        ? "Finishing..."
                        : "Finish & generate AI audit"
                      : "Next question"}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 text-xs text-rose-400" role="alert">
                    {error}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {finished && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="mx-auto mt-10 max-w-3xl rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center text-emerald-800 shadow-lg"
            >
              <h2 className="mb-3 text-2xl font-bold tracking-tight">
                Self audit complete ✅
              </h2>
              <p className="mb-3 text-sm">
                Thanks for walking through the checklist — your answers are now ready for analysis.
              </p>

              {isLoggedInUser === true && (
                <>
                  <p className="mb-1 text-sm">
                    Great job. We&apos;re generating your AI-powered audit and will take you
                    straight to your audit details.
                  </p>
                  <p className="text-xs text-emerald-700/90">
                    Redirecting in <span className="font-semibold">{redirectCountdown}s</span>…
                  </p>
                </>
              )}

              {isLoggedInUser === false && (
                <>
                  <p className="mb-1 text-sm">
                    To view and save your full AI-powered audit report, you&apos;ll need to sign in
                    or create a free account.
                  </p>
                  <p className="text-xs text-emerald-700/90">
                    Redirecting to login in{" "}
                    <span className="font-semibold">{redirectCountdown}s</span>…
                  </p>
                </>
              )}

              {isLoggedInUser === null && (
                <p className="text-xs text-emerald-700/90">
                  Preparing your audit, please hold on…
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
