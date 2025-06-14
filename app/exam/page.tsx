'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

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

const shuffle = <T,>(arr: T[]): T[] =>
  [...arr].sort(() => Math.random() - 0.5)

const ExamPage = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback[]>([])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/questions')
        const data: Question[] = await res.json()

        // ✅ Shuffle questions and their options
        const randomized = shuffle(
          data.map(q => ({
            ...q,
            options: shuffle(q.options),
          }))
        )

        setQuestions(randomized)
      } catch (error) {
        console.error('Failed to fetch questions:', error)
        toast.error('❌ Failed to load questions')
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  const handleOptionChange = (qid: number, selected: string) => {
    setAnswers(prev => ({ ...prev, [qid]: selected }))
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    // ✅ Prevent if any question is unanswered
    const unanswered = questions.find(q => !answers[q.id])
    if (unanswered) {
      toast.error('❌ Please answer all questions before submitting.')
      return
    }

    setIsSubmitting(true)

    const studentId = 'student-001' // Replace with real session logic
  const formatted = Object.entries(answers).map(([qid, selected]) => ({
  questionId: qid, // ✅ keep UUID as string
  selected,
}))

    try {
      const res = await axios.post('/api/submit', {
        studentId,
        answers: formatted,
      })

      const { score, total } = res.data
      toast.success(`✅ You scored ${score} out of ${total}`)
      setSubmitted(true)

console.log("Score:", score, "Total Questions:", total);


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

      // ✅ Save feedback in DB
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

  if (loading) return <div className="p-4">Loading exam...</div>

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">📝 Student Exam</h1>

      {questions.map((q, idx) => {
        const userSelected = answers[q.id]
        const result = feedback.find(f => f.questionId === q.id)

        return (
          <div key={q.id} className="mb-6 border-b pb-4">
            <h2 className="text-lg font-semibold">
              {idx + 1}. {q.question}
            </h2>

            <div className="space-y-2 mt-2">
              {q.options.map(opt => (
                <label key={opt.id} className="block">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt.text}
                    disabled={submitted}
                    checked={userSelected === opt.text}
                    onChange={() => handleOptionChange(q.id, opt.text)}
                    className="mr-2"
                  />
                  {opt.text}
                </label>
              ))}
            </div>

            {submitted && result && (
              <p className={`mt-2 font-medium ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {result.isCorrect
                  ? '✅ Correct'
                  : `❌ Wrong. Correct Answer: ${result.correctAnswer}`}
              </p>
            )}
          </div>
        )
      })}

      {!submitted && (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-4"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      )}
    </div>
  )
}

export default ExamPage
