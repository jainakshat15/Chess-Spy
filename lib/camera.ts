export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Immediately stop the stream - we just needed to check permission
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Error accessing camera:', error);
    return false;
  }
};

export const captureImage = async (stream: MediaStream): Promise<string | null> => {
  try {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.currentTime = 0;
        resolve(null);
      };
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    video.srcObject = null;
    return imageData;
  } catch (error) {
    console.error('Error capturing image:', error);
    return null;
  }
};

export const sendImage = async (imageData: string, url: string): Promise<void> => {
  try {
    if (!url) {
      console.log('No monitoring URL configured, skipping image send');
      return;
    }

    // Convert base64 data URL to blob
    const base64Data = imageData.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    const formData = new FormData();
    formData.append('image', blob, 'capture.jpg');
    
    await fetch(url, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    console.error('Error sending image:', error);
  }
};

export const captureAndSendImage = async (url: string): Promise<void> => {
  let stream: MediaStream | null = null;
  try {
    // Open camera
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    
    // Capture image
    const imageData = await captureImage(stream);
    
    if (imageData) {
      // Send image
      await sendImage(imageData, url);
    }
  } catch (error) {
    console.error('Error in captureAndSendImage:', error);
  } finally {
    // Always close the stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }
};

