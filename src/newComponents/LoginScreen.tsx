import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { useSession } from 'next-auth/react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);
  const [whichVerification, setWhichVerification] = useState<VerificationLevel>(
    VerificationLevel.Orb,
  );
  
  const { isInstalled } = useMiniKit();
  const { data: session } = useSession();

  const onClickVerify = async (verificationLevel: VerificationLevel) => {
    setButtonState('pending');
    setWhichVerification(verificationLevel);
    
    try {
      const result = await MiniKit.commandsAsync.verify({
        action: 'login-action', // Make sure to create this in the developer portal -> incognito actions
        verification_level: verificationLevel,
      });
      
      console.log(result.finalPayload);
      
      // Verify the proof
      const response = await fetch('/api/verify-proof', {
        method: 'POST',
        body: JSON.stringify({
          payload: result.finalPayload,
          action: 'login-action',
        }),
      });

      const data = await response.json();
      if (data.verifyRes.success) {
        setButtonState('success');
        // Call onLoginSuccess after successful verification
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } else {
        setButtonState('failed');
        // Reset the button state after 3 seconds
        setTimeout(() => {
          setButtonState(undefined);
        }, 2000);
      }
    } catch (error) {
      console.error('Verification error', error);
      setButtonState('failed');
      setTimeout(() => {
        setButtonState(undefined);
      }, 2000);
    }
  };

  // Check if user is already authenticated
  React.useEffect(() => {
    if (session?.user) {
      onLoginSuccess();
    }
  }, [session, onLoginSuccess]);

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
              failed: 'Failed to verify',
              pending: 'Verifying',
              success: 'Verified',
            }}
            state={
              whichVerification === VerificationLevel.Orb ? buttonState : undefined
            }
            className="w-full"
          >
            <Button
              onClick={() => onClickVerify(VerificationLevel.Orb)}
              disabled={buttonState === 'pending' || !isInstalled}
              size="lg"
              variant="primary"
              className="w-full py-4 text-lg"
            >
              Verify with Orb
            </Button>
          </LiveFeedback>
          
          {!isInstalled && (
            <div className="text-center p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
              <p className="text-sm text-yellow-800">
                World App is not installed. Please install World App to continue.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;