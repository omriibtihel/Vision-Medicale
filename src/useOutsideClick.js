import { useEffect } from 'react';

const useOutsideClick = (refs, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Vérifie si le clic est en dehors de tous les éléments référencés
      const isOutside = refs.every(ref => {
        return ref.current && !ref.current.contains(event.target);
      });

      if (isOutside) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, callback]);
};

export default useOutsideClick;