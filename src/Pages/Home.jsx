import Hero from "../Components/Hero";
import BrowseCategories from "../Components/BrowseCategories";
import CategoryServices from "../Components/CategoryServices";
import WhyChoose from "../Components/WhyChoose";
import HowItWorks from "../Components/HowItWorks";
import About from "../Components/About";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-page">
      <Hero />
      <BrowseCategories />
      <CategoryServices />
      <WhyChoose />
      <About />
      <HowItWorks />
    </div>
  );
};

export default Home;