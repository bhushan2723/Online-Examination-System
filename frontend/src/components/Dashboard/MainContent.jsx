const MainContent = ({ children }) => {
  return (
    <main className="flex-grow-1 overflow-auto d-flex" style={{ maxHeight: 'calc(100vh - 55px)' }}>
      {children}
    </main>
  );
};

export default MainContent;