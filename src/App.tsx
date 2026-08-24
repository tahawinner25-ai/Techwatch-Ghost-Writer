import React, { useState, useEffect } from "react";
import { Header, AppViewMode } from "./components/Header";
import { RawDataWindow } from "./components/RawDataWindow";
import { TargetedSearchWindow } from "./components/TargetedSearchWindow";
import { SocialMediaHub } from "./components/SocialMediaHub";
import { PipelineVisualizer } from "./components/PipelineVisualizer";
import { EmailPreview } from "./components/EmailPreview";
import { FilteringReportView } from "./components/FilteringReportView";
import { CodeView } from "./components/CodeView";
import { HistoryModal } from "./components/HistoryModal";
import { DrivePickerModal } from "./components/DrivePickerModal";
import { SaveToDriveModal } from "./components/SaveToDriveModal";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { ScheduleDraftModal } from "./components/ScheduleDraftModal";
import { LoginScreen } from "./components/LoginScreen";
import { SAMPLE_DATASETS } from "./sampleData";
import { NewsletterResult, ScheduledNewsletter, TemplateTheme, TargetAudience } from "./types";
import {
  initAuth,
  googleSignIn,
  logout,
  testFirestoreConnection,
} from "./lib/firebase";
import {
  saveNewsletterToFirestore,
  deleteNewsletterFromFirestore,
  subscribeUserNewsletters,
  saveScheduledNewsletterToFirestore,
  deleteScheduledNewsletterFromFirestore,
  subscribeUserScheduledNewsletters,
} from "./lib/firestoreService";
import { User } from "firebase/auth";
import {
  Mail,
  Code2,
  FileSearch,
  AlertCircle,
  Zap,
  BarChart3,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function App() {
  // Input State
  const [rawData, setRawData] = useState<string>(SAMPLE_DATASETS[0].content);
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("CTO & Ingénieurs Seniors");
  const [styleTemplate, setStyleTemplate] = useState<TemplateTheme>("editorial");
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("Inférence LLM KV-Cache optimisations GPU");

  // Process & Result State - 4 Dedicated Windows
  const [currentView, setCurrentView] = useState<AppViewMode>("raw_data");
  const [pipelineStatus, setPipelineStatus] = useState<
    "idle" | "grounding" | "filtering" | "selecting" | "writing" | "completed"
  >("idle");
  const [currentResult, setCurrentResult] = useState<NewsletterResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<"preview" | "report" | "code" | "analytics">("preview");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Auth & Drive Token State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Drive Modals State
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState<boolean>(false);
  const [isSaveToDriveOpen, setIsSaveToDriveOpen] = useState<boolean>(false);

  // History & Queue State
  const [history, setHistory] = useState<NewsletterResult[]>([]);
  const [scheduledQueue, setScheduledQueue] = useState<ScheduledNewsletter[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);

  // Initialize Firebase Auth & test connection
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        if (token) setAccessToken(token);
        setAuthLoading(false);
        testFirestoreConnection();
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync Newsletters & Queue with Firestore when logged in, or fallback to localStorage
  useEffect(() => {
    if (currentUser) {
      const unsubNews = subscribeUserNewsletters(
        currentUser.uid,
        (firestoreItems) => {
          if (firestoreItems && firestoreItems.length > 0) {
            setHistory(firestoreItems);
          }
        },
        (error) => {
          console.warn("Firestore newsletters subscription notice:", error);
        }
      );

      const unsubQueue = subscribeUserScheduledNewsletters(
        currentUser.uid,
        (queueItems) => {
          if (queueItems) {
            setScheduledQueue(queueItems);
          }
        },
        (error) => {
          console.warn("Firestore queue subscription notice:", error);
        }
      );

      return () => {
        unsubNews();
        unsubQueue();
      };
    } else {
      try {
        const savedHistory = localStorage.getItem("techwatch_ghostwriter_history");
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }

        const savedQueue = localStorage.getItem("techwatch_scheduled_queue");
        if (savedQueue) {
          setScheduledQueue(JSON.parse(savedQueue));
        }
      } catch (e) {
        console.error("Failed to load data from localStorage:", e);
      }
    }
  }, [currentUser]);

  // Auth Actions
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const msg = err instanceof Error ? err.message : "Échec de connexion";
      setErrorMessage(`Connexion Google interrompue : ${msg}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setAccessToken(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Save history (Firestore + Local)
  const saveToHistory = async (newResult: NewsletterResult) => {
    // 1. Local update
    const updated = [newResult, ...history.filter((h) => h.id !== newResult.id)].slice(0, 20);
    setHistory(updated);
    try {
      localStorage.setItem("techwatch_ghostwriter_history", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save history to localStorage:", e);
    }

    // 2. Firestore Cloud persistence
    if (currentUser) {
      try {
        await saveNewsletterToFirestore(currentUser.uid, newResult);
      } catch (err) {
        console.error("Failed to save to Firestore:", err);
      }
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("techwatch_ghostwriter_history");
  };

  const handleDeleteOneHistory = async (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("techwatch_ghostwriter_history", JSON.stringify(updated));

    if (currentUser) {
      try {
        await deleteNewsletterFromFirestore(currentUser.uid, id);
      } catch (err) {
        console.error("Failed to delete from Firestore:", err);
      }
    }
  };

  // Schedule Queue Handlers
  const handleScheduleSuccess = async (scheduledItem: ScheduledNewsletter) => {
    const updated = [scheduledItem, ...scheduledQueue.filter((q) => q.id !== scheduledItem.id)];
    setScheduledQueue(updated);
    try {
      localStorage.setItem("techwatch_scheduled_queue", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save scheduled queue to localStorage:", e);
    }

    if (currentUser) {
      try {
        await saveScheduledNewsletterToFirestore(currentUser.uid, scheduledItem);
      } catch (err) {
        console.error("Failed to save scheduled draft to Firestore:", err);
      }
    }
  };

  const handleDeleteScheduled = async (id: string) => {
    const updated = scheduledQueue.filter((q) => q.id !== id);
    setScheduledQueue(updated);
    localStorage.setItem("techwatch_scheduled_queue", JSON.stringify(updated));

    if (currentUser) {
      try {
        await deleteScheduledNewsletterFromFirestore(currentUser.uid, id);
      } catch (err) {
        console.error("Failed to delete scheduled draft from Firestore:", err);
      }
    }
  };

  const handleTriggerSendNow = async (item: ScheduledNewsletter) => {
    const updatedItem: ScheduledNewsletter = {
      ...item,
      status: "SENT",
    };
    await handleScheduleSuccess(updatedItem);
    setCurrentResult(item.newsletter);
    setActiveResultTab("preview");
    setIsHistoryOpen(false);
  };

  // Handle document imported from Google Drive
  const handleSelectDriveContent = (content: string, fileName: string) => {
    setRawData(content);
    // Switch to text mode and clear error
    setUseSearchGrounding(false);
    setErrorMessage(null);
  };

  // Main Generation Handler - Enforces Search Grounding Pre-Process before Synthesis
  const handleGenerate = async (customPayload?: {
    customRawData?: string;
    customSearchQuery?: string;
  }) => {
    setErrorMessage(null);
    setPipelineStatus("grounding"); // Étape 1 : Pré-Recherche & Grounding Web obligatoire

    // Progressive Pipeline Animation
    const stageTimer1 = setTimeout(() => setPipelineStatus("filtering"), 2200); // Étape 2 : Filtrage & Débruitage
    const stageTimer2 = setTimeout(() => setPipelineStatus("selecting"), 4400); // Étape 3 : Sélection des 3 Majeures
    const stageTimer3 = setTimeout(() => setPipelineStatus("writing"), 6600);   // Étape 4 : Rédaction Senior & HTML

    const dataToSend = customPayload?.customRawData !== undefined ? customPayload.customRawData : rawData;
    const queryToSend = customPayload?.customSearchQuery !== undefined ? customPayload.customSearchQuery : searchQuery;

    try {
      const response = await fetch("/api/generate-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawData: dataToSend,
          targetAudience,
          styleTemplate,
          language,
          useSearchGrounding: true, // Forcer systématiquement le pre-grounding
          searchQuery: queryToSend || (dataToSend ? dataToSend.slice(0, 300) : ""),
        }),
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur serveur HTTP ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.data) {
        const resultWithId: NewsletterResult = {
          ...resJson.data,
          id: `news_${Date.now()}`,
          timestamp: Date.now(),
        };

        setCurrentResult(resultWithId);
        setPipelineStatus("completed");
        await saveToHistory(resultWithId);

        // Smooth scroll to results on mobile/desktop
        setTimeout(() => {
          document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    } catch (err: unknown) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      console.error("Generation error:", err);
      const msg = err instanceof Error ? err.message : "Une erreur inattendue est survenue.";
      setErrorMessage(msg);
      setPipelineStatus("idle");
    }
  };

  const handleInjectSocialData = (formattedContent: string, count: number) => {
    const updated = rawData.trim()
      ? `${rawData.trim()}\n\n${formattedContent}`
      : formattedContent;
    setRawData(updated);
    setToastNotice(`${count} post(s) sociaux injectés dans les Données Brutes.`);
    setTimeout(() => setToastNotice(null), 5000);
  };

  const handleDirectSocialGenerate = (formattedContent: string) => {
    setRawData(formattedContent);
    handleGenerate({ customRawData: formattedContent });
  };

  // Auth Gate: While initializing session, show clean loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col items-center justify-center space-y-4 font-mono text-xs text-neutral-600">
        <RefreshCw className="w-6 h-6 text-[#c44d2d] animate-spin" />
        <span>Vérification de la session Firebase...</span>
      </div>
    );
  }

  // Auth Gate: Require Google Authentication before accessing app content
  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        isLoggingIn={isLoggingIn}
        errorMessage={errorMessage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a1a] flex flex-col antialiased">
      {/* Navigation Header with 4 Dedicated Windows */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        queueCount={scheduledQueue.length}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        currentView={currentView}
        onToggleView={(view) => setCurrentView(view)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-8">
        {/* Pipeline Visualizer (Active during generation or completion) */}
        <PipelineVisualizer status={pipelineStatus} />

        {/* Global Toast Notification */}
        {toastNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center space-x-2 font-mono shadow-xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-bold">{toastNotice}</span>
          </div>
        )}

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-4 bg-white border border-[#c44d2d] text-[#1a1a1a] text-xs flex items-start space-x-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-[#c44d2d] shrink-0 mt-0.5" />
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-[#c44d2d] font-bold">
                Notice du système
              </div>
              <div className="mt-1 font-serif text-neutral-800 text-sm">{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Window 1: Données Brutes & Dépêches */}
        {currentView === "raw_data" && (
          <div id="raw-data-window" className="space-y-6">
            <RawDataWindow
              rawData={rawData}
              setRawData={setRawData}
              targetAudience={targetAudience}
              setTargetAudience={setTargetAudience}
              styleTemplate={styleTemplate}
              setStyleTemplate={setStyleTemplate}
              language={language}
              setLanguage={setLanguage}
              onGenerate={() => handleGenerate()}
              isLoading={pipelineStatus !== "idle" && pipelineStatus !== "completed"}
              onOpenDrivePicker={() => setIsDrivePickerOpen(true)}
              isDriveConnected={!!(currentUser && accessToken)}
            />
          </div>
        )}

        {/* Window 2: Réseaux Sociaux & Signaux Faibles */}
        {currentView === "social" && (
          <div id="social-window" className="space-y-6">
            <div className="border border-[#1a1a1a] bg-white p-6 sm:p-8 shadow-xs mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d] font-bold block mb-1">
                    Intelligence Réseaux Sociaux • Détection des Signaux Faibles
                  </span>
                  <h1 className="font-display italic font-medium text-3xl sm:text-4xl text-[#1a1a1a] leading-tight">
                    Veille X (Twitter), Instagram &amp; Facebook
                  </h1>
                  <p className="font-serif text-base text-neutral-700 mt-2 leading-relaxed max-w-3xl">
                    Recherchez des publications réelles vérifiées par Google Search Grounding. Les algorithmes d'analyse évaluent le score de signal technique (0-100), filtrent l'autopromotion et permettent une génération directe en 1 clic.
                  </p>
                </div>
              </div>
            </div>

            <SocialMediaHub
              onInjectData={handleInjectSocialData}
              targetAudience={targetAudience}
              onDirectGenerate={handleDirectSocialGenerate}
              onNavigateToRawData={() => setCurrentView("raw_data")}
              isGenerating={pipelineStatus !== "idle" && pipelineStatus !== "completed"}
            />
          </div>
        )}

        {/* Window 3: Recherche Ciblée & Grounding */}
        {currentView === "search" && (
          <div id="search-window" className="space-y-6">
            <TargetedSearchWindow
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              targetAudience={targetAudience}
              setTargetAudience={setTargetAudience}
              styleTemplate={styleTemplate}
              setStyleTemplate={setStyleTemplate}
              language={language}
              setLanguage={setLanguage}
              onGenerate={() => handleGenerate({ customSearchQuery: searchQuery })}
              isLoading={pipelineStatus !== "idle" && pipelineStatus !== "completed"}
            />
          </div>
        )}

        {/* Window 4: Statistiques & Télémétrie */}
        {currentView === "analytics" && (
          <div id="analytics-window">
            <AnalyticsDashboard
              newsletters={history}
              currentNewsletter={currentResult}
              onSelectNewsletter={(item) => {
                setCurrentResult(item);
                setCurrentView("raw_data");
                setTimeout(() => {
                  document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            />
          </div>
        )}

            {/* Generated Results Hub */}
            {currentResult && (
              <section id="results-section" className="pt-8 space-y-6 border-t border-[rgba(26,26,26,0.15)]">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#1a1a1a]">
                  <div>
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#c44d2d] block">
                      Edition Générée &bull; Prête à l'Envoi
                    </span>
                    <h2 className="font-display italic text-3xl sm:text-4xl text-[#1a1a1a] tracking-tight">
                      {currentResult.title || "Newsletter Technique R&D"}
                    </h2>
                  </div>

                  {/* Result View Tabs */}
                  <div className="flex items-center space-x-1 border border-[#1a1a1a] bg-[#f8f7f4] p-1">
                    <button
                      onClick={() => setActiveResultTab("preview")}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider transition-all cursor-pointer ${
                        activeResultTab === "preview"
                          ? "bg-[#1a1a1a] text-white shadow-xs"
                          : "text-neutral-600 hover:text-[#1a1a1a]"
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Aperçu Mail</span>
                    </button>

                    <button
                      onClick={() => setActiveResultTab("report")}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider transition-all cursor-pointer ${
                        activeResultTab === "report"
                          ? "bg-[#1a1a1a] text-white shadow-xs"
                          : "text-neutral-600 hover:text-[#1a1a1a]"
                      }`}
                    >
                      <FileSearch className="w-3.5 h-3.5" />
                      <span>Rapport Filtrage</span>
                    </button>

                    <button
                      onClick={() => setActiveResultTab("code")}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider transition-all cursor-pointer ${
                        activeResultTab === "code"
                          ? "bg-[#1a1a1a] text-white shadow-xs"
                          : "text-neutral-600 hover:text-[#1a1a1a]"
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Code HTML</span>
                    </button>

                    <button
                      onClick={() => setActiveResultTab("analytics")}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider transition-all cursor-pointer ${
                        activeResultTab === "analytics"
                          ? "bg-[#1a1a1a] text-white shadow-xs"
                          : "text-neutral-600 hover:text-[#1a1a1a]"
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-[#c44d2d]" />
                      <span>Télémétrie KPI</span>
                    </button>
                  </div>
                </div>

                {/* Tab Panes */}
                {activeResultTab === "preview" && (
                  <EmailPreview
                    result={currentResult}
                    onSaveToDrive={() => setIsSaveToDriveOpen(true)}
                    onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
                  />
                )}
                {activeResultTab === "report" && (
                  <FilteringReportView
                    report={currentResult.filteringReport}
                    innovations={currentResult.innovations}
                    takeaway={currentResult.takeaway}
                  />
                )}
                {activeResultTab === "code" && (
                  <CodeView
                    result={currentResult}
                    onSaveToDrive={() => setIsSaveToDriveOpen(true)}
                  />
                )}
                {activeResultTab === "analytics" && (
                  <AnalyticsDashboard
                    newsletters={[currentResult, ...history.filter((h) => h.id !== currentResult.id)]}
                    currentNewsletter={currentResult}
                  />
                )}
              </section>
            )}
      </main>

      {/* Editorial Footer */}
      <footer className="mt-auto px-4 sm:px-8 lg:px-16 py-4 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between font-mono text-[0.65rem] text-neutral-600 gap-2 uppercase tracking-wider">
        <div>TECHWATCH GHOSTWRITER • VEILLE R&amp;D HAUTE FIDÉLITÉ</div>
        <div>{rawData.length} CHARS • INTEGRATION GOOGLE DRIVE, CALENDAR &amp; FIRESTORE ACTIVE</div>
      </footer>

      {/* Google Drive Picker Modal */}
      <DrivePickerModal
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        onSelectContent={handleSelectDriveContent}
        accessToken={accessToken}
        currentUser={currentUser}
        onLogin={handleLogin}
      />

      {/* Save to Drive Confirmation Modal */}
      {currentResult && (
        <SaveToDriveModal
          isOpen={isSaveToDriveOpen}
          onClose={() => setIsSaveToDriveOpen(false)}
          newsletter={currentResult}
          accessToken={accessToken}
          currentUser={currentUser}
          onLogin={handleLogin}
        />
      )}

      {/* Draft Scheduler Modal (Google Calendar + Queue) */}
      {currentResult && (
        <ScheduleDraftModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          newsletter={currentResult}
          onScheduleSuccess={handleScheduleSuccess}
          isGoogleConnected={!!(currentUser && accessToken)}
          onConnectGoogle={handleLogin}
        />
      )}

      {/* History & Queue Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        scheduledQueue={scheduledQueue}
        isCloudSynced={!!currentUser}
        onSelect={(selected) => {
          setCurrentResult(selected);
          setPipelineStatus("completed");
          setTimeout(() => {
            document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }}
        onClear={handleClearHistory}
        onDeleteOne={handleDeleteOneHistory}
        onDeleteScheduled={handleDeleteScheduled}
        onTriggerSendNow={handleTriggerSendNow}
      />
    </div>
  );
}
