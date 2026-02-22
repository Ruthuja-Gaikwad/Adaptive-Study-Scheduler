import { createContext, useContext, useMemo, useState } from 'react';

const CognitiveCheckinContext = createContext({
  csi: null,
  mode: null,
  burnoutScore: null,
  rerouteStrategy: null,
  taskReduction: null,
  temporaryCsiBoost: 0,
  dailyQuestStreak: 0,
  effectiveCsi: null,
  setCheckinData: () => {},
  applyQuestBoost: () => {},
  setDailyQuestStreak: () => {},
  resetTemporaryBoost: () => {},
});

export function CognitiveCheckinProvider({ children }) {
  const [csi, setCsi] = useState(null);
  const [mode, setMode] = useState(null);
  const [burnoutScore, setBurnoutScore] = useState(null);
  const [rerouteStrategy, setRerouteStrategy] = useState(null);
  const [taskReduction, setTaskReduction] = useState(null);
  const [temporaryCsiBoost, setTemporaryCsiBoost] = useState(0);
  const [dailyQuestStreak, setStreak] = useState(0);

  const effectiveCsi = csi !== null ? csi + temporaryCsiBoost : null;

  const setCheckinData = (payload) => {
    if (!payload) return;
    if (typeof payload.csi === 'number') setCsi(payload.csi);
    if (typeof payload.mode === 'string') setMode(payload.mode);
    if (typeof payload.burnoutScore === 'number') setBurnoutScore(payload.burnoutScore);
    if (typeof payload.rerouteStrategy === 'string') setRerouteStrategy(payload.rerouteStrategy);
    if (typeof payload.taskReduction === 'number') setTaskReduction(payload.taskReduction);
    // Reset temporary boost on new check-in
    setTemporaryCsiBoost(0);
  };

  const applyQuestBoost = () => {
    setTemporaryCsiBoost((prev) => prev + 5);
  };

  const resetTemporaryBoost = () => {
    setTemporaryCsiBoost(0);
  };

  const value = useMemo(
    () => ({
      csi,
      mode,
      burnoutScore,
      rerouteStrategy,
      taskReduction,
      temporaryCsiBoost,
      dailyQuestStreak,
      effectiveCsi,
      setCheckinData,
      applyQuestBoost,
      setDailyQuestStreak: setStreak,
      resetTemporaryBoost,
    }),
    [csi, mode, burnoutScore, rerouteStrategy, taskReduction, temporaryCsiBoost, dailyQuestStreak, effectiveCsi]
  );

  return (
    <CognitiveCheckinContext.Provider value={value}>
      {children}
    </CognitiveCheckinContext.Provider>
  );
}

export function useCognitiveCheckin() {
  return useContext(CognitiveCheckinContext);
}