// app/questions/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Option {
  id: string;
  text: string;
}
interface QuestionData {
  id: string;
  question: string;
  answer: string;
  options: Option[];
}

export default function EditQuestionPage() {
  const { id } = useParams(); // question id
  const router = useRouter();
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch question on mount
  useEffect(() => {
    if (!id) {
      setError('Missing question id');
      setFetching(false);
      return;
    }
    const fetchQuestion = async () => {
      try {
        const res = await fetch(`/api/questions/${id}`);
        const data = await res.json();
        if (!res.ok) {
          console.error('Failed to fetch question:', data);
          setError(data.error || 'Failed to fetch question');
        } else {
          setQuestionText(data.question);
          setAnswerText(data.answer);
          // Extract only text strings from options
          const opts: string[] = Array.isArray(data.options)
            ? data.options.map((o: Option) => o.text)
            : [];
          setOptions(opts);
        }
      } catch (err) {
        console.error('Error fetching question:', err);
        setError('Error fetching question');
      } finally {
        setFetching(false);
      }
    };
    fetchQuestion();
  }, [id]);

  const updateOption = (index: number, value: string) => {
    const newOpts = [...options];
    newOpts[index] = value;
    setOptions(newOpts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    // basic validation: questionText, answerText, options array
    if (!questionText || !answerText || options.length < 2) {
      alert('Question, answer, and at least 2 options are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          answer: answerText,
          options,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Failed to update question:', data);
        alert(data.error || 'Failed to update question');
      } else {
        // Navigate back to list or detail
        router.push('/questions');
      }
    } catch (err) {
      console.error('Error updating question:', err);
      alert('Error updating question');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p className="p-6">Loading question...</p>;
  }
  if (error) {
    return <p className="p-6 text-red-600">Error: {error}</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Question</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Question</label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Correct Answer</label>
          <input
            type="text"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Options</label>
          {options.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              value={opt}
              onChange={(e) => updateOption(idx, e.target.value)}
              required
              placeholder={`Option ${idx + 1}`}
              className="w-full border rounded px-3 py-2 mb-2"
            />
          ))}
          {/* Optionally: Add or remove option fields dynamically */}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Question'}
        </button>
      </form>
    </div>
  );
}
