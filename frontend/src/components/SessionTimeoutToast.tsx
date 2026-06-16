import { useAuth } from '../context/AuthContext';

export const SessionTimeoutToast = () => {
  const { sessionExpiring, extendSession } = useAuth();

  if (!sessionExpiring) return null;

  const handleExtend = async () => {
    await extendSession();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-4 rounded-lg shadow-lg z-50">
      <p className="font-semibold mb-2">Your session is about to expire</p>
      <button
        onClick={handleExtend}
        className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 text-sm"
      >
        Extend Session
      </button>
    </div>
  );
};
