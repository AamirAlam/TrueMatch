# Development Mode

## Skip WorldCoin Login

To test the complete signup flow without WorldCoin authentication, you can enable development mode by setting the environment variable:

```bash
NEXT_PUBLIC_SKIP_WORLDCOIN_LOGIN=true
```

This is already set in `.env.local` for local development.

### What happens in development mode:

1. **Skips WorldCoin Login**: The app will bypass the WorldCoin authentication flow
2. **Uses Mock User**: Automatically uses a mock user with:
   - Email: `tahir@sayy.ai`
   - Username: `Tahir`
   - Wallet Address: `0x1234567890123456789012345678901234567890`
3. **Pre-fills Email**: The email field in the profile form is pre-filled and read-only
4. **Visual Indicators**: Shows development mode banners in the UI

### To disable development mode:

Remove or set the environment variable to `false`:

```bash
NEXT_PUBLIC_SKIP_WORLDCOIN_LOGIN=false
```

Or delete the `.env.local` file entirely.

### Testing the Complete Flow:

1. Start the development server: `npm run dev`
2. Open the app in your browser
3. You should see a "Development Mode" banner
4. Click "Get Started" to go directly to the profile form
5. The email field will be pre-filled with `tahir@sayy.ai`
6. Complete the profile form steps
7. Your profile will be saved to Firebase with the mock user data
