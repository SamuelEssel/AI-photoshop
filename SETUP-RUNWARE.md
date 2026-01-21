# Quick Setup Guide for Runware Integration

## Installation Issue Fix

If you encounter canvas dependency errors during `npm install`, follow these steps:

### Option 1: Install Without Canvas (Recommended for Runware)

1. **Remove canvas dependency temporarily:**
```bash
npm uninstall canvas
```

2. **Install Runware SDK:**
```bash
npm install @runware/sdk-js
```

3. **If you need canvas later, you can optionally reinstall it:**
```bash
npm install canvas --ignore-scripts
```

### Option 2: Install Build Tools (If you need canvas)

For Windows:
1. Install Visual Studio Build Tools 2022
2. During installation, select "Desktop development with C++"
3. Then run: `npm install`

### Option 3: Use Yarn Instead

```bash
yarn add @runware/sdk-js
```

## Quick Start

1. **Create .env file:**
```bash
# Copy from example
cp .env.example .env

# Or create manually with:
RUNWARE_API_KEY=GjlXf7wXg8mTDd9tpwTSShjA9KbeXBf9
USE_RUNWARE=true
PORT=3000
NODE_ENV=development
```

2. **Start the server:**
```bash
npm start
```

3. **Open the editor:**
Navigate to: `http://localhost:3000/pages/editor.html`

## Testing the Integration

### Test 1: Basic Image Generation

Open the browser console and run:

```javascript
// Generate a test image
const result = await runwareClient.generateImage({
  prompt: "A beautiful sunset over mountains",
  width: 1024,
  height: 1024
});

console.log('Generated:', result);
```

### Test 2: Using the UI

1. Click the "AI Generate" button in the editor
2. Enter a prompt like: "A magical forest with glowing mushrooms"
3. Click "Generate"
4. The image should appear on your canvas

### Test 3: Backend API

Test with curl or Postman:

```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A serene lake at dawn",
    "width": 1024,
    "height": 1024,
    "steps": 30
  }'
```

## Verification Checklist

- [ ] `.env` file created with API key
- [ ] `@runware/sdk-js` installed (check `node_modules/@runware`)
- [ ] Server starts without errors
- [ ] Editor page loads without console errors
- [ ] `runwareClient` is available in browser console
- [ ] Test generation works

## Troubleshooting

### "Cannot find module '@runware/sdk-js'"

Solution:
```bash
npm install @runware/sdk-js --save --legacy-peer-deps
```

### "runwareClient is not defined"

1. Check that `runware-client.js` is loaded in the HTML
2. Open browser console and verify the script loaded
3. Check Network tab for 404 errors

### "Failed to connect to Runware service"

1. Verify API key in `.env`
2. Check internet connection
3. Restart the server after changing `.env`

### Canvas Errors Don't Affect Runware

The canvas dependency error you might see is unrelated to Runware. The Runware integration works purely through HTTP/WebSocket APIs and doesn't require the canvas package.

## Alternative: Manual Installation

If npm continues to fail, you can manually install the Runware SDK:

1. Download the SDK from: https://www.npmjs.com/package/@runware/sdk-js

2. Extract to: `node_modules/@runware/sdk-js/`

3. Or use the CDN version by adding to HTML:
```html
<script src="https://cdn.jsdelivr.net/npm/@runware/sdk-js@latest/dist/index.umd.js"></script>
```

## Next Steps

Once setup is complete:

1. Read `RUNWARE-INTEGRATION.md` for full API documentation
2. Customize the prompt modal UI (add negative prompt field)
3. Implement additional features (upscale, background removal)
4. Set up usage tracking and cost monitoring

## Support

- Check `RUNWARE-INTEGRATION.md` for detailed documentation
- Visit https://docs.runware.ai for Runware API docs
- Create an issue if you encounter problems

## Environment Variables Reference

```env
# Required
RUNWARE_API_KEY=your_api_key_here

# Optional
USE_RUNWARE=true                    # Enable/disable Runware (default: true)
PORT=3000                           # Server port (default: 3000)
NODE_ENV=development                # Environment mode
AI_SERVICE_URL=http://localhost:5000 # Fallback Python AI service
```

---

**Integration Status:** ✅ Complete and ready to use!
