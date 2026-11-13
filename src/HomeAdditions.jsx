
import React from "react";
import { Link } from "react-router-dom";

const domains = [
  {
    n: "01",
    title: "ROBOTICS",
    tag: "BUILD · ENGINEER · COMPETE",
    description: "Combat robots, autonomous machines and engineering challenges.",
  },
  {
    n: "02",
    title: "SKY HIGH",
    tag: "FLIGHT · UAV · AEROSPACE",
    description: "Drone mapping, quadcopters and remote-controlled aircraft.",
  },
  {
    n: "03",
    title: "ALGO ARENA",
    tag: "CODE · DESIGN · CREATE",
    description: "Programming, app development, cybersecurity and web challenges.",
  },
  {
    n: "04",
    title: "BUSINESS & FINANCE",
    tag: "IDEAS · STRATEGY · STARTUPS",
    description: "Entrepreneurship, product strategy and market simulations.",
  },
  {
    n: "05",
    title: "COGITATION SUMMIT",
    tag: "RESEARCH · IMPACT · INNOVATION",
    description: "Challenges exploring AI, healthcare and sustainability.",
  },
  {
    n: "06",
    title: "OFF THE CUFF",
    tag: "THINK · DESIGN · SOLVE",
    description: "Open-ended engineering, creative and problem-solving challenges.",
  },
  {
    n: "07",
    title: "NO GLITCH",
    tag: "GAMING · ESPORTS",
    description: "Competitive gaming tournaments and digital battles.",
  },
  {
    n: "08",
    title: "IDEAZ",
    tag: "PRESENT · DISCOVER · INSPIRE",
    description: "A platform for presenting ideas and research across disciplines.",
  },
];


const performers = [
  {
    name: "MOHIT CHAUHAN",
    role: "MUSIC ARTIST",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/56/Mohit_Chauhan_performing_at_Alcheringa%2713.jpg",
  },
  {
    name: "ZAKIR KHAN",
    role: "STAND-UP COMEDIAN",
    image: "https://zwmgbosgdcfeoilnbtat.supabase.co/storage/v1/object/public/article-images/image/1769778162860_Zakir-khan.jpg",
  },
  {
    name: "RAHUL DUA",
    role: "STAND-UP COMEDIAN",
    image: "https://cdn.shopify.com/s/files/1/0686/0387/1276/files/Rahul_Dua_05f27258-8fee-42a0-8cad-60147a933c4a.webp?v=1769087344",
  },
  

  {
    name: "OLLY ESSE",
    role: "DJ",
    image: "https://media.indulgexpress.com/indulgexpress%2Fimport%2F2018%2F2%2F15%2Foriginal%2FOllyEsse.jpg",
  },
  {
    name: "PAPON",
    role: "MUSIC ARTIST",
    image : "https://media.assettype.com/freepressjournal/2024-08/d2ab3346-f49e-43c0-89f1-e07be24faf79/SR%20lead%202-aug%204.JPG?width=1200",
  },
  {
    name: "AMIT TRIVEDI",
    role: "MUSIC ARTIST",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/36/Amit_Trivedi_Live_%28OT%29.jpg",
  },
  {
    name: "HARSH GUJRAL",
    role: "STAND-UP COMEDIAN",
    image: "https://admin.hire4event.com/assets/artistimage/17353660031735366003Harsh_Gujral.webp",
  },
  {
    name: "KK",
    role: "MUSIC ARTIST",
    image: "https://feeds.abplive.com/onecms/images/uploaded-images/2022/06/01/54640d40ed1fafcb96467a30c6eae3f8_original.jpg",
  },
];





export default function HomeAdditions() {
  return (
    <div className="home-additions">

      {/* FESTIVAL HIGHLIGHTS */}
      <section className="home-highlight-section">
        <div className="home-section-label">
          <span>01 / THE FESTIVAL</span>
          <span>EMPYREAN TECHNOGENESIS</span>
        </div>

        <div className="home-highlight-title">
          <h2>
            MORE THAN
            <br />
            <span>A FEST.</span>
          </h2>
          <p>
            Three days of technology, competition and collaboration.
            Cognizance brings curious minds together to turn ideas into
            possibilities.
          </p>
        </div>

        <div className="home-stats">
          <article>
            <strong>03</strong>
            <span>DAYS OF INNOVATION</span>
            <small>13 — 15 MARCH 2026</small>
          </article>

          <article>
            <strong>50<span>+</span></strong>
            <span>COMPETITIONS</span>
            <small>ACROSS MULTIPLE DOMAINS</small>
          </article>

          <article>
            <strong>₹50L<span>+</span></strong>
            <span>ANNOUNCED PRIZE POOL</span>
            <small>COGNIZANCE 2026</small>
          </article>
        </div>
      </section>

      {/* FESTIVAL DOMAINS */}
      <section className="home-domain-section">
        <div className="home-section-label">
          <span>02 / EXPLORE THE SPECTRUM</span>
          <span>COGNIZANCE 2026</span>
        </div>

        <div className="home-domain-heading">
          <h2>
            FIND YOUR
            <br />
            <span>ARENA.</span>
          </h2>
          <Link to="/events">EXPLORE ALL EVENTS ↗</Link>
        </div>

        <div className="home-domain-grid">
          {domains.map((domain) => (
            <Link
              to="/events"
              className="home-domain-card"
              key={domain.n}
            >
              <div className="home-domain-top">
                <span>{domain.n} / DOMAIN</span>
                <span className="home-domain-arrow">↗</span>
              </div>

              <h3>{domain.title}</h3>
              <span className="home-domain-tag">{domain.tag}</span>
              <p>{domain.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* PAST PERFORMERS */}
      
<section className="home-performer-section">
  <div className="performer-section-heading">
    <h2>
      <span>PAST</span>
      <br />
      PERFORMERS
    </h2>
    <div className="performer-heading-line">
      <span>COGNIZANCE 2026</span>
    </div>
  </div>

  <div className="performer-stage">
    <svg
      className="performer-dotted-path"
      viewBox="0 0 1400 430"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M 0 340 C 180 340 220 80 410 100 S 590 390 760 260 S 970 40 1130 150 S 1260 360 1400 340" />
    </svg>

    <div className="performer-track">
      {performers.map((artist, index) => (
        <article className="performer-poster" key={artist.name}>
          <img
            src={artist.image}
            alt={artist.name}
            loading="lazy"
          />
          <div className="performer-poster-label">
            <span>{artist.role}</span>
            <h3>{artist.name}</h3>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>

            


      {/* FINAL NAVIGATION */}
      <section className="home-explore-section">
        <span className="home-explore-kicker">
          YOUR NEXT DESTINATION
        </span>

        <h2>
          EXPLORE
          <br />
          <span>COGNIZANCE.</span>
        </h2>

        <div className="home-explore-links">
          <Link to="/events">EVENTS <span>↗</span></Link>
          <Link to="/workshops">WORKSHOPS <span>↗</span></Link>
          <Link to="/results">RESULTS <span>↗</span></Link>
          <Link to="/gallery">GALLERY <span>↗</span></Link>
        </div>
      </section>

    </div>
  );
}
