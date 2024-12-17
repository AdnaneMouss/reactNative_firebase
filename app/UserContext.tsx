import React, { createContext, useState, useContext, ReactNode } from 'react';

interface UserContextProps {
  email: string | null;
  setEmail: (email: string | null) => void;
  userImage: string | null;
  setUserImage: (image: string | null) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  language: string;
  setLanguage: (lang: string) => void;
}

// Default values
const UserContext = createContext<UserContextProps>({
  email: null,
  setEmail: () => {},
  userImage: null,
  setUserImage: () => {},
  isDarkMode: false,
  toggleDarkMode: () => {},
  language: 'en',
  setLanguage: () => {},
});

// Provider Component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <UserContext.Provider
      value={{
        email,
        setEmail,
        userImage,
        setUserImage,
        isDarkMode,
        toggleDarkMode,
        language,
        setLanguage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook to use UserContext
export const useUser = () => useContext(UserContext);
