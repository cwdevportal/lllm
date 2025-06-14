'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button'; // if you're using Shadcn/UI

export default function AdminTeacherAccessPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/teacher-access').then((res) => {
      setUsers(res.data);
    });
  }, []);

  const toggleTeacher = async (id: string, enable: boolean) => {
    await axios.post('/api/teacher-access', {
      targetUserId: id,
      enable,
    });

    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, isTeacher: enable } : user
      )
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Manage Teacher Access</h1>
      {users.map((user) => (
        <div
          key={user.id}
          className="flex justify-between items-center border-b py-2"
        >
          <div>
            <div>{user.email}</div>
            <div className="text-sm text-gray-500">
              {user.name || 'No name'}
            </div>
          </div>
          <Button
            variant={user.isTeacher ? 'destructive' : 'default'}
            onClick={() => toggleTeacher(user.id, !user.isTeacher)}
          >
            {user.isTeacher ? 'Revoke Access' : 'Give Teacher Access'}
          </Button>
        </div>
      ))}
    </div>
  );
}
