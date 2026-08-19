import FAQ from "@/components/home/FAQ";
import Features from "@/components/home/Features";
import FinalCTA from "@/components/home/FinalCTA";
import Footer from "@/components/home/Footer";
import Hero from "@/components/home/Hero";
import Navbar from "@/components/home/Navbar";
import Pricing from "@/components/home/Pricing";
import ProblemStats from "@/components/home/ProblemStats";
import "./home.css";

const Home = () => {
  return (
    <main className="relative z-10">
      <Navbar />
      <Hero />
      <ProblemStats />
      <Features />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />

      <script
        src="http://localhost:3000/widget-loader.js"
        data-business-id="6a40f7df40dac29d8d9991ce"
        data-base-url="http://localhost:3000"
      ></script>
    </main>
  );
};

export default Home;
