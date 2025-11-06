import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Check, Sparkles, Trophy } from "lucide-react";

const lessonContent: Record<string, any> = {
  "1": {
    title: "What is Artificial Intelligence?",
    description: "Let's discover what AI is and how it helps us every day!",
    content: [
      {
        type: "text",
        text: "🤖 AI stands for Artificial Intelligence. It's when computers learn to think and make decisions, kind of like how you learn new things!",
      },
      {
        type: "text",
        text: "🎮 AI is all around you! It's in video games that get harder as you play, in voice assistants like Siri or Alexa, and even in apps that recommend your favorite videos!",
      },
      {
        type: "image",
        text: "AI helps us in many ways:",
        points: [
          "🎨 Creating art and music",
          "🏥 Helping doctors find diseases",
          "🚗 Making self-driving cars",
          "📱 Making apps smarter",
        ],
      },
    ],
    challenge: {
      question: "Which of these uses AI?",
      options: [
        "A calculator that adds 2+2",
        "A voice assistant that answers questions",
        "A light switch",
        "A regular clock",
      ],
      correct: 1,
    },
    xpReward: 50,
  },
};

export default function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showReward, setShowReward] = useState(false);

  const lesson = lessonContent[id || "1"] || lessonContent["1"];
  const totalSlides = lesson.content.length;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setShowChallenge(true);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleSubmitChallenge = () => {
    if (selectedAnswer === lesson.challenge.correct) {
      setShowReward(true);
      setTimeout(() => {
        navigate("/home");
      }, 3000);
    }
  };

  if (showReward) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-accent/20 flex items-center justify-center p-4">
        <div className="playful-card text-center max-w-md animate-bounce-in">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center animate-glow">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            Awesome Job! 🎉
          </h1>
          <p className="text-xl mb-6">
            You earned <span className="font-bold text-accent">{lesson.xpReward} XP</span>!
          </p>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-muted-foreground">Returning to home...</span>
          </div>
        </div>
      </div>
    );
  }

  if (showChallenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
        <div className="max-w-3xl mx-auto py-8">
          <Button
            variant="ghost"
            onClick={() => setShowChallenge(false)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Lesson
          </Button>

          <div className="playful-card animate-bounce-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Mini Challenge!</h2>
              <p className="text-muted-foreground">Test what you learned</p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-6">{lesson.challenge.question}</h3>
              <div className="space-y-3">
                {lesson.challenge.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ${
                      selectedAnswer === index
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswer === index
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {selectedAnswer === index && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="playful"
              size="xl"
              onClick={handleSubmitChallenge}
              disabled={selectedAnswer === null}
              className="w-full"
            >
              Submit Answer <Sparkles className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentContent = lesson.content[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <Button variant="ghost" onClick={() => navigate("/home")} className="mb-6">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Home
        </Button>

        <div className="playful-card mb-6">
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-muted-foreground">{lesson.description}</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-6">
          {lesson.content.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                index <= currentSlide ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Lesson Content */}
        <div className="playful-card min-h-[400px] flex flex-col">
          <div className="flex-1">
            {currentContent.type === "text" && (
              <p className="text-xl leading-relaxed">{currentContent.text}</p>
            )}
            {currentContent.type === "image" && (
              <div>
                <p className="text-xl mb-6">{currentContent.text}</p>
                <div className="space-y-3">
                  {currentContent.points?.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl"
                    >
                      <span className="text-2xl">{point.split(" ")[0]}</span>
                      <span className="text-lg">{point.substring(point.indexOf(" ") + 1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={currentSlide === 0}
            >
              Previous
            </Button>
            <Button
              variant="playful"
              size="lg"
              onClick={handleNext}
              className="flex-1"
            >
              {currentSlide === totalSlides - 1 ? (
                <>
                  Take Challenge <Sparkles className="ml-2" />
                </>
              ) : (
                <>
                  Next <Play className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
