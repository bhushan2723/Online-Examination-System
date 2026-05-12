import QuestionRow from './QuestionRow';
import "./QuestionTable.css";

const QuestionTable = ({ questions, selectedQuestionIds, onSelect, onSelectAll, onExpand, expandedRow, addQuestion, showEdit=true }) => {
  return (
    <div className="table-scroll-container">
      <table className="custom-table">
        <thead>
          <tr>
            <th style={{ width: "40px" }}>
              <input
                type="checkbox"
                checked={selectedQuestionIds.length === questions.length && questions.length > 0}
                onChange={onSelectAll}
              />
            </th>
            <th style={{ width: "40px", textAlign:"center" }}>#</th>
            <th>Question</th>
            <th>Answer</th>
            <th style={{ width: "120px", textAlign:"center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, i) => (
            <QuestionRow
              key={q._id}
              question={q}
              index={i}
              isSelected={selectedQuestionIds.includes(q._id)}
              onSelect={onSelect}
              onExpand={onExpand}
              isExpanded={expandedRow === i}
              addQuestion={addQuestion}
              showEdit={showEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionTable;
