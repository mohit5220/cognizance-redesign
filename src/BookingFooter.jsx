
import React from "react";
import { Link } from "react-router-dom";

export default function BookingFooter() {
  const socials = [
  {
    label: "◎",
    name: "Instagram",
    url: "https://www.instagram.com/cogni_iitr/"
  },
  {
    label: "f",
    name: "Facebook",
    url: "https://www.facebook.com/cogni.iitr/"
  },
  {
    label: "▶",
    name: "YouTube",
    url: "https://www.youtube.com/CognizanceIITR"
  },
  {
    label: "in",
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/cognizance-iit-roorkee/"
  }
];
  function handlePayment() {
  window.open(
    "https://www.cognizance.org.in/workshops/305",
    "_blank",
    "noopener,noreferrer"
  );
}
  




  return (
    <>
      <section className="booking-cta">
        <div className="booking-robot">
          <img
            src="/images/booking-robot.png"
            alt="Futuristic Cognizance robot"
          />
        </div>

        <div className="booking-content">
          <h2>
            BOOK YOUR
            <br />
            SLOTS <span>NOW</span>
          </h2>

          <div className="booking-actions">
            <button
              type="button"
              className="booking-payment"
              onClick={handlePayment}
            >
              MAKE PAYMENT
            </button>

            <div className="booking-socials">
              <span>CONTACT US ON:</span>

              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  title={social.name}
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="cog-footer">
        <div className="cog-footer-main">
          <div className="cog-footer-about">
            <h3>
              Cognizance 20<span>26</span>
            </h3>

            <p>
              Cognizance, the annual technical fest of IIT Roorkee,
              run by students, is an enthralling kaleidoscope of
              internally invigorating events. It has something in
              store for all and brings together renowned experts
              from various spheres of academic and corporate industry.
            </p>
          </div>

          <div className="cog-footer-links">
            <div>
              <Link to="/#about">About Us</Link>
              <Link to="/workshops">SPP</Link>
            </div>

            <div>
              <Link to="/workshops">Workshops</Link>
              <Link to="/workshops">Guest Lectures</Link>
            </div>

            <div>
              <Link to="/events">Events</Link>
              <Link to="/gallery">Gallery</Link>
            </div>
          </div>
        </div>

        <div className="cog-footer-bottom">
          <div className="cog-footer-legal">
            <a
  href="https://www.cognizance.org.in/"
  target="_blank"
  rel="noreferrer"
>
  Terms and Conditions
</a>

<a
  href="https://www.cognizance.org.in/"
  target="_blank"
  rel="noreferrer"
>
  Policies
</a>


          </div>

          <span>©Cognizance2026. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}
