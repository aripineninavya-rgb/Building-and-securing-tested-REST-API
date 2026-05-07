import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthButtons } from './components/AuthButtons';
import { GymList } from './components/GymList';
import { AddGymForm } from './components/AddGymForm';
import { Profile } from './components/Profile';
import './App.css';

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Gym Review API</h1>
        <AuthButtons />
      </header>

      <main className="app-main">
        <section>
          <GymList />
        </section>

        {user && (
          <>
            <section>
              <AddGymForm />
            </section>
            <section>
              <Profile />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
