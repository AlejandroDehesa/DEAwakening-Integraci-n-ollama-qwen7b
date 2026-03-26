import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext(null);
const STORAGE_KEY = "deawakening-language";
const SUPPORTED_LANGUAGES = ["en", "es", "de"];

function getInitialLanguage() {
  if (typeof window === "undefined") {
    return "en";
  }

  const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
  if (SUPPORTED_LANGUAGES.includes(storedLanguage)) {
    return storedLanguage;
  }

  return "en";
}

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage);

  function setLanguage(language) {
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return;
    }

    setCurrentLanguage(language);
  }

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, currentLanguage);
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        language: currentLanguage,
        setLanguage
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
