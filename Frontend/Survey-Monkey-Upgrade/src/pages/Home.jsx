import QuestionCard from "../components/QuestionCard.jsx";
import ImageSelectionCard from "../components/ImageSelectionCard.jsx";
import "../css/HomeBanana.css";

// Placeholder component for the final landscape visualization
const FinalLandscapePreview = () => {
  return (
   <div>
    <h3 className="text-h3">Final Landscape Preview</h3>
    <p className="text-p" style={{marginBottom: "1rem"}}>
          (This is an example of the type of landscape users will create as they complete your form.)
    </p>
    <div className="dashed-border">
        <img style={{animation: "slideUpFade 1s ease-out forwards"}} src="/images/generated-image.png" alt="User Landscape" />
    </div>
   </div>
  );
};

const Home = () => {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="page-title">Welcome to BananaVerse</h1>
        <p className="text-p">
          Transform how you collect feedback. Keep your users engaged with fun, interactive forms that turn every response into a growing landscape.
        </p>
      </section>

      {/* Why Use BananaVerse Section */}
      <section>
        <h2 className="text-h2">Why Organizers Love BananaVerse</h2>
        <ul>
          <li>
            <h3>Engaging Experience</h3>
            <p>Users answer questions by selecting images and building their personal landscapes—making feedback fun and interactive.</p>
          </li>
          <li>
            <h3>More Responses</h3>
            <p>Traditional forms are boring. Our gamified approach encourages frequent participation and higher completion rates.</p>
          </li>
          <li style={{ opacity: 0.8}}>
            <h3>AI Insights*</h3>
            <p>Behind the scenes, AI analyzes user choices to understand sentiment and trends without slowing down engagement.</p>
            <p>COMMING SOON</p>
          </li>
        </ul>
      </section>

      {/* Example Question Section */}
      <section>
        <h2 className="text-h2" style={{margin: "0rem"}}>See BananaVerse in Action</h2>
        <p className="text-p" style={{margin: "0rem"}}>Here's an example question users might see:</p>
        <div style={{animation: "slideUpFade 1s ease-out forwards"}}>
          <QuestionCard 
            key={0}
            question={"How would you describe overall experience?"}
            imageSelectionCard={
                <ImageSelectionCard
                img1="/images/Tree1.png"
                img2="/images/Tree2.png"
                img3="/images/Tree3.png"
                img4="/images/Tree4.png"
                img5="/images/Tree5.png"
                />
            }/>
        </div>
      </section>

      {/* Final Landscape Section */}
      <section>
        <h2 className="text-h2" style={{marginBottom: "0.5rem"}}>The Big Picture: User Landscapes</h2>
          <p className="text-p" style={{margin: "0rem"}}>
            Users stay motivated by building their own personal landscapes as they answer questions. Each volcano, star, or tree they add contributes to a unique world — this gamified experience keeps them hooked, so you get more responses and richer feedback. 
          </p>
          <p className="text-p" style={{fontSize: "1.125rem"}}>
            Organizers receive detailed insights and sentiment analysis from every response, while users enjoy the reward of watching their landscape grow.
          </p>
        <FinalLandscapePreview />
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <h2 className="text-h2">Ready to Create Your Form?</h2>
        <p style={{marginBottom:"1rem"}}>Start engaging your users today with BananaVerse and turn feedback into growth.</p>
        <a style={{animation: "slideUpFade 1s ease-out forwards"}} href="/createSurvey">Create Your Form</a>
      </section>
    </div>
  );
};

export default Home;
