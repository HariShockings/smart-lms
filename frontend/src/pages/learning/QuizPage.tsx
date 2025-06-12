import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  Flag,
  Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Quiz {
  id: number;
  title: string;
  description: string;
  time_limit_minutes: number;
  pass_percentage: number;
  max_attempts: number;
}

interface Question {
  id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  points: number;
  order: number;
  answers?: Answer[];
}

interface Answer {
  id: number;
  answer_text: string;
  is_correct: boolean;
}

const QuizPage: React.FC = () => {
  const { courseId, quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: any }>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchQuizData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real implementation, you would fetch quiz and questions from the API
        // For now, we'll use mock data based on the seed data
        const mockQuiz: Quiz = {
          id: parseInt(quizId || '0'),
          title: 'Programming Basics Quiz',
          description: 'Test your understanding of basic programming concepts.',
          time_limit_minutes: 30,
          pass_percentage: 70,
          max_attempts: 3
        };

        const mockQuestions: Question[] = [
          {
            id: 1,
            question_text: 'What is a variable in programming?',
            question_type: 'multiple_choice',
            points: 2,
            order: 1,
            answers: [
              { id: 1, answer_text: 'A container that stores data values', is_correct: true },
              { id: 2, answer_text: 'A type of loop', is_correct: false },
              { id: 3, answer_text: 'A programming language', is_correct: false },
              { id: 4, answer_text: 'A computer program', is_correct: false }
            ]
          },
          {
            id: 2,
            question_text: 'Which of the following is a programming language?',
            question_type: 'multiple_choice',
            points: 1,
            order: 2,
            answers: [
              { id: 5, answer_text: 'JavaScript', is_correct: true },
              { id: 6, answer_text: 'HTML', is_correct: false },
              { id: 7, answer_text: 'CSS', is_correct: false },
              { id: 8, answer_text: 'Microsoft Word', is_correct: false }
            ]
          },
          {
            id: 3,
            question_text: 'Programming is only about writing code. True or False?',
            question_type: 'true_false',
            points: 1,
            order: 3
          }
        ];

        setQuiz(mockQuiz);
        setQuestions(mockQuestions);
        setTimeRemaining(mockQuiz.time_limit_minutes * 60); // Convert to seconds
      } catch (err: any) {
        console.error('Error fetching quiz data:', err);
        setError('Failed to load quiz. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [quizStarted, quizCompleted, timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);

    try {
      // Calculate score based on answers
      let totalPoints = 0;
      let earnedPoints = 0;

      questions.forEach(question => {
        totalPoints += question.points;
        const userAnswer = answers[question.id];

        if (question.question_type === 'multiple_choice') {
          const correctAnswer = question.answers?.find(a => a.is_correct);
          if (userAnswer === correctAnswer?.id) {
            earnedPoints += question.points;
          }
        } else if (question.question_type === 'true_false') {
          // For demo purposes, assume "False" is correct for the sample question
          if (userAnswer === 'False') {
            earnedPoints += question.points;
          }
        }
      });

      const percentage = (earnedPoints / totalPoints) * 100;
      const passed = percentage >= (quiz?.pass_percentage || 70);

      const mockResults = {
        score: earnedPoints,
        maxScore: totalPoints,
        percentage: percentage,
        passed: passed,
        timeUsed: (quiz?.time_limit_minutes || 30) * 60 - timeRemaining
      };

      setResults(mockResults);
      setQuizCompleted(true);
    } catch (err: any) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} className="me-2" />
          {error}
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning" role="alert">
          <AlertCircle size={18} className="me-2" />
          Quiz not found.
        </div>
      </div>
    );
  }

  // Quiz completion screen
  if (quizCompleted && results) {
    return (
      <div className="container-fluid py-4 fade-in">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  {results.passed ? (
                    <div className="rounded-circle bg-success bg-opacity-10 p-4 mx-auto mb-3" style={{ width: 'fit-content' }}>
                      <CheckCircle className="text-success" size={48} />
                    </div>
                  ) : (
                    <div className="rounded-circle bg-danger bg-opacity-10 p-4 mx-auto mb-3" style={{ width: 'fit-content' }}>
                      <AlertCircle className="text-danger" size={48} />
                    </div>
                  )}
                </div>

                <h2 className="mb-3">
                  {results.passed ? 'Congratulations!' : 'Quiz Completed'}
                </h2>

                <p className="text-muted mb-4">
                  {results.passed 
                    ? 'You have successfully passed the quiz!' 
                    : 'You did not meet the passing criteria this time.'}
                </p>

                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="card border-0 bg-light">
                      <div className="card-body text-center">
                        <h4 className="mb-1">{results.score}/{results.maxScore}</h4>
                        <div className="text-muted small">Score</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 bg-light">
                      <div className="card-body text-center">
                        <h4 className="mb-1">{results.percentage.toFixed(1)}%</h4>
                        <div className="text-muted small">Percentage</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 bg-light">
                      <div className="card-body text-center">
                        <h4 className="mb-1">{formatTime(results.timeUsed)}</h4>
                        <div className="text-muted small">Time Used</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 bg-light">
                      <div className="card-body text-center">
                        <h4 className="mb-1">{results.passed ? 'PASS' : 'FAIL'}</h4>
                        <div className="text-muted small">Result</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-center gap-3">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => navigate(`/courses/${courseId}`)}
                  >
                    Back to Course
                  </button>
                  {!results.passed && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.reload()}
                    >
                      Retake Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="container-fluid py-4 fade-in">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 d-flex align-items-center">
                <button 
                  className="btn btn-outline-secondary me-3"
                  onClick={() => navigate(`/courses/${courseId}`)}
                >
                  <ArrowLeft size={16} />
                </button>
                <h5 className="mb-0">{quiz.title}</h5>
              </div>
              <div className="card-body">
                <div className="text-center py-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-4 mx-auto mb-4" style={{ width: 'fit-content' }}>
                    <Award className="text-primary" size={48} />
                  </div>

                  <h3 className="mb-3">{quiz.title}</h3>
                  <p className="text-muted mb-4">{quiz.description}</p>

                  <div className="row mb-4">
                    <div className="col-md-4">
                      <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                          <Clock className="text-primary mb-2" size={24} />
                          <h5 className="mb-1">{quiz.time_limit_minutes} min</h5>
                          <div className="text-muted small">Time Limit</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                          <Flag className="text-success mb-2" size={24} />
                          <h5 className="mb-1">{quiz.pass_percentage}%</h5>
                          <div className="text-muted small">Pass Mark</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                          <CheckCircle className="text-warning mb-2" size={24} />
                          <h5 className="mb-1">{quiz.max_attempts}</h5>
                          <div className="text-muted small">Max Attempts</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <strong>Instructions:</strong>
                    <ul className="mb-0 mt-2 text-start">
                      <li>Read each question carefully before answering</li>
                      <li>You can navigate between questions using the navigation buttons</li>
                      <li>Make sure to submit your quiz before the time limit expires</li>
                      <li>Once submitted, you cannot change your answers</li>
                    </ul>
                  </div>

                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={handleStartQuiz}
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking screen
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container-fluid py-4 fade-in">
      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">{quiz.title}</h5>
                <div className="text-muted small">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
              </div>
              <div className="d-flex align-items-center">
                <Clock size={16} className="text-danger me-1" />
                <span className="text-danger fw-bold">{formatTime(timeRemaining)}</span>
              </div>
            </div>

            <div className="card-body">
              {currentQuestion && (
                <div>
                  <div className="mb-4">
                    <h6 className="mb-3">{currentQuestion.question_text}</h6>
                    <div className="text-muted small mb-3">
                      Points: {currentQuestion.points}
                    </div>

                    {currentQuestion.question_type === 'multiple_choice' && currentQuestion.answers && (
                      <div>
                        {currentQuestion.answers.map((answer) => (
                          <div key={answer.id} className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="radio"
                              name={`question_${currentQuestion.id}`}
                              id={`answer_${answer.id}`}
                              value={answer.id}
                              checked={answers[currentQuestion.id] === answer.id}
                              onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
                            />
                            <label className="form-check-label" htmlFor={`answer_${answer.id}`}>
                              {answer.answer_text}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentQuestion.question_type === 'true_false' && (
                      <div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`question_${currentQuestion.id}`}
                            id="true_option"
                            value="True"
                            checked={answers[currentQuestion.id] === 'True'}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          />
                          <label className="form-check-label" htmlFor="true_option">
                            True
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`question_${currentQuestion.id}`}
                            id="false_option"
                            value="False"
                            checked={answers[currentQuestion.id] === 'False'}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          />
                          <label className="form-check-label" htmlFor="false_option">
                            False
                          </label>
                        </div>
                      </div>
                    )}

                    {currentQuestion.question_type === 'short_answer' && (
                      <textarea
                        className="form-control"
                        rows={4}
                        placeholder="Enter your answer here..."
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      />
                    )}
                  </div>

                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ArrowLeft size={16} className="me-1" />
                      Previous
                    </button>

                    {currentQuestionIndex === questions.length - 1 ? (
                      <button
                        className="btn btn-success"
                        onClick={handleSubmitQuiz}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Submitting...
                          </>
                        ) : (
                          'Submit Quiz'
                        )}
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={handleNextQuestion}
                      >
                        Next
                        <ArrowRight size={16} className="ms-1" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h6 className="mb-0">Question Navigation</h6>
            </div>
            <div className="card-body">
              <div className="row g-2">
                {questions.map((_, index) => (
                  <div key={index} className="col-3">
                    <button
                      className={`btn btn-sm w-100 ${
                        index === currentQuestionIndex
                          ? 'btn-primary'
                          : answers[questions[index].id]
                          ? 'btn-success'
                          : 'btn-outline-secondary'
                      }`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <div className="d-flex justify-content-between text-muted small mb-1">
                  <span>Progress</span>
                  <span>{Object.keys(answers).length}/{questions.length}</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body">
              <h6 className="card-title">Quiz Information</h6>
              <ul className="list-unstyled small mb-0">
                <li className="mb-2">
                  <strong>Total Questions:</strong> {questions.length}
                </li>
                <li className="mb-2">
                  <strong>Time Limit:</strong> {quiz.time_limit_minutes} minutes
                </li>
                <li className="mb-2">
                  <strong>Pass Mark:</strong> {quiz.pass_percentage}%
                </li>
                <li>
                  <strong>Attempts Allowed:</strong> {quiz.max_attempts}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;