// app/questions/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  question: string;
  answer: string;
  options: Option[];
  createdAt: string;
  // updatedAt?: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch list
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/questions');
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setQuestions(data);
        } else {
          console.error('Unexpected response:', data);
          setError('Failed to load questions');
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Error fetching questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Delete handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete');
      } else {
        // Remove from local state
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      alert('Error deleting question');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Questions</h1>
        <Link
          href="/questions/create"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Question
        </Link>
      </div>

      {loading ? (
        <p>Loading questions...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : questions.length === 0 ? (
        <p>No questions available.</p>
      ) : (
        <ul className="space-y-6">
          {questions.map((q) => (
            <li key={q.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold">{q.question}</h2>
              <p className="text-sm text-green-700 mt-1">Answer: {q.answer}</p>
              <ul className="mt-2 list-disc list-inside">
                {q.options.map((opt) => (
                  <li key={opt.id} className="text-gray-700">
                    {opt.text}
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-x-2">
                <Link
                  href={`/questions/${q.id}/edit`}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
