import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button, LiveFeedback } from "@worldcoin/mini-apps-ui-kit-react";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { useSession } from "next-auth/react";
import { useSessionManagement } from "@/hooks/useSessionManagement";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [buttonState, setButtonState] = useState<
    "pending" | "success" | "failed" | undefined
  >(undefined);
  const [whichVerification, setWhichVerification] = useState<VerificationLevel>(
    VerificationLevel.Orb
  );
  const [miniKitReady, setMiniKitReady] = useState(false);
  const [directMiniKitInstalled, setDirectMiniKitInstalled] = useState(false);

  const { isInstalled } = useMiniKit();
  const { data: session } = useSession();
  const { handleWorldCoinLogin, isAuthenticated } = useSessionManagement();

  // Ensure MiniKit is properly installed and ready
  useEffect(() => {
    const initializeMiniKit = async () => {
      console.log('🔄 LoginScreen: Starting MiniKit initialization...');
      console.log('🌍 Environment check:', {
        userAgent: navigator.userAgent,
        isWorldApp: navigator.userAgent.includes('WorldApp'),
        location: window.location.href,
        timestamp: new Date().toISOString()
      });
      
      try {
        console.log('🔍 Checking MiniKit installation status...');
        const isAlreadyInstalled = MiniKit.isInstalled();
        console.log('📱 MiniKit.isInstalled() =', isAlreadyInstalled);
        
        // Install MiniKit if not already done
        if (!isAlreadyInstalled) {
          console.log('⚙️ Installing MiniKit...');
          await MiniKit.install();
          console.log('✅ MiniKit installation completed');
        } else {
          console.log('✅ MiniKit already installed');
        }
        
        // Check status after potential installation
        const postInstallStatus = MiniKit.isInstalled();
        console.log('📊 Post-install MiniKit.isInstalled() =', postInstallStatus);
        
        // Wait a bit for installation to complete
        setTimeout(() => {
          const finalStatus = MiniKit.isInstalled();
          console.log('🏁 Final MiniKit.isInstalled() =', finalStatus);
          console.log('🎯 Setting miniKitReady to true');
          setMiniKitReady(true);
          setDirectMiniKitInstalled(finalStatus);
        }, 500);
      } catch (error) {
        console.error('❌ Failed to initialize MiniKit:', error);
        console.error('📋 Error details:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        // Still set ready to true to show the error message
        setMiniKitReady(true);
      }
    };

    initializeMiniKit();
  }, []);

  // Combined installation check with fallback logic
  // Use direct MiniKit API if hook fails but MiniKit is actually installed
  const isMiniKitInstalled = (isInstalled || directMiniKitInstalled) && miniKitReady;
  
  // Log status changes
  useEffect(() => {
    console.log('📊 LoginScreen status update:', {
      isInstalled,
      directMiniKitInstalled,
      miniKitReady,
      isMiniKitInstalled,
      buttonState,
      timestamp: new Date().toISOString()
    });
  }, [isInstalled, directMiniKitInstalled, miniKitReady, isMiniKitInstalled, buttonState]);

  const onClickVerify = async (verificationLevel: VerificationLevel) => {
    console.log('🚀 Starting verification process...');
    console.log('📊 Pre-verification status:', {
      isInstalled,
      miniKitReady,
      isMiniKitInstalled,
      verificationLevel,
      timestamp: new Date().toISOString()
    });
    
    setButtonState("pending");
    setWhichVerification(verificationLevel);

    try {
      console.log('🔐 Calling MiniKit.commandsAsync.verify...');
      const result = await MiniKit.commandsAsync.verify({
        action: "login", // Make sure to create this in the developer portal -> incognito actions
        verification_level: verificationLevel,
      });

      console.log("✅ World ID verification result:", result.finalPayload);
      console.log("📋 Verification result details:", {
        hasResult: !!result,
        hasFinalPayload: !!result?.finalPayload,
        payloadKeys: result?.finalPayload ? Object.keys(result.finalPayload) : [],
        timestamp: new Date().toISOString()
      });

      // Verify the proof
      const response = await fetch("/api/verify-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: result.finalPayload,
          action: "login",
          signal: "", // Add the signal parameter (empty string for basic verification)
        }),
      });

      const data = await response.json();
      console.log("API verification response:", data);

      // Check if the response was successful and the verification passed
      if (response.ok && data.verifyRes && data.verifyRes.success) {
        // Extract nullifier_hash from the verification result
        const nullifier_hash = (result.finalPayload as Record<string, unknown>)
          ?.nullifier_hash as string;

        if (nullifier_hash) {
          // Create session data with nullifier_hash
          const sessionData = {
            nullifier_hash,
            walletAddress:
              ((result.finalPayload as Record<string, unknown>)
                ?.address as string) || "",
            username:
              ((result.finalPayload as Record<string, unknown>)
                ?.username as string) || "User",
            profilePictureUrl:
              ((result.finalPayload as Record<string, unknown>)
                ?.profilePictureUrl as string) || "",
          };

          console.log("Session data created:", sessionData);

          // Save session using our custom session management
          const loginSuccess = await handleWorldCoinLogin({
            nullifier_hash,
            walletAddress: (result.finalPayload as Record<string, unknown>)
              ?.address as string,
            user_info: {
              username: (result.finalPayload as Record<string, unknown>)
                ?.username as string,
              profilePictureUrl: (
                result.finalPayload as Record<string, unknown>
              )?.profilePictureUrl as string,
            },
          });

          if (loginSuccess) {
            setButtonState("success");
            console.log("Verification and session creation successful!");
            // Call onLoginSuccess after successful verification
            setTimeout(() => {
              onLoginSuccess();
            }, 1000);
          } else {
            throw new Error("Failed to create session");
          }
        } else {
          throw new Error("No nullifier_hash found in verification result");
        }
      } else {
        console.error("Verification failed:", data);
        setButtonState("failed");
        // Reset the button state after 3 seconds
        setTimeout(() => {
          setButtonState(undefined);
        }, 2000);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setButtonState("failed");
      setTimeout(() => {
        setButtonState(undefined);
      }, 2000);
    }
  };

  // Check if user is already authenticated
  React.useEffect(() => {
    console.log('🔍 Checking existing authentication...', {
      isAuthenticated,
      hasSession: !!session?.user,
      sessionUser: session?.user,
      timestamp: new Date().toISOString()
    });
    
    if (isAuthenticated || session?.user) {
      console.log('✅ User already authenticated, calling onLoginSuccess');
      onLoginSuccess();
    }
  }, [isAuthenticated, session, onLoginSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-300 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Identity
          </h1>
          <p className="text-gray-600">
            Use World ID to verify your identity and join our community
          </p>
        </div>

        {/* World ID Verification Buttons */}
        <div className="space-y-4">
          <LiveFeedback
            label={{
              failed: "Failed to verify",
              pending: "Verifying",
              success: "Verified",
            }}
            state={
              whichVerification === VerificationLevel.Orb
                ? buttonState
                : undefined
            }
            className="w-full"
          >
            <Button
              onClick={() => onClickVerify(VerificationLevel.Orb)}
              disabled={buttonState === "pending" || !isMiniKitInstalled}
              size="lg"
              variant="primary"
              className="w-full py-4 text-lg"
            >
              {!miniKitReady ? "Initializing..." : "Verify with Orb"}
            </Button>
          </LiveFeedback>

          {miniKitReady && !isMiniKitInstalled && (
            <div className="text-center p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
              <p className="text-sm text-yellow-800">
                World App is not installed. Please install World App to
                continue.
              </p>
              {/* <p className="text-xs text-yellow-600 mt-2">
                Debug: miniKitReady={String(miniKitReady)}, isInstalled={String(isInstalled)}, directInstalled={String(directMiniKitInstalled)}
              </p> */}
            </div>
          )}
          
          {!miniKitReady && (
            <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <p className="text-sm text-blue-800">
                Initializing World ID...
              </p>
              {/* <p className="text-xs text-blue-600 mt-2">
                Debug: miniKitReady={String(miniKitReady)}, isInstalled={String(isInstalled)}, directInstalled={String(directMiniKitInstalled)}
              </p> */}
            </div>
          )}
          
          {/* Debug info always visible */}
          {/* <div className="text-center p-2 bg-gray-50 rounded-xl border border-gray-200 mt-2">
            <p className="text-xs text-gray-600">
              Hook: isInstalled={String(isInstalled)} | Direct: directInstalled={String(directMiniKitInstalled)}
            </p>
            <p className="text-xs text-gray-600">
              Final: miniKitReady={String(miniKitReady)} | isMiniKitInstalled={String(isMiniKitInstalled)}
            </p>
            <p className="text-xs text-gray-600">
              UserAgent: {navigator.userAgent.includes('WorldApp') ? 'WorldApp detected' : 'Not WorldApp'}
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
