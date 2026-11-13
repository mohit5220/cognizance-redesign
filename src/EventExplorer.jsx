
import React, { useRef } from "react";

const photo = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;

const FALLBACK = photo("photo-1485827404703-89b55fcc595e");


const categories = [
  {
    title: "ROBOTICS",
    color: "gold",
    events: [
      ["ARMAGEDDON", "photo-1485827404703-89b55fcc595e"],
      ["SUPER STRIKERS", "photo-1574629810360-7efbbe195018"],
      ["CRAWL-O-TRON", "photo-1631882456892-54a30e92fe4f"],
      ["ZENGRIP", "photo-1581091226825-a6a2a5aee158"],
      ["TRAILBLAZE", "photo-1503376780353-7e6692767b70"],
      ["NANO NAVIGATOR", "photo-1518770660439-4636190af475"],
      ["PLASMA PULL", "photo-1527430253228-e93688616381"],
      ["SPECTRAL BRIDGE", "photo-1674476459442-332fcb0ae163"],
      ["BRIDGE-O-MANIA", "photo-1511818966892-d7d671e672a2"],
      ["STRAW STRIKE", "photo-1519389950473-47ba0277781c"],
      ["CLAW & SHIELD", "photo-1786700633942-375e42b884ed"]
    ]
  },
  {
    title: "SKY HIGH",
    color: "pink",
    events: [
      ["FLIGHTFURY", "photo-1473968512647-3e447244af8f"],
      ["SKY MANEUVER", "photo-1504881464977-380fd2f91c51"]
    ]
  },
  {
    title: "CODE COMBAT",
    color: "cyan",
    events: [
      ["SCYTHE CTF", "photo-1550751827-4bd374c3f58b"],
      ["SNAP SYNTAX", "photo-1515879218367-8466d910aaa4"],
      ["INTERNATIONAL CODING CHALLENGE", "photo-1759884247381-d7222dd72dec"],
      ["CODIFY RUMBLE", "photo-1461749280684-dccba630e2f6"],
      ["SHADOW EXTRACTION", "photo-1526378722484-bd91ca387e72"],
      ["GIG GUARD", "photo-1504639725590-34d0984388bd"],
      ["FAULTLINE", "photo-1516321318423-f06f85e504b3"],
      ["BITBYBIT", "photo-1516116216624-53e697fedbea"],
      ["PROD-G", "photo-1498050108023-c5249f4df085"]
    ]
  },
  {
    title: "TECH & INNOVATION",
    color: "cyan",
    events: [
      ["TECHZIBITION", "photo-1451187580459-43490279c0fa"],
      ["APPNOVA", "photo-1512941937669-90a1b58e7e9"],
      ["BLOCKATHON", "photo-1535223289827-42f1e9919769"],
      ["INNOQUEST", "photo-1532094349884-543bc11b234d"],
      ["INNOVWAVE", "photo-1727091506038-5451111dc2fb"],
      ["BELLATRIX", "photo-1446776811953-b23d57bd21aa"]
    ]
  },
  {
    title: "BUSINESS & FINANCE",
    color: "gold",
    events: [
      ["BULLS AND BEARS", "photo-1591696205602-2f950c417cb9"],
      ["TRADE OF TITANS", "photo-1745509267945-b25cbb4d50ef"]
    ]
  },
  {
    title: "GAMING ARENA",
    color: "pink",
    events: [
      ["BGMI", "photo-1542751371-adc38448a05e"],
      ["VALORANT", "photo-1547394765-185e1e68f34e"],
      ["TEKKEN", "photo-1580327344181-c1163234e5a0"],
      ["FIFA", "photo-1508098682722-e99c643e7f0b"]
    ]
  },
  {
    title: "CREATIVE ARENA",
    color: "cyan",
    events: [
      ["CINEVISTA", "photo-1781127445188-3b05a9316dde"],
      ["FRAME FLUX", "photo-1492619375914-88005aa9e8fb"],
      ["CRESTMINT", "photo-1558655146-d09347e92766"]
    ]
  },
  {
    title: "SCIENCE & DEPARTMENTAL",
    color: "gold",
    events: [
      ["BIOTRACE", "photo-1684259498786-ffaf1ec5c5e8"],
      ["FUEL FORGE", "photo-1565043666747-69f6646db940"],
      ["FITFUSION", "photo-1517836357463-d25dfeac3438"],
      ["MATIKS CHAMPIONSHIP", "photo-1509228468518-180dd4864904"],
      ["RUBIKS RUKUS", "photo-1513542789411-b6a5d4f31634"],
      ["WIKI-RUN", "photo-1523240795612-9a054b0db644"]
    ]
  }
];

  
     
    
   

function EventCard({ name, image, category, index }) {
  return (
    <article className={`cog-event-card ${index === 1 ? "is-featured" : ""}`}>
      <div className="cog-card-photo">
        <img
          src={photo(image)}
          alt={`${name} event`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK;
          }}
        />
        <div className="cog-photo-shade" />
        <span className="cog-card-category">{category}</span>
        <span className="cog-card-side">{name}</span>
        <div className="cog-film-holes">
          <i /><i /><i /><i />
        </div>
      </div>

      <div className="cog-card-bottom">
        <span className="cog-card-number">
          EVENT / {String(index + 1).padStart(2, "0")}
        </span>
        <h3>{name}</h3>
      </div>
    </article>
  );
}

function CategoryCarousel({ category }) {
  const trackRef = useRef(null);

  const move = (direction) => {
    if (!trackRef.current) return;

    trackRef.current.scrollBy({
      left: direction * 330,
      behavior: "smooth",
    });
  };

  return (
    <section className="cog-event-category">
      <div className="cog-category-heading">
        <div className={`cog-category-symbol ${category.color}`} />
        <h2>{category.title}</h2>
        <div className="cog-category-line" />

        <div className="cog-carousel-controls">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label={`Previous ${category.title} events`}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label={`Next ${category.title} events`}
          >
            →
          </button>
        </div>
      </div>

      <div className="cog-event-track" ref={trackRef}>
        {category.events.map(([name, image], index) => (
          <EventCard
            key={name}
            name={name}
            image={image}
            category={category.title}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

export default function EventExplorer() {
  return (
    <div className="cog-events-showcase">
      {categories.map((category) => (
        <CategoryCarousel key={category.title} category={category} />
      ))}
    </div>
  );
}
