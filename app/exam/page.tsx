'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Option {
  id: string
  text: string
  questionId: string
}

interface Question {
  id: string
  question: string
  answer: string
  options: Option[]
}

interface Feedback {
  questionId: string
  correctAnswer: string
  isCorrect: boolean
}



const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

const ExamPage = () => {
  const router = useRouter()

const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [timeLeft, setTimeLeft] = useState(45 * 60)
  const [autosaveTime, setAutosaveTime] = useState<Date | null>(null)

  const currentQuestion = questions[currentPage]
  const answeredCount = Object.keys(answers).length
  const totalQuestions = questions.length
  const progress = Math.round((answeredCount / totalQuestions) * 100)



  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const savedQuestions = localStorage.getItem('exam-questions')
      const savedAnswers = localStorage.getItem('exam-answers')
      const savedPage = localStorage.getItem('exam-page')
      const savedTime = localStorage.getItem('exam-timeLeft')
      const savedSubmitted = localStorage.getItem('exam-submitted')
      const savedFeedback = localStorage.getItem('exam-feedback')

      let questionData: Question[] = []

      if (savedQuestions) {
        questionData = JSON.parse(savedQuestions)
      } else {
        const res = await fetch('/api/questions')
        const data: Question[] = await res.json()
        questionData = shuffle(data.map(q => ({
          ...q,
          options: shuffle(q.options),
        })))
        localStorage.setItem('exam-questions', JSON.stringify(questionData))
      }

      setQuestions(questionData)

      if (savedAnswers) setAnswers(JSON.parse(savedAnswers))
      if (savedPage) setCurrentPage(Number(savedPage))
      if (savedTime) setTimeLeft(Number(savedTime))
      if (savedSubmitted) setSubmitted(savedSubmitted === 'true')
      if (savedFeedback) setFeedback(JSON.parse(savedFeedback))
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      toast.error('❌ Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])


useEffect(() => {
  if (submitted) return

  if (autosaveTimerRef.current) {
    clearTimeout(autosaveTimerRef.current)
  }

  autosaveTimerRef.current = setTimeout(() => {
    localStorage.setItem('exam-answers', JSON.stringify(answers))
    localStorage.setItem('exam-page', currentPage.toString())
    localStorage.setItem('exam-timeLeft', timeLeft.toString())
    localStorage.setItem('exam-submitted', submitted.toString())
    localStorage.setItem('exam-feedback', JSON.stringify(feedback))
    setAutosaveTime(new Date())
  }, 1000) // autosave delay = 1 second

  return () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
    }
  }
}, [answers, currentPage, timeLeft, submitted, feedback])


useEffect(() => {
  if (submitted || timeLeft <= 0) return;

  const interval = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(interval)
        handleSubmit()
        return 0
      }
      return prev - 1
    })
  }, 1000)

  return () => clearInterval(interval)
}, [submitted, timeLeft]) // <-- Add timeLeft here


  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('exam-answers', JSON.stringify(answers))
      localStorage.setItem('exam-page', currentPage.toString())
      localStorage.setItem('exam-timeLeft', timeLeft.toString())
      localStorage.setItem('exam-submitted', submitted.toString())
      localStorage.setItem('exam-feedback', JSON.stringify(feedback))
      setAutosaveTime(new Date())
    }, 5000)
    return () => clearInterval(interval)
  }, [answers, currentPage, timeLeft, submitted, feedback])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  const handleOptionChange = (qid: string, selected: string) => {
    setAnswers(prev => ({ ...prev, [qid]: selected }))
  }

  const handleSubmit = async () => {
    if (isSubmitting || submitted) return
    const unanswered = questions.find(q => !answers[q.id])
    if (unanswered) {
      toast.error('❌ Please answer all questions before submitting.')
      return
    }

    setIsSubmitting(true)
    const studentId = 'student-001'

    try {
      await axios.post('/api/submit', {
        studentId,
        answers: Object.entries(answers).map(([qid, selected]) => ({
          questionId: qid,
          selected,
        })),
      })

      const feedbackData = questions.map(q => {
        const selectedAnswer = answers[q.id] || ''
        return {
          questionId: q.id,
          correctAnswer: q.answer,
          isCorrect:
            q.answer.trim().toLowerCase() === selectedAnswer.trim().toLowerCase(),
        }
      })

      setFeedback(feedbackData)
      setSubmitted(true)

      localStorage.setItem('exam-feedback', JSON.stringify(feedbackData))
      localStorage.setItem('exam-submitted', 'true')

      const score = feedbackData.filter(f => f.isCorrect).length
      const percent = Math.round((score / totalQuestions) * 100)
      toast.success(`🎉 You scored ${percent}%`)

      await axios.post('/api/save-feedback', {
        studentId,
        feedback: feedbackData,
      })
    } catch (error) {
      console.error('Submission failed:', error)
      toast.error('❌ Failed to submit answers')
    } finally {
      setIsSubmitting(false)
    }
  }

const handleRetake = async () => {
  setLoading(true)

  // Clear saved data
  localStorage.removeItem('exam-answers')
  localStorage.removeItem('exam-page')
  localStorage.removeItem('exam-timeLeft')
  localStorage.removeItem('exam-submitted')
  localStorage.removeItem('exam-feedback')
  localStorage.removeItem('exam-questions')

  // Reset local state
  setAnswers({})
  setSubmitted(false)
  setFeedback([])
  setCurrentPage(0)
  setTimeLeft(45 * 60)
  setAutosaveTime(null)

  toast.success('🔁 Restarting exam...')

  await fetchQuestions() // Wait until questions are reloaded
  setLoading(false)      // Hide loading spinner
}



  const handleNext = () => {
    if (currentPage < totalQuestions - 1) setCurrentPage(currentPage + 1)
  }

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1)
  }

  if (loading) {
    return (
      <div className="p-4 text-lg font-medium">
        Loading exam<span className="dots ml-1" />
        <style jsx>{`
          .dots::after {
            display: inline-block;
            animation: dots 1.5s steps(3, end) infinite;
            content: '...';
          }
          @keyframes dots {
            0% { content: ''; }
            33% { content: '.'; }
            66% { content: '..'; }
            100% { content: '...'; }
          }
        `}</style>
      </div>
    )
  }

  const correctCount = feedback.filter(f => f.isCorrect).length
  const percent = Math.round((correctCount / totalQuestions) * 100)
  const passed = percent >= 50

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">📝 Student Exam</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold text-red-600">
          ⏳ Time Left: {formatTime(timeLeft)}
        </div>
        {autosaveTime && (
          <div className="text-sm text-gray-600">
            Last autosaved: {autosaveTime.toLocaleTimeString()}
          </div>
        )}
      </div>

      {!submitted && (
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {currentQuestion && (
        <div className="mb-6 border-b pb-4">
          <h2 className="text-lg font-semibold">
            {currentPage + 1}. {currentQuestion.question}
          </h2>

          <div className="space-y-2 mt-2">
            {currentQuestion.options.map(opt => (
              <label key={opt.id} className="block">
                <input
                  type="radio"
                  name={`q-${currentQuestion.id}`}
                  value={opt.text}
                  disabled={submitted}
                  checked={answers[currentQuestion.id] === opt.text}
                  onChange={() => handleOptionChange(currentQuestion.id, opt.text)}
                  className="mr-2"
                />
                {opt.text}
              </label>
            ))}
          </div>

          {submitted && (
            <p
              className={`mt-2 font-medium ${
                feedback.find(f => f.questionId === currentQuestion.id)?.isCorrect
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {feedback.find(f => f.questionId === currentQuestion.id)?.isCorrect
                ? '✅ Correct'
                : `❌ Wrong. Correct: ${currentQuestion.answer}`}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between mt-4 gap-4">
        <Button onClick={handlePrev} disabled={currentPage === 0}>← Previous</Button>
        <Button
          onClick={() => {
            
            router.push('/')
          }}
        >
          🏠 Back to Home
        </Button>
        <Button onClick={handleNext} disabled={currentPage === totalQuestions - 1}>Next →</Button>
      </div>

      {!submitted && currentPage === totalQuestions - 1 && (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-6 w-1/3 mx-auto block"
        >
          {isSubmitting ? 'Submitting...' : '✅ Submit Exam'}
        </Button>
      )}

      {submitted && (
        <div className="mt-8 text-center">
          <p className="text-xl font-semibold">
            🎯 You scored {percent}% —{' '}
            <span className={passed ? 'text-green-600' : 'text-red-600'}>
              {passed ? 'Passed' : 'Failed'}
            </span>
          </p>

          <Button onClick={handleRetake} className="mt-4">
            🔁 Retake Exam
          </Button>

          <div className="mt-6 text-left">
            <h3 className="text-lg font-bold mb-2">📋 Answer Review</h3>
            {questions.map(q => {
              const userAnswer = answers[q.id]
              const isCorrect = q.answer.trim().toLowerCase() === userAnswer?.trim().toLowerCase()
              return (
                <div key={q.id} className="mb-4">
                  <p className="font-medium">{q.question}</p>
                  <p>
                    Your answer: {userAnswer || 'N/A'}{' '}
                    <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                      ({isCorrect ? 'Correct' : `Wrong. Correct: ${q.answer}`})
                    </span>
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamPage
