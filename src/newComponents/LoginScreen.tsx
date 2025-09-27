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
        console.log('🔍 LoginScreen: Checking if MiniKit is already installed...');
        const isAlreadyInstalled = MiniKit.isInstalled();
        console.log('📱 LoginScreen: MiniKit.isInstalled() =', isAlreadyInstalled);
        
        if (!isAlreadyInstalled) {
          console.log('⚙️ LoginScreen: Installing MiniKit...');
          await MiniKit.install();
          console.log('✅ LoginScreen: MiniKit.install() completed');
        } else {
          console.log('✅ LoginScreen: MiniKit already installed');
        }
        
        // Check installation status after install
        const postInstallStatus = MiniKit.isInstalled();
        console.log('📊 LoginScreen: Post-install MiniKit.isInstalled() =', postInstallStatus);
        
        // Wait a bit for installation to complete
        setTimeout(() => {
          const finalStatus = MiniKit.isInstalled();
          console.log('🏁 LoginScreen: Final MiniKit.isInstalled() =', finalStatus);
          console.log('🎯 LoginScreen: Setting miniKitReady to true');
          setMiniKitReady(true);
        }, 500);
      } catch (error) {
        console.error('❌ LoginScreen: Failed to initialize MiniKit:', error);
        console.error('📋 LoginScreen: Error details:', {
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

  // Combined installation check with logging
  const isMiniKitInstalled = isInstalled && miniKitReady;
  
  // Log status changes
  useEffect(() => {
    console.log('📊 LoginScreen: Status update:', {
      isInstalled,
      miniKitReady,
      isMiniKitInstalled,
      timestamp: new Date().toISOString()
    });
  }, [isInstalled, miniKitReady, isMiniKitInstalled]);

  const onClickVerify = async (verificationLevel: VerificationLevel) => {
    console.log('🚀 LoginScreen: Starting verification process...');
    console.log('📊 LoginScreen: Pre-verification status:', {
      isInstalled,
      miniKitReady,
      isMiniKitInstalled,
      verificationLevel,
      timestamp: new Date().toISOString()
    });
    
    setButtonState("pending");
    setWhichVerification(verificationLevel);

    try {
      console.log('🔐 LoginScreen: Calling MiniKit.commandsAsync.verify...');
      const result = await MiniKit.commandsAsync.verify({
        action: "login", // Make sure to create this in the developer portal -> incognito actions
        verification_level: verificationLevel,
      });

      console.log("✅ LoginScreen: World ID verification result:", result.finalPayload);
      console.log("📋 LoginScreen: Verification result details:", {
        hasResult: !!result,
        hasFinalPayload: !!result?.finalPayload,
        payloadKeys: result?.finalPayload ? Object.keys(result.finalPayload) : [],
        timestamp: new Date().toISOString()
      });

      // Verify the proof
      console.log('🌐 LoginScreen: Sending verification to API...');
      const apiPayload = {
        payload: result.finalPayload,
        action: "login",
        signal: "", // Add the signal parameter (empty string for basic verification)
      };
      console.log('📤 LoginScreen: API payload:', apiPayload);
      
      const response = await fetch("/api/verify-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      console.log('📥 LoginScreen: API response status:', response.status, response.statusText);
      const data = await response.json();
      console.log("📋 LoginScreen: API verification response:", data);
      console.log("🔍 LoginScreen: API response analysis:", {
        responseOk: response.ok,
        hasVerifyRes: !!data.verifyRes,
        verifyResSuccess: data.verifyRes?.success,
        dataKeys: Object.keys(data),
        timestamp: new Date().toISOString()
      });

      // Check if the response was successful and the verification passed
      console.log('🔍 LoginScreen: Checking verification success...');
      const isVerificationSuccessful = response.ok && data.verifyRes && data.verifyRes.success;
      console.log('📊 LoginScreen: Verification check result:', isVerificationSuccessful);
      
      if (isVerificationSuccessful) {
        // Extract nullifier_hash from the verification result
        const nullifier_hash = (result.finalPayload as Record<string, unknown>)
          ?.nullifier_hash as string;
        
        console.log('🔑 LoginScreen: Extracted nullifier_hash:', nullifier_hash);
        console.log('📋 LoginScreen: Final payload analysis:', {
          hasNullifierHash: !!nullifier_hash,
          hasAddress: !!((result.finalPayload as Record<string, unknown>)?.address),
          hasUsername: !!((result.finalPayload as Record<string, unknown>)?.username),
          hasProfilePictureUrl: !!((result.finalPayload as Record<string, unknown>)?.profilePictureUrl),
          allKeys: Object.keys(result.finalPayload as Record<string, unknown>),
          timestamp: new Date().toISOString()
        });

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

          console.log("📊 LoginScreen: Session data created:", sessionData);

          // Save session using our custom session management
          console.log('💾 LoginScreen: Calling handleWorldCoinLogin...');
          const loginPayload = {
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
          };
          console.log('📤 LoginScreen: Login payload:', loginPayload);
          
          const loginSuccess = await handleWorldCoinLogin(loginPayload);
          console.log('📊 LoginScreen: handleWorldCoinLogin result:', loginSuccess);

          if (loginSuccess) {
            setButtonState("success");
            console.log("✅ LoginScreen: Verification and session creation successful!");
            // Call onLoginSuccess after successful verification
            setTimeout(() => {
              console.log('🎯 LoginScreen: Calling onLoginSuccess...');
              onLoginSuccess();
            }, 1000);
          } else {
            console.error('❌ LoginScreen: Failed to create session');
            throw new Error("Failed to create session");
          }
        } else {
          console.error('❌ LoginScreen: No nullifier_hash found in verification result');
          console.error('📋 LoginScreen: Available payload data:', result.finalPayload);
          throw new Error("No nullifier_hash found in verification result");
        }
      } else {
        console.error("❌ LoginScreen: Verification failed:", data);
        console.error('📊 LoginScreen: Failure analysis:', {
          responseOk: response.ok,
          responseStatus: response.status,
          hasVerifyRes: !!data.verifyRes,
          verifyResSuccess: data.verifyRes?.success,
          verifyResError: data.verifyRes?.error,
          timestamp: new Date().toISOString()
        });
        setButtonState("failed");
        // Reset the button state after 3 seconds
        setTimeout(() => {
          setButtonState(undefined);
        }, 2000);
      }
    } catch (error) {
      console.error("❌ LoginScreen: Verification error:", error);
      console.error('📋 LoginScreen: Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      setButtonState("failed");
      setTimeout(() => {
        setButtonState(undefined);
      }, 2000);
    }
  };

  // Check if user is already authenticated
  React.useEffect(() => {
    console.log('🔍 LoginScreen: Checking existing authentication...', {
      isAuthenticated,
      hasSession: !!session?.user,
      sessionUser: session?.user,
      timestamp: new Date().toISOString()
    });
    
    if (isAuthenticated || session?.user) {
      console.log('✅ LoginScreen: User already authenticated, calling onLoginSuccess');
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

          {miniKitReady && !isInstalled && (
            <div className="text-center p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
              <p className="text-sm text-yellow-800">
                World App is not installed. Please install World App to
                continue.
              </p>
            </div>
          )}
          
          {!miniKitReady && (
            <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <p className="text-sm text-blue-800">
                Initializing World ID...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
