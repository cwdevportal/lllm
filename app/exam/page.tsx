'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'

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

const ExamPage = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/questions')
        const data = await res.json()
        setQuestions(data)
      } catch (error) {
        console.error('Failed to fetch questions:', error)
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
    const studentId = 'student-001' // Replace with real session logic
    const formatted = Object.entries(answers).map(([qid, selected]) => ({
      questionId: parseInt(qid),
      selected,
    }))

    try {
      await axios.post('/api/submit', {
        studentId,
        answers: formatted,
      })
      alert('Answers submitted successfully!')
    } catch (error) {
      console.error('Submission failed:', error)
      alert('Failed to submit answers.')
    }
  }

  if (loading) return <div className="p-4">Loading exam...</div>

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">📝 Student Exam</h1>

      {questions.map((q, idx) => (
        <div key={q.id} className="mb-6">
          <h2 className="text-lg font-semibold">{idx + 1}. {q.question}</h2>
          <div className="space-y-2 mt-2">
            {q.options.map(opt => (
              <label key={opt.id} className="block">
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={opt.text}
                  checked={answers[q.id] === opt.text}
                  onChange={() => handleOptionChange(q.id, opt.text)}
                  className="mr-2"
                />
                {opt.text}
              </label>
            ))}
          </div>
        </div>
      ))}

      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  )
}

export default ExamPage
