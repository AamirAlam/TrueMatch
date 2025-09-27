'use client';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit, Tokens, tokenToDecimals } from '@worldcoin/minikit-js';
import { useState } from 'react';

/**
 * Test component to send 0.001 WLD to a specific address
 * This demonstrates how to make a simple WLD payment using MiniKit
 */
export const TestWLDPayment = () => {
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined);
  const [recipientAddress, setRecipientAddress] = useState<string>('');

  const onClickSendWLD = async () => {
    if (!recipientAddress.trim()) {
      alert('Please enter a recipient address');
      return;
    }

    // Validate address format (basic check)
    if (!recipientAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    setButtonState('pending');

    try {
      // Generate a unique reference ID for this payment
      const res = await fetch('/api/initiate-payment', {
        method: 'POST',
      });
      const { id } = await res.json();

      console.log('Payment reference ID:', id);

      // Send 0.001 WLD to the specified address
      const result = await MiniKit.commandsAsync.pay({
        reference: id,
        to: recipientAddress,
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(0.001, Tokens.WLD).toString(),
          },
        ],
        description: 'Test payment: 0.001 WLD',
      });

      console.log('Payment result:', result.finalPayload);
      
      if (result.finalPayload.status === 'success') {
        setButtonState('success');
        console.log('Payment successful! Transaction ID:', result.finalPayload.transaction_id);
        // Clear the address field on success
        setRecipientAddress('');
      } else {
        setButtonState('failed');
        console.error('Payment failed:', result.finalPayload);
        setTimeout(() => {
          setButtonState(undefined);
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending WLD payment:', error);
      setButtonState('failed');
      setTimeout(() => {
        setButtonState(undefined);
      }, 3000);
    }
  };

  return (
    <div className="grid w-full gap-4 p-4 bg-white rounded-lg shadow-md">
      <div>
        <h2 className="text-lg font-semibold mb-2">Test WLD Payment</h2>
        <p className="text-sm text-gray-600 mb-4">
          Send 0.001 WLD to any address for testing purposes
        </p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
          Recipient Address
        </label>
        <input
          id="recipient"
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="0x..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={buttonState === 'pending'}
        />
      </div>

      <div className="bg-gray-50 p-3 rounded-md">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-medium">0.001 WLD</span>
          </div>
          <div className="flex justify-between">
            <span>Token:</span>
            <span className="font-medium">WorldCoin (WLD)</span>
          </div>
        </div>
      </div>

      <LiveFeedback
        label={{
          failed: 'Payment failed',
          pending: 'Sending payment...',
          success: 'Payment sent successfully!',
        }}
        state={buttonState}
        className="w-full"
      >
        <Button
          onClick={onClickSendWLD}
          disabled={buttonState === 'pending' || !recipientAddress.trim()}
          size="lg"
          variant="primary"
          className="w-full"
        >
          Send 0.001 WLD
        </Button>
      </LiveFeedback>

      {buttonState === 'success' && (
        <div className="text-sm text-green-600 bg-green-50 p-2 rounded-md">
          ✅ Payment completed! Check the console for transaction details.
        </div>
      )}
    </div>
  );
};
