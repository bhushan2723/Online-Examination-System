import { useEffect, useRef } from "react";

const ExamGuard = ({ setTabSwitchCount }) => {
  const tabSwitchCount = useRef(0);

  useEffect(() => {
    // 🟢 1. Prevent tab switching
    const handleBlur = () => {
      tabSwitchCount.current += 1;

      setTabSwitchCount(tabSwitchCount.current);
    };

    // 🟢 2. Prevent right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // 🟢 3. Prevent copy/cut/paste
    const handleCopy = (e) => {
      e.preventDefault();
    };
    const handleCut = (e) => {
      e.preventDefault();
    };
    const handlePaste = (e) => {
      e.preventDefault();
    };

    // attach listeners
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);

    return () => {
      // cleanup
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  return null; // invisible component
};

export default ExamGuard;
