const fetch = globalThis.fetch; // Node 18+ native fetch
const FormData = globalThis.FormData;

const defaultSearchPrompt = "hair";
const defaultPrompt = "The same portrait photo of the exact same person with a Korean two block haircut, natural black hair, soft layered fringe, clean sides, realistic Asian male barber hairstyle preview. Keep the same face, eyes, nose, mouth, skin tone, expression, clothing, camera angle, and background. Do not change identity.";

exports.generatePreview = async (imageBuffer, customPrompt, customSearchPrompt) => {
  if (!process.env.STABILITY_API_KEY) {
    throw new Error("STABILITY_API_KEY is not configured.");
  }

  const promptToUse = customPrompt || defaultPrompt;
  const searchPromptToUse = customSearchPrompt || defaultSearchPrompt;

  // Use Blob for native FormData since we are passing buffer
  const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
  
  const formData = new FormData();
  formData.append('image', blob, 'upload.jpg');
  formData.append('search_prompt', searchPromptToUse);
  formData.append('prompt', promptToUse);
  formData.append('output_format', 'png');

  const response = await fetch('https://api.stability.ai/v2beta/stable-image/edit/search-and-replace', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
      'Accept': 'image/*'
    },
    body: formData
  });

  if (!response.ok) {
    let errorMsg = `Stability API Error (${response.status})`;
    try {
      const errorJson = await response.json();
      errorMsg += `: ${JSON.stringify(errorJson)}`;
    } catch {
      const errorText = await response.text();
      errorMsg += `: ${errorText}`;
    }
    throw new Error(errorMsg);
  }

  // Get binary data
  const arrayBuffer = await response.arrayBuffer();
  const resultBuffer = Buffer.from(arrayBuffer);
  
  // Convert to Base64
  const base64Image = `data:image/png;base64,${resultBuffer.toString('base64')}`;
  return base64Image;
};
