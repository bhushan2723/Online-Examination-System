import './Question.css';
import React from 'react';
import Option from '../Option/Option';

export default function Question({
  questionText = "Which of the following typologies is <u>not</u> a broadcast type?",
  options = [
    { letter: 'A', text: 'Star Typology', isCorrect: false },
    { letter: 'B', text: 'Bus Typology', isCorrect: false },
    { letter: 'C', text: 'Mesh Typology', isCorrect: false },
    { letter: 'D', text: 'Ring Typology', isCorrect: true }
  ],
  showEditButton = false,
  editButtonText = "Click to edit question",
  onOptionSelected = (selectedOption) => console.log('Selected:', selectedOption),
  onEditClick = () => console.log('Edit button clicked'),
  containerClass = "container py-5 d-flex justify-content-center px-3",
  mainClass = "w-100",
  maxWidth = "768px",
  questionTypeClass = "question-type d-flex align-items-center justify-content-center mb-2",
  questionTextClass = "question-text",
  editButtonClass = "edit-btn",
  optionsContainerClass = "row g-3",
  optionColumnClass = "col-12 col-sm-6",
  specialOptionClass = "option-d",  // Class for special options (like the last one)
  regularOptionClass = "option-a-b-c"  // Class for regular options
}) {
  const [selectedOption, setSelectedOption] = React.useState(
    options.find(opt => opt.isCorrect)?.letter || null
  );

  const handleOptionChange = (letter, isChecked) => {
    if (isChecked) {
      setSelectedOption(letter);
      onOptionSelected(options.find(opt => opt.letter === letter));
    }
  };

  return (
    <div className={containerClass}>
      <main className={mainClass} style={{ maxWidth }}>
        
        <h1 className={questionTextClass} dangerouslySetInnerHTML={{ __html: questionText }} />
        
        {showEditButton && (
          <div className="d-flex justify-content-center mb-4">
            <button 
              type="button" 
              className={editButtonClass}
              onClick={onEditClick}
            >
              {editButtonText}
            </button>
          </div>
        )}

        <div className={optionsContainerClass}>
          {options.map((option) => (
            <div key={option.letter} className={optionColumnClass}>
              <Option
                letter={option.letter}
                text={option.text}
                isChecked={selectedOption === option.letter}
                onCheckChange={(checked) => handleOptionChange(option.letter, checked)}
                containerStyle={{ 
                  maxWidth: '100%',
                  backgroundColor: selectedOption === option.letter ? '#f8f9fa' : '#ffffff'
                }}
                className={option.isSpecial ? specialOptionClass : regularOptionClass}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}