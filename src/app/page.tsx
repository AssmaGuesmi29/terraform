// app/page.tsx
export default function Home() {
    return (
        <main className="page-container">
            <h1>Bienvenue sur notre plateforme</h1>
            <p>Voici une brève description de ce que nous faisons.</p>
            <div className="button-group">
                <a href="/upload" className="btn btn-primary">Téléverser</a>
                <a href="/users" className="btn btn-secondary">Utilisateurs</a>
            </div>
        </main>
    );
}
