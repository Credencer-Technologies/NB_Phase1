import Hero from "../Components/Hero";
import BrowseCategories from "../Components/BrowseCategories";
import CategoryServices from "../Components/CategoryServices";
import WhyChoose from "../Components/WhyChoose";
import ProviderNetwork from "../Components/ProviderNetwork";
import HowItWorks from "../Components/HowItWorks";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-page">
      
      {/* Hero Section */}
      <Hero />

      {/* Browse Categories */}
      <BrowseCategories />

      {/* Category Services */}
      <CategoryServices />

      {/* Why Choose NariBazar */}
      <WhyChoose />

      {/* Provider Network */}
      <ProviderNetwork />

      {/* How It Works */}
      <HowItWorks />

    </div>
  );
};

export default Home;