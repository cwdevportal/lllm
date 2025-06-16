'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Option {
  id: number
  text: string
  questionId: number
}

interface Question {
  id: number
  question: string
  answer: string
  options: Option[]
}

interface Feedback {
  questionId: number
  correctAnswer: string
  isCorrect: boolean
}

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

const ExamPage = () => {
  const router = useRouter()

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [currentPage, setCurrentPage] = useState(0)

  const currentQuestion = questions[currentPage]
  const answeredCount = Object.keys(answers).length
  const totalQuestions = questions.length
  const progress = Math.round((answeredCount / totalQuestions) * 100)

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/questions')
      const data: Question[] = await res.json()

      const randomized = shuffle(
        data.map(q => ({
          ...q,
          options: shuffle(q.options),
        }))
      )

      setQuestions(randomized)
      setAnswers({})
      setFeedback([])
      setSubmitted(false)
      setCurrentPage(0)
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

  const handleOptionChange = (qid: number, selected: string) => {
    setAnswers(prev => ({ ...prev, [qid]: selected }))
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    const unanswered = questions.find(q => !answers[q.id])
    if (unanswered) {
      toast.error('❌ Please answer all questions before submitting.')
      return
    }

    setIsSubmitting(true)
    const studentId = 'student-001'
    const formatted = Object.entries(answers).map(([qid, selected]) => ({
      questionId: qid,
      selected,
    }))

    try {
      const res = await axios.post('/api/submit', {
        studentId,
        answers: formatted,
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

      const score = feedbackData.filter(f => f.isCorrect).length
      const percent = Math.round((score / totalQuestions) * 100)

      toast.success(`🎉 You scored ${percent}%`)

      // Save feedback in DB
      await axios.post('/api/save-feedback', {
        studentId,
        feedback: feedbackData,
      })

      setSubmitted(true)
    } catch (error) {
      console.error('Submission failed:', error)
      toast.error('❌ Failed to submit answers')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetake = () => {
    toast.success('🔁 Restarting exam...')
    fetchQuestions()
  }

  const handleNext = () => {
    if (currentPage < totalQuestions - 1) setCurrentPage(currentPage + 1)
  }

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1)
  }

  if (loading) return <div className="p-4">Loading exam...</div>

  const correctCount = feedback.filter(f => f.isCorrect).length
  const percent = Math.round((correctCount / totalQuestions) * 100)
  const passed = percent >= 50

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">📝 Student Exam</h1>

      {/* Progress Bar */}
      {!submitted && (
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Question */}
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

      {/* Navigation */}
      <div className="flex justify-between mt-4 gap-4">
        <Button onClick={handlePrev} disabled={currentPage === 0}>
          ← Previous
        </Button>
        <Button onClick={() => router.push('/')}>🏠 Back to Home</Button>
        <Button
          onClick={handleNext}
          disabled={currentPage === totalQuestions - 1}
        >
          Next →
        </Button>
      </div>

      {/* Submit */}
      {!submitted && currentPage === totalQuestions - 1 && (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-6 w-full"
        >
          {isSubmitting ? 'Submitting...' : '✅ Submit Exam'}
        </Button>
      )}

      {/* Summary */}
      {submitted && (
        <div className="mt-8 text-center">
          <p className="text-xl font-semibold">
            🎯 You scored {percent}% —{' '}
            <span className={passed ? 'text-green-600' : 'text-red-600'}>
              {passed ? 'Passed' : 'Failed'}
            </span>
          </p>

          {!passed && (
            <Button onClick={handleRetake} className="mt-4">
              🔁 Retake Exam
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default ExamPage
