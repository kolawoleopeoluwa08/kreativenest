import { Outlet, ScrollRestoration } from 'react-router-dom';
import { FilmGrain } from './FilmGrain';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function PublicLayout() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <FilmGrain />
      <Navbar />
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
