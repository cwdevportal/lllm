'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateQuestionPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  const updateOption = (index: number, value: string) => {
    const newOpts = [...options];
    newOpts[index] = value;
    setOptions(newOpts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, options }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to create question');
      } else {
        router.push('/questions');
      }
    } catch (err) {
      console.error('Error creating question:', err);
      alert('Error creating question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-blue-600 hover:underline"
        >
          ← Go Back
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Create New Question</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Correct Answer</label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
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
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Create Question'}
        </button>
      </form>
    </div>
  );
}
