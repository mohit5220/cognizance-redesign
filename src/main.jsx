import BookingFooter from "./BookingFooter.jsx";
import HomeAdditions from "./HomeAdditions.jsx";
import EventExplorer from "./EventExplorer.jsx";

import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { motion } from "framer-motion";

import Navbar from "./Navbar.jsx";
import ParticleField from "./ParticleField.jsx";
import "./styles.css";

const events = [
  "SHADECRAFT",
  "SKY MANEUVER",
  "ARMAGEDDON",
  "TRAILBLAZE",
  "SUPER STRIKERS",
  "SCYTHE CTF",
  "BELLATRIX",
  "BLOCKATHON",
  "SNAP SYNTAX",
  "TECHZIBITION",
  "BULLS AND BEARS",
  "MATIKS CHAMPIONSHIP",
  "RUBIKS RUKUS",
  "NANO NAVIGATOR",
  "APPNOVA",
  "FLIGHTFURY",
  "ZENGRIP",
  "SPECTRAL BRIDGE",
  "BRIDGE-O-MANIA",
  "CRAWL-O-TRON",
  "PROD-G",
  "INNOQUEST",
  "FITFUSION",
  "INTERNATIONAL CODING CHALLENGE",
  "CODIFY RUMBLE",
  "TRADE OF TITANS",
  "VERDICT",
  "WIKI-RUN",
  "BIOTRACE",
  "STRAW STRIKE",
  "BGMI",
  "VALORANT",
  "TEKKEN",
  "FIFA",
  "CINEVISTA",
  "FRAME FLUX",
  "CRESTMINT",
  "FUEL FORGE",
  "SHADOW EXTRACTION",
  "GIG GUARD",
  "FAULTLINE",
  "INNOVWAVE",
  "CLAW & SHIELD",
  "PLASMA PULL",
  "BITBYBIT",
];

const resultRows = [
  ["SHADECRAFT", "First", "NA (Aarush ganjoo)"],
  ["SHADECRAFT", "Second", "Team Michael Jackson"],
  ["SHADECRAFT", "Third", "Harshita Chourasia"],
  ["SKY MANEUVER", "First", "DaVinci"],
  ["SKY MANEUVER", "Second", "Team Gravity"],
  ["SKY MANEUVER", "Third", "Aeronav"],
  ["ARMAGEDDON 8 kg", "First", "Team Bloodfire"],
  ["ARMAGEDDON 8 kg", "Second", "Team Heavy drivers"],
  ["ARMAGEDDON 8 kg", "Third", "Team KYB"],
  ["TRAILBLAZE", "First", "Harshal Ghadge"],
  ["TRAILBLAZE", "Second", "Sukhmanpreet singh"],
  ["TRAILBLAZE", "Third", "Arin Kumar"],
  ["SUPER STRIKERS", "First", "Aftab Raja"],
  ["SUPER STRIKERS", "Second", "Samip Khatiwada"],
  ["SUPER STRIKERS", "Third", "Krutarth A. Chokshi"],
  ["SCYTHE CTF", "First", "Team #~ky$L;"],
  ["SCYTHE CTF", "Second", "Team Pentagon"],
  ["SCYTHE CTF", "Third", "Team 404_GBPIET"],
];

function PageHeading({ number, eyebrow, title, description }) {
  return (
    <div className="route-heading">
      <div className="section-kicker">{number} — {eyebrow}</div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <motion.div
          className="edition-tag"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="live-dot" />
          IIT ROORKEE PRESENTS
          <span className="tag-divider">/</span>
          MARCH 2026
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 35, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9 }}
        >
          <span className="hero-line hero-line-light">EMPYREAN</span>
          <br />
          <span className="hero-line hero-line-accent">TECHNOGENESIS</span>
        </motion.h1>

        <motion.p className="hero-copy">
          Where imagination meets innovation.
          <br />
          A celebration of technology, ideas and the future.
        </motion.p>

        <div className="hero-actions">
          <Link className="button button-primary" to="/events">
            EXPLORE EVENTS <span>↗</span>
          </Link>
          <a className="button button-ghost" href="#about">
            THE EXPERIENCE <span>＋</span>
          </a>
        </div>
      </div>

      <div className="hero-aside">
        <span>29°51' N</span><i /><span>77°53' E</span>
      </div>
      <a className="scroll-cue" href="#about"><span /> SCROLL TO EXPLORE</a>
      <div className="hero-index">01 <span>/</span> 06</div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <Hero />

      <section className="about-section section-wrap" id="about">
        <div className="section-kicker">01 — THE VISION</div>
        <div className="about-grid">
          <h2>IDEAS THAT<br /><span>MOVE WORLDS.</span></h2>
          <p>
            Cognizance is the annual technical festival of IIT Roorkee.
            A meeting ground for curious minds, bold experiments and
            the people building what comes next.
          </p>
        </div>
      </section>

      <section className="home-destinations section-wrap">
        <div className="section-kicker">EXPLORE COGNIZANCE</div>
        <div className="destination-grid">
          {[
            ["EVENTS", "Discover the festival challenges.", "/events"],
            ["WORKSHOPS", "Learn from practical sessions.", "/workshops"],
            ["RESULTS", "See the published winners.", "/results"],
            ["GALLERY", "Look back at the festival.", "/gallery"],
          ].map(([title, copy, path]) => (
            <Link className="destination-card" to={path} key={path}>
              <span>↗</span>
              <h2>{title}</h2>
              <p>{copy}</p>
            </Link>
          ))}
        </div>
      </section>
      <HomeAdditions /> 
    </>
  );
}

function EventsPage() {
  return (
    <main className="route-page">
      <PageHeading
        number="01"
        eyebrow="COMPETE AND CREATE"
        title={<>THE <span>EVENTS</span></>}
        description="Explore the event categories at Cognizance."
      />
      <EventExplorer />
    </main>
  );
}

   

function WorkshopsPage() {
  return (
    <main className="route-page">
      <PageHeading
        number="02"
        eyebrow="LEARN BY BUILDING"
        title={<>THE <span>WORKSHOPS</span></>}
        description="Practical learning sessions at Cognizance."
      />

      <Link className="workshop-feature" to="/workshops/305">
        <div>
          <span className="card-caption">FEATURED WORKSHOP</span>
          <h2>UI/UX DESIGN</h2>
          <p>Explore design thinking and user experience.</p>
        </div>
        <span className="feature-arrow">↗</span>
      </Link>
    </main>
  );
}

function WorkshopDetailsPage() {
  const benefits = [
    "Certificate of Participation",
    "Internship Opportunities",
    "Industry Interaction",
    "Skill Development",
    "Networking",
    "Career Advancement",
  ];

  return (
    <main className="route-page">
      <PageHeading
        number="02"
        eyebrow="WORKSHOP DETAILS"
        title={<>UI/UX <span>DESIGN</span></>}
        description="Cognizance 2026 workshop information."
      />

      <section className="detail-panel">
        <h2>BENEFITS</h2>
        <div className="benefit-grid">
          {benefits.map((item, index) => (
            <div className="benefit-item" key={item}>
              <span>0{index + 1}</span>
              <h3>{item}</h3>
            </div>
          ))}
        </div>
        <a
          className="button button-primary"
          href="https://www.cognizance.org.in/workshops/305"
          target="_blank"
          rel="noreferrer"
        >
          VIEW OFFICIAL WORKSHOP ↗
        </a>
      </section>
    </main>
  );
}

function ResultsPage() {
  return (
    <main className="route-page">
      <PageHeading
        number="03"
        eyebrow="CELEBRATING ACHIEVEMENT"
        title={<>EVENT <span>RESULTS</span></>}
        description="Congratulations to the winners of Cognizance 2026."
      />

      <div className="results-table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th>EVENT NAME</th>
              <th>RANK</th>
              <th>PARTICIPANT / TEAM NAME</th>
            </tr>
          </thead>
          <tbody>
            {resultRows.map(([event, rank, name], index) => (
              <tr key={`${event}-${rank}-${index}`}>
                <td>{event}</td>
                <td>{rank}</td>
                <td>{name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="source-note">
        This page currently includes a verified selection of published results.
        Consult the official results page for the complete list and prize rules.
      </p>
      <a
        className="text-link"
        href="https://www.cognizance.org.in/results"
        target="_blank"
        rel="noreferrer"
      >
        VIEW ALL OFFICIAL RESULTS ↗
      </a>
    </main>
  );
}

function GalleryPage() {
  return (
    <main className="route-page">
      <PageHeading
        number="04"
        eyebrow="MOMENTS AND MEMORIES"
        title={<>THE <span>GALLERY</span></>}
        description="Cognizance 2025 at a glimpse."
      />

      <section className="asset-notice">
        <h2>THE FESTIVAL IN PICTURES</h2>
        <p>
          The official gallery contains 12 images. The original image files
          are not included in the source files you uploaded, so this page
          needs those assets before the gallery can be faithfully reproduced.
        </p>
        <a
          className="button button-primary"
          href="https://www.cognizance.org.in/gallery"
          target="_blank"
          rel="noreferrer"
        >
          OPEN OFFICIAL GALLERY ↗
        </a>
      </section>
    </main>
  );
}


function SponsorsPage() {
  const sponsorGroups = [
    {
      title: "TITLE SPONSOR",
      items: [
        {
          name: "HiLabs",
          logo: "https://storage.ghost.io/c/9f/98/9f98c569-396e-485a-be2d-9d9c9af5e0bb/content/images/size/w1200/2024/03/HiLabs.png",
        },
      ],
    },
    {
      title: "NATIONAL INITIATIVES",
      items: [
        {
          name: "Make in India",
          logo: "https://www.kindpng.com/picc/m/215-2157229_make-in-india-logo-png-transparent-png.png",
        },
        {
          name: "Skill India",
          logo: "https://cdn.pnggallery.com/wp-content/uploads/skill-india-logo-01.png",
        },
      ],
    },
    {
      title: "FESTIVAL PARTNERS",
      items: [
        {
          name: "State Bank of India",
          logo: "https://www.liblogo.com/img-logo/st4557s596-state-bank-of-india-logo-state-bank-of-india-logo-vector-eps-367-47-kb-download.png",
        },
        {
          name: "NTPC",
          logo: "https://assets-netstorage.groww.in/stock-assets/logos2/NTPC.png",
        },
        {
          name: "GAIL",
          logo: "https://companieslogo.com/img/orig/GAIL.NS-d1774394.png?t=1745758219",
        },
        {
          name: "JioSaavn",
          logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/JioSaavn_Logo.svg/3840px-JioSaavn_Logo.svg.png",
        },
        {
          name: "The Coca-Cola Company",
          logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/3840px-Coca-Cola_logo.svg.png",
        },
        {
          name: "BenQ",
          logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/BenQ-Logo.svg/3840px-BenQ-Logo.svg.png",
        },
      ],
    },
  ];

  return (
    <main className="route-page sponsors-page">
      <PageHeading
        number="05"
        eyebrow="POWERING POSSIBILITIES"
        title={<>OUR <span>SPONSORS</span></>}
        description="The partners behind Cognizance."
      />

      <section className="sponsors-content">
        {sponsorGroups.map((group) => (
          <div className="sponsor-group" key={group.title}>
            <div className="sponsor-group-heading">
              <h2>{group.title}</h2>
              <span />
            </div>

            <div className="sponsor-logo-grid">
              {group.items.map((sponsor) => (
                <div className="sponsor-logo-card" key={sponsor.name}>
                  <div className="sponsor-logo-box">
                    <img
                      src={sponsor.logo}
                      alt={`${sponsor.name} logo`}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <p>{sponsor.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

function TeamPage() {
  return (
    <main className="team-page">
      <div className="team-eyebrow">
        05 — THE PEOPLE BEHIND THE FESTIVAL
      </div>

      <h1 className="team-title">
        THE <span>TEAM</span>
      </h1>

      <p className="team-subtitle">
        Meet the people behind Cognizance.
      </p>

      <div className="team-panel">
        <h2>THE COGNIZANCE TEAM</h2>

        <p>
          Discover the team working together to make
          Cognizance an unforgettable experience.
        </p>

        <a
          href="https://www.cognizance.org.in/team"
          target="_blank"
          rel="noopener noreferrer"
          className="team-button"
        >
          OPEN OFFICIAL TEAM ↗
        </a>
      </div>
    </main>
  );
}








function NotFoundPage() {
  return (
    <main className="route-page">
      <PageHeading
        number="404"
        eyebrow="PAGE NOT FOUND"
        title={<>LOST IN <span>SPACE</span></>}
      />
      <Link className="button button-primary" to="/">BACK HOME ↗</Link>
    </main>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span className="brand-mark">✳</span>
      <span>COGNIZANCE 2026 — IIT ROORKEE</span>
      <Link to="/">BACK TO HOME ↑</Link>
    </footer>
  );
}

function AppContent() {
  const { pathname } = useLocation();
  const showSculpture =
    pathname === "/" ||
    pathname === "/events" ||
    pathname.startsWith("/events/");


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <>
      {/* Mounted once: keep the existing particle scene alive between routes. */}
      <ParticleField showSculpture={showSculpture} />
      <Navbar />

      <div className="site-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/workshops" element={<WorkshopsPage />} />
          <Route path="/workshops/305" element={<WorkshopDetailsPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/sponsors" element={<SponsorsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <BookingFooter />
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
