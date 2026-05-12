import './Option.css';

export default function Option({
  letter = 'A',
  text = 'Star Typology',
  isChecked = false,
  onCheckChange = () => {},
  containerStyle = { maxWidth: '24rem' }
}) {
  return (
    <div 
      className={`container`} 
      style={containerStyle}
    >
      <div className={`box ${isChecked ? 'checked' : ''}`}>
        <div className={`letter-box ${isChecked ? 'checked' : ''}`}>{letter}</div>
        <div className="text-body">{text}</div>
      </div>
      <label className="checkbox-label">
        <input 
          type="checkbox" 
          className="form-check-input" 
          checked={isChecked}
          onChange={(e) => onCheckChange(e.target.checked)}
        />
        Mark as correct
      </label>
    </div>
  );
}