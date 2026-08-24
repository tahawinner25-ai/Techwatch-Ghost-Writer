import React from "react";
import {
  Sparkles,
  ShieldCheck,
  HardDrive,
  Share2,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
} from "lucide-react";

interface LoginScreenProps {
  onLogin: () => Promise<void>;
  isLoggingIn: boolean;
  errorMessage: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  isLoggingIn,
  errorMessage,
}) => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A1A1A] flex flex-col justify-between antialiased selection:bg-[#c44d2d] selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-[#1A1A1A] px-6 sm:px-12 py-4 flex items-center justify-between bg-[#F8F7F4]">
        <div className="flex items-center space-x-3">
          <span className="font-display italic font-medium text-2xl sm:text-3xl text-[#1A1A1A]">
            Ghostwriter
          </span>
          <span className="hidden sm:inline-block font-mono text-[0.65rem] uppercase tracking-wider text-[#c44d2d] px-2 py-0.5 border border-[#c44d2d]">
            Firebase Enterprise Edition
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-neutral-600">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Accès Sécurisé Google OAuth 2.0</span>
        </div>
      </header>

      {/* Main Authentication Hero */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Context & Editorial Promise */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white border border-[#1A1A1A] font-mono text-xs text-[#c44d2d] uppercase tracking-widest font-bold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Plateforme de Veille IA &amp; Rédaction Technique</span>
            </div>

            <h1 className="font-display italic font-normal text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] leading-[1.1]">
              Transformez les signaux bruts en newsletters d'élite.
            </h1>

            <p className="font-serif text-lg sm:text-xl text-neutral-700 leading-relaxed">
              Curateur augmenté pour CTOs, ingénieurs et décideurs tech. Connectez-vous avec votre compte Google pour accéder à votre espace de veille persisté sur Firestore.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-white border border-[#E5E2DA] space-y-1">
                <div className="flex items-center space-x-2 font-mono text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  <HardDrive className="w-4 h-4 text-emerald-700" />
                  <span>Persistance Firestore</span>
                </div>
                <p className="text-xs text-neutral-600 font-serif">
                  Synchronisation cloud en temps réel de votre historique de dépêches.
                </p>
              </div>

              <div className="p-3.5 bg-white border border-[#E5E2DA] space-y-1">
                <div className="flex items-center space-x-2 font-mono text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  <Share2 className="w-4 h-4 text-[#c44d2d]" />
                  <span>Veille Réseaux Sociaux</span>
                </div>
                <p className="text-xs text-neutral-600 font-serif">
                  Extraction et scoring des signaux X, Instagram et Facebook sans liens morts.
                </p>
              </div>

              <div className="p-3.5 bg-white border border-[#E5E2DA] space-y-1">
                <div className="flex items-center space-x-2 font-mono text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-blue-700" />
                  <span>Google Search Grounding</span>
                </div>
                <p className="text-xs text-neutral-600 font-serif">
                  Corroboration instantanée des faits techniques via l'index Google.
                </p>
              </div>

              <div className="p-3.5 bg-white border border-[#E5E2DA] space-y-1">
                <div className="flex items-center space-x-2 font-mono text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-purple-700" />
                  <span>Google Workspace Sync</span>
                </div>
                <p className="text-xs text-neutral-600 font-serif">
                  Export Google Docs / Drive et planification Google Calendar.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Google Login Box */}
          <div className="lg:col-span-5">
            <div className="bg-white border-2 border-[#1A1A1A] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1A1A1A] space-y-6">
              
              <div className="border-b border-[#E5E2DA] pb-4">
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-neutral-500 block mb-1">
                  Authentification Requise
                </span>
                <h2 className="font-serif italic text-2xl text-[#1A1A1A]">
                  Connexion Sécurisée
                </h2>
                <p className="text-xs text-neutral-600 mt-1 font-serif">
                  Utilisez votre compte Google professionnel ou personnel pour déverrouiller l'espace d'édition.
                </p>
              </div>

              {/* Error Notice if any */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-900 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold font-mono uppercase block text-[10px]">Erreur d'authentification</span>
                    <span className="font-serif">{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Google Sign In Button */}
              <button
                id="google-login-button"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="w-full py-3.5 px-4 bg-[#1A1A1A] hover:bg-neutral-800 active:bg-black text-white font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center space-x-3 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#c44d2d]" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                      />
                    </svg>
                    <span>Continuer avec Google</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-75" />
                  </>
                )}
              </button>

              {/* Guarantees List */}
              <div className="space-y-2 pt-2 border-t border-[#E5E2DA] text-[11px] font-mono text-neutral-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Base de données Firestore chiffrée</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Aucun mot de passe stocké</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Respect de la confidentialité de vos notes</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E2DA] px-6 py-4 text-center text-xs font-mono text-neutral-500 bg-[#F8F7F4]">
        <span>Ghostwriter v2.4 • Propulsé par Google Cloud, Firebase Firestore &amp; Gemini 2.5 Flash</span>
      </footer>
    </div>
  );
};
