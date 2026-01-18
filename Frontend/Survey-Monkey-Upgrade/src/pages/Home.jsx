import QuestionCard from "../components/QuestionCard.jsx";
import ImageSelectionCard from "../components/ImageSelectionCard.jsx";
import Carousel from "../components/Carousel.jsx";
import { useState } from "react";
import "../css/Home.css";

// slide init:
const OPTIONS = { loop: false };
const SLIDES = [
  "/images/landscape_1.png",
  "/images/landscape_4.png",
  "/images/landscape_2.png",
  "/images/landscape_5.png",
  "/images/landscape_3.png",
];

// Placeholder component for the final landscape visualization
const FinalLandscapePreview = () => {
  return (
    <div>
      <h3 className="text-h3">Final Landscape Preview</h3>
      <p className="text-p" style={{marginBottom: "1rem"}}>
        This is an example of the type of landscape users will create as they complete your form.
      </p>
      <div className="dashed-border">
        <Carousel slides={SLIDES} options={OPTIONS}/>
      </div>
    </div>
  );
};

const Home = () => {
  const [picked, setPicked] = useState(null);
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="page-title">Welcome to BananaVerse</h1>
        <p className="text-p">
          Turn feedback into a visual landscape that grows with every question—pick images, click submit, and unveil a personalized AI-generated landscape.

        </p>
      </section>

      {/* Why Use BananaVerse Section */}
      <section>
        <h2 className="text-h2">Why Organizations Love BananaVerse</h2>
        <ul>
          <li>
            <h3>Engaging Experience</h3>
            <p>
              Users answer questions by selecting images that reflect their experience most, building their
              personal AI-generated landscapes to keep. 
            </p>
          </li>
          <li>
            <h3>More Responses</h3>
            <p>
              Traditional surveys are boring. Our dynamic, gamified approach encourages
              frequent participation and higher completion rates.
            </p>
          </li>
          <li style={{ opacity: 0.7 }}>
            <h3>AI Insights*</h3>
            <p>Behind the scenes, AI-driven analysis combines image choices with user information to uncover sentiment and experience insights for your business.</p>
            <p>COMING SOON</p>
          </li>
        </ul>
      </section>

      {/* Example Question Section */}
      <section>
        <h2 className="text-h2" style={{ margin: "0rem" }}>
          See BananaVerse in Action
        </h2>
        
        <p className="text-p" style={{ margin: "0rem" }}>
          An exmaple in action...
        </p>
        <p></p>
        <div
          style={{
            animation: "slideUpFade 1s ease-out forwards",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <QuestionCard
            question="How would you describe overall experience?"
            imageSelectionCard={
              <ImageSelectionCard
                img1="/images/house_1.png"
                img2="/images/house_2.png"
                img3="/images/house_3.png"
                img4="/images/house_4.png"
                img5="/images/house_5.png"
                value={picked}
                onSelectionChange={setPicked}
              />
            }
          />
        </div>
      </section>

      {/* Final Landscape Section */}
      <section>
        <h2 className="text-h2" style={{ marginBottom: "0.5rem" }}>
          The Big Picture: User Landscapes
        </h2>
        <p className="text-p" style={{ margin: "0rem" }}>
          Users stay engaged by building a personal landscape as they answer questions. Each choice—house styles, sky moods, and 
          animal companions—adds to a unique world, turning feedback into a fun, gamified experience that drives higher completion 
          and richer insights.
        </p>
        <p className="text-p" style={{ fontSize: "1.125rem" }}>
          Organizers receive detailed insights and sentiment analysis from every
          response, while users enjoy the reward of watching their landscape
          grow.
        </p>
        <FinalLandscapePreview />
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <h2 className="text-h2">Ready to Create Your Form?</h2>
        <p style={{ marginBottom: "1rem" }}>
          Start engaging your users today with BananaVerse and turn feedback
          into growth.
        </p>
        <a
          style={{ animation: "slideUpFade 1s ease-out forwards" }}
          href="/createSurvey"
        >
          Create Your Form
        </a>
      </section>
    </div>
  );
};

export default Home;