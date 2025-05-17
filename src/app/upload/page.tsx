'use client';
import { useEffect, useRef, useState } from 'react';

interface S3File {
    key: string;
    url: string;
    name:string;
}

export default function UploadPage() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [filesList, setFilesList] = useState<S3File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const triggerFileSelect = () => {
        inputRef.current?.click();
    };

    const fetchFiles = async () => {
        try {
            const response = await fetch('/api/upload', {
                method: 'GET',
            });

            if (!response.ok) throw new Error('Échec de la récupération des fichiers');
            const data: S3File[] = await response.json();
            setFilesList(data);
        } catch (err) {
            console.error('Erreur lors de la récupération des fichiers :', err);
            setError('Erreur lors de la récupération des fichiers');
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleUpload = async (selectedFile: File) => {
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Échec de l\'upload');

            // Après un upload réussi, rafraîchir la liste des fichiers
            await fetchFiles();
        } catch (err) {
            console.error('Erreur lors de l\'upload :', err);
            setError('Erreur lors de l\'upload');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            handleUpload(selectedFile);
        }
    };


    const handleDelete = async (key: string) => {
        if (!confirm(`Voulez-vous vraiment supprimer le fichier "${key}" ?`)) return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/upload?key=${encodeURIComponent(key)}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Échec de la suppression');
            await fetchFiles();
        } catch (err) {
            console.error('Erreur lors de la suppression :', err);
            setError('Erreur lors de la suppression');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">AWS S3 File Manager</h1>

            <div className="mb-8 p-4 border rounded-lg bg-gray-50">
                <input
                    type="file"
                    ref={inputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                <button
                    onClick={triggerFileSelect}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                    {loading ? 'Upload en cours...' : 'Upload vers S3'}
                </button>

                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Fichiers dans le bucket</h2>
                <ul className="space-y-2">
                    {filesList.map((file, index) => (
                        <li
                            key={index}
                            className="flex items-center justify-between p-2 hover:bg-gray-50"
                        >
                            <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                {file.key}
                            </a>
                            <button
                                onClick={() => handleDelete(file.key)}
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


