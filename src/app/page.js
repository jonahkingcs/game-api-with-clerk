"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";

function unique(values) {
  return [...new Set(values)].sort();
}

export default function Home() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const [genre, setGenre] = useState("");
  const [franchise, setFranchise] = useState("");
  const [consoleVal, setConsoleVal] = useState("");
  const [q, setQ] = useState("");

  async function loadGames() {
    setLoading(true);
    try {
      const res = await fetch("/api/games");

      if (!res.ok) {
        const text = await res.text();
        console.error("GET /api/games failed:", res.status, text);
        setGames([]);
        return;
      }

      const text = await res.text();
      console.log("RAW /api/games response:", text);

      const data = text ? JSON.parse(text) : { Games: [] };
      setGames(data.Games || []);
    } catch (e) {
      console.error(e);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();
  }, []);

  const genreOptions = useMemo(
    () => unique(games.map((g) => g.genre).filter(Boolean)),
    [games]
  );
  const franchiseOptions = useMemo(
    () => unique(games.map((g) => g.franchise).filter(Boolean)),
    [games]
  );
  const consoleOptions = useMemo(
    () => unique(games.map((g) => g.console).filter(Boolean)),
    [games]
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return games.filter((g) => {
      if (genre && (g.genre || "").toLowerCase() !== genre.toLowerCase()) return false;
      if (franchise && (g.franchise || "").toLowerCase() !== franchise.toLowerCase()) return false;
      if (consoleVal && (g.console || "").toLowerCase() !== consoleVal.toLowerCase()) return false;

      if (!query) return true;

      const hay = [
        g.title,
        g.description,
        Array.isArray(g.characters) ? g.characters.join(" ") : g.characters,
        g.franchise,
        g.console,
        g.genre,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });
  }, [games, genre, franchise, consoleVal, q]);

  return (
    <main>
      <div className="topbar">
        <img src="/img/logo.png" alt="MyGamesInventory Logo" />
        <div className="auth">
          {/* In the old app this had #filters, #who, login/logout.
              In your new app, Navbar handles auth UI via Clerk. */}
          <Navbar />
        </div>
      </div>

      <section className="controls">
        <label>
          Genre:
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">All</option>
            {genreOptions.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>

        <label>
          Franchise:
          <select value={franchise} onChange={(e) => setFranchise(e.target.value)}>
            <option value="">All</option>
            {franchiseOptions.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>

        <label>
          Console:
          <select value={consoleVal} onChange={(e) => setConsoleVal(e.target.value)}>
            <option value="">All</option>
            {consoleOptions.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>

        <label className="search">
          Search:
          <input
            type="search"
            placeholder="Search title, description, characters"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </section>

      <section id="results">
        {loading ? (
          <p className="empty">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="empty">No results</p>
        ) : (
          filtered.map((g) => {
            // same image logic as before
            const raw = g.image || "";
            let imageSrc = "https://via.placeholder.com/150x100?text=No+Image";
            if (raw) {
              if (/^https?:\/\//i.test(raw)) imageSrc = raw;
              else imageSrc = raw.startsWith("/") ? raw : `/${raw}`;
            }

            return (
              <article className="game" key={g._id}>
                <div className="card-header">
                  <h2>{g.title}</h2>

                  <div className="meta">
                    <span>{g.console || "Unknown console"}</span> •{" "}
                    <span>{g.release_date || "Unknown date"}</span>
                  </div>

                  {g.description ? <p className="desc">{g.description}</p> : null}

                  <p className="chars">
                    <strong>Characters:</strong>{" "}
                    {Array.isArray(g.characters) ? g.characters.join(", ") : g.characters || ""}
                  </p>

                  <p className="devpub">
                    {g.developer ? `${g.developer}` : ""}
                    {g.publisher ? ` — ${g.publisher}` : ""}
                  </p>

                  <p className="genre">Genre: {g.genre || "—"}</p>
                </div>

                <img src={imageSrc} alt={`${g.title} cover image`} />
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
