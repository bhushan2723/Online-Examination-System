const DashboardInfoPane = ({ 
  title = "Average Exam Scores By Module", 
  subtitle = "January - June 2024", 
  children, 
  maxWidth = "100%",
  cardClassName = "",
  containerClassName = "",
  bodyClassName = ""
}) => {
  return (
    <div className={`bg-white d-flex justify-content-center align-items-start ${containerClassName} h-100`}>
      <div 
        className={`card rounded-3 border-light shadow ${cardClassName}`} 
        style={{ width: maxWidth, height:"100%" }}
      >
        <div className={`card-body p-3 ${bodyClassName}`} style={{height: "100%"}}>
          {title && <h2 className="h6 fw-semibold mb-1">{title}</h2>}
          {subtitle && <p className="text-muted small mb-4">{subtitle}</p>}
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardInfoPane;