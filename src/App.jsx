
import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "./supabase";
import "./index.css";
import AIExplorer from "./AIExplorer";


const categories = [
  { name: "All Creatures", icon: "✳" },
  { name: "Mammals", icon: "♧" },
  { name: "Birds", icon: "↗" },
  { name: "Reptiles", icon: "〰" },
  { name: "Marine Life", icon: "≋" },
  { name: "Amphibians", icon: "◉" },
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState("All Creatures");
  const [search, setSearch] = useState("");

  const [creatures, setCreatures] = useState([]);
const [loading, setLoading] = useState(true);

const [currentPage, setCurrentPage] = useState("museum");
const [selectedCreature, setSelectedCreature] = useState(null);

useEffect(() => {
  async function loadCreatures() {
    const { data, error } = await supabase
      .from("creatures")
      .select("*")
      .order("name");

    if (error) {
      console.error("Could not load creatures:", error.message);
    } else {
      setCreatures(data);
    }

    setLoading(false);
  }

  loadCreatures();
}, []);

  const filteredCreatures = creatures.filter((creature) => {
    const matchesCategory =
      activeCategory === "All Creatures" ||
      creature.category === activeCategory;

         
const matchesSearch =
  (creature.name || "").toLowerCase().includes(search.toLowerCase()) ||
  (creature.scientific_name || "").toLowerCase().includes(search.toLowerCase());

  

    return matchesCategory && matchesSearch;
  });

  if (currentPage === "ai") {
  return (
    <AIExplorer
      onBack={() => {
        setCurrentPage("museum");
        setSelectedCreature(null);
      }}
      selectedCreature={selectedCreature}
    />
  );
}

  return (
    <main>
      <nav className="navbar">
        <a className="brand" href="#">
          <span className="brand-mark">W</span>
          WILD<span className="brand-light">VERSE</span>
        </a>

        <div className="nav-links">
          <a className="nav-active" href="#explore">Explore</a>
          <a href="#about">Our world</a>
          <a
              href="#ai-explorer"
              onClick={(event) => {
              event.preventDefault();
              setSelectedCreature(null);
              setCurrentPage("ai");
          }}
        >
  AI Explorer ↗
</a>
        </div>

        <a className="nav-cta" href="#explore">
          Enter the wild <span>↗</span>
        </a>
      </nav>

      <section className="hero">
        <div className="hero-image" />

        <div className="hero-content">
          <div className="eyebrow">
            <span className="live-dot" />
            A LIVING DIGITAL MUSEUM
          </div>

          <h1>
            The wild is
            <br />
            <em>closer</em> than
            <br />
            you think.
          </h1>

          <p>
            From the depths of the ocean to the
            <br className="desktop-break" />
            heart of the rainforest. Meet the
            <br className="desktop-break" />
            extraordinary life sharing our planet.
          </p>

          <a className="hero-button" href="#explore">
            Discover the wild <span>↓</span>
          </a>
        </div>

        <div className="hero-bottom">
          <span>01 — THE NATURAL WORLD</span>
          <span>OBSERVE · DISCOVER · UNDERSTAND</span>
        </div>

        <div className="hero-side-label">EARTH / LIFE / WONDER</div>
      </section>

      <section className="explore-section" id="explore">
        <div className="section-heading">
          <div>
            <div className="eyebrow dark-eyebrow">YOUR NEXT DISCOVERY</div>
            <h2>Where do you want <em>to wander?</em></h2>
            <p className="section-subtitle">
              Choose a world. Meet the creatures that call it home.
            </p>
          </div>

          <div className="search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a creature..."
              aria-label="Search creatures"
            />
          </div>
        </div>

        <div className="category-list">
          {categories.map((category) => (
            <button
              key={category.name}
              className={
                activeCategory === category.name
                  ? "category-button selected"
                  : "category-button"
              }
              onClick={() => setActiveCategory(category.name)}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        <div className="results-line">
          <span>FIELD NOTES / SPECIMENS</span>
          <span>
            {String(filteredCreatures.length).padStart(2, "0")} CREATURES
          </span>
        </div>

          {loading && <p className="loading-state">Discovering the wild...</p>}
        <div className="creature-grid">
          {filteredCreatures.map((creature,index) => (
            <article className="creature-card" key={creature.name}>
              
<div className="creature-visual">
  {creature.animation_url ? (
    <video
      src={creature.animation_url}
      poster={creature.poster_url || undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  ) : (
    <img
      src={creature.poster_url || ""}
      alt={creature.name}
      loading="lazy"
    />
  )}

  <span className="specimen-number">
    {String(index + 1).padStart(2, "0")}
  </span>
  <span className="visual-label">{creature.category}</span>
  <span className="discover-icon">↗</span>
  <div className="image-caption">{creature.habitat}</div>
</div>


              <div className="creature-info">
                <div>
                  <h3>{creature.name}</h3>
                  <p className="scientific-name">
  {creature.scientific_name}
</p>
                  <button
  className="ask-ai-button"
  onClick={() => {
    setSelectedCreature(creature);
    setCurrentPage("ai");
  }}
>
  Ask AI about this creature ↗
</button>
                </div>
                <span className="species-arrow">↗</span>
              </div>
            </article>
          ))}
        </div>

        {filteredCreatures.length === 0 && (
          <div className="empty-state">
            No creatures found. Try another name or category.
          </div>
        )}
      </section>

      <section className="closing-section" id="about">
        <span className="eyebrow">EVERY SPECIES HAS A STORY</span>
        <h2>Curiosity is a way <em>of seeing.</em></h2>
        <a href="#explore">Keep exploring ↑</a>
      </section>

      <footer>
        <a className="brand footer-brand" href="#">
          <span className="brand-mark">W</span>
          WILD<span className="brand-light">VERSE</span>
        </a>
        <span>A LITTLE CLOSER TO THE NATURAL WORLD.</span>
      </footer>
    </main>
  );
}
