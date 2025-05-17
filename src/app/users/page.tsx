
'use client';

import { useEffect, useState } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError('Erreur lors de la récupération des utilisateurs');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            });
            if (!res.ok) throw new Error('Erreur lors de l\'ajout');
            setName('');
            setEmail('');
            fetchUsers();
        } catch (err) {
            setError('Erreur lors de l\'ajout de l\'utilisateur');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Confirmer la suppression de cet utilisateur ?')) return;
        setLoading(true);
        try {
            const res = await fetch('/api/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error('Erreur lors de la suppression');
            fetchUsers();
        } catch (err) {
            setError('Erreur lors de la suppression de l\'utilisateur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Gestion des utilisateurs</h1>

            <div className="mb-8 p-4 border rounded-lg bg-gray-50">
                <input
                    type="text"
                    placeholder="Nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mr-2 p-2 border rounded"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mr-2 p-2 border rounded"
                />
                <button
                    onClick={handleAddUser}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {loading ? 'Ajout en cours...' : 'Ajouter'}
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Liste des utilisateurs</h2>
                <ul className="space-y-2">
                    {users.map((user) => (
                        <li
                            key={user.id}
                            className="flex items-center justify-between p-2 hover:bg-gray-50"
                        >
                            <span>{user.name} ({user.email})</span>
                            <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={loading}
                                className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Supprimer
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
