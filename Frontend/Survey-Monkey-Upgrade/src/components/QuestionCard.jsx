import "../css/QuestionCard.css";

function QuestionCard({question, imageSelectionCard}) {


    return (
        
        <div className="question-card">
            <div className="avatar-card">
                <p>{question}</p>

            </div>




            <div className="image-section">
                {imageSelectionCard}
                
            </div>


        </div>
    )
}

export default QuestionCard