import { useEffect } from "react";
import Header from "../components/Landing Page/Header";
import Hero from "../components/Landing Page/Hero";
import Welcome from "../components/Landing Page/Welcome";
import Features from "../components/Landing Page/Features";
import Footer from "../components/Landing Page/Footer";

const Landing = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((element) => {
      observer.observe(element);
    });

    return () => {
      document.querySelectorAll(".animate-on-scroll").forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Welcome />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
